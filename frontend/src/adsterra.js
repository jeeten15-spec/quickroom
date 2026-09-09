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
  /** No 320×50 invoke snippet was provided; mobile leader/footer use 300×250 instead. */
  mobile: null
};

const KIND_TO_SPEC = {
  sky: ADSTERRA.sky,
  leader: ADSTERRA.leader,
  box: ADSTERRA.box,
  mobile: ADSTERRA.mobile || ADSTERRA.box
};

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

function mountIframeBanner(el, spec) {
  if (!spec?.key) return;
  if (el.dataset.adsterraKey === spec.key && el.querySelector('iframe')) return;
  const iframe = document.createElement('iframe');
  iframe.title = 'Advertisement';
  iframe.width = String(spec.width);
  iframe.height = String(spec.height);
  iframe.setAttribute('scrolling', 'no');
  iframe.style.cssText = `border:0;overflow:hidden;width:${spec.width}px;height:${spec.height}px;display:block;`;
  iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  const key = spec.key.replace(/[^a-z0-9]/gi, '');
  iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>
<script>atOptions = {key:'${key}',format:'iframe',height:${spec.height},width:${spec.width},params:{}};<\/script>
<script src="${spec.host}/${key}/invoke.js"><\/script>
</body></html>`;
  el.replaceChildren(iframe);
  el.dataset.adsterraKey = spec.key;
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

let mediaBound = false;

export function fillAdsterraSlots() {
  document.querySelectorAll('[data-iab]').forEach((el) => {
    if (slotHidden(el)) return;
    const kind = el.getAttribute('data-iab');
    if (kind === 'native') {
      const box = el.querySelector(`#container-${ADSTERRA.native.id}`) || el;
      mountNativeBanner(box);
      return;
    }
    const spec = KIND_TO_SPEC[kind];
    if (spec) mountIframeBanner(el, spec);
  });

  if (!mediaBound && typeof window.matchMedia === 'function') {
    mediaBound = true;
    window.matchMedia('(min-width: 960px)').addEventListener('change', () => {
      fillAdsterraSlots();
    });
  }
}
