import { PRODUCT_SHOTS } from './editorial.js';
import { commercialArticles } from './commercial-articles.js';

const AUTHOR = 'Jeets';
const UPDATED = '9 September 2026';

export const articles = {
  'blog/private-chat-room-no-signup-global-guide': {
    title: 'What “no signup” actually means in QuickRoom',
    seoTitle: 'Private Chat Room Without Signup — How QuickRoom Works | QuickRoom',
    description:
      'How QuickRoom creates a private room with a nickname and a code—no email, phone number, or app—and what that does and does not protect.',
    publishedAt: 'July 30, 2026',
    updatedAt: UPDATED,
    author: AUTHOR,
    intro:
      'If you only need a thread for one assignment, one shift, or one client week, the expensive part is not the chat itself. It is the account, the phone number, and the group that never gets deleted. This page is the honest product walkthrough: what you click, what we store, and when you should not use QuickRoom.',
    sections: [
      {
        heading: 'The four screens, in order',
        paragraphs: [
          'You choose a template so the room has a default name (Study, Event, Interview, and so on). Then you set expiry, pick a nickname, and decide whether the room is private or listed as public. After create, the share screen gives a code, a link of the form https://quickroom.org/?room=…, and a QR code.',
          'Joining is the same nickname field plus that code. There is no password reset email because there is no password. The browser keeps an anonymous Firebase session so you can refresh without inventing a new identity every time.'
        ],
        figure: PRODUCT_SHOTS.create
      },
      {
        heading: 'What we do not collect',
        paragraphs: [
          'QuickRoom does not ask for an email address or phone number to create or join a room. We do not build a friend graph. Nicknames are chosen by the participant and are not verified identities.',
          'Cloudflare still sees an IP and country the way any HTTPS site does. We use country only for aggregate pageview counts on public articles, not to profile people inside a room. Details are on the privacy page.'
        ]
      },
      {
        heading: 'The code is the lock',
        paragraphs: [
          'Anyone who has the room code can attempt to join. That is a feature for speed and a risk if you post the code on a public story. For events, classes, clients, and travel, use Private (or Invite Only) and send the code in a channel that already knows who should be there.',
          'Public topic rooms on the homepage are for people who want discovery. They are a different job. Do not put a client or a hiring panel in a public listing.'
        ],
        figure: PRODUCT_SHOTS.share
      },
      {
        heading: 'Jobs this is for — and jobs it is not',
        list: [
          'For: revision sprints, hackathon weekends, volunteer shifts, interview backchannels, one-trip family planning, freelance handoffs.',
          'Not for: random stranger matching, adult video chat, or anyone under 18 (including K–12 classes).',
          'Not a records system: keep grades, ATS scorecards, invoices, and contracts where they already belong.'
        ]
      },
      {
        heading: 'Inside the room',
        paragraphs: [
          'The product is group text chat, optional one-to-one chat if you enabled it at create time, and image sharing that follows the same expiry as the room. There are no ad units in the live conversation. If you leave, you can come back with the same link until the timer ends.'
        ],
        figure: PRODUCT_SHOTS.chat
      }
    ]
  },

  'blog/free-online-chat-rooms-no-signup': {
    title: 'A free room that is supposed to disappear',
    seoTitle: 'Free Online Chat Rooms With No Signup | QuickRoom',
    description:
      'How to open a free QuickRoom in the browser, pick an expiry, and avoid leaving another permanent group on everyone’s phone.',
    publishedAt: 'August 21, 2026',
    updatedAt: UPDATED,
    author: AUTHOR,
    intro:
      '“Free chat room” on the internet often means a stranger lobby. QuickRoom is the opposite: you invite a known group, you pick when the room dies, and you do not pay or register to do that. Here is the setup we actually ship.',
    sections: [
      {
        heading: 'Create, don’t register',
        paragraphs: [
          'Open quickroom.org, confirm you are 18+, then Create private room. Name it after the work (“Week 4 lab”, “Saturday shift”, “Panel 14:00”), not after a person you should not identify in a title.',
          'Expiry options run from one hour to three months. If you cannot name an end, you probably want WhatsApp or Slack instead.'
        ],
        figure: PRODUCT_SHOTS.create
      },
      {
        heading: 'Share without harvesting numbers',
        paragraphs: [
          'Paste the join link into the cohort channel that already exists (Canvas, Teams, a calendar invite). People who cannot install another app can still open a browser.',
          'If the group is in the same physical room, the QR on the share dialog is faster than spelling a code out loud.'
        ],
        figure: PRODUCT_SHOTS.share
      },
      {
        heading: 'What “free” covers',
        paragraphs: [
          'Creating and joining the core room is free. We may show ads on public articles and About so the product can stay free to use. Those ads are not injected into Create/Join or into the chat transcript.',
          'If a page ever asked you to watch a video or click a yellow box to enter a room, that is not QuickRoom’s join path—report it. The join path is the form on this site or a /?room= link.'
        ]
      }
    ]
  },

  'blog/anonymous-chat-temporary-group-chat': {
    title: 'Anonymous nicknames, not a stranger queue',
    seoTitle: 'Anonymous Chat Without Accounts — Temporary Group Chat | QuickRoom',
    description:
      'QuickRoom nicknames are not verified identities. That is useful for a known group that should not swap phone numbers—and dangerous if you treat it like random chat.',
    publishedAt: 'August 21, 2026',
    updatedAt: UPDATED,
    author: AUTHOR,
    intro:
      'People say “anonymous chat” when they mean two different products. One is a roulette with strangers. The other is a class or crew that does not want to swap personal numbers for a two-hour job. QuickRoom is only the second.',
    sections: [
      {
        heading: 'What “anonymous” means here',
        paragraphs: [
          'You are not asked for a legal name, email, or phone. Firebase Anonymous Authentication gives the browser a random ID for that session. Nicknames can be duplicated; they are labels, not accounts.',
          'We can still see that a browser is in a room, and Cloudflare sees network metadata. “Anonymous” is not “invisible to the operator of the website.” Read the privacy policy if that distinction matters for your use.'
        ]
      },
      {
        heading: 'Invite people you already intend to talk to',
        paragraphs: [
          'Share the code the same way you would share a meeting PIN: email thread, LMS group, calendar guests. Do not seed a public room and hope the right strangers arrive.',
          'If you wanted random video chat, this product will feel empty and we will not add that feature. The 18+ gate exists so this does not become a kids’ hangout either.'
        ],
        figure: PRODUCT_SHOTS.chat
      },
      {
        heading: 'When the nickname model is the wrong tool',
        list: [
          'You need to prove who sent a message (use a named workspace).',
          'You must retain chat for legal or HR discovery (use the system your counsel already approved).',
          'Participants are under 18 (do not use QuickRoom).'
        ]
      }
    ]
  },

  'blog/quickroom-vs-discord-whatsapp-slack': {
    title: 'QuickRoom vs WhatsApp, Discord, and Slack when the chat should end',
    seoTitle: 'QuickRoom vs Discord vs WhatsApp vs Slack | Temporary Group Chat',
    description:
      'A side-by-side of signup, leftover groups, and fit—based on how QuickRoom is actually built, not a generic “best chat app” roundup.',
    publishedAt: 'August 28, 2026',
    updatedAt: UPDATED,
    author: AUTHOR,
    intro:
      'I did not build QuickRoom to replace the apps your group already lives in. I built it because those apps are slow when the job is one deadline. The table below is the decision I use when someone asks “why not just WhatsApp?”',
    sections: [
      {
        heading: 'Use the tool that matches the lifespan',
        paragraphs: [
          'If the same ten people will still need this thread next year, stay in WhatsApp, Discord, or Slack. Switching tools has a cost.',
          'If you can point at a calendar and say “this is over on Friday,” a room with an expiry is usually less mess than a new group, server, or workspace.'
        ],
        table: 'comparison'
      },
      {
        heading: 'WhatsApp and iMessage leftovers',
        paragraphs: [
          'WhatsApp is the default across much of the UK, EU, and Australia because everyone already has it. The hidden cost is a phone-number graph plus a group that sits on the home screen until someone is rude enough to leave.',
          'In mixed iPhone/Android US groups, iMessage falls back to SMS and GroupMe becomes the campus default. A room code avoids collecting numbers from people you only need for this module.'
        ]
      },
      {
        heading: 'Discord servers that never get archived',
        paragraphs: [
          'Discord is the right call for a society or a hackathon that already runs there. Creating a fresh server for five people still means accounts, roles, and a space that rarely gets deleted after the demo.',
          'Use QuickRoom when some of the group does not have Discord yet, or when there should be no server owner after the weekend.'
        ]
      },
      {
        heading: 'Slack is for organisations that already paid that tax',
        paragraphs: [
          'Guest accounts, SSO, and IT review make Slack a poor fit for a two-hour interview panel with an external chair. Keep the official file in the ATS. Use a browser room only for “we’re running long” and “you ask the next question.”',
          'If your company already requires Slack for that panel, do not fight it. QuickRoom is for the case where Slack access is the blocker.'
        ]
      },
      {
        heading: 'What the QuickRoom UI actually asks',
        paragraphs: [
          'Template, name, expiry, nickname, private vs public. Then a share surface. Then chat. That is the whole create path. Compare that to “create workspace / verify email / invite guests / set channels.”'
        ],
        figure: PRODUCT_SHOTS.create
      }
    ]
  },

  'blog/study-group-chat-without-whatsapp-or-groupme': {
    title: 'Run a university study group without collecting phone numbers',
    seoTitle: 'Study Group Chat Without WhatsApp or GroupMe | QuickRoom',
    description:
      'An 18+ setup for US, UK, and Australian coursework: Private study room, expiry at the deadline, code in the cohort channel—not on a public story.',
    publishedAt: 'August 28, 2026',
    updatedAt: UPDATED,
    author: AUTHOR,
    intro:
      'The WhatsApp group for “just this assignment” is still there in March. This is the setup I recommend for adult university groups who should not be harvesting numbers for a two-week lab.',
    sections: [
      {
        heading: 'Who this is for',
        paragraphs: [
          'Adult university, college, and adult-education groups (18+). QuickRoom is not a K–12 classroom tool. If any classmate is under 18, use the school-approved LMS chat.',
          'Keep submissions, grades, and exam materials in Canvas, Moodle, Blackboard, or the portal your faculty already named. The room is only for questions and photos of a diagram you are allowed to share.'
        ]
      },
      {
        heading: 'A one-minute setup',
        list: [
          'Create a Study room named after the module or assignment code.',
          'Set expiry to the deadline plus a day (24 hours or 7 days is the usual pair).',
          'Choose Private. Paste the code into the existing cohort Teams/Discord/Canvas thread—not onto Instagram.',
          'Ask for a recognisable nickname (first name is enough).',
          'If you meet in person, put the QR on a slide for thirty seconds.'
        ],
        figure: PRODUCT_SHOTS.share
      },
      {
        heading: 'US vs UK vs Australia, in practice',
        paragraphs: [
          'UK and Australia: the pitch is “no numbers, no leftover WhatsApp group.” US: GroupMe and iMessage split the campus; a browser link is the thing that works for both.',
          'Do not put student IDs, unpaid invoices, or papers you are not allowed to circulate in the room.'
        ]
      }
    ]
  },

  'blog/interview-panel-chat-without-slack': {
    title: 'A hiring-panel backchannel without a new Slack workspace',
    seoTitle: 'Interview Panel Chat Without Slack | QuickRoom',
    description:
      'Coordinate timing among authorised interviewers in the browser. Keep scorecards and candidate PII in the ATS—not in the room.',
    publishedAt: 'August 28, 2026',
    updatedAt: UPDATED,
    author: AUTHOR,
    intro:
      'The panel needs a place for “we’re five minutes over” that is not the candidate-facing call. Opening Slack guests for that hour is more process than the meeting. A private QuickRoom is the smaller tool.',
    sections: [
      {
        heading: 'Coordination only',
        paragraphs: [
          'Scorecards, equal-opportunity records, and candidate personal data belong in Greenhouse, Lever, Workday, or whatever ATS you already use. Name the QuickRoom after the slot (“Thu 14:00 panel”), not after the candidate.',
          'Set expiry to the end of the interview day. After you hang up, copy anything that must persist into the ATS, then let the room die.'
        ]
      },
      {
        heading: 'Run-of-show',
        list: [
          'Create an Interview room fifteen minutes before the panel.',
          'Private or Invite Only. Put the code in the calendar invite or a 1:1 message—not in a public Slack channel.',
          'Use the group room for time checks. Turn on one-to-one chat only if two interviewers need a side question.',
          'Do not paste right-to-work documents or special-category data into the transcript.'
        ],
        figure: PRODUCT_SHOTS.chat
      },
      {
        heading: 'Why Slack is often the wrong room',
        paragraphs: [
          'US agency + hiring manager + skip-level panels often cannot share one Slack. UK external chairs have the same problem. A link that opens in a browser is the lowest common denominator—not a replacement for your HR file.'
        ]
      }
    ]
  },

  'blog/university-group-project-chat-us-uk-australia': {
    title: 'A group-project chat that ends when the semester ends',
    seoTitle: 'University Group Project Chat | Temporary Room | QuickRoom',
    description:
      'Match room expiry to the brief: a week for a sprint, up to three months for a teaching block. For 18+ university groups only.',
    publishedAt: 'August 28, 2026',
    updatedAt: UPDATED,
    author: AUTHOR,
    intro:
      'Group projects cluster at the start of term and again before finals. The chat should follow that calendar, not sit in Discord until graduation.',
    sections: [
      {
        heading: 'Pick the expiry from the brief, not from habit',
        paragraphs: [
          'A one-week sprint can use a 7-day room. A project that lasts the teaching block can use three months. Someone should be able to walk away when the grade is in.',
          'Use the Study template and put the assessment name in the title so late joiners do not enter the wrong room.'
        ],
        figure: PRODUCT_SHOTS.create
      },
      {
        heading: 'How groups actually share the code',
        paragraphs: [
          'US: paste into the Canvas or GroupMe thread that already exists, then move working discussion into the room.',
          'UK: Microsoft Teams module channel or society Discord—not a public Instagram story.',
          'Australia: same as the UK for WhatsApp-heavy cohorts: code in the existing chat, work in the room that can expire.'
        ]
      },
      {
        heading: 'Adults only',
        paragraphs: [
          'This is for university, college, TA discussion among adults, and adult education. It is not a rollout for a secondary-school class.'
        ]
      }
    ]
  },

  'blog/temporary-team-chat-without-phone-numbers-europe': {
    title: 'Temporary team chat in Europe without a WhatsApp number list',
    seoTitle: 'Temporary Team Chat in Europe — No Phone Number | QuickRoom',
    description:
      'A practical EU/UK setup: Private room, code in the registration email, contracts kept in the tools already under your DPA. QuickRoom is 18+.',
    publishedAt: 'August 28, 2026',
    updatedAt: UPDATED,
    author: AUTHOR,
    intro:
      'WhatsApp is already on the phone, so it becomes the workshop thread by default. That quietly copies a phone-number graph for an afternoon that should have ended at 17:00. A room code is a smaller request.',
    sections: [
      {
        heading: 'What we store versus what WhatsApp stores',
        paragraphs: [
          'QuickRoom stores nicknames, messages, and images until the expiry you chose, plus an anonymous Firebase ID for that browser. We do not ask for a mobile number. Advertising on public pages, if you allow it, uses a consent banner in the EEA, UK, and Switzerland. Live rooms do not show ads.',
          'That is not a substitute for your organisation’s DPA. Keep contracts, invoices, and special-category data in the systems you already named to legal.'
        ]
      },
      {
        heading: 'A workshop setup that fits GDPR-minded teams',
        list: [
          'Create a Private room named after the work package or event.',
          'Expiry: end of day, or one week if you promised a follow-up window.',
          'Share the code in the confirmation email to people who already registered.',
          'French-speaking attendees can read product pages at /fr; the create UI is still English in this version, but messages are just text.'
        ],
        figure: PRODUCT_SHOTS.share
      },
      {
        heading: 'When not to use it',
        paragraphs: [
          'If works council or IT forbids any tool outside the approved list, follow that list. QuickRoom is for groups that are allowed to choose a lightweight browser room and want an end date.'
        ]
      }
    ]
  }
};

Object.assign(articles, commercialArticles);
