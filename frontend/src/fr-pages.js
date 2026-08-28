export const frPages = {
  fr: {
    isLanding: true,
    title: 'QuickRoom — Chat privé temporaire sans inscription',
    seoTitle: 'QuickRoom — Salle de discussion privée sans inscription',
    description:
      'Créez une salle de discussion privée ou temporaire sans inscription, sans application et sans numéro de téléphone. Chat de groupe dans le navigateur, puis la salle expire.',
    htmlLang: 'fr',
    intro:
      'QuickRoom est un chat privé temporaire pour les adultes : créez une salle, partagez un code, discutez dans le navigateur, puis laissez la salle expirer.',
    jobs: [
      {
        href: '/fr/chat-prive-sans-inscription',
        label: 'Chat privé sans inscription',
        blurb: 'Salle privée par code, sans email ni numéro de téléphone.'
      },
      {
        href: '/fr/salle-de-discussion-temporaire',
        label: 'Salle de discussion temporaire',
        blurb: 'Une conversation qui a une fin : une heure, un jour, une semaine.'
      },
      {
        href: '/fr/groupe-etude-sans-whatsapp',
        label: 'Groupe d’étude sans WhatsApp',
        blurb: 'Révisions et devoirs sans collecter les numéros de la classe.'
      },
      {
        href: '/fr/chat-hackathon',
        label: 'Chat d’équipe hackathon',
        blurb: 'Coordination le temps du sprint, sans Discord obligatoire.'
      }
    ]
  },
  'fr/chat-prive-sans-inscription': {
    title: 'Chat privé sans inscription',
    seoTitle: 'Chat privé sans inscription — Salle de discussion | QuickRoom',
    description:
      'Ouvrez un chat privé sans inscription, sans application et sans numéro de téléphone. Partagez un code, discutez, puis la salle expire.',
    htmlLang: 'fr',
    intro:
      'Un chat privé ne devrait pas exiger un compte. QuickRoom crée une salle avec un code : seuls les gens qui ont le code peuvent tenter de rejoindre.',
    sections: [
      {
        heading: 'Privé par code, pas par profil',
        paragraphs: [
          'Choisissez un surnom, créez la salle, envoyez le code uniquement aux personnes concernées. Pas d’email, pas de numéro, pas d’application.',
          'Pour une conversation sensible, utilisez une salle Privée ou Sur invitation, et n’affichez pas le code sur un réseau public.'
        ]
      },
      {
        heading: 'Quand l’utiliser',
        list: [
          'Un groupe d’étude ou un projet, sans WhatsApp',
          'Une coordination d’événement ou de bénévoles',
          'Un échange client le temps d’une livraison',
          'Une discussion familiale pour un trajet ou une décision'
        ]
      }
    ]
  },
  'fr/salle-de-discussion-temporaire': {
    title: 'Salle de discussion temporaire',
    seoTitle: 'Salle de discussion temporaire sans inscription | QuickRoom',
    description:
      'Créez une salle de discussion temporaire dans le navigateur. Choisissez une durée, partagez un code, puis la salle disparaît.',
    htmlLang: 'fr',
    intro:
      'Beaucoup de discussions n’ont pas besoin d’un groupe WhatsApp ou d’un serveur Discord permanent. Une salle temporaire suit la durée réelle du travail.',
    sections: [
      {
        heading: 'Choisissez la durée',
        paragraphs: [
          'Une heure pour un sprint, un jour pour un atelier, une semaine pour un projet, jusqu’à trois mois si besoin. Les messages et images suivent la même échéance.',
          'QuickRoom n’est pas un réseau social ni un chat aléatoire avec des inconnus.'
        ]
      },
      {
        heading: 'Comment ça marche',
        list: [
          'Créez une salle et donnez-lui un nom clair',
          'Choisissez la durée et le type (privée de préférence)',
          'Partagez le code, le lien ou le QR',
          'Discutez dans le navigateur, puis laissez la salle expirer'
        ]
      }
    ]
  },
  'fr/groupe-etude-sans-whatsapp': {
    title: 'Groupe d’étude sans WhatsApp',
    seoTitle: 'Groupe d’étude sans WhatsApp ni numéro | QuickRoom',
    description:
      'Révisions et devoirs dans une salle temporaire, sans WhatsApp et sans échanger les numéros de téléphone. Réservé aux adultes (18+).',
    htmlLang: 'fr',
    intro:
      'Un groupe d’étude pour un devoir n’a pas besoin de devenir un fil WhatsApp éternel. QuickRoom est destiné aux adultes (18+), pas aux classes d’enfants.',
    sections: [
      {
        heading: 'Une salle pour un chapitre ou un examen',
        paragraphs: [
          'Nommez la salle d’après le cours, choisissez une durée qui couvre le devoir, et partagez le code dans le canal déjà utilisé par le groupe.',
          'Les notes officielles et les notes de l’établissement restent dans le ENT / Moodle / plateforme de l’université.'
        ]
      },
      {
        heading: 'Réglage conseillé',
        list: [
          'Modèle Étude',
          'Salle privée',
          'Durée : un jour ou une semaine',
          'Surnoms reconnaissables'
        ]
      }
    ]
  },
  'fr/chat-hackathon': {
    title: 'Chat d’équipe hackathon',
    seoTitle: 'Chat hackathon temporaire sans inscription | QuickRoom',
    description:
      'Salle de chat pour une équipe, des mentors ou le support d’un hackathon — le temps du week-end, sans onboarder tout le monde sur Discord.',
    htmlLang: 'fr',
    intro:
      'Un hackathon avance vite. Une salle navigateur évite de perdre la première heure à créer un serveur.',
    sections: [
      {
        heading: 'Trois usages organisateur',
        list: [
          'Une salle par équipe (modèle Coding, durée 48 h ou 7 jours)',
          'Une salle mentors / office hours, QR sur la slide d’ouverture',
          'Une salle bénévoles ou logistique, privée'
        ]
      },
      {
        heading: 'Ce que ce n’est pas',
        paragraphs: [
          'Ne mettez pas de secrets, de clés API ou de dépôt git dans QuickRoom. Gardez le code dans GitHub et la comms longue dans Discord si l’événement l’utilise déjà.',
          'Ne publiez pas le code de salle sur un tweet public si la discussion doit rester interne.'
        ]
      }
    ]
  }
};
