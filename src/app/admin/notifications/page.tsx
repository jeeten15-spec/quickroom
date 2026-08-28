"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [data, setData] = useState<{ notifications: { id: string; templateKey: string; recipient: string; status: string; simulated: boolean; error?: string | null; body: string }[]; reminders: { id: string; kind: string; dueAt: string; status: string }[] }>({
    notifications: [],
    reminders: [],
  });
  const [now, setNow] = useState("");

  async function load() {
    const d = await fetch("/api/admin/reminders").then((r) => r.json());
    setData(d);
  }
  useEffect(() => {
    load();
  }, []);

  async function runDue() {
    await fetch("/api/admin/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ now: now || undefined }) });
    load();
  }

  async function retry(id: string) {
    await fetch("/api/admin/reminders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: id }) });
    load();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="serif text-4xl">Notifications & reminders</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        This queue is database-backed. Closing the browser does not run jobs. Use “Run due reminders” or a hosted
        cron in production (Vercel Cron hitting this route with a secret).
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="text-sm">
          Simulate time (ISO)
          <input className="input mt-1" value={now} onChange={(e) => setNow(e.target.value)} placeholder={new Date().toISOString()} />
        </label>
        <button className="btn btn-primary" onClick={runDue}>
          Run due reminders
        </button>
      </div>
      <h2 className="mt-8 font-medium">Reminders</h2>
      <ul className="mt-2 text-sm">
        {data.reminders.map((r) => (
          <li key={r.id}>
            {r.kind} · due {r.dueAt} · {r.status}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-medium">Log</h2>
      <ul className="mt-2 space-y-2">
        {data.notifications.map((n) => (
          <li key={n.id} className="rounded-xl bg-white p-3 text-sm ring-1 ring-line">
            <p>
              {n.templateKey} → {n.recipient} · {n.status} {n.simulated ? "(simulated)" : ""}
            </p>
            <p className="text-muted">{n.body}</p>
            {n.status === "FAILED" ? (
              <button className="underline" onClick={() => retry(n.id)}>
                Retry
              </button>
            ) : null}
            {n.error ? <p className="text-red-800">{n.error}</p> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
