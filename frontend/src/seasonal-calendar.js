/** Editorial calendar for commercial / seasonal posts. Review every 14 days. */

export const SEASONAL_PLAYBOOK = {
  cadenceDays: 14,
  writeWeeksBeforeEvent: 4,
  geos: ['US', 'GB', 'CA', 'Western Europe'],
  verticals: ['VPN', 'finance', 'dating', 'iGaming', 'utilities'],
  windows: [
    {
      id: 'oct-dec',
      months: [10, 11, 12],
      themes: ['finance', 'gifts', 'VPN travel/privacy', 'insurance'],
      note: 'Bids jump. Push year-end money talk, Black Friday chats, travel VPN, insurance quotes among housemates.'
    },
    {
      id: 'jan',
      months: [1],
      themes: ['diets', 'finance resets', 'dating'],
      note: 'CPM dips then recovers. Ship New Year reset + dating logistics pages before 1 January.'
    },
    {
      id: 'spikes',
      themes: ['sports seasons', 'elections', 'crypto rallies'],
      note: 'Spin or refresh supporting pages fast. Prefer updating the same URL.'
    }
  ]
};

/** Dates are UTC calendar days. writeFrom = four weeks before eventDay. */
export const UPCOMING_EVENTS = [
  {
    id: 'nfl-2026',
    eventDay: '2026-09-10',
    writeFrom: '2026-08-13',
    title: 'NFL regular season',
    keywords: ['NFL watch party chat', 'Sunday ticket group chat', 'fantasy football chat no app']
  },
  {
    id: 'premier-league-2026',
    eventDay: '2026-09-10',
    writeFrom: '2026-08-13',
    title: 'Premier League weekends',
    keywords: ['Premier League pub chat', 'football watch party group chat', 'FPL mini league chat']
  },
  {
    id: 'halloween-2026',
    eventDay: '2026-10-31',
    writeFrom: '2026-10-03',
    title: 'Halloween',
    keywords: ['Halloween group chat', 'Halloween party planning chat', 'costume group chat']
  },
  {
    id: 'diwali-2026',
    eventDay: '2026-10-29',
    writeFrom: '2026-10-01',
    title: 'Diwali',
    keywords: ['Diwali planning group chat', 'festival travel chat', 'family festival chat no WhatsApp']
  },
  {
    id: 'us-midterms-2026',
    eventDay: '2026-11-03',
    writeFrom: '2026-10-06',
    title: 'US midterm election night',
    keywords: ['election night group chat', 'midterms 2026 chat', 'family politics chat without WhatsApp']
  },
  {
    id: 'thanksgiving-2026',
    eventDay: '2026-11-26',
    writeFrom: '2026-10-29',
    title: 'US Thanksgiving',
    keywords: ['Thanksgiving planning group chat', 'Friendsgiving chat', 'travel home group chat']
  },
  {
    id: 'black-friday-2026',
    eventDay: '2026-11-27',
    writeFrom: '2026-10-30',
    title: 'Black Friday / Cyber Monday',
    keywords: ['Black Friday group chat', 'Cyber Monday deals chat', 'gift exchange group chat']
  },
  {
    id: 'christmas-2026',
    eventDay: '2026-12-25',
    writeFrom: '2026-11-27',
    title: 'Christmas / Boxing Day',
    keywords: ['Secret Santa group chat', 'Christmas gift exchange chat', 'family holiday chat that expires']
  },
  {
    id: 'new-year-2027',
    eventDay: '2027-01-01',
    writeFrom: '2026-12-04',
    title: 'New Year reset',
    keywords: ['New Year resolution group chat', 'January budget chat', 'dry January group chat']
  }
];

export function eventsDue(todayIso = new Date().toISOString().slice(0, 10)) {
  return UPCOMING_EVENTS.filter((event) => event.writeFrom <= todayIso && event.eventDay >= todayIso);
}
