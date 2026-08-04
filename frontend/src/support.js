const PAYPAL_CLIENT_ID =
  'BAAY-NrgK6PrSduATvNMOG5HYyMLDG61OTFS_BHzyAAjJcz-1fBRRwMXmemDx03BojVXz_T_Xj9or7i3QU';

// Second half of PayPal's embed code: hostedButtonId / paypal-container-XXXX.
// Set with VITE_PAYPAL_HOSTED_BUTTON_ID at build time when available.
const PAYPAL_HOSTED_BUTTON_ID = (import.meta.env.VITE_PAYPAL_HOSTED_BUTTON_ID || '').trim();

// Reliable no-popup fallback while the hosted button id is not configured.
// Opens PayPal Donate in a new tab (hosted-buttons client ids cannot use Buttons.createOrder).
const PAYPAL_DONATE_URL =
  'https://www.paypal.com/donate/?business=Jeeten15%40gmail.com&no_recurring=0&item_name=Buy%20QuickRoom%20a%20coffee&currency_code=USD';

const SDK_SRC = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
  PAYPAL_CLIENT_ID
)}&components=hosted-buttons&disable-funding=venmo&currency=USD`;

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
      mountDonateLink(node);
    }
  }
}

function mountDonateLink(node) {
  if (node.dataset.paypalRendered === 'donate-link') return;
  node.dataset.paypalRendered = 'donate-link';
  node.innerHTML = `
    <a class="support-coffee-button" href="${PAYPAL_DONATE_URL}" target="_blank" rel="noopener noreferrer">
      Buy me a coffee with PayPal
    </a>
  `;
}

function mountHostedButton(node) {
  const mode = `hosted:${PAYPAL_HOSTED_BUTTON_ID}`;
  if (node.dataset.paypalRendered === mode) return;
  node.dataset.paypalRendered = mode;
  node.innerHTML = '';

  const containerId = `paypal-container-${PAYPAL_HOSTED_BUTTON_ID}`;
  // PayPal requires a stable container id matching the embed pattern.
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'paypal-hosted-button';
    node.append(container);
  } else if (!node.contains(container)) {
    node.append(container);
  }

  ensurePaypalSdk()
    .then((paypal) => {
      if (!paypal?.HostedButtons) {
        mountDonateLink(node);
        return;
      }
      return paypal
        .HostedButtons({ hostedButtonId: PAYPAL_HOSTED_BUTTON_ID })
        .render(`#${containerId}`);
    })
    .catch(() => {
      mountDonateLink(node);
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
