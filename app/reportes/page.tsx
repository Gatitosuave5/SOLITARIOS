"use client";

import { Card } from "@/components/ui/card";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Student {
  id: string;
  nombre: string;
  rut: string;
  promedio: number;
  creditosAprobados: number;
  creditosReprobados: number;
  cursosReprobados: number;
  asistencia: number;
  avanceAcademico: number;
  cicloActual: number;
  vecesRepitio: number;
  nivelSocioeconomico: string;
  tipoColegio: string;
  trabaja: boolean;
  ingresosfamiliares: number;
  edad: number;
  genero: string;
  viveConFamilia: boolean;
  horasEstudio: number;
  faltasTotales: number;
  tardanzas: number;
  riesgoDesercion: number;
}

export default function ReportsSection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [lowRiskCount, setLowRiskCount] = useState(0);

  const mockStudents: Student[] = [
    {
      id: "1",
      nombre: "Juan Pérez",
      rut: "12345678-9",
      promedio: 4.2,
      creditosAprobados: 50,
      creditosReprobados: 5,
      cursosReprobados: 1,
      asistencia: 85,
      avanceAcademico: 60,
      cicloActual: 3,
      vecesRepitio: 0,
      nivelSocioeconomico: "Medio",
      tipoColegio: "Público",
      trabaja: false,
      ingresosfamiliares: 50000,
      edad: 20,
      genero: "M",
      viveConFamilia: true,
      horasEstudio: 4,
      faltasTotales: 3,
      tardanzas: 2,
      riesgoDesercion: 0.25,
    },
    {
      id: "2",
      nombre: "María García",
      rut: "98765432-1",
      promedio: 3.1,
      creditosAprobados: 45,
      creditosReprobados: 15,
      cursosReprobados: 3,
      asistencia: 60,
      avanceAcademico: 45,
      cicloActual: 2,
      vecesRepitio: 1,
      nivelSocioeconomico: "Bajo",
      tipoColegio: "Público",
      trabaja: true,
      ingresosfamiliares: 30000,
      edad: 22,
      genero: "F",
      viveConFamilia: false,
      horasEstudio: 2,
      faltasTotales: 12,
      tardanzas: 8,
      riesgoDesercion: 0.78,
    },
    {
      id: "3",
      nombre: "Carlos López",
      rut: "55555555-5",
      promedio: 4.8,
      creditosAprobados: 60,
      creditosReprobados: 0,
      cursosReprobados: 0,
      asistencia: 98,
      avanceAcademico: 75,
      cicloActual: 4,
      vecesRepitio: 0,
      nivelSocioeconomico: "Alto",
      tipoColegio: "Privado",
      trabaja: false,
      ingresosfamiliares: 120000,
      edad: 19,
      genero: "M",
      viveConFamilia: true,
      horasEstudio: 6,
      faltasTotales: 0,
      tardanzas: 0,
      riesgoDesercion: 0.05,
    },
  ];

  useEffect(() => {
    setStudents(mockStudents);
    const high = mockStudents.filter((s) => s.riesgoDesercion > 0.7).length;
    const low = mockStudents.filter((s) => s.riesgoDesercion <= 0.4).length;
    setHighRiskCount(high);
    setLowRiskCount(low);
  }, []);

  const riskDistribution = [
    { name: "Bajo", value: lowRiskCount, fill: "#10b981" },
    {
      name: "Medio",
      value: students.filter(
        (s) => s.riesgoDesercion > 0.4 && s.riesgoDesercion <= 0.7
      ).length,
      fill: "#f59e0b",
    },
    { name: "Alto", value: highRiskCount, fill: "#ef4444" },
  ];

  const performanceData = students.map((s) => ({
    nombre: s.nombre.split(" ")[0],
    promedio: s.promedio,
    asistencia: s.asistencia / 20,
  }));

  const riskByCycle = [
    {
      ciclo: 1,
      riesgo:
        students
          .filter((s) => s.cicloActual === 1)
          .reduce((acc, s) => acc + s.riesgoDesercion, 0) /
        Math.max(1, students.filter((s) => s.cicloActual === 1).length),
    },
    {
      ciclo: 2,
      riesgo:
        students
          .filter((s) => s.cicloActual === 2)
          .reduce((acc, s) => acc + s.riesgoDesercion, 0) /
        Math.max(1, students.filter((s) => s.cicloActual === 2).length),
    },
    {
      ciclo: 3,
      riesgo:
        students
          .filter((s) => s.cicloActual === 3)
          .reduce((acc, s) => acc + s.riesgoDesercion, 0) /
        Math.max(1, students.filter((s) => s.cicloActual === 3).length),
    },
    {
      ciclo: 4,
      riesgo:
        students
          .filter((s) => s.cicloActual === 4)
          .reduce((acc, s) => acc + s.riesgoDesercion, 0) /
        Math.max(1, students.filter((s) => s.cicloActual === 4).length),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-black">
          Reportes y Análisis
        </h2>
        <p className="text-sm text-muted-foreground">
          Visualización de predicciones y estadísticas de riesgo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white text-black shadow-md rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Alumnos</p>{" "}
              {/* texto gris oscuro */}
              <p className="text-3xl font-bold mt-2 text-black">
                {students.length}
              </p>{" "}
              {/* texto negro */}
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
              <p className="text-3xl font-bold mt-2 text-red-600">
                {highRiskCount}
              </p>
            </div>
            <div className="p-2 bg-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white text-black shadow-md rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Riesgo Bajo</p>{" "}
              {/* texto gris oscuro */}
              <p className="text-3xl font-bold mt-2 text-green-600">
                {lowRiskCount}
              </p>{" "}
              {/* texto verde */}
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 flex flex-col bg-white text-black shadow-md rounded-lg">
          <h3 className="font-semibold mb-4 text-center">% de Deserción</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={75}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white text-black shadow-md rounded-lg">
            <h3 className="font-semibold mb-4">
              Ver Gráfico - Promedio vs Asistencia
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="promedio" fill="#3b82f6" name="Promedio" />
                <Bar
                  dataKey="asistencia"
                  fill="#10b981"
                  name="Asistencia (%/20)"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      <Card className="p-6 bg-white text-black">
        {" "}
        {/* Fondo blanco y texto negro */}
        <h3 className="font-semibold mb-4 text-black">
          Riesgo Promedio por Ciclo Académico
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={riskByCycle}
            margin={{ top: 10, right: 20, bottom: 40, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />{" "}
            {/* Líneas gris claro */}
            <XAxis
              dataKey="ciclo"
              label={{
                value: "Ciclo Académico",
                position: "insideBottom",
                fill: "#333", // Color gris oscuro para etiquetas
              }}
              stroke="#333" // Color del eje X
              tick={{ fill: "#333" }}
            />
            <YAxis
              label={{
                value: "Riesgo Promedio",
                angle: -90,
                position: "insideLeft",
                fill: "#333",
                style: { textAnchor: "middle" },
              }}
              stroke="#333" // Color del eje Y
              tick={{ fill: "#333" }}
            />
            <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="riesgo"
              stroke="#ef4444"
              strokeWidth={2}
              name="Riesgo de Deserción"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {highRiskCount > 0 && (
        <Card className="p-6 border-red-300 bg-gradient-to-r from-red-50 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-700">
              Estudiantes en RIESGO ALTO de Deserción
            </h3>
          </div>
          <div className="space-y-3">
            {students
              .filter((s) => s.riesgoDesercion > 0.7)
              .map((student) => (
                <div
                  key={student.id}
                  className="p-3 bg-white rounded border border-red-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-red-700">
                        {student.nombre}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        RUT: {student.rut}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {(student.riesgoDesercion * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-red-600">
                        Probabilidad de Deserción
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-muted-foreground">Promedio</p>
                      <p className="font-semibold">
                        {student.promedio.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-muted-foreground">Asistencia</p>
                      <p className="font-semibold">
                        {student.asistencia.toFixed(1)}%
                      </p>
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

      <Card className="p-6 bg-white text-black shadow-md rounded-lg">
        <h3 className="font-semibold mb-4">Información del Modelo</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Modelo: Red Neuronal Profunda (TensorFlow)</p>
          <p>Capas: 3 capas ocultas (32, 16, 8 neuronas)</p>
          <p>
            Variables de entrada: 18 características académicas y
            socioeconómicas
          </p>
          <p>
            Precisión esperada: Variable según el conjunto de datos de
            entrenamiento
          </p>
        </div>
      </Card>
    </div>
  );
}
