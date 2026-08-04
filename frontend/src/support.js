const PAYPAL_CLIENT_ID =
  'BAAY-NrgK6PrSduATvNMOG5HYyMLDG61OTFS_BHzyAAjJcz-1fBRRwMXmemDx03BojVXz_T_Xj9or7i3QU';

// From PayPal embed step 2: hostedButtonId / #paypal-container-XXXX
// Build with VITE_PAYPAL_HOSTED_BUTTON_ID=<id> once you copy that id from PayPal.
const PAYPAL_HOSTED_BUTTON_ID = (import.meta.env.VITE_PAYPAL_HOSTED_BUTTON_ID || '').trim();

// India-friendly Buy Now checkout (not Donate). Used only when hostedButtonId is missing.
const PAYPAL_BUY_NOW_URL =
  'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick' +
  '&business=' +
  encodeURIComponent('Jeeten15@gmail.com') +
  '&item_name=' +
  encodeURIComponent('Buy QuickRoom a coffee') +
  '&amount=5.00' +
  '&currency_code=USD' +
  '&button_subtype=services' +
  '&no_note=1' +
  '&no_shipping=1';

// Exact SDK URL from the merchant embed (hosted-buttons only).
const SDK_SRC =
  `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}` +
  '&components=hosted-buttons&disable-funding=venmo&currency=USD';

let sdkPromise;

export function renderSupportBlock({ compact = false } = {}) {
  const title = compact ? 'Support QuickRoom' : 'Buy me a coffee';
  const blurb = compact
    ? 'Keep temporary private rooms free and independent.'
    : 'If QuickRoom helped you coordinate, you can support the project with a coffee.';

  return `
    <section class="support-block${compact ? ' support-block-compact' : ''}" aria-label="Support QuickRoom">
      <p class="support-title">${title}</p>
      <p class="support-copy">${blurb}</p>
      <div class="paypal-button-wrap" data-paypal-support></div>
    </section>
  `;
}

export function mountPaypalSupport(root = document) {
  const nodes = [...root.querySelectorAll('[data-paypal-support]')];
  if (!nodes.length) return;

  for (const node of nodes) {
    if (PAYPAL_HOSTED_BUTTON_ID) {
      mountHostedButton(node);
    } else {
      mountBuyNowButton(node);
    }
  }
}

function mountBuyNowButton(node) {
  if (node.dataset.paypalRendered === 'buy-now') return;
  node.dataset.paypalRendered = 'buy-now';
  node.innerHTML = `
    <a class="support-coffee-button" href="${PAYPAL_BUY_NOW_URL}" target="_blank" rel="noopener noreferrer">
      Buy me a coffee with PayPal
    </a>
  `;
}

function mountHostedButton(node) {
  const mode = `hosted:${PAYPAL_HOSTED_BUTTON_ID}`;
  if (node.dataset.paypalRendered === mode) return;
  node.dataset.paypalRendered = mode;
  node.innerHTML = '';

  const containerId = `paypal-container-${PAYPAL_HOSTED_BUTTON_ID}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const container = document.createElement('div');
  container.id = containerId;
  container.className = 'paypal-hosted-button';
  node.append(container);

  ensurePaypalSdk()
    .then((paypal) => {
      if (!paypal?.HostedButtons) {
        mountBuyNowButton(node);
        return;
      }
      return paypal
        .HostedButtons({ hostedButtonId: PAYPAL_HOSTED_BUTTON_ID })
        .render(`#${containerId}`);
    })
    .catch(() => {
      mountBuyNowButton(node);
    });
}

function ensurePaypalSdk() {
  if (window.paypal?.HostedButtons) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-quickroom-paypal]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.paypal), { once: true });
      existing.addEventListener('error', () => reject(new Error('PayPal SDK failed to load.')), {
        once: true
      });
      if (window.paypal?.HostedButtons) resolve(window.paypal);
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.quickroomPaypal = 'true';
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error('PayPal SDK failed to load.'));
    document.head.append(script);
  });

  return sdkPromise;
}
