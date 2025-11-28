"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, BarChart3, Sun, Moon } from "lucide-react"
import UsersSection from "@/components/dashboard/users-section"
import StudentsSection from "@/components/dashboard/students-section"
import ReportsSection from "@/components/dashboard/reports-section"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("students")
  const [darkMode, setDarkMode] = useState(false)

  // Aplicar la clase dark al body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Botón para cambiar modo claro/oscuro */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-end">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-2 px-3 py-1 border rounded-md hover:bg-muted hover:text-foreground transition"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {darkMode ? "Modo Claro" : "Modo Oscuro"}
        </button>
      </div>

      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de estudiantes y predicción de deserción académica
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-fit grid-cols-3">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Alumnos</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reportes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <StudentsSection />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersSection />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
