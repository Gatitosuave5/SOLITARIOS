"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, GraduationCap } from "lucide-react"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validaciones frontend
      if (!fullName || !email || !password || !confirmPassword) {
        setError("Por favor completa todos los campos")
        setIsLoading(false)
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError("Ingresa un email válido")
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        setIsLoading(false)
        return
      }

      
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: fullName,
          correo: email,
          contraseña: password,
          rol: "alumno"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error en el registro")
        setIsLoading(false)
        return
      }

      
      router.push("/")
    } catch (err) {
      console.error(err)
      setError("Error en el registro. Intenta de nuevo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-full">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Crear Cuenta</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">Únete a nuestro sistema de predicción</p>
        </div>

        <Card className="bg-white dark:bg-slate-800 shadow-2xl border-0">
          <div className="p-8">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nombre Completo</label>
                <Input
                  type="text"
                  placeholder="Juan Pérez García"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email Institucional</label>
                <Input
                  type="email"
                  placeholder="tu.email@universidad.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Confirmar Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registrando...
                  </div>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400">O</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>

            <p className="text-center text-sm text-slate-600 dark:text-slate-300">
              ¿Ya tienes cuenta?{" "}
              <a href="/" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Sistema desarrollado para la predicción de deserción académica en estudiantes de Ingeniería
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            © 2025 Universidad. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
