import { apiRequest } from './api';
import { ChatRoom } from './chat';
import './style.css';

const app = document.querySelector('#app');
let activeChat = null;

if (!app) throw new Error('QuickRoom app root was not found.');

const templates = [
  ['study', '📚', 'Study', 'Study Room'],
  ['coding', '💻', 'Coding', 'Coding Room'],
  ['gaming', '🎮', 'Gaming', 'Gaming Room'],
  ['business', '💼', 'Business', 'Business Room'],
  ['bookclub', '📖', 'Book Club', 'Book Club'],
  ['family', '👨‍👩‍👧', 'Family', 'Family Room'],
  ['event', '🎉', 'Event', 'Event Room'],
  ['brainstorm', '💡', 'Brainstorm', 'Brainstorm'],
  ['interview', '📋', 'Interview', 'Interview Room'],
  ['blank', '✨', 'Blank', 'Untitled Room']
];

const ageGateKey = 'quickroom.age-confirmed';
const nicknameKey = 'quickroom.nickname';
const state = {
  ageConfirmed: localStorage.getItem(ageGateKey) === 'true',
  view: getInitialView(),
  joinOpen: false,
  error: '',
  busy: false,
  create: createInitialRoomState(),
  joinNickname: sessionStorage.getItem(nicknameKey) || generateNickname()
};

function getInitialView() {
  return /^\/room\/[A-Za-z0-9_-]{16,64}$/.test(window.location.pathname)
    ? 'room-placeholder'
    : 'landing';
}

function createInitialRoomState() {
  return {
    step: 1,
    template: 'study',
    name: 'Study Room',
    expiry: '24h',
    nickname: sessionStorage.getItem(nicknameKey) || generateNickname(),
    type: 'public',
    allowPrivateChat: true
  };
}

function render() {
  activeChat?.destroy();
  activeChat = null;
  app.innerHTML = `
    <main class="page-shell">
      ${state.view === 'landing' ? renderLanding() : ''}
      ${state.view === 'create' ? renderCreateRoom() : ''}
      ${state.view === 'room-placeholder' ? '<div id="chat-root"></div>' : ''}
    </main>
    ${state.ageConfirmed ? '' : renderAgeGate()}
  `;

  if (state.ageConfirmed && state.view === 'room-placeholder') {
    const roomId = window.location.pathname.split('/').pop();
    activeChat = new ChatRoom(document.querySelector('#chat-root'), roomId, {
      onLeave: leaveRoomView
    });
    activeChat.mount();
  }
}

function renderLanding() {
  return `
    <section class="landing" aria-labelledby="quickroom-title">
      <div class="landing-content">
        <h1 id="quickroom-title">QuickRoom</h1>
        <p class="tagline">Create a room. Share a link. Start talking.</p>
        <button class="button button-primary" type="button" data-action="open-create">
          Create Room
        </button>
        <div class="join-area">
          ${
            state.joinOpen
              ? renderJoinForm()
              : `<button class="text-link" type="button" data-action="open-join">Join existing room</button>`
          }
        </div>
      </div>
      <footer>18+ only <span>·</span> Temporary rooms <span>·</span> No accounts</footer>
    </section>
  `;
}

function renderJoinForm() {
  return `
    <form class="join-form" data-form="join">
      <label for="join-room">Room link or code</label>
      <input id="join-room" name="room" type="text" autocomplete="off" required
        placeholder="Paste a link or room code" />
      <label for="join-nickname">Nickname</label>
      <input id="join-nickname" name="nickname" type="text" minlength="3" maxlength="20"
        value="${escapeHtml(state.joinNickname)}" required />
      ${renderError()}
      <div class="form-actions compact-actions">
        <button class="button button-secondary" type="button" data-action="close-join">Cancel</button>
        <button class="button button-primary" type="submit" ${state.busy ? 'disabled' : ''}>
          ${state.busy ? 'Joining…' : 'Join Room'}
        </button>
      </div>
    </form>
  `;
}

function renderCreateRoom() {
  const { step } = state.create;
  return `
    <section class="flow" aria-labelledby="flow-title">
      <header class="flow-header">
        <button class="back-link" type="button" data-action="leave-create" aria-label="Back to home">QuickRoom</button>
        <p>Step ${step} of 5</p>
      </header>
      <div class="flow-content">
        ${step === 1 ? renderTemplateStep() : ''}
        ${step === 2 ? renderNameStep() : ''}
        ${step === 3 ? renderExpiryStep() : ''}
        ${step === 4 ? renderNicknameStep() : ''}
        ${step === 5 ? renderSettingsStep() : ''}
      </div>
    </section>
  `;
}

function renderTemplateStep() {
  return `
    <div class="step-intro">
      <h1 id="flow-title">What is this room for?</h1>
      <p>Choose a starting point.</p>
    </div>
    <div class="template-grid" role="list">
      ${templates
        .map(
          ([id, icon, label]) => `
            <button class="template-card ${state.create.template === id ? 'selected' : ''}"
              type="button" data-action="choose-template" data-template="${id}" role="listitem">
              <span class="template-icon" aria-hidden="true">${icon}</span>
              <span>${label}</span>
            </button>
          `
        )
        .join('')}
    </div>
  `;
}

