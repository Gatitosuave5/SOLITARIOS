"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Upload, AlertCircle } from "lucide-react"

interface DatasetUploadProps {
  onFileUpload: (file: File) => void
  isLoading: boolean
}

export default function DatasetUpload({ onFileUpload, isLoading }: DatasetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        onFileUpload(file)
      } else {
        alert("Por favor carga un archivo CSV válido")
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0])
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept=".csv" onChange={handleChange} className="hidden" disabled={isLoading} />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="w-full mb-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Procesando...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Seleccionar archivo
          </>
        )}
      </button>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-slate-400"
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-slate-700 font-medium">Arrastra tu CSV aquí</p>
        <p className="text-sm text-slate-500 mt-1">o usa el botón superior</p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">Formato esperado: CSV con las 18 características del modelo de ML</p>
      </div>
    </div>
  )
}
