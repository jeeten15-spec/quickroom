/** Direct-link only. Vignette and in-page push overlays intercept clicks and are not used. */
export const MONETAG_DIRECT_LINK = 'https://omg10.com/4/11680015';

export function monetagHeadHtml() {
  return '';
}

export function stripMonetagHtml(html) {
  return String(html)
    .replace(/\s*<script[^>]*>[\s\S]*?n6wxm\.com\/vignette\.min\.js[\s\S]*?<\/script>/gi, '')
    .replace(/\s*<script[^>]*>[\s\S]*?nap5k\.com\/tag\.min\.js[\s\S]*?<\/script>/gi, '');
}

export function renderSkyscraperRail(side) {
  return `<aside class="ad-rail ad-rail-${side}" aria-label="Advertisement">
      <p class="ad-label">Ad</p>
      <a class="ad-rail-direct" href="${MONETAG_DIRECT_LINK}" target="_blank" rel="sponsored nofollow noopener">
        <span class="ad-rail-size">160×600</span>
        <span>Sponsored</span>
      </a>
    </aside>`;
}
