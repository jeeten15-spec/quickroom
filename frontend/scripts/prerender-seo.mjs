import { cp, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const SITE = 'https://quickroom.org';

const { useCasePages, coordinationJobs } = await import(
  pathToFileURL(path.join(root, 'src/use-cases.js')).href
);
const { guides } = await import(pathToFileURL(path.join(root, 'src/guides.js')).href);
const { articles } = await import(pathToFileURL(path.join(root, 'src/articles.js')).href);
const { legalPages } = await import(pathToFileURL(path.join(root, 'src/legal.js')).href);
const { frPages } = await import(pathToFileURL(path.join(root, 'src/fr-pages.js')).href);
const { renderRelatedHtml } = await import(pathToFileURL(path.join(root, 'src/related.js')).href);
const {
  SITE_AUTHOR,
  homeFaq,
  jsonLdPerson,
  renderAboutEditorial,
  renderAuthorByline,
  renderComparisonTable,
  renderContentSections,
  renderLandingEditorial
} = await import(pathToFileURL(path.join(root, 'src/editorial.js')).href);
const { monetagHeadHtml, renderAdFooter, renderAdLeaderboard, renderAdSkyscraper, renderIabSlot, renderNativeBanner, MONETAG_DIRECT_LINK } =
  await import(pathToFileURL(path.join(root, 'src/monetag-tags.js')).href);
const { adsenseHeadHtml, ADSENSE_ADS_TXT } = await import(
  pathToFileURL(path.join(root, 'src/adsense.js')).href
);
const { renderLangToggle, hreflangPairs } = await import(
  pathToFileURL(path.join(root, 'src/lang.js')).href
);
const { renderExtrasHtml, defaultFaq } = await import(
  pathToFileURL(path.join(root, 'src/page-copy.js')).href
);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSections(sections, { orderedLists = false } = {}) {
  return renderContentSections(sections, escapeHtml, { orderedLists });
}

function relatedLinks(currentRoute) {
  return renderRelatedHtml(currentRoute, { escapeHtml, navigate: false });
}

function bodyUseCase(slug, page) {
  return `<article class="info-page use-case-page">
      <a class="back-link" href="/">QuickRoom</a>
      <p class="eyebrow">QuickRoom use case</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="use-case-intro">${escapeHtml(page.intro)}</p>
      <p>${escapeHtml(page.description)}</p>
      <p><a href="/">Create a temporary room on QuickRoom</a> — no signup, app, or phone number required.</p>
      ${renderIabSlot('box')}
      ${renderSections(page.sections)}
      ${renderExtrasHtml(page.title, { escapeHtml })}
      ${relatedLinks(`/${slug}`)}
    </article>`;
}

function bodyLegal(slug, page) {
  return `<article class="info-page legal-page">
      <a class="back-link" href="/">QuickRoom</a>
      <p class="eyebrow">Legal</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="use-case-intro">${escapeHtml(page.description)}</p>
      <p>Last updated 9 September 2026</p>
      ${page.sections
        .map(
          (section) =>
            `<section><h2>${escapeHtml(section.heading)}</h2>${(section.paragraphs || [])
              .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
              .join('')}</section>`
        )
        .join('')}
      <p><a href="/cookies">Cookies</a> · <a href="/privacy-choices">Privacy choices</a> · <a href="/">QuickRoom</a></p>
    </article>`;
}

function bodyFrench(slug, page) {
  if (page.isLanding) {
    return `<section lang="fr">
      <h1>QuickRoom</h1>
      <p>${escapeHtml(page.intro)}</p>
      <p>${escapeHtml(page.description)}</p>
      ${renderIabSlot('box')}
      <p><a href="/">Créer une salle</a></p>
      <h2>Usages</h2>
      <ul>${page.jobs
        .map(
          (job) =>
            `<li><a href="${escapeHtml(job.href)}">${escapeHtml(job.label)}</a> — ${escapeHtml(job.blurb)}</li>`
        )
        .join('')}</ul>
      ${relatedLinks('/fr')}
    </section>`;
  }
  return `<article class="info-page use-case-page" lang="fr">
      <a class="back-link" href="/fr">QuickRoom FR</a>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="use-case-intro">${escapeHtml(page.intro)}</p>
      <p>${escapeHtml(page.description)}</p>
      <p><a href="/">Créer une salle</a></p>
      ${renderIabSlot('box')}
      ${renderSections(page.sections)}
      ${relatedLinks(`/${slug}`)}
    </article>`;
}

function bodyGuide(slug, page) {
  return `<article class="info-page guide-page">
      <a class="back-link" href="/">QuickRoom</a>
      <p class="eyebrow">Practical guide</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="use-case-intro">${escapeHtml(page.intro)}</p>
      <p>${escapeHtml(page.description)}</p>
      ${renderIabSlot('box')}
      ${renderSections(page.sections, { orderedLists: true })}
      ${renderExtrasHtml(page.title, { escapeHtml, orderedHowTo: true })}
      <p><a href="/">Open QuickRoom</a> to create a room when you are ready.</p>
      ${relatedLinks(`/${slug}`)}
    </article>`;
}

function bodyArticle(slug, page) {
  return `<article class="info-page article-page">
      <a class="back-link" href="/blog">QuickRoom Blog</a>
      <p class="eyebrow">Walkthrough</p>
      <h1>${escapeHtml(page.title)}</h1>
      ${renderAuthorByline(escapeHtml, page.updatedAt || page.publishedAt)}
      <p class="use-case-intro">${escapeHtml(page.intro)}</p>
      ${renderIabSlot('box')}
      ${renderSections(page.sections)}
      ${renderExtrasHtml('a QuickRoom temporary chat', { escapeHtml })}
      <p><a href="/">Create a private temporary room</a></p>
      ${relatedLinks(`/${slug}`)}
    </article>`;
}

function bodyAbout() {
  return `<article class="info-page">
      <a class="back-link" href="/">QuickRoom</a>
      ${renderAboutEditorial(escapeHtml)}
      <p class="sponsored-link"><a href="${MONETAG_DIRECT_LINK}" rel="sponsored nofollow noopener">Sponsored offer</a> — optional, not required to create or join a room.</p>
      ${relatedLinks('/about')}
    </article>`;
}

function bodyBlog() {
  const articleLinks = Object.entries(articles)
    .map(
      ([slug, page]) =>
        `<li>
          <a href="/${escapeHtml(slug)}">${escapeHtml(page.title)}</a>
          <span> — ${escapeHtml(page.updatedAt || page.publishedAt)} · ${escapeHtml(page.author || SITE_AUTHOR.name)}</span>
          <p>${escapeHtml(page.description)}</p>
        </li>`
    )
    .join('');
  return `<article class="info-page">
      <a class="back-link" href="/">QuickRoom</a>
      <p class="eyebrow">Editorial</p>
      <h1>How QuickRoom actually works</h1>
      ${renderAuthorByline(escapeHtml, '9 September 2026')}
      <h2>Articles</h2>
      <ul class="blog-index">${articleLinks}</ul>
      ${renderIabSlot('box')}
      <h2>Comparison snapshot</h2>
      <p>Full notes live in <a href="/blog/quickroom-vs-discord-whatsapp-slack">QuickRoom vs WhatsApp, Discord, and Slack</a>. The table is the same one on the homepage so we do not maintain two stories.</p>
      ${renderComparisonTable(escapeHtml)}
      <h2>Practical setup guides</h2>
      <ul>
        <li><a href="/private-study-group-without-whatsapp">How to start a private study group without WhatsApp</a></li>
        <li><a href="/temporary-chat-room-for-hackathons">A temporary chat room for hackathons</a></li>
        <li><a href="/short-lived-event-backchannel">How to run a short-lived event backchannel</a></li>
      </ul>
      <p>Product questions: <a href="mailto:${escapeHtml(SITE_AUTHOR.email)}">${escapeHtml(SITE_AUTHOR.email)}</a>. <a href="/about">About</a>.</p>
      ${relatedLinks('/blog')}
    </article>`;
}

function bodyHome() {
  const jobs = (coordinationJobs || [])
    .map((job) => {
      const href = job.href || job.path || (job.slug ? `/${job.slug}` : null);
      const label = job.title || job.name || job.label;
      if (!href || !label) return '';
      return `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a>${
        job.blurb || job.description ? ` — ${escapeHtml(job.blurb || job.description)}` : ''
      }</li>`;
    })
    .filter(Boolean)
    .join('');

  return `<main class="landing landing-content">
      <h1>QuickRoom</h1>
      <p>A named chat room you create, share as a link, and let expire. Nickname only — no account.</p>
      <p>18+ text chat in the browser. Not a video lounge, not a K–12 classroom product.</p>
      <p><a href="/about">About QuickRoom</a> · <a href="/blog">How it works</a></p>
      <section class="public-rooms" aria-labelledby="public-rooms-title">
        <h2 id="public-rooms-title">Public topic rooms</h2>
        <p>The three newest public rooms appear here after the page loads so the homepage stays readable as the list grows. Older public rooms open under a control named User Created Rooms. Private rooms never appear in that list — share those with a link.</p>
      </section>
      ${renderLandingEditorial(escapeHtml)}
      ${jobs ? `<h2>Exact jobs QuickRoom is built for</h2><p>Each link is a specific coordination job. Templates on create are title shortcuts for these jobs.</p><ul>${jobs}</ul>` : ''}
    </main>`;
}

const pages = [
  {
    route: '/',
    file: 'index.html',
    title: 'QuickRoom — named chat rooms with a shareable link',
    description:
      'Create a named browser chat room, share /?room=…, and let it expire. Nickname only. 18+ text chat — not video matching, not K–12.',
    body: bodyHome(),
    noAds: false,
    railCount: 5,
    native: false,
    faq: homeFaq(),
    person: true
  },
  {
    route: '/about',
    file: 'about.html',
    title: 'About QuickRoom — who builds it and what we will not add',
    description:
      'Jeets builds QuickRoom. Named rooms, 18+ only, no K–12, no stranger video. Code on GitHub, contact feedback@quickroom.org.',
    body: bodyAbout(),
    noAds: true,
    noAdSense: true,
    person: true
  },
  {
    route: '/blog',
    file: 'blog.html',
    title: 'How QuickRoom actually works — walkthroughs and comparison',
    description:
      'Product walkthroughs with screenshots, a comparison table versus WhatsApp, Discord, and Slack, and the private vs public listing rule.',
    body: bodyBlog(),
    railCount: 4,
    faq: homeFaq(),
    person: true
  },
  ...Object.entries(useCasePages).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description,
    body: bodyUseCase(slug, page),
    faq: defaultFaq(page.title),
    railCount: 4
  })),
  ...Object.entries(guides).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description,
    body: bodyGuide(slug, page),
    faq: defaultFaq(page.title)
  })),
  ...Object.entries(articles).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description,
    body: bodyArticle(slug, page),
    faq: defaultFaq('a QuickRoom temporary chat'),
    lang: 'en',
    person: true,
    article: {
      headline: page.title,
      description: page.description,
      datePublished: page.publishedAt,
      dateModified: page.updatedAt || page.publishedAt
    }
  })),
  ...Object.entries(legalPages).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description,
    body: bodyLegal(slug, page),
    lang: page.htmlLang || 'en',
    railCount: slug === 'privacy' ? 3 : slug === 'privacy-choices' ? 2 : 1
  })),
  ...Object.entries(frPages).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle || page.title,
    description: page.description,
    body: bodyFrench(slug, page),
    lang: 'fr',
    noAds: false,
    railCount: page.isLanding ? 2 : 1
  }))
];