function renderNameStep() {
  return `
    <div class="step-intro">
      <h1 id="flow-title">Name your room</h1>
      <p>Keep it clear and easy to recognise.</p>
    </div>
    <form class="step-form" data-form="room-name">
      <label for="room-name">Room name</label>
      <input id="room-name" name="name" type="text" minlength="3" maxlength="40"
        value="${escapeHtml(state.create.name)}" autofocus required />
      ${renderError()}
      ${renderStepActions('name')}
    </form>
  `;
}

function renderExpiryStep() {
  const options = [
    ['1h', '1 hour'],
    ['6h', '6 hours'],
    ['24h', '24 hours'],
    ['7d', '7 days'],
    ['never', 'Never']
  ];
  return `
    <div class="step-intro">
      <h1 id="flow-title">When should it expire?</h1>
      <p>Rooms are temporary by default.</p>
    </div>
    <form class="step-form" data-form="expiry">
      <fieldset class="radio-list">
        <legend class="sr-only">Room expiry</legend>
        ${options
          .map(
            ([value, label]) => `
              <label class="option-row">
                <input type="radio" name="expiry" value="${value}"
                  ${state.create.expiry === value ? 'checked' : ''} />
                <span>${label}</span>
              </label>
            `
          )
          .join('')}
      </fieldset>
      ${renderStepActions('expiry')}
    </form>
  `;
}

function renderNicknameStep() {
  return `
    <div class="step-intro">
      <h1 id="flow-title">Choose a nickname</h1>
      <p>This is how people will see you in the room.</p>
    </div>
    <form class="step-form" data-form="nickname">
      <label for="nickname">Nickname</label>
      <div class="inline-input">
        <input id="nickname" name="nickname" type="text" minlength="3" maxlength="20"
          value="${escapeHtml(state.create.nickname)}" autofocus required />
        <button class="icon-button" type="button" data-action="new-nickname" aria-label="Generate a new nickname">↻</button>
      </div>
      <p class="input-note">Letters, numbers, and spaces only.</p>
      ${renderError()}
      ${renderStepActions('nickname')}
    </form>
  `;
}

function renderSettingsStep() {
  return `
    <div class="step-intro">
      <h1 id="flow-title">Room settings</h1>
      <p>You can start with these simple defaults.</p>
    </div>
    <form class="step-form" data-form="settings">
      <fieldset class="setting-group">
        <legend>Room type</legend>
        <div class="segmented-control">
          ${renderSegment('type', 'public', 'Public')}
          ${renderSegment('type', 'private', 'Private')}
          ${renderSegment('type', 'invite', 'Invite Only')}
        </div>
      </fieldset>
      <fieldset class="setting-group">
        <legend>Allow private chats</legend>
        <div class="segmented-control">
          ${renderSegment('private-chat', 'yes', 'Yes')}
          ${renderSegment('private-chat', 'no', 'No')}
        </div>
      </fieldset>
      ${renderError()}
      <div class="form-actions">
        <button class="button button-secondary" type="button" data-action="back-step">Back</button>
        <button class="button button-primary" type="submit" ${state.busy ? 'disabled' : ''}>
          ${state.busy ? 'Creating…' : 'Create Room'}
        </button>
      </div>
    </form>
  `;
}

function renderSegment(group, value, label) {
  const checked =
    group === 'type' ? state.create.type === value : state.create.allowPrivateChat === (value === 'yes');
  return `
    <label>
      <input type="radio" name="${group}" value="${value}" ${checked ? 'checked' : ''} />
      <span>${label}</span>
    </label>
  `;
}

function renderStepActions(form) {
  return `
    <div class="form-actions">
      <button class="button button-secondary" type="button" data-action="back-step">Back</button>
      <button class="button button-primary" type="submit">Continue</button>
    </div>
  `;
}

function renderAgeGate() {
  return `
    <div class="modal-backdrop">
      <section class="age-modal" role="dialog" aria-modal="true" aria-labelledby="age-title">
        <h1 id="age-title">QuickRoom is for adults.</h1>
        <p>Please confirm that you are 18 or older to continue.</p>
        <label class="age-check">
          <input id="age-confirmation" type="checkbox" />
          <span>I am 18 or older</span>
        </label>
        <button class="button button-primary" type="button" data-action="confirm-age" disabled>
          Continue
        </button>
      </section>
    </div>
  `;
}

function renderError() {
  return state.error ? `<p class="form-error" role="alert">${escapeHtml(state.error)}</p>` : '';
}

