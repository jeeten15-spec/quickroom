import { execSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { normalizePhone, isValidIndianMobile } from "@/lib/phone";
import { scoreLead } from "@/lib/scoring";
import { istLocalToUtc } from "@/lib/timezone";
import { buildIcs } from "@/lib/ics";
import { whatsappPrefillHref } from "@/services/adapters";

describe("phone", () => {
  it("normalizes Indian mobiles", () => {
    expect(normalizePhone("9000012345")).toBe("919000012345");
    expect(normalizePhone("+91 90000 12345")).toBe("919000012345");
    expect(isValidIndianMobile("12345")).toBe(false);
  });
});

describe("scoring", () => {
  it("scores hot leads with transparent reasons", () => {
    const r = scoreLead({
      buyingTimeline: "within_30_days",
      wantsSiteVisit: "yes",
      budgetBand: "50_75",
      phone: "919000011101",
      email: "a@b.com",
    });
    expect(r.score).toBe(30 + 25 + 15 + 5);
    expect(r.temperature).toBe("HOT");
    expect(r.reasons.map((x) => x.id)).toContain("visit_yes");
  });

  it("marks explorers as nurture unless other points accumulate", () => {
    const r = scoreLead({ buyingTimeline: "exploring", phone: "919000011101" });
    expect(r.score).toBe(2);
    expect(r.temperature).toBe("NURTURE");
  });
});

describe("timezone", () => {
  it("converts IST civil time to UTC", () => {
    const d = istLocalToUtc(2026, 8, 28, 10, 30);
    expect(d.toISOString()).toBe("2026-08-28T05:00:00.000Z");
  });
});

describe("whatsapp link", () => {
  it("encodes prefill text", () => {
    const href = whatsappPrefillHref("919000011102", "Hello, I’m interested in Aurevia Greens");
    expect(href.startsWith("https://wa.me/919000011102?text=")).toBe(true);
    expect(href).toContain("Aurevia");
  });
});

describe("ics", () => {
  it("builds a downloadable event", () => {
    const ics = buildIcs({
      uid: "1",
      title: "Visit",
      description: "Demo",
      location: "Mokila",
      start: new Date("2026-09-01T05:00:00Z"),
      end: new Date("2026-09-01T05:45:00Z"),
    });
    expect(ics).toContain("BEGIN:VEVENT");
  });
});

describe("database flows", () => {
  beforeAll(() => {
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "inherit",
      env: { ...process.env },
    });
  });

  afterAll(async () => {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$disconnect();
  });

  it("creates leads, rejects bad phones, detects duplicates, qualifies and scores", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { createLeadFromForm, saveQualification } = await import("@/lib/leads");
    await prisma.salesperson.create({
      data: {
        name: "Test RM",
        phone: "+91 90000 19999",
        email: `rm${Date.now()}@aurevia.example`,
      },
    });
    const unique = `90000${String(Date.now()).slice(-5)}`;
    await expect(createLeadFromForm({ name: "A", phone: "12", consent: true })).rejects.toThrow(/mobile/);
    const first = await createLeadFromForm({
      name: "Kavya Demo",
      phone: unique,
      email: "kavya.demo@example.com",
      consent: true,
      requirement: "plot",
    });
    if ("ignored" in first) throw new Error("honeypot");
    const dup = await createLeadFromForm({
      name: "Kavya Demo",
      phone: unique,
      consent: true,
    });
    if ("ignored" in dup) throw new Error("honeypot");
    expect(dup.duplicate).toBe(true);
    expect(dup.lead.id).toBe(first.lead.id);
    await saveQualification(first.lead.id, 1, "plot");
    await saveQualification(first.lead.id, 3, "50_75");
    await saveQualification(first.lead.id, 5, "within_30_days");
    await saveQualification(first.lead.id, 7, "yes");
    const lead = await prisma.lead.findUnique({ where: { id: first.lead.id } });
    expect(lead?.score).toBeGreaterThanOrEqual(50);
    expect(lead?.temperature).toBe("HOT");
  });

  it("looks up slots, prevents double booking, schedules reminders, cancels them", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { getAvailableSlots } = await import("@/lib/availability");
    const { bookVisit, cancelAppointment } = await import("@/lib/appointments");
    const { createLeadFromForm } = await import("@/lib/leads");
    const slots = await getAvailableSlots();
    expect(slots.length).toBeGreaterThan(0);
    const phone = `91100${String(Date.now()).slice(-5)}`.slice(-10);
    const created = await createLeadFromForm({ name: "Visit Demo", phone, consent: true, email: "visit.demo@example.com" });
    if ("ignored" in created) throw new Error("honeypot");
    const start = new Date(slots[0].startAt);
    const booked = await bookVisit({
      leadId: created.lead.id,
      startAt: start,
      attendees: 2,
      pickupRequired: true,
      pickupLocation: "Gachibowli demo",
    });
    expect(booked.appointment.reference.startsWith("AVG-")).toBe(true);
    const reminders = await prisma.reminder.findMany({ where: { appointmentId: booked.appointment.id } });
    expect(reminders).toHaveLength(2);
    await expect(
      bookVisit({
        leadId: created.lead.id,
        startAt: start,
        attendees: 1,
        pickupRequired: false,
      }),
    ).rejects.toThrow(/available|slot/i);
    await cancelAppointment(booked.appointment.id);
    const after = await prisma.reminder.findMany({ where: { appointmentId: booked.appointment.id } });
    expect(after.every((r) => r.status === "CANCELLED")).toBe(true);
  });

  it("assigns a salesperson", async () => {
    const { assignRoundRobin } = await import("@/lib/assignment");
    const person = await assignRoundRobin();
    expect(person?.email).toBeTruthy();
  });
});
