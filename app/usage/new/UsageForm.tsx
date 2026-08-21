"use client";

import { useActionState } from "react";
import { registerUsageAction, type UsageFormState } from "./actions";

const initialState: UsageFormState = { error: null };

type Item = { id: number; name: string; quantity: number; unit: string };
type Employee = { id: number; name: string };

export function UsageForm({
  items,
  employees,
  today,
}: {
  items: Item[];
  employees: Employee[];
  today: string;
}) {
  const [state, formAction, pending] = useActionState(
    registerUsageAction,
    initialState
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="itemId" className="text-sm font-medium text-gray-700">
          備品
        </label>
        <select
          id="itemId"
          name="itemId"
          required
          defaultValue=""
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="" disabled>
            選択してください
          </option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}（在庫: {item.quantity}{item.unit}）
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="employeeId" className="text-sm font-medium text-gray-700">
          使用者
        </label>
        <select
          id="employeeId"
          name="employeeId"
          required
          defaultValue=""
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="" disabled>
            選択してください
          </option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          使用数量
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          step={1}
          required
          defaultValue={1}
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="usedAt" className="text-sm font-medium text-gray-700">
          使用日
        </label>
        <input
          id="usedAt"
          name="usedAt"
          type="date"
          required
          defaultValue={today}
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "登録中..." : "登録する"}
      </button>
    </form>
  );
}
