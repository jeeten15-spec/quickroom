import { apiGet, apiRequest } from './api';
import { generateNickname } from './nickname';
import { mountPaypalSupport, renderSupportBlock } from './support';
import QRCode from 'qrcode';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const BLOCKED_PHRASES = ['buy now', 'click here', 'free money', 'crypto giveaway'];
const MESSAGE_INTERVAL_MS = 1_000;
const HEARTBEAT_INTERVAL_MS = 5_000;

function roomShareUrl(roomId) {
  return `https://quickroom.org/?room=${encodeURIComponent(roomId)}`;
}

export class ChatRoom {
  constructor(root, roomId, { onLeave }) {
    this.root = root;
    this.roomId = roomId;
    this.onLeave = onLeave;
    this.room = null;
    this.participants = {};
    this.groupMessages = {};
    this.privateMessages = {};
    this.privateWith = null;
    this.viewerId = null;
    this.lastSentAt = 0;
    this.isRefreshing = false;
    this.reportTarget = null;
    this.imageUrl = null;
    this.shareCode = null;
    this.shareQrDataUrl = null;
    this.shareNotice = '';
    this.supportOpen = false;
    this.renderedMessageKey = '';
    this.participantsOpen = false;
    this.isOffline = !navigator.onLine;
    this.pollTimer = null;
    this.heartbeatTimer = null;
  }

  async mount() {
    this.detachEvents();
    this.root.innerHTML = '<main class="chat-loading">Opening room…</main>';
    try {
      await this.loadGroup();
      this.renderShell();
      this.startPolling();
    } catch (error) {
      if (error.status === 410) {
        this.renderExpired();
        return;
      }
      if (error.status === 404) {
        this.renderMissingRoom();
        return;
      }
      if (error.status === 403) {
        this.renderJoinRequired();
        return;
      }
      this.root.innerHTML = `<main class="chat-loading"><p>${escapeHtml(error.message)}</p></main>`;
    }
  }

  destroy() {
    clearInterval(this.pollTimer);
    clearInterval(this.heartbeatTimer);
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
    this.detachEvents();
  }

  detachEvents() {
    this.root.removeEventListener('click', this.handleClick);
    this.root.removeEventListener('submit', this.handleSubmit);
    this.root.removeEventListener('input', this.handleInput);
    this.root.removeEventListener('change', this.handleChange);
    this.root.removeEventListener('keydown', this.handleKeyDown);
  }

  async loadGroup() {
    const payload = await apiGet(`/api/room/${this.roomId}`);
    this.room = payload.room;
    this.participants = payload.participants;
    this.groupMessages = payload.messages;
    this.viewerId = payload.viewerId;
  }

  startPolling() {
    this.pollTimer = setInterval(() => this.refresh(), MESSAGE_INTERVAL_MS);
    this.heartbeatTimer = setInterval(() => this.heartbeat(), HEARTBEAT_INTERVAL_MS);
  }