const indexHtml = await readFile(path.join(distDir, 'index.html'), 'utf8');
const scriptMatch = indexHtml.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const cssMatches = [...indexHtml.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];

if (!scriptMatch) {
  throw new Error('Could not find the Vite module script in dist/index.html');
}

const assetTags = [
  ...cssMatches.map((match) => `<link rel="stylesheet" crossorigin href="${match[1]}">`),
  `<script type="module" crossorigin src="${scriptMatch[1]}"></script>`
].join('\n    ');

function gscMeta() {
  const token = process.env.VITE_GOOGLE_SITE_VERIFICATION || '';
  if (!token) return '';
  return `<meta name="google-site-verification" content="${escapeHtml(token)}" />`;
}

function wrapAds(body, { rails = 1, native = true } = {}) {
  return `${renderAdLeaderboard()}
    <div class="ads-page-row has-ad-rails">
      ${renderAdSkyscraper('left', rails)}
      <div class="ads-page-main">${native ? renderNativeBanner() : ''}${body}</div>
      ${renderAdSkyscraper('right', rails)}
    </div>
    ${renderAdFooter()}`;
}

function hreflangTags(route) {
  return hreflangPairs(route)
    .map(([lang, href]) => `<link rel="alternate" hreflang="${escapeHtml(lang)}" href="${escapeHtml(href)}" />`)
    .join('\n    ');
}

