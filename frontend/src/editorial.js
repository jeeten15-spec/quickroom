/** Shared publisher copy, comparison table, screenshots, and author for crawlable + client HTML. */

export const SITE_AUTHOR = {
  name: 'Jeets',
  jobTitle: 'Founder of QuickRoom',
  url: 'https://github.com/jeeten15-spec',
  githubHandle: 'jeeten15-spec',
  githubUrl: 'https://github.com/jeeten15-spec/quickroom',
  email: 'feedback@quickroom.org',
  sameAs: ['https://github.com/jeeten15-spec', 'https://github.com/jeeten15-spec/quickroom']
};

export const PRODUCT_SHOTS = {
  create: {
    src: '/images/quickroom-create-templates.jpg',
    alt: 'QuickRoom create flow: choosing a room template such as Study, Coding, or Event.',
    caption: 'Step 1 — pick a starting template. The rest of setup is name, expiry, and a nickname.'
  },
  share: {
    src: '/images/quickroom-share.jpg',
    alt: 'QuickRoom share dialog with a room code, join link, and QR code.',
    caption: 'After create, you share a code, link, or QR. Nobody else needs an account.'
  },
  chat: {
    src: '/images/quickroom-chat.jpg',
    alt: 'QuickRoom chat: messages, composer, and participant list in the browser.',
    caption: 'The room itself is text chat (and optional images). Ads are not placed inside live rooms.'
  }
};

const COMPARISON_ROWS = [
  ['Signup / phone number', 'None (nickname + room code)', 'Phone number', 'Account', 'Workspace account'],
  ['Where it runs', 'Browser', 'App', 'App or browser', 'App or browser'],
  ['Typical leftover', 'Room expires on a timer you set', 'Group stays on the phone', 'Server stays until someone deletes it', 'Channel/workspace stays'],
  ['Best when', 'One assignment, shift, interview, trip, or handoff', 'People you already text', 'A community you will keep', 'A company that already lives in Slack'],
  ['Poor fit', 'Under-18 / K–12; stranger video chat', 'Mixed-phone groups who should not swap numbers', 'A 90-minute panel', 'External guests for one hour'],
  ['Official records', 'Not an ATS, LMS, or contract store', 'Not a records system', 'Not HR/legal storage', 'Can be, if IT says so']
];

export function renderFigure(shot, escapeHtml) {
  if (!shot) return '';
  return `<figure class="product-shot">
      <img src="${escapeHtml(shot.src)}" alt="${escapeHtml(shot.alt)}" width="1280" height="720" loading="lazy" decoding="async" />
      <figcaption>${escapeHtml(shot.caption)}</figcaption>
    </figure>`;
}

