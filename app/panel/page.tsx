'use client';

import * as tf from "@tensorflow/tfjs";
import { useState } from 'react';
import { Upload, File, AlertCircle, CheckCircle, Check, X, Search, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const REQUIRED_COLUMNS = [
  'promedio_ponderado',
  'creditos_aprobados',
  'creditos_reprobados',
  'cursos_reprobados',
  'asistencia',
  'avance_academico',
  'ciclo_actual',
  'veces_repitio_curso',
  'nivel_socioeconomico',
  'tipo_colegio',
  'trabaja_actualmente',
  'ingresos_familiares',
  'edad',
  'genero',
  'vive_con_familia',
  'horas_estudio',
  'faltas_totales',
  'tardanzas',
 
];

const FEATURE_COLUMNS = [
  "promedio_ponderado",
  "creditos_aprobados",
  "creditos_reprobados",
  "cursos_reprobados",
  "asistencia",
  "avance_academico",
  "ciclo_actual",
  "veces_repitio_curso",
  "trabaja_actualmente",
  "ingresos_familiares",
  "edad",
  "vive_con_familia",
  "horas_estudio",
  "faltas_totales",
  "tardanzas",
  "nivel_socioeconomico_Alto",
  "nivel_socioeconomico_Bajo",
  "nivel_socioeconomico_Medio",
  "tipo_colegio_Privado",
  "tipo_colegio_Publico",
  "genero_Femenino",
  "genero_Masculino"
];

let featureColumns = [];
let scaler = null;

async function loadArtifacts() {
  if (!featureColumns.length) {
    featureColumns = await (await fetch("/tfjs_model_graph/feature_columns.json")).json();
  }
  if (!scaler) {
    scaler = await (await fetch("/tfjs_model_graph/scaler.json")).json();
  }
}

function transformRowToTensor(row: any) {
  const values = FEATURE_COLUMNS.map((column) => {
    const v = row[column];

    // convert bools, strings, numbers
    if (v === "true" || v === "1") return 1;
    if (v === "false" || v === "0") return 0;

    return parseFloat(v) || 0;
  });

  return tf.tensor2d([values]);
}

function buildInputFromCSVRow(row) {
  const socio = String(row["nivel_socioeconomico"] ?? "").toLowerCase();
  const colegio = String(row["tipo_colegio"] ?? "").toLowerCase();
  const genero = String(row["genero"] ?? "").toLowerCase();

  const socioOneHot = [
    socio === "bajo" ? 1 : 0,
    socio === "medio" ? 1 : 0,
    socio === "alto" ? 1 : 0,
  ];

  const colegioOneHot = [
    colegio === "publico" ? 1 : 0,
    colegio === "privado" ? 1 : 0,
  ];

  const generoOneHot = [
    genero === "masculino" ? 1 : 0,
    genero === "femenino" ? 1 : 0,
  ];

  const ordered = featureColumns.map((col) => {
    if (col.startsWith("nivel_socioeconomico_")) {
      const value = col.split("_")[2];
      return socio === value ? 1 : 0;
    }
    if (col.startsWith("tipo_colegio_")) {
      const value = col.split("_")[2];
      return colegio === value ? 1 : 0;
    }
    if (col.startsWith("genero_")) {
      const value = col.split("_")[1];
      return genero === value ? 1 : 0;
    }

    return Number(row[col]) || 0;
  });

  return ordered;
}

async function predictStudent(row) {
  const model = await loadModel();
  await loadArtifacts();

  const raw = buildInputFromCSVRow(row);

  const scaled = raw.map((v, i) => (v - scaler.mean[i]) / scaler.scale[i]);

  const tensor = tf.tensor2d([scaled], [1, scaled.length]);

  const pred = model.predict(tensor);
  const prob = (await pred.data())[0];

  tensor.dispose();
  pred.dispose();

  return {
    prob,
    deserta: prob >= 0.5 ? 1 : 0,
  };
}

interface StudentData {
  [key: string]: string | number | boolean;
  promedio_ponderado?: number;
  deserta?: number;
  riesgo?: number;
  id?: number;
  nombre?: string;
}

let model: tf.GraphModel | null = null;

async function loadModel() {

  await loadArtifacts();
  if (!model) {
    model = await tf.loadGraphModel("/tfjs_model_graph/model.json");
    console.log("Modelo Graph cargado correctamente");
  }
  return model;
}

interface StudentWithRisk extends StudentData {
  riesgo: number;
  riskLevel: 'Riesgo Alto' | 'Riesgo Medio' | 'Riesgo Bajo';
  willDesert: boolean;
}

function App() {
  const [data, setData] = useState<StudentData[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [pendingData, setPendingData] = useState<StudentData[] | null>(null);
  const [pendingFileName, setPendingFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [studentsWithRisk, setStudentsWithRisk] = useState<StudentWithRisk[]>([]);
  const [showFullTable, setShowFullTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showChart, setShowChart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const itemsPerPage = 20;

  const validateColumns = (headers: string[]): { valid: boolean; missing: string[] } => {
    const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
    return { valid: missing.length === 0, missing };
  };

  const parseCSV = (text: string): StudentData[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    const headers = lines[0].split(',').map((h) => h.trim());

    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: StudentData = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return rows;
  };

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    setError('');
    setMissingColumns([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim());

        const validation = validateColumns(headers);

        if (!validation.valid) {
          setError('El archivo CSV no contiene todas las columnas requeridas.');
          setMissingColumns(validation.missing);
          setIsLoading(false);
          return;
        }

        const rows = parseCSV(text);

        if (rows.length === 0) {
          setError('El archivo CSV está vacío o no contiene datos válidos.');
          setIsLoading(false);
          return;
        }

        setPendingData(rows);
        setPendingFileName(file.name);
        setShowConfirmation(true);
        setIsConfirmed(false);
        setIsLoading(false);
      } catch (err) {
        setError('Error al procesar el archivo. Por favor verifica que sea un CSV válido.');
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'text/csv') {
      handleFileUpload(file);
    } else {
      setError('Por favor selecciona un archivo CSV válido.');
    }
  };

  const calculateRisk = (student: StudentData): StudentWithRisk => {
    const riesgo = Number(student.riesgo || 0);
 
    let riskLevel: 'Riesgo Alto' | 'Riesgo Medio' | 'Riesgo Bajo';
    if (riesgo >= 0.7) riskLevel = 'Riesgo Alto';
    else if (riesgo >= 0.4) riskLevel = 'Riesgo Medio';
    else riskLevel = 'Riesgo Bajo';
 
    return {
      ...student,
      riesgo,
      riskLevel,
      willDesert: riesgo >= 0.5,
    };
  };
  const handleConfirmUpload = () => {
    if (pendingData) {
      setIsProcessing(true);
      setIsConfirmed(true);
     
      setTimeout(() => {
       
        Promise.all(
          pendingData.map(async (student) => {
            const { prob, deserta } = await predictStudent(student);

            let riskLevel: any;
            if (prob >= 0.7) riskLevel = "Riesgo Alto";
            else if (prob >= 0.4) riskLevel = "Riesgo Medio";
            else riskLevel = "Riesgo Bajo";
           
            return {
              ...student,
              riesgo: prob,
              riskLevel,
              willDesert: deserta === 1,
            };
     
          })
        ).then((processed) => {
          setStudentsWithRisk(processed);
          setData(pendingData);
          setIsProcessing(false);
          setShowConfirmation(false);
        });

        setData(pendingData);
       
        setFileName(pendingFileName);
       
        setTimeout(() => {
          setIsProcessing(false);
          setShowConfirmation(false);
        }, 1000);
      }, 500);
    }
  };

  const handleCancelUpload = () => {
    setShowConfirmation(false);
    setIsConfirmed(false);
    setPendingData(null);
    setPendingFileName('');
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'Riesgo Alto':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Riesgo Medio':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Riesgo Bajo':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const stats = {
    total: studentsWithRisk.length,
    alto: studentsWithRisk.filter((s) => s.riskLevel === 'Riesgo Alto').length,
    medio: studentsWithRisk.filter((s) => s.riskLevel === 'Riesgo Medio').length,
    bajo: studentsWithRisk.filter((s) => s.riskLevel === 'Riesgo Bajo').length,
  };

  const chartData = [
    { name: 'Riesgo Alto', value: stats.alto, color: '#ef4444' },
    { name: 'Riesgo Medio', value: stats.medio, color: '#f97316' },
    { name: 'Riesgo Bajo', value: stats.bajo, color: '#22c55e' },
  ];

  const filteredStudents = studentsWithRisk.filter((student) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const id = String(student.id || '');
    const nombre = String(student.nombre || '');
   
    return (
      id.toLowerCase().includes(searchLower) ||
      nombre.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Sistema de Predicción de Deserción
          </h1>
          <p className="text-slate-600">Ingeniería - Machine Learning</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Paso 1: Cargar Dataset</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDragging ? 'text-blue-500' : 'text-slate-400'
                }`}
              />
              <p className="text-sm text-slate-600 mb-2">
                Arrastra y suelta tu archivo CSV aquí, o
              </p>
              <label htmlFor="file-upload">
                <Button type="button" disabled={isLoading} className="cursor-pointer">
                  {isLoading ? 'Cargando...' : 'Seleccionar archivo'}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">{error}</p>
                  {missingColumns.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm">Columnas faltantes:</p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {missingColumns.map((col) => (
                          <li key={col}>{col}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {data && !error && (
              <Alert className="mt-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="font-semibold text-green-700">Dataset cargado exitosamente</p>
                  <p className="text-green-600 text-sm">{data.length} registros encontrados</p>
                </AlertDescription>
              </Alert>
            )}

            {data && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 text-slate-700">
                  <File className="w-4 h-4" />
                  <span className="text-sm font-medium truncate">{fileName}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {showConfirmation && pendingData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Confirmar Carga de Archivo</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelUpload}
                  disabled={isConfirmed}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700">{pendingFileName}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Se encontraron {pendingData.length} registros
                    </span>
                  </div>
                  {pendingData.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Con {Object.keys(pendingData[0]).length} características
                      </span>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Procesando datos...</span>
                    </div>
                  )}
                  {isConfirmed && !isProcessing && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Confirmado</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-700">
                    ¿Deseas confirmar la carga de este dataset? Se procesarán todos los registros
                    para el análisis.
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelUpload}
                    disabled={isConfirmed || isProcessing}
                  >
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleConfirmUpload} disabled={isConfirmed || isProcessing}>
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : isConfirmed ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Confirmado
                      </>
                    ) : (
                      'Confirmar Subida'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {data && studentsWithRisk.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
                  <p className="text-sm text-slate-600">Total Estudiantes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-red-600 mb-1">{stats.alto}</div>
                  <p className="text-sm text-slate-600">Riesgo Alto</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{stats.medio}</div>
                  <p className="text-sm text-slate-600">Riesgo Medio</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats.bajo}</div>
                  <p className="text-sm text-slate-600">Riesgo Bajo</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Vista Previa - Primeros 10 Estudiantes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentsWithRisk.slice(0, 10).map((student, idx) => (
                    <Card key={idx} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {student.nombre || `Estudiante ${student.id || idx + 1}`}
                            </p>
                            <p className="text-sm text-slate-600">
                              Promedio: {typeof student.promedio_ponderado === 'number'
                                ? student.promedio_ponderado.toFixed(2)
                                : student.promedio_ponderado || 'N/A'}
                            </p>
                          </div>
                          <Badge className={getRiskBadgeColor(student.riskLevel)}>
                            {student.riskLevel}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Riesgo de Deserción:</span>
                            <span className="font-semibold text-slate-900">
                              {(student.riesgo * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Estado:</span>
                            <Badge className={student.willDesert ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}>
                              {student.willDesert ? 'DESERTA' : 'NO DESERTA'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 flex justify-center gap-4">
                  <Button type="button" onClick={() => setShowFullTable(!showFullTable)}>
                    {showFullTable ? 'Ocultar Tabla Completa' : 'Ver Más Detalles'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowChart(!showChart)}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {showChart ? 'Ocultar Gráfico' : 'Ver Gráfico'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showChart && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Distribución de Riesgo de Deserción</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">
                        Distribución por Categoría
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                      <PieChart width={350} height={250}>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            labelLine={false}
                            label={false}   // <- DESACTIVA LABELS QUE SE MONTAN
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>

                          <Tooltip />

                          <Legend 
                            layout="vertical" 
                            align="right" 
                            verticalAlign="middle"
                            formatter={(value, entry) => {
                              const percent = (
                                (entry.payload.value /
                                  chartData.reduce((sum, d) => sum + d.value, 0)) *
                                100
                              ).toFixed(0);

                              return `${value}: ${percent}%`;
                            }}
                          />
                        </PieChart>

                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">
                        Comparación de Categorías
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {showFullTable && (
              <Card>
                <CardHeader>
                  <CardTitle>Tabla Completa de Estudiantes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left p-3 text-sm font-semibold text-slate-700">ID</th>
                          <th className="text-left p-3 text-sm font-semibold text-slate-700">Nombre</th>
                          <th className="text-left p-3 text-sm font-semibold text-slate-700">Promedio</th>
                          <th className="text-left p-3 text-sm font-semibold text-slate-700">Riesgo %</th>
                          <th className="text-left p-3 text-sm font-semibold text-slate-700">Nivel</th>
                          <th className="text-left p-3 text-sm font-semibold text-slate-700">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudents.map((student, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-3 text-sm text-slate-700">{student.id || idx + 1}</td>
                            <td className="p-3 text-sm text-slate-900 font-medium">
                              {student.nombre || `Estudiante ${student.id || idx + 1}`}
                            </td>
                            <td className="p-3 text-sm text-slate-700">
                              {typeof student.promedio_ponderado === 'number'
                                ? student.promedio_ponderado.toFixed(2)
                                : student.promedio_ponderado || 'N/A'}
                            </td>
                            <td className="p-3 text-sm font-semibold text-slate-900">
                              {(student.riesgo * 100).toFixed(1)}%
                            </td>
                            <td className="p-3">
                              <Badge className={getRiskBadgeColor(student.riskLevel)}>
                                {student.riskLevel}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge
                                className={
                                  student.willDesert
                                    ? 'bg-red-600 text-white'
                                    : 'bg-green-600 text-white'
                                }
                              >
                                {student.willDesert ? 'DESERTA' : 'NO DESERTA'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                      <p className="text-sm text-slate-600">
                        Mostrando {currentPage * itemsPerPage + 1} -{' '}
                        {Math.min((currentPage + 1) * itemsPerPage, filteredStudents.length)} de{' '}
                        {filteredStudents.length}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="px-3 py-2 text-sm font-medium">
                          {currentPage + 1} / {totalPages}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                          disabled={currentPage === totalPages - 1}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!data && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <Upload className="w-16 h-16 mx-auto opacity-40" />
              </div>
              <p className="text-slate-600">
                Carga un archivo CSV para ver la vista previa del dataset
              </p>
            </CardContent>
          </Card>
        )}

        {!data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">19</div>
                <p className="text-sm text-slate-600">Características</p>
                <p className="text-xs text-slate-500 mt-1">
                  Promedio, créditos, asistencia, y más
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">ML</div>
                <p className="text-sm text-slate-600">Predicción Avanzada</p>
                <p className="text-xs text-slate-500 mt-1">Modelos entrenados con datos reales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">📊</div>
                <p className="text-sm text-slate-600">Análisis Completo</p>
                <p className="text-xs text-slate-500 mt-1">Visualiza patrones y tendencias</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 