import { adsenseClientId } from './adsense.js';
import { fillAdsterraSlots as mountAdsterra } from './adsterra.js';
import {
  MONETAG_DIRECT_LINK,
  MONETAG_IPP_SRC,
  MONETAG_IPP_ZONE,
  MONETAG_VIGNETTE_SRC,
  MONETAG_VIGNETTE_ZONE,
  renderIabSlot,
  renderNativeBanner
} from './monetag-tags.js';

export { MONETAG_DIRECT_LINK };

const CONSENT_KEY = 'quickroom.consent';
const US_OPT_OUT_KEY = 'quickroom.us-ads-opt-out';

const EEA_UK_CH = new Set(
  `AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH`.split(
    ' '
  )
);

let geo = { country: '', region: 'unknown' };
let adsLoaded = false;
let analyticsLoaded = false;

export function isMonetizedView(view) {
  return view !== 'room-placeholder' && view !== 'dashboard' && view !== 'create';
}

/** AdSense IAB units — never on About (Monetag only), chat, Create, or dashboard. */
export function isAdSenseView(view) {
  return isMonetizedView(view) && view !== 'about';
}

/** Adsterra IAB frames on Home and content pages. About stays Monetag-only. Chat uses a right rail only. */
export function showPageBanners(view) {
  if (!view || view === 'about' || view === 'dashboard' || view === 'room-placeholder') return false;
  return true;
}

export function showChatRightRail(view) {
  return view === 'room-placeholder';
}

/** @deprecated Use showPageBanners — kept so older call sites keep compiling. */
export function showAdSensePlaceholders(view) {
  return showPageBanners(view);
}

/** Monetag vignette / IPP / direct link — About only, so they never sit on AdSense URLs. */
export function isMonetagView(view) {
  return view === 'about';
}

const PRODUCT_SURFACES = new Set([
  'landing',
  'create',
  'room-placeholder',
  'dashboard',
  'about',
  'privacy',
  'cookies',
  'privacy-choices',
  'fr',
  'es'
]);

/** Articles, use cases, guides, blog — not Create/Join/room/home. */
export function isLongContentView(view) {
  return Boolean(view) && !PRODUCT_SURFACES.has(view) && isMonetizedView(view);
}

export function adsConsentOk() {
  if (usAdsOptedOut()) return false;
  if (geo.region === 'eea') {
    if (useGoogleFundingChoices()) return true;
    return Boolean(getConsent()?.ads);
  }
  return true;
}

