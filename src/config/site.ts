/**
 * Company-level branding and contact. Rebrand here — do not edit components.
 */
export const site = {
  companyName: "Aurevia Realty",
  legalName: "Aurevia Realty Demo Private Limited",
  logoText: "Aurevia",
  logoSrc: "/media/logo.svg",
  tagline: "Considered land, clearly explained.",
  phone: "+91 90000 11101",
  phoneTel: "+919000011101",
  whatsapp: "+91 90000 11102",
  whatsappE164: "919000011102",
  email: "ursula.b@example.com",
  salesRecipients: ["ursula.b@example.com", "olivia.t@example.org"],
  officeAddress: "Sample Office, Financial District, Gachibowli, Hyderabad 500032 (demo address)",
  mapQuery: "Mokila Shankarpally Hyderabad",
  social: {
    instagram: "https://instagram.com/aureviarealty.demo",
    linkedin: "https://linkedin.com/company/aureviarealty-demo",
    youtube: "https://youtube.com/@aureviarealty-demo",
  },
  brand: {
    ivory: "#F6F1E8",
    charcoal: "#1C1917",
    emerald: "#1B5C46",
    forest: "#0F3D30",
    gold: "#B0892E",
    sand: "#E8DFD0",
  },
  demoBanner: "Demonstration Website – Sample Project",
  privacyPolicy: `This is a demonstration privacy notice for a sample real-estate landing page.

Aurevia Realty (demo) would collect name, mobile number, optional email, requirement, qualification answers, site-visit details, UTM parameters, and consent timestamps solely to respond to enquiries.

We would not sell personal data. Communications (WhatsApp, call, email) would be sent only with recorded consent.

Data-deletion requests (production): email privacy@aurevia.example with the mobile number used on the form. This demo stores data in a local SQLite file on your machine.

This language is a placeholder. Obtain professional legal review under applicable Indian law (including the Digital Personal Data Protection Act, 2023) before production use.`,
  terms: `These demonstration terms describe a sample enquiry and site-visit service. They are not an offer to sell immovable property.

Plot prices, sizes, approvals and availability shown on this website are sample figures for a fictional project. Nothing here constitutes legal, tax or investment advice.

Site visits, pickup and advisor calls in this demo are simulated. Production bookings require verified slots, identity checks as required by the developer, and written documentation.

Cancellation/reschedule of a demo visit is unrestricted. Production refund and cancellation terms must be taken from the actual developer agreement — none exist for this fictional project.`,
  disclaimer: `Aurevia Greens is a fictional sample project created so consultants can demonstrate a lead-generation website. RERA numbers, approvals, testimonials, awards, possession dates and returns are placeholders and are not verified facts. Buyers must independently verify title, approvals, measurements, pricing, taxes and contract terms before any purchase.`,
  dataDeletionInstructions:
    "Email privacy@aurevia.example from the same address used on the form, or write to the demo office address, requesting erasure of your enquiry. In this local demo, use Admin → Reset demo data.",
} as const;

export type SiteConfig = typeof site;
