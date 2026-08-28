import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const visits = await prisma.appointment.findMany({
    include: { lead: true, salesperson: true, reminders: true },
    orderBy: { startAt: "asc" },
  });
  return NextResponse.json({ visits });
}
