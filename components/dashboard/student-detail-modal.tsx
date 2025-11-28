"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface StudentDetailModalProps {
  student: any
  isOpen: boolean
  onClose: () => void
}

export default function StudentDetailModal({ student, isOpen, onClose }: StudentDetailModalProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsVerifying(false)
    setShowResults(true)
  }

  // Prepare data for chart
  const chartData = [
    {
      name: "Promedio",
      value: Math.min(student.promedio * 20, 100),
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

  const riskPercentage = student.riesgoDesercion * 100
  const isHighRisk = student.riesgoDesercion > 0.7
  const isMediumRisk = student.riesgoDesercion > 0.4

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student.nombre}</DialogTitle>
          <DialogDescription>
            RUT: {student.rut} | Ciclo: {student.cicloActual}
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            {isVerifying && (
              <div className="w-full max-w-xs">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                  <div className="bg-blue-600 h-full w-1/3 animate-pulse"></div>
                </div>
                <p className="text-center text-sm text-muted-foreground">Verificando información del alumno...</p>
              </div>
            )}
            {!isVerifying && (
              <>
                <AlertCircle className="w-12 h-12 text-blue-600" />
                <p className="text-center text-muted-foreground">
                  Haz clic en el botón de abajo para verificar y analizar la información del alumno
                </p>
                <Button onClick={handleVerify} size="lg" className="gap-2">
                  Verificar
                </Button>
              </>
            )}
          </div>
        ) : (
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
                      {riskPercentage.toFixed(1)}%
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
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {showResults && (
            <Button onClick={() => setShowResults(false)} variant="outline">
              Nueva Verificación
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
