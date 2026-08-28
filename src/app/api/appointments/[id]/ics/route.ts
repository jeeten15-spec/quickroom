import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildIcs } from "@/lib/ics";
import { project } from "@/config/project";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const appt = await prisma.appointment.findUnique({ where: { id }, include: { salesperson: true } });
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ics = buildIcs({
    uid: `${appt.reference}@aurevia.example`,
    title: `Site visit — ${project.name}`,
    description: `Ref ${appt.reference}. Advisor ${appt.salesperson?.name ?? ""}. Demo calendar file.`,
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
