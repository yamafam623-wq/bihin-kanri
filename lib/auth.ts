import { cookies } from "next/headers";
import crypto from "node:crypto";

export const ADMIN_SESSION_COOKIE = "bihin_admin_session";

export function adminSessionToken() {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  return expected.length > 0 && password === expected;
}

export async function createAdminSession() {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, adminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const value = store.get(ADMIN_SESSION_COOKIE)?.value;
  return !!value && value === adminSessionToken();
}