export function getConsent() {
  try {
    const raw = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    if (raw && typeof raw === 'object') return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function usAdsOptedOut() {
  if (localStorage.getItem(US_OPT_OUT_KEY) === 'true') return true;
  try {
    if (navigator.globalPrivacyControl) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function setUsAdsOptOut(value) {
  localStorage.setItem(US_OPT_OUT_KEY, value ? 'true' : 'false');
}

export function saveConsent(partial) {
  const next = { ads: false, analytics: false, ts: Date.now(), ...getConsent(), ...partial };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  applyConsentMode(next);
  return next;
}

export function regionNeedsCmp() {
  return geo.region === 'eea';
}

export function getGeo() {
  return geo;
}

export async function initGeo() {
  try {
    const workerUrl = (import.meta.env.VITE_WORKER_URL || 'https://quickroom-api.jeeten15.workers.dev').replace(
      /\/$/,
      ''
    );
    const response = await fetch(`${workerUrl}/api/geo`);
    if (response.ok) {
      const payload = await response.json();
      geo = {
        country: String(payload.country || ''),
        region:
          payload.region === 'eea' || payload.region === 'us' || payload.region === 'other'
            ? payload.region
            : 'other'
      };
    }
  } catch {
    geo = { country: 'XX', region: 'other' };
  }
  if (geo.region === 'unknown') geo = { country: geo.country || 'XX', region: 'other' };
  return geo;
}

export function classifyCountry(country) {
  const cc = String(country || '').toUpperCase();
  if (EEA_UK_CH.has(cc)) return 'eea';
  if (cc === 'US') return 'us';
  return 'other';
}

function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

export function applyConsentMode(consent) {
  if (typeof window === 'undefined') return;
  const ads = Boolean(consent?.ads);
  const analytics = Boolean(consent?.analytics);
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = gtag;
  }
  window.gtag('consent', 'update', {
    ad_storage: ads ? 'granted' : 'denied',
    ad_user_data: ads ? 'granted' : 'denied',
    ad_personalization: ads ? 'granted' : 'denied',
    analytics_storage: analytics ? 'granted' : 'denied'
  });
}

export function installConsentDefaults() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') window.gtag = gtag;
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
}

function adsenseClient() {
  return adsenseClientId();
}

export function adRailCount(view) {
  if (showChatRightRail(view)) return 1;
  if (!showPageBanners(view)) return 0;
  if (view === 'landing') return 5;
  if (view === 'blog' || view === 'privacy' || isLongContentView(view)) return 1;
  if (view === 'privacy-choices' || view === 'fr' || view === 'es') return 2;
  return 1;
}

/** Sticky leader + in-article native beat extra 160×600 stacks on blog/privacy. Never on chat or locale homes. */
export function showAnchorAd(view) {
  if (!showPageBanners(view)) return false;
  if (!adsConsentOk()) return false;
  if (view === 'blog' || view === 'privacy' || view === 'privacy-choices') return true;
  return isLongContentView(view);
}

function useGoogleFundingChoices() {
  return String(import.meta.env.VITE_GOOGLE_FUNDING_CHOICES || '') === 'true';
}

export function shouldShowConsentBanner(view) {
  if (view === 'dashboard') return false;
  if (!regionNeedsCmp()) return false;
  if (useGoogleFundingChoices() && adsenseClient()) return false;
  return !getConsent();
}

export function canLoadAds(view) {
  if (!showPageBanners(view) && !showChatRightRail(view)) return false;
  return adsConsentOk();
}

export function fillAdsterraSlots() {
  if (!adsConsentOk()) return;
  mountAdsterra();
}

export function canLoadGa() {
  const id = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
  if (!id) return false;
  if (geo.region === 'unknown') return false;
  if (regionNeedsCmp()) return Boolean(getConsent()?.analytics);
  return true;
}

export function loadCloudflareAnalytics() {
  const token = String(import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN || '').trim();
  if (!token || document.querySelector('script[data-cf-beacon]')) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon', JSON.stringify({ token }));
  document.head.append(script);
}

export function loadGoogleAnalytics() {
  if (analyticsLoaded || !canLoadGa()) return;
  const id = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(script);
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
  analyticsLoaded = true;
}

export function loadAdSense(view) {
  if (adsLoaded || !canLoadAds(view)) return;
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    adsLoaded = true;
    return;
  }
  const client = adsenseClient();
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.append(script);
  adsLoaded = true;
}

export function renderAdSlot() {
  if (usAdsOptedOut() || (regionNeedsCmp() && !getConsent()?.ads && !useGoogleFundingChoices())) {
    return '';
  }
  return `${renderNativeBanner()}${renderIabSlot('box')}`;
}

/** Mid-article native (higher CPM than banners). One native unit per page. */
export function renderInArticleAd() {
  if (usAdsOptedOut() || (regionNeedsCmp() && !getConsent()?.ads && !useGoogleFundingChoices())) {
    return '';
  }
  const slot = String(import.meta.env.VITE_ADSENSE_SLOT_IN_ARTICLE || '').trim();
  if (slot) {
    return `<aside class="iab-slot iab-in-article" aria-label="Advertisement">
      <span class="iab-slot-label">Advertisement</span>
      <ins class="adsbygoogle"
        style="display:block; text-align:center;"
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="${escapeAttr(adsenseClient())}"
        data-ad-slot="${escapeAttr(slot)}"></ins>
    </aside>`;
  }
  return renderNativeBanner('iab-in-article');
}

export function renderInContentOffer() {
  return renderSponsoredLink();
}

export function pushAdSense() {
  try {
    if (!adsenseClient()) return;
    document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])').forEach(() => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  } catch {
    /* ignore */
  }
}

export function renderConsentBanner() {
  return `<div class="consent-banner" role="dialog" aria-labelledby="consent-title">
    <div class="consent-copy">
      <h2 id="consent-title">Cookies and ads in Europe</h2>
      <p>We use cookies for optional ads (Adsterra native and a desktop sticky 728×90 on blog and privacy pages, banners on other public pages, a 160×600 beside chat; Monetag only on About) and, if enabled, analytics. Creating and joining still work if you reject ads. Read the <a href="/privacy" data-action="navigate">privacy policy</a> and <a href="/cookies" data-action="navigate">cookies</a> pages.</p>
    </div>
    <div class="consent-actions">
      <button class="button button-secondary" type="button" data-action="consent-reject">Reject optional</button>
      <button class="button button-primary" type="button" data-action="consent-accept">Accept ads &amp; analytics</button>
    </div>
  </div>`;
}

