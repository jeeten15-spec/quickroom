/** Daily pipeline for selling the productized lead-desk package. */
export const outreach = {
  dailyTouchTarget: 65,
  weekdayHours: "09:30–18:30 IST",
  closeCall: {
    minutes: 15,
    agenda: [
      "Minute 0–3: Their current enquiry path (WhatsApp chaos, no dashboard).",
      "Minute 3–8: Show this live demo (hero → form → chat → calendar → admin).",
      "Minute 8–12: Package, deposit, what is not included.",
      "Minute 12–15: Next step — 50% invoice and brand kit (logo, RERA, photos).",
    ],
  },
  emailScript: `Subject: A landing page that books site visits — not another property portal

Dear {{name}},

Most Hyderabad project sites collect phone numbers and then lose the thread in WhatsApp.

I help {{firm}} put one page live that:
• states price and location without fake scarcity
• qualifies the buyer in a short conversation
• books a site visit against real slots
• puts hot leads on a sales dashboard the same hour

I am not selling a portal listing. It is a page for {{project-or-firm}} only.

15 minutes this week? I will screen-share a working demo (Aurevia Greens — clearly labelled sample).

{{sender}}`,
  phoneScript: `Hi {{name}}, I work with Hyderabad developers and consultants on enquiry-to-site-visit pages.
Quick question: when someone WhatsApps your project today, does a named advisor see a scored lead and a calendar slot, or is it a group chat?
If it's a group chat, I have a 15-minute demo of a page that books the visit. Tuesday 11:30 or Wednesday 16:00?`,
  whatsappScript: `Hello {{name}}, I build conversion pages for Hyderabad real-estate teams (not classified portals). Demo: gated villa plots in Mokila with lead scoring + visit booking. Open to a 15-min screen share this week?`,
} as const;

export const sampleOutreachList = [
  { firmName: "Sundar Estates (demo)", contactName: "Ravi Sundar", phone: "+91 90000 22001", area: "Gachibowli", channel: "PHONE" },
  { firmName: "Hillcrest Projects (demo)", contactName: "Anitha Rao", phone: "+91 90000 22002", area: "Kokapet", channel: "EMAIL" },
  { firmName: "Deccan Channel Partners (demo)", contactName: "Imran Ali", phone: "+91 90000 22003", area: "Banjara Hills", channel: "WHATSAPP" },
  { firmName: "Mokila Land Desk (demo)", contactName: "Lakshmi Devi", phone: "+91 90000 22004", area: "Mokila", channel: "WALKIN" },
  { firmName: "ORR Villa Advisors (demo)", contactName: "Nikhil Reddy", phone: "+91 90000 22005", area: "Shankarpally", channel: "PHONE" },
  { firmName: "Westline Consultants (demo)", contactName: "Farah Khan", phone: "+91 90000 22006", area: "Financial District", channel: "EMAIL" },
  { firmName: "Plotbook Hyderabad (demo)", contactName: "Suresh Babu", phone: "+91 90000 22007", area: "Tellapur", channel: "WHATSAPP" },
  { firmName: "Narsingi Homes Desk (demo)", contactName: "Divya Menon", phone: "+91 90000 22008", area: "Narsingi", channel: "PHONE" },
] as const;
