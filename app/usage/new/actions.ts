"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { registerUsage, InsufficientStockError } from "@/lib/stock";

export type UsageFormState = { error: string | null };

export async function registerUsageAction(
  _prevState: UsageFormState,
  formData: FormData
): Promise<UsageFormState> {
  const itemId = Number(formData.get("itemId"));
  const employeeId = Number(formData.get("employeeId"));
  const quantity = Number(formData.get("quantity"));
  const usedAtRaw = String(formData.get("usedAt") ?? "");

  if (!itemId) return { error: "備品を選択してください。" };
  if (!employeeId) return { error: "使用者を選択してください。" };
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "使用数量は1以上の数値を入力してください。" };
  }
  if (!usedAtRaw) return { error: "使用日を入力してください。" };

  const usedAt = new Date(`${usedAtRaw}T00:00:00`);
  if (Number.isNaN(usedAt.getTime())) {
    return { error: "使用日の形式が正しくありません。" };
  }

  try {
    await registerUsage({ itemId, employeeId, quantity, usedAt });
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/usage");
  redirect("/?registered=1");
}
