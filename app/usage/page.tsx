import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = {
  itemName?: string;
  employeeName?: string;
  dateFrom?: string;
  dateTo?: string;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function UsageHistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { itemName = "", employeeName = "", dateFrom = "", dateTo = "" } =
    await searchParams;

  const where: Prisma.UsageLogWhereInput = {};
  if (itemName) where.item = { name: { contains: itemName } };
  if (employeeName) where.employee = { name: { contains: employeeName } };
  if (dateFrom || dateTo) {
    where.usedAt = {
      ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00`) } : {}),
      ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59`) } : {}),
    };
  }

  const logs = await prisma.usageLog.findMany({
    where,
    include: { item: true, employee: true },
    orderBy: { usedAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">使用履歴</h1>

      <form className="mb-4 flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="itemName" className="text-xs font-medium text-gray-600">
            品目名
          </label>
          <input
            id="itemName"
            name="itemName"
            defaultValue={itemName}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="employeeName"
            className="text-xs font-medium text-gray-600"
          >
            使用者名
          </label>
          <input
            id="employeeName"
            name="employeeName"
            defaultValue={employeeName}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="dateFrom" className="text-xs font-medium text-gray-600">
            期間（開始）
          </label>
          <input
            id="dateFrom"
            name="dateFrom"
            type="date"
            defaultValue={dateFrom}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="dateTo" className="text-xs font-medium text-gray-600">
            期間（終了）
          </label>
          <input
            id="dateTo"
            name="dateTo"
            type="date"
            defaultValue={dateTo}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          絞り込み
        </button>
        <a
          href="/usage"
          className="rounded px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
        >
          クリア
        </a>
      </form>

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 font-medium">使用日</th>
              <th className="px-4 py-2 font-medium">品名</th>
              <th className="px-4 py-2 font-medium">使用者</th>
              <th className="px-4 py-2 font-medium">数量</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-900">
                  {formatDate(log.usedAt)}
                </td>
                <td className="px-4 py-2 text-gray-900">{log.item.name}</td>
                <td className="px-4 py-2 text-gray-900">{log.employee.name}</td>
                <td className="px-4 py-2 text-gray-900">
                  {log.quantity} {log.item.unit}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  該当する使用履歴がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
