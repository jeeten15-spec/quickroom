import { cookies } from "next/headers";
import { ADMIN_COOKIE, checkLogin, demoAdminCredentials, signSession, verifySession } from "@/lib/session";

export { ADMIN_COOKIE, checkLogin, demoAdminCredentials, signSession, verifySession };

export async function getAdminEmail() {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  const email = await getAdminEmail();
  if (!email) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return email;
}
