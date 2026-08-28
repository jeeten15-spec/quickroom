import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelAppointment, rescheduleAppointment } from "@/lib/appointments";
import { buildIcs } from "@/lib/ics";
import { project } from "@/config/project";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const appt = await prisma.appointment.findUnique({ where: { id }, include: { lead: true, salesperson: true } });
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ appointment: appt });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "cancel") {
      await cancelAppointment(id, body.reason || "customer");
      return NextResponse.json({ ok: true });
    }
    if (body.action === "reschedule" && body.startAt) {
      const updated = await rescheduleAppointment(id, new Date(body.startAt));
      return NextResponse.json({ ok: true, appointment: updated });
    }
    if (body.action === "complete") {
      const appt = await prisma.appointment.update({
        where: { id },
        data: { status: "COMPLETED", visitFeedback: body.feedback || null },
      });
      await prisma.lead.update({ where: { id: appt.leadId }, data: { stage: "VISIT_COMPLETED" } });
      return NextResponse.json({ ok: true });
    }
    if (body.action === "no_show") {
      const appt = await prisma.appointment.update({ where: { id }, data: { status: "NO_SHOW" } });
      await prisma.lead.update({ where: { id: appt.leadId }, data: { stage: "CONTACTED" } });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(request.url);
  if (!url.pathname.endsWith("/ics") && url.searchParams.get("download") !== "ics") {
    return NextResponse.json({ error: "Use /api/appointments/[id]/ics" }, { status: 404 });
  }
  const appt = await prisma.appointment.findUnique({ where: { id }, include: { salesperson: true } });
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ics = buildIcs({
    uid: `${appt.reference}@aurevia.example`,
    title: `Site visit — ${project.name}`,
    description: `Ref ${appt.reference}. Advisor ${appt.salesperson?.name ?? ""}. Demo event.`,
    location: appt.meetingPoint ?? project.meetingPoint,
    start: appt.startAt,
    end: appt.endAt,
  });
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${appt.reference}.ics"`,
    },
  });
}