app.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action } = button.dataset;
  if (!state.ageConfirmed && action !== 'confirm-age') return;

  if (action === 'confirm-age') {
    if (!document.querySelector('#age-confirmation')?.checked) return;
    localStorage.setItem(ageGateKey, 'true');
    state.ageConfirmed = true;
    render();
  }
  if (action === 'open-create') {
    state.view = 'create';
    state.error = '';
    render();
  }
  if (action === 'leave-create') {
    state.view = 'landing';
    state.error = '';
    render();
  }
  if (action === 'open-join') {
    state.joinOpen = true;
    state.error = '';
    render();
  }
  if (action === 'close-join') {
    state.joinOpen = false;
    state.error = '';
    render();
  }
  if (action === 'choose-template') {
    const template = templates.find(([id]) => id === button.dataset.template);
    if (!template) return;
    state.create.template = template[0];
    state.create.name = template[3];
    state.create.step = 2;
    state.error = '';
    render();
  }
  if (action === 'back-step') {
    state.create.step = Math.max(1, state.create.step - 1);
    state.error = '';
    render();
  }
  if (action === 'new-nickname') {
    state.create.nickname = generateNickname();
    state.error = '';
    render();
  }
});

app.addEventListener('change', (event) => {
  if (event.target.id === 'age-confirmation') {
    document.querySelector('[data-action="confirm-age"]').disabled = !event.target.checked;
  }
});

app.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.ageConfirmed || state.busy) return;

  const form = event.target;
  const formData = new FormData(form);
  state.error = '';

  try {
    if (form.dataset.form === 'room-name') {
      state.create.name = validateRoomName(formData.get('name'));
      state.create.step = 3;
      render();
      return;
    }
    if (form.dataset.form === 'expiry') {
      state.create.expiry = formData.get('expiry');
      state.create.step = 4;
      render();
      return;
    }
    if (form.dataset.form === 'nickname') {
      state.create.nickname = validateNickname(formData.get('nickname'));
      state.create.step = 5;
      render();
      return;
    }
    if (form.dataset.form === 'settings') {
      state.create.type = formData.get('type');
      state.create.allowPrivateChat = formData.get('private-chat') === 'yes';
      await submitCreateRoom();
      return;
    }
    if (form.dataset.form === 'join') {
      await submitJoinRoom(formData);
    }
  } catch (error) {
    state.error = error.message || 'Please check your details and try again.';
    render();
  }
});

async function submitCreateRoom() {
  state.busy = true;
  render();
  try {
    const response = await apiRequest('/api/createRoom', {
      name: state.create.name,
      template: state.create.template,
      expiry: state.create.expiry,
      nickname: state.create.nickname,
      type: state.create.type,
      allowPrivateChat: state.create.allowPrivateChat
    });
    rememberNickname(state.create.nickname);
    navigateToRoom(response.roomId);
  } catch (error) {
    state.error = error.message || 'Unable to create the room.';
  } finally {
    state.busy = false;
    render();
  }
}

async function submitJoinRoom(formData) {
  const roomId = roomIdFromInput(formData.get('room'));
  const nickname = validateNickname(formData.get('nickname'));
  state.busy = true;
  render();
  try {
    const response = await apiRequest('/api/joinRoom', { roomId, nickname });
    rememberNickname(nickname);
    navigateToRoom(response.roomId);
  } catch (error) {
    state.error = error.message || 'Unable to join the room.';
  } finally {
    state.busy = false;
    render();
  }
}

function navigateToRoom(roomId) {
  window.history.pushState({}, '', `/room/${roomId}`);
  sessionStorage.setItem('quickroom.current-room', roomId);
  state.view = 'room-placeholder';
}

function leaveRoomView() {
  window.history.pushState({}, '', '/');
  state.view = 'landing';
  state.joinOpen = false;
  state.error = '';
  render();
}

function roomIdFromInput(value) {
  if (typeof value !== 'string') throw new Error('Enter a room link or code.');
  const input = value.trim();
  let roomId = input;

  if (input.includes('://')) {
    try {
      roomId = new URL(input).pathname.split('/').filter(Boolean).pop() || '';
    } catch {
      throw new Error('Enter a valid room link or code.');
    }
  }
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(roomId)) {
    throw new Error('Enter a valid room link or code.');
  }
  return roomId;
}

function validateRoomName(value) {
  const name = String(value || '').trim();
  if (name.length < 3 || name.length > 40 || /[\u0000-\u001F\u007F]/.test(name)) {
    throw new Error('Room name must be 3–40 characters.');
  }
  return name;
}

function validateNickname(value) {
  const nickname = String(value || '').trim();
  if (nickname.length < 3 || nickname.length > 20 || !/^[A-Za-z0-9 ]+$/.test(nickname)) {
    throw new Error('Nickname must be 3–20 letters, numbers, or spaces.');
  }
  return nickname;
}

function rememberNickname(nickname) {
  sessionStorage.setItem(nicknameKey, nickname);
}

function generateNickname() {
  const adjectives = ['Blue', 'Happy', 'Silent', 'Curious', 'Swift', 'Calm', 'Bright', 'Quiet'];
  const animals = ['Tiger', 'Fox', 'Panda', 'Owl', 'Falcon', 'Koala', 'Wolf'];
  return `${pick(adjectives)} ${pick(animals)}`;
}

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.addEventListener('popstate', () => {
  state.view = getInitialView();
  render();
});

render();