function renderHtml(page, { noindex = false } = {}) {
  const canonical = `${SITE}${page.route === '/' ? '/' : page.route}`;
  const robots = noindex ? 'noindex, follow' : 'index, follow';
  const graph = [
    {
      '@type': 'WebPage',
      name: page.title,
      description: page.description,
      url: canonical,
      isPartOf: { '@type': 'WebSite', name: 'QuickRoom', url: SITE }
    }
  ];
  if (page.person) {
    graph.push(jsonLdPerson());
  }
  if (page.article) {
    graph.push({
      '@type': 'Article',
      headline: page.article.headline,
      description: page.article.description,
      datePublished: page.article.datePublished,
      dateModified: page.article.dateModified,
      author: jsonLdPerson(),
      publisher: {
        '@type': 'Organization',
        name: 'QuickRoom',
        url: SITE
      },
      mainEntityOfPage: canonical
    });
  }
  if (page.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    });
  }
  const schema = { '@context': 'https://schema.org', '@graph': graph };

  return `<!doctype html>
<html lang="${escapeHtml(page.lang || 'en')}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#FAFAFA" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="${robots}" />
    ${gscMeta()}
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    ${hreflangTags(page.route)}
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="QuickRoom" />
    <link rel="manifest" href="/manifest.webmanifest" />
    ${page.noAdSense ? '' : adsenseHeadHtml()}
    <script>if (new URLSearchParams(location.search).get('room')) document.documentElement.classList.add('chat-boot');</script>
    ${page.noMonetag ? '' : monetagHeadHtml()}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    ${assetTags}
  </head>
  <body>
    <div id="app">${renderLangToggle(page.route)}${
      page.noAds ? page.body || '' : wrapAds(page.body || '', { rails: page.railCount ?? 1, native: page.native !== false })
    }</div>
  </body>
</html>
`;
}

