const PAYPAL_COFFEE_URL = 'https://www.paypal.com/ncp/payment/2LXYCDN3RBW44';

export function renderSupportBlock({ compact = false } = {}) {
  const title = compact ? 'Support QuickRoom' : 'Buy me a coffee';
  const blurb = compact
    ? 'Keep temporary private rooms free and independent.'
    : 'If QuickRoom helped you coordinate, you can support the project with a coffee.';

  return `
    <section class="support-block${compact ? ' support-block-compact' : ''}" aria-label="Support QuickRoom">
      <p class="support-title">${title}</p>
      <p class="support-copy">${blurb}</p>
      <div class="paypal-button-wrap" data-paypal-support>
        <a class="support-coffee-button" href="${PAYPAL_COFFEE_URL}" target="_blank" rel="noopener noreferrer">
          Buy me a coffee with PayPal
        </a>
      </div>
    </section>
  `;
}

export function mountPaypalSupport() {
  // Payment link is rendered directly in HTML; nothing async to mount.
}
