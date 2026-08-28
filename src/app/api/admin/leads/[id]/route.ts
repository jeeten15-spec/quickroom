import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noteSchema, stageSchema } from "@/lib/validators";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      qualifications: { orderBy: { step: "asc" } },
      appointments: { include: { reminders: true, salesperson: true }, orderBy: { startAt: "desc" } },
      conversations: { include: { messages: { orderBy: { createdAt: "asc" } } } },
      notes: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" } },
      notifications: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  if (body.note) {
    const parsed = noteSchema.safeParse({ body: body.note });
    if (!parsed.success) return NextResponse.json({ error: "Note too short" }, { status: 400 });
    const note = await prisma.internalNote.create({
      data: { leadId: id, body: parsed.data.body, author: body.author || "Advisor" },
    });
    await prisma.activity.create({ data: { leadId: id, type: "NOTE", detail: parsed.data.body } });
    return NextResponse.json({ ok: true, note });
  }
  if (body.assignedToId) {
    await prisma.lead.update({ where: { id }, data: { assignedToId: body.assignedToId } });
    await prisma.activity.create({ data: { leadId: id, type: "REASSIGNED", detail: body.assignedToId } });
    return NextResponse.json({ ok: true });
  }
  const stage = stageSchema.safeParse(body);
  if (stage.success) {
    await prisma.lead.update({
      where: { id },
      data: {
        stage: stage.data.stage,
        lostReason: stage.data.lostReason,
        followUpAt: stage.data.followUpAt ? new Date(stage.data.followUpAt) : undefined,
      },
    });
    await prisma.activity.create({ data: { leadId: id, type: "STAGE_CHANGE", detail: stage.data.stage } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "No valid patch" }, { status: 400 });
}
