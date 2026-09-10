/** Privacy-first VPNs we actually looked at. Official sites; we are not the vendor. */

export const VPN_PICKS = {
  en: {
    heading: 'If you also want the connection private, use a VPN',
    intro:
      'A private QuickRoom hides the leftover group, not the path from your café Wi‑Fi to Cloudflare. A VPN encrypts that path. We checked no-logs claims, independent audits, and whether you can pay without handing over a phone number — the same test we use for our own signup. These are not magic cloaks: we still see that a browser joined a room. They are the rare upsell that matches the product.',
    picks: [
      {
        name: 'Mullvad VPN',
        href: 'https://mullvad.net/en',
        blurb:
          'Best brand fit. Account is a number, not an email. Cash in the post is still an option. Independently audited no-logs, WireGuard by default. Slightly spartan app; that is the point.'
      },
      {
        name: 'Proton VPN',
        href: 'https://protonvpn.com/',
        blurb:
          'Best “I have family in the UK and US and they will actually install it” pick. Swiss company, published audits, a real free tier (slow, limited). Paid Secure Core is the grown-up mode. Requires an account.'
      },
      {
        name: 'IVPN',
        href: 'https://www.ivpn.net/',
        blurb:
          'Quiet, audited, no-logs, and happy to take privacy-respecting payment. Fewer servers than the TV-ad brands; fewer reasons to harvest you. Good on US, UK, and Canadian exits.'
      }
    ],
    outro:
      'Skip the random “free VPN” in an ads list. Those often sell your traffic. Discord and WhatsApp still see a lot after the VPN; QuickRoom still expires the room. Use both jobs: VPN for the pipe, room code for the guest list.'
  },
  fr: {
    heading: 'Si vous voulez aussi une connexion privée, utilisez un VPN',
    intro:
      'Une salle privée cache le groupe WhatsApp, pas le Wi‑Fi du café. Un VPN chiffre ce trajet. Nous avons regardé les audits « no logs » et si l’on peut payer sans donner un numéro — le même test que pour QuickRoom.',
    picks: [
      {
        name: 'Mullvad VPN',
        href: 'https://mullvad.net/fr',
        blurb:
          'Le plus cohérent : un numéro de compte, pas un e-mail. Audité, WireGuard. L’appli est volontairement sobre.'
      },
      {
        name: 'Proton VPN',
        href: 'https://protonvpn.com/',
        blurb:
          'Le plus simple à faire installer. Suisse, audits publics, offre gratuite limitée. Le mode Secure Core est la version sérieuse.'
      },
      {
        name: 'IVPN',
        href: 'https://www.ivpn.net/',
        blurb:
          'Discret, audité, paiements respectueux de la vie privée. Moins de serveurs, moins de raisons de vous profiler. Sorties UK, US, Canada.'
      }
    ],
    outro:
      'Évitez les « VPN gratuits » des listes publicitaires. Discord verra encore beaucoup de choses ; QuickRoom fera quand même expirer la salle.'
  },
  es: {
    heading: 'Si también quieres la conexión privada, usa un VPN',
    intro:
      'Una sala privada esconde el grupo eterno, no el Wi‑Fi del café. Un VPN cifra ese tramo. Revisamos auditorías de no-logs y si puedes pagar sin dar un teléfono.',
    picks: [
      {
        name: 'Mullvad VPN',
        href: 'https://mullvad.net/es',
        blurb:
          'La opción que más encaja: una cuenta-número, no un email. Auditado, WireGuard. La app es deliberadamente sobria.'
      },
      {
        name: 'Proton VPN',
        href: 'https://protonvpn.com/',
        blurb:
          'La más fácil de instalar en familia. Suiza, auditorías públicas, plan gratis limitado. Secure Core es el modo adulto.'
      },
      {
        name: 'IVPN',
        href: 'https://www.ivpn.net/',
        blurb:
          'Discreto, auditado, pagos respetuosos con la privacidad. Menos servidores, menos motivos para perfilarte. Salidas en EE. UU., Reino Unido y Canadá.'
      }
    ],
    outro:
      'Evita los «VPN gratis» de listas de anuncios. Discord seguirá viendo mucho; QuickRoom seguirá caducando la sala.'
  }
};

export function renderVpnPicks(escapeHtml, lang = 'en') {
  const copy = VPN_PICKS[lang] || VPN_PICKS.en;
  return `<div class="vpn-picks">
      <p>${escapeHtml(copy.intro)}</p>
      <ul>
        ${copy.picks
          .map(
            (pick) =>
              `<li><a href="${escapeHtml(pick.href)}" rel="sponsored noopener noreferrer" target="_blank">${escapeHtml(pick.name)}</a> — ${escapeHtml(pick.blurb)}</li>`
          )
          .join('')}
      </ul>
      <p>${escapeHtml(copy.outro)}</p>
    </div>`;
}
