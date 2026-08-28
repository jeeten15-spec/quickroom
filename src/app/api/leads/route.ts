import { NextResponse } from "next/server";
import { leadCreateSchema } from "@/lib/validators";
import { createLeadFromForm } from "@/lib/leads";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`lead:${clientKey(request.headers)}`)) {
    return NextResponse.json({ error: "Please wait a few minutes before sending another enquiry." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const parsed = leadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form fields.", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const result = await createLeadFromForm(parsed.data, clientKey(request.headers));
    if ("ignored" in result) return NextResponse.json({ ok: true });
    return NextResponse.json({
      ok: true,
      leadId: result.lead.id,
      conversationId: result.conversationId,
      duplicate: result.duplicate,
      acknowledgement: result.acknowledgement,
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not save enquiry" }, { status });
  }
}