export async function trackPageview(path) {
  const onRoom =
    path.startsWith('/room/') ||
    path.startsWith('/dashboard') ||
    (path === '/' && Boolean(new URLSearchParams(window.location.search).get('room')));
  if (onRoom) return;
  const workerUrl = (import.meta.env.VITE_WORKER_URL || 'https://quickroom-api.jeeten15.workers.dev').replace(
    /\/$/,
    ''
  );
  try {
    await fetch(`${workerUrl}/api/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
      keepalive: true
    });
  } catch {
    /* ignore */
  }
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

let lastView = '';
let vignetteTimer = 0;
let ippTimer = 0;

/**
 * Monetag overlays only on /about (no AdSense on that URL).
 * Skip if the visitor is no longer on About when the timer fires.
 */
export function syncMonetag(view) {
  lastView = view;
  if (vignetteTimer) {
    window.clearTimeout(vignetteTimer);
    vignetteTimer = 0;
  }
  if (ippTimer) {
    window.clearTimeout(ippTimer);
    ippTimer = 0;
  }

  const allowOverlay = isMonetagView(view) && adsConsentOk() && !usAdsOptedOut();
  if (!allowOverlay) return;

  if (!document.querySelector(`script[data-zone="${MONETAG_IPP_ZONE}"]`)) {
    ippTimer = window.setTimeout(() => {
      ippTimer = 0;
      if (!isMonetagView(lastView)) return;
      const host = document.querySelector('[data-ipp-host]') || document.body;
      const script = host.appendChild(document.createElement('script'));
      script.dataset.zone = MONETAG_IPP_ZONE;
      script.src = MONETAG_IPP_SRC;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
    }, 3_000);
  }

  if (sessionStorage.getItem('quickroom.vignette-session') === '1') return;
  if (document.querySelector(`script[data-zone="${MONETAG_VIGNETTE_ZONE}"]`)) return;

  vignetteTimer = window.setTimeout(() => {
    vignetteTimer = 0;
    if (!isMonetagView(lastView) || !adsConsentOk()) return;
    sessionStorage.setItem('quickroom.vignette-session', '1');
    const script = document.body.appendChild(document.createElement('script'));
    script.dataset.zone = MONETAG_VIGNETTE_ZONE;
    script.src = MONETAG_VIGNETTE_SRC;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
  }, 10_000);
}

export function fillIabSlots() {
  const client = adsenseClient();
  if (!client) return;
  const defaultSlot = String(import.meta.env.VITE_ADSENSE_SLOT || '').trim();
  const slotFor = {
    leader: String(import.meta.env.VITE_ADSENSE_SLOT_LEADER || defaultSlot).trim(),
    sky: String(import.meta.env.VITE_ADSENSE_SLOT_SKY || defaultSlot).trim(),
    box: String(import.meta.env.VITE_ADSENSE_SLOT_BOX || defaultSlot).trim(),
    mobile: String(import.meta.env.VITE_ADSENSE_SLOT_MOBILE || defaultSlot).trim()
  };
  const sizes = {
    leader: [728, 90],
    sky: [160, 600],
    box: [300, 250],
    mobile: [320, 50]
  };

  document.querySelectorAll('[data-iab]').forEach((el) => {
    if (el.querySelector('ins.adsbygoogle')) return;
    const kind = el.getAttribute('data-iab');
    const slot = slotFor[kind];
    const size = sizes[kind];
    if (!size) return;
    const format =
      kind === 'sky' ? 'vertical' : kind === 'box' ? 'rectangle' : kind === 'mobile' ? 'horizontal' : 'horizontal';
    const slotAttr = slot ? ` data-ad-slot="${escapeAttr(slot)}"` : '';
    el.innerHTML = `<ins class="adsbygoogle"
      style="display:inline-block;width:${size[0]}px;height:${size[1]}px"
      data-ad-client="${escapeAttr(client)}"${slotAttr}
      data-ad-format="${format}"
      data-full-width-responsive="${kind === 'sky' || kind === 'box' ? 'false' : 'true'}"></ins>`;
  });
}

export function renderSponsoredLink() {
  if (usAdsOptedOut()) return '';
  if (geo.region === 'eea' && !getConsent()?.ads) {
    return '';
  }
  return `<p class="sponsored-link">
    <a href="${MONETAG_DIRECT_LINK}" target="_blank" rel="sponsored nofollow noopener">Sponsored offer</a>
    <span> — optional, not required to create or join a room.</span>
  </p>`;
}
