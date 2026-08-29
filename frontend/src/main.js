import { apiGet, apiRequest } from './api';
import { ChatRoom } from './chat';
import { generateNickname } from './nickname';
import { registerPwa } from './pwa';
import { coordinationJobs, useCasePages } from './use-cases';
import { guides } from './guides';
import { articles } from './articles';
import { legalPages } from './legal';
import { frPages } from './fr-pages';
import { renderRelatedHtml } from './related';
import { mountPaypalSupport, renderSupportBlock } from './support';
import { renderExtrasDomString } from './page-copy';
import { renderAdFooter, renderAdLeaderboard, renderAdSkyscraper } from './monetag-tags';
import { hreflangPairs, renderLangToggle } from './lang';
import {
  applyConsentMode,
  canLoadAds,
  getConsent,
  initGeo,
  installConsentDefaults,
  isMonetizedView,
  loadAdSense,
  loadCloudflareAnalytics,
  loadGoogleAnalytics,
  pushAdSense,
  renderAdSlot,
  renderConsentBanner,
  renderSponsoredLink,
  saveConsent,
  setUsAdsOptOut,
  shouldShowConsentBanner,
  syncMonetag,
  trackPageview,
  usAdsOptedOut
} from './monetization';
import './style.css';

const GITHUB_URL = 'https://github.com/jeeten15-spec/quickroom';
const metricsTokenKey = 'quickroom.metrics-token';

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
  ['blank', '✨', 'Let me Decide', 'Untitled Room']
];

const ageGateKey = 'quickroom.age-confirmed';
const nicknameKey = 'quickroom.nickname';
const state = {
  ageConfirmed: localStorage.getItem(ageGateKey) === 'true',
  view: getInitialView(),
  joinOpen: false,
  contactOpen: false,
  publicRooms: [],
  publicRoomsLoaded: false,
  publicRoomsLoadedAt: 0,
  publicRoomsLoading: false,
  joinCode: '',
  error: '',
  busy: false,
  create: createInitialRoomState(),
  joinNickname: sessionStorage.getItem(nicknameKey) || generateNickname(),
  metrics: null,
  metricsError: '',
  metricsToken: sessionStorage.getItem(metricsTokenKey) || '',
  metricsBusy: false
};

function getInitialView() {
  normalizePathname();
  if (roomIdFromLocation()) return 'room-placeholder';
  const pathname = window.location.pathname;
  const slug = pathname.replace(/^\//, '');
  return pathname === '/about'
    ? 'about'
    : pathname === '/blog'
      ? 'blog'
      : pathname === '/dashboard'
        ? 'dashboard'
        : legalPages[slug]
          ? slug
          : frPages[slug]
            ? slug
            : useCasePages[slug] || guides[slug] || articles[slug]
              ? slug
              : 'landing';
}

function normalizePathname() {
  const { pathname, search, hash } = window.location;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const normalized = pathname.replace(/\/+$/, '') || '/';
    window.history.replaceState({}, '', `${normalized}${search}${hash}`);
  }
}

function createInitialRoomState() {
  return {
    step: 1,
    template: 'study',
    name: 'Study Room',
    expiry: '24h',
    nickname: sessionStorage.getItem(nicknameKey) || generateNickname(),
    type: 'private',
    allowPrivateChat: true
  };
}

function render() {
  const isChat = state.view === 'room-placeholder';
  const path = window.location.pathname;
  activeChat?.destroy();
  activeChat = null;
  app.innerHTML = `
    <div class="site-top">
      ${renderLangToggle(path)}
      ${renderAdLeaderboard()}
    </div>
    <main class="page-shell">
      <div class="ads-page-row${isChat ? ' ads-page-row-chat' : ''}">
        ${isChat ? '' : renderAdSkyscraper('left')}
        <div class="ads-page-main">
          ${state.view === 'landing' ? renderLanding() : ''}
          ${state.view === 'create' ? renderCreateRoom() : ''}
          ${isChat ? '<div id="chat-root"></div>' : ''}
          ${state.view === 'about' ? renderAbout() : ''}
          ${state.view === 'blog' ? renderBlog() : ''}
          ${state.view === 'dashboard' ? renderDashboard() : ''}
          ${legalPages[state.view] ? renderLegal(state.view) : ''}
          ${frPages[state.view] ? renderFrench(state.view) : ''}
          ${useCasePages[state.view] ? renderUseCase(state.view) : ''}
          ${guides[state.view] ? renderGuide(state.view) : ''}
          ${articles[state.view] ? renderArticle(state.view) : ''}
        </div>
        ${renderAdSkyscraper('right')}
      </div>
    </main>
    ${renderAdFooter()}
    ${state.ageConfirmed ? '' : renderAgeGate()}
    ${state.ageConfirmed && shouldShowConsentBanner(state.view) ? renderConsentBanner() : ''}
    ${state.contactOpen ? renderContactForm() : ''}
  `;

  if (state.ageConfirmed && state.view === 'room-placeholder') {
    const roomId = roomIdFromLocation();
    if (!roomId) {
      window.history.replaceState({}, '', '/');
      state.view = 'landing';
    } else {
      activeChat = new ChatRoom(document.querySelector('#chat-root'), roomId, {
        onLeave: leaveRoomView
      });
      activeChat.mount();
    }
  }

  updateDocumentMetadata();

  if (state.ageConfirmed && state.view === 'landing') {
    loadPublicRoomsIfNeeded();
  }

  mountPaypalSupport(app);
  afterRender();
}

