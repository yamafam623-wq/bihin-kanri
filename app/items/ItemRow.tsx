"use client";

import { useState } from "react";
import { adjustItemQuantityAction, updateItemAction } from "./actions";

type Item = {
  id: number;
  name: string;
  quantity: number;
  threshold: number;
  unit: string;
  note: string | null;
};

type Mode = "view" | "edit" | "adjust";

export function ItemRow({ item }: { item: Item }) {
  const [mode, setMode] = useState<Mode>("view");
  const isLow = item.quantity <= item.threshold;

  if (mode === "edit") {
    return (
      <tr className="border-t border-gray-100 bg-blue-50/40">
        <td className="px-4 py-2" colSpan={6}>
          <form
            action={async (formData) => {
              await updateItemAction(formData);
              setMode("view");
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="id" value={item.id} />
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              品名
              <input
                name="name"
                defaultValue={item.name}
                required
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              発注点
              <input
                name="threshold"
                type="number"
                min={0}
                defaultValue={item.threshold}
                required
                className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              単位
              <input
                name="unit"
                defaultValue={item.unit}
                required
                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              備考
              <input
                name="note"
                defaultValue={item.note ?? ""}
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
            >
              キャンセル
            </button>
          </form>
        </td>
      </tr>
    );
  }

  if (mode === "adjust") {
    return (
      <tr className="border-t border-gray-100 bg-yellow-50/60">
        <td className="px-4 py-2" colSpan={6}>
          <form
            action={async (formData) => {
              await adjustItemQuantityAction(formData);
              setMode("view");
            }}
            className="flex items-end gap-2"
          >
            <input type="hidden" name="id" value={item.id} />
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              棚卸し後の在庫数（{item.name}）
              <input
                name="quantity"
                type="number"
                min={0}
                defaultValue={item.quantity}
                required
                autoFocus
                className="w-28 rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
            >
              更新
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
            >
              キャンセル
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-t border-gray-100 ${isLow ? "bg-red-50" : ""}`}>
      <td className="px-4 py-2 font-medium text-gray-900">{item.name}</td>
      <td className={`px-4 py-2 ${isLow ? "font-bold text-red-700" : "text-gray-900"}`}>
        {item.quantity}
      </td>
      <td className="px-4 py-2 text-gray-600">{item.threshold}</td>
      <td className="px-4 py-2 text-gray-600">{item.unit}</td>
      <td className="px-4 py-2 text-gray-500">{item.note}</td>
      <td className="px-4 py-2">
        <div className="flex flex-wrap gap-2">
          {isLow && (
            <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              発注点以下
            </span>
          )}
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
          >
            編集
          </button>
          <button
            type="button"
            onClick={() => setMode("adjust")}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            在庫数調整（棚卸し）
          </button>
        </div>
      </td>
    </tr>
  );
}
