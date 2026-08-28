import { PrismaClient } from "@prisma/client";
import { messageTemplates } from "../src/config/templates";
import { sampleOutreachList } from "../src/config/outreach";
import { scoreLead } from "../src/lib/scoring";

const prisma = new PrismaClient();

function ist(daysFromNow: number, hour: number, minute = 0) {
  const base = new Date();
  base.setDate(base.getDate() + daysFromNow);
  const y = base.getFullYear();
  const m = base.getMonth() + 1;
  const d = base.getDate();
  return new Date(Date.UTC(y, m - 1, d, hour - 5, minute - 30));
}

function scoreOf(partial: Parameters<typeof scoreLead>[0]) {
  return scoreLead(partial);
}

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.qualificationAnswer.deleteMany();
  await prisma.internalNote.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.salesperson.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.projectRecord.deleteMany();
  await prisma.outreachTouch.deleteMany();

  await prisma.projectRecord.create({
    data: {
      slug: "aurevia-greens",
      name: "Aurevia Greens",
      location: "Mokila–Shankarpally Growth Corridor, Hyderabad",
      status: "SITE_VISITS_OPEN",
    },
  });

  for (const [key, t] of Object.entries(messageTemplates)) {
    await prisma.messageTemplate.create({ data: { key, name: t.name, channel: t.channel, body: t.body } });
  }

  const priya = await prisma.salesperson.create({
    data: {
      name: "Priya Narayan",
      phone: "+91 90000 11103",
      email: "zara.a@example.net",
      areas: JSON.stringify(["Mokila", "Shankarpally"]),
      workingHoursStart: "09:30",
      workingHoursEnd: "18:30",
      maxAppointmentsPerDay: 6,
    },
  });
  const arjun = await prisma.salesperson.create({
    data: {
      name: "Arjun Deshmukh",
      phone: "+91 90000 11104",
      email: "frank.g@example.org",
      areas: JSON.stringify(["Gachibowli", "Kokapet"]),
      workingHoursStart: "10:00",
      workingHoursEnd: "19:00",
      maxAppointmentsPerDay: 5,
    },
  });
  const zara = await prisma.salesperson.create({
    data: {
      name: "Zara Hussain",
      phone: "+91 90000 11105",
      email: "xena.w@example.org",
      areas: JSON.stringify(["Financial District", "Tellapur"]),
      workingHoursStart: "10:00",
      workingHoursEnd: "18:00",
      maxAppointmentsPerDay: 5,
    },
  });
  const team = [priya, arjun, zara];

  const leadSeeds: Array<{
    name: string;
    phone: string;
    email?: string;
    stage: string;
    timeline?: string;
    visit?: string;
    budget?: string;
    req?: string;
    daysAgo: number;
    assigned: number;
  }> = [
    { name: "Aditi Sharma", phone: "9000010001", email: "aditi.demo@example.com", stage: "NEW", timeline: "within_30_days", visit: "yes", budget: "50_75", req: "300 yd plot", daysAgo: 0, assigned: 0 },
    { name: "Rohan Kapoor", phone: "9000010002", email: "rohan.demo@example.com", stage: "CONTACTED", timeline: "1_3_months", visit: "later", budget: "30_50", req: "200 yd", daysAgo: 1, assigned: 1 },
    { name: "Meera Iyer", phone: "9000010003", stage: "QUALIFIED", timeline: "within_30_days", visit: "yes", budget: "75_100", req: "Corner plot", daysAgo: 1, assigned: 2 },
    { name: "Sanjay Reddy", phone: "9000010004", email: "sanjay.demo@example.com", stage: "VISIT_SCHEDULED", timeline: "1_3_months", visit: "yes", budget: "30_50", req: "Weekend visit", daysAgo: 2, assigned: 0 },
    { name: "Fatima Sheikh", phone: "9000010005", email: "fatima.demo@example.com", stage: "VISIT_COMPLETED", timeline: "within_30_days", visit: "yes", budget: "50_75", req: "Self-use", daysAgo: 8, assigned: 1 },
    { name: "Nikhil Rao", phone: "9000010006", stage: "NEGOTIATION", timeline: "within_30_days", visit: "yes", budget: "100_200", req: "400 yd", daysAgo: 10, assigned: 2 },
    { name: "Kavitha Nair", phone: "9000010007", email: "kavitha.demo@example.com", stage: "BOOKED", timeline: "within_30_days", visit: "yes", budget: "50_75", req: "Token discussion (demo)", daysAgo: 20, assigned: 0 },
    { name: "Imran Qureshi", phone: "9000010008", stage: "LOST", timeline: "exploring", visit: "no", budget: "below_30", req: "Budget mismatch", daysAgo: 12, assigned: 1 },
    { name: "Sneha Pillai", phone: "9000010009", email: "sneha.demo@example.com", stage: "NURTURE", timeline: "6_12_months", visit: "later", budget: "30_50", req: "NRI family", daysAgo: 5, assigned: 2 },
    { name: "Vikram Joshi", phone: "9000010010", email: "vikram.demo@example.com", stage: "QUALIFIED", timeline: "3_6_months", visit: "yes", budget: "discuss", req: "Vastu east", daysAgo: 3, assigned: 0 },
    { name: "Ananya Bose", phone: "9000010011", stage: "CONTACTED", timeline: "exploring", visit: "no", budget: "30_50", req: "Just researching", daysAgo: 4, assigned: 1 },
    { name: "Harish Gowda", phone: "9000010012", email: "harish.demo@example.com", stage: "VISIT_SCHEDULED", timeline: "1_3_months", visit: "yes", budget: "50_75", req: "Pickup from FD", daysAgo: 2, assigned: 2 },
    { name: "Pooja Menon", phone: "9000010013", email: "pooja.demo@example.com", stage: "NEW", timeline: "1_3_months", visit: "later", budget: "75_100", req: "Brochure", daysAgo: 0, assigned: 0 },
    { name: "Rahul Verma", phone: "9000010014", stage: "VISIT_COMPLETED", timeline: "within_30_days", visit: "yes", budget: "30_50", req: "Second visit pending", daysAgo: 9, assigned: 1 },
    { name: "Deepa Krishnan", phone: "9000010015", email: "deepa.demo@example.com", stage: "QUALIFIED", timeline: "within_30_days", visit: "yes", budget: "50_75", req: "School commute", daysAgo: 1, assigned: 2 },
    { name: "Amit Chauhan", phone: "9000010016", email: "amit.demo@example.com", stage: "NURTURE", timeline: "exploring", visit: "later", budget: "discuss", req: "After Diwali", daysAgo: 6, assigned: 0 },
  ];

  const leads = [];
  for (const seed of leadSeeds) {
    const s = scoreOf({
      buyingTimeline: seed.timeline,
      wantsSiteVisit: seed.visit,
      budgetBand: seed.budget,
      phone: `91${seed.phone}`,
      email: seed.email,
    });
    const created = await prisma.lead.create({
      data: {
        name: seed.name,
        phone: `+91 ${seed.phone}`,
        phoneNormalized: `91${seed.phone}`,
        email: seed.email,
        requirement: seed.req,
        stage: seed.stage,
        buyingTimeline: seed.timeline,
        wantsSiteVisit: seed.visit,
        budgetBand: seed.budget,
        purpose: "self_use",
        propertyType: "plot",
        locationPreference: "Mokila / west Hyderabad",
        assignedToId: team[seed.assigned].id,
        score: s.score,
        scoreReasons: JSON.stringify(s.reasons),
        temperature: s.temperature,
        source: "seed",
        utmSource: seed.daysAgo % 2 === 0 ? "google" : "whatsapp",
        utmCampaign: "mokila-demo",
        consentAt: new Date(),
        consentWhatsapp: true,
        consentCall: true,
        lostReason: seed.stage === "LOST" ? "Budget below starting price" : null,
        followUpAt: seed.stage === "NURTURE" ? ist(7, 11) : null,
        createdAt: ist(-seed.daysAgo, 11),
        firstRespondedAt: seed.stage === "NEW" ? null : ist(-seed.daysAgo, 12),
      },
    });
    leads.push(created);
    await prisma.qualificationAnswer.create({
      data: { leadId: created.id, step: 1, question: "What are you looking for?", answer: "plot" },
    });
    const conv = await prisma.conversation.create({ data: { leadId: created.id, channel: "WEB_CHAT" } });
    await prisma.message.createMany({
      data: [
        { conversationId: conv.id, direction: "OUTBOUND", body: "Thank you for contacting Aurevia Realty. We’ve received your enquiry.", simulated: true },
        { conversationId: conv.id, direction: "INBOUND", body: seed.req ?? "Interested in plots", simulated: true },
      ],
    });
    await prisma.activity.create({
      data: { leadId: created.id, type: "LEAD_CREATED", detail: "Seeded demo lead" },
    });
    await prisma.internalNote.create({
      data: { leadId: created.id, author: team[seed.assigned].name, body: "Demo note: confirm inventory before quoting a size." },
    });
  }

  const visitLeads = leads.filter((l) =>
    ["VISIT_SCHEDULED", "VISIT_COMPLETED", "BOOKED", "NEGOTIATION"].includes(l.stage),
  );
  const visitTimes = [ist(3, 11), ist(4, 10, 30), ist(5, 12), ist(-6, 11), ist(-5, 15), ist(8, 9, 30)];
  let i = 0;
  for (const lead of visitLeads.slice(0, 6)) {
    const startAt = visitTimes[i++];
    const endAt = new Date(startAt.getTime() + 45 * 60000);
    const appt = await prisma.appointment.create({
      data: {
        reference: `AVG-SEED${i}`,
        leadId: lead.id,
        salespersonId: lead.assignedToId,
        startAt,
        endAt,
        status: startAt.getTime() < Date.now() ? "COMPLETED" : "CONFIRMED",
        attendees: 2,
        pickupRequired: i % 2 === 0,
        pickupLocation: i % 2 === 0 ? "Financial District metro-side (demo)" : null,
        meetingPoint: "Aurevia Greens sample gate, Mokila",
        calendarEventId: `local_seed_${i}`,
        visitFeedback: startAt.getTime() < Date.now() ? "Demo feedback: layout matched the sample plan." : null,
      },
    });
    await prisma.calendarEvent.create({
      data: {
        provider: "local",
        externalId: `local_seed_${i}`,
        title: `Visit ${appt.reference}`,
        startAt,
        endAt,
        status: appt.status === "COMPLETED" ? "CONFIRMED" : "CONFIRMED",
      },
    });
    await prisma.reminder.create({
      data: {
        appointmentId: appt.id,
        leadId: lead.id,
        kind: "VISIT_24H",
        dueAt: new Date(startAt.getTime() - 24 * 3600000),
        status: startAt.getTime() < Date.now() ? "SENT" : "PENDING",
      },
    });
    await prisma.reminder.create({
      data: {
        appointmentId: appt.id,
        leadId: lead.id,
        kind: "VISIT_2H",
        dueAt: new Date(startAt.getTime() - 2 * 3600000),
        status: startAt.getTime() < Date.now() ? "SENT" : "PENDING",
      },
    });
    await prisma.notification.create({
      data: {
        leadId: lead.id,
        appointmentId: appt.id,
        channel: "WHATSAPP_SIMULATED",
        templateKey: "visit_confirm_customer",
        recipient: lead.phone,
        body: `Simulated confirmation for ${appt.reference}`,
        status: "SENT",
        simulated: true,
        sentAt: new Date(),
      },
    });
  }

  await prisma.notification.create({
    data: {
      channel: "EMAIL_SIMULATED",
      templateKey: "sales_alert_new",
      recipient: priya.email,
      body: "Simulated pending sales alert for dashboard retry demo",
      status: "FAILED",
      error: "Demo failure — retry from admin",
      simulated: true,
    },
  });

  for (const row of sampleOutreachList) {
    await prisma.outreachTouch.create({
      data: {
        firmName: row.firmName,
        contactName: row.contactName,
        phone: row.phone,
        area: row.area,
        channel: row.channel,
        status: "PLANNED",
      },
    });
  }

  const upcoming = await prisma.appointment.findMany({
    where: { startAt: { gt: new Date() }, status: "CONFIRMED" },
  });
  for (const a of upcoming) {
    await prisma.availabilitySlot.create({
      data: { startAt: a.startAt, endAt: a.endAt, bookedCount: 1, appointmentId: a.id },
    });
  }

  console.log("Seed complete:", { leads: leads.length, salespeople: 3 });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
