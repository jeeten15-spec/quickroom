import { NextResponse } from "next/server";
import { runDueReminders } from "@/lib/appointments";
import { prisma } from "@/lib/prisma";
import { deliverNotification } from "@/lib/leads";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const now = body.now ? new Date(body.now) : new Date();
  const reminders = await runDueReminders(now);
  return NextResponse.json({ ok: true, processed: reminders.length, now });
}

export async function GET() {
  const [notifications, reminders] = await Promise.all([
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.reminder.findMany({ orderBy: { dueAt: "asc" }, take: 80 }),
  ]);
  return NextResponse.json({ notifications, reminders });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.notificationId) {
    const row = await deliverNotification(body.notificationId);
    return NextResponse.json({ ok: true, notification: row });
  }
  return NextResponse.json({ error: "notificationId required" }, { status: 400 });
}
