import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next && next.startsWith("/") ? next : "/employees";

  if (await isAdminAuthenticated()) {
    redirect(nextPath);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-1 text-xl font-bold text-gray-900">管理者ログイン</h1>
      <p className="mb-6 text-sm text-gray-500">
        社員マスタ・備品マスタの管理画面には管理者パスワードが必要です。
      </p>
      <LoginForm next={nextPath} />
    </div>
  );
}
