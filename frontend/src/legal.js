export const legalPages = {
  privacy: {
    title: 'Privacy Policy',
    seoTitle: 'Privacy Policy | QuickRoom',
    description:
      'How QuickRoom handles anonymous authentication, room data, advertising consent in Europe, and US state privacy choices.',
    htmlLang: 'en',
    sections: [
      {
        heading: 'Who we are',
        paragraphs: [
          'QuickRoom (quickroom.org) is a browser-based temporary chat product for adults (18+). This policy explains what we process when you create or join a room, read our articles, or see ads on content pages.',
          'Contact: feedback@quickroom.org.'
        ]
      },
      {
        heading: 'What QuickRoom processes',
        paragraphs: [
          'We do not ask for your name, email, or phone number to use a room. You choose a nickname. The browser signs in with Firebase Anonymous Authentication, which creates a random identifier for that browser session.',
          'Room contents (messages, uploaded images, nicknames, room settings, and expiry) are stored so the room can function until it expires. After expiry, rooms and their images are removed according to the product lifecycle.',
          'In the European Economic Area, the United Kingdom, and Switzerland, advertising cookies and personalized ads are off until you accept them in the consent message. We use Google Consent Mode where Google tags are present.'
        ]
      },
      {
        heading: 'Retention',
        paragraphs: [
          'Chat rooms and images last until the expiry you chose (from one hour to three months), then they are cleaned up.',
          'Country pageview counters are kept as daily aggregates for product reporting.',
          'Consent choices are stored in your browser (localStorage) until you change them or clear the site.'
        ]
      },
      {
        heading: 'Children',
        paragraphs: [
          'QuickRoom is 18+ only.'
        ]
      },
      {
        heading: 'Changes',
        paragraphs: [
          'We may update this policy as the product or advertising setup changes. The date on this page will change when we do.'
        ]
      }
    ]
  },
  cookies: {
    title: 'Cookies and similar technologies',
    seoTitle: 'Cookies Policy | QuickRoom',
    description:
      'Cookies, local storage, and similar technologies used by QuickRoom, Firebase, Cloudflare, analytics, Google AdSense, and Monetag.',
    htmlLang: 'en',
    sections: [
      {
        heading: 'Strictly useful storage',
        paragraphs: [
          'QuickRoom uses localStorage for the 18+ age confirmation and for advertising/analytics consent. Session storage may remember a nickname and the current room. Firebase Anonymous Auth uses storage so you can stay in a room without creating an account. These are needed for the product to work as designed.'
        ]
      },
      {
        heading: 'Advertising and analytics cookies',
        paragraphs: [
          'Adsterra, Google AdSense (head tag and ads.txt only), Monetag, and (if enabled) Google Analytics set cookies only after you allow them in Europe, or according to US privacy choices. Cloudflare Web Analytics, when enabled, is designed to operate without advertising cookies.',
          'You can change your mind on Privacy choices or by clearing site data for quickroom.org.'
        ]
      }
    ]
  },
  'privacy-choices': {
    title: 'Privacy choices',
    seoTitle: 'US privacy choices and EU consent | QuickRoom',
    description:
      'Opt out of sale/sharing for US state privacy laws, or update EU advertising and analytics consent for QuickRoom.',
    htmlLang: 'en',
    sections: [
      {
        heading: 'United States',
        paragraphs: [
          'If you are in California or another US state with a similar law, you can opt out of the sale or sharing of personal information for cross-context advertising on QuickRoom content pages. This sets a browser flag we honour before loading Adsterra or Monetag. We also honour Global Privacy Control (GPC) when your browser sends it.'
        ]
      },
      {
        heading: 'Europe, United Kingdom, and Switzerland',
        paragraphs: [
          'Use the consent banner to allow or refuse ads and analytics. Personalized ads stay off until you accept. After Google AdSense approval, enable Privacy & messaging (GDPR) in AdSense so Google’s certified CMP can run as well.'
        ]
      }
    ]
  }
};
