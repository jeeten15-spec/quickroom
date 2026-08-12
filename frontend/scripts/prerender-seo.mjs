import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');

const { useCasePages } = await import(pathToFileURL(path.join(root, 'src/use-cases.js')).href);
const { guides } = await import(pathToFileURL(path.join(root, 'src/guides.js')).href);
const { articles } = await import(pathToFileURL(path.join(root, 'src/articles.js')).href);

const pages = [
  {
    route: '/',
    file: 'index.html',
    title: 'QuickRoom — Temporary Rooms for Private Coordination',
    description:
      'Create a temporary private chat room for events, study groups, client handoffs, and travel plans—no signup, app, or phone number.'
  },
  {
    route: '/about',
    file: 'about.html',
    title: 'About QuickRoom — Private Temporary Collaboration',
    description: 'Learn why QuickRoom exists and how it keeps temporary collaboration simple and respectful.'
  },
  {
    route: '/blog',
    file: 'blog.html',
    title: 'QuickRoom Blog — Private Chat Rooms Without the Clutter',
    description: 'Read about private, temporary browser-based collaboration with QuickRoom.'
  },
  ...Object.entries(useCasePages).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description
  })),
  ...Object.entries(guides).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description
  })),
  ...Object.entries(articles).map(([slug, page]) => ({
    route: `/${slug}`,
    file: `${slug}.html`,
    title: page.seoTitle,
    description: page.description
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHtml(page) {
  const canonical = `https://quickroom.org${page.route === '/' ? '/' : page.route}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#FAFAFA" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="manifest" href="/manifest.webmanifest" />
    ${assetTags}
  </head>
  <body>
    <div id="app"></div>
    <noscript>
      <main>
        <h1>${escapeHtml(page.title)}</h1>
        <p>${escapeHtml(page.description)}</p>
        <p><a href="https://quickroom.org/">QuickRoom</a> works best with JavaScript enabled.</p>
      </main>
    </noscript>
  </body>
</html>
`;
}

const redirectLines = [
  '# Canonical host and path hygiene are also handled in Cloudflare Redirect Rules.',
  '# Trailing-slash SEO pages -> extensionless HTML files (no slash).'
];

for (const page of pages) {
  if (page.route === '/') continue;
  redirectLines.push(`${page.route}/ ${page.route} 301`);
}

redirectLines.push('');
redirectLines.push('# App routes stay on the SPA shell.');
redirectLines.push('/room/* /index.html 200');
redirectLines.push('/dashboard /index.html 200');
redirectLines.push('/dashboard/ /dashboard 301');
redirectLines.push('');
redirectLines.push('# Fallback for client-only paths.');
redirectLines.push('/* /index.html 200');

await writeFile(path.join(distDir, '_redirects'), `${redirectLines.join('\n')}\n`);

for (const page of pages) {
  const target = path.join(distDir, page.file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, renderHtml(page));
}

console.log(`Prerendered ${pages.length} SEO HTML files and updated _redirects.`);
