import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifyToken } from "@/lib/session";

// Obliga a iniciar sesión en todas las rutas excepto /login.
export async function proxy(request: NextRequest) {
  const ok = await verifyToken(request.cookies.get(COOKIE)?.value);
  const isLogin = request.nextUrl.pathname.startsWith("/login");

  if (!ok && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (ok && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
