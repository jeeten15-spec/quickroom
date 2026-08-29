import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
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
const { monetagHeadHtml, stripMonetagHtml, renderAdFooter, renderAdLeaderboard, renderAdSkyscraper } = await import(
  pathToFileURL(path.join(root, 'src/monetag-tags.js')).href
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
  return sections
    .map((section) => {
      const paragraphs = (section.paragraphs || [])
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');
      const listTag = orderedLists ? 'ol' : 'ul';
      const list = section.list
        ? `<${listTag}>${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${listTag}>`
        : '';
      return `<section><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${list}</section>`;
    })
    .join('');
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
      <p>Last updated 28 August 2026</p>
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
      ${renderSections(page.sections, { orderedLists: true })}
      ${renderExtrasHtml(page.title, { escapeHtml, orderedHowTo: true })}
      <p><a href="/">Open QuickRoom</a> to create a room when you are ready.</p>
      ${relatedLinks(`/${slug}`)}
    </article>`;
}

function bodyArticle(slug, page) {
  return `<article class="info-page article-page">
      <a class="back-link" href="/blog">QuickRoom Blog</a>
      <p class="eyebrow">QuickRoom guide</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="article-date">${escapeHtml(page.publishedAt)}</p>
      <p class="use-case-intro">${escapeHtml(page.intro)}</p>
      <p>${escapeHtml(page.description)}</p>
      ${renderSections(page.sections)}
      ${renderExtrasHtml('a QuickRoom temporary chat', { escapeHtml })}
      <p><a href="/">Create a private temporary room</a></p>
      ${relatedLinks(`/${slug}`)}
    </article>`;
}

function bodyAbout() {
  return `<article class="info-page">
      <a class="back-link" href="/">QuickRoom</a>
      <h1>About QuickRoom</h1>
      <p>QuickRoom was created with a simple belief: <strong>technology should remove friction—not create it.</strong></p>
      <p>Every day, people need a quick place to collaborate, ask questions, solve problems, or talk. Most tools still ask for accounts, phone verification, app installs, and permanent groups before the conversation begins.</p>
      <p>QuickRoom makes starting a conversation as simple as opening a web page: create a temporary private room, share a room code, and talk in the browser without handing over a phone number or email address.</p>
      <h2>Our mission</h2>
      <p>Build the simplest, fastest, and most respectful collaboration platform on the web—no unnecessary barriers, no complicated setup, just meaningful conversations that can end when the moment ends.</p>
      <h2>Our story</h2>
      <p>QuickRoom began with a practical observation: a five-minute coordination thread should not require a permanent workspace. Students, families, event volunteers, freelancers, and short-term teams kept creating groups they did not want to keep forever.</p>
      <p>We built a browser-first room that can expire after an hour, a day, a week, or up to three months—so the tool matches the lifespan of the work.</p>
      <h2>Our principles</h2>
      <ul>
        <li><strong>Simplicity</strong> — prefer one step over five.</li>
        <li><strong>Privacy</strong> — people should not need personal details just to talk.</li>
        <li><strong>Respect</strong> — keep the product welcoming and intentional.</li>
        <li><strong>Accessibility</strong> — keep the core experience free and lightweight in the browser.</li>
      </ul>
      <h2>What you can use QuickRoom for</h2>
      <p>Study groups, hackathon teams, interview panels, book clubs, classroom backchannels, travel planning, freelance client handoffs, workshop Q&amp;A, meetup organiser chat, and other short-lived coordination jobs.</p>
      <h2>Looking ahead</h2>
      <p>QuickRoom starts with temporary chat and is growing into a browser-first collaboration toolkit for study, events, client handoffs, and short-lived teamwork—without turning every conversation into another permanent account.</p>
      ${renderExtrasHtml('QuickRoom', { escapeHtml })}
      ${relatedLinks('/about')}
    </article>`;
}

function bodyBlog() {
  const guideLinks = Object.entries(guides)
    .map(([slug, page]) => `<li><a href="/${escapeHtml(slug)}">${escapeHtml(page.title)}</a> — ${escapeHtml(page.description)}</li>`)
    .join('');
  const articleLinks = Object.entries(articles)
    .map(([slug, page]) => `<li><a href="/${escapeHtml(slug)}">${escapeHtml(page.title)}</a> — ${escapeHtml(page.description)}</li>`)
    .join('');
  const useCaseLinks = Object.entries(useCasePages)
    .slice(0, 10)
    .map(([slug, page]) => `<li><a href="/${escapeHtml(slug)}">${escapeHtml(page.title)}</a></li>`)
    .join('');
  return `<article class="info-page">
      <a class="back-link" href="/">QuickRoom</a>
      <h1>QuickRoom Blog — Free Chat Rooms & Private Temporary Chat</h1>
      <p>Looking for free chat rooms, online chat rooms, a private chat room without signup, anonymous chat, group chat, a temporary chat room, chatroom, text chat, live chat, or a way to chat online free without another app? QuickRoom is a browser-based temporary room: create it, share a code, talk, let it expire.</p>
      <h2>What is QuickRoom?</h2>
      <p>QuickRoom is the fastest way to create a private chat room: no registration, no phone number, no email, and no app. Create a room, share the link or code, and start talking. Rooms expire after the duration you choose.</p>
      <h2>Why temporary rooms matter</h2>
      <p>WhatsApp groups, Discord servers, and Slack workspaces are useful—but they often outlive the conversation. A temporary room is better when the discussion has a natural end: an assignment, a sprint, an event shift, a trip, or a one-off client handoff.</p>
      <h2>Built for temporary collaboration</h2>
      <p>Use QuickRoom for study groups, exam preparation, coding help, project discussions, book clubs, family planning, event coordination, interview panels, and short support conversations—free chat rooms and online chat rooms that do not require signup.</p>
      <h2>Articles &amp; practical guides</h2>
      <ul>${articleLinks}${guideLinks}</ul>
      <h2>Exact jobs QuickRoom is built for</h2>
      <ul>${(coordinationJobs || [])
        .map(
          (job) =>
            `<li><a href="${escapeHtml(job.href)}">${escapeHtml(job.label)}</a> — ${escapeHtml(job.blurb)}</li>`
        )
        .join('')}</ul>
      <h2>Popular use cases</h2>
      <ul>${useCaseLinks}</ul>
      <p><a href="/">Create a room on QuickRoom</a> · <a href="/about">About QuickRoom</a></p>
      ${renderExtrasHtml('QuickRoom', { escapeHtml })}
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

  const useCaseList = Object.entries(useCasePages)
    .map(
      ([slug, page]) =>
        `<li><a href="/${escapeHtml(slug)}">${escapeHtml(page.title)}</a> — ${escapeHtml(page.description)}</li>`
    )
    .join('');

  const guideList = Object.entries(guides)
    .map(
      ([slug, page]) =>
        `<li><a href="/${escapeHtml(slug)}">${escapeHtml(page.title)}</a> — ${escapeHtml(page.description)}</li>`
    )
    .join('');

  return `<main>
      <h1>QuickRoom</h1>
      <p>Free private chat rooms for temporary coordination—study groups, events, clients, travel. No signup.</p>
      <p>Create an online chat room. Share a room code, link, or QR. Chat online free as text chat / live chat / group chat in the browser, then let the chatroom expire.</p>
      <p>Searches we built for: private chat room without signup, free chat rooms, online chat rooms, anonymous chat, temporary chat room, chatroom, chat online free, webchat.</p>
      <p><a href="/about">About QuickRoom</a> · <a href="/blog">Blog</a></p>
      ${jobs ? `<h2>Exact jobs QuickRoom is built for</h2><p>Private chat rooms, free chat rooms, online chat rooms, group chat, and temporary chatrooms—without signup.</p><ul>${jobs}</ul>` : ''}
      <h2>Use cases</h2>
      <ul>${useCaseList}</ul>
      <h2>Guides</h2>
      <ul>${guideList}</ul>
    </main>`;
}

