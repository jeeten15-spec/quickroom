import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
  const [total, neu, hot, visits, upcoming, contacted] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.lead.count({ where: { temperature: "HOT" } }),
    prisma.appointment.count({ where: { status: { in: ["SCHEDULED", "CONFIRMED", "COMPLETED"] } } }),
    prisma.appointment.count({ where: { startAt: { gte: now }, status: { in: ["SCHEDULED", "CONFIRMED"] } } }),
    prisma.lead.count({ where: { firstRespondedAt: { not: null } } }),
  ]);
  const stages = await prisma.lead.groupBy({ by: ["stage"], _count: true });
  const responded = await prisma.lead.findMany({
    where: { firstRespondedAt: { not: null } },
    select: { createdAt: true, firstRespondedAt: true },
  });
  const avgMs =
    responded.length === 0
      ? 0
      : responded.reduce((s, l) => s + (l.firstRespondedAt!.getTime() - l.createdAt.getTime()), 0) / responded.length;
  const conversion = total ? Math.round((visits / total) * 100) : 0;
  return NextResponse.json({
    kpis: {
      total,
      newLeads: neu,
      hot,
      visitsBooked: visits,
      upcoming,
      conversionRate: conversion,
      avgResponseMinutes: Math.round(avgMs / 60000),
      contacted,
    },
    funnel: stages,
  });
}
