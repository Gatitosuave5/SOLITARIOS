"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex">
      {/* Botón móvil */}
      <button
        className="md:hidden p-3"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white h-screen p-5 flex flex-col gap-4 transition-all duration-300
        ${open ? "w-64" : "w-0 overflow-hidden"} md:w-64`}
      >
        <h2 className="text-2xl font-bold mb-4">Panel</h2>

        <Link
          href="/"
          className="block p-2 rounded hover:bg-gray-700 transition"
        >
          Inicio
        </Link>

        <Link
          href="/usuarios"
          className="block p-2 rounded hover:bg-gray-700 transition"
        >
          Usuarios
        </Link>

        <Link
          href="/alumnos"
          className="block p-2 rounded hover:bg-gray-700 transition"
        >
          Alumnos
        </Link>

        <Link
          href="/alertas"
          className="block p-2 rounded hover:bg-gray-700 transition"
        >
          Alertas
        </Link>

        <Link
          href="/reportes"
          className="block p-2 rounded hover:bg-gray-700 transition"
        >
          Reportes
        </Link>
      </aside>
    </div>
  );
}
