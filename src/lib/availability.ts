import { project } from "@/config/project";
import { prisma } from "@/lib/prisma";
import { addDaysUtc, getIstParts, istLocalToUtc, parseHm } from "@/lib/timezone";

export type SlotDto = { startAt: string; endAt: string; label: string };

function weekdayIndex(date: Date) {
  const { weekday } = getIstParts(date);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? 0;
}

export function buildDaySlots(day: Date): { start: Date; end: Date }[] {
  const hours = project.siteVisitHours;
  const parts = getIstParts(day);
  const isWeekend = weekdayIndex(day) === 0 || weekdayIndex(day) === 6;
  const window = isWeekend ? hours.weekend : hours.weekday;
  const startHm = parseHm(window.start);
  const endHm = parseHm(window.end);
  const step = hours.slotMinutes + hours.bufferMinutes;
  const slots: { start: Date; end: Date }[] = [];
  let minutes = startHm.h * 60 + startHm.m;
  const endMinutes = endHm.h * 60 + endHm.m;
  while (minutes + hours.slotMinutes <= endMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const start = istLocalToUtc(parts.year, parts.month, parts.day, h, m);
    const end = new Date(start.getTime() + hours.slotMinutes * 60 * 1000);
    slots.push({ start, end });
    minutes += step;
  }
  return slots;
}

export async function getAvailableSlots(from = new Date(), days = 21): Promise<SlotDto[]> {
  const startWindow = from;
  const endWindow = addDaysUtc(from, days);
  const busy = await prisma.appointment.findMany({
    where: {
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      startAt: { gte: startWindow, lte: endWindow },
    },
    select: { startAt: true, salespersonId: true },
  });
  const blocked = await prisma.availabilitySlot.findMany({
    where: { blocked: true, startAt: { gte: startWindow, lte: endWindow } },
  });
  const busyKeys = new Set(busy.map((b) => b.startAt.toISOString()));
  const blockedKeys = new Set(blocked.map((b) => b.startAt.toISOString()));
  const out: SlotDto[] = [];
  for (let d = 1; d <= days; d++) {
    const day = addDaysUtc(from, d);
    const wd = weekdayIndex(day);
    if (project.siteVisitHours.closedWeekdays.includes(wd)) continue;
    for (const slot of buildDaySlots(day)) {
      if (slot.start.getTime() <= Date.now()) continue;
      const key = slot.start.toISOString();
      if (busyKeys.has(key) || blockedKeys.has(key)) continue;
      out.push({
        startAt: slot.start.toISOString(),
        endAt: slot.end.toISOString(),
        label: slot.start.toISOString(),
      });
    }
  }
  return out;
}

export async function assertSlotFree(startAt: Date) {
  if (startAt.getTime() <= Date.now()) {
    throw new Error("Cannot book a past slot");
  }
  const clash = await prisma.appointment.findFirst({
    where: { startAt, status: { in: ["SCHEDULED", "CONFIRMED"] } },
  });
  if (clash) throw new Error("That slot is no longer available");
}
