/** Adsterra banner zones. Native 1:1 is a single container id per page. */

export const ADSTERRA = {
  native: {
    id: 'abc721dbe52aafa768ddacd83d3d6360',
    src: 'https://pl31255149.profitableratecpmnetwork.com/abc721dbe52aafa768ddacd83d3d6360/invoke.js'
  },
  sky: {
    key: 'a0d3429a7f6d32140e029d3f106583ba',
    width: 160,
    height: 600,
    host: 'https://www.highrevenueformat.com'
  },
  leader: {
    key: '0243f422b6987b571160ca3d693c00b8',
    width: 728,
    height: 90,
    host: 'https://www.highrevenueformat.com'
  },
  box: {
    key: 'da98ac6e870d06a8a9fbdf438bc662b8',
    width: 300,
    height: 250,
    host: 'https://www.highrevenueformat.com'
  },
  socialBar: {
    src: 'https://pl31271245.profitableratecpmnetwork.com/b2/01/1c/b2011ca9c26121c80792f3d72d304822.js'
  },
  mobile: {
    key: '231c5d8e0023ea517cb0c057c290a85b',
    width: 320,
    height: 50,
    host: 'https://www.highrevenueformat.com'
  }
};

const KIND_TO_SPEC = {
  sky: ADSTERRA.sky,
  leader: ADSTERRA.leader,
  box: ADSTERRA.box,
  mobile: ADSTERRA.mobile
};

let mediaBound = false;
let refreshTimer = 0;
let visibilityBound = false;

/** 60–90s between iframe banner reloads. */
export function bannerRefreshDelayMs(random = Math.random) {
  return 60_000 + Math.floor(Number(random()) * 30_000);
}

export function chatControlsAreActive(doc = globalThis.document) {
  const active = doc?.activeElement;
  if (!active || active === doc?.body) return false;
  if (typeof active.closest !== 'function') return false;
  if (!active.closest('.chat-page')) return false;
  const tag = String(active.tagName || '').toUpperCase();
  return tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT';
}

function slotHidden(el) {
  if (!el?.isConnected) return true;
  let node = el;
  while (node && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return true;
    node = node.parentElement;
  }
  return false;
}

function mostlyInViewport(el) {
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  const vh = window.innerHeight || 0;
  const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  return visible > Math.min(rect.height, vh) * 0.45;
}

function mountIframeBanner(el, spec) {
  if (!spec?.key) return;
  const iframe = document.createElement('iframe');
  iframe.title = 'Advertisement';
  iframe.width = String(spec.width);
  iframe.height = String(spec.height);
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('tabindex', '-1');
  iframe.style.cssText = `border:0;overflow:hidden;width:${spec.width}px;height:${spec.height}px;display:block;`;
  iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  const key = spec.key.replace(/[^a-z0-9]/gi, '');
  const bust = Date.now().toString(36);
  iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>
<script>atOptions = {key:'${key}',format:'iframe',height:${spec.height},width:${spec.width},params:{cachebust:'${bust}'}};<\/script>
<script src="${spec.host}/${key}/invoke.js"><\/script>
</body></html>`;
  el.replaceChildren(iframe);
  el.dataset.adsterraKey = spec.key;
}

export function fillBannerSlot(el) {
  if (!el) return;
  const kind = el.getAttribute('data-iab');
  if (kind === 'native') {
    const box = el.querySelector(`#container-${ADSTERRA.native.id}`) || el;
    mountNativeBanner(box);
    return;
  }
  const spec = KIND_TO_SPEC[kind];
  if (spec) mountIframeBanner(el, spec);
}

function mountNativeBanner(container) {
  if (!container) return;
  document.querySelectorAll('script[data-adsterra-native]').forEach((node) => node.remove());
  const script = document.createElement('script');
  script.async = true;
  script.dataset.adsterraNative = '1';
  script.setAttribute('data-cfasync', 'false');
  script.src = ADSTERRA.native.src;
  document.body.append(script);
}

function mountSocialBar() {
  if (document.documentElement.classList.contains('chat-boot')) return;
  if (document.querySelector('script[data-adsterra-social]')) return;
  if (!ADSTERRA.socialBar?.src) return;
  const script = document.createElement('script');
  script.async = true;
  script.dataset.adsterraSocial = '1';
  script.setAttribute('data-cfasync', 'false');
  script.src = ADSTERRA.socialBar.src;
  document.body.append(script);
}

function shouldSkipRefreshCycle() {
  if (typeof document === 'undefined') return true;
  if (document.hidden) return true;
  if (document.documentElement.dataset.adInterstitial === '1') return true;
  if (chatControlsAreActive(document)) return true;
  return false;
}

/** Reload iframe banners in place. Never re-renders chat markup or Social Bar. */
export function refreshVisibleBanners() {
  if (typeof document === 'undefined') return 0;
  if (shouldSkipRefreshCycle()) return 0;
  let refreshed = 0;
  document.querySelectorAll('[data-iab]').forEach((el) => {
    if (slotHidden(el)) return;
    if (!mostlyInViewport(el)) return;
    const kind = el.getAttribute('data-iab');
    if (kind === 'native') return;
    const spec = KIND_TO_SPEC[kind];
    if (!spec) return;
    mountIframeBanner(el, spec);
    refreshed += 1;
  });
  return refreshed;
}

export function stopBannerRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = 0;
  }
}

export function startBannerRefresh() {
  if (typeof window === 'undefined') return;
  stopBannerRefresh();
  if (!visibilityBound) {
    visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refreshVisibleBanners();
    });
  }
  const tick = () => {
    refreshTimer = window.setTimeout(() => {
      refreshVisibleBanners();
      tick();
    }, bannerRefreshDelayMs());
  };
  tick();
}

export function fillAdsterraSlots() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-iab]').forEach((el) => {
    if (slotHidden(el)) return;
    const kind = el.getAttribute('data-iab');
    if (kind === 'native') {
      const box = el.querySelector(`#container-${ADSTERRA.native.id}`) || el;
      mountNativeBanner(box);
      return;
    }
    if (el.querySelector('iframe') && el.dataset.adsterraKey) return;
    const spec = KIND_TO_SPEC[kind];
    if (spec) mountIframeBanner(el, spec);
  });

  mountSocialBar();
  startBannerRefresh();

  if (!mediaBound && typeof window.matchMedia === 'function') {
    mediaBound = true;
    window.matchMedia('(min-width: 960px)').addEventListener('change', () => {
      fillAdsterraSlots();
    });
  }
}
