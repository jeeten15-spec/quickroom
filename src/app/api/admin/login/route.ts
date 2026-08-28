import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, checkLogin, signSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!checkLogin(String(body.email || ""), String(body.password || ""))) {
    return NextResponse.json({ error: "Invalid demo credentials" }, { status: 401 });
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, signSession(body.email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
