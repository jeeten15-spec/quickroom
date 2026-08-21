/**
 * Shared long-form extras for QuickRoom SEO pages.
 * Used by prerender-seo.mjs (crawlable HTML) and main.js (client render)
 * so Bing/Google see the same substantial copy whether or not JS runs.
 */

export function privacyParagraphs(pageTitle) {
  return [
    `${pageTitle} on QuickRoom is designed for short-lived coordination. Participants join with a room code and a nickname—no email address, phone number, or app install is required.`,
    'Treat the room code like an invitation. Share it only with the people who should be in the conversation, especially for Private or Invite Only rooms.',
    'When the expiry you chose is reached, the room and its messages and images are cleaned up according to QuickRoom’s temporary-room lifecycle. That keeps the conversation from becoming another permanent group you never meant to keep.'
  ];
}

export function howToStartSteps(pageTitle) {
  return [
    `Open QuickRoom and choose Create Room for ${pageTitle}.`,
    'Pick a clear room name and an expiry that matches the real end of the work: an hour, a day, a week, or up to three months.',
    'Share the room code (or link/QR) with the people who need to join.',
    'Talk in the browser, share images if useful, then let the room expire when the moment is over.'
  ];
}

export function defaultFaq(pageTitle) {
  return [
    {
      q: `Is ${pageTitle} free to use?`,
      a: 'Yes. Creating and joining a QuickRoom does not require a paid plan or an account for the core temporary chat experience.'
    },
    {
      q: 'Do people need to install an app?',
      a: 'No. Everyone joins from a modern browser with the room code and a nickname.'
    },
    {
      q: 'Do participants need phone numbers or email addresses?',
      a: 'No. QuickRoom uses anonymous browser identities for temporary rooms instead of permanent profiles.'
    },
    {
      q: 'How long does a room last?',
      a: 'You choose the expiry when you create the room. Common options include one hour, six hours, one day, one week, or three months.'
    },
    {
      q: 'Is a room code public?',
      a: 'Anyone who has the code can attempt to join. Share codes directly with the intended group and avoid posting them on public pages when the conversation should stay private.'
    }
  ];
}

export function renderExtrasHtml(pageTitle, { escapeHtml, orderedHowTo = false }) {
  const privacy = privacyParagraphs(pageTitle)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  const listTag = orderedHowTo ? 'ol' : 'ol';
  const steps = howToStartSteps(pageTitle)
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join('');
  const faq = defaultFaq(pageTitle)
    .map(
      (item) =>
        `<div><h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p></div>`
    )
    .join('');

  return `
    <section>
      <h2>How to start</h2>
      <${listTag}>${steps}</${listTag}>
    </section>
    <section>
      <h2>Privacy and access</h2>
      ${privacy}
    </section>
    <section>
      <h2>Frequently asked questions</h2>
      ${faq}
    </section>
  `;
}

export function renderExtrasDomString(pageTitle) {
  // Client-side version using the same copy (main.js already has escapeHtml).
  return { privacy: privacyParagraphs(pageTitle), steps: howToStartSteps(pageTitle), faq: defaultFaq(pageTitle) };
}
