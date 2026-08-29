/** Direct-link only. No vignette, in-page push, or OnClick. */
export const MONETAG_DIRECT_LINK = 'https://omg10.com/4/11680015';

export function monetagHeadHtml() {
  return '';
}

export function stripMonetagHtml(html) {
  return String(html)
    .replace(/\s*<script[^>]*>[\s\S]*?n6wxm\.com\/vignette\.min\.js[\s\S]*?<\/script>/gi, '')
    .replace(/\s*<script[^>]*>[\s\S]*?nap5k\.com\/tag\.min\.js[\s\S]*?<\/script>/gi, '');
}

function adLink(className, sizeLabel, extra = '') {
  return `<a class="ad-unit-link ${className}" href="${MONETAG_DIRECT_LINK}" target="_blank" rel="sponsored nofollow noopener">
      <span class="ad-unit-kicker">Advertisement · ${sizeLabel}</span>
      <strong class="ad-unit-headline">Sponsored offer</strong>
      <span class="ad-unit-cta">Open${extra}</span>
    </a>`;
}

export function renderAdLeaderboard() {
  return `<aside class="ad-unit ad-unit-leaderboard" aria-label="Advertisement">${adLink(
    'ad-unit-link-leader',
    '728×90'
  )}</aside>`;
}

export function renderAdFooter() {
  return `<aside class="ad-unit ad-unit-footer" aria-label="Advertisement">${adLink(
    'ad-unit-link-footer',
    '320×50'
  )}</aside>`;
}

export function renderAdSkyscraper(side) {
  return `<aside class="ad-unit ad-unit-rail ad-unit-rail-${side}" aria-label="Advertisement">${adLink(
    'ad-unit-link-rail',
    '160×600'
  )}</aside>`;
}

/** @deprecated use renderAdSkyscraper */
export function renderSkyscraperRail(side) {
  return renderAdSkyscraper(side);
}