function renderLanding() {
  return `
      <section class="landing" aria-labelledby="quickroom-title">
      <div class="landing-content">
        <h1 id="quickroom-title">QuickRoom</h1>
        <p class="tagline">Free private chat rooms for temporary coordination—study groups, events, clients, travel. No signup.</p>
        <p class="landing-support">Create an online chat room. Share a link, code, or QR. Chat online free. Let it expire.</p>
        <button class="button button-primary" type="button" data-action="open-create">
          Create private room
        </button>
        <div class="join-area">
          ${
            state.joinOpen
              ? renderJoinForm()
              : `<button class="text-link" type="button" data-action="open-join">Join with code or link</button>`
          }
        </div>
        ${renderAdSlot()}
        ${renderPublicRooms()}
        ${renderCoordinationJobs()}
      </div>
      <footer>
        <p class="footer-welcome">Private chat room / free chat rooms / online chat—no app, no account, no phone number.</p>
        ${renderSupportBlock()}
        ${renderSiteFooter()}
        <p>18+ only <span>·</span> Temporary rooms</p>
      </footer>
    </section>
  `;
}

function renderCoordinationJobs() {
  return `
    <section class="job-links" aria-labelledby="jobs-title">
      <h2 id="jobs-title">Exact jobs QuickRoom is built for</h2>
      <p class="job-links-intro">Private chat rooms, free chat rooms, online chat rooms, group chat, and temporary chatrooms—without signup.</p>
      <div class="job-link-list">
        ${coordinationJobs
          .map(
            (job) => `
              <a class="job-link" href="${escapeHtml(job.href)}" data-action="navigate">
                <strong>${escapeHtml(job.label)}</strong>
                <span>${escapeHtml(job.blurb)}</span>
              </a>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderJoinForm() {
  return `
    <form class="join-form" data-form="join">
      <label for="join-room">Room code or join link</label>
      <input id="join-room" name="room" type="text" autocomplete="off" required
        placeholder="Code or https://quickroom.org/?room=…" value="${escapeHtml(state.joinCode)}" />
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

function renderPublicRooms() {
  return `
    <section class="public-rooms" aria-labelledby="public-rooms-title">
      <h2 id="public-rooms-title">Public topic rooms</h2>
      <p class="public-rooms-note">Open discovery for faster reach. Prefer Private rooms for events, clients, classes, and travel.</p>
      ${
        state.publicRooms.length
          ? `<div class="public-room-list">
        ${state.publicRooms
          .map(
            (room) => `
              <button class="public-room" type="button" data-action="join-public" data-room-code="${escapeHtml(room.roomId)}">
                <span aria-hidden="true">${escapeHtml(room.icon)}</span>
                <span>${escapeHtml(room.name)}</span>
              </button>
            `
          )
          .join('')}
      </div>`
          : `<p class="public-rooms-empty">No active public rooms right now. Create a Private room for your group instead.</p>`
      }
    </section>
  `;
}

function renderSiteFooter() {
  return `
        <p class="footer-links">
          <a href="/blog" data-action="navigate">Blog</a> <span>·</span>
          <a href="/about" data-action="navigate">About</a> <span>·</span>
          <a href="/privacy" data-action="navigate">Privacy</a> <span>·</span>
          <a href="/cookies" data-action="navigate">Cookies</a> <span>·</span>
          <a href="/privacy-choices" data-action="navigate">Privacy choices</a> <span>·</span>
          <a href="/fr" hreflang="fr">Français</a> <span>·</span>
          <button type="button" data-action="open-contact">Contact</button> <span>·</span>
          <a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>`;
}

function afterRender() {
  const verification = String(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || '').trim();
  if (verification && !document.querySelector('meta[name="google-site-verification"]')) {
    const meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    meta.content = verification;
    document.head.append(meta);
  }
  loadCloudflareAnalytics();
  syncMonetag();
  if (canLoadAds(state.view)) {
    loadAdSense(state.view);
    queueMicrotask(pushAdSense);
  }
  loadGoogleAnalytics();
  if (state.ageConfirmed && isMonetizedView(state.view)) {
    const path = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/+$/, '');
    trackPageview(path);
  }
}

function renderGithubTrust() {
  return `
    <p class="trust-github">
      Open source on
      <a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub</a>
      — inspect the code, follow development, and help build trust.
    </p>
  `;
}

function renderCountryPageviews(m) {
  const rows = Array.isArray(m.pageviewsByCountry) ? m.pageviewsByCountry : [];
  const paths = Array.isArray(m.pageviewsByPath) ? m.pageviewsByPath : [];
  if (!rows.length && !paths.length) {
    return `<p class="metric-note">Country pageviews will appear here after visitors load content pages.</p>`;
  }
  return `
    <h2>Content pageviews (14 days)</h2>
    <p class="use-case-intro">${escapeHtml(String(m.pageviews14d || 0))} counted views on landing, articles, and use cases. Country comes from Cloudflare. Rooms are not counted.</p>
    <div class="metrics-tables">
      <table class="metrics-table">
        <thead><tr><th>Country</th><th>Views</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr><td>${escapeHtml(row.country)}</td><td>${escapeHtml(String(row.views))}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
      <table class="metrics-table">
        <thead><tr><th>Path</th><th>Views</th></tr></thead>
        <tbody>
          ${paths
            .map(
              (row) =>
                `<tr><td>${escapeHtml(row.path)}</td><td>${escapeHtml(String(row.views))}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderLegal(slug) {
  const page = legalPages[slug];
  const choices =
    slug === 'privacy-choices'
      ? `<div class="privacy-choice-actions">
          <p>Current US ads opt-out: <strong>${usAdsOptedOut() ? 'on' : 'off'}</strong>. EU consent: <strong>${
            getConsent() ? (getConsent().ads ? 'ads allowed' : 'optional cookies rejected') : 'not set'
          }</strong>.</p>
          <button class="button button-secondary" type="button" data-action="us-opt-out">US: do not sell/share</button>
          <button class="button button-secondary" type="button" data-action="us-opt-in">US: allow ads</button>
          <button class="button button-secondary" type="button" data-action="consent-reject">EU: reject optional</button>
          <button class="button button-primary" type="button" data-action="consent-accept">EU: accept ads &amp; analytics</button>
        </div>`
      : '';
  return `
    <article class="info-page legal-page">
      <a class="back-link" href="/" data-action="navigate">QuickRoom</a>
      <p class="eyebrow">Legal</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="use-case-intro">${escapeHtml(page.description)}</p>
      <p class="article-date">Last updated 28 August 2026</p>
      ${choices}
      ${page.sections
        .map(
          (section) => `
            <section>
              <h2>${escapeHtml(section.heading)}</h2>
              ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
            </section>
          `
        )
        .join('')}
      ${renderSupportBlock({ compact: true })}
      ${renderSiteFooter()}
    </article>
  `;
}

function renderFrench(slug) {
  const page = frPages[slug];
  if (page.isLanding) {
    return `
      <section class="landing fr-landing" lang="fr" aria-labelledby="quickroom-title-fr">
        <div class="landing-content">
          <h1 id="quickroom-title-fr">QuickRoom</h1>
          <p class="tagline">${escapeHtml(page.intro)}</p>
          <p class="landing-support">${escapeHtml(page.description)}</p>
          <button class="button button-primary" type="button" data-action="open-create">Créer une salle privée</button>
          ${renderAdSlot()}
          <section class="job-links">
            <h2>Usages</h2>
            <div class="job-link-list">
              ${page.jobs
                .map(
                  (job) => `
                    <a class="job-link" href="${escapeHtml(job.href)}" data-action="navigate">
                      <strong>${escapeHtml(job.label)}</strong>
                      <span>${escapeHtml(job.blurb)}</span>
                    </a>`
                )
                .join('')}
            </div>
          </section>
        </div>
        <footer>
          ${renderRelatedHtml('/fr', { escapeHtml })}
          ${renderSiteFooter()}
          <p>18+ uniquement</p>
        </footer>
      </section>
    `;
  }
  return `
    <article class="info-page use-case-page" lang="fr">
      <a class="back-link" href="/fr" data-action="navigate">QuickRoom FR</a>
      <p class="eyebrow">Usage QuickRoom</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="use-case-intro">${escapeHtml(page.intro)}</p>
      <p>${escapeHtml(page.description)}</p>
      <button class="button button-primary use-case-cta" type="button" data-action="open-create">Créer une salle</button>
      ${renderAdSlot()}
      ${page.sections
        .map(
          (section) => `
            <section>
              <h2>${escapeHtml(section.heading)}</h2>
              ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
              ${
                section.list
                  ? `<ul>${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                  : ''
              }
            </section>
          `
        )
        .join('')}
      ${renderRelatedHtml(`/${slug}`, { escapeHtml })}
      <button class="button button-primary use-case-cta" type="button" data-action="open-create">Créer une salle</button>
      ${renderSponsoredLink()}
      ${renderSiteFooter()}
    </article>
  `;
}

function renderDashboard() {
  return `
    <article class="info-page dashboard-page">
      <a class="back-link" href="/" data-action="navigate">QuickRoom</a>
      <p class="eyebrow">Operator metrics</p>
      <h1>Growth dashboard</h1>
      <p class="use-case-intro">Rooms created / week, joining quality, share behaviour, and return creators.</p>
      ${
        state.metrics
          ? renderDashboardMetrics()
          : `
            <form class="dashboard-auth" data-form="dashboard-auth">
              <label for="metrics-token">Admin token</label>
              <input id="metrics-token" name="token" type="password" autocomplete="current-password"
                value="${escapeHtml(state.metricsToken)}" required />
              ${state.metricsError ? `<p class="form-error" role="alert">${escapeHtml(state.metricsError)}</p>` : ''}
              <button class="button button-primary" type="submit" ${state.metricsBusy ? 'disabled' : ''}>
                ${state.metricsBusy ? 'Loading…' : 'Load metrics'}
              </button>
            </form>
          `
      }
      ${renderSupportBlock({ compact: true })}
    </article>
  `;
}

function renderDashboardMetrics() {
  const m = state.metrics;
  return `
    <div class="metrics-grid">
      <div class="metric-card">
        <p class="metric-label">Rooms created / week</p>
        <p class="metric-value">${escapeHtml(String(m.roomsCreatedWeek))}</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Median joiners / room</p>
        <p class="metric-value">${escapeHtml(String(m.medianJoiners))}</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Rooms with ≥2 people</p>
        <p class="metric-value">${escapeHtml(m.pctRoomsWithTwoPlus)}%</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Share-click rate</p>
        <p class="metric-value">${escapeHtml(m.shareClickRate)}%</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Return creators</p>
        <p class="metric-value">${escapeHtml(m.returnCreatorsPct)}%</p>
        <p class="metric-note">${escapeHtml(String(m.returnCreators))} of ${escapeHtml(String(m.creatorsThisWeek))} creators this week</p>
      </div>
    </div>
    <p class="dashboard-updated">Window: last 7 days for rooms · last 14 days for country pageviews · Updated ${escapeHtml(new Date(m.generatedAt).toLocaleString())}</p>
    ${renderCountryPageviews(m)}
    <div class="form-actions">
      <button class="button button-secondary" type="button" data-action="refresh-metrics">Refresh</button>
      <button class="button button-secondary" type="button" data-action="clear-metrics">Sign out</button>
    </div>
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
      ${renderSupportBlock({ compact: true })}
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
    ['3mo', '3 months']
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
        <p class="input-note">Private and Invite Only rooms are joined with the share link, room code, or QR. Public rooms can also appear in discovery.</p>
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

function renderAbout() {
  return `
    <article class="info-page">
      <a class="back-link" href="/" data-action="navigate">QuickRoom</a>
      <h1>About QuickRoom</h1>
      <p>QuickRoom was created with a simple belief:</p>
      <p><strong>Technology should remove friction—not create it.</strong></p>
      <p>Our journey didn't begin in a Silicon Valley startup or a large technology company.</p>
      <p>It began with a simple observation.</p>
      <p>Every day, millions of people need a quick place to collaborate, ask questions, solve problems, or simply talk.</p>
      <p>Yet most online communication tools ask for too much before the conversation even begins.</p>
      <p>Create an account.</p>
      <p>Verify your phone.</p>
      <p>Install an app.</p>
      <p>Invite contacts.</p>
      <p>Accept permissions.</p>
      <p>Manage another notification.</p>
      <p>We wondered:</p>
      <p><strong>What if starting a conversation could be as simple as creating a document or opening a web page?</strong></p>
      <p>That question became QuickRoom.</p>

      <h2>Our Mission</h2>
      <p>Our mission is to build the simplest, fastest, and most respectful collaboration platform on the web.</p>
      <p>We believe people should be able to create a private room in seconds, share a link, and start collaborating immediately.</p>
      <p>No unnecessary barriers.</p>
      <p>No complicated setup.</p>
      <p>Just meaningful conversations.</p>

      <h2>Our Story</h2>
      <p>QuickRoom was founded by someone who comes from a humble background and has always believed that technology should create opportunities rather than obstacles.</p>
      <p>Growing up without unlimited resources teaches an important lesson:</p>
      <p><strong>The best tools are often the simplest ones.</strong></p>
      <p>That philosophy influences every decision we make.</p>
      <p>We aren't trying to build the biggest social network.</p>
      <p>We're trying to build one of the most useful tools on the Internet.</p>
      <p>If QuickRoom helps a student prepare for an exam, enables a family to organize an event, allows a team to solve a problem, or helps strangers collaborate on an idea, then we're moving in the right direction.</p>

      <h2>Our Principles</h2>
      <h3>Simplicity</h3>
      <p>The best technology often feels invisible.</p>
      <p>If something can be done with one click instead of five, we'll choose one.</p>
      <h3>Privacy</h3>
      <p>People shouldn't have to share personal information just to have a conversation.</p>
      <p>Privacy isn't a premium feature.</p>
      <p>It should be the default.</p>
      <h3>Respect</h3>
      <p>We want QuickRoom to remain a welcoming place where ideas are shared respectfully.</p>
      <p>Healthy communities don't happen by accident—they're built intentionally.</p>
      <h3>Accessibility</h3>
      <p>We believe useful technology should be available to as many people as possible.</p>
      <p>That's why we aim to keep the core experience free and lightweight, working directly in your browser without requiring powerful devices or expensive hardware.</p>

      <h2>Our Commitment</h2>
      <p>We're intentionally keeping QuickRoom clean.</p>
      <p>No clutter.</p>
      <p>No unnecessary features.</p>
      <p>No endless distractions.</p>
      <p>As the platform grows, we'll continue to focus on thoughtful improvements rather than feature overload.</p>
      <p>Ads may appear on the landing page, articles, and use-case pages. Live chat rooms do not show ads, so the conversation stays the focus.</p>
      <p>Our users are not the product.</p>
      <p>They're the reason the product exists.</p>

      <h2>Looking Ahead</h2>
      <p>QuickRoom is only the beginning.</p>
      <p>Our vision extends beyond chat.</p>
      <p>We're building a browser-first collaboration platform that will eventually include intelligent study tools, shared workspaces, AI-powered assistance, collaborative documents, and other lightweight tools that help people learn, create, and solve problems together.</p>
      <p>We're taking small steps, listening carefully to our community, and improving continuously.</p>
      <p>Thank you for being part of the journey.</p>
      <p>We're glad you're here.</p>
      ${renderGithubTrust()}
      ${renderSupportBlock()}
      ${renderSiteFooter()}
    </article>
  `;
}

function renderSeoExtras(pageTitle) {
  const { privacy, steps, faq } = renderExtrasDomString(pageTitle);
  return `
    <section>
      <h2>How to start</h2>
      <ol>${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
    </section>
    <section>
      <h2>Privacy and access</h2>
      ${privacy.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
    </section>
    <section>
      <h2>Frequently asked questions</h2>
      ${faq
        .map(
          (item) => `
            <div>
              <h3>${escapeHtml(item.q)}</h3>
              <p>${escapeHtml(item.a)}</p>
            </div>
          `
        )
        .join('')}
    </section>
  `;
}

function renderUseCase(slug) {
  const page = useCasePages[slug];
  return `
    <article class="info-page use-case-page">
      <a class="back-link" href="/" data-action="navigate">QuickRoom</a>
      <p class="eyebrow">QuickRoom use case</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="use-case-intro">${escapeHtml(page.intro)}</p>
      <p>${escapeHtml(page.description)}</p>
      <button class="button button-primary use-case-cta" type="button" data-action="open-create">Create a room</button>
      ${page.sections
        .map(
          (section) => `
            <section>
              <h2>${escapeHtml(section.heading)}</h2>
              ${(section.paragraphs || [])
                .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
                .join('')}
              ${
                section.list
                  ? `<ul>${section.list
                      .map((item) => `<li>${escapeHtml(item)}</li>`)
                      .join('')}</ul>`
                  : ''
              }
            </section>
          `
        )
        .join('')}
      ${renderSeoExtras(page.title)}
      ${renderAdSlot()}
      ${renderRelatedHtml(`/${slug}`, { escapeHtml })}
      <button class="button button-primary use-case-cta" type="button" data-action="open-create">Create a room</button>
      ${renderSponsoredLink()}
      ${renderSupportBlock({ compact: true })}
      ${renderSiteFooter()}
    </article>
  `;
}

function renderGuide(slug) {
  const guide = guides[slug];
  return `
    <article class="info-page guide-page">
      <a class="back-link" href="/" data-action="navigate">QuickRoom</a>
      <p class="eyebrow">Practical guide</p>
      <h1>${escapeHtml(guide.title)}</h1>
      <p class="use-case-intro">${escapeHtml(guide.intro)}</p>
      <p>${escapeHtml(guide.description)}</p>
      ${guide.sections
        .map(
          (section) => `
            <section>
              <h2>${escapeHtml(section.heading)}</h2>
              ${(section.paragraphs || [])
                .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
                .join('')}
              ${
                section.list
                  ? `<ol>${section.list
                      .map((item) => `<li>${escapeHtml(item)}</li>`)
                      .join('')}</ol>`
                  : ''
              }
            </section>
          `
        )
        .join('')}
      ${renderSeoExtras(guide.title)}
      ${renderAdSlot()}
      ${renderRelatedHtml(`/${slug}`, { escapeHtml })}
      <button class="button button-primary use-case-cta" type="button" data-action="open-create">Create a room</button>
      ${renderSponsoredLink()}
      ${renderSupportBlock({ compact: true })}
      ${renderSiteFooter()}
    </article>
  `;
}

function renderArticle(slug) {
  const article = articles[slug];
  return `
    <article class="info-page article-page">
      <a class="back-link" href="/blog" data-action="navigate">QuickRoom Blog</a>
      <p class="eyebrow">QuickRoom guide</p>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="article-date">${escapeHtml(article.publishedAt)}</p>
      <p class="use-case-intro">${escapeHtml(article.intro)}</p>
      <p>${escapeHtml(article.description)}</p>
      ${article.sections
        .map(
          (section) => `
            <section>
              <h2>${escapeHtml(section.heading)}</h2>
              ${(section.paragraphs || [])
                .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
                .join('')}
              ${
                section.list
                  ? `<ul>${section.list
                      .map((item) => `<li>${escapeHtml(item)}</li>`)
                      .join('')}</ul>`
                  : ''
              }
            </section>
          `
        )
        .join('')}
      ${renderSeoExtras('a QuickRoom temporary chat')}
      ${renderAdSlot()}
      ${renderRelatedHtml(`/${slug}`, { escapeHtml })}
      <button class="button button-primary use-case-cta" type="button" data-action="open-create">Create a room</button>
      ${renderSponsoredLink()}
      ${renderSupportBlock({ compact: true })}
      ${renderSiteFooter()}
    </article>
  `;
}

function renderBlog() {
  const articleLinks = Object.entries(articles)
    .map(
      ([slug, page]) =>
        `<li><a href="/${escapeHtml(slug)}" data-action="navigate">${escapeHtml(page.title)}</a> — ${escapeHtml(page.description)}</li>`
    )
    .join('');
  return `
    <article class="info-page">
      <a class="back-link" href="/" data-action="navigate">QuickRoom</a>
      <h1>QuickRoom Blog — Free Chat Rooms & Private Temporary Chat</h1>
      <p>Looking for <strong>free chat rooms</strong>, <strong>online chat rooms</strong>, a <strong>private chat room without signup</strong>, <strong>anonymous chat</strong>, <strong>group chat</strong>, a <strong>temporary chat room</strong>, <strong>chatroom</strong>, <strong>text chat</strong>, <strong>live chat</strong>, or a way to <strong>chat online free</strong> without another app? QuickRoom is a browser-based temporary room: create it, share a code, talk, let it expire.</p>

      <h2>Articles</h2>
      <ul>${articleLinks}</ul>

      <h2>The Internet Made Starting a Conversation Surprisingly Difficult</h2>
      <p>It sounds strange, but in 2026, starting a simple private conversation with a group of people has become harder than it should be.</p>
      <p>Need to discuss tomorrow's assignment with classmates?</p>
      <p>Create a WhatsApp group.</p>
      <p>Need to brainstorm with a few colleagues?</p>
      <p>Set up a Discord server.</p>
      <p>Want to collaborate during a hackathon?</p>
      <p>Create a Slack workspace.</p>
      <p>Planning a family event?</p>
      <p>Start another messaging group.</p>
      <p>Almost every platform expects you to create an account, verify your email or phone number, install an app, share your personal information, manage notifications, and maintain yet another permanent group that you'll probably never use again.</p>
      <p>We believe there's a better way.</p>
      <p>Today, we're excited to launch <strong>QuickRoom</strong>.</p>

      <h2>What is QuickRoom?</h2>
      <p>QuickRoom is the fastest way to create a <strong>private chat room</strong>—including <strong>free chat rooms</strong> and <strong>online chat rooms</strong> for short-lived work.</p>
      <p>No registration.</p><p>No phone number.</p><p>No email.</p><p>No app to install.</p><p>No complicated setup.</p>
      <p>Just create a room, share the link, and start talking—<strong>chat online free</strong> as <strong>text chat</strong> / <strong>live chat</strong> / <strong>group chat</strong> / <strong>webchat</strong> in the browser.</p>
      <p>Whether you're studying for an exam, solving a coding problem, planning an event, helping a friend, or simply having a short discussion, QuickRoom lets you create a temporary collaboration space in seconds.</p>

      <h2>Why We Built QuickRoom</h2>
      <p>The idea began with a simple question:</p>
      <p><strong>Why should a five-minute conversation require a permanent account?</strong></p>
      <p>The web has become incredibly powerful, yet many everyday interactions have become unnecessarily complicated.</p>
      <p>We wanted to build something that feels like the early Internet—simple, fast, lightweight, and open—but with modern security, privacy, and thoughtful design.</p>
      <p>QuickRoom is our attempt to remove friction.</p>
      <p>You shouldn't have to hand over your personal information just to have a conversation—whether you call it <strong>anonymous chat</strong>, a <strong>temporary chat room</strong>, or a simple <strong>chatroom</strong>.</p>

      <h2>Designed for Temporary Collaboration</h2>
      <p>QuickRoom isn't trying to replace your favorite messaging app.</p>
      <p>Instead, it's designed for moments where you need a conversation <strong>right now</strong>.</p>
      <p>Examples include:</p>
      <ul>
        <li>Study groups</li><li>Exam preparation</li><li>Coding help</li><li>Project discussions</li><li>Online classes</li><li>Book clubs</li><li>Brainstorming sessions</li><li>Family planning</li><li>Event coordination</li><li>Community discussions</li><li>Interview panels</li><li>Quick support conversations</li>
      </ul>
      <p>Create a room.</p><p>Share the link.</p><p>Collaborate.</p>
      <p>When you're done, the room automatically expires.</p><p>Simple.</p>

      <h2>Built Around Privacy</h2>
      <p>Every QuickRoom starts with privacy in mind.</p>
      <p>There are no mandatory user profiles.</p><p>No phone numbers.</p><p>No email addresses.</p><p>No permanent identity.</p>
      <p>Rooms are temporary by default, and users can choose how long they remain available.</p>
      <p>We believe conversations don't always need to live forever.</p>

      <h2>Clean by Design</h2>
      <p>The modern web is full of distractions: autoplay videos, floating chat widgets, and endless notifications.</p>
      <p>QuickRoom is intentionally different inside the room.</p>
      <p>Our design philosophy is simple:</p>
      <p><strong>Every pixel in the conversation should have a purpose.</strong></p>
      <p>Ads may appear on the landing page, articles, and use-case pages. They are not placed inside live chat rooms.</p>

      <h2>Where We're Going</h2>
      <p>This is only Phase One.</p>
      <p>QuickRoom starts as a lightweight browser-based chat platform, but our vision is much larger.</p>
      <p>Over the coming months, we plan to introduce features that make collaboration even easier while keeping the experience simple.</p>
      <p>Some of the ideas we're exploring include:</p>
      <ul>
        <li>Temporary image sharing</li><li>Smart room templates</li><li>Shared notes</li><li>Collaborative whiteboards</li><li>AI-powered discussion summaries</li><li>Study assistants</li><li>Instant quizzes from shared notes</li><li>PDF collaboration</li><li>Polls</li><li>Shared task lists</li>
      </ul>
      <p>Our long-term goal is to build the simplest browser-based collaboration platform on the Internet.</p>

      <h2>Keeping QuickRoom Accessible</h2>
      <p>We're committed to keeping QuickRoom accessible to everyone.</p>
      <p>Our goal is to keep creating and joining a room free.</p>
      <p>If we ever introduce premium features, they'll enhance the experience rather than restrict basic collaboration.</p>
      <p>Advertising on landing pages, articles, and use cases helps keep rooms free to use. Ads are not shown inside the chat.</p>
      <p>Users come first.</p><p>Always.</p>

      <h2>Practical Guides</h2>
      <ul>
        <li><a href="/private-study-group-without-whatsapp" data-action="navigate">How to start a private study group without WhatsApp</a></li>
        <li><a href="/temporary-chat-room-for-hackathons" data-action="navigate">A temporary chat room for hackathons</a></li>
        <li><a href="/short-lived-event-backchannel" data-action="navigate">How to run a short-lived event backchannel</a></li>
      </ul>

      <h2>Exact jobs QuickRoom is built for</h2>
      <ul>
        ${coordinationJobs
          .map(
            (job) =>
              `<li><a href="${escapeHtml(job.href)}" data-action="navigate">${escapeHtml(job.label)}</a> — ${escapeHtml(job.blurb)}</li>`
          )
          .join('')}
      </ul>

      <h2>We'd Love Your Feedback</h2>
      <p>QuickRoom is just getting started.</p>
      <p>Some of our best ideas have already come from conversations with students, educators, developers, and curious early users.</p>
      <p>If you have suggestions, feature requests, or ideas, we'd genuinely love to hear from you.</p>
      <p>Together, we hope to build something that's useful, simple, and enjoyable for millions of people around the world.</p>
      <p>Welcome to QuickRoom.</p>
      <p>Create a room.</p><p>Share a link.</p><p>Start talking.</p>
      ${renderSponsoredLink()}
      ${renderGithubTrust()}
      ${renderSupportBlock()}
      ${renderSiteFooter()}
    </article>
  `;
}

function updateDocumentMetadata() {
  const page =
    useCasePages[state.view] ||
    guides[state.view] ||
    articles[state.view] ||
    legalPages[state.view] ||
    frPages[state.view];
  const metadata =
    page
      ? { title: page.seoTitle || page.title, description: page.description, lang: page.htmlLang || 'en' }
        : state.view === 'about'
        ? {
            title: 'About QuickRoom — Private Temporary Chat Rooms, No Signup',
            description:
              'Why QuickRoom exists: free private chat rooms, temporary chat rooms, and online chat without accounts, apps, or phone numbers.',
            lang: 'en'
          }
        : state.view === 'blog'
          ? {
              title: 'QuickRoom Blog — Free Chat Rooms, Anonymous Chat, No Signup',
              description:
                'Guides to private chat rooms without signup, free online chat rooms, anonymous group chat, and temporary chatrooms on QuickRoom.',
              lang: 'en'
            }
          : state.view === 'dashboard'
            ? {
                title: 'QuickRoom Dashboard — Growth Metrics',
                description: 'Operator metrics for QuickRoom room creation, joining, and sharing.',
                lang: 'en'
              }
          : {
              title: 'QuickRoom — Free Private Chat Rooms Online, No Signup',
              description:
                'Create a free private chat room or temporary online chat room without signup. Group chat, text chat, and live chat in the browser—no app or phone number.',
              lang: 'en'
            };
  document.title = metadata.title;
  document.documentElement.lang = metadata.lang || 'en';
  let description = document.querySelector('meta[name="description"]');
  if (!description) {
    description = document.createElement('meta');
    description.name = 'description';
    document.head.append(description);
  }
  description.content = metadata.description;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  const cleanPath =
    window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/+$/, '');
  canonical.href = `https://quickroom.org${cleanPath}`;
  syncHrefLang(cleanPath);

  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement('meta');
    robots.name = 'robots';
    document.head.append(robots);
  }
  const isAppSurface = state.view === 'room-placeholder' || state.view === 'dashboard';
  robots.content = isAppSurface ? 'noindex, nofollow' : 'index, follow';
}

function syncHrefLang(cleanPath) {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
  for (const [lang, href] of hreflangPairs(cleanPath)) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = href;
    document.head.append(link);
  }
}

function renderContactForm() {
  return `
    <div class="modal-backdrop">
      <form class="contact-modal" data-form="contact">
        <button class="overlay-close contact-close" type="button" data-action="close-contact" aria-label="Close">×</button>
        <h1>Contact Us</h1>
        <p>Share a question, idea, or suggestion.</p>
        <label for="contact-message">Your message</label>
        <textarea id="contact-message" name="message" rows="6" maxlength="2000" required></textarea>
        <div class="form-actions">
          <button class="button button-secondary" type="button" data-action="close-contact">Cancel</button>
          <button class="button button-primary" type="submit">Continue</button>
        </div>
      </form>
    </div>
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

  if (action === 'navigate') {
    event.preventDefault();
    window.history.pushState({}, '', button.getAttribute('href'));
    state.contactOpen = false;
    state.view = getInitialView();
    if (state.view === 'landing') {
      state.publicRoomsLoaded = false;
    }
    render();
    return;
  }
  if (action === 'consent-accept') {
    saveConsent({ ads: true, analytics: true });
    render();
    return;
  }
  if (action === 'consent-reject') {
    saveConsent({ ads: false, analytics: false });
    render();
    return;
  }
  if (action === 'us-opt-out') {
    setUsAdsOptOut(true);
    render();
    return;
  }
  if (action === 'us-opt-in') {
    setUsAdsOptOut(false);
    render();
    return;
  }
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
    state.publicRoomsLoaded = false;
    render();
  }
  if (action === 'open-join') {
    state.joinOpen = true;
    state.joinCode = '';
    state.error = '';
    render();
  }
  if (action === 'open-contact') {
    state.contactOpen = true;
    render();
  }
  if (action === 'close-contact') {
    state.contactOpen = false;
    render();
  }
  if (action === 'close-join') {
    state.joinOpen = false;
    state.error = '';
    render();
  }
  if (action === 'join-public') {
    event.preventDefault();
    const roomId = button.dataset.roomCode;
    if (!roomId) return;
    const formData = new FormData();
    formData.set('room', roomId);
    formData.set('nickname', state.joinNickname);
    try {
      await submitJoinRoom(formData);
    } catch (error) {
      state.joinCode = roomId;
      state.joinOpen = true;
      state.error = error.message || 'Unable to join the room.';
      render();
    }
    return;
  }
  if (action === 'refresh-metrics') {
    await loadMetrics();
  }
  if (action === 'clear-metrics') {
    state.metrics = null;
    state.metricsToken = '';
    state.metricsError = '';
    sessionStorage.removeItem(metricsTokenKey);
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
    if (form.dataset.form === 'contact') {
      const message = String(formData.get('message') || '').trim();
      if (!message) throw new Error('Please enter a message.');
      state.contactOpen = false;
      window.location.href = `mailto:feedback@quickroom.org?subject=${encodeURIComponent(
        'QuickRoom feedback'
      )}&body=${encodeURIComponent(message)}`;
      render();
      return;
    }
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
    if (form.dataset.form === 'dashboard-auth') {
      state.metricsToken = String(formData.get('token') || '').trim();
      sessionStorage.setItem(metricsTokenKey, state.metricsToken);
      await loadMetrics();
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
    return;
  } catch (error) {
    state.error = error.message || 'Unable to create the room.';
  } finally {
    if (state.view === 'room-placeholder') return;
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
    return;
  } catch (error) {
    state.error = error.message || 'Unable to join the room.';
    throw error;
  } finally {
    if (state.view === 'room-placeholder') return;
    state.busy = false;
    render();
  }
}

async function loadPublicRoomsIfNeeded() {
  const stale = !state.publicRoomsLoaded || Date.now() - state.publicRoomsLoadedAt > 10_000;
  if (!stale || state.publicRoomsLoading) return;
  await loadPublicRooms();
}

async function loadPublicRooms() {
  state.publicRoomsLoading = true;
  state.publicRoomsLoaded = true;
  state.publicRoomsLoadedAt = Date.now();
  try {
    const response = await apiGet('/api/publicRooms');
    state.publicRooms = Array.isArray(response.rooms) ? response.rooms : [];
    if (state.view === 'landing') render();
  } catch {
    // Public room discovery is optional; the private create/join flow stays available.
  } finally {
    state.publicRoomsLoading = false;
  }
}

async function loadMetrics() {
  if (!state.metricsToken) {
    state.metricsError = 'Enter the admin token.';
    render();
    return;
  }
  state.metricsBusy = true;
  state.metricsError = '';
  render();
  try {
    const response = await apiGet('/api/metrics', {
      'X-Admin-Token': state.metricsToken
    });
    state.metrics = response;
  } catch (error) {
    state.metrics = null;
    state.metricsError = error.message || 'Unable to load metrics.';
  } finally {
    state.metricsBusy = false;
    render();
  }
}

function navigateToRoom(roomId) {
  sessionStorage.setItem('quickroom.current-room', roomId);
  window.history.pushState({}, '', `/?room=${encodeURIComponent(roomId)}`);
  state.view = 'room-placeholder';
  state.busy = false;
  state.error = '';
  render();
}

function roomIdFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('room') || params.get('id');
  if (fromQuery && /^[A-Za-z0-9_-]{16,64}$/.test(fromQuery)) return fromQuery;
  const fromPath = /^\/room\/([A-Za-z0-9_-]{16,64})$/.exec(window.location.pathname);
  return fromPath ? fromPath[1] : '';
}

function leaveRoomView() {
  window.history.pushState({}, '', '/');
  state.view = 'landing';
  state.joinOpen = false;
  state.error = '';
  state.publicRoomsLoaded = false;
  render();
}

function roomIdFromInput(value) {
  if (typeof value !== 'string') throw new Error('Enter a room code or join link.');
  const trimmed = value.trim();
  const fromUrl = /(?:\/room\/([A-Za-z0-9_-]{16,64})|[?&](?:room|id)=([A-Za-z0-9_-]{16,64}))/.exec(
    trimmed
  );
  const roomId = fromUrl ? fromUrl[1] || fromUrl[2] : trimmed;

  if (!/^[A-Za-z0-9_-]{16,64}$/.test(roomId)) {
    throw new Error('Enter a valid room code or join link.');
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
  if (state.view === 'landing') {
    state.publicRoomsLoaded = false;
  }
  render();
});

render();
registerPwa();
installConsentDefaults();
initGeo().then(() => {
  const consent = getConsent();
  if (consent) applyConsentMode(consent);
  if (state.view === 'room-placeholder' && activeChat) {
    afterRender();
    return;
  }
  render();
});
