import { z } from "zod";

export const leadCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(10).max(20),
    email: z.string().trim().email().optional().or(z.literal("")),
    requirement: z.string().trim().max(240).optional().or(z.literal("")),
    consent: z.literal(true),
    consentWhatsapp: z.boolean().optional(),
    consentCall: z.boolean().optional(),
    consentEmail: z.boolean().optional(),
    honeypot: z.string().max(0).optional().or(z.literal("")),
    source: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
    referrer: z.string().optional(),
    intent: z.enum(["enquiry", "brochure", "cost_sheet", "callback", "availability", "exit"]).optional(),
  })
  .strict();

export const qualifySchema = z.object({
  leadId: z.string().min(8),
  step: z.number().int().min(1).max(8),
  answer: z.string().trim().min(1).max(500),
});

export const appointmentSchema = z.object({
  leadId: z.string().min(8),
  startAt: z.string().min(10),
  attendees: z.number().int().min(1).max(12),
  pickupRequired: z.boolean(),
  pickupLocation: z.string().max(200).optional().or(z.literal("")),
  accessibilityNotes: z.string().max(400).optional().or(z.literal("")),
});

export const noteSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const stageSchema = z.object({
  stage: z.enum([
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "VISIT_SCHEDULED",
    "VISIT_COMPLETED",
    "NEGOTIATION",
    "BOOKED",
    "LOST",
    "NURTURE",
  ]),
  lostReason: z.string().max(200).optional(),
  followUpAt: z.string().optional(),
});
