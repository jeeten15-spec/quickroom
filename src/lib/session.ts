import { createHmac } from "crypto";

export const ADMIN_COOKIE = "aurevia_admin";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "demo-insecure-secret-change-me";
}

export function signSession(email: string) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${email}|${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}|${sig}`;
}

export function verifySession(token: string | undefined) {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 3) return null;
  const [email, exp, sig] = parts;
  const expected = createHmac("sha256", secret()).update(`${email}|${exp}`).digest("hex");
  if (expected !== sig) return null;
  if (Number(exp) < Date.now()) return null;
  return email;
}

export function demoAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "julia.r@example.org",
    password: process.env.ADMIN_PASSWORD || "demo-admin-2026",
  };
}

export function checkLogin(email: string, password: string) {
  const demo = demoAdminCredentials();
  return email.trim().toLowerCase() === demo.email.toLowerCase() && password === demo.password;
}
