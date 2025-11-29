"use client"

import { useState } from "react"
import { Upload, File, AlertCircle, CheckCircle, Check } from "lucide-react"
import DatasetUpload from "@/components/dataset-upload"
import DatasetPreview from "@/components/dataset-preview"

export default function Home() {
  const [data, setData] = useState<any[] | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [pendingData, setPendingData] = useState<any[] | null>(null)
  const [pendingFileName, setPendingFileName] = useState<string>("")

  const handleFileUpload = (file: File) => {
    setIsLoading(true)
    setError("")

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim())

        const rows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim())
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })
          return row
        })

        setPendingData(rows)
        setPendingFileName(file.name)
        setShowConfirmation(true)
        setIsConfirmed(false)
        setIsLoading(false)
      } catch (err) {
        setError("Error al procesar el archivo. Por favor verifica que sea un CSV válido.")
        setIsLoading(false)
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmUpload = () => {
    if (pendingData) {
      setData(pendingData)
      setFileName(pendingFileName)
      setIsConfirmed(true)
      // Auto-hide confirmation after 2 seconds
      setTimeout(() => {
        setShowConfirmation(false)
      }, 2000)
    }
  }

  const handleCancelUpload = () => {
    setShowConfirmation(false)
    setIsConfirmed(false)
    setPendingData(null)
    setPendingFileName("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 mb-6">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sistema de Predicción de Deserción</h1>
          <p className="text-lg text-slate-600">Ingeniería - Machine Learning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8 sticky top-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Paso 1: Cargar Dataset</h2>

              <DatasetUpload onFileUpload={handleFileUpload} isLoading={isLoading} />

              {/* Status Messages */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {data && !error && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-700">
                    <p className="font-semibold">Dataset cargado exitosamente</p>
                    <p className="text-green-600">{data.length} registros encontrados</p>
                  </div>
                </div>
              )}

              {data && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700">
                    <File className="w-4 h-4" />
                    <span className="text-sm font-medium truncate">{fileName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {showConfirmation && pendingData && (
<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <AlertCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirmar Carga de Archivo</h3>
                      <div className="space-y-3 text-slate-600">
                        <p className="flex items-center gap-2">
                          <File className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{pendingFileName}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-sm">
                            Se encontraron <span className="font-bold text-blue-600">{pendingData.length}</span>{" "}
                            registros
                          </span>
                        </p>
                        {pendingData.length > 0 && (
                          <p className="flex items-center gap-2">
                            <span className="text-sm">
                              Con <span className="font-bold text-blue-600">{Object.keys(pendingData[0]).length}</span>{" "}
                              características
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    {isConfirmed && (
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-700">
                      ¿Deseas confirmar la carga de este dataset? Se procesarán todos los registros para el análisis.
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleCancelUpload}
                      disabled={isConfirmed}
                      className="px-6 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-900 font-medium rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmUpload}
                      disabled={isConfirmed}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isConfirmed ? (
                        <>
                          <Check className="w-4 h-4" />
                          Confirmado
                        </>
                      ) : (
                        "Confirmar Subida"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {data ? (
              <DatasetPreview data={data} />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-slate-400 mb-4">
                  <Upload className="w-16 h-16 mx-auto opacity-40" />
                </div>
                <p className="text-slate-600">Carga un archivo CSV para ver la vista previa del dataset</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Info */}
        {!data && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-2xl font-bold text-blue-600 mb-2">18</div>
              <p className="text-slate-700 font-semibold">Características</p>
              <p className="text-sm text-slate-600 mt-2">Promedio, créditos, asistencia, y más</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-2xl font-bold text-blue-600 mb-2">ML</div>
              <p className="text-slate-700 font-semibold">Predicción Avanzada</p>
              <p className="text-sm text-slate-600 mt-2">Modelos entrenados con datos reales</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-2xl font-bold text-blue-600 mb-2">📊</div>
              <p className="text-slate-700 font-semibold">Análisis Completo</p>
              <p className="text-sm text-slate-600 mt-2">Visualiza patrones y tendencias</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
