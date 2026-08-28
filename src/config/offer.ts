/**
 * Productized local-lead service this template is built to sell.
 * Niche: Hyderabad real-estate developers, brokers, channel partners, consultants.
 * Commercial package is for the agency demo script — not charged on this site.
 */
export const offer = {
  niche: "Hyderabad real-estate firms (developers, brokers, channel partners, property consultants)",
  geography: "Hyderabad Metropolitan Region, with first proof around west corridor launches",
  packageName: "Aurevia Lead Desk — 14-day launch",
  priceInr: "₹65,000 – ₹1,25,000",
  priceUsdNote: "About USD 750–1,500 depending on FX and scope (site visit automation vs. brochure-only).",
  deposit: "50% to start, remainder on launch. No custom scope until the package is paid.",
  includes: [
    "One conversion landing page rebranded from this template",
    "Lead capture, qualification chat, site-visit calendar",
    "WhatsApp deep-link + demo automations (production WhatsApp billed separately)",
    "Admin / sales dashboard with scoring and reminders",
    "Google Business Profile setup checklist and copy",
    "UTM + source tracking",
    "Handover README and 45-minute team walkthrough",
  ],
  doesNotInclude: [
    "Paid media spend",
    "Official WhatsApp Business / Meta fees",
    "Legal drafting of RERA or sale documents",
    "Guaranteed lead volume or booking conversions",
  ],
  closeCallMinutes: 15,
  retainer: {
    name: "Lead Desk retainer",
    monthlyInr: "₹25,000",
    monthlyUsdNote: "About USD 300",
    includes: [
      "Landing-page copy tweaks",
      "GBP weekly posts (copy + image prompts)",
      "Review-request scripts",
      "Monthly funnel review from the dashboard export",
    ],
  },
} as const;
