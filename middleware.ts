import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl;

  // PROTEGER RUTAS
  if (!token && (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/panel"))) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/panel/:path*"],
};
