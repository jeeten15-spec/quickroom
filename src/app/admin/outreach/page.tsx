"use client";

import { useEffect, useState } from "react";
import { outreach } from "@/config/outreach";
import { offer } from "@/config/offer";

type Touch = { id: string; firmName: string; contactName: string | null; phone: string | null; area: string | null; channel: string; status: string };

export default function OutreachPage() {
  const [touches, setTouches] = useState<Touch[]>([]);
  useEffect(() => {
    fetch("/api/admin/outreach")
      .then((r) => r.json())
      .then((d) => setTouches(d.touches || []));
  }, []);

  async function mark(id: string, status: string) {
    await fetch("/api/admin/outreach", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    setTouches((rows) => rows.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  const done = touches.filter((t) => t.status === "DONE").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="serif text-4xl">Daily outreach</h1>
      <p className="mt-2 text-muted">
        Target {outreach.dailyTouchTarget} touches/weekday. Close call: {outreach.closeCall.minutes} minutes. Package{" "}
        {offer.packageName} at {offer.priceInr}, {offer.deposit}.
      </p>
      <p className="mt-2 text-sm">
        Today on this list: {done}/{touches.length} marked done.
      </p>
      <ol className="mt-6 list-decimal space-y-1 pl-5 text-sm">
        {outreach.closeCall.agenda.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ol>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/50">
            <tr>
              <th className="p-3">Firm</th>
              <th>Contact</th>
              <th>Area</th>
              <th>Channel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {touches.map((t) => (
              <tr key={t.id} className="border-t border-line">
                <td className="p-3">{t.firmName}</td>
                <td>
                  {t.contactName}
                  <br />
                  {t.phone}
                </td>
                <td>{t.area}</td>
                <td>{t.channel}</td>
                <td>
                  <button className="underline" onClick={() => mark(t.id, t.status === "DONE" ? "PLANNED" : "DONE")}>
                    {t.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <pre className="overflow-auto rounded-xl bg-white p-3 text-xs ring-1 ring-line">{outreach.phoneScript}</pre>
        <pre className="overflow-auto rounded-xl bg-white p-3 text-xs ring-1 ring-line">{outreach.emailScript}</pre>
        <pre className="overflow-auto rounded-xl bg-white p-3 text-xs ring-1 ring-line">{outreach.whatsappScript}</pre>
      </section>
    </main>
  );
}
