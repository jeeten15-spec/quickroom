import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.consent || !body.phone) return NextResponse.json({ ok: true });
  const phoneNormalized = normalizePhone(body.phone);
  if (!phoneNormalized) return NextResponse.json({ ok: true });
  const lead = await prisma.lead.findFirst({ where: { phoneNormalized } });
  if (!lead) return NextResponse.json({ ok: true });
  await prisma.lead.update({ where: { id: lead.id }, data: { abandonedAt: new Date() } });
  await prisma.activity.create({
    data: { leadId: lead.id, type: "FORM_ABANDON", detail: "Partial form with consent" },
  });
  return NextResponse.json({ ok: true });
}
