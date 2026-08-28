/**
 * Project-specific content. Swap this file (or its exports) to rebrand a new launch.
 */
export const project = {
  name: "Aurevia Greens",
  slug: "aurevia-greens",
  type: "Premium gated villa plots",
  headline: "Premium gated villa plots near Hyderabad’s next growth corridor",
  valueProposition:
    "A quiet, gated layout in the Mokila–Shankarpally belt — sized for a home you can plan with, not a listing you have to decode.",
  location: "Mokila–Shankarpally Growth Corridor, Hyderabad",
  locationShort: "Mokila, Hyderabad",
  startingPrice: "₹42 lakh",
  startingPriceAmount: 4200000,
  currency: "INR",
  plotSizes: "200–400 sq. yd.",
  plotSizeOptions: [
    { label: "200 sq. yd.", note: "Compact villa plot (indicative)" },
    { label: "300 sq. yd.", note: "Most requested band (indicative)" },
    { label: "400 sq. yd.", note: "Larger frontage options (indicative)" },
  ],
  status: "Ready for site visits (demo)",
  roadWidths: "Internal roads shown as 30–40 ft in the sample layout (illustrative)",
  rera: "P02400000000 (demo / placeholder — not a real RERA registration)",
  approvals: [
    { label: "RERA", detail: "Placeholder number only — labelled demo." },
    { label: "Layout", detail: "Sample layout drawing — not an approved plan." },
    { label: "Title note", detail: "Sample summary — not a legal opinion." },
  ],
  offer: "Complimentary pickup for scheduled weekend site visits (demo offer — subject to slot confirmation).",
  limitedAvailabilityEnabled: false,
  limitedAvailabilityMessage: "",
  siteVisitHours: {
    timezone: "Asia/Kolkata",
    slotMinutes: 45,
    bufferMinutes: 15,
    weekday: { start: "10:00", end: "18:00" },
    weekend: { start: "09:00", end: "17:00" },
    closedWeekdays: [] as number[],
    maxPerSlot: 1,
  },
  meetingPoint: "Aurevia Greens sample gate, Mokila (demo meeting point — confirm before travel)",
  map: {
    lat: 17.3895,
    lng: 78.1892,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Mokila+Shankarpally+Hyderabad",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Mokila+Shankarpally+Hyderabad",
  },
  brochureUrl: "/docs/brochure",
  costSheetUrl: "/docs/cost-sheet",
  hero: {
    image: "/media/hero.jpg",
    video: "/media/hero.mp4",
    poster: "/media/hero.jpg",
    alt: "Tree-lined gated entrance at the sample Aurevia Greens layout, Mokila, Hyderabad",
  },
  gallery: [
    {
      src: "/media/gallery-01.jpg",
      alt: "Wide internal road with young avenue trees in a gated layout (sample render-style photo)",
      caption: "Internal roads — sample visual",
    },
    {
      src: "/media/gallery-02.jpg",
      alt: "Open villa plot with marked boundaries under a clear sky (sample)",
      caption: "Plot frontage — sample visual",
    },
    {
      src: "/media/gallery-03.jpg",
      alt: "Landscaped walking path beside a lawn (sample lifestyle image)",
      caption: "Walking track — sample visual",
    },
    {
      src: "/media/gallery-04.jpg",
      alt: "Evening view of a clubhouse-style pavilion (placeholder amenity)",
      caption: "Community pavilion — placeholder",
    },
    {
      src: "/media/gallery-05.jpg",
      alt: "Children’s play lawn with shade trees (sample)",
      caption: "Play lawn — sample visual",
    },
    {
      src: "/media/gallery-06.jpg",
      alt: "Master-plan style overhead of plotted layout (placeholder diagram)",
      caption: "Sample master-plan diagram",
    },
  ],
  walkthrough: {
    src: "/media/hero.mp4",
    poster: "/media/gallery-06.jpg",
    caption: "Muted looping sample walkthrough (generated demo video, not an on-site recording).",
  },
  amenities: [
    { icon: "shield", title: "Gated security", copy: "Controlled entry and perimeter intent (sample amenity)." },
    { icon: "road", title: "Internal roads", copy: "Plotted roads with illustrated widths — confirm on site." },
    { icon: "trees", title: "Landscaping", copy: "Avenue planting and common lawns as shown in sample visuals." },
    { icon: "playground", title: "Children’s play area", copy: "Dedicated play lawn in the sample layout." },
    { icon: "building", title: "Clubhouse placeholder", copy: "Community pavilion shown as a future/common facility placeholder." },
    { icon: "droplet", title: "Utilities", copy: "Water, power and drainage intent — verify current connections on visit." },
    { icon: "footprints", title: "Walking track", copy: "Loop path around common landscape (sample)." },
    { icon: "users", title: "Community spaces", copy: "Gathering lawns for residents of the gated layout." },
  ],
  highlights: [
    { label: "Location", value: "Mokila–Shankarpally corridor" },
    { label: "Plot sizes", value: "200–400 sq. yd." },
    { label: "Starting price", value: "₹42 lakh (indicative)" },
    { label: "Status", value: "Ready for site visits (demo)" },
    { label: "Roads", value: "30–40 ft illustrated" },
    { label: "RERA", value: "Demo placeholder" },
  ],
  whyConsider: [
    {
      title: "Connectivity",
      body: "Illustrative access toward the Outer Ring Road and west Hyderabad employment belts. Travel times below are estimates, not guarantees.",
    },
    {
      title: "Liveability",
      body: "Gated layout, walking track and play lawns aimed at a quieter residential pace than inner-city apartments.",
    },
    {
      title: "Documentation clarity",
      body: "We list the documents buyers usually ask for. On this demo they are labelled samples. In production, files would be shared only as the developer authorises.",
    },
    {
      title: "Infrastructure",
      body: "Internal roads, utility corridors and common landscape are part of the sample story. Confirm what is complete versus proposed on your visit.",
    },
    {
      title: "Advisor, not a portal",
      body: "A named relationship manager walks the layout with you. This is a consultancy-style demo, not a classifieds marketplace.",
    },
    {
      title: "Site-visit assistance",
      body: "Weekend pickup is a sample offer for confirmed slots — not a public taxi service.",
    },
    {
      title: "Transparent price discussion",
      body: "Indicative starting price is shown up front. A full cost sheet (stamp, registration, extras) is available on request and must be confirmed in writing.",
    },
  ],
  landmarks: [
    { name: "Financial District", note: "Illustrative drive ~45–70 min depending on hour" },
    { name: "Gachibowli", note: "Illustrative drive ~50–75 min" },
    { name: "Kokapet / ORR west", note: "Illustrative drive ~35–55 min to nearest ORR interchange" },
    { name: "Schools (corridor)", note: "Several day-schools operate along Shankarpally Road — verify commute" },
    { name: "Hospitals", note: "Multi-speciality care is denser toward Gachibowli; local clinics in Shankarpally" },
    { name: "Rail / proposed infra", note: "Regional rail and road upgrades are often discussed for west Hyderabad — treat as unverified until you check current projects" },
  ],
  costComponents: [
    { label: "Indicative plot price (from)", value: "₹42 lakh", fact: "placeholder" },
    { label: "GST / taxes", value: "As applicable — confirm", fact: "placeholder" },
    { label: "Registration & stamp", value: "As per Telangana schedule", fact: "estimate" },
    { label: "Development / infra charges", value: "Share on cost sheet", fact: "placeholder" },
    { label: "Maintenance deposit", value: "If levied by association", fact: "placeholder" },
  ],
  process: [
    { step: 1, title: "Share requirement", body: "Plot size, budget band and timeline — two minutes, not a 20-field form." },
    { step: 2, title: "Receive matching options", body: "Your advisor confirms what is actually available in this sample inventory." },
    { step: 3, title: "Schedule a site visit", body: "Pick a slot. Weekend pickup can be requested." },
    { step: 4, title: "Verify price and documents", body: "Cost sheet, layout and title pack — labelled samples on this demo." },
    { step: 5, title: "Proceed only after due diligence", body: "No pressure close. Independent legal review is expected before any token." },
  ],
  testimonials: [
    {
      quote: "The visit was unhurried and the advisor explained what was complete versus still on paper.",
      name: "Demo testimonial — Ananya R.",
      role: "Sample homebuyer persona",
      demo: true,
    },
    {
      quote: "We asked for the cost sheet before the second visit. Having a named manager helped.",
      name: "Demo testimonial — Karthik & Meera",
      role: "Sample dual-income household",
      demo: true,
    },
    {
      quote: "Pickup from Gachibowli on Saturday made the corridor visit practical.",
      name: "Demo testimonial — Sandeep N.",
      role: "Sample NRI-family coordinator",
      demo: true,
    },
  ],
  stats: [
    { value: "12+ yrs", label: "Experience placeholder (not a verified claim)" },
    { value: "40+", label: "Projects-served placeholder (not a verified count)" },
    { value: "1:1", label: "Named relationship manager on confirmed visits" },
  ],
  salesTeam: {
    name: "Priya Narayan",
    role: "Relationship manager (sample profile)",
    phone: "+91 90000 11103",
    email: "zara.a@example.net",
    bio: "Coordinates west-Hyderabad plot visits for this demonstration brand. Not a licensed advertisement for a real individual.",
  },
  partners: ["Sample legal desk", "Sample banking desk", "Sample channel desk"],
  faqs: [
    {
      q: "Where exactly is Aurevia Greens?",
      a: "The sample location is the Mokila–Shankarpally growth corridor, west of Hyderabad. Pin the meeting point in Maps before you travel; this demo uses an approximate coordinate.",
    },
    {
      q: "What does the starting price include?",
      a: "₹42 lakh is an indicative plot price for demonstration. Taxes, registration, development charges and extras are not bundled unless a production cost sheet says so.",
    },
    {
      q: "What plot sizes are shown?",
      a: "Sample inventory is 200–400 square yards. Availability by size must be reconfirmed — this database is fictional.",
    },
    {
      q: "Can I get a bank loan?",
      a: "Loan eligibility depends on the bank, the borrower and whether a real project is approved. This demo does not list live bank sanctions.",
    },
    {
      q: "How does registration work?",
      a: "In Telangana, sale of plots is registered at the sub-registrar with stamp duty as applicable. Your advocate should review the draft before you pay a token.",
    },
    {
      q: "Is the RERA number real?",
      a: "No. P02400000000 is labelled as a demo placeholder. Never treat it as a registration.",
    },
    {
      q: "Who maintains the layout?",
      a: "Sample copy refers to an owners’ association after handover. Confirm maintenance deposit and scope in writing on a real project.",
    },
    {
      q: "How do I check availability?",
      a: "Use Check current availability on this site. In demo mode a salesperson confirms from the dashboard; it is not live inventory.",
    },
    {
      q: "How do site visits work?",
      a: "Book a slot, receive a reference, optionally request weekend pickup, and arrive at the sample gate. Reminders in this demo are simulated.",
    },
    {
      q: "Which documents can I see?",
      a: "The due-diligence section lists the usual pack. Files here are clearly marked samples.",
    },
    {
      q: "What is the refund or cancellation policy?",
      a: "Demo visits can be cancelled from the confirmation screen. A real developer’s token/refund terms would appear only in their agreement.",
    },
    {
      q: "Is pickup available?",
      a: "Complimentary weekend pickup is a sample offer for confirmed visits, subject to capacity.",
    },
    {
      q: "Do you charge brokerage?",
      a: "This demonstration does not invoice you. A production consultancy should disclose service fees in writing before you engage.",
    },
  ],
  documents: [
    { title: "RERA certificate", note: "Sample PDF placeholder — not a certificate." },
    { title: "Layout approval", note: "Sample drawing — not an HMDA/DTCP approval." },
    { title: "Title / documentation summary", note: "Educational outline only." },
    { title: "Encumbrance certificate", note: "Sample extract — not from a SRO." },
    { title: "Development agreement", note: "Clause outline for discussion." },
    { title: "Bank approvals", note: "No live sanctions in this demo." },
    { title: "Payment schedule", note: "Illustrative milestones." },
    { title: "Draft agreement", note: "Not executable." },
    { title: "Frequently requested documents", note: "Checklist for your lawyer." },
  ],
} as const;

export type ProjectConfig = typeof project;
