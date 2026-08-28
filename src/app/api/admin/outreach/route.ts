import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.outreachTouch.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ touches: rows, dailyTarget: 65 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const row = await prisma.outreachTouch.update({
    where: { id: body.id },
    data: { status: body.status, notes: body.notes, touchedAt: body.status === "DONE" ? new Date() : undefined },
  });
  return NextResponse.json({ ok: true, touch: row });
}
