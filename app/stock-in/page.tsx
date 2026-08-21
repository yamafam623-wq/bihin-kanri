import { prisma } from "@/lib/prisma";
import { StockInForm } from "./StockInForm";

export const dynamic = "force-dynamic";

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function StockInPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

  const [items, logs] = await Promise.all([
    prisma.item.findMany({ orderBy: { name: "asc" } }),
    prisma.stockInLog.findMany({
      include: { item: true },
      orderBy: { receivedAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">入荷登録</h1>

      {registered === "1" && (
        <p className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          入荷を登録しました。在庫数に反映されています。
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">
          入荷登録を行うには、先に備品マスタへの登録が必要です。
        </p>
      ) : (
        <StockInForm items={items} today={todayInputValue()} />
      )}

      <h2 className="mt-8 mb-4 text-lg font-bold">入荷履歴</h2>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 font-medium">入荷日</th>
              <th className="px-4 py-2 font-medium">品名</th>
              <th className="px-4 py-2 font-medium">数量</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-900">
                  {formatDate(log.receivedAt)}
                </td>
                <td className="px-4 py-2 text-gray-900">{log.item.name}</td>
                <td className="px-4 py-2 text-gray-900">
                  {log.quantity} {log.item.unit}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  入荷履歴がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
