import { prisma } from "@/lib/prisma";
import { createItemAction } from "./actions";
import { ItemRow } from "./ItemRow";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const items = await prisma.item.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">備品マスタ管理</h1>

      <form
        action={createItemAction}
        className="mb-6 flex flex-wrap items-end gap-2 rounded border border-gray-200 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          品名
          <input
            name="name"
            required
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          初期在庫数
          <input
            name="quantity"
            type="number"
            min={0}
            defaultValue={0}
            required
            className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          発注点
          <input
            name="threshold"
            type="number"
            min={0}
            defaultValue={0}
            required
            className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          単位
          <input
            name="unit"
            placeholder="個・本など"
            required
            className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          備考
          <input
            name="note"
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          追加
        </button>
      </form>

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 font-medium">品名</th>
              <th className="px-4 py-2 font-medium">現在庫数</th>
              <th className="px-4 py-2 font-medium">発注点</th>
              <th className="px-4 py-2 font-medium">単位</th>
              <th className="px-4 py-2 font-medium">備考</th>
              <th className="px-4 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  備品が登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
