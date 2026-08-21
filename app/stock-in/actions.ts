"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registerStockIn } from "@/lib/stock";

export type StockInFormState = { error: string | null };

export async function registerStockInAction(
  _prevState: StockInFormState,
  formData: FormData
): Promise<StockInFormState> {
  const itemId = Number(formData.get("itemId"));
  const quantity = Number(formData.get("quantity"));
  const receivedAtRaw = String(formData.get("receivedAt") ?? "");

  if (!itemId) return { error: "備品を選択してください。" };
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "入荷数量は1以上の数値を入力してください。" };
  }
  if (!receivedAtRaw) return { error: "入荷日を入力してください。" };

  const receivedAt = new Date(`${receivedAtRaw}T00:00:00`);
  if (Number.isNaN(receivedAt.getTime())) {
    return { error: "入荷日の形式が正しくありません。" };
  }

  await registerStockIn({ itemId, quantity, receivedAt });

  revalidatePath("/");
  revalidatePath("/stock-in");
  revalidatePath("/items");
  revalidatePath("/usage/new");
  redirect("/stock-in?registered=1");
}
