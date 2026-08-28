"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { qualificationSteps } from "@/config/scoring";
import { project } from "@/config/project";
import { site } from "@/config/site";
import { formatIstDate, formatIstTime } from "@/lib/timezone";

type Slot = { startAt: string; endAt: string };

export function EnquiryExperience({
  compact = false,
  intent = "enquiry",
  heading,
}: {
  compact?: boolean;
  intent?: string;
  heading?: string;
}) {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [ack, setAck] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [slots, setSlots] = useState<Slot[]>([]);
  const [booking, setBooking] = useState({
    startAt: "",
    attendees: 2,
    pickupRequired: false,
    pickupLocation: "",
    accessibilityNotes: "",
  });
  const [summary, setSummary] = useState<null | {
    reference: string;
    appointmentId: string;
    confirmation: string;
    manager: { name: string; phone: string } | null;
    startAt: string;
  }>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    requirement: "",
    consent: false,
    consentWhatsapp: true,
    honeypot: "",
  });

  const utm = useMemo(() => {
    if (typeof window === "undefined") return {};
    const p = new URLSearchParams(window.location.search);
    return {
      utmSource: p.get("utm_source") || undefined,
      utmMedium: p.get("utm_medium") || undefined,
      utmCampaign: p.get("utm_campaign") || undefined,
      utmTerm: p.get("utm_term") || undefined,
      utmContent: p.get("utm_content") || undefined,
      referrer: document.referrer || undefined,
    };
  }, []);

  useEffect(() => {
    if (step === 7 && answers[7] === "yes") {
      fetch("/api/availability")
        .then((r) => r.json())
        .then((d) => setSlots(d.slots || []));
    }
  }, [step, answers]);

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, intent, ...utm, consentCall: true }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not send enquiry");
      return;
    }
    setLeadId(data.leadId);
    setAck(data.acknowledgement);
    setStep(1);
  }

  async function sendAnswer(value: string) {
    if (!leadId) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/qualify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, step, answer: value }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    setAnswers((prev) => ({ ...prev, [step]: value }));
    setStep(data.nextStep ?? 9);
  }

  async function confirmVisit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId || !booking.startAt) return;
    setLoading(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, ...booking, attendees: Number(booking.attendees) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Slot unavailable");
      return;
    }
    setSummary(data);
  }

  const current = qualificationSteps.find((s) => s.id === step);
  const groupedSlots = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const day = formatIstDate(new Date(s.startAt));
    acc[day] = acc[day] || [];
    acc[day].push(s);
    return acc;
  }, {});

  if (summary) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald">Visit confirmed</p>
        <h3 className="serif mt-2 text-3xl">Reference {summary.reference}</h3>
        <p className="mt-3 text-muted">{summary.confirmation}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a className="btn btn-primary" href={`/api/appointments/${summary.appointmentId}/ics`}>
            Add to calendar
          </a>
          <a className="btn btn-secondary" href={project.map.directionsUrl} target="_blank" rel="noreferrer">
            Get directions
          </a>
          <Link className="btn btn-secondary" href="/thank-you">
            Done
          </Link>
        </div>
        <RescheduleNote appointmentId={summary.appointmentId} />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-line ${compact ? "p-4" : "p-6 md:p-8"}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-emerald">{heading || "Enquire"}</p>
      <h3 className="serif mt-1 text-2xl md:text-3xl">{leadId ? "A few quick questions" : "Share your requirement"}</h3>
      {error ? <p className="mt-3 text-sm text-red-800">{error}</p> : null}

      {!leadId ? (
        <form onSubmit={submitLead} className="mt-5 grid gap-3" noValidate>
          <label className="text-sm">
            Name
            <input className="input mt-1" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
          </label>
          <label className="text-sm">
            Mobile number
            <input className="input mt-1" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" autoComplete="tel" />
          </label>
          <label className="text-sm">
            Email <span className="text-muted">(optional)</span>
            <input className="input mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          </label>
          <label className="text-sm">
            Requirement
            <input className="input mt-1" value={form.requirement} onChange={(e) => setForm({ ...form, requirement: e.target.value })} placeholder="Plot size, timeline…" />
          </label>
          <label className="sr-only">
            Company
            <input value={form.honeypot} onChange={(e) => setForm({ ...form, honeypot: e.target.value })} tabIndex={-1} autoComplete="off" />
          </label>
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" className="mt-1" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} required />
            I agree to be contacted about this demonstration enquiry by call, WhatsApp or email. I have read the{" "}
            <Link className="underline" href="/privacy">
              privacy notice
            </Link>
            .
          </label>
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" className="mt-1" checked={form.consentWhatsapp} onChange={(e) => setForm({ ...form, consentWhatsapp: e.target.checked })} />
            WhatsApp updates (opt-in)
          </label>
          <button className="btn btn-primary mt-2" disabled={loading}>
            {loading ? "Sending…" : "Submit enquiry"}
          </button>
        </form>
      ) : (
        <div className="mt-4">
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl bg-ivory p-3 text-sm">
            <p className="rounded-2xl rounded-tl-sm bg-forest px-3 py-2 text-ivory">{ack}</p>
            {Object.entries(answers).map(([k, v]) => (
              <p key={k} className="ml-8 rounded-2xl rounded-tr-sm bg-white px-3 py-2 ring-1 ring-line">
                {v}
              </p>
            ))}
            {current ? <p className="rounded-2xl rounded-tl-sm bg-forest px-3 py-2 text-ivory">{current.question}</p> : null}
          </div>

          {current && current.options ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {current.options.map((opt) => (
                <button key={opt.value} type="button" className="btn btn-secondary text-sm" disabled={loading} onClick={() => sendAnswer(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          ) : null}

          {current && !current.options ? (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const value = String(new FormData(e.currentTarget).get("free") || "");
                if (value.trim()) sendAnswer(value.trim());
              }}
            >
              <input name="free" className="input" placeholder={"placeholder" in current ? current.placeholder : ""} required />
              <button className="btn btn-primary" disabled={loading}>
                Send
              </button>
            </form>
          ) : null}

          {step > 1 && step <= 8 ? (
            <button type="button" className="mt-3 text-sm underline" onClick={() => setStep(step - 1)}>
              Back to previous question
            </button>
          ) : null}

          {step >= 9 && answers[7] === "yes" ? (
            <form onSubmit={confirmVisit} className="mt-6 space-y-3 border-t border-line pt-4">
              <h4 className="serif text-2xl">Choose a visit slot</h4>
              <p className="text-sm text-muted">Times are Asia/Kolkata. Past dates are hidden. A slot is held only after you confirm.</p>
              <div className="max-h-56 space-y-3 overflow-y-auto">
                {Object.entries(groupedSlots).map(([day, list]) => (
                  <fieldset key={day}>
                    <legend className="text-sm font-medium">{day}</legend>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {list.map((s) => (
                        <label key={s.startAt} className="cursor-pointer text-sm">
                          <input type="radio" name="slot" className="mr-1" required checked={booking.startAt === s.startAt} onChange={() => setBooking({ ...booking, startAt: s.startAt })} />
                          {formatIstTime(new Date(s.startAt))}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
              <label className="text-sm">
                How many people will attend?
                <input type="number" min={1} max={12} className="input mt-1" value={booking.attendees} onChange={(e) => setBooking({ ...booking, attendees: Number(e.target.value) })} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={booking.pickupRequired} onChange={(e) => setBooking({ ...booking, pickupRequired: e.target.checked })} />
                Request weekend / visit pickup assistance
              </label>
              {booking.pickupRequired ? (
                <input className="input" placeholder="Pickup location" value={booking.pickupLocation} onChange={(e) => setBooking({ ...booking, pickupLocation: e.target.value })} required />
              ) : null}
              <label className="text-sm">
                Accessibility or other notes
                <textarea className="input mt-1" value={booking.accessibilityNotes} onChange={(e) => setBooking({ ...booking, accessibilityNotes: e.target.value })} />
              </label>
              {booking.startAt ? (
                <div className="rounded-xl bg-ivory p-3 text-sm">
                  <p className="font-medium">Summary before confirmation</p>
                  <p>
                    {formatIstDate(new Date(booking.startAt))} at {formatIstTime(new Date(booking.startAt))} · {booking.attendees} guest(s)
                  </p>
                  <p>Meeting point: {project.meetingPoint}</p>
                  <p>Advisor will be assigned from the {site.companyName} desk.</p>
                </div>
              ) : null}
              <button className="btn btn-primary" disabled={loading || !booking.startAt}>
                Confirm site visit
              </button>
            </form>
          ) : null}

          {step >= 9 && answers[7] !== "yes" ? (
            <p className="mt-4 text-sm text-muted">An advisor will follow up on your preferred channel. You can still book from the header anytime.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function RescheduleNote({ appointmentId }: { appointmentId: string }) {
  const [msg, setMsg] = useState("");
  async function act(action: string) {
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setMsg(res.ok ? (action === "cancel" ? "Visit cancelled. Reminders stopped." : "Updated") : "Could not update");
  }
  return (
    <div className="mt-4 flex flex-wrap gap-3 text-sm">
      <button type="button" className="underline" onClick={() => act("cancel")}>
        Cancel visit
      </button>
      <span className="text-muted">To reschedule, cancel and book a new slot from the enquiry widget.</span>
      {msg ? <p>{msg}</p> : null}
    </div>
  );
}
