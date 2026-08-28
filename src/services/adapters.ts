/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Replaceable adapters for WhatsApp, email, calendar and CRM.
 * Demo implementations persist simulated messages. Production stubs throw
 * until credentials and FEATURE flags are set.
 */

export type SendPayload = {
  to: string;
  body: string;
  subject?: string;
  templateKey: string;
  metadata?: Record<string, string>;
};

export interface MessageAdapter {
  id: string;
  send(payload: SendPayload): Promise<{ ok: boolean; id: string; simulated: boolean; error?: string }>;
}

export interface CalendarAdapter {
  id: string;
  isFree(start: Date, end: Date): Promise<boolean>;
  createEvent(input: {
    title: string;
    start: Date;
    end: Date;
    description: string;
    location: string;
  }): Promise<{ id: string }>;
  updateEvent(id: string, input: { start?: Date; end?: Date; status?: string }): Promise<void>;
  cancelEvent(id: string): Promise<void>;
}

export interface CrmAdapter {
  id: string;
  upsertLead(lead: Record<string, unknown>): Promise<void>;
}

export interface WhatsAppPlatform {
  sendAcknowledgement(to: string, body: string): Promise<void>;
  askQualification(to: string, question: string): Promise<void>;
  processInteractiveReply(payload: unknown): Promise<void>;
  sendSalesAlert(to: string, body: string): Promise<void>;
  sendVisitConfirmation(to: string, body: string): Promise<void>;
  sendReminderTemplate(to: string, template: string, vars: Record<string, string>): Promise<void>;
  handleDeliveryStatus(payload: unknown): Promise<void>;
  handleInboundWebhook(payload: unknown): Promise<void>;
  verifyWebhookSignature(rawBody: string, header: string): boolean;
  alreadyProcessed(messageId: string): Promise<boolean>;
}

export function whatsappPrefillHref(e164: string, text: string) {
  return `https://wa.me/${e164}?text=${encodeURIComponent(text)}`;
}

export class DemoMessageAdapter implements MessageAdapter {
  id = "demo-notify";
  async send(payload: SendPayload) {
    return { ok: true, id: `demo_${Date.now()}`, simulated: true, error: undefined, preview: payload.body };
  }
}

export class ProductionWhatsAppAdapter implements MessageAdapter, WhatsAppPlatform {
  id = "whatsapp-cloud";
  private enabled() {
    return process.env.WHATSAPP_MODE === "production" && Boolean(process.env.WHATSAPP_TOKEN);
  }
  async send(_payload: SendPayload) {
    if (!this.enabled()) {
      return { ok: false, id: "", simulated: false, error: "WhatsApp production is not enabled" };
    }
    return { ok: false, id: "", simulated: false, error: "Wire Cloud API send here" };
  }
  async sendAcknowledgement(_to: string, _body: string) {
    throw new Error("Requires WhatsApp Business Platform credentials");
  }
  async askQualification(_to: string, _question: string) {
    throw new Error("Requires WhatsApp Business Platform credentials");
  }
  async processInteractiveReply(_payload: unknown) {}
  async sendSalesAlert(_to: string, _body: string) {
    throw new Error("Requires WhatsApp Business Platform credentials");
  }
  async sendVisitConfirmation(_to: string, _body: string) {
    throw new Error("Requires approved template + credentials");
  }
  async sendReminderTemplate(_to: string, _template: string, _vars: Record<string, string>) {
    throw new Error("Requires approved reminder templates + credentials");
  }
  async handleDeliveryStatus(_payload: unknown) {}
  async handleInboundWebhook(_payload: unknown) {}
  verifyWebhookSignature(_rawBody: string, _header: string) {
    return false;
  }
  async alreadyProcessed(_messageId: string) {
    return false;
  }
}

export class ProductionEmailAdapter implements MessageAdapter {
  id = "email-smtp";
  async send(_payload: SendPayload) {
    if (!process.env.SMTP_HOST) {
      return { ok: false, id: "", simulated: false, error: "SMTP is not configured" };
    }
    return { ok: false, id: "", simulated: false, error: "Wire nodemailer/Resend here" };
  }
}

export class LocalCalendarAdapter implements CalendarAdapter {
  id = "local";
  constructor(private store: { busy: { start: Date; end: Date; id: string; status: string }[] }) {}
  async isFree(start: Date, end: Date) {
    return !this.store.busy.some(
      (e) => e.status !== "CANCELLED" && e.start < end && e.end > start,
    );
  }
  async createEvent(input: { title: string; start: Date; end: Date; description: string; location: string }) {
    const id = `local_${input.start.toISOString()}`;
    this.store.busy.push({ id, start: input.start, end: input.end, status: "CONFIRMED" });
    return { id };
  }
  async updateEvent(id: string, input: { start?: Date; end?: Date; status?: string }) {
    const ev = this.store.busy.find((e) => e.id === id);
    if (!ev) return;
    if (input.start) ev.start = input.start;
    if (input.end) ev.end = input.end;
    if (input.status) ev.status = input.status;
  }
  async cancelEvent(id: string) {
    await this.updateEvent(id, { status: "CANCELLED" });
  }
}

export class GoogleCalendarAdapter implements CalendarAdapter {
  id = "google";
  async isFree(_start: Date, _end: Date): Promise<boolean> {
    if (!process.env.GOOGLE_CALENDAR_ID) throw new Error("GOOGLE_CALENDAR_ID missing");
    throw new Error("Google Calendar not connected");
  }
  async createEvent(_input: { title: string; start: Date; end: Date; description: string; location: string }): Promise<{ id: string }> {
    throw new Error("Google Calendar not connected — set GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN");
  }
  async updateEvent(_id: string, _input: { start?: Date; end?: Date; status?: string }) {
    throw new Error("Google Calendar not connected");
  }
  async cancelEvent(_id: string) {
    throw new Error("Google Calendar not connected");
  }
}

export class LocalCrmAdapter implements CrmAdapter {
  id = "local";
  async upsertLead() {
    /* leads already live in Prisma */
  }
}

export class ProductionCrmAdapter implements CrmAdapter {
  id = "hubspot-placeholder";
  async upsertLead() {
    if (!process.env.CRM_API_KEY) return;
    throw new Error("CRM adapter not wired");
  }
}

export function getNotifyAdapter(): MessageAdapter {
  return process.env.NOTIFICATION_MODE === "production"
    ? new ProductionEmailAdapter()
    : new DemoMessageAdapter();
}

export function getWhatsAppAdapter() {
  return new ProductionWhatsAppAdapter();
}

export function getCalendarAdapter(): CalendarAdapter {
  if (process.env.CALENDAR_PROVIDER === "google") return new GoogleCalendarAdapter();
  return new LocalCalendarAdapter({ busy: [] });
}

export function getCrmAdapter(): CrmAdapter {
  if (process.env.CRM_PROVIDER === "production") return new ProductionCrmAdapter();
  return new LocalCrmAdapter();
}
