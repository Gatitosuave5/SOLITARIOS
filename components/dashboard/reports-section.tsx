"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

interface Student {
  id: string
  nombre: string
  rut: string
  promedio: number
  creditosAprobados: number
  creditosReprobados: number
  cursosReprobados: number
  asistencia: number
  avanceAcademico: number
  cicloActual: number
  vecesRepitio: number
  nivelSocioeconomico: string
  tipoColegio: string
  trabaja: boolean
  ingresosfamiliares: number
  edad: number
  genero: string
  viveConFamilia: boolean
  horasEstudio: number
  faltasTotales: number
  tardanzas: number
  riesgoDesercion: number
}

export default function ReportsSection() {
  const [students, setStudents] = useState<Student[]>([])
  const [highRiskCount, setHighRiskCount] = useState(0)
  const [lowRiskCount, setLowRiskCount] = useState(0)

  useEffect(() => {
    const high = students.filter((s) => s.riesgoDesercion > 0.7).length
    const low = students.filter((s) => s.riesgoDesercion <= 0.4).length
    setHighRiskCount(high)
    setLowRiskCount(low)
  }, [students])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Reportes y Análisis</h2>
        <p className="text-sm text-muted-foreground">Visualización de predicciones y estadísticas de riesgo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Alumnos</p>
              <p className="text-3xl font-bold mt-2">{students.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold">RIESGO ALTO</p>
              <p className="text-3xl font-bold mt-2 text-red-600">{highRiskCount}</p>
            </div>
            <div className="p-2 bg-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Riesgo Bajo</p>
              <p className="text-3xl font-bold mt-2 text-green-600">{lowRiskCount}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {highRiskCount > 0 && (
        <Card className="p-6 border-red-300 bg-gradient-to-r from-red-50 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-700">Estudiantes en RIESGO ALTO de Deserción</h3>
          </div>
          <div className="space-y-3">
            {students
              .filter((s) => s.riesgoDesercion > 0.7)
              .map((student) => (
                <div key={student.id} className="p-3 bg-white rounded border border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-red-700">{student.nombre}</p>
                      <p className="text-sm text-muted-foreground">RUT: {student.rut}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{(student.riesgoDesercion * 100).toFixed(1)}%</p>
                      <p className="text-xs text-red-600">Probabilidad de Deserción</p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-muted-foreground">Promedio</p>
                      <p className="font-semibold">{student.promedio.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-muted-foreground">Asistencia</p>
                      <p className="font-semibold">{student.asistencia.toFixed(1)}%</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-muted-foreground">Ciclo</p>
                      <p className="font-semibold">{student.cicloActual}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Información del Modelo</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Modelo: Red Neuronal Profunda (TensorFlow)</p>
          <p>Capas: 3 capas ocultas (32, 16, 8 neuronas)</p>
          <p>Variables de entrada: 18 características académicas y socioeconómicas</p>
          <p>Precisión esperada: Variable según el conjunto de datos de entrenamiento</p>
        </div>
      </Card>
    </div>
  )
}
