"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Plus, Trash2, AlertTriangle, Eye } from "lucide-react"
import { predictDesertionRisk } from "@/lib/prediction-model"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import StudentDetailModal from "@/components/dashboard/student-detail-modal"

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

export default function StudentsSection() {
  const [students, setStudents] = useState<Student[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    promedio: 0,
    creditosAprobados: 0,
    creditosReprobados: 0,
    cursosReprobados: 0,
    asistencia: 0,
    avanceAcademico: 0,
    cicloActual: 1,
    vecesRepitio: 0,
    nivelSocioeconomico: "medio",
    tipoColegio: "publico",
    trabaja: false,
    ingresosfamiliares: 0,
    edad: 0,
    genero: "masculino",
    viveConFamilia: true,
    horasEstudio: 0,
    faltasTotales: 0,
    tardanzas: 0,
  })

  const handleAddStudent = async () => {
    if (!formData.nombre || !formData.rut) {
      alert("Por favor completa nombre y RUT")
      return
    }

    setIsLoading(true)
    setLoadingProgress(0)

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 200)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    clearInterval(progressInterval)
    setLoadingProgress(100)

    const riesgo = predictDesertionRisk({
      promedio_ponderado: formData.promedio,
      creditos_aprobados: formData.creditosAprobados,
      creditos_reprobados: formData.creditosReprobados,
      cursos_reprobados: formData.cursosReprobados,
      asistencia: formData.asistencia,
      avance_academico: formData.avanceAcademico,
      ciclo_actual: formData.cicloActual,
      veces_repitio_curso: formData.vecesRepitio,
      nivel_socioeconomico:
        formData.nivelSocioeconomico === "bajo" ? 1 : formData.nivelSocioeconomico === "medio" ? 2 : 3,
      tipo_colegio: formData.tipoColegio === "publico" ? 1 : 2,
      trabaja_actualmente: formData.trabaja ? 1 : 0,
      ingresos_familiares: formData.ingresosfamiliares,
      edad: formData.edad,
      genero: formData.genero === "masculino" ? 1 : 0,
      vive_con_familia: formData.viveConFamilia ? 1 : 0,
      horas_estudio: formData.horasEstudio,
      faltas_totales: formData.faltasTotales,
      tardanzas: formData.tardanzas,
    })

    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      riesgoDesercion: riesgo,
    }

    setStudents([...students, newStudent])
    setIsLoading(false)
    setLoadingProgress(0)
    setFormData({
      nombre: "",
      rut: "",
      promedio: 0,
      creditosAprobados: 0,
      creditosReprobados: 0,
      cursosReprobados: 0,
      asistencia: 0,
      avanceAcademico: 0,
      cicloActual: 1,
      vecesRepitio: 0,
      nivelSocioeconomico: "medio",
      tipoColegio: "publico",
      trabaja: false,
      ingresosfamiliares: 0,
      edad: 0,
      genero: "masculino",
      viveConFamilia: true,
      horasEstudio: 0,
      faltasTotales: 0,
      tardanzas: 0,
    })
    setOpenDialog(false)
  }

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id))
  }

  const getRiskColor = (risk: number) => {
    if (risk > 0.7) return "text-white bg-red-600"
    if (risk > 0.4) return "text-white bg-orange-500"
    return "text-white bg-green-600"
  }

  const getRiskLabel = (risk: number) => {
    if (risk > 0.7) return "RIESGO ALTO"
    if (risk > 0.4) return "RIESGO MEDIO"
    return "RIESGO BAJO"
  }

  return (
    <div className="space-y-6">
      {/* Add Student Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestión de Alumnos</h2>
          <p className="text-sm text-muted-foreground">Total: {students.length} estudiantes registrados</p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar Alumno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Alumno</DialogTitle>
              <DialogDescription>Ingresa los datos del estudiante para calcular riesgo de deserción</DialogDescription>
            </DialogHeader>

            {isLoading && (
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Datos Personales */}
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-3 text-sm">Datos Personales</h3>
              </div>

              <div>
                <Label>Nombre Completo</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Juan Pérez"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>RUT</Label>
                <Input
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  placeholder="12.345.678-9"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Edad</Label>
                <Input
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: Number.parseInt(e.target.value) })}
                  placeholder="20"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Género</Label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  className="w-full h-10 px-3 border border-input bg-background rounded-md"
                  disabled={isLoading}
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>

              {/* Datos Académicos */}
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-3 text-sm mt-4">Datos Académicos</h3>
              </div>

              <div>
                <Label>Promedio Ponderado</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.promedio}
                  onChange={(e) => setFormData({ ...formData, promedio: Number.parseFloat(e.target.value) })}
                  placeholder="4.5"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Créditos Aprobados</Label>
                <Input
                  type="number"
                  value={formData.creditosAprobados}
                  onChange={(e) => setFormData({ ...formData, creditosAprobados: Number.parseInt(e.target.value) })}
                  placeholder="60"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Créditos Reprobados</Label>
                <Input
                  type="number"
                  value={formData.creditosReprobados}
                  onChange={(e) => setFormData({ ...formData, creditosReprobados: Number.parseInt(e.target.value) })}
                  placeholder="5"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Cursos Reprobados</Label>
                <Input
                  type="number"
                  value={formData.cursosReprobados}
                  onChange={(e) => setFormData({ ...formData, cursosReprobados: Number.parseInt(e.target.value) })}
                  placeholder="2"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Asistencia (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.asistencia}
                  onChange={(e) => setFormData({ ...formData, asistencia: Number.parseFloat(e.target.value) })}
                  placeholder="85.5"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Avance Académico (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.avanceAcademico}
                  onChange={(e) => setFormData({ ...formData, avanceAcademico: Number.parseFloat(e.target.value) })}
                  placeholder="75"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Ciclo Actual</Label>
                <Input
                  type="number"
                  value={formData.cicloActual}
                  onChange={(e) => setFormData({ ...formData, cicloActual: Number.parseInt(e.target.value) })}
                  placeholder="3"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Veces que Repitió Curso</Label>
                <Input
                  type="number"
                  value={formData.vecesRepitio}
                  onChange={(e) => setFormData({ ...formData, vecesRepitio: Number.parseInt(e.target.value) })}
                  placeholder="1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Horas de Estudio Semanal</Label>
                <Input
                  type="number"
                  value={formData.horasEstudio}
                  onChange={(e) => setFormData({ ...formData, horasEstudio: Number.parseInt(e.target.value) })}
                  placeholder="15"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Faltas Totales</Label>
                <Input
                  type="number"
                  value={formData.faltasTotales}
                  onChange={(e) => setFormData({ ...formData, faltasTotales: Number.parseInt(e.target.value) })}
                  placeholder="3"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Tardanzas</Label>
                <Input
                  type="number"
                  value={formData.tardanzas}
                  onChange={(e) => setFormData({ ...formData, tardanzas: Number.parseInt(e.target.value) })}
                  placeholder="5"
                  disabled={isLoading}
                />
              </div>

              {/* Datos Socioeconómicos */}
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-3 text-sm mt-4">Datos Socioeconómicos</h3>
              </div>

              <div>
                <Label>Nivel Socioeconómico</Label>
                <select
                  value={formData.nivelSocioeconomico}
                  onChange={(e) => setFormData({ ...formData, nivelSocioeconomico: e.target.value })}
                  className="w-full h-10 px-3 border border-input bg-background rounded-md"
                  disabled={isLoading}
                >
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>

              <div>
                <Label>Tipo de Colegio</Label>
                <select
                  value={formData.tipoColegio}
                  onChange={(e) => setFormData({ ...formData, tipoColegio: e.target.value })}
                  className="w-full h-10 px-3 border border-input bg-background rounded-md"
                  disabled={isLoading}
                >
                  <option value="publico">Público</option>
                  <option value="privado">Privado</option>
                </select>
              </div>

              <div>
                <Label>Ingresos Familiares ($)</Label>
                <Input
                  type="number"
                  value={formData.ingresosfamiliares}
                  onChange={(e) => setFormData({ ...formData, ingresosfamiliares: Number.parseInt(e.target.value) })}
                  placeholder="1500000"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.trabaja}
                  onChange={(e) => setFormData({ ...formData, trabaja: e.target.checked })}
                  id="trabaja"
                  disabled={isLoading}
                />
                <Label htmlFor="trabaja" className="cursor-pointer">
                  Trabaja actualmente
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.viveConFamilia}
                  onChange={(e) => setFormData({ ...formData, viveConFamilia: e.target.checked })}
                  id="viveConFamilia"
                  disabled={isLoading}
                />
                <Label htmlFor="viveConFamilia" className="cursor-pointer">
                  Vive con familia
                </Label>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleAddStudent} disabled={isLoading}>
                {isLoading ? "Procesando..." : "Agregar Alumno"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Students Table */}
      {students.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Promedio</TableHead>
                <TableHead>Ciclo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.nombre}</TableCell>
                  <TableCell>{student.rut}</TableCell>
                  <TableCell>{student.promedio.toFixed(2)}</TableCell>
                  <TableCell>{student.cicloActual}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(student.riesgoDesercion)}`}
                    >
                      {student.riesgoDesercion > 0.7 && <AlertTriangle className="w-4 h-4" />}
                      {getRiskLabel(student.riesgoDesercion)}
                    </div>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(student)
                        setShowDetailModal(true)
                      }}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Información
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No hay alumnos registrados. Agrega tu primer alumno para comenzar.</p>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedStudent(null)
          }}
        />
      )}
    </div>
  )
}
