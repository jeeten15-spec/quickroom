import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getWhatsAppAdapter } from "@/services/adapters";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === (process.env.WHATSAPP_VERIFY_TOKEN || "demo-verify")) {
    return new NextResponse(challenge || "ok", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-hub-signature-256") || "";
  const adapter = getWhatsAppAdapter();
  if (process.env.WHATSAPP_MODE === "production") {
    if (!adapter.verifyWebhookSignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }
  let payload: unknown = {};
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = (payload as { entry?: { id?: string }[] }).entry?.[0]?.id || "unknown";
  if (await adapter.alreadyProcessed(id)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  await adapter.handleInboundWebhook(payload);
  await adapter.handleDeliveryStatus(payload);
  return NextResponse.json({
    ok: true,
    demo: process.env.WHATSAPP_MODE !== "production",
    note: "Inbound WhatsApp is not processed from wa.me links. Production requires Cloud API webhooks.",
  });
}

export function signaturesMatch(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
