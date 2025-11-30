"use client"

import { useEffect, useState, useMemo } from "react"
import * as tf from "@tensorflow/tfjs"   // <-- Aquí
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface StudentDetailModalProps {
  student: any
  isOpen: boolean 
  onClose: () => void
  model: tf.GraphModel | null  // <-- recibe el modelo como prop
}

function preprocessStudent(student: any): number[] {
  return [
    student.promedio / 20,              // 1
    student.asistencia / 100,           // 2
    student.avanceAcademico / 100,      // 3
    student.horasEstudio / 30,          // 4
    student.edad / 100,                 // 5
    student.creditosAprobados / 200,    // 6
    student.creditosReprobados / 50,    // 7
    student.cursosReprobados / 10,      // 8
    student.vecesRepitio / 10,          // 9
    student.trabaja ? 1 : 0,            // 10
    student.viveConFamilia ? 1 : 0,     // 11
    student.cicloActual / 10,           // 12
    student.nivelSocioeconomico === "alto" ? 1 : student.nivelSocioeconomico === "medio" ? 0.5 : 0, // 13
    student.tipoColegio === "privado" ? 1 : 0, // 14
    student.ingresosfamiliares / 10000, // 15, normalizado según rango
    student.faltasTotales / 20,         // 16
    student.tardanzas / 20,             // 17
    student.genero === "masculino" ? 1 : 0, // 18
    student.nombre.length / 50,         // 19, solo como dummy feature si tu modelo lo espera
    student.apellido?.length / 50 || 0, // 20, si existe
    student.someFeature21 || 0,         // 21, placeholder si tu modelo requiere
    student.someFeature22 || 0          // 22, placeholder si tu modelo requiere
  ]
}


export default function StudentDetailModal({ student, isOpen, onClose, model }: StudentDetailModalProps) {
  
  const riesgo = student.riesgoDesercion ?? 0
  


  const handleVerify = () => {
    // Aquí no necesitamos setLocalStudent ni estados
    console.log("Mostrando información del alumno con riesgo:", student.riesgoDesercion)
  }
  

  // Prepare data for chart
  const chartData = [
    {
      name: "Promedio",
      value: Math.min((student.promedio / 20) * 100, 100),
      label: student.promedio.toFixed(2),
    },
    {
      name: "Asistencia",
      value: Math.min(student.asistencia, 100),
      label: `${student.asistencia.toFixed(1)}%`,
    },
    {
      name: "Avance",
      value: Math.min(student.avanceAcademico, 100),
      label: `${student.avanceAcademico.toFixed(1)}%`,
    },
    {
      name: "Horas Estudio",
      value: Math.min((student.horasEstudio / 30) * 100, 100),
      label: `${student.horasEstudio}h`,
    },
  ]
  

  const riskPercentage = riesgo * 100
  const isHighRisk = riesgo > 0.7
  const isMediumRisk = riesgo > 0.4

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Información del Estudiante</DialogTitle>

        
         
         
          <div className="space-y-6 py-4"> 
            {/* Risk Alert */}
            <Card
  className={`p-6 border-2 ${
    isHighRisk
      ? "bg-red-50 border-red-300"
      : isMediumRisk
        ? "bg-orange-50 border-orange-300"
        : "bg-green-50 border-green-300"
  }`}
>
  <div className="flex items-start gap-4">
    <div>
      {isHighRisk ? (
        <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
      ) : isMediumRisk ? (
        <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
      ) : (
        <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
      )}
    </div>
    <div className="flex-1">
      <h3
        className={`text-lg font-bold mb-2 ${
          isHighRisk ? "text-red-700" : isMediumRisk ? "text-orange-700" : "text-green-700"
        }`}
      >
        {isHighRisk ? "RIESGO ALTO" : isMediumRisk ? "RIESGO MEDIO" : "RIESGO BAJO"}
      </h3>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-4xl font-bold ${
            isHighRisk ? "text-red-600" : isMediumRisk ? "text-orange-600" : "text-green-600"
          }`}
        >
          {student.riesgoDesercion !== undefined
            ? (student.riesgoDesercion * 100).toFixed(1) + "%"
            : "--"}
        </span>
        <span className="text-sm text-muted-foreground">Probabilidad de Deserción</span>
      </div>
    </div>
  </div>
</Card>


            {/* Gráfico Section */}
            <div>
              <h3 className="font-semibold mb-4">Gráfico de Indicadores Académicos</h3>
              <Card className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Detailed Information */}
            <div>
              <h3 className="font-semibold mb-4">Información Detallada</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Academic Data */}
                <Card className="p-4">
                  <h4 className="font-semibold text-sm mb-3 text-blue-700">Datos Académicos</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promedio Ponderado:</span>
                      <span className="font-semibold">{student.promedio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Créditos Aprobados:</span>
                      <span className="font-semibold">{student.creditosAprobados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Créditos Reprobados:</span>
                      <span className="font-semibold">{student.creditosReprobados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cursos Reprobados:</span>
                      <span className="font-semibold">{student.cursosReprobados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asistencia:</span>
                      <span className="font-semibold">{student.asistencia.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avance Académico:</span>
                      <span className="font-semibold">{student.avanceAcademico.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horas de Estudio:</span>
                      <span className="font-semibold">{student.horasEstudio}h/semana</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Faltas Totales:</span>
                      <span className="font-semibold">{student.faltasTotales}</span>
                    </div>
                  </div>
                </Card>

                {/* Personal & Socioeconomic Data */}
                <Card className="p-4">
                  <h4 className="font-semibold text-sm mb-3 text-green-700">Información Personal</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Edad:</span>
                      <span className="font-semibold">{student.edad} años</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Género:</span>
                      <span className="font-semibold capitalize">{student.genero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ciclo Actual:</span>
                      <span className="font-semibold">Ciclo {student.cicloActual}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Veces Repitió Curso:</span>
                      <span className="font-semibold">{student.vecesRepitio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nivel Socioeconómico:</span>
                      <span className="font-semibold capitalize">{student.nivelSocioeconomico}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo de Colegio:</span>
                      <span className="font-semibold capitalize">{student.tipoColegio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trabaja:</span>
                      <span className="font-semibold">{student.trabaja ? "Sí" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vive con Familia:</span>
                      <span className="font-semibold">{student.viveConFamilia ? "Sí" : "No"}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Recommendations */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-sm mb-2 text-blue-700">Recomendaciones</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {isHighRisk && (
                  <>
                    <li>• Se recomienda contacto inmediato con el estudiante</li>
                    <li>• Derivar a servicios de tutoría académica</li>
                    <li>• Evaluar apoyo psicosocial</li>
                  </>
                )}
                {isMediumRisk && (
                  <>
                    <li>• Realizar seguimiento periódico</li>
                    <li>• Ofrecer programas de mentoría</li>
                  </>
                )}
                {!isHighRisk && !isMediumRisk && (
                  <>
                    <li>• Estudiante en buen desempeño</li>
                    <li>• Mantener seguimiento preventivo</li>
                  </>
                )}
              </ul>
            </Card>
          </div>
        )

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
