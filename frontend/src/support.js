const PAYPAL_CLIENT_ID =
  'BAAY-NrgK6PrSduATvNMOG5HYyMLDG61OTFS_BHzyAAjJcz-1fBRRwMXmemDx03BojVXz_T_Xj9or7i3QU';

// Optional: second half of PayPal's embed code (paypal-container-XXXX / hostedButtonId).
const PAYPAL_HOSTED_BUTTON_ID = (import.meta.env.VITE_PAYPAL_HOSTED_BUTTON_ID || '').trim();

const SDK_SRC = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
  PAYPAL_CLIENT_ID
)}&components=hosted-buttons,buttons&disable-funding=venmo&currency=USD`;

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

  ensurePaypalSdk()
    .then((paypal) => {
      for (const node of nodes) {
        renderPaypalButton(paypal, node);
      }
    })
    .catch(() => {
      for (const node of nodes) {
        node.innerHTML =
          '<p class="support-fallback">PayPal is temporarily unavailable. Please try again later.</p>';
      }
    });
}

function ensurePaypalSdk() {
  if (window.paypal?.Buttons || window.paypal?.HostedButtons) {
    return Promise.resolve(window.paypal);
  }
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-quickroom-paypal]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.paypal), { once: true });
      existing.addEventListener('error', () => reject(new Error('PayPal SDK failed to load.')), {
        once: true
      });
      if (window.paypal) resolve(window.paypal);
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

function renderPaypalButton(paypal, node) {
  const mode = PAYPAL_HOSTED_BUTTON_ID ? `hosted:${PAYPAL_HOSTED_BUTTON_ID}` : 'coffee-buttons';
  if (node.dataset.paypalRendered === mode) return;

  node.innerHTML = '';
  node.dataset.paypalRendered = mode;

  if (PAYPAL_HOSTED_BUTTON_ID && paypal.HostedButtons) {
    const containerId = `paypal-container-${PAYPAL_HOSTED_BUTTON_ID}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const container = document.createElement('div');
    container.id = containerId;
    container.className = 'paypal-hosted-button';
    node.append(container);
    paypal
      .HostedButtons({ hostedButtonId: PAYPAL_HOSTED_BUTTON_ID })
      .render(`#${containerId}`)
      .catch(() => renderCoffeeButtons(paypal, node));
    return;
  }

  renderCoffeeButtons(paypal, node);
}

function renderCoffeeButtons(paypal, node) {
  if (!paypal?.Buttons) {
    node.innerHTML =
      '<p class="support-fallback">PayPal button could not load. Please check back shortly.</p>';
    return;
  }

  const container = document.createElement('div');
  container.className = 'paypal-hosted-button';
  node.append(container);

  paypal
    .Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'paypal',
        height: 42
      },
      createOrder(_data, actions) {
        return actions.order.create({
          purchase_units: [
            {
              description: 'Buy QuickRoom a coffee',
              amount: {
                currency_code: 'USD',
                value: '5.00'
              }
            }
          ]
        });
      }
    })
    .render(container)
    .catch(() => {
      node.innerHTML =
        '<p class="support-fallback">Unable to load the PayPal button right now.</p>';
    });
}
