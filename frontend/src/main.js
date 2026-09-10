import { apiGet, apiRequest } from './api';
import { ChatRoom } from './chat';
import { generateNickname } from './nickname';
import { registerPwa } from './pwa';
import { coordinationJobs, useCasePages } from './use-cases';
import { guides } from './guides';
import { articles } from './articles';
import {
  SITE_AUTHOR,
  renderAboutEditorial,
  renderAuthorByline,
  renderComparisonTable,
  renderContentSections,
  renderLandingEditorial
} from './editorial';
import { legalPages } from './legal';
import { frPages } from './fr-pages';
import { renderRelatedHtml } from './related';
import { mountPaypalSupport, renderSupportBlock } from './support';
import { renderExtrasDomString } from './page-copy';
import { renderAdFooter, renderAdLeaderboard, renderAdSkyscraper } from './monetag-tags';
import { hreflangPairs, renderLangToggle } from './lang';
import {
  adRailCount,
  applyConsentMode,
  canLoadAds,
  fillAdsterraSlots,
  getConsent,
  initGeo,
  installConsentDefaults,
  isMonetizedView,
  showChatRightRail,
  showPageBanners,
  loadCloudflareAnalytics,
  loadGoogleAnalytics,
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
  const showAds = showPageBanners(state.view);
  const showChatRail = showChatRightRail(state.view);
  const rails = adRailCount(state.view);
  const path = window.location.pathname;
  document.documentElement.classList.toggle('chat-boot', isChat);
  activeChat?.destroy();
  activeChat = null;
  app.innerHTML = `
    <div class="site-top">
      ${renderLangToggle(path)}
    </div>
    ${showAds ? renderAdLeaderboard() : ''}
    <main class="page-shell">
      <div class="ads-page-row${showAds || showChatRail ? ' has-ad-rails' : ''}${isChat ? ' ads-page-row-chat' : ''}">
        ${showAds ? renderAdSkyscraper('left', rails) : ''}
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
        ${showAds || showChatRail ? renderAdSkyscraper('right', 1, { includeMobileBox: showChatRail }) : ''}
      </div>
    </main>
    ${showAds ? renderAdFooter() : ''}
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
        <p class="tagline">A named chat room you create, share as a link, and let expire. Nickname only — no account.</p>
        <p class="landing-support">18+ text chat in the browser. Not a video lounge, not a K–12 classroom product.</p>
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
        ${renderPublicRooms()}
        ${renderLandingEditorial(escapeHtml)}
        ${renderCoordinationJobs()}
      </div>
      <footer>
        <p class="footer-welcome">Rooms are temporary on purpose. Private by default; public listing is optional discovery.</p>
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
      <p class="job-links-intro">Each link is a specific coordination job, not a synonym dump. Templates on create are title shortcuts for these jobs.</p>
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

function publicRoomButton(room) {
  return `
              <button class="public-room" type="button" data-action="join-public" data-room-code="${escapeHtml(room.roomId)}">
                <span aria-hidden="true">${escapeHtml(room.icon)}</span>
                <span>${escapeHtml(room.name)}</span>
              </button>`;
}

function renderPublicRooms() {
  const list = [...state.publicRooms].sort(
    (left, right) => Number(right.createdAt || 0) - Number(left.createdAt || 0)
  );
  const latest = list.slice(0, 3);
  const older = list.slice(3);
  return `
    <section class="public-rooms" aria-labelledby="public-rooms-title">
      <h2 id="public-rooms-title">Public topic rooms</h2>
      <p class="public-rooms-note">The three newest public rooms sit here so the homepage stays readable as the list grows. Older public rooms live under User Created Rooms. Private rooms never appear here — share those with a link.</p>
      ${
        list.length
          ? `<div class="public-room-list">
        ${latest.map(publicRoomButton).join('')}
      </div>
      ${
        older.length
          ? `<details class="user-created-rooms">
        <summary>User Created Rooms</summary>
        <div class="public-room-list">${older.map(publicRoomButton).join('')}</div>
      </details>`
          : ''
      }`
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
  syncMonetag(state.view);
  if (state.ageConfirmed && canLoadAds(state.view)) {
    fillAdsterraSlots();
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

function renderExpiryMix(m) {
  const rows = Array.isArray(m.expiryMixMonth) ? m.expiryMixMonth : [];
  if (!rows.length) return '';
  return `
    <h2>Expiry mix (30 days)</h2>
    <p class="use-case-intro">How long people asked rooms to live. Longer rooms use more Worker/database time.</p>
    <table class="metrics-table">
      <thead><tr><th>Duration</th><th>Rooms</th></tr></thead>
      <tbody>
        ${rows
          .map(
            (row) =>
              `<tr><td>${escapeHtml(row.label)}</td><td>${escapeHtml(String(row.count))}</td></tr>`
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderRoomsByCountry(m) {
  const groups = Array.isArray(m.roomsByCountry) ? m.roomsByCountry : [];
  if (!groups.length) {
    return `<p class="metric-note">Country room lists appear after new rooms are created (country is stored at create time). Older rooms without a country code are grouped as Unknown.</p>`;
  }
  return `
    <h2>Rooms created by country (top 5, 30 days)</h2>
    <p class="use-case-intro">Names and chosen duration only. Use this to see where demand is and whether live-room count justifies a Cloudflare plan change.</p>
    ${groups
      .map((group) => {
        const publicRows = Array.isArray(group.publicRooms) ? group.publicRooms : [];
        const privateRows = Array.isArray(group.privateRooms) ? group.privateRooms : [];
        return `
          <h3>${escapeHtml(group.countryName || group.country)} · ${escapeHtml(String(group.count))} rooms</h3>
          <div class="metrics-tables">
            <table class="metrics-table">
              <thead><tr><th>Public rooms</th><th>Duration</th></tr></thead>
              <tbody>
                ${
                  publicRows.length
                    ? publicRows
                        .map(
                          (row) =>
                            `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.expiry)}</td></tr>`
                        )
                        .join('')
                    : '<tr><td colspan="2">None</td></tr>'
                }
              </tbody>
            </table>
            <table class="metrics-table">
              <thead><tr><th>Private rooms</th><th>Duration</th></tr></thead>
              <tbody>
                ${
                  privateRows.length
                    ? privateRows
                        .map(
                          (row) =>
                            `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.expiry)}</td></tr>`
                        )
                        .join('')
                    : '<tr><td colspan="2">None</td></tr>'
                }
              </tbody>
            </table>
          </div>
        `;
      })
      .join('')}
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
      <p class="article-date">Last updated 9 September 2026</p>
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
          ${showPageBanners('fr') ? renderAdSlot() : ''}
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
      <p class="use-case-intro">Rooms created / week, joining quality, share behaviour, and return creators. Extra month and country tables below are for capacity and Cloudflare plan decisions.</p>
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
      <div class="metric-card">
        <p class="metric-label">Rooms created / month</p>
        <p class="metric-value">${escapeHtml(String(m.roomsCreatedMonth ?? 0))}</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Live rooms now</p>
        <p class="metric-value">${escapeHtml(String(m.liveRoomsNow ?? 0))}</p>
        <p class="metric-note">${escapeHtml(String(m.livePublicNow ?? 0))} public · ${escapeHtml(String(m.livePrivateNow ?? 0))} private</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Public / private (30d)</p>
        <p class="metric-value">${escapeHtml(String(m.publicRoomsMonth ?? 0))} / ${escapeHtml(String(m.privateRoomsMonth ?? 0))}</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Creators this month</p>
        <p class="metric-value">${escapeHtml(String(m.creatorsThisMonth ?? 0))}</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Still live of this month</p>
        <p class="metric-value">${escapeHtml(String(m.stillLiveMonth ?? 0))}</p>
        <p class="metric-note">of ${escapeHtml(String(m.roomsCreatedMonth ?? 0))} created in 30 days</p>
      </div>
    </div>
    <p class="dashboard-updated">Window: last 7 days for rooms · last 30 days for month/country room lists · last 14 days for country pageviews · Updated ${escapeHtml(new Date(m.generatedAt).toLocaleString())}</p>
    ${renderExpiryMix(m)}
    ${renderRoomsByCountry(m)}
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
    <article class="info-page" data-ipp-host>
      <a class="back-link" href="/" data-action="navigate">QuickRoom</a>
      ${renderAboutEditorial(escapeHtml)}
      ${renderSponsoredLink()}
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
      <p class="eyebrow">Walkthrough</p>
      <h1>${escapeHtml(article.title)}</h1>
      ${renderAuthorByline(escapeHtml, article.updatedAt || article.publishedAt)}
      <p class="use-case-intro">${escapeHtml(article.intro)}</p>
      ${renderContentSections(article.sections, escapeHtml)}
      ${renderSeoExtras('a QuickRoom temporary chat')}
      ${renderAdSlot()}
      ${renderRelatedHtml(`/${slug}`, { escapeHtml })}
      <button class="button button-primary use-case-cta" type="button" data-action="open-create">Create a room</button>
      ${renderSupportBlock({ compact: true })}
      ${renderSiteFooter()}
    </article>
  `;
}

function renderBlog() {
  const articleLinks = Object.entries(articles)
    .map(
      ([slug, page]) =>
        `<li>
          <a href="/${escapeHtml(slug)}" data-action="navigate">${escapeHtml(page.title)}</a>
          <span class="muted small"> — ${escapeHtml(page.updatedAt || page.publishedAt)} · ${escapeHtml(page.author || SITE_AUTHOR.name)}</span>
          <p class="muted small">${escapeHtml(page.description)}</p>
        </li>`
    )
    .join('');
  return `
    <article class="info-page">
      <a class="back-link" href="/" data-action="navigate">QuickRoom</a>
      <p class="eyebrow">Editorial</p>
      <h1>How QuickRoom actually works</h1>
      ${renderAuthorByline(escapeHtml, '9 September 2026')}
      <h2>Articles</h2>
      <ul class="blog-index">${articleLinks}</ul>
      ${renderAdSlot()}
      <h2>Comparison snapshot</h2>
      <p>Full notes live in <a href="/blog/quickroom-vs-discord-whatsapp-slack" data-action="navigate">QuickRoom vs WhatsApp, Discord, and Slack</a>. The table is the same one on the homepage so we do not maintain two stories.</p>
      ${renderComparisonTable(escapeHtml)}
      <h2>Practical setup guides</h2>
      <ul>
        <li><a href="/private-study-group-without-whatsapp" data-action="navigate">How to start a private study group without WhatsApp</a></li>
        <li><a href="/temporary-chat-room-for-hackathons" data-action="navigate">A temporary chat room for hackathons</a></li>
        <li><a href="/short-lived-event-backchannel" data-action="navigate">How to run a short-lived event backchannel</a></li>
      </ul>
      <p>Product questions: <a href="mailto:${escapeHtml(SITE_AUTHOR.email)}">${escapeHtml(SITE_AUTHOR.email)}</a>.</p>
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
            title: 'About QuickRoom — who builds it and what we will not add',
            description:
              'Jeets builds QuickRoom. Named rooms, 18+ only, no K–12, no stranger video. Code on GitHub, contact feedback@quickroom.org.',
            lang: 'en'
          }
        : state.view === 'blog'
          ? {
              title: 'How QuickRoom actually works — walkthroughs and comparison',
              description:
                'Product walkthroughs with screenshots, a comparison table versus WhatsApp, Discord, and Slack, and the private vs public listing rule.',
              lang: 'en'
            }
          : state.view === 'dashboard'
            ? {
                title: 'QuickRoom Dashboard — Growth Metrics',
                description: 'Operator metrics for QuickRoom room creation, joining, and sharing.',
                lang: 'en'
              }
          : {
              title: 'QuickRoom — named chat rooms with a shareable link',
              description:
                'Create a named browser chat room, share /?room=…, and let it expire. Nickname only. 18+ text chat — not video matching, not K–12.',
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