const redirectLines = [
  '# Canonical host is also handled in Cloudflare Redirect Rules (www -> apex).',
  '# Trailing-slash SEO pages -> extensionless paths.',
  '# .html pretty-URL aliases -> extensionless canonicals.'
];

for (const page of pages) {
  if (page.route === '/') continue;
  redirectLines.push(`${page.route}/ ${page.route} 301`);
  redirectLines.push(`${page.route}.html ${page.route} 301`);
}

redirectLines.push('');
redirectLines.push('/dashboard/ /dashboard 301');
await writeFile(path.join(distDir, '_redirects'), `${redirectLines.join('\n')}\n`);

for (const page of pages) {
  const target = path.join(distDir, page.file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, renderHtml(page));
}

// SPA shell kept for /room/* — noindex so ephemeral rooms are not indexed.
const spaShell = renderHtml(
  {
    route: '/',
    title: 'QuickRoom — named chat rooms with a shareable link',
    description:
      'Create a named browser chat room, share /?room=…, and let it expire. Nickname only. 18+ text chat — not video matching, not K–12.',
    body: bodyHome(),
    noAds: false,
    railCount: 5,
    native: false
  },
  { noindex: false }
);
// Overwrite index with crawlable home (already written above via pages loop).
// Dedicated dashboard page (noindex).
await writeFile(
  path.join(distDir, 'dashboard.html'),
  renderHtml(
    {
      route: '/dashboard',
      title: 'QuickRoom Dashboard — Growth Metrics',
      description: 'Operator metrics for QuickRoom room creation, joining, and sharing.',
      body: `<article class="info-page dashboard-page"><h1>Growth dashboard</h1><p>This operator dashboard requires JavaScript and is not part of the public index.</p><p><a href="/">Back to QuickRoom</a></p></article>`,
      noMonetag: true,
      noAds: true
    },
    { noindex: true }
  )
);