const pages = [
  {
    route: '/',
    file: 'index.html',
    title: 'QuickRoom — Free Private Chat Rooms Online, No Signup',
    description:
      'Create a free private chat room or temporary online chat room without signup. Group chat, text chat, and live chat in the browser—no app or phone number.',
    body: bodyHome()
  },
  {
    route: '/about',
    file: 'about.html',
    title: 'About QuickRoom — Private Temporary Chat Rooms, No Signup',
    description:
      'Why QuickRoom exists: free private chat rooms, temporary chat rooms, and online chat without accounts, apps, or phone numbers.',
    body: bodyAbout()
  },
  {
    route: '/blog',
    file: 'blog.html',
    title: 'QuickRoom Blog — Free Chat Rooms, Anonymous Chat, No Signup',
    description:
      'Guides to private chat rooms without signup, free online chat rooms, anonymous group chat, and temporary chatrooms on QuickRoom.',
    body: bodyBlog()
  },
  ...Object.entries(useCasePages).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description,
    body: bodyUseCase(slug, page),
    faq: defaultFaq(page.title)
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
    lang: 'en'
  })),
  ...Object.entries(legalPages).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description,
    body: bodyLegal(slug, page),
    lang: page.htmlLang || 'en'
  })),
  ...Object.entries(frPages).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle || page.title,
    description: page.description,
    body: bodyFrench(slug, page),
    lang: 'fr'
  }))
];

const indexHtml = await readFile(path.join(distDir, 'index.html'), 'utf8');
await writeFile(
  path.join(distDir, 'chat-shell.html'),
  stripMonetagHtml(indexHtml).replace(
    '</head>',
    '    <meta name="robots" content="noindex, nofollow" />\n  </head>'
  )
);
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

function wrapAds(body) {
  return `${renderAdLeaderboard()}
    <div class="ads-page-row">
      ${renderAdSkyscraper('left')}
      <div class="ads-page-main">${body}</div>
      ${renderAdSkyscraper('right')}
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
    ${page.noMonetag ? '' : monetagHeadHtml()}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    ${assetTags}
  </head>
  <body>
    <div id="app">${renderLangToggle(page.route)}${wrapAds(page.body || '')}</div>
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
redirectLines.push('# App routes: SPA shell for rooms. chat-shell.html avoids pretty-URL /room 308s.');
redirectLines.push('/room/:id /chat-shell.html 200');
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
    title: 'QuickRoom — Free Private Chat Rooms Online, No Signup',
    description:
      'Create a free private chat room or temporary online chat room without signup. Group chat, text chat, and live chat in the browser—no app or phone number.',
    body: bodyHome()
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
      noMonetag: true
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
      noMonetag: true
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

const adsense = process.env.VITE_ADSENSE_CLIENT || '';
const pub = adsense.replace(/^ca-pub-/, '');
if (pub) {
  await writeFile(
    path.join(distDir, 'ads.txt'),
    `google.com, pub-${pub.replace(/^pub-/, '')}, DIRECT, f08c47fec0942fa0\n`
  );
}

await cp(path.join(root, 'functions'), path.join(distDir, 'functions'), { recursive: true });

console.log(`Prerendered ${pages.length} SEO HTML files, sitemap, dashboard/404 shells, _redirects, and _headers.`);
