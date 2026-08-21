import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const ADMIN_SESSION_COOKIE = "bihin_admin_session";

function adminSessionToken() {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (cookie && cookie === adminSessionToken()) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/employees/:path*", "/items/:path*"],
};
