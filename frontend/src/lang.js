import { COMMERCIAL_LANG_TRIPLETS } from './commercial-articles.js';

/** English / French / Spanish URL triplets. Unpaired English URLs fall back to locale homes. */
const TRIPLETS = [
  { en: '/', fr: '/fr', es: '/es' },
  { en: '/blog', fr: '/fr/blog', es: '/es/blog' },
  { en: '/private-chat-room-no-signup', fr: '/fr/chat-prive-sans-inscription', es: '/es/chat-privado-sin-registro' },
  { en: '/temporary-chat-room', fr: '/fr/salle-de-discussion-temporaire', es: '/es/sala-temporal' },
  { en: '/private-study-group-without-whatsapp', fr: '/fr/groupe-etude-sans-whatsapp', es: '/es' },
  { en: '/study-group-chat', fr: '/fr/groupe-etude-sans-whatsapp', es: '/es' },
  { en: '/study-group-chat-no-whatsapp', fr: '/fr/groupe-etude-sans-whatsapp', es: '/es' },
  { en: '/temporary-chat-room-for-hackathons', fr: '/fr/chat-hackathon', es: '/es' },
  { en: '/hackathon-chat-room', fr: '/fr/chat-hackathon', es: '/es' },
  { en: '/vpn-travel-group-chat', fr: '/fr/vpn-voyage', es: '/es/vpn-viaje' },
  { en: '/split-bills-housemate-chat', fr: '/fr/colocation-factures', es: '/es/facturas-piso' },
  { en: '/dating-group-chat', fr: '/fr/rendez-vous-groupe', es: '/es/cita-en-grupo' },
  { en: '/sports-watch-party-chat', fr: '/fr/soiree-foot', es: '/es/ver-el-partido' },
  ...COMMERCIAL_LANG_TRIPLETS
];

function cleanPath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

function findTriplet(path) {
  return TRIPLETS.find((row) => row.en === path || row.fr === path || row.es === path);
}

export function languageUrls(pathname) {
  const path = cleanPath(pathname);
  const row = findTriplet(path);
  if (row) {
    const current = path === row.fr ? 'fr' : path === row.es ? 'es' : 'en';
    return { ...row, current };
  }
  if (path === '/fr' || path.startsWith('/fr/')) {
    return { en: '/', fr: path, es: '/es', current: 'fr' };
  }
  if (path === '/es' || path.startsWith('/es/')) {
    return { en: '/', fr: '/fr', es: path, current: 'es' };
  }
  return { en: path, fr: '/fr', es: '/es', current: 'en' };
}

export function renderLangToggle(pathname) {
  const { en, fr, es, current } = languageUrls(pathname);
  return `<nav class="lang-toggle" aria-label="Language">
      <a href="${en}" hreflang="en" lang="en"${current === 'en' ? ' aria-current="page"' : ''}>English</a>
      <span aria-hidden="true">·</span>
      <a href="${fr}" hreflang="fr" lang="fr"${current === 'fr' ? ' aria-current="page"' : ''}>Français</a>
      <span aria-hidden="true">·</span>
      <a href="${es}" hreflang="es" lang="es"${current === 'es' ? ' aria-current="page"' : ''}>Español</a>
    </nav>`;
}

export function hreflangPairs(pathname) {
  const { en, fr, es } = languageUrls(pathname);
  const site = 'https://quickroom.org';
  const abs = (path) => `${site}${path === '/' ? '/' : path}`;
  return [
    ['en', abs(en)],
    ['fr', abs(fr)],
    ['es', abs(es)],
    ['x-default', `${site}/`]
  ];
}
