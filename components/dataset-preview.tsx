"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Eye, BarChart3, X } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"

interface DatasetPreviewProps {
  data: any[]
}

export default function DatasetPreview({ data }: DatasetPreviewProps) {
  const [page, setPage] = useState(0)
  const [showChart, setShowChart] = useState(false)
  const itemsPerPage = 5
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const currentData = data.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

  if (!data || data.length === 0) {
    return null
  }

  const columns = Object.keys(data[0] || {})

  const numericColumns = columns.filter((col) => {
    return data.some((row) => !isNaN(Number.parseFloat(row[col])))
  })

  const generateCharts = () => {
    const colors = ["#2563eb", "#dc2626", "#16a34a", "#ea580c", "#7c3aed", "#0891b2"]

    return (
      <div className="space-y-6">
        {/* Bar Chart - First 2 numeric columns */}
        {numericColumns.length >= 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Distribución de Datos - {numericColumns[0]} vs {numericColumns[1]}
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={columns[0]} angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={numericColumns[0]} fill={colors[0]} />
                  <Bar dataKey={numericColumns[1]} fill={colors[1]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Line Chart - Trend analysis */}
        {numericColumns.length >= 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Análisis de Tendencias - {numericColumns[0]}</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.slice(0, 30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={columns[0]} angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={numericColumns[0]} stroke={colors[0]} dot={false} />
                  {numericColumns[1] && (
                    <Line type="monotone" dataKey={numericColumns[1]} stroke={colors[1]} dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Pie Chart - Distribution */}
        {numericColumns.length >= 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribución de {numericColumns[0]}</h3>
            <div className="w-full h-80 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.slice(0, 10)}
                    dataKey={numericColumns[0]}
                    nameKey={columns[0]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data.slice(0, 10).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Scatter Plot - Correlation */}
        {numericColumns.length >= 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Correlación - {numericColumns[0]} vs {numericColumns[1]}
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey={numericColumns[0]} />
                  <YAxis type="number" dataKey={numericColumns[1]} />
                  <Tooltip />
                  <Scatter name="Datos" data={data.slice(0, 50)} fill={colors[0]} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Individual column analysis */}
        {numericColumns.map((col, idx) => (
          <div key={col} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Análisis de {col}</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Promedio</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(data.reduce((sum, row) => sum + (Number.parseFloat(row[col]) || 0), 0) / data.length).toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Máximo</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.max(...data.map((row) => Number.parseFloat(row[col]) || 0)).toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Mínimo</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.min(...data.map((row) => Number.parseFloat(row[col]) || 0)).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(0, 25)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={columns[0]} angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={col} fill={colors[idx % colors.length]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    )
  }

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

      {/* Charts View - Full height scrollable charts section */}
      {showChart ? (
        <div className="bg-slate-50 rounded-xl shadow-lg p-6 min-h-screen">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Análisis de Datos - {data.length} registros</h2>
            <button onClick={() => setShowChart(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>
          <div className="space-y-6">{generateCharts()}</div>
        </div>
      ) : (
        <>
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
                  Mostrando {page * itemsPerPage + 1} - {Math.min((page + 1) * itemsPerPage, data.length)} de{" "}
                  {data.length}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowChart(!showChart)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Ver Gráfico
                  </button>

                  {/* Pagination controls */}
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
        </>
      )}
    </div>
  )
}
