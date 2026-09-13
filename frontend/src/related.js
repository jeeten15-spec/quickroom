/** Curated second-page links so article and use-case visits continue into more content. */

const RELATED = {
  '/blog/quickroom-vs-discord-whatsapp-slack': [
    { href: '/blog/vpn-for-private-chat-rooms', label: 'VPN for a private connection' },
    { href: '/blog/study-group-chat-without-whatsapp-or-groupme', label: 'Study group chat without WhatsApp or GroupMe' },
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
  ],
  '/private-chat-room-no-signup': [
    { href: '/blog/vpn-for-private-chat-rooms', label: 'VPN for a private connection' },
    { href: '/blog/quickroom-vs-discord-whatsapp-slack', label: 'QuickRoom vs Discord, WhatsApp, and Slack' },
    { href: '/temporary-chat-room', label: 'Temporary chat room' }
  ],
  '/blog/vpn-for-private-chat-rooms': [
    { href: '/private-chat-room-no-signup', label: 'Private chat without signup' },
    { href: '/blog/quickroom-vs-discord-whatsapp-slack', label: 'vs Discord, WhatsApp, Slack' },
    { href: '/blog/vpn-travel-chat-privacy', label: 'VPN travel chat' }
  ],
  '/blog': [
    { href: '/blog/seasonal-group-chat-calendar', label: 'Seasonal group chat calendar' },
    { href: '/fr/blog', label: 'Blog en français' },
    { href: '/es/blog', label: 'Blog en español' }
  ],
  '/blog/seasonal-group-chat-calendar': [
    { href: '/blog/halloween-group-chat-without-whatsapp', label: 'Halloween group chat' },
    { href: '/blog/black-friday-deal-chat-without-family-group', label: 'Black Friday deal chat' },
    { href: '/blog/vpn-travel-chat-privacy', label: 'VPN travel chat' },
    { href: '/blog/nfl-premier-league-watch-party-chat', label: 'NFL / Premier League watch party' }
  ],
  '/blog/halloween-group-chat-without-whatsapp': [
    { href: '/halloween-party-planning-chat', label: 'Halloween party use case' },
    { href: '/blog/black-friday-deal-chat-without-family-group', label: 'Black Friday chat' },
    { href: '/blog/seasonal-group-chat-calendar', label: 'Seasonal calendar' }
  ],
  '/blog/election-night-group-chat-usa-2026': [
    { href: '/blog/seasonal-group-chat-calendar', label: 'Seasonal calendar' },
    { href: '/event-backchannel', label: 'Event backchannel' },
    { href: '/blog/year-end-money-talk-housemate-bills', label: 'Year-end money talk' }
  ],
  '/blog/black-friday-deal-chat-without-family-group': [
    { href: '/black-friday-shopping-chat', label: 'Black Friday shopping use case' },
    { href: '/blog/vpn-travel-chat-privacy', label: 'VPN travel chat' },
    { href: '/blog/year-end-money-talk-housemate-bills', label: 'Housemate bills chat' }
  ],
  '/blog/vpn-travel-chat-privacy': [
    { href: '/vpn-travel-group-chat', label: 'VPN travel use case' },
    { href: '/travel-planning-chat', label: 'Travel planning chat' },
    { href: '/blog/year-end-money-talk-housemate-bills', label: 'Insurance and bills' }
  ],
  '/blog/group-date-chat-without-the-app': [
    { href: '/dating-group-chat', label: 'Dating group chat use case' },
    { href: '/blog/halloween-group-chat-without-whatsapp', label: 'Halloween group chat' },
    { href: '/private-chat-room-no-signup', label: 'Private room, no signup' }
  ],
  '/blog/nfl-premier-league-watch-party-chat': [
    { href: '/sports-watch-party-chat', label: 'Watch party use case' },
    { href: '/blog/election-night-group-chat-usa-2026', label: 'Election night chat' },
    { href: '/event-backchannel', label: 'Event backchannel' }
  ],
  '/blog/year-end-money-talk-housemate-bills': [
    { href: '/split-bills-housemate-chat', label: 'Housemate bills use case' },
    { href: '/blog/vpn-travel-chat-privacy', label: 'VPN travel privacy' },
    { href: '/blog/black-friday-deal-chat-without-family-group', label: 'Black Friday deals' }
  ],
  '/vpn-travel-group-chat': [
    { href: '/blog/vpn-travel-chat-privacy', label: 'VPN travel article' },
    { href: '/travel-planning-chat', label: 'Travel planning' },
    { href: '/split-bills-housemate-chat', label: 'Housemate bills' }
  ],
  '/split-bills-housemate-chat': [
    { href: '/blog/year-end-money-talk-housemate-bills', label: 'Year-end money talk' },
    { href: '/family-planning-chat', label: 'Family planning chat' },
    { href: '/blog/vpn-travel-chat-privacy', label: 'Travel VPN chat' }
  ],
  '/dating-group-chat': [
    { href: '/blog/group-date-chat-without-the-app', label: 'Group-date article' },
    { href: '/private-chat-room-no-signup', label: 'Private chat, no signup' },
    { href: '/event-backchannel', label: 'Event backchannel' }
  ],
  '/sports-watch-party-chat': [
    { href: '/blog/nfl-premier-league-watch-party-chat', label: 'Watch-party article' },
    { href: '/event-backchannel', label: 'Event backchannel' },
    { href: '/halloween-party-planning-chat', label: 'Halloween party chat' }
  ],
  '/halloween-party-planning-chat': [
    { href: '/blog/halloween-group-chat-without-whatsapp', label: 'Halloween article' },
    { href: '/black-friday-shopping-chat', label: 'Black Friday chat' },
    { href: '/event-backchannel', label: 'Event backchannel' }
  ],
  '/black-friday-shopping-chat': [
    { href: '/blog/black-friday-deal-chat-without-family-group', label: 'Black Friday article' },
    { href: '/blog/year-end-money-talk-housemate-bills', label: 'Year-end money talk' },
    { href: '/halloween-party-planning-chat', label: 'Halloween planning' }
  ],
  '/fr/blog': [
    { href: '/fr/blog/calendrier-saisons-chat-de-groupe', label: 'Calendrier saisonnier' },
    { href: '/es/blog', label: 'Blog en español' },
    { href: '/blog', label: 'English blog' }
  ],
  '/es': [
    { href: '/es/chat-privado-sin-registro', label: 'Chat privado sin registro' },
    { href: '/es/blog', label: 'Blog en español' },
    { href: '/es/ver-el-partido', label: 'Ver el partido' }
  ],
  '/es/blog': [
    { href: '/es/blog/calendario-chats-de-grupo-de-temporada', label: 'Calendario de temporada' },
    { href: '/fr/blog', label: 'Blog en français' },
    { href: '/blog', label: 'English blog' }
  ]
};

const FALLBACK = [
  { href: '/blog/seasonal-group-chat-calendar', label: 'Seasonal group chat calendar' },
  { href: '/blog/vpn-travel-chat-privacy', label: 'VPN travel chat' },
  { href: '/blog/nfl-premier-league-watch-party-chat', label: 'Watch-party chat' },
  { href: '/fr/blog', label: 'Blog en français' }
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
