  "use client"

  import { useEffect, useState } from "react"
  import { Card } from "@/components/ui/card"
  import * as tf from "@tensorflow/tfjs"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
  import { AlertCircle, Plus, Trash2, AlertTriangle, Eye } from "lucide-react"
  import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import StudentDetailModal from "@/components/dashboard/student-detail-modal"

  // Variables globales para TF
  let model: tf.GraphModel | null = null
  let featureColumns: string[] = []
  let scaler: { mean: number[]; scale: number[] } | null = null

  interface Student {
    id: string
    nombre: string
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



  // Cargar el modelo y artifacts
  export async function loadModel() {
    if (!model) {
      model = await tf.loadGraphModel("/tfjs_model_graph/model.json")
    }

    if (!featureColumns.length) {
      const fcRes = await fetch("/tfjs_model_graph/feature_columns.json")
      featureColumns = await fcRes.json()
    }

    if (!scaler) {
      const scalerRes = await fetch("/tfjs_model_graph/scaler.json")
      scaler = await scalerRes.json()
    }
  }

  // Preprocesamiento
  function preprocessData(data: any) {
    if (!scaler) throw new Error("Scaler no cargado")

    const x: number[] = featureColumns.map((col) => {
      if (col.startsWith("nivel_socioeconomico_")) {
        return data.nivel_socioeconomico === col.split("_")[2].toLowerCase() ? 1 : 0
      }

      if (col.startsWith("tipo_colegio_")) {
        return data.tipo_colegio === col.split("_")[2].toLowerCase() ? 1 : 0
      }

      if (col.startsWith("genero_")) {
        return data.genero.toLowerCase() === col.split("_")[1].toLowerCase() ? 1 : 0
      }

      if (col === "trabaja_actualmente" || col === "vive_con_familia") {
        return data[col] ? 1 : 0
      }

      return Number(data[col] ?? 0)
    })

    const scaled = x.map((val, i) => (val - scaler!.mean[i]) / scaler!.scale[i])
    return tf.tensor2d([scaled])
  }

  // Predicción
  export async function predictDesertionRisk(data: any): Promise<number> {
    if (!model) await loadModel()
    const inputTensor = preprocessData(data)
    const prediction = model!.predict(inputTensor) as tf.Tensor
    const value = (await prediction.data())[0]
    inputTensor.dispose()
    prediction.dispose()
    return value // 0..1
  }

  async function deleteStudent(id: number) {
    const res = await fetch(`http://136.112.143.156:3001/api/estudiantes/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    return data;
  }

  export default function StudentsSection() {
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<Student[]>([])
    const [openDialog, setOpenDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    // 🔔 NUEVO: estados para alerta de riesgo alto
    const [alertStudent, setAlertStudent] = useState<Student | null>(null)
    const [showAlertModal, setShowAlertModal] = useState(false)

    const [formData, setFormData] = useState({
      nombre: "",
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

    const [tfModel, setTfModel] = useState<tf.GraphModel | null>(null)



    

    useEffect(() => {
      const load = async () => {
        try {
          const loaded = await tf.loadGraphModel("/tfjs_model_graph/model.json")
          setTfModel(loaded)
        } catch (err) {
          console.error("Error cargando el modelo:", err)
        }
      }
      load()
    }, [])

    useEffect(() => {
      const fetchStudents = async () => {
        const res = await fetch("http://136.112.143.156:3001/api/estudiantes")
        const data = await res.json()

        const mapped = await Promise.all(
          data.map(async (a: any) => ({
            id: a.id,
            nombre: a.nombre,
            promedio: parseFloat(a.promedio_ponderado) || 0,
            creditosAprobados: a.creditos_aprobados,
            creditosReprobados: a.creditos_reprobados,
            cursosReprobados: a.cursos_reprobados,
            asistencia: parseFloat(a.asistencia) || 0,
            avanceAcademico: parseFloat(a.avance_academico) || 0,
            cicloActual: a.ciclo_actual,
            vecesRepitio: a.veces_repitio_curso,
            nivelSocioeconomico: a.nivel_socioeconomico,
            tipoColegio: a.tipo_colegio,
            trabaja: a.trabaja_actualmente === 1,
            ingresosfamiliares: parseFloat(a.ingresos_familiares) || 0,
            edad: a.edad,
            genero: a.genero,
            viveConFamilia: a.vive_con_familia === 1,
            horasEstudio: a.horas_estudio,
            faltasTotales: a.faltas_totales,
            tardanzas: a.tardanzas,
            riesgoDesercion: await predictDesertionRisk({
              ...a,
              promedio_ponderado: parseFloat(a.promedio_ponderado),
              asistencia: parseFloat(a.asistencia),
              avance_academico: parseFloat(a.avance_academico),
              ingresos_familiares: parseFloat(a.ingresos_familiares),
            }),
          })),
        )

        setStudents(mapped)
      }

      fetchStudents()
    }, [])
    
    const filteredStudents = students.filter((s) =>
      s.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.id).includes(searchQuery)
    );

    const handleAddStudent = async () => {
      setIsLoading(true)
      setLoadingProgress(0)

      try {
        const riesgo = await predictDesertionRisk({
          promedio_ponderado: formData.promedio,
          creditos_aprobados: formData.creditosAprobados,
          creditos_reprobados: formData.creditosReprobados,
          cursos_reprobados: formData.cursosReprobados,
          asistencia: formData.asistencia,
          avance_academico: formData.avanceAcademico,
          ciclo_actual: formData.cicloActual,
          veces_repitio_curso: formData.vecesRepitio,
          nivel_socioeconomico: formData.nivelSocioeconomico,
          tipo_colegio: formData.tipoColegio,
          trabaja_actualmente: formData.trabaja,
          ingresos_familiares: formData.ingresosfamiliares,
          edad: formData.edad,
          genero: formData.genero,
          vive_con_familia: formData.viveConFamilia,
          horas_estudio: formData.horasEstudio,
          faltas_totales: formData.faltasTotales,
          tardanzas: formData.tardanzas,
        })

        const riesgoPercent = (riesgo * 100).toFixed(0)
        alert(`Predicción de deserción: ${riesgoPercent}%`)

        

        const response = await fetch("http://136.112.143.156:3001/api/estudiantes", {
          
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: formData.nombre,
            codigo: "A001",
            promedio_ponderado: formData.promedio,
            creditos_aprobados: formData.creditosAprobados,
            creditos_reprobados: formData.creditosReprobados,
            cursos_reprobados: formData.cursosReprobados,
            asistencia: formData.asistencia,
            avance_academico: formData.avanceAcademico,
            ciclo_actual: formData.cicloActual,
            veces_repitio_curso: formData.vecesRepitio,
            nivel_socioeconomico: formData.nivelSocioeconomico,
            tipo_colegio: formData.tipoColegio,
            trabaja_actualmente: formData.trabaja ? 1 : 0,
            ingresos_familiares: formData.ingresosfamiliares,
            edad: formData.edad,
            genero: formData.genero,
            vive_con_familia: formData.viveConFamilia ? 1 : 0,
            horas_estudio: formData.horasEstudio,
            faltas_totales: formData.faltasTotales,
            tardanzas: formData.tardanzas,
            deserta: riesgo > 0.5 ? 1 : 0,
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error("No se pudo crear el estudiante")

          setStudents((prev) => [
            ...prev,
            {
              ...formData,
              id: data.id,                // <--- USAMOS EL ID REAL DE LA BD
              riesgoDesercion: riesgo,
            },
          ])

        
        setOpenDialog(false)
      } catch (error) {
        console.error(error)
        alert("Error al agregar alumno")
      }

      setIsLoading(false)
    }

    const handleDeleteStudent = async (id: number) => {
      const confirmDelete = confirm("¿Seguro que deseas eliminar este estudiante?");
      if (!confirmDelete) return;
    
      try {
        const res = await fetch(`http://136.112.143.156:3001/api/estudiantes/${id}`, {
          method: "DELETE",
        });
    
        const data = await res.json();
    
        if (res.ok) {
          alert("Estudiante eliminado correctamente");
    
          setStudents((prev) => prev.filter((s) => Number(s.id) !== id));
        } else {
          alert(data.error || "Error al eliminar estudiante");
        }
      } catch (error) {
        console.error(error);
        alert("Error en el servidor");
      }
    };
    
    

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

    // Modal de carga
    const LoadingModal = () => (
      <Dialog open={isLoading}>
        <DialogContent className="flex flex-col items-center gap-4 py-10 max-w-xs text-center">
    
          <VisuallyHidden>
            <DialogTitle>Cargando</DialogTitle>
          </VisuallyHidden>
    
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          <h2 className="text-lg font-semibold">Procesando...</h2>
          <p className="text-sm text-muted-foreground">Calculando riesgo y guardando al alumno</p>
        </DialogContent>
      </Dialog>
    )

    // 🔔 Modal de alerta de riesgo alto
    const AlertRiskModal = () => (
      <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-red-600">⚠️ Alerta de Riesgo Alto</DialogTitle>
            <DialogDescription>
              El estudiante <strong>{alertStudent?.nombre}</strong> tiene un riesgo de deserción mayor al 70%.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-muted-foreground mb-4">
            Se recomienda contactar al estudiante y tomar acciones preventivas (tutorías, apoyo psicológico,
            acompañamiento académico, etc.).
          </p>

          <Button onClick={() => setShowAlertModal(false)} className="bg-red-600 hover:bg-red-700 text-white w-full">
            Cerrar alerta
          </Button>
        </DialogContent>
      </Dialog>
    )

    return (
      <div className="space-y-6">
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
                  <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
                </div>
              )}

              {/* FORMULARIO */}
              {/* ... todo tu formulario tal como ya lo tenías ... */}
              {/* (lo mantengo igual, ya está funcionando) */}

              {/* 👇 aquí sigue exactamente tu formulario, sin cambios */}
              {/* --- INICIO FORM (no lo tocamos) --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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
              {/* --- FIN FORM --- */}
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex justify-end mb-3">
    <Input
      placeholder="Buscar por nombre o ID..."
      className="w-72"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

        {/* TABLA DE ESTUDIANTES */}
        {students.length > 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Promedio</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-64" />
                </TableRow>
              </TableHeader>

              <TableBody>
              {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.nombre || `Alumno ${student.id}`}</TableCell>
                    <TableCell>{Number(student.promedio).toFixed(2)}</TableCell>
                    <TableCell>{student.cicloActual}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(
                          student.riesgoDesercion,
                        )}`}
                      >
                        {student.riesgoDesercion > 0.7 && <AlertTriangle className="w-4 h-4" />}
                        {getRiskLabel(student.riesgoDesercion)}
                      </div>
                    </TableCell>

                    {/* ACCIONES */}
                    <TableCell className="flex gap-2">
                      {/* 🔔 Botón de alerta solo si riesgo > 0.7 */}
                      {student.riesgoDesercion > 0.7 && (
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => {
                            setAlertStudent(student)
                            setShowAlertModal(true)
                          }}
                        >
                          ⚠ Generar alerta
                        </Button>
                      )}

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
            <p className="text-muted-foreground">
              No hay alumnos registrados. Agrega tu primer alumno para comenzar.
            </p>
          </Card>
        )}

        {selectedStudent && (
          <StudentDetailModal
            student={selectedStudent}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedStudent(null)
            }}
            model={tfModel}
          />
        )}

        <LoadingModal />
        <AlertRiskModal />
      </div>
    )
  }
