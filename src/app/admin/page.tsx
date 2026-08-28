"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Kpis = {
  total: number;
  newLeads: number;
  hot: number;
  visitsBooked: number;
  upcoming: number;
  conversionRate: number;
  avgResponseMinutes: number;
};

export default function AdminHome() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [funnel, setFunnel] = useState<{ stage: string; _count: number }[]>([]);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/kpis")
      .then((r) => r.json())
      .then((d) => {
        setKpis(d.kpis);
        setFunnel(d.funnel);
      });
  }, []);

  async function reset() {
    if (!confirm("Reset all demo data to the seed? This cannot be undone.")) return;
    setResetting(true);
    await fetch("/api/admin/reset", { method: "POST" });
    setResetting(false);
    location.reload();
  }

  const cards = kpis
    ? [
        ["Total leads", kpis.total],
        ["New (24h)", kpis.newLeads],
        ["Hot", kpis.hot],
        ["Visits booked", kpis.visitsBooked],
        ["Upcoming visits", kpis.upcoming],
        ["Visit conversion %", kpis.conversionRate],
        ["Avg response (min)", kpis.avgResponseMinutes],
      ]
    : [];

  const max = Math.max(...funnel.map((f) => f._count), 1);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="serif text-4xl">Pipeline</h1>
      <p className="mt-2 text-sm text-muted">
        Scores are hidden from customers. Notifications in this desk are simulated unless production adapters are enabled.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
            <p className="serif mt-1 text-3xl">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 font-medium">Funnel</h2>
      <div className="mt-3 space-y-2">
        {funnel.map((f) => (
          <div key={f.stage}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{f.stage}</span>
              <span>{f._count}</span>
            </div>
            <div className="h-2 rounded bg-sand">
              <div className="h-2 rounded bg-emerald" style={{ width: `${(f._count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn btn-primary" href="/admin/leads">
          Open leads
        </Link>
        <button className="btn btn-secondary" onClick={reset} disabled={resetting}>
          {resetting ? "Resetting…" : "Reset demo data"}
        </button>
      </div>
    </main>
  );
}
