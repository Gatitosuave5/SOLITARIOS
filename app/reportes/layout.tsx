"use client";

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<{ nombre: string; correo: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} flex h-screen antialiased`}>

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Mi Panel</h2>
        <nav className="space-y-2">
          <a href="/panel" className="block p-2 rounded hover:bg-gray-700">Inicio</a>
          <a href="/dashboard" className="block p-2 rounded hover:bg-gray-700">Panel</a>
         
        </nav>
      </aside>

      {/* Contenido */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow px-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-3">
            <span className="text-gray-600">
              {usuario ? usuario.nombre : "Cargando..."}
            </span>
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
