export const ADMIN_COOKIE = "aurevia_admin";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "demo-insecure-secret-change-me";
}

async function hmacHex(message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifySessionEdge(token: string | undefined) {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 3) return null;
  const [email, exp, sig] = parts;
  const expected = await hmacHex(`${email}|${exp}`);
  if (expected !== sig) return null;
  if (Number(exp) < Date.now()) return null;
  return email;
}
