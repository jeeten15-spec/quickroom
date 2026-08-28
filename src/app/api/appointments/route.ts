import { NextResponse } from "next/server";
import { appointmentSchema } from "@/lib/validators";
import { bookVisit } from "@/lib/appointments";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check visit details", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const result = await bookVisit({
      leadId: parsed.data.leadId,
      startAt: new Date(parsed.data.startAt),
      attendees: parsed.data.attendees,
      pickupRequired: parsed.data.pickupRequired,
      pickupLocation: parsed.data.pickupLocation,
      accessibilityNotes: parsed.data.accessibilityNotes,
    });
    return NextResponse.json({
      ok: true,
      reference: result.appointment.reference,
      appointmentId: result.appointment.id,
      startAt: result.appointment.startAt,
      confirmation: result.confirmation,
      manager: result.salesperson
        ? { name: result.salesperson.name, phone: result.salesperson.phone, email: result.salesperson.email }
        : null,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not book" }, { status: 409 });
  }
}
