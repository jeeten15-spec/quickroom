import { NextResponse } from "next/server";
import { qualifySchema } from "@/lib/validators";
import { saveQualification } from "@/lib/leads";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = qualifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }
  try {
    const result = await saveQualification(parsed.data.leadId, parsed.data.step, parsed.data.answer);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not save" }, { status });
  }
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("leadId");
  if (!id) return NextResponse.json({ error: "leadId required" }, { status: 400 });
  const answers = await prisma.qualificationAnswer.findMany({ where: { leadId: id }, orderBy: { step: "asc" } });
  return NextResponse.json({ answers });
}
