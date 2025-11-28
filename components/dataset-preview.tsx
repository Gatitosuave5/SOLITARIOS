"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface DatasetPreviewProps {
  data: any[]
}

export default function DatasetPreview({ data }: DatasetPreviewProps) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 5
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const currentData = data.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

  if (!data || data.length === 0) {
    return null
  }

  const columns = Object.keys(data[0] || {})

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <p className="text-sm text-slate-600">Total de registros</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{columns.length}</div>
          <p className="text-sm text-slate-600">Características</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-left font-semibold text-white whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, idx) => (
                <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {String(row[col]).substring(0, 20)}
                      {String(row[col]).length > 20 ? "..." : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50 px-4 py-4 flex items-center justify-between border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Mostrando {page * itemsPerPage + 1} - {Math.min((page + 1) * itemsPerPage, data.length)} de {data.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-sm font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="p-2 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Columns Info */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          Características detectadas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {columns.map((col) => (
            <span key={col} className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded">
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
