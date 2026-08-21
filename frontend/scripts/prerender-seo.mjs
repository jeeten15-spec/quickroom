import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
  const links = [
    ...Object.keys(useCasePages).map((slug) => ({ href: `/${slug}`, label: useCasePages[slug].title })),
    ...Object.keys(guides).map((slug) => ({ href: `/${slug}`, label: guides[slug].title })),
    ...Object.keys(articles).map((slug) => ({
      href: `/${slug}`,
      label: articles[slug].title
    })),
    { href: '/about', label: 'About QuickRoom' },
    { href: '/blog', label: 'QuickRoom Blog' }
  ].filter((item) => item.href !== currentRoute);

  return `<nav aria-label="Related QuickRoom pages"><h2>Explore more</h2><ul>${links
    .slice(0, 12)
    .map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`)
    .join('')}</ul></nav>`;
}

function bodyUseCase(slug, page) {
  return `<article class="info-page use-case-page">
      <a class="back-link" href="/">QuickRoom</a>
      <p class="eyebrow">QuickRoom use case</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="use-case-intro">${escapeHtml(page.intro)}</p>
      <p><a href="/">Create a temporary room on QuickRoom</a> — no signup, app, or phone number required.</p>
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
      ${renderSections(page.sections, { orderedLists: true })}
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
      ${renderSections(page.sections)}
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
      <p>QuickRoom makes starting a conversation as simple as opening a web page: create a temporary private room, share a room code, and talk in the browser.</p>
      <h2>Our mission</h2>
      <p>Build the simplest, fastest, and most respectful collaboration platform on the web—no unnecessary barriers, no complicated setup, just meaningful conversations.</p>
      <h2>Our principles</h2>
      <ul>
        <li><strong>Simplicity</strong> — prefer one step over five.</li>
        <li><strong>Privacy</strong> — people should not need personal details just to talk.</li>
        <li><strong>Respect</strong> — keep the product welcoming and intentional.</li>
        <li><strong>Accessibility</strong> — keep the core experience free and lightweight in the browser.</li>
      </ul>
      <h2>Looking ahead</h2>
      <p>QuickRoom starts with temporary chat and is growing into a browser-first collaboration toolkit for study, events, client handoffs, and short-lived teamwork.</p>
      ${relatedLinks('/about')}
    </article>`;
}

function bodyBlog() {
  const guideLinks = Object.entries(guides)
    .map(([slug, page]) => `<li><a href="/${escapeHtml(slug)}">${escapeHtml(page.title)}</a></li>`)
    .join('');
  const articleLinks = Object.entries(articles)
    .map(([slug, page]) => `<li><a href="/${escapeHtml(slug)}">${escapeHtml(page.title)}</a></li>`)
    .join('');
  return `<article class="info-page">
      <a class="back-link" href="/">QuickRoom</a>
      <h1>QuickRoom is Here: Create a Private Chat Room in Seconds. No App. No Login. No Clutter.</h1>
      <p>Starting a simple private conversation should not require a permanent account, phone number, or another app install. QuickRoom is a temporary browser-based chat room you can create in seconds and share with a room code.</p>
      <h2>What is QuickRoom?</h2>
      <p>QuickRoom is the fastest way to create a private chat room: no registration, no phone number, no email, and no app. Create a room, share the link or code, and start talking. Rooms expire after the duration you choose.</p>
      <h2>Built for temporary collaboration</h2>
      <p>Use QuickRoom for study groups, exam preparation, coding help, project discussions, book clubs, family planning, event coordination, interview panels, and short support conversations.</p>
      <h2>Practical guides</h2>
      <ul>${guideLinks}${articleLinks}</ul>
      <p><a href="/">Create a room on QuickRoom</a></p>
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
      <h1>QuickRoom — Temporary Rooms for Private Coordination</h1>
      <p>Create a temporary private chat room for events, study groups, client handoffs, and travel plans—no signup, app, or phone number.</p>
      <p>Share a room code, talk in the browser, and let the room expire when the moment is over.</p>
      <p><a href="/about">About QuickRoom</a> · <a href="/blog">Blog</a></p>
      ${jobs ? `<h2>Popular coordination jobs</h2><ul>${jobs}</ul>` : ''}
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
    title: 'QuickRoom — Temporary Rooms for Private Coordination',
    description:
      'Create a temporary private chat room for events, study groups, client handoffs, and travel plans—no signup, app, or phone number.',
    body: bodyHome()
  },
  {
    route: '/about',
    file: 'about.html',
    title: 'About QuickRoom — Private Temporary Collaboration',
    description: 'Learn why QuickRoom exists and how it keeps temporary collaboration simple and respectful.',
    body: bodyAbout()
  },
  {
    route: '/blog',
    file: 'blog.html',
    title: 'QuickRoom Blog — Private Chat Rooms Without the Clutter',
    description: 'Read about private, temporary browser-based collaboration with QuickRoom.',
    body: bodyBlog()
  },
  ...Object.entries(useCasePages).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description,
    body: bodyUseCase(slug, page)
  })),
  ...Object.entries(guides).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description,
    body: bodyGuide(slug, page)
  })),
  ...Object.entries(articles).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description,
    body: bodyArticle(slug, page)
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

function renderHtml(page, { noindex = false } = {}) {
  const canonical = `${SITE}${page.route === '/' ? '/' : page.route}`;
  const robots = noindex ? 'noindex, follow' : 'index, follow';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'QuickRoom', url: SITE }
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#FAFAFA" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="QuickRoom" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    ${assetTags}
  </head>
  <body>
    <div id="app">${page.body || ''}</div>
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
redirectLines.push('# App routes: SPA shell for rooms.');
redirectLines.push('# Do NOT rewrite /dashboard -> dashboard.html: that fights Pages pretty URLs and 308-loops.');
redirectLines.push('/room/:id /index.html 200');
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
    title: 'QuickRoom — Temporary Rooms for Private Coordination',
    description:
      'Create a temporary private chat room for events, study groups, client handoffs, and travel plans—no signup, app, or phone number.',
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
      body: `<article class="info-page dashboard-page"><h1>Growth dashboard</h1><p>This operator dashboard requires JavaScript and is not part of the public index.</p><p><a href="/">Back to QuickRoom</a></p></article>`
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
      body: `<main><h1>Page not found</h1><p>That URL is not a public QuickRoom page.</p><p><a href="/">Go to QuickRoom</a> · <a href="/blog">Blog</a> · <a href="/about">About</a></p></main>`
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

console.log(`Prerendered ${pages.length} SEO HTML files, dashboard/404 shells, _redirects, and _headers.`);
