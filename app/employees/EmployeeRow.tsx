"use client";

import { useState } from "react";
import { setEmployeeActiveAction, updateEmployeeAction } from "./actions";

type Employee = { id: number; name: string; isActive: boolean };

export function EmployeeRow({ employee }: { employee: Employee }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-gray-100">
        <td className="px-4 py-2" colSpan={3}>
          <form
            action={async (formData) => {
              await updateEmployeeAction(formData);
              setEditing(false);
            }}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="id" value={employee.id} />
            <input
              name="name"
              defaultValue={employee.name}
              required
              className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded px-3 py-1 text-xs text-gray-500 hover:bg-gray-100"
            >
              キャンセル
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-2 text-gray-900">{employee.name}</td>
      <td className="px-4 py-2">
        {employee.isActive ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            有効
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
            無効
          </span>
        )}
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
          >
            編集
          </button>
          <form action={setEmployeeActiveAction}>
            <input type="hidden" name="id" value={employee.id} />
            <input
              type="hidden"
              name="isActive"
              value={(!employee.isActive).toString()}
            />
            <button
              type="submit"
              className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
            >
              {employee.isActive ? "無効化" : "有効化"}
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
