"use client";

import { useEffect, useState } from "react";
import { formatIstDate, formatIstTime } from "@/lib/timezone";

type Visit = {
  id: string;
  reference: string;
  startAt: string;
  status: string;
  lead: { name: string };
  salesperson: { name: string } | null;
  reminders: { kind: string; status: string }[];
};

export default function CalendarPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  useEffect(() => {
    fetch("/api/admin/visits")
      .then((r) => r.json())
      .then((d) => setVisits(d.visits || []));
  }, []);
  const upcoming = visits.filter((v) => new Date(v.startAt) >= new Date() && v.status !== "CANCELLED");
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="serif text-4xl">Calendar</h1>
      <p className="mt-2 text-sm text-muted">Local demo calendar — Google Calendar is a stub until credentials are set.</p>
      <h2 className="mt-8 font-medium">Upcoming site visits</h2>
      <ul className="mt-4 space-y-3">
        {upcoming.map((v) => (
          <li key={v.id} className="rounded-xl bg-white p-4 ring-1 ring-line">
            <p className="font-medium">
              {v.reference} — {v.lead.name}
            </p>
            <p className="text-sm text-muted">
              {formatIstDate(new Date(v.startAt))} {formatIstTime(new Date(v.startAt))} · {v.salesperson?.name} · {v.status}
            </p>
            <p className="text-xs text-muted">Reminders: {v.reminders.map((r) => `${r.kind}:${r.status}`).join(", ")}</p>
          </li>
        ))}
        {upcoming.length === 0 ? <p className="text-muted">No upcoming visits.</p> : null}
      </ul>
      <h2 className="mt-10 font-medium">All appointments</h2>
      <ul className="mt-3 text-sm">
        {visits.map((v) => (
          <li key={v.id} className="border-b border-line py-2">
            {v.reference} · {v.status} · {v.startAt}
          </li>
        ))}
      </ul>
    </main>
  );
}
