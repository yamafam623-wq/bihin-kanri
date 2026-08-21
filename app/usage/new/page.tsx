import { prisma } from "@/lib/prisma";
import { UsageForm } from "./UsageForm";

export const dynamic = "force-dynamic";

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function NewUsagePage() {
  const [items, employees] = await Promise.all([
    prisma.item.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">使用登録</h1>
      {items.length === 0 || employees.length === 0 ? (
        <p className="text-sm text-gray-500">
          使用登録を行うには、先に備品マスタ・社員マスタへの登録が必要です。
        </p>
      ) : (
        <UsageForm items={items} employees={employees} today={todayInputValue()} />
      )}
    </div>
  );
}
