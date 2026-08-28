import { randomBytes } from "crypto";
import { site } from "@/config/site";
import { project } from "@/config/project";
import { messageTemplates } from "@/config/templates";
import { prisma } from "@/lib/prisma";
import { assertSlotFree } from "@/lib/availability";
import { assignRoundRobin } from "@/lib/assignment";
import { enqueueNotification } from "@/lib/leads";
import { interpolate } from "@/lib/utils";
import { formatIstDate, formatIstTime } from "@/lib/timezone";
import { getCalendarAdapter } from "@/services/adapters";

function reference() {
  return `AVG-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function bookVisit(input: {
  leadId: string;
  startAt: Date;
  attendees: number;
  pickupRequired: boolean;
  pickupLocation?: string;
  accessibilityNotes?: string;
}) {
  await assertSlotFree(input.startAt);
  const lead = await prisma.lead.findUnique({ where: { id: input.leadId }, include: { assignedTo: true } });
  if (!lead) throw Object.assign(new Error("Lead not found"), { status: 404 });

  const endAt = new Date(input.startAt.getTime() + project.siteVisitHours.slotMinutes * 60 * 1000);
  const salesperson = lead.assignedTo ?? (await assignRoundRobin());
  const ref = reference();
  const cal = getCalendarAdapter();
  const event = await cal.createEvent({
    title: `Site visit — ${project.name} — ${lead.name}`,
    start: input.startAt,
    end: endAt,
    description: `Ref ${ref}. Demo booking.`,
    location: project.meetingPoint,
  });

  await prisma.calendarEvent.create({
    data: {
      provider: cal.id,
      externalId: event.id,
      title: `${project.name} visit ${ref}`,
      startAt: input.startAt,
      endAt,
      status: "CONFIRMED",
    },
  });

  const appointment = await prisma.appointment.create({
    data: {
      reference: ref,
      leadId: lead.id,
      salespersonId: salesperson?.id,
      startAt: input.startAt,
      endAt,
      status: "CONFIRMED",
      attendees: input.attendees,
      pickupRequired: input.pickupRequired,
      pickupLocation: input.pickupLocation || null,
      accessibilityNotes: input.accessibilityNotes || null,
      meetingPoint: project.meetingPoint,
      calendarEventId: event.id,
    },
  });

  await prisma.availabilitySlot.create({
    data: {
      startAt: input.startAt,
      endAt,
      bookedCount: 1,
      appointmentId: appointment.id,
    },
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { stage: "VISIT_SCHEDULED", wantsSiteVisit: "yes", assignedToId: salesperson?.id },
  });

  const remind = async (kind: string, dueAt: Date, templateKey: string) => {
    const reminder = await prisma.reminder.create({
      data: { appointmentId: appointment.id, leadId: lead.id, kind, dueAt, status: "PENDING" },
    });
    const n = await prisma.notification.create({
      data: {
        leadId: lead.id,
        appointmentId: appointment.id,
        channel: "WHATSAPP_SIMULATED",
        templateKey,
        recipient: lead.phone,
        body: interpolate(messageTemplates[templateKey].body, {
          project: project.name,
          date: formatIstDate(input.startAt),
          time: formatIstTime(input.startAt),
          reference: ref,
          meetingPoint: project.meetingPoint,
          directions: project.map.directionsUrl,
        }),
        status: "PENDING",
        simulated: true,
      },
    });
    await prisma.reminder.update({ where: { id: reminder.id }, data: { notificationId: n.id } });
  };

  await remind("VISIT_24H", new Date(input.startAt.getTime() - 24 * 3600 * 1000), "reminder_24h");
  await remind("VISIT_2H", new Date(input.startAt.getTime() - 2 * 3600 * 1000), "reminder_2h");

  const confirmBody = interpolate(messageTemplates.visit_confirm_customer.body, {
    project: project.name,
    date: formatIstDate(input.startAt),
    time: formatIstTime(input.startAt),
    reference: ref,
    rmName: salesperson?.name ?? project.salesTeam.name,
    rmPhone: salesperson?.phone ?? project.salesTeam.phone,
    meetingPoint: project.meetingPoint,
    directions: project.map.directionsUrl,
  });

  await enqueueNotification({
    leadId: lead.id,
    appointmentId: appointment.id,
    channel: "WHATSAPP_SIMULATED",
    templateKey: "visit_confirm_customer",
    recipient: lead.phone,
    body: confirmBody,
  });
  await enqueueNotification({
    leadId: lead.id,
    appointmentId: appointment.id,
    salespersonId: salesperson?.id,
    channel: "EMAIL_SIMULATED",
    templateKey: "visit_confirm_sales",
    recipient: salesperson?.email || site.salesRecipients[0],
    subject: `Visit ${ref}`,
    body: interpolate(messageTemplates.visit_confirm_sales.body, {
      reference: ref,
      name: lead.name,
      phone: lead.phone,
      date: formatIstDate(input.startAt),
      time: formatIstTime(input.startAt),
      pickup: input.pickupRequired ? input.pickupLocation || "Yes" : "No",
      notes: input.accessibilityNotes || lead.specialRequirements || "—",
    }),
  });

  const conv = await prisma.conversation.findFirst({ where: { leadId: lead.id } });
  if (conv) {
    await prisma.message.create({
      data: { conversationId: conv.id, direction: "OUTBOUND", body: confirmBody, simulated: true },
    });
  }

  await prisma.activity.create({
    data: {
      leadId: lead.id,
      type: "VISIT_BOOKED",
      detail: `${ref} on ${input.startAt.toISOString()}`,
    },
  });

  return { appointment, confirmation: confirmBody, salesperson };
}

export async function cancelAppointment(id: string, reason = "customer") {
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) throw new Error("Appointment not found");
  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  await prisma.reminder.updateMany({
    where: { appointmentId: id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
  await prisma.notification.updateMany({
    where: { appointmentId: id, status: "PENDING", templateKey: { in: ["reminder_24h", "reminder_2h"] } },
    data: { status: "CANCELLED" },
  });
  if (appt.calendarEventId) {
    await prisma.calendarEvent.updateMany({
      where: { externalId: appt.calendarEventId },
      data: { status: "CANCELLED" },
    });
  }
  await prisma.lead.update({
    where: { id: appt.leadId },
    data: { stage: "CONTACTED" },
  });
  await prisma.activity.create({
    data: { leadId: appt.leadId, type: "VISIT_CANCELLED", detail: reason },
  });
  return appt;
}

export async function rescheduleAppointment(id: string, startAt: Date) {
  await assertSlotFree(startAt);
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) throw new Error("Appointment not found");
  const endAt = new Date(startAt.getTime() + project.siteVisitHours.slotMinutes * 60 * 1000);
  await prisma.reminder.updateMany({ where: { appointmentId: id }, data: { status: "CANCELLED" } });
  const updated = await prisma.appointment.update({
    where: { id },
    data: { startAt, endAt, status: "CONFIRMED" },
  });
  await prisma.reminder.createMany({
    data: [
      {
        appointmentId: id,
        leadId: appt.leadId,
        kind: "VISIT_24H",
        dueAt: new Date(startAt.getTime() - 24 * 3600 * 1000),
        status: "PENDING",
      },
      {
        appointmentId: id,
        leadId: appt.leadId,
        kind: "VISIT_2H",
        dueAt: new Date(startAt.getTime() - 2 * 3600 * 1000),
        status: "PENDING",
      },
    ],
  });
  await prisma.activity.create({
    data: { leadId: appt.leadId, type: "VISIT_RESCHEDULED", detail: startAt.toISOString() },
  });
  return updated;
}

export async function runDueReminders(now = new Date()) {
  const due = await prisma.reminder.findMany({
    where: { status: "PENDING", dueAt: { lte: now } },
  });
  const results = [];
  for (const reminder of due) {
    if (reminder.notificationId) {
      const { deliverNotification } = await import("@/lib/leads");
      await deliverNotification(reminder.notificationId);
    } else {
      const appt = reminder.appointmentId
        ? await prisma.appointment.findUnique({ where: { id: reminder.appointmentId }, include: { lead: true } })
        : null;
      if (appt?.lead) {
        await enqueueNotification({
          leadId: appt.leadId,
          appointmentId: appt.id,
          channel: "WHATSAPP_SIMULATED",
          templateKey: reminder.kind === "VISIT_2H" ? "reminder_2h" : "reminder_24h",
          recipient: appt.lead.phone,
          body: interpolate(
            messageTemplates[reminder.kind === "VISIT_2H" ? "reminder_2h" : "reminder_24h"].body,
            {
              project: project.name,
              date: formatIstDate(appt.startAt),
              time: formatIstTime(appt.startAt),
              reference: appt.reference,
              meetingPoint: project.meetingPoint,
              directions: project.map.directionsUrl,
            },
          ),
        });
      }
    }
    const updated = await prisma.reminder.update({
      where: { id: reminder.id },
      data: { status: "SENT" },
    });
    results.push(updated);
  }
  return results;
}
