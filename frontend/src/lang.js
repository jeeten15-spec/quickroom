/** English ↔ French page pairs. Other English URLs fall back to /fr (French home). */
const PAIRS = [
  ['/', '/fr'],
  ['/private-chat-room-no-signup', '/fr/chat-prive-sans-inscription'],
  ['/temporary-chat-room', '/fr/salle-de-discussion-temporaire'],
  ['/private-study-group-without-whatsapp', '/fr/groupe-etude-sans-whatsapp'],
  ['/study-group-chat', '/fr/groupe-etude-sans-whatsapp'],
  ['/study-group-chat-no-whatsapp', '/fr/groupe-etude-sans-whatsapp'],
  ['/temporary-chat-room-for-hackathons', '/fr/chat-hackathon'],
  ['/hackathon-chat-room', '/fr/chat-hackathon']
];

function cleanPath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

export function languageUrls(pathname) {
  const path = cleanPath(pathname);
  const pair = PAIRS.find(([en, fr]) => path === en || path === fr);
  if (pair) {
    return {
      en: pair[0],
      fr: pair[1],
      current: path === pair[1] ? 'fr' : 'en'
    };
  }
  if (path === '/fr' || path.startsWith('/fr/')) {
    return { en: '/', fr: path, current: 'fr' };
  }
  return { en: path, fr: '/fr', current: 'en' };
}

export function renderLangToggle(pathname) {
  const { en, fr, current } = languageUrls(pathname);
  return `<nav class="lang-toggle" aria-label="Language">
      <a href="${en}" hreflang="en" lang="en"${current === 'en' ? ' aria-current="page"' : ''}>English</a>
      <span aria-hidden="true">·</span>
      <a href="${fr}" hreflang="fr" lang="fr"${current === 'fr' ? ' aria-current="page"' : ''}>Français</a>
    </nav>`;
}

export function hreflangPairs(pathname) {
  const { en, fr } = languageUrls(pathname);
  const site = 'https://quickroom.org';
  const enUrl = `${site}${en === '/' ? '/' : en}`;
  const frUrl = `${site}${fr}`;
  return [
    ['en', enUrl],
    ['fr', frUrl],
    ['x-default', `${site}/`]
  ];
}
