import { prisma } from "@/lib/prisma";
import { getIstParts } from "@/lib/timezone";

export async function assignRoundRobin(at = new Date()) {
  const people = await prisma.salesperson.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ lastAssignedAt: "asc" }, { name: "asc" }],
  });
  if (!people.length) return null;
  const { hour, minute } = getIstParts(at);
  const mins = hour * 60 + minute;
  const eligible = [];
  for (const person of people) {
    const [sh, sm] = person.workingHoursStart.split(":").map(Number);
    const [eh, em] = person.workingHoursEnd.split(":").map(Number);
    const startM = sh * 60 + sm;
    const endM = eh * 60 + em;
    const inHours = mins >= startM && mins <= endM;
    const dayStart = new Date(at);
    dayStart.setHours(0, 0, 0, 0);
    const count = await prisma.appointment.count({
      where: {
        salespersonId: person.id,
        startAt: { gte: dayStart },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
    });
    if (count >= person.maxAppointmentsPerDay) continue;
    eligible.push({ person, inHours, count });
  }
  const pool = eligible.filter((e) => e.inHours);
  const chosen = (pool.length ? pool : eligible)[0]?.person ?? people[0];
  await prisma.salesperson.update({
    where: { id: chosen.id },
    data: { lastAssignedAt: at },
  });
  return chosen;
}
