export const scoringRules = [
  { id: "timeline_30", label: "Buying within 30 days", points: 30, test: (l: ScoreInput) => l.buyingTimeline === "within_30_days" },
  { id: "timeline_90", label: "Buying within 1–3 months", points: 20, test: (l: ScoreInput) => l.buyingTimeline === "1_3_months" },
  { id: "visit_yes", label: "Site visit requested", points: 25, test: (l: ScoreInput) => l.wantsSiteVisit === "yes" },
  {
    id: "budget_fit",
    label: "Budget suitable for project",
    points: 15,
    test: (l: ScoreInput) =>
      ["30_50", "50_75", "75_100", "100_200", "200_plus", "discuss"].includes(l.budgetBand ?? ""),
  },
  {
    id: "contact_complete",
    label: "Phone and email supplied",
    points: 5,
    test: (l: ScoreInput) => Boolean(l.phone) && Boolean(l.email),
  },
  { id: "exploring", label: "Just exploring", points: 2, test: (l: ScoreInput) => l.buyingTimeline === "exploring" },
] as const;

export type ScoreInput = {
  buyingTimeline?: string | null;
  wantsSiteVisit?: string | null;
  budgetBand?: string | null;
  phone?: string | null;
  email?: string | null;
};

export const temperatureThresholds = {
  hot: 50,
  warm: 25,
} as const;

export const qualificationSteps = [
  {
    id: 1,
    field: "propertyType",
    question: "What are you looking for?",
    options: [
      { value: "plot", label: "Residential plot" },
      { value: "villa", label: "Villa" },
      { value: "apartment", label: "Apartment" },
      { value: "commercial", label: "Commercial property" },
      { value: "farm", label: "Agricultural/farm land" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: 2,
    field: "locationPreference",
    question: "Which location or area do you prefer?",
    options: null,
    placeholder: "e.g. Mokila, Shankarpally, west Hyderabad, open to options",
  },
  {
    id: 3,
    field: "budgetBand",
    question: "What is your approximate budget?",
    options: [
      { value: "below_30", label: "Below ₹30 lakh" },
      { value: "30_50", label: "₹30–50 lakh" },
      { value: "50_75", label: "₹50–75 lakh" },
      { value: "75_100", label: "₹75 lakh–₹1 crore" },
      { value: "100_200", label: "₹1–2 crore" },
      { value: "200_plus", label: "Above ₹2 crore" },
      { value: "discuss", label: "Prefer to discuss" },
    ],
  },
  {
    id: 4,
    field: "purpose",
    question: "What is your purpose?",
    options: [
      { value: "self_use", label: "Self-use" },
      { value: "investment", label: "Investment" },
      { value: "both", label: "Both" },
      { value: "undecided", label: "Not decided" },
    ],
  },
  {
    id: 5,
    field: "buyingTimeline",
    question: "When are you planning to buy?",
    options: [
      { value: "within_30_days", label: "Within 30 days" },
      { value: "1_3_months", label: "1–3 months" },
      { value: "3_6_months", label: "3–6 months" },
      { value: "6_12_months", label: "6–12 months" },
      { value: "exploring", label: "Just exploring" },
    ],
  },
  {
    id: 6,
    field: "preferredContact",
    question: "How would you prefer to be contacted?",
    options: [
      { value: "whatsapp", label: "WhatsApp" },
      { value: "phone", label: "Phone call" },
      { value: "email", label: "Email" },
    ],
  },
  {
    id: 7,
    field: "wantsSiteVisit",
    question: "Would you like to schedule a site visit?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "later", label: "Maybe later" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 8,
    field: "specialRequirements",
    question: "Any special requirements?",
    options: null,
    placeholder: "Corner plot, vastu, pickup point, accessibility…",
  },
] as const;
