"use server";

import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession, verifyAdminPassword } from "@/lib/auth";

export type LoginState = { error: string | null };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/employees");

  if (!verifyAdminPassword(password)) {
    return { error: "パスワードが正しくありません。" };
  }

  await createAdminSession();
  redirect(next.startsWith("/") ? next : "/employees");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/");
}
