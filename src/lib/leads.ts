import { site } from "@/config/site";
import { project } from "@/config/project";
import { messageTemplates } from "@/config/templates";
import { qualificationSteps } from "@/config/scoring";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { scoreLead } from "@/lib/scoring";
import { assignRoundRobin } from "@/lib/assignment";
import { interpolate, jsonString } from "@/lib/utils";
import { getCrmAdapter, getNotifyAdapter } from "@/services/adapters";
import type { z } from "zod";
import type { leadCreateSchema } from "@/lib/validators";

export async function enqueueNotification(data: {
  leadId?: string;
  appointmentId?: string;
  salespersonId?: string;
  channel: string;
  templateKey: string;
  recipient: string;
  subject?: string;
  body: string;
  sendNow?: boolean;
}) {
  const row = await prisma.notification.create({
    data: {
      leadId: data.leadId,
      appointmentId: data.appointmentId,
      salespersonId: data.salespersonId,
      channel: data.channel,
      templateKey: data.templateKey,
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      status: "PENDING",
      simulated: process.env.NOTIFICATION_MODE !== "production",
    },
  });
  if (data.sendNow !== false) {
    return deliverNotification(row.id);
  }
  return row;
}

export async function deliverNotification(id: string) {
  const row = await prisma.notification.findUnique({ where: { id } });
  if (!row) throw new Error("Notification not found");
  const adapter = getNotifyAdapter();
  try {
    const result = await adapter.send({
      to: row.recipient,
      body: row.body,
      subject: row.subject ?? undefined,
      templateKey: row.templateKey,
    });
    if (!result.ok && process.env.NOTIFICATION_MODE === "production") {
      return prisma.notification.update({
        where: { id },
        data: { status: "FAILED", error: result.error ?? "send failed" },
      });
    }
    return prisma.notification.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date(), simulated: result.simulated, error: null },
    });
  } catch (e) {
    return prisma.notification.update({
      where: { id },
      data: { status: "FAILED", error: e instanceof Error ? e.message : "unknown" },
    });
  }
}