  async refresh() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    try {
      await this.loadGroup();
      if (this.privateWith) {
        const payload = await apiGet(
          `/api/room/${this.roomId}?privateWith=${encodeURIComponent(this.privateWith.uid)}`
        );
        this.privateMessages = payload.messages;
      }
      this.updateView();
    } catch (error) {
      if (error.status === 410) {
        this.destroy();
        this.renderExpired();
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  async heartbeat() {
    const nickname = sessionStorage.getItem('quickroom.nickname');
    if (!nickname) return;
    try {
      await apiRequest('/api/joinRoom', { roomId: this.roomId, nickname });
    } catch {
      // The next room refresh presents a durable error if the room is unavailable.
    }
  }

  renderShell() {
    this.root.innerHTML = `
      <main class="chat-page">
        <header class="chat-header">
          <div class="room-title">
            <span class="room-icon" data-room-icon></span>
            <div>
              <h1 data-room-name></h1>
              <p><span data-presence-count></span> online</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="small-button is-hidden" type="button" data-chat-action="close-private"
              data-group-button>Group</button>
            <button class="small-button" type="button" data-chat-action="share">Share</button>
            <button class="small-button" type="button" data-chat-action="support">Support</button>
            <button class="small-button" type="button" data-chat-action="leave">Leave</button>
          </div>
        </header>
        <section class="room-details" aria-label="Room details">
          <span class="health-badge" data-health></span>
          <div class="summary" data-summary></div>
        </section>
        <div class="chat-layout">
          <section class="message-panel" aria-label="Messages">
            <div class="message-list" data-message-list aria-live="polite"></div>
            <form class="message-input" data-chat-form="message">
              <input class="image-file-input" data-image-input type="file"
                accept="image/jpeg,image/png,image/webp,image/gif" />
              <button class="upload-button" type="button" data-chat-action="choose-image" aria-label="Upload image">+</button>
              <div class="message-text-wrap">
                <textarea data-message-text maxlength="500" rows="1"
                  placeholder="Write a message" aria-label="Message"></textarea>
                <span class="character-count" data-character-count>0 / 500</span>
              </div>
              <button class="button button-primary send-button" type="submit">Send</button>
            </form>
            <p class="chat-notice" data-notice></p>
          </section>
          <aside class="participants-panel" data-participants-panel>
            <button class="participants-toggle" type="button" data-chat-action="toggle-participants">
              Participants <span data-participant-total></span>
            </button>
            <div class="participants-list" data-participants-list></div>
          </aside>
        </div>
        <div data-overlay-root></div>
      </main>
    `;
    this.root.addEventListener('click', this.handleClick);
    this.root.addEventListener('submit', this.handleSubmit);
    this.root.addEventListener('input', this.handleInput);
    this.root.addEventListener('change', this.handleChange);
    this.root.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);
    this.updateView(true);
  }

  updateView(initial = false) {
    const messageList = this.root.querySelector('[data-message-list]');
    const messages = this.privateWith ? this.privateMessages : this.groupMessages;

    this.root.querySelector('[data-room-icon]').textContent = this.room.icon;
    this.root.querySelector('[data-room-name]').textContent = this.privateWith
      ? `Private with ${this.privateWith.nick}`
      : this.room.name;
    this.root.querySelector('[data-group-button]').classList.toggle(
      'is-hidden',
      !this.privateWith
    );
    this.root.querySelector('[data-presence-count]').textContent = String(
      Object.keys(this.participants).length
    );
    this.root.querySelector('[data-health]').textContent = capitalize(this.room.health);
    this.root.querySelector('[data-health]').className = `health-badge health-${this.room.health}`;
    this.root.querySelector('[data-summary]').innerHTML = renderSummary(this.room);
    this.root.querySelector('[data-participant-total]').textContent = String(
      Object.keys(this.participants).length
    );
    this.root.querySelector('[data-participants-list]').innerHTML = renderParticipants(
      this.participants,
      this.room.allowPrivateChat,
      this.viewerId
    );
    this.root.querySelector('[data-participants-panel]').classList.toggle(
      'is-open',
      this.participantsOpen
    );
    const composerDisabled = this.isOffline || this.room.health === 'restricted';
    this.root.querySelector('[data-message-text]').disabled = composerDisabled;
    this.root.querySelector('[data-image-input]').disabled = composerDisabled;
    this.root.querySelector('[data-chat-action="choose-image"]').disabled = composerDisabled;
    this.root.querySelector('[data-chat-form="message"] button[type="submit"]').disabled =
      composerDisabled;
    const messageKey = createMessageKey(messages, this.privateWith?.uid);
    if (initial || messageKey !== this.renderedMessageKey) {
      messageList.innerHTML = renderMessages(messages, this.privateWith?.uid);
      messageList.scrollTop = messageList.scrollHeight;
      this.renderedMessageKey = messageKey;
    }
    this.renderOverlay();
  }

  renderJoinRequired() {
    const nickname = sessionStorage.getItem('quickroom.nickname') || generateNickname();
    this.root.innerHTML = `
      <main class="chat-loading">
        <form class="room-join-card" data-chat-form="join">
          <p class="eyebrow">QuickRoom</p>
          <h1>Join this room</h1>
          <label for="room-join-nickname">Nickname</label>
          <input id="room-join-nickname" name="nickname" value="${escapeHtml(nickname)}"
            minlength="3" maxlength="20" required />
          <p class="form-error" data-join-error></p>
          <button class="button button-primary" type="submit">Join Room</button>
        </form>
        ${renderSupportBlock({ compact: true })}
      </main>
    `;
    this.root.addEventListener('submit', this.handleSubmit);
    mountPaypalSupport(this.root);
  }

  renderExpired() {
    this.root.innerHTML = `
      <main class="chat-loading">
        <section class="room-join-card">
          <p class="eyebrow">QuickRoom</p>
          <h1>This room has expired.</h1>
          <p>Temporary rooms and their content are removed when their time is up.</p>
          <button class="button button-primary" type="button" data-chat-action="leave">Return home</button>
        </section>
        ${renderSupportBlock({ compact: true })}
      </main>
    `;
    this.root.addEventListener('click', this.handleClick);
    mountPaypalSupport(this.root);
  }

  renderMissingRoom() {
    this.root.innerHTML = `
      <main class="chat-loading">
        <section class="room-join-card">
          <p class="eyebrow">QuickRoom</p>
          <h1>This room is not available.</h1>
          <p>Please check the link or create a new temporary room.</p>
          <button class="button button-primary" type="button" data-chat-action="leave">Return home</button>
        </section>
        ${renderSupportBlock({ compact: true })}
      </main>
    `;
    this.root.addEventListener('click', this.handleClick);
    mountPaypalSupport(this.root);
  }

  handleClick = async (event) => {
    const button = event.target.closest('[data-chat-action]');
    if (!button) return;
    const action = button.dataset.chatAction;

    if (action === 'share') {
      await this.openShareDialog();
    }
    if (action === 'support') {
      this.reportTarget = null;
      this.imageUrl = null;
      this.shareCode = null;
      this.supportOpen = true;
      this.renderOverlay();
      mountPaypalSupport(this.root);
    }
    if (action === 'leave') await this.leave();
    if (action === 'choose-image') this.root.querySelector('[data-image-input]').click();
    if (action === 'toggle-participants') {
      this.participantsOpen = !this.participantsOpen;
      this.updateView();
    }
    if (action === 'open-private') {
      const uid = button.dataset.uid;
      const participant = this.participants[uid];
      if (!participant) return;
      this.privateWith = { uid, nick: participant.nick };
      this.privateMessages = {};
      this.renderedMessageKey = '';
      await this.refresh();
    }
    if (action === 'close-private') {
      this.privateWith = null;
      this.renderedMessageKey = '';
      this.updateView();
    }
    if (action === 'report-message') {
      this.reportTarget = {
        kind: 'message',
        messageId: button.dataset.messageId,
        recipientId: button.dataset.recipientId
      };
      this.renderOverlay();
    }
    if (action === 'report-participant') {
      this.reportTarget = { kind: 'participant', participantId: button.dataset.uid };
      this.renderOverlay();
    }
    if (action === 'close-overlay') {
      this.reportTarget = null;
      this.imageUrl = null;
      this.shareCode = null;
      this.shareQrDataUrl = null;
      this.shareNotice = '';
      this.supportOpen = false;
      this.renderOverlay();
    }
    if (action === 'copy-share-link') {
      await this.copyShareValue(roomShareUrl(this.roomId), 'Join link copied');
    }
    if (action === 'copy-share-code') {
      await this.copyShareValue(this.roomId, 'Room code copied');
    }
    if (action === 'native-share') {
      await this.nativeShare();
    }
    if (action === 'print-join-card') {
      this.printJoinCard();
    }
    if (action === 'confirm-report') await this.submitReport();
    if (action === 'view-image') {
      this.imageUrl = button.dataset.imageUrl;
      this.renderOverlay();
    }
  };

  async openShareDialog() {
    const shareUrl = roomShareUrl(this.roomId);
    this.supportOpen = false;
    this.shareCode = this.roomId;
    this.shareNotice = '';
    try {
      this.shareQrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 220,
        margin: 1,
        color: { dark: '#111111', light: '#ffffff' }
      });
    } catch {
      this.shareQrDataUrl = null;
    }
    this.renderOverlay();
    apiRequest('/api/trackEvent', { event: 'share', roomId: this.roomId }).catch(() => {});
  }

  async copyShareValue(value, notice) {
    try {
      await navigator.clipboard.writeText(value);
      this.shareNotice = notice;
    } catch {
      this.shareNotice = 'Copy manually from the fields below.';
    }
    this.renderOverlay();
  }

  async nativeShare() {
    const shareUrl = roomShareUrl(this.roomId);
    const roomName = this.room?.name || 'QuickRoom';
    if (!navigator.share) {
      await this.copyShareValue(shareUrl, 'Join link copied');
      return;
    }
    try {
      await navigator.share({
        title: roomName,
        text: `Join “${roomName}” on QuickRoom. Code: ${this.roomId}`,
        url: shareUrl
      });
      this.shareNotice = 'Shared';
      this.renderOverlay();
    } catch {
      // User cancelled or share failed; keep the dialog open.
    }
  }

  printJoinCard() {
    const shareUrl = roomShareUrl(this.roomId);
    const roomName = this.room?.name || 'QuickRoom';
    const qr = this.shareQrDataUrl
      ? `<img src="${this.shareQrDataUrl}" alt="QR code to join" width="220" height="220" />`
      : '';
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720');
    if (!popup) {
      this.shareNotice = 'Allow pop-ups to print the join card.';
      this.renderOverlay();
      return;
    }
    popup.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Join ${escapeHtml(roomName)}</title>
  <style>
    @page { margin: 16mm; }
    body {
      margin: 0;
      color: #111;
      font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
      background: #f7f4ef;
    }
    .card {
      box-sizing: border-box;
      width: 100%;
      min-height: 100vh;
      padding: 36px 28px;
      display: grid;
      gap: 18px;
      justify-items: center;
      text-align: center;
      background:
        radial-gradient(circle at top, #fffdf8 0%, #f3eee6 55%, #ebe4d8 100%);
    }
    .brand {
      margin: 0;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-size: 12px;
      color: #6b6358;
    }
    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.03em;
    }
    .qr {
      padding: 14px;
      background: #fff;
      border: 1px solid #d9d1c4;
    }
    .code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 18px;
      letter-spacing: 0.04em;
      padding: 10px 14px;
      border: 1px dashed #b9ae9d;
      background: #fff;
    }
    .url {
      max-width: 340px;
      overflow-wrap: anywhere;
      font-size: 13px;
      color: #4d463c;
    }
    .hint {
      margin: 0;
      font-size: 13px;
      color: #6b6358;
    }
  </style>
