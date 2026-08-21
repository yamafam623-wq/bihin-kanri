import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

const links = [
  { href: "/", label: "在庫一覧" },
  { href: "/usage/new", label: "使用登録" },
  { href: "/usage", label: "使用履歴" },
  { href: "/stock-in", label: "入荷登録" },
  { href: "/employees", label: "社員マスタ" },
  { href: "/items", label: "備品マスタ" },
];

export async function NavBar() {
  const authenticated = await isAdminAuthenticated();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <nav className="flex flex-wrap items-center gap-1">
          <span className="mr-3 font-bold text-gray-900">備品管理</span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {authenticated && (
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
            >
              ログアウト
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