export async function createLeadFromForm(input: z.infer<typeof leadCreateSchema>, ip?: string) {
  const phoneNormalized = normalizePhone(input.phone);
  if (!phoneNormalized) {
    throw Object.assign(new Error("Enter a valid 10-digit Indian mobile number"), { status: 400 });
  }
  if (input.honeypot) {
    return { ignored: true as const };
  }

  const existing = await prisma.lead.findFirst({
    where: { phoneNormalized },
    orderBy: { createdAt: "desc" },
  });

  const assigned = existing?.assignedToId
    ? await prisma.salesperson.findUnique({ where: { id: existing.assignedToId } })
    : await assignRoundRobin();

  const scored = scoreLead({
    phone: phoneNormalized,
    email: input.email || null,
  });

  const lead = existing
    ? await prisma.lead.update({
        where: { id: existing.id },
        data: {
          name: input.name,
          email: input.email || existing.email,
          requirement: input.requirement || existing.requirement,
          source: input.intent || input.source || existing.source,
          utmSource: input.utmSource ?? existing.utmSource,
          utmMedium: input.utmMedium ?? existing.utmMedium,
          utmCampaign: input.utmCampaign ?? existing.utmCampaign,
          referrer: input.referrer ?? existing.referrer,
          consentAt: new Date(),
          consentWhatsapp: Boolean(input.consentWhatsapp),
          consentCall: Boolean(input.consentCall ?? true),
          consentEmail: Boolean(input.consentEmail),
        },
      })
    : await prisma.lead.create({
        data: {
          name: input.name,
          phone: input.phone,
          phoneNormalized,
          email: input.email || null,
          requirement: input.requirement || null,
          source: input.intent || input.source || "website",
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          utmTerm: input.utmTerm,
          utmContent: input.utmContent,
          referrer: input.referrer,
          assignedToId: assigned?.id,
          score: scored.score,
          scoreReasons: jsonString(scored.reasons),
          temperature: scored.temperature,
          consentAt: new Date(),
          consentWhatsapp: Boolean(input.consentWhatsapp),
          consentCall: Boolean(input.consentCall ?? true),
          consentEmail: Boolean(input.consentEmail),
        },
      });

  await prisma.consent.create({
    data: {
      leadId: lead.id,
      kind: "enquiry",
      granted: true,
      source: ip,
    },
  });

  await prisma.activity.create({
    data: {
      leadId: lead.id,
      type: existing ? "DUPLICATE_ENQUIRY" : "LEAD_CREATED",
      detail: existing
        ? `Repeat enquiry from ${phoneNormalized}. Original lead reused.`
        : `Lead created via ${input.intent || "enquiry"} form.`,
    },
  });

  const conversation =
    (await prisma.conversation.findFirst({ where: { leadId: lead.id, channel: "WEB_CHAT" } })) ??
    (await prisma.conversation.create({ data: { leadId: lead.id, channel: "WEB_CHAT" } }));

  const ack = interpolate(messageTemplates.ack_enquiry.body, { company: site.companyName });
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "OUTBOUND",
      body: ack,
      simulated: true,
    },
  });

  await enqueueNotification({
    leadId: lead.id,
    salespersonId: assigned?.id,
    channel: "EMAIL_SIMULATED",
    templateKey: "sales_alert_new",
    recipient: assigned?.email || site.salesRecipients[0],
    subject: `New enquiry — ${lead.name}`,
    body: interpolate(messageTemplates.sales_alert_new.body, {
      name: lead.name,
      phone: lead.phone,
      requirement: lead.requirement ?? "—",
      budget: lead.budgetBand ?? "—",
      timeline: lead.buyingTimeline ?? "—",
      score: String(lead.score),
      adminUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/leads/${lead.id}`,
    }),
  });

  await getCrmAdapter().upsertLead({ id: lead.id, name: lead.name, phone: lead.phoneNormalized });

  return { lead, conversationId: conversation.id, duplicate: Boolean(existing), acknowledgement: ack };
}

export async function saveQualification(leadId: string, step: number, answer: string) {
  const def = qualificationSteps.find((s) => s.id === step);
  if (!def) throw Object.assign(new Error("Unknown step"), { status: 400 });
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw Object.assign(new Error("Lead not found"), { status: 404 });

  await prisma.qualificationAnswer.upsert({
    where: { leadId_step: { leadId, step } },
    create: { leadId, step, question: def.question, answer },
    update: { answer, question: def.question },
  });

  const field = def.field as
    | "propertyType"
    | "locationPreference"
    | "budgetBand"
    | "purpose"
    | "buyingTimeline"
    | "preferredContact"
    | "wantsSiteVisit"
    | "specialRequirements";

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { [field]: answer },
  });

  const scored = scoreLead({
    buyingTimeline: field === "buyingTimeline" ? answer : updated.buyingTimeline,
    wantsSiteVisit: field === "wantsSiteVisit" ? answer : updated.wantsSiteVisit,
    budgetBand: field === "budgetBand" ? answer : updated.budgetBand,
    phone: updated.phoneNormalized,
    email: updated.email,
  });

  let stage = updated.stage;
  if (step >= 5 && stage === "NEW") stage = "QUALIFIED";
  if (answer === "yes" && field === "wantsSiteVisit") stage = "QUALIFIED";
  if (updated.buyingTimeline === "exploring" || answer === "exploring") {
    if (stage === "NEW") stage = "NURTURE";
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      score: scored.score,
      scoreReasons: jsonString(scored.reasons),
      temperature: scored.temperature,
      stage,
    },
  });

  const conversation = await prisma.conversation.findFirst({ where: { leadId, channel: "WEB_CHAT" } });
  if (conversation) {
    await prisma.message.create({
      data: { conversationId: conversation.id, direction: "INBOUND", body: answer, simulated: true },
    });
    const next = qualificationSteps.find((s) => s.id === step + 1);
    if (next) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: "OUTBOUND",
          body: next.question,
          simulated: true,
        },
      });
    } else {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: "OUTBOUND",
          body:
            answer === "yes" || updated.wantsSiteVisit === "yes"
              ? "Thank you. You can pick a site-visit slot next — we will hold it only after you confirm the summary."
              : "Thank you. A property advisor will follow up using your preferred channel. This chat is stored on your lead record (demo).",
          simulated: true,
        },
      });
    }
  }

  await prisma.activity.create({
    data: { leadId, type: "QUALIFICATION_STEP", detail: `Step ${step}: ${def.question} → ${answer}` },
  });

  if (scored.temperature === "HOT") {
    const sp = updated.assignedToId
      ? await prisma.salesperson.findUnique({ where: { id: updated.assignedToId } })
      : null;
    await enqueueNotification({
      leadId,
      salespersonId: sp?.id,
      channel: "EMAIL_SIMULATED",
      templateKey: "sales_alert_hot",
      recipient: sp?.email || site.salesRecipients[0],
      subject: `HOT lead — ${updated.name}`,
      body: interpolate(messageTemplates.sales_alert_hot.body, {
        score: String(scored.score),
        name: updated.name,
        phone: updated.phone,
        visit: field === "wantsSiteVisit" ? answer : updated.wantsSiteVisit ?? "—",
        adminUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/leads/${leadId}`,
      }),
    });
  }

  return { nextStep: step < 8 ? step + 1 : null, temperature: scored.temperature, score: scored.score };
}

export { project };
