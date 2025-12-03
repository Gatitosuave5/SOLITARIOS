import { NextResponse } from "next/server";

export function middleware(req) {
  const token =
    req.cookies.get("token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  const url = req.nextUrl;

  // Si la ruta es protegida y NO hay token → redirige al login
  if (url.pathname.startsWith("/panel") || url.pathname.startsWith("/dashboard")) {
    if (!token) {
      url.pathname = "/"; // o "/login"
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/dashboard/:path*"],
};