</head>
<body>
  <div class="card">
    <p class="brand">QuickRoom</p>
    <h1>${escapeHtml(roomName)}</h1>
    <p class="hint">Scan to join · no app · no account</p>
    <div class="qr">${qr}</div>
    <div class="code">${escapeHtml(this.roomId)}</div>
    <p class="url">${escapeHtml(shareUrl)}</p>
    <p class="hint">18+ temporary room</p>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`);
    popup.document.close();
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.dataset.chatForm === 'join') {
      const nickname = validateNickname(new FormData(form).get('nickname'));
      try {
        await apiRequest('/api/joinRoom', { roomId: this.roomId, nickname });
        sessionStorage.setItem('quickroom.nickname', nickname);
        await this.mount();
      } catch (error) {
        form.querySelector('[data-join-error]').textContent = error.message;
      }
      return;
    }
    if (form.dataset.chatForm !== 'message') return;

    const text = this.root.querySelector('[data-message-text]').value.trim();
    if (!text) return;
    if (text.length > 500) return this.showNotice('Messages are limited to 500 characters.');
    if (containsBlockedPhrase(text)) {
      return this.showNotice('Please reword that message before sending.');
    }
    if (Date.now() - this.lastSentAt < 1_500) {
      return this.showNotice('Please wait a moment before sending another message.');
    }

    try {
      this.lastSentAt = Date.now();
      await apiRequest('/api/sendMessage', this.messagePayload({ type: 'text', text }));
      this.root.querySelector('[data-message-text]').value = '';
      this.root.querySelector('[data-character-count]').textContent = '0 / 500';
      await this.refresh();
    } catch (error) {
      this.showNotice(error.message);
    }
  };

  handleInput = (event) => {
    if (!event.target.matches('[data-message-text]')) return;
    const length = event.target.value.length;
    this.root.querySelector('[data-character-count]').textContent = `${length} / 500`;
  };

  handleKeyDown = (event) => {
    if (
      event.target.matches('[data-message-text]') &&
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      event.target.closest('form').requestSubmit();
    }
  };

  handleChange = async (event) => {
    const input = event.target;
    if (!input.matches('[data-image-input]') || !input.files?.[0]) return;
    const file = input.files[0];
    input.value = '';

    if (!IMAGE_TYPES.has(file.type) || file.size > 5 * 1024 * 1024) {
      this.showNotice('Choose a JPEG, PNG, WebP, or GIF image up to 5 MB.');
      return;
    }
    if (Date.now() - this.lastSentAt < 1_500) {
      this.showNotice('Please wait a moment before sending another message.');
      return;
    }

    try {
      this.lastSentAt = Date.now();
      this.showNotice('Uploading image…');
      const upload = await apiRequest('/api/uploadImage', {
        roomId: this.roomId,
        contentType: file.type,
        size: file.size
      });
      const uploadResponse = await fetch(upload.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      if (!uploadResponse.ok) throw new Error('Image upload failed. Please try again.');
      await apiRequest(
        '/api/sendMessage',
        this.messagePayload({
          type: 'image',
          image: { path: upload.imagePath, contentType: file.type, size: file.size }
        })
      );
      this.showNotice('');
      await this.refresh();
    } catch (error) {
      this.showNotice(error.message);
    }
  };

  handleNetworkChange = () => {
    this.isOffline = !navigator.onLine;
    if (this.room) {
      this.updateView();
      this.showNotice(
        this.isOffline
          ? 'You are offline. This room is available to read only.'
          : 'You are back online.'
      );
    }
  };

  messagePayload(message) {
    return {
      roomId: this.roomId,
      ...message,
      ...(this.privateWith ? { recipientId: this.privateWith.uid } : {})
    };
  }

  async submitReport() {
    if (!this.reportTarget) return;
    try {
      const payload =
        this.reportTarget.kind === 'participant'
          ? { roomId: this.roomId, participantId: this.reportTarget.participantId }
          : {
              roomId: this.roomId,
              messageId: this.reportTarget.messageId,
              ...(this.reportTarget.recipientId
                ? { recipientId: this.reportTarget.recipientId }
                : {})
            };
      const response = await apiRequest('/api/report', payload);
      this.room.health = response.health || this.room.health;
      this.reportTarget = null;
      this.updateView();
      this.showNotice('Report received.');
    } catch (error) {
      this.showNotice(error.message);
    }
  }

  async leave() {
    try {
      await apiRequest('/api/leaveRoom', { roomId: this.roomId });
    } catch {
      // The client still clears its room state if a network failure occurs.
    }
    sessionStorage.removeItem('quickroom.current-room');
    this.destroy();
    this.onLeave();
  }

  showNotice(message) {
    const notice = this.root.querySelector('[data-notice]');
    if (notice) notice.textContent = message;
  }

  renderOverlay() {
    const overlay = this.root.querySelector('[data-overlay-root]');
    if (!overlay) return;
    if (this.imageUrl) {
      overlay.innerHTML = `
        <div class="chat-overlay">
          <button class="overlay-close" type="button" data-chat-action="close-overlay" aria-label="Close">×</button>
          <img src="${escapeHtml(this.imageUrl)}" alt="Shared image" />
        </div>
      `;
      return;
    }
    if (this.supportOpen) {
      overlay.innerHTML = `
        <div class="chat-overlay">
          <section class="share-dialog support-dialog" role="dialog" aria-modal="true" aria-label="Support QuickRoom">
            ${renderSupportBlock()}
            <button class="button button-secondary" type="button" data-chat-action="close-overlay">Close</button>
          </section>
        </div>
      `;
      return;
    }
    if (this.shareCode) {
      const shareUrl = roomShareUrl(this.shareCode);
      overlay.innerHTML = `
        <div class="chat-overlay">
          <section class="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title">
            <p class="eyebrow">Invite people</p>
            <h2 id="share-title">Share this room</h2>
            ${
              this.shareQrDataUrl
                ? `<img class="share-qr" src="${this.shareQrDataUrl}" width="220" height="220" alt="QR code for this room" />`
                : ''
            }
            <div class="share-field">
              <span>Room code</span>
              <code>${escapeHtml(this.shareCode)}</code>
            </div>
            <div class="share-field">
              <span>Join link</span>
              <code class="share-link">${escapeHtml(shareUrl)}</code>
            </div>
            ${this.shareNotice ? `<p class="share-notice">${escapeHtml(this.shareNotice)}</p>` : ''}
            <p>Send the link, show the QR, or hand out a printable join card at IRL events.</p>
            <div class="share-actions">
              <button class="button button-primary" type="button" data-chat-action="native-share">Share</button>
              <button class="button button-secondary" type="button" data-chat-action="copy-share-link">Copy link</button>
              <button class="button button-secondary" type="button" data-chat-action="copy-share-code">Copy code</button>
              <button class="button button-secondary" type="button" data-chat-action="print-join-card">Print join card</button>
              <button class="button button-secondary" type="button" data-chat-action="close-overlay">Done</button>
            </div>
          </section>
        </div>
      `;
      return;
    }
    if (this.reportTarget) {
      overlay.innerHTML = `
        <div class="chat-overlay">
          <section class="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title">
            <h2 id="report-title">Report ${this.reportTarget.kind}</h2>
            <p>This lets the room health reflect concerns without disrupting the conversation.</p>
            <div class="form-actions">
              <button class="button button-secondary" type="button" data-chat-action="close-overlay">Cancel</button>
              <button class="button button-primary" type="button" data-chat-action="confirm-report">Report</button>
            </div>
          </section>
        </div>
      `;
      return;
    }
    overlay.innerHTML = '';
  }
}

function renderSummary(room) {
  return `
    <span>Participants ${room.stats.participantsCurrent} / ${room.stats.participantsPeak}</span>
    <span>Messages ${room.stats.messageCount}</span>
    <span>Images ${room.stats.imageCount}</span>
    <span>Started ${formatDate(room.createdAt)}</span>
    <span>Expires ${room.expiresAt ? formatDate(room.expiresAt) : 'Never'}</span>
  `;
}

function renderParticipants(participants, allowPrivateChat, viewerId) {
  return Object.entries(participants)
    .sort(([, left], [, right]) => left.nick.localeCompare(right.nick))
    .map(
      ([uid, participant]) => `
        <div class="participant-row">
          <span>${escapeHtml(participant.nick)}</span>
          ${
            allowPrivateChat && uid !== viewerId
              ? `<button type="button" data-chat-action="open-private" data-uid="${escapeHtml(uid)}">Message</button>`
              : ''
          }
          <button type="button" data-chat-action="report-participant" data-uid="${escapeHtml(uid)}">Report</button>
        </div>
      `
    )
    .join('');
}

function renderMessages(messages, privateWithUid) {
  const ordered = Object.entries(messages).sort(([, left], [, right]) => left.timestamp - right.timestamp);
  if (!ordered.length) return '<p class="empty-messages">No messages yet.</p>';

  return ordered
    .map(
      ([id, message]) => `
        <article class="message message-${message.type}">
          ${
            message.type === 'system'
              ? `<p>${formatText(message.text || '')}</p>`
              : `
                <div class="message-meta">
                  <strong>${escapeHtml(message.senderNick)}</strong>
                  <time>${formatTime(message.timestamp)}</time>
                  <button type="button" data-chat-action="report-message" data-message-id="${escapeHtml(id)}"
                    ${privateWithUid ? `data-recipient-id="${escapeHtml(privateWithUid)}"` : ''}>Report</button>
                </div>
                ${
                  message.type === 'image'
                    ? `<button class="image-message" type="button" data-chat-action="view-image"
                        data-image-url="${escapeHtml(message.imageDownloadUrl || '')}">
                        <img src="${escapeHtml(message.imageDownloadUrl || '')}" alt="Shared image" />
                      </button>`
                    : `<p>${formatText(message.text || '')}</p>`
                }
              `
          }
        </article>
      `
    )
    .join('');
}

function createMessageKey(messages, privateWithUid) {
  return JSON.stringify({
    privateWithUid: privateWithUid || null,
    messages: Object.entries(messages).map(([id, message]) => [
      id,
      message.type,
      message.text,
      message.imageUrl,
      message.imageSize,
      message.senderId,
      message.timestamp,
      message.reported,
      message.moderated
    ])
  });
}

function validateNickname(value) {
  const nickname = String(value || '').trim();
  if (nickname.length < 3 || nickname.length > 20 || !/^[A-Za-z0-9 ]+$/.test(nickname)) {
    throw new Error('Nickname must be 3–20 letters, numbers, or spaces.');
  }
  return nickname;
}

function containsBlockedPhrase(text) {
  const normalizedText = text.toLowerCase();
  return BLOCKED_PHRASES.some((phrase) => normalizedText.includes(phrase));
}

function formatText(value) {
  return escapeHtml(value).replace(/\n/g, '<br>');
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(value);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
