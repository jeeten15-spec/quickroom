/** Curated second-page links so article and use-case visits continue into more content. */

const RELATED = {
  '/blog/quickroom-vs-discord-whatsapp-slack': [
    { href: '/blog/study-group-chat-without-whatsapp-or-groupme', label: 'Study group chat without WhatsApp or GroupMe' },
    { href: '/blog/interview-panel-chat-without-slack', label: 'Interview panel chat without Slack' },
    { href: '/hackathon-chat-room', label: 'Hackathon team chat room' }
  ],
  '/blog/study-group-chat-without-whatsapp-or-groupme': [
    { href: '/study-group-chat-no-whatsapp', label: 'Study group chat (no WhatsApp)' },
    { href: '/blog/university-group-project-chat-us-uk-australia', label: 'University group-project chat' },
    { href: '/blog/quickroom-vs-discord-whatsapp-slack', label: 'QuickRoom vs Discord, WhatsApp, and Slack' }
  ],
  '/blog/interview-panel-chat-without-slack': [
    { href: '/interview-panel-chat', label: 'Interview panel use case' },
    { href: '/remote-interview-prep-chat', label: 'Remote interview prep chat' },
    { href: '/blog/quickroom-vs-discord-whatsapp-slack', label: 'QuickRoom vs Discord, WhatsApp, and Slack' }
  ],
  '/blog/university-group-project-chat-us-uk-australia': [
    { href: '/blog/study-group-chat-without-whatsapp-or-groupme', label: 'Study group without WhatsApp or GroupMe' },
    { href: '/classroom-backchannel', label: 'Classroom backchannel' },
    { href: '/blog/temporary-team-chat-without-phone-numbers-europe', label: 'Temporary team chat in Europe' }
  ],
  '/blog/temporary-team-chat-without-phone-numbers-europe': [
    { href: '/fr', label: 'QuickRoom en français' },
    { href: '/private-chat-room-no-signup', label: 'Private chat room without signup' },
    { href: '/blog/quickroom-vs-discord-whatsapp-slack', label: 'QuickRoom vs Discord, WhatsApp, and Slack' }
  ],
  '/study-group-chat-no-whatsapp': [
    { href: '/blog/study-group-chat-without-whatsapp-or-groupme', label: 'US/UK/AU guide: no WhatsApp study group' },
    { href: '/study-group-chat', label: 'Study group chat' },
    { href: '/blog/university-group-project-chat-us-uk-australia', label: 'University group-project chat' }
  ],
  '/interview-panel-chat': [
    { href: '/blog/interview-panel-chat-without-slack', label: 'Interview panel without a Slack workspace' },
    { href: '/remote-interview-prep-chat', label: 'Interview prep room' },
    { href: '/blog/quickroom-vs-discord-whatsapp-slack', label: 'Compare Discord, WhatsApp, and Slack' }
  ],
  '/hackathon-chat-room': [
    { href: '/temporary-chat-room-for-hackathons', label: 'Hackathon setup guide' },
    { href: '/blog/quickroom-vs-discord-whatsapp-slack', label: 'QuickRoom vs Discord' },
    { href: '/fr/chat-hackathon', label: 'Salle de chat hackathon' }
  ],
  '/fr': [
    { href: '/fr/chat-prive-sans-inscription', label: 'Chat privé sans inscription' },
    { href: '/fr/salle-de-discussion-temporaire', label: 'Salle de discussion temporaire' },
    { href: '/fr/groupe-etude-sans-whatsapp', label: 'Groupe d’étude sans WhatsApp' }
  ],
  '/fr/chat-prive-sans-inscription': [
    { href: '/fr/salle-de-discussion-temporaire', label: 'Salle de discussion temporaire' },
    { href: '/fr/groupe-etude-sans-whatsapp', label: 'Groupe d’étude sans WhatsApp' },
    { href: '/blog/temporary-team-chat-without-phone-numbers-europe', label: 'Temporary chat for European teams' }
  ],
  '/fr/salle-de-discussion-temporaire': [
    { href: '/fr/chat-prive-sans-inscription', label: 'Chat privé sans inscription' },
    { href: '/fr/chat-hackathon', label: 'Chat hackathon' },
    { href: '/temporary-chat-room', label: 'Temporary chat room (English)' }
  ],
  '/fr/groupe-etude-sans-whatsapp': [
    { href: '/fr/chat-prive-sans-inscription', label: 'Chat privé sans inscription' },
    { href: '/study-group-chat-no-whatsapp', label: 'Study group chat (English)' },
    { href: '/blog/study-group-chat-without-whatsapp-or-groupme', label: 'US/UK/AU study-group guide' }
  ],
  '/fr/chat-hackathon': [
    { href: '/fr/salle-de-discussion-temporaire', label: 'Salle temporaire' },
    { href: '/hackathon-chat-room', label: 'Hackathon chat (English)' },
    { href: '/temporary-chat-room-for-hackathons', label: 'Hackathon guide' }
  ]
};

const FALLBACK = [
  { href: '/blog/quickroom-vs-discord-whatsapp-slack', label: 'QuickRoom vs Discord, WhatsApp, and Slack' },
  { href: '/blog/study-group-chat-without-whatsapp-or-groupme', label: 'Study group chat without WhatsApp' },
  { href: '/blog/interview-panel-chat-without-slack', label: 'Interview panel chat' },
  { href: '/hackathon-chat-room', label: 'Hackathon chat room' }
];

export function relatedFor(href) {
  const items = RELATED[href] || FALLBACK;
  return items.filter((item) => item.href !== href).slice(0, 4);
}

export function renderRelatedHtml(href, { escapeHtml, navigate = true } = {}) {
  const items = relatedFor(href);
  if (!items.length) return '';
  const navAttr = navigate ? ' data-action="navigate"' : '';
  return `<nav class="related-pages" aria-label="Continue reading">
    <h2>Continue to a related page</h2>
    <p>Open a second QuickRoom page to compare setups or pick the job that matches your group.</p>
    <ul>
      ${items
        .map(
          (item) =>
            `<li><a href="${escapeHtml(item.href)}"${navAttr}>${escapeHtml(item.label)}</a></li>`
        )
        .join('')}
    </ul>
  </nav>`;
}