await writeFile(
  path.join(distDir, '404.html'),
  renderHtml(
    {
      route: '/404',
      title: 'Page not found | QuickRoom',
      description: 'This QuickRoom page does not exist.',
      body: `<main><h1>Page not found</h1><p>That URL is not a public QuickRoom page.</p><p><a href="/">Go to QuickRoom</a> · <a href="/blog">Blog</a> · <a href="/about">About</a></p></main>`,
      noMonetag: true,
      noAds: true
    },
    { noindex: true }
  ).replace(
    `<link rel="canonical" href="${SITE}/404" />`,
    ''
  )
);

// Keep a copy of the Vite SPA shell for room rewrites: rooms need empty-app boot OR home content that JS replaces.
// Using the crawlable home as /index.html is fine; room view JS replaces #app after boot.
void spaShell;

await writeFile(
  path.join(distDir, '_headers'),
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/ads.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=300, must-revalidate
  Access-Control-Allow-Origin: *

/sw.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: no-cache
  Service-Worker-Allowed: /

/dashboard
  X-Robots-Tag: noindex, nofollow

/dashboard.html
  X-Robots-Tag: noindex, nofollow

/404
  X-Robots-Tag: noindex, nofollow

/404.html
  X-Robots-Tag: noindex, nofollow
`
);

const lastmod = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map((page) => {
    const loc = `${SITE}${page.route === '/' ? '/' : page.route}`;
    const xhtml = hreflangPairs(page.route)
      .map(([lang, href]) => `      <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`)
      .join('\n');
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
${xhtml}
  </url>`;
  })
  .join('\n')}
</urlset>
`;
await writeFile(path.join(distDir, 'sitemap.xml'), sitemap);
await writeFile(path.join(root, 'public/sitemap.xml'), sitemap);

await writeFile(path.join(distDir, 'ads.txt'), ADSENSE_ADS_TXT);
await writeFile(path.join(root, 'public/ads.txt'), ADSENSE_ADS_TXT);

try {
  await cp(path.join(root, 'functions'), path.join(distDir, 'functions'), { recursive: true });
} catch {
  /* no Pages Functions in this build */
}
for (const leftover of ['room.html', 'chat-shell.html']) {
  await unlink(path.join(distDir, leftover)).catch(() => {});
}
await writeFile(
  path.join(distDir, '_routes.json'),
  `${JSON.stringify({ version: 1, include: ['/ads.txt'], exclude: [] }, null, 2)}\n`
);

console.log(`Prerendered ${pages.length} SEO HTML files, sitemap, dashboard/404 shells, _redirects, and _headers.`);
