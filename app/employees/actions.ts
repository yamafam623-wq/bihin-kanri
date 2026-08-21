"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function refresh() {
  revalidatePath("/employees");
  revalidatePath("/usage/new");
}

export async function createEmployeeAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.employee.create({ data: { name } });
  refresh();
}

export async function updateEmployeeAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  await prisma.employee.update({ where: { id }, data: { name } });
  refresh();
}

export async function setEmployeeActiveAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  if (!id) return;

  await prisma.employee.update({ where: { id }, data: { isActive } });
  refresh();
}
