import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Extrae el token del body
  const { token } = await req.json();

  // Crea la respuesta JSON
  const res = NextResponse.json({ message: "Token guardado" });

  // Configura la cookie
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: false, // en producción lo recomendable es true con HTTPS
    sameSite: "lax",
    path: "/",
  });

  return res;
}
