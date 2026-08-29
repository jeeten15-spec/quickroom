/** Exact Monetag snippets (verification crawlers look for these in HTML). */
export const MONETAG_VIGNETTE_SCRIPT =
  "(function(s){s.dataset.zone='11680014',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";

export const MONETAG_INPAGE_PUSH_SCRIPT =
  "(function(s){s.dataset.zone='11680018',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";

export const MONETAG_DIRECT_LINK = 'https://omg10.com/4/11680015';

/** In-page push immediately; vignette IIFE is in the HTML but runs after 1s. */
export function monetagHeadHtml() {
  return `    <script data-cfasync="false">${MONETAG_INPAGE_PUSH_SCRIPT}</script>
    <script data-cfasync="false">setTimeout(function(){${MONETAG_VIGNETTE_SCRIPT}},1000)</script>`;
}

export function monetagInpagePushHtml() {
  return `<script data-cfasync="false">${MONETAG_INPAGE_PUSH_SCRIPT}</script>`;
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
