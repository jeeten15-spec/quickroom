"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function Form() {
  const [email, setEmail] = useState("julia.r@example.org");
  const [password, setPassword] = useState("demo-admin-2026");
  const [error, setError] = useState("");
  const router = useRouter();
  const next = useSearchParams().get("next") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError("Invalid demo credentials");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-24 max-w-sm space-y-3 rounded-2xl bg-white p-6 ring-1 ring-line">
      <h1 className="serif text-3xl">Sales desk</h1>
      <p className="text-sm text-muted">Demo login only. Production must use an identity provider and hashed passwords.</p>
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
      <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      <button className="btn btn-primary w-full">Enter dashboard</button>
      <Link className="block text-center text-sm underline" href="/">
        Back to site
      </Link>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
