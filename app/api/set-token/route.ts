
import { NextResponse } from "next/server";

export async function POST(req) {
  const { token } = await req.json();

  const res = NextResponse.json({ message: "Token guardado" });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return res;
}