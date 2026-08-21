"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { maybeNotifyLowStock } from "@/lib/stock";

function refresh() {
  revalidatePath("/items");
  revalidatePath("/");
  revalidatePath("/usage/new");
}

export async function createItemAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  const threshold = Number(formData.get("threshold"));
  const note = String(formData.get("note") ?? "").trim();

  if (!name || !unit) return;
  if (!Number.isFinite(quantity) || quantity < 0) return;
  if (!Number.isFinite(threshold) || threshold < 0) return;

  const item = await prisma.item.create({
    data: { name, unit, quantity, threshold, note: note || null },
  });

  await maybeNotifyLowStock(item);
  refresh();
}

export async function updateItemAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const threshold = Number(formData.get("threshold"));
  const note = String(formData.get("note") ?? "").trim();

  if (!id || !name || !unit) return;
  if (!Number.isFinite(threshold) || threshold < 0) return;

  const item = await prisma.item.update({
    where: { id },
    data: { name, unit, threshold, note: note || null },
  });

  await maybeNotifyLowStock(item);
  refresh();
}

export async function adjustItemQuantityAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const quantity = Number(formData.get("quantity"));

  if (!id || !Number.isFinite(quantity) || quantity < 0) return;

  const item = await prisma.item.update({
    where: { id },
    data: { quantity },
  });

  await maybeNotifyLowStock(item);
  refresh();
}
