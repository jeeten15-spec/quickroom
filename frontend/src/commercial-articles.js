import { PRODUCT_SHOTS } from './editorial.js';
import { UPCOMING_EVENTS } from './seasonal-calendar.js';

const AUTHOR = 'Jeets';
const UPDATED = '10 September 2026';
const PUBLISHED = '10 September 2026';

function meta(page, lang) {
  return {
    ...page,
    publishedAt: page.publishedAt || PUBLISHED,
    updatedAt: UPDATED,
    author: AUTHOR,
    htmlLang: lang
  };
}

const calendarLines = UPCOMING_EVENTS.map(
  (event) => `${event.eventDay}: ${event.title} — search phrases: ${event.keywords.join('; ')}.`
);

const packs = [
  {
    en: {
      slug: 'blog/seasonal-group-chat-calendar',
      title: 'The group chats that should die with the season',
      seoTitle: 'Seasonal Group Chat Calendar 2026 — Halloween to New Year | QuickRoom',
      description:
        'A 2026 calendar of festivals, sports, and election nights plus the search phrases people actually type. Temporary group chats for USA, UK, Canada, and Western Europe.',
      intro:
        'Sport has a fixture list. Festivals have a date. Your group chat has “several years of residue.” This page is the anti-residue calendar: what to spin up four weeks out, which keywords people search, and when to let the room expire.',
      sections: [
        {
          heading: 'How to use this calendar',
          paragraphs: [
            'Four weeks before the event, create a Private QuickRoom named after the thing, not after a person. Paste the code into the one channel that already knows the guest list. Set expiry for the morning after.',
            'October to December is when finance, gifts, travel VPNs, and insurance ads pay more. January is diets, money resets, and dating. We write for those windows on purpose—and we still will not put ads inside your live room.'
          ]
        },
        {
          heading: 'What is on the board (2026–27)',
          list: calendarLines
        },
        {
          heading: 'Commercial queries, still a chat room',
          paragraphs: [
            'People arriving from “VPN for travel,” “split energy bills,” “group date ideas,” or “NFL watch party” still get the same product: nickname, code, timer. We are not a VPN, a bank, a dating app, or a bookmaker. We are the disposable thread next to those jobs.',
            'French and Spanish versions live at /fr/blog and /es/blog so Western Europe is not stuck translating screenshots in a group named “final final 2”.'
          ],
          figure: PRODUCT_SHOTS.create
        }
      ]
    },
    fr: {
      slug: 'fr/blog/calendrier-saisons-chat-de-groupe',
      title: 'Les discussions de groupe qui devraient mourir avec la saison',
      seoTitle: 'Calendrier 2026 des chats de groupe saisonniers | QuickRoom',
      description:
        'Calendrier 2026 des festivals, du sport et des soirs d’élection, avec les mots-clés que les gens tapent vraiment. Salles temporaires pour l’Europe, le Royaume-Uni, le Canada et les USA.',
      intro:
        'Le sport a un calendrier. Les fêtes ont une date. Votre groupe WhatsApp a « plusieurs années de compost ». Voici le calendrier anti-compost : quoi ouvrir quatre semaines avant, quels mots-clés, et quand laisser la salle expirer.',
      sections: [
        {
          heading: 'Comment s’en servir',
          paragraphs: [
            'Quatre semaines avant l’événement, créez une salle privée nommée d’après l’événement, pas d’après une personne. Collez le code dans le seul canal qui connaît déjà la liste. Choisissez une expiration pour le lendemain matin.',
            'D’octobre à décembre, la finance, les cadeaux, les VPN voyage et l’assurance paient plus cher. En janvier : régimes, budgets, rencontres. On écrit pour ces fenêtres — sans publicité dans la conversation en direct.'
          ]
        },
        {
          heading: 'Le tableau 2026–27',
          list: calendarLines
        },
        {
          heading: 'Requêtes commerciales, toujours une salle de chat',
          paragraphs: [
            'Si vous arrivez via « VPN voyage », « partage des factures », « rendez-vous en groupe » ou « soirée foot », vous trouvez le même produit : surnom, code, minuteur. QuickRoom n’est ni un VPN, ni une banque, ni une appli de rencontre, ni un bookmaker.',
            'L’anglais et l’espagnol sont sur /blog et /es/blog.'
          ]
        }
      ]
    },
    es: {
      slug: 'es/blog/calendario-chats-de-grupo-de-temporada',
      title: 'Los chats de grupo que deberían morir con la temporada',
      seoTitle: 'Calendario 2026 de chats de grupo de temporada | QuickRoom',
      description:
        'Calendario 2026 de festivales, deporte y noches electorales, con las frases de búsqueda reales. Salas temporales para EE. UU., Reino Unido, Canadá y Europa occidental.',
      intro:
        'El deporte tiene calendario. Los festivales tienen fecha. Tu grupo de WhatsApp tiene compost de varios años. Esta es la guía anti-compost: qué abrir cuatro semanas antes, qué palabras clave, y cuándo dejar que la sala expire.',
      sections: [
        {
          heading: 'Cómo usar el calendario',
          paragraphs: [
            'Cuatro semanas antes, crea una sala privada con el nombre del evento, no de una persona. Pega el código en el único canal que ya tiene la lista. Pon la caducidad a la mañana siguiente.',
            'De octubre a diciembre suben las pujas de finanzas, regalos, VPN de viaje y seguros. En enero: dietas, reinicios de dinero y citas. Escribimos para esas ventanas. El chat en directo sigue sin anuncios.'
          ]
        },
        {
          heading: 'El tablero 2026–27',
          list: calendarLines
        },
        {
          heading: 'Búsquedas comerciales, misma sala',
          paragraphs: [
            'Si llegas desde «VPN para viajar», «dividir facturas», «cita en grupo» o «ver el partido», el producto es el mismo: apodo, código, temporizador. No somos un VPN, un banco, una app de citas ni una casa de apuestas.',
            'Inglés y francés en /blog y /fr/blog.'
          ]
        }
      ]
    }
  },
  {
    en: {
      slug: 'blog/halloween-group-chat-without-whatsapp',
      title: 'Halloween group chat: costumes, ice, and a room that ends 1 November',
      seoTitle: 'Halloween Group Chat and Party Planning Without WhatsApp | QuickRoom',
      description:
        'A witty Halloween party planning group chat for adults in the US, UK, Canada, and Europe. Costume votes, snack lists, no leftover thread in November.',
      intro:
        'Halloween is a 24-hour permission slip to be ridiculous. The WhatsApp named “🎃💀???” is a 365-day hostage situation. Here is a room that knows when October ends.',
      sections: [
        {
          heading: 'Four weeks out (yes, now)',
          paragraphs: [
            'Search phrases people actually type: Halloween group chat, Halloween party planning, costume group chat, Friendsgiving-adjacent snack diplomacy. Create an Event room in early October. Private. Expiry 1 November, or 24 hours if your guests make decisions like raccoons.',
            'Share the code in the one Instagram close-friends note or email that already has the adults. QuickRoom is 18+. Children’s trick-or-treat logistics belong in a school-approved tool, not here.'
          ],
          figure: PRODUCT_SHOTS.create
        },
        {
          heading: 'What the thread is for',
          list: [
            'Costume vetoes (“no, we are not all going as Excel”).',
            'A photo of the porch so people can find the house without doxxing the postcode in a public post.',
            'Ice, cups, who is allergic to the dip.',
            'A 23:47 message that simply says “the neighbours have a fog machine and I am afraid.”'
          ]
        },
        {
          heading: 'What it is not',
          paragraphs: [
            'Not a dating app in a witch hat. Not a stranger lobby. Not a place for under-18 costume clubs. If you want the group to persist as a friend circle, you already have iMessage. This room is the party’s digestive system: useful, then gone.'
          ],
          figure: PRODUCT_SHOTS.share
        }
      ]
    },
    fr: {
      slug: 'fr/blog/chat-groupe-halloween-sans-whatsapp',
      title: 'Chat de groupe Halloween : costumes, glaçons, et une salle morte le 1er novembre',
      seoTitle: 'Chat de groupe Halloween sans WhatsApp | QuickRoom',
      description:
        'Organisation de soirée Halloween pour adultes : votes de costumes, listes de courses, pas de fil éternel en novembre. France, Belgique, Suisse, Canada.',
      intro:
        'Halloween dure une nuit. Le groupe « 🎃💀??? » dure jusqu’à Pâques. Voici une salle qui a lu le calendrier.',
      sections: [
        {
          heading: 'Quatre semaines avant',
          paragraphs: [
            'Mots-clés : chat groupe Halloween, organisation soirée Halloween, costumes groupe. Créez une salle Événement, privée, expiration le 1er novembre.',
            'QuickRoom est réservé aux 18+. Les sorties d’enfants, ce n’est pas ici.'
          ]
        },
        {
          heading: 'À mettre dans le fil',
          list: [
            'Veto costumes.',
            'Photo du porche, pas l’adresse complète en public.',
            'Glaçons, gobelets, allergies.',
            'Le message de 23 h 47 : « les voisins ont une machine à fumée et j’ai peur. »'
          ]
        },
        {
          heading: 'Ce que ce n’est pas',
          paragraphs: [
            'Pas une appli de rencontre en chapeau de sorcière, pas un lobby d’inconnus. Si le groupe doit durer, vous avez déjà WhatsApp. Cette salle est le métabolisme de la fête.'
          ]
        }
      ]
    },
    es: {
      slug: 'es/blog/chat-grupal-halloween-sin-whatsapp',
      title: 'Chat de Halloween: disfraces, hielo y una sala que muere el 1 de noviembre',
      seoTitle: 'Chat de grupo para Halloween sin WhatsApp | QuickRoom',
      description:
        'Organiza la fiesta de Halloween para adultos en EE. UU., Reino Unido, Canadá y Europa. Votos de disfraz, lista de snacks, sin hilo eterno en noviembre.',
      intro:
        'Halloween dura una noche. El grupo «🎃💀???» dura hasta abril. Aquí va una sala que entiende octubre.',
      sections: [
        {
          heading: 'Cuatro semanas antes',
          paragraphs: [
            'Frases de búsqueda: chat grupal Halloween, organizar fiesta Halloween, disfraces grupo. Sala Evento, privada, caducidad el 1 de noviembre.',
            'QuickRoom es solo 18+. La logística infantil no va aquí.'
          ]
        },
        {
          heading: 'Para qué sirve el hilo',
          list: [
            'Vetos de disfraz.',
            'Foto del porche, no el código postal en un post público.',
            'Hielo, vasos, alergias.',
            'El mensaje de las 23:47: «los vecinos tienen máquina de humo y me da miedo».'
          ]
        },
        {
          heading: 'Lo que no es',
          paragraphs: [
            'No es una app de citas con sombrero de bruja ni un lobby de extraños. Si el grupo debe seguir, ya tienes WhatsApp. Esta sala es el metabolismo de la fiesta.'
          ]
        }
      ]
    }
  },
  {
    en: {
      slug: 'blog/election-night-group-chat-usa-2026',
      title: 'Election night without turning the family WhatsApp into a war crime',
      seoTitle: 'Election Night Group Chat 2026 Midterms Without WhatsApp | QuickRoom',
      description:
        'A temporary US midterms 2026 election night group chat for adults. Keep the family thread for birthdays; put the maps in a room that expires 4 November.',
      intro:
        'On 3 November 2026 the maps will refresh faster than anyone’s manners. You can watch with friends without tattooing the argument onto a family group that also contains a cousin’s baby photos. That is not cowardice. That is interior design.',
      sections: [
        {
          heading: 'Keywords people will type at 21:00 Eastern',
          paragraphs: [
            'Election night group chat, midterms 2026 live chat, family politics without WhatsApp, watch party results. Create the room four weeks out (early October) so the code is already in the calendar invite. Private. Name it after the night, not after a candidate.',
            'UK, Canada, and Western Europe will lurk too—US nights are a spectator sport. Same setup: adults only, expiry the next morning, no “who did you vote for” roll call in a tool that is not a civic record.'
          ],
          figure: PRODUCT_SHOTS.chat
        },
        {
          heading: 'House rules that keep the furniture intact',
          list: [
            'Screenshots of maps: fine. Doxxing poll workers: never.',
            'If it would get you thrown out of a pub, do not type it.',
            'Money, donations, and official results live on official sites—not as a spreadsheet in the room.',
            'When someone needs a break, they close the tab. The room will die at expiry whether or not Uncle finishes his TED Talk.'
          ]
        },
        {
          heading: 'Why not the family group',
          paragraphs: [
            'Because you still want to be invited at Thanksgiving. A disposable election-night room is how adults watch a civic circus without turning kinship into a mention. Set expiry for 4 November 2026 and go outside.'
          ]
        }
      ]
    },
    fr: {
      slug: 'fr/blog/chat-soir-election-usa-2026',
      title: 'Le soir d’élection sans transformer le WhatsApp familial en crime de guerre',
      seoTitle: 'Chat soir d’élection midterms 2026 sans WhatsApp | QuickRoom',
      description:
        'Salle temporaire pour la nuit des midterms américaines 2026. Le groupe famille garde les anniversaires ; les cartes vont dans une salle qui expire le 4 novembre.',
      intro:
        'Le 3 novembre 2026, les cartes iront plus vite que les bonnes manières. On peut regarder entre adultes sans tatouer la dispute sur le groupe où il y a aussi les photos de bébé.',
      sections: [
        {
          heading: 'Mots-clés à 3 h du matin, heure de Paris',
          paragraphs: [
            'Chat soir d’élection, midterms 2026, résultats en direct entre amis. Créez la salle quatre semaines avant, privée, nommée d’après la nuit, pas d’après un candidat. Expiration le lendemain.'
          ]
        },
        {
          heading: 'Règles de maison',
          list: [
            'Captures de cartes : oui. Harcèlement : jamais.',
            'Si ça vous ferait virer d’un café, ne le tapez pas.',
            'Les dons et résultats officiels restent sur les sites officiels.',
            'Fermer l’onglet est autorisé. La salle mourra à l’heure dite.'
          ]
        },
        {
          heading: 'Pourquoi pas le groupe famille',
          paragraphs: [
            'Parce que vous voulez encore être invité à Noël. Une salle jetable, c’est de la décoration intérieure civique.'
          ]
        }
      ]
    },
    es: {
      slug: 'es/blog/chat-noche-electoral-eeuu-2026',
      title: 'Noche electoral sin convertir el WhatsApp familiar en un crimen de guerra',
      seoTitle: 'Chat noche electoral midterms 2026 sin WhatsApp | QuickRoom',
      description:
        'Sala temporal para la noche de los midterms de EE. UU. 2026. El grupo familiar se queda con los cumpleaños; los mapas van a una sala que caduca el 4 de noviembre.',
      intro:
        'El 3 de noviembre de 2026 los mapas irán más rápido que los modales. Se puede ver entre adultos sin tatuar la pelea en el grupo donde también están las fotos del bebé.',
      sections: [
        {
          heading: 'Qué buscarán a las 3 de la mañana en Madrid',
          paragraphs: [
            'Chat noche electoral, midterms 2026, resultados en directo con amigos. Crea la sala cuatro semanas antes, privada, con el nombre de la noche. Caducidad a la mañana siguiente.'
          ]
        },
        {
          heading: 'Normas de la casa',
          list: [
            'Capturas de mapas: sí. Acosar: nunca.',
            'Si te echarían de un bar, no lo escribas.',
            'Donaciones y resultados oficiales, en sitios oficiales.',
            'Cerrar la pestaña está permitido. La sala morirá a su hora.'
          ]
        },
        {
          heading: 'Por qué no el grupo familiar',
          paragraphs: [
            'Porque aún quieres que te inviten en Navidad. Una sala desechable es diseño de interiores cívico.'
          ]
        }
      ]
    }
  },
  {
    en: {
      slug: 'blog/black-friday-deal-chat-without-family-group',
      title: 'Black Friday deal chat that will not haunt your phone in January',
      seoTitle: 'Black Friday and Cyber Monday Group Chat | Gift Deals | QuickRoom',
      description:
        'Share Black Friday and Cyber Monday deals in a timed group chat. Gifts, travel insurance, and shopping lists for US, UK, Canada, and Europe—no January hangover thread.',
      intro:
        'November is a contact sport: gifts, fake discounts, “should we buy travel insurance,” and a cousin who forwards every 3% off. You can hunt together without letting the hunt become the family operating system.',
      sections: [
        {
          heading: 'Why this window pays (and why your chat should still expire)',
          paragraphs: [
            'From October through December, advertisers bid up finance, gifts, VPN travel/privacy, and insurance. That is their business. Yours is not hosting a permanent “DEALS!!!” museum. Open a Private room covering Black Friday (27 November 2026) through Cyber Monday. Seven-day expiry is the whole personality.',
            'Keywords: Black Friday group chat, Cyber Monday deals chat, gift exchange group chat, Secret Santa ideas without WhatsApp.'
          ],
          figure: PRODUCT_SHOTS.share
        },
        {
          heading: 'A responsible little greed',
          list: [
            'Paste the link. Do not paste the card number.',
            'If a price looks like a hostage situation, it is. Walk away.',
            'Insurance and VPN purchases belong on the vendor site, not as a screenshot of a CVV.',
            'UK Boxing Day browsers and US doorbuster people can share a room; they cannot share a personality. Mute is a gift.'
          ]
        },
        {
          heading: 'After Cyber Monday',
          paragraphs: [
            'Let the room die. Returns go in the retailer app. The family group can go back to birthdays, which is the only thread that earned permanence.'
          ]
        }
      ]
    },
    fr: {
      slug: 'fr/blog/chat-black-friday-sans-groupe-famille',
      title: 'Le chat Black Friday qui ne hantera pas votre téléphone en janvier',
      seoTitle: 'Chat Black Friday et Cyber Monday — bons plans cadeaux | QuickRoom',
      description:
        'Partagez les bons plans Black Friday et Cyber Monday dans une salle minuté. Cadeaux, assurance voyage — sans fil fantôme en janvier.',
      intro:
        'Novembre est un sport de contact : cadeaux, fausses promos, « on prend une assurance voyage ? » et le cousin qui transmet 3 % de réduction. On peut chasser ensemble sans faire de la chasse le système d’exploitation familial.',
      sections: [
        {
          heading: 'Pourquoi cette fenêtre, pourquoi expirer quand même',
          paragraphs: [
            'D’octobre à décembre, les enchères montent sur la finance, les cadeaux, les VPN et l’assurance. Ouvrez une salle privée du Black Friday (27 novembre 2026) au Cyber Monday, expiration 7 jours.',
            'Mots-clés : groupe Black Friday, bons plans Cyber Monday, cadeaux sans WhatsApp.'
          ]
        },
        {
          heading: 'Une petite avidité raisonnable',
          list: [
            'Collez le lien, pas le numéro de carte.',
            'Un prix trop beau est un piège.',
            'Les achats d’assurance et de VPN se font sur le site du vendeur.',
            'Couper les notifications est un cadeau.'
          ]
        },
        {
          heading: 'Après Cyber Monday',
          paragraphs: [
            'Laissez la salle mourir. Les retours vont dans l’appli du marchand. Le groupe famille reprend les anniversaires.'
          ]
        }
      ]
    },
    es: {
      slug: 'es/blog/chat-black-friday-sin-grupo-familiar',
      title: 'El chat de Black Friday que no te perseguirá el teléfono en enero',
      seoTitle: 'Chat Black Friday y Cyber Monday — ofertas y regalos | QuickRoom',
      description:
        'Comparte ofertas de Black Friday y Cyber Monday en un chat con fecha de caducidad. Regalos y seguros de viaje, sin hilo fantasma en enero.',
      intro:
        'Noviembre es un deporte de contacto: regalos, descuentos falsos, «¿pillamos seguro de viaje?» y el primo que reenvía el 3 %. Se puede cazar en grupo sin convertir la caza en el sistema operativo familiar.',
      sections: [
        {
          heading: 'Por qué esta ventana, y por qué debe caducar',
          paragraphs: [
            'De octubre a diciembre suben las pujas de finanzas, regalos, VPN y seguros. Abre una sala privada del Black Friday (27 de noviembre de 2026) al Cyber Monday, caducidad de 7 días.',
            'Palabras clave: grupo Black Friday, ofertas Cyber Monday, chat de regalos sin WhatsApp.'
          ]
        },
        {
          heading: 'Una avaricia decente',
          list: [
            'Pega el enlace, no el número de tarjeta.',
            'Si el precio parece un secuestro, lo es.',
            'Seguros y VPN, en la web del vendedor.',
            'Silenciar notificaciones también es un regalo.'
          ]
        },
        {
          heading: 'Después del Cyber Monday',
          paragraphs: [
            'Deja morir la sala. Las devoluciones van en la app de la tienda. El grupo familiar vuelve a los cumpleaños.'
          ]
        }
      ]
    }
  },
  {
    en: {
      slug: 'blog/vpn-travel-chat-privacy',
      title: 'Pack a VPN, not a leftover group: travel chat that expires',
      seoTitle: 'VPN for Travel and Privacy — Temporary Trip Group Chat | QuickRoom',
      description:
        'Use a travel VPN for café Wi‑Fi and a QuickRoom for the itinerary. Private trip planning chat without WhatsApp for USA, UK, Canada, and Europe.',
      intro:
        '“Best VPN for travel” is a sensible search: hotel Wi‑Fi collects hobbies you did not consent to. “Family trip WhatsApp 2018–present” is how boarding passes become folklore. Encrypt the pipe. Expire the chatter.',
      sections: [
        {
          heading: 'Two different privacy jobs',
          paragraphs: [
            'A VPN (the product you are probably about to be advertised) hides your traffic from the network. QuickRoom hides nothing magical from the operator of a website—read the privacy policy—but it does refuse to demand a phone number, and it deletes the room when the timer ends.',
            'Together they match how adults actually travel: bank on a VPN, coordinate on a code, stop coordinating when the suitcase is in the hall.'
          ],
          figure: PRODUCT_SHOTS.create
        },
        {
          heading: 'Setup for a week in Lisbon / a long weekend in Lyon',
          list: [
            'Private Family or Event room named after the trip.',
            'Expiry: flight home + 24 hours.',
            'Code in the email that already has the bookings—not on a public story.',
            'No passport scans, no OTPs, no “here is the full card.” The VPN will not save you from that kind of creativity.'
          ]
        },
        {
          heading: 'Who this is for',
          paragraphs: [
            'US groups split by iMessage. UK and Western Europe live on WhatsApp. Canada shrugs and uses both. A browser link is the uncool solution that works at the airport when someone forgot their SIM drama. Digital nomads: three-month expiry exists, but if the trip is a lifestyle, you already wanted Slack.'
          ]
        }
      ]
    },
    fr: {
      slug: 'fr/blog/vpn-voyage-chat-confidentialite',
      title: 'Emportez un VPN, pas un groupe éternel : le chat de voyage qui expire',
      seoTitle: 'VPN voyage et confidentialité — chat de trajet temporaire | QuickRoom',
      description:
        'VPN pour le Wi‑Fi de l’hôtel, QuickRoom pour l’itinéraire. Chat de voyage privé sans WhatsApp, sans numéro de téléphone.',
      intro:
        '« Meilleur VPN voyage » est une recherche raisonnable. « Groupe famille vacances 2018–présent » est une légende urbaine avec des cartes d’embarquement. Chiffrez le tuyau. Faites expirer le bavardage.',
      sections: [
        {
          heading: 'Deux emplois de confidentialité différents',
          paragraphs: [
            'Le VPN cache le trafic au réseau. QuickRoom n’est pas magique — lisez la politique de confidentialité — mais ne demande pas de numéro et efface la salle à l’heure dite.'
          ]
        },
        {
          heading: 'Réglage pour une semaine à Lisbonne',
          list: [
            'Salle privée Famille ou Événement au nom du voyage.',
            'Expiration : vol retour + 24 h.',
            'Code dans l’e-mail des réservations.',
            'Pas de passeports ni de codes SMS dans le chat.'
          ]
        },
        {
          heading: 'Pour qui',
          paragraphs: [
            'Le Royaume-Uni et l’Europe de l’Ouest vivent sur WhatsApp. Un lien navigateur marche à l’aéroport quand la carte SIM a des états d’âme.'
          ]
        }
      ]
    },
    es: {
      slug: 'es/blog/vpn-viaje-chat-privacidad',
      title: 'Lleva un VPN, no un grupo eterno: el chat de viaje que caduca',
      seoTitle: 'VPN para viajar y privacidad — chat de viaje temporal | QuickRoom',
      description:
        'VPN para el Wi‑Fi del hotel, QuickRoom para el itinerario. Chat de viaje privado sin WhatsApp y sin número de teléfono.',
      intro:
        '«Mejor VPN para viajar» es una búsqueda sensata. «Grupo familia vacaciones 2018–presente» es folklore con tarjetas de embarque. Cifra el tubo. Haz caducar la charla.',
      sections: [
        {
          heading: 'Dos trabajos de privacidad distintos',
          paragraphs: [
            'El VPN oculta el tráfico a la red. QuickRoom no es magia — lee la política de privacidad — pero no pide teléfono y borra la sala cuando toca.'
          ]
        },
        {
          heading: 'Para una semana en Lisboa',
          list: [
            'Sala privada Familia o Evento con el nombre del viaje.',
            'Caducidad: vuelo de vuelta + 24 h.',
            'Código en el correo de las reservas.',
            'Ni pasaportes ni SMS de un solo uso en el chat.'
          ]
        },
        {
          heading: 'Para quién',
          paragraphs: [
            'En España y Europa occidental el default es WhatsApp. Un enlace de navegador funciona en el aeropuerto cuando la SIM tiene un día difícil.'
          ]
        }
      ]
    }
  },
  {
    en: {
      slug: 'blog/group-date-chat-without-the-app',
      title: 'Group-date logistics without adding your situationship to iMessage',
      seoTitle: 'Group Date Chat Without WhatsApp or the Dating App | QuickRoom',
      description:
        '18+ group date and friends-as-wingpeople chat that expires after the pint. Not a dating app—just a room code for adults in the US, UK, Canada, and Europe.',
      intro:
        'January will try to sell you a new personality (diets, dating, debt). October is already selling you costumes. In every season, the worst feature of modern romance is the group chat that outlives the spark. A six-hour room has more emotional intelligence than that.',
      sections: [
        {
          heading: 'Search phrases, minus the fairy tale',
          paragraphs: [
            'Group date ideas, group dating chat, meet in public with friends, dating app group chat without WhatsApp. QuickRoom is not a dating platform and will not match you with strangers. It is the thread for four adults who already decided on a Tuesday.',
            'Private room, recognisable nicknames, expiry six hours or 24 hours. If the date goes well, you already have the app. If it does not, the room has the decency to vanish.'
          ],
          figure: PRODUCT_SHOTS.chat
        },
        {
          heading: 'Boring safety, which is the hot kind',
          list: [
            'Public venue. Tell someone outside the room.',
            'No home address, no live location of your building, no ID photos.',
            '18+ only. This is not a teens hangout and not video roulette.',
            'January reset crowds: same rules. A “dry January / back on the apps” room is still not a dating site.'
          ]
        },
        {
          heading: 'Why the dating app should stay the dating app',
          paragraphs: [
            'Mixing logistics into the match thread trains everyone to negotiate like a support ticket. Mixing it into WhatsApp trains everyone to stay. A disposable room is the grown-up third place: maps, “we are in the booth,” a photo of the sign, then silence as a service.'
          ]
        }
      ]
    },
    fr: {
      slug: 'fr/blog/chat-rendez-vous-groupe-sans-appli',
      title: 'La logistique du rendez-vous en groupe sans ajouter le plan cul à iMessage',
      seoTitle: 'Chat rendez-vous en groupe sans WhatsApp | QuickRoom',
      description:
        'Chat 18+ pour un verre à quatre qui expire après la tournée. Pas une appli de rencontre — juste un code de salle.',
      intro:
        'Janvier vendra des régimes, des dates et des dettes. Dans toutes les saisons, le pire de la romance moderne est le groupe qui survit à l’étincelle. Une salle de six heures a plus d’intelligence émotionnelle.',
      sections: [
        {
          heading: 'Mots-clés, sans conte de fées',
          paragraphs: [
            'Idées de rendez-vous en groupe, chat entre amis, se retrouver en public. QuickRoom ne vous marie pas. Salle privée, surnoms lisibles, expiration 6 h ou 24 h.'
          ]
        },
        {
          heading: 'La sécurité ennuyeuse, donc désirable',
          list: [
            'Lieu public. Prévenez quelqu’un hors salle.',
            'Pas d’adresse perso ni de pièce d’identité.',
            '18+ uniquement.',
            'Le « dry January / je reviens aux applis » n’est toujours pas un site de rencontre.'
          ]
        },
        {
          heading: 'L’appli de rencontre reste l’appli de rencontre',
          paragraphs: [
            'Un troisième lieu jetable : le plan, « on est au fond », la photo de l’enseigne, puis le silence comme service.'
          ]
        }
      ]
    },
    es: {
      slug: 'es/blog/chat-cita-en-grupo-sin-la-app',
      title: 'Logística de la cita en grupo sin añadir tu lío a iMessage',
      seoTitle: 'Chat para citas en grupo sin WhatsApp | QuickRoom',
      description:
        'Chat 18+ para una caña entre cuatro que caduca después. No es una app de citas: solo un código de sala.',
      intro:
        'Enero venderá dietas, citas y deudas. En cualquier estación, lo peor del romance moderno es el grupo que sobrevive a la chispa. Una sala de seis horas tiene más inteligencia emocional.',
      sections: [
        {
          heading: 'Frases de búsqueda, sin cuento',
          paragraphs: [
            'Ideas de cita en grupo, chat con amigos, quedar en un sitio público. QuickRoom no te empareja. Sala privada, apodos reconocibles, caducidad 6 h o 24 h.'
          ]
        },
        {
          heading: 'Seguridad aburrida, o sea atractiva',
          list: [
            'Sitio público. Avísale a alguien fuera de la sala.',
            'Ni dirección ni DNI en el chat.',
            'Solo 18+.',
            'El chat de «enero seco / vuelvo a las apps» sigue sin ser una web de citas.'
          ]
        },
        {
          heading: 'La app de citas se queda en la app de citas',
          paragraphs: [
            'Tercer lugar desechable: el mapa, «estamos al fondo», la foto del letrero, y el silencio como servicio.'
          ]
        }
      ]
    }
  },
  {
    en: {
      slug: 'blog/nfl-premier-league-watch-party-chat',
      title: 'Fantasy league chat that expires when your dignity does',
      seoTitle: 'NFL and Premier League Watch Party Chat | Fantasy Football Room | QuickRoom',
      description:
        'Temporary NFL, Premier League, and Champions League watch-party chat for 18+ friends in the USA, UK, Canada, and Western Europe. Not a bookmaker.',
      intro:
        'Football—any spelling—already has a clock. Your banter does not. A watch-party room is how adults shout at a screen together without leaving a museum of bad takes for the algorithm of kinship.',
      sections: [
        {
          heading: 'The searches, with the small print',
          paragraphs: [
            'NFL watch party chat, Sunday Ticket group chat, Premier League pub chat, FPL mini league, Champions League watch party. QuickRoom is not a sportsbook, not a casino, not a stranger betting lobby. If you run a sweepstake or fantasy league where that is legal, keep the money in the tool you already trust.',
            'Gamble only if it is lawful where you live, only with money you can lose, and never as a personality. The room is for “who has the remote” and unsolicited VAR theology.'
          ],
          figure: PRODUCT_SHOTS.chat
        },
        {
          heading: 'Match-day setup',
          list: [
            'Gaming or Event template, Private, 6 hours for one fixture or 7 days for a playoff week.',
            'Name it after the match, not after a moneyline.',
            'Adults only. Kids’ teams use a school tool.',
            'Crypto rally weekends use the same pattern: a timed room for friends, not a tips hotline, not financial advice.'
          ]
        },
        {
          heading: 'When the season ends',
          paragraphs: [
            'Let the room expire. Champions do not need a group administrator. If you still like each other in March, you already know how to text one to one like a civilised mammal.'
          ]
        }
      ]
    },
    fr: {
      slug: 'fr/blog/chat-watch-party-premier-league-nfl',
      title: 'Le chat fantasy qui expire avec votre dignité',
      seoTitle: 'Chat soirée foot Premier League et NFL | QuickRoom',
      description:
        'Salle temporaire pour regarder la Premier League, la Ligue des champions ou la NFL entre adultes. Pas un bookmaker.',
      intro:
        'Le football a déjà un chronomètre. Vos analyses, non. Une salle le temps du match, c’est hurler ensemble sans laisser un musée de mauvaises prises.',
      sections: [
        {
          heading: 'Les recherches, avec les petites lignes',
          paragraphs: [
            'Soirée foot, chat Premier League, watch party Ligue des champions, NFL. QuickRoom n’est pas un site de paris. Un sweepstake légal garde l’argent ailleurs. Jouer seulement si c’est légal chez vous, avec de l’argent que vous pouvez perdre.'
          ]
        },
        {
          heading: 'Le jour du match',
          list: [
            'Modèle Gaming ou Événement, privée, 6 h ou 7 jours.',
            'Nommez d’après le match, pas d’après une cote.',
            '18+ uniquement.',
            'Même schéma pour un week-end « crypto rally » entre amis : pas un hotline de conseils financiers.'
          ]
        },
        {
          heading: 'Quand la saison finit',
          paragraphs: [
            'Laissez expirer. Les champions n’ont pas besoin d’un administrateur de groupe.'
          ]
        }
      ]
    },
    es: {
      slug: 'es/blog/chat-ver-el-partido-premier-nfl',
      title: 'El chat fantasy que caduca cuando se acaba tu dignidad',
      seoTitle: 'Chat para ver la Premier League y la NFL | QuickRoom',
      description:
        'Sala temporal para ver la Premier, la Champions o la NFL entre adultos. No somos una casa de apuestas.',
      intro:
        'El fútbol ya tiene cronómetro. Tus análisis, no. Una sala durante el partido es gritar juntos sin dejar un museo de malas tomas.',
      sections: [
        {
          heading: 'Búsquedas, con la letra pequeña',
          paragraphs: [
            'Ver el partido, chat Premier League, watch party Champions, NFL. QuickRoom no es un sportsbook. Si hacéis una porra legal, el dinero se queda en otra herramienta. Apostar solo si es legal donde vives, con dinero que puedes perder.'
          ]
        },
        {
          heading: 'El día del partido',
          list: [
            'Plantilla Gaming o Evento, privada, 6 h o 7 días.',
            'Nombre del partido, no de una cuota.',
            'Solo 18+.',
            'El mismo truco para un rally cripto entre amigos: no es un consultorio financiero.'
          ]
        },
        {
          heading: 'Cuando acaba la temporada',
          paragraphs: [
            'Deja que caduque. Los campeones no necesitan administrador de grupo.'
          ]
        }
      ]
    }
  },
  {
    en: {
      slug: 'blog/year-end-money-talk-housemate-bills',
      title: 'Year-end money talk without a permanent “finance bros” group',
      seoTitle: 'Split Bills, Insurance, and Year-End Money Chat | QuickRoom',
      description:
        'Temporary housemate chat for energy bills, broadband, insurance quotes, and year-end money talks in the UK, US, Canada, and Europe. Not financial advice.',
      intro:
        'October to December is when grown-ups remember that heat costs money, contents insurance exists, and someone should ask whether the broadband is still named after a housemate who left in 2022. That conversation deserves a timer, not a brand.',
      sections: [
        {
          heading: 'The searches that pay, the chat that should not last',
          paragraphs: [
            'Split rent chat, energy switch UK, compare broadband, contents insurance quotes, year-end budget, 401k / ISA chat among friends. Advertisers love this season. Your group does not need to become their forever retargeting pool inside a family thread.',
            'QuickRoom is not a bank, broker, or comparison site. Keep account numbers in the bank app. The room is for “engineer is in the drive” and a photo of the meter that looks like modern art.'
          ],
          figure: PRODUCT_SHOTS.share
        },
        {
          heading: 'A boring, correct setup',
          list: [
            'Business or Family template, Private.',
            '7 days for a switch-over week, 3 months if the tenancy is a telenovela.',
            'No NI / SSN / full IBAN in the transcript.',
            'January reset: start a fresh room for “debt diet” accountability. Do not recycle the Halloween thread. That is how hauntings work.'
          ]
        },
        {
          heading: 'Not advice, just a lid on the group',
          paragraphs: [
            'If you need regulated advice, call a regulated human. If you need a lid, set expiry. When the tenancy ends, the chat should end. Ghosts belong in October, not in the standing order.'
          ]
        }
      ]
    },
    fr: {
      slug: 'fr/blog/fin-dannee-argent-colocation-factures',
      title: 'Parler argent en fin d’année sans groupe « finance bros » éternel',
      seoTitle: 'Chat colocation factures énergie assurance | QuickRoom',
      description:
        'Salle temporaire pour loyer, énergie, box internet et assurances entre colocs. Pas un conseil financier.',
      intro:
        'D’octobre à décembre, les adultes se souviennent que le chauffage coûte, que l’assurance habitation existe, et que la box est encore au nom de celui parti en 2022. Cette conversation mérite un minuteur.',
      sections: [
        {
          heading: 'Les recherches qui paient',
          paragraphs: [
            'Partager le loyer, changer de fournisseur d’énergie, comparer la fibre, devis assurance. QuickRoom n’est pas une banque. Les RIB restent dans l’appli. La salle sert à « le chauffagiste est dans la cour ».'
          ]
        },
        {
          heading: 'Réglage',
          list: [
            'Modèle Business ou Famille, privée.',
            '7 jours ou 3 mois.',
            'Pas de numéro de sécurité sociale dans le fil.',
            'En janvier, une nouvelle salle « budget » — ne recyclez pas Halloween.'
          ]
        },
        {
          heading: 'Pas un conseil, un couvercle',
          paragraphs: [
            'Pour un conseil réglementé, un humain réglementé. Pour un couvercle, une date d’expiration.'
          ]
        }
      ]
    },
    es: {
      slug: 'es/blog/dinero-fin-de-ano-facturas-piso',
      title: 'Hablar de dinero a fin de año sin un grupo eterno de “finance bros”',
      seoTitle: 'Chat para dividir facturas, luz y seguros del piso | QuickRoom',
      description:
        'Sala temporal para alquiler, luz, fibra y seguros entre compañeros de piso. No es asesoramiento financiero.',
      intro:
        'De octubre a diciembre los adultos recuerdan que la calefacción cuesta, que existe el seguro del hogar y que la fibra sigue a nombre del que se fue en 2022. Esa conversación merece un temporizador.',
      sections: [
        {
          heading: 'Las búsquedas que pagan',
          paragraphs: [
            'Dividir el alquiler, cambiar de luz, comparar fibra, seguro de hogar. QuickRoom no es un banco. Los IBAN se quedan en la app. La sala es para «el técnico está en el portal».'
          ]
        },
        {
          heading: 'Configuración',
          list: [
            'Plantilla Business o Familia, privada.',
            '7 días o 3 meses.',
            'Ni DNI ni cuentas completas en el hilo.',
            'En enero, sala nueva de presupuesto. No recicles Halloween.'
          ]
        },
        {
          heading: 'No es consejo, es tapa',
          paragraphs: [
            'Si necesitas asesoramiento regulado, llama a alguien regulado. Si necesitas tapa, pon caducidad.'
          ]
        }
      ]
    }
  }
];

export const commercialArticles = Object.fromEntries(
  packs.flatMap((pack) =>
    ['en', 'fr', 'es'].map((lang) => {
      const page = pack[lang];
      const { slug, ...rest } = page;
      return [slug, meta(rest, lang)];
    })
  )
);

export const COMMERCIAL_LANG_TRIPLETS = packs.map((pack) => ({
  en: `/${pack.en.slug}`,
  fr: `/${pack.fr.slug}`,
  es: `/${pack.es.slug}`
}));
