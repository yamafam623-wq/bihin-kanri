import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const items = await prisma.item.findMany({ orderBy: { name: "asc" } });
  const lowStockCount = items.filter((item) => item.quantity <= item.threshold).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">在庫一覧</h1>
        {lowStockCount > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            発注点以下: {lowStockCount}件
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 font-medium">品名</th>
              <th className="px-4 py-2 font-medium">現在庫数</th>
              <th className="px-4 py-2 font-medium">発注点</th>
              <th className="px-4 py-2 font-medium">単位</th>
              <th className="px-4 py-2 font-medium">備考</th>
              <th className="px-4 py-2 font-medium">状態</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isLow = item.quantity <= item.threshold;
              return (
                <tr
                  key={item.id}
                  className={`border-t border-gray-100 ${
                    isLow ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td
                    className={`px-4 py-2 ${
                      isLow ? "font-bold text-red-700" : "text-gray-900"
                    }`}
                  >
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{item.threshold}</td>
                  <td className="px-4 py-2 text-gray-600">{item.unit}</td>
                  <td className="px-4 py-2 text-gray-500">{item.note}</td>
                  <td className="px-4 py-2">
                    {isLow ? (
                      <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                        発注点以下
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        正常
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  備品が登録されていません。備品マスタから登録してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
