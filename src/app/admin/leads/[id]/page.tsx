"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { jsonParse } from "@/lib/utils";

type Reason = { label: string; points: number };

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Record<string, unknown> | null>(null);
  const [people, setPeople] = useState<{ id: string; name: string }[]>([]);
  const [note, setNote] = useState("");
  const [stage, setStage] = useState("");
  const [lostReason, setLostReason] = useState("");

  async function load() {
    const [a, b] = await Promise.all([fetch(`/api/admin/leads/${id}`).then((r) => r.json()), fetch("/api/admin/salespeople").then((r) => r.json())]);
    setLead(a.lead);
    setStage(a.lead?.stage || "");
    setPeople(b.salespeople || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!lead) return <p className="p-8">Loading…</p>;
  const reasons = jsonParse<Reason[]>(String(lead.scoreReasons || "[]"), []);
  const conversations = (lead.conversations as { messages: { id: string; direction: string; body: string; simulated: boolean }[] }[]) || [];
  const appointments = (lead.appointments as { id: string; reference: string; startAt: string; status: string }[]) || [];
  const quals = (lead.qualifications as { step: number; question: string; answer: string }[]) || [];
  const notes = (lead.notes as { id: string; body: string; author: string }[]) || [];
  const activities = (lead.activities as { id: string; type: string; detail: string }[]) || [];

  async function patch(body: Record<string, unknown>) {
    await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    load();
  }

  async function visitAction(appointmentId: string, action: string, extra: Record<string, unknown> = {}) {
    await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    load();
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-3">
      <section className="lg:col-span-2 space-y-4">
        <h1 className="serif text-4xl">{String(lead.name)}</h1>
        <p className="text-sm text-muted">
          {String(lead.phone)} · {String(lead.email || "no email")} · {String(lead.temperature)} · score {String(lead.score)}
        </p>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <h2 className="font-medium">Score reasons (internal)</h2>
          <ul className="mt-2 text-sm">
            {reasons.map((r) => (
              <li key={r.label}>
                {r.label}: +{r.points}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <h2 className="font-medium">Qualification</h2>
          {quals.map((q) => (
            <p key={q.step} className="mt-2 text-sm">
              <span className="text-muted">{q.question}</span> — {q.answer}
            </p>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <h2 className="font-medium">Conversation (simulated labelled)</h2>
          {conversations.flatMap((c) =>
            c.messages.map((m) => (
              <p key={m.id} className="mt-2 text-sm">
                <span className="text-muted">{m.direction}</span> {m.body} {m.simulated ? "(simulated)" : ""}
              </p>
            )),
          )}
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <h2 className="font-medium">Activity</h2>
          {activities.map((a) => (
            <p key={a.id} className="mt-1 text-sm text-muted">
              {a.type}: {a.detail}
            </p>
          ))}
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <label className="text-sm">Stage</label>
          <select className="input mt-1" value={stage} onChange={(e) => setStage(e.target.value)}>
            {["NEW", "CONTACTED", "QUALIFIED", "VISIT_SCHEDULED", "VISIT_COMPLETED", "NEGOTIATION", "BOOKED", "LOST", "NURTURE"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {stage === "LOST" ? (
            <input className="input mt-2" placeholder="Lost reason" value={lostReason} onChange={(e) => setLostReason(e.target.value)} />
          ) : null}
          <button className="btn btn-primary mt-3 w-full" onClick={() => patch({ stage, lostReason })}>
            Save stage
          </button>
          <label className="mt-4 block text-sm">Assign</label>
          <select className="input mt-1" defaultValue={String((lead.assignedTo as { id?: string } | null)?.id || "")} onChange={(e) => patch({ assignedToId: e.target.value })}>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <h2 className="font-medium">Notes</h2>
          {notes.map((n) => (
            <p key={n.id} className="mt-2 text-sm">
              {n.author}: {n.body}
            </p>
          ))}
          <textarea className="input mt-2" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn btn-secondary mt-2" onClick={() => { patch({ note }); setNote(""); }}>
            Add note
          </button>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <h2 className="font-medium">Visits</h2>
          {appointments.map((a) => (
            <div key={a.id} className="mt-3 text-sm">
              <p>
                {a.reference} · {new Date(a.startAt).toLocaleString("en-IN")} · {a.status}
              </p>
              <button className="underline" onClick={() => visitAction(a.id, "complete", { feedback: "Demo visit completed" })}>
                Mark completed
              </button>{" "}
              <button className="underline" onClick={() => visitAction(a.id, "cancel")}>
                Cancel
              </button>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
