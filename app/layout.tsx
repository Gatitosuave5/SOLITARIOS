import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"], variable: "--geist-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--geist-mono" });

export const metadata: Metadata = {
  title: "Login - Sistema de Predicción de Deserción",
  description: "Accede al sistema de análisis de riesgo de deserción académica",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