export function renderComparisonTable(escapeHtml) {
  const head = ['', 'QuickRoom', 'WhatsApp', 'Discord', 'Slack']
    .map((cell) => `<th>${escapeHtml(cell)}</th>`)
    .join('');
  const body = COMPARISON_ROWS.map(
    (row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
  ).join('');
  return `<div class="compare-wrap">
      <table class="compare-table">
        <caption>What we actually ship versus the tools groups already have</caption>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

export function renderAuthorByline(escapeHtml, dateLabel) {
  return `<p class="article-byline">
      By <a href="/about">${escapeHtml(SITE_AUTHOR.name)}</a>, ${escapeHtml(SITE_AUTHOR.jobTitle)}
      <span>·</span> ${escapeHtml(dateLabel)}
      <span>·</span> <a href="mailto:${escapeHtml(SITE_AUTHOR.email)}">${escapeHtml(SITE_AUTHOR.email)}</a>
    </p>`;
}

export function homeFaq() {
  return [
    {
      q: 'Do I need to create an account?',
      a: 'No. You pick a nickname. The browser uses an anonymous session so you can stay in that room until it expires.'
    },
    {
      q: 'Where do ads appear?',
      a: 'On public articles, use-case pages, and About—not on Create/Join and not inside a live room. We keep the conversation free of ad units.'
    },
    {
      q: 'Is this for children or school classes under 18?',
      a: 'No. QuickRoom is 18+ only. Use your school’s approved tool for K–12.'
    },
    {
      q: 'What happens when a room expires?',
      a: 'Messages and images for that room are removed according to the expiry you chose (from one hour up to three months).'
    },
    {
      q: 'Who builds QuickRoom?',
      a: `${SITE_AUTHOR.name} (${SITE_AUTHOR.jobTitle}). The product is open source on GitHub. Contact ${SITE_AUTHOR.email}.`
    }
  ];
}

export function renderHomeFaq(escapeHtml) {
  return homeFaq()
    .map((item) => `<div class="home-faq-item"><h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p></div>`)
    .join('');
}

export function renderHowItWorks(escapeHtml) {
  return `<ol class="home-steps">
      <li>${escapeHtml('Create a room and choose a template (study, event, interview, or blank).')}</li>
      <li>${escapeHtml('Set how long it should live. That timer is the product: the chat is meant to end.')}</li>
      <li>${escapeHtml('Share the code, link, or QR only with the people who should join.')}</li>
      <li>${escapeHtml('Talk in the browser. When the work is done, let the room expire instead of leaving another group on everyone’s phone.')}</li>
    </ol>`;
}

export function jsonLdPerson() {
  return {
    '@type': 'Person',
    name: SITE_AUTHOR.name,
    jobTitle: SITE_AUTHOR.jobTitle,
    url: SITE_AUTHOR.url,
    email: SITE_AUTHOR.email,
    sameAs: SITE_AUTHOR.sameAs
  };
}

export function renderContentSections(sections, escapeHtml, { orderedLists = false } = {}) {
  return (sections || [])
    .map((section) => {
      const paragraphs = (section.paragraphs || [])
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');
      const listTag = orderedLists ? 'ol' : 'ul';
      const list = section.list
        ? `<${listTag}>${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${listTag}>`
        : '';
      const figure = section.figure ? renderFigure(section.figure, escapeHtml) : '';
      const table = section.table === 'comparison' ? renderComparisonTable(escapeHtml) : '';
      return `<section><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${list}${figure}${table}</section>`;
    })
    .join('');
}

export function renderLandingEditorial(escapeHtml) {
  return `
    <section class="landing-editorial" aria-labelledby="what-it-is">
      <h2 id="what-it-is">What QuickRoom is (and is not)</h2>
      <p>QuickRoom is a named room in the browser. You pick a template and a title, set when the room should expire, choose a nickname, and get a code plus a link of the form <code>/?room=…</code>. Anyone with that link can open the same thread. There is no user database, so there is no password reset and no way for us to email you a transcript later.</p>
      <p>It is not Zoom (no video grid). It is not Discord (no servers or roles). It is not WhatsApp (no phone number, no contact sync). If you need those products, use them. If you need a named text room for a few hours or a few weeks, this is the narrower tool.</p>
      ${renderFigure(PRODUCT_SHOTS.create, escapeHtml)}
    </section>
    <section class="landing-editorial" aria-labelledby="how-it-works">
      <h2 id="how-it-works">How a room is created</h2>
      ${renderHowItWorks(escapeHtml)}
      ${renderFigure(PRODUCT_SHOTS.share, escapeHtml)}
    </section>
    <section class="landing-editorial" aria-labelledby="compare-heading">
      <h2 id="compare-heading">Side-by-side with other chat products</h2>
      <p>The same table appears in the <a href="/blog/quickroom-vs-discord-whatsapp-slack">comparison walkthrough</a>. Short version: WhatsApp and Discord keep identity and history; QuickRoom keeps a room id and whatever is still in memory until expiry.</p>
      ${renderComparisonTable(escapeHtml)}
    </section>
    <section class="landing-editorial" aria-labelledby="home-faq-heading">
      <h2 id="home-faq-heading">Questions people actually ask</h2>
      ${renderHomeFaq(escapeHtml)}
    </section>
    <section class="landing-editorial" aria-labelledby="who-builds">
      <h2 id="who-builds">Who builds this</h2>
      <p>${escapeHtml(SITE_AUTHOR.name)} maintains QuickRoom. Code is on <a href="${escapeHtml(SITE_AUTHOR.githubUrl)}">${escapeHtml(SITE_AUTHOR.githubHandle)}</a>. Product questions: <a href="mailto:${escapeHtml(SITE_AUTHOR.email)}">${escapeHtml(SITE_AUTHOR.email)}</a>. The <a href="/about">about page</a> states what we will not add: K–12 products and stranger video chat.</p>
      ${renderFigure(PRODUCT_SHOTS.chat, escapeHtml)}
    </section>`;
}

export function renderAboutEditorial(escapeHtml) {
  return `
      <p class="eyebrow">About · experience, expertise, author, trust</p>
      <h1>Who runs QuickRoom</h1>
      ${renderAuthorByline(escapeHtml, 'Updated 9 September 2026')}
      <p>QuickRoom is a named-room chat tool: create a title, share <code>/?room=…</code>, talk in the browser. ${escapeHtml(SITE_AUTHOR.name)} builds and deploys it. The source of truth for the code is <a href="${escapeHtml(SITE_AUTHOR.githubUrl)}">github.com/${escapeHtml(SITE_AUTHOR.githubHandle)}/quickroom</a>. Mail for product questions: <a href="mailto:${escapeHtml(SITE_AUTHOR.email)}">${escapeHtml(SITE_AUTHOR.email)}</a>.</p>
      <h2>Experience (what we actually shipped)</h2>
      <p>Rooms are created through a public API, listed when you tick public, and opened with a query-string room id because Cloudflare Pages pretty URLs broke <code>/room/:id</code>. That constraint is documented in the walkthroughs, not hidden. Chat is text-first. There is no video grid and no phone-number identity.</p>
      <p>Public discovery on the homepage shows the three newest listed rooms. Older public rooms sit under a control labelled User Created Rooms so the home page does not turn into a wall of chips as the list grows. Private rooms never appear there.</p>
      <h2>Expertise (what we will not pretend)</h2>
      <p>This is not a school district product, not HIPAA, not a replacement for Slack’s audit log. Templates on the create page are title shortcuts. If you need those other products, buy them.</p>
      <h2>Authoritativeness</h2>
      <p>Claims about listing, retention, and ads are written to match the running app and the <a href="/privacy">privacy policy</a>. If the product changes, the articles should change — that is the editorial rule. Comparison claims live in one table so the homepage and the blog do not drift.</p>
      <h2>Trust</h2>
      <ul>
        <li>18+ only. No K–12, no children’s homework clubs.</li>
        <li>No random stranger video chat. That is a different industry.</li>
        <li>Chat threads stay ad-free. Interstitial ads, if any, stay on About — not in the room.</li>
        <li>We do not ask for a Google or Apple login to send a message.</li>
      </ul>
      <p><a href="/">Create a room</a> · <a href="/blog">Editorial</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>`;
}
