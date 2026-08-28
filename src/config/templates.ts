export const messageTemplates: Record<
  string,
  { name: string; channel: string; body: string }
> = {
  ack_enquiry: {
    name: "Immediate acknowledgement",
    channel: "WEB_CHAT",
    body: "Thank you for contacting {{company}}. We’ve received your enquiry. I’ll ask a few quick questions so our property advisor can share the most relevant options.",
  },
  sales_alert_new: {
    name: "Sales alert — new lead",
    channel: "EMAIL_SIMULATED",
    body: "New lead: {{name}} · {{phone}} · {{requirement}} · budget {{budget}} · timeline {{timeline}} · score {{score}} · {{adminUrl}}",
  },
  sales_alert_hot: {
    name: "Priority alert — hot lead",
    channel: "EMAIL_SIMULATED",
    body: "HOT lead ({{score}}): {{name}} {{phone}}. Visit intent: {{visit}}. Open {{adminUrl}} now.",
  },
  visit_confirm_customer: {
    name: "Site-visit confirmation (customer)",
    channel: "WHATSAPP_SIMULATED",
    body: "Your site visit to {{project}} is confirmed for {{date}} at {{time}}. Booking reference: {{reference}}. Your relationship manager is {{rmName}}, {{rmPhone}}. Meeting point: {{meetingPoint}}. Directions: {{directions}}. We will remind you one day and two hours before your visit. (Simulated message — demo mode.)",
  },
  visit_confirm_sales: {
    name: "Site-visit confirmation (sales)",
    channel: "EMAIL_SIMULATED",
    body: "Visit {{reference}} assigned to you: {{name}} {{phone}} on {{date}} {{time}}. Pickup: {{pickup}}. Notes: {{notes}}.",
  },
  reminder_24h: {
    name: "24-hour reminder",
    channel: "WHATSAPP_SIMULATED",
    body: "Reminder: your {{project}} site visit is tomorrow, {{date}} at {{time}}. Ref {{reference}}. Meeting point: {{meetingPoint}}. Reply if you need to reschedule. (Simulated.)",
  },
  reminder_2h: {
    name: "2-hour reminder",
    channel: "WHATSAPP_SIMULATED",
    body: "See you in about two hours at {{project}}, {{time}}. Ref {{reference}}. Directions: {{directions}}. (Simulated.)",
  },
  post_visit_thanks: {
    name: "Post-visit thank-you",
    channel: "WHATSAPP_SIMULATED",
    body: "Thank you for visiting {{project}}. Your advisor {{rmName}} will share the cost sheet and document checklist. If a colleague is evaluating west-Hyderabad plots, we can book a separate slot. (Simulated.)",
  },
  sales_followup_task: {
    name: "Sales follow-up after visit",
    channel: "EMAIL_SIMULATED",
    body: "Follow up {{name}} ({{phone}}) within 4 working hours. Stage: visit completed. Score {{score}}.",
  },
  no_show: {
    name: "No-show follow-up",
    channel: "WHATSAPP_SIMULATED",
    body: "We missed you at {{project}} ({{reference}}). Would you like a new slot, a call, or a cost sheet by email? (Simulated.)",
  },
  nurture: {
    name: "Nurture reminder",
    channel: "EMAIL_SIMULATED",
    body: "You asked us to stay in touch about {{project}}. Inventory and prices on the demo site are illustrative. Reply when you want a fresh availability check.",
  },
  whatsapp_prefill: {
    name: "wa.me prefill",
    channel: "WHATSAPP",
    body: "Hello, I’m interested in {{project}}. Please share the latest price, availability and site-visit options.",
  },
};
