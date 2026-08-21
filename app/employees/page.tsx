import { prisma } from "@/lib/prisma";
import { createEmployeeAction } from "./actions";
import { EmployeeRow } from "./EmployeeRow";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">社員マスタ管理</h1>

      <form
        action={createEmployeeAction}
        className="mb-6 flex items-end gap-2 rounded border border-gray-200 bg-white p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-xs font-medium text-gray-600">
            社員名
          </label>
          <input
            id="name"
            name="name"
            required
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          追加
        </button>
      </form>

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 font-medium">氏名</th>
              <th className="px-4 py-2 font-medium">状態</th>
              <th className="px-4 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <EmployeeRow key={employee.id} employee={employee} />
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  社員が登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
