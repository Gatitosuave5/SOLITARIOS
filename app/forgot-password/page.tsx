"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  Mail,
} from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<
    "email" | "sent" | "verify" | "reset" | "success"
  >("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email) {
        setError("Por favor ingresa tu email");
        setIsLoading(false);
        return;
      }
      if (!email.includes("@")) {
        setError("Ingresa un email válido");
        setIsLoading(false);
        return;
      }

      // Llamada al backend para enviar código de recuperación
      const res = await fetch("http://localhost:3001/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar el código");

      setStep("sent");
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const proceedToVerify = () => {
    setStep("verify");
    setError("");
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!code) {
        setError("Por favor ingresa el código de verificación");
        setIsLoading(false);
        return;
      }

      // Llamada al backend para verificar código
      const res = await fetch("http://localhost:3001/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, codigo: code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Código inválido");

      setStep("reset");
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!newPassword || !confirmPassword) {
        setError("Por favor completa todos los campos");
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        setIsLoading(false);
        return;
      }

      // Llamada al backend para cambiar contraseña
      const res = await fetch("http://localhost:3001/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: email,
          codigo: code,
          contraseña: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al cambiar la contraseña");

      setStep("success");
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === "email") {
      router.push("/");
    } else if (step === "sent") {
      setStep("email");
      setEmail("");
      setError("");
    } else if (step === "verify") {
      setStep("sent");
      setCode("");
      setError("");
    } else if (step === "reset") {
      setStep("verify");
      setError("");
    }
  };

  return (
    <div className="dark">
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {step === "email" &&
              "Ingresa tu email para recibir un código de recuperación"}
            {step === "sent" && "Código enviado"}
            {step === "verify" && "Ingresa el código que recibiste en tu email"}
            {step === "reset" && "Crea una nueva contraseña"}
            {step === "success" && "Tu contraseña ha sido actualizada"}
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 shadow-2xl border-0">
          <div className="p-8">
            {step === "success" ? (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    ¡Éxito!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300">
                    Tu contraseña ha sido actualizada exitosamente
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/")}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200"
                >
                  Volver al Login
                </Button>
              </div>
            ) : step === "sent" ? (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Código Enviado
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-1">
                    Revisa tu bandeja de entrada
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Se ha enviado un código de verificación a:
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mt-2">
                    {email}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  onClick={proceedToVerify}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200"
                >
                  Ingresar Código
                </Button>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </button>
                </div>
              </div>
            ) : (
              <>
                <form
                  onSubmit={
                    step === "email"
                      ? handleEmailSubmit
                      : step === "verify"
                      ? handleCodeSubmit
                      : handleResetPassword
                  }
                  className="space-y-5"
                >
                  {step === "email" && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Email Institucional
                      </label>
                      <Input
                        type="email"
                        placeholder="tu.email@universidad.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {step === "verify" && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Código de Verificación
                      </label>
                      <Input
                        type="text"
                        placeholder="Ingresa el código de 6 dígitos"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-center tracking-widest"
                        disabled={isLoading}
                        maxLength={6}
                      />
                    </div>
                  )}

                  {step === "reset" && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                          Contraseña Nueva
                        </label>

                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="h-11 bg-slate-50 dark:bg-slate-700 
                     border-slate-200 dark:border-slate-600 
                     pr-12"
                            disabled={isLoading}
                          />

                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-300"
                          >
                            {showNewPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                          Repetir Contraseña Nueva
                        </label>

                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-11 bg-slate-50 dark:bg-slate-700 
                     border-slate-200 dark:border-slate-600 
                     pr-12"
                            disabled={isLoading}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-300"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
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
                        Procesando...
                      </div>
                    ) : step === "email" ? (
                      "Enviar Código"
                    ) : step === "verify" ? (
                      "Verificar Código"
                    ) : (
                      "Cambiar Contraseña"
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={goBack}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Sistema desarrollado para la predicción de deserción académica en
            estudiantes de Ingeniería
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            © 2025 Universidad. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
