"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lead = {
  id: string;
  name: string;
  phoneMasked: string;
  stage: string;
  temperature: string;
  score: number;
  source: string | null;
  utmCampaign: string | null;
  assignedTo: { name: string } | null;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [temperature, setTemperature] = useState("");
  const [sort, setSort] = useState<"score" | "name">("score");

  function load() {
    const p = new URLSearchParams({ q, stage, temperature });
    fetch(`/api/admin/leads?${p}`)
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = [...leads].sort((a, b) => (sort === "score" ? b.score - a.score : a.name.localeCompare(b.name)));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end gap-3">
        <h1 className="serif text-4xl">Leads</h1>
        {/* Download hits the API, not an App Router page. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="btn btn-secondary ml-auto" href="/api/admin/leads?format=csv">
          Export CSV
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search name/phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-40" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          {["NEW", "CONTACTED", "QUALIFIED", "VISIT_SCHEDULED", "VISIT_COMPLETED", "NEGOTIATION", "BOOKED", "LOST", "NURTURE"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="input max-w-40" value={temperature} onChange={(e) => setTemperature(e.target.value)}>
          <option value="">All temps</option>
          <option>HOT</option>
          <option>WARM</option>
          <option>NURTURE</option>
        </select>
        <button className="btn btn-primary" onClick={load}>
          Filter
        </button>
        <button className="btn btn-secondary" onClick={() => setSort(sort === "score" ? "name" : "score")}>
          Sort: {sort}
        </button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/50">
            <tr>
              <th className="p-3">Name</th>
              <th>Phone</th>
              <th>Stage</th>
              <th>Temp</th>
              <th>Score</th>
              <th>Owner</th>
              <th>UTM</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="p-3">
                  <Link className="underline" href={`/admin/leads/${l.id}`}>
                    {l.name}
                  </Link>
                </td>
                <td>{l.phoneMasked}</td>
                <td>{l.stage}</td>
                <td>{l.temperature}</td>
                <td>{l.score}</td>
                <td>{l.assignedTo?.name}</td>
                <td>{l.utmCampaign || l.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 ? <p className="p-6 text-muted">No leads match.</p> : null}
      </div>
    </main>
  );
}
