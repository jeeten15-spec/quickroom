/** IAB display frames. Monetag vignette/IPP cannot be sized into these boxes. */
export const MONETAG_DIRECT_LINK = 'https://omg10.com/4/11680015';
export const MONETAG_IPP_ZONE = '11680018';
export const MONETAG_IPP_SRC = 'https://nap5k.com/tag.min.js';
export const MONETAG_VIGNETTE_ZONE = '11680014';
export const MONETAG_VIGNETTE_SRC = 'https://n6wxm.com/vignette.min.js';

export function monetagHeadHtml() {
  return '';
}

const IAB = {
  leader: { w: 728, h: 90, label: '728×90' },
  sky: { w: 160, h: 600, label: '160×600' },
  box: { w: 300, h: 250, label: '300×250' },
  mobile: { w: 320, h: 50, label: '320×50' }
};

export function renderIabSlot(kind, extraClass = '') {
  const spec = IAB[kind];
  if (!spec) return '';
  const ipp = kind === 'box' ? ' data-ipp-host' : '';
  return `<aside class="iab-slot iab-slot-${kind} ${extraClass}" data-iab="${kind}"${ipp} aria-label="Advertisement">
      <span class="iab-slot-label">Advertisement</span>
      <span class="iab-slot-size">${spec.label}</span>
    </aside>`;
}

export function renderAdLeaderboard() {
  return `<div class="iab-row iab-row-leader">${renderIabSlot('leader')}</div>`;
}

export function renderAdFooter() {
  return `<div class="iab-row iab-row-footer">${renderIabSlot('mobile')}</div>`;
}

export function renderAdSkyscraper(side) {
  return `<div class="iab-rail iab-rail-${side}">
      ${renderIabSlot('sky', 'iab-desktop')}
      ${renderIabSlot('box', 'iab-mobile')}
    </div>`;
}

export function renderSkyscraperRail(side) {
  return renderAdSkyscraper(side);
}
