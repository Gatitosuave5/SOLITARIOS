// Simulación del modelo de predicción basado en TensorFlow
// En producción, esto debería conectar con TensorFlow.js o un API backend

export interface StudentData {
  promedio_ponderado: number
  creditos_aprobados: number
  creditos_reprobados: number
  cursos_reprobados: number
  asistencia: number
  avance_academico: number
  ciclo_actual: number
  veces_repitio_curso: number
  nivel_socioeconomico: number
  tipo_colegio: number
  trabaja_actualmente: number
  ingresos_familiares: number
  edad: number
  genero: number
  vive_con_familia: number
  horas_estudio: number
  faltas_totales: number
  tardanzas: number
}

export function predictDesertionRisk(data: StudentData): number {
  // Normalización simple de variables
  const normalized = {
    promedio: Math.max(0, Math.min(1, (data.promedio_ponderado || 3) / 7)),
    creditosAprobados: Math.max(0, Math.min(1, (data.creditos_aprobados || 0) / 150)),
    creditosReprobados: Math.max(0, Math.min(1, (data.creditos_reprobados || 0) / 50)),
    cursosReprobados: Math.max(0, Math.min(1, (data.cursos_reprobados || 0) / 10)),
    asistencia: Math.max(0, Math.min(1, (data.asistencia || 80) / 100)),
    avanceAcademico: Math.max(0, Math.min(1, (data.avance_academico || 50) / 100)),
    cicloActual: Math.max(0, Math.min(1, (data.ciclo_actual || 1) / 10)),
    vecesRepitio: Math.max(0, Math.min(1, (data.veces_repitio_curso || 0) / 5)),
    nivelSocioeconomico: data.nivel_socioeconomico / 3, // 1,2,3 -> 0.33, 0.66, 1.0
    tipoColegio: data.tipo_colegio / 2, // 1,2 -> 0.5, 1.0
    trabaja: data.trabaja_actualmente, // 0 o 1
    ingresos: Math.max(0, Math.min(1, (data.ingresos_familiares || 1000000) / 5000000)),
    edad: Math.max(0, Math.min(1, (data.edad || 20) / 50)),
    genero: data.genero, // 0 o 1
    viveConFamilia: data.vive_con_familia, // 0 o 1
    horasEstudio: Math.max(0, Math.min(1, (data.horas_estudio || 10) / 40)),
    faltasTotales: Math.max(0, Math.min(1, (data.faltas_totales || 0) / 20)),
    tardanzas: Math.max(0, Math.min(1, (data.tardanzas || 0) / 30)),
  }

  // Pesos del modelo (basados en importancia de variables)
  const weights = {
    promedio: 0.25,
    creditosAprobados: 0.15,
    creditosReprobados: 0.12,
    cursosReprobados: 0.12,
    asistencia: 0.1,
    avanceAcademico: 0.08,
    cicloActual: 0.02,
    vecesRepitio: 0.08,
    nivelSocioeconomico: 0.02,
    tipoColegio: 0.01,
    trabaja: 0.03,
    ingresos: 0.01,
    edad: 0.02,
    genero: 0.01,
    viveConFamilia: 0.01,
    horasEstudio: 0.08,
    faltasTotales: 0.05,
    tardanzas: 0.05,
  }

  // Calcular riesgo como suma ponderada invertida (menos promedio = más riesgo)
  let riskScore = 0

  riskScore += (1 - normalized.promedio) * weights.promedio
  riskScore += (1 - normalized.creditosAprobados) * weights.creditosAprobados
  riskScore += normalized.creditosReprobados * weights.creditosReprobados
  riskScore += normalized.cursosReprobados * weights.cursosReprobados
  riskScore += (1 - normalized.asistencia) * weights.asistencia
  riskScore += (1 - normalized.avanceAcademico) * weights.avanceAcademico
  riskScore += normalized.vecesRepitio * weights.vecesRepitio
  riskScore += (1 - normalized.horasEstudio) * weights.horasEstudio
  riskScore += (1 - normalized.faltasTotales) * weights.faltasTotales
  riskScore += (1 - normalized.tardanzas) * weights.tardanzas

  // Normalizar a rango 0-1
  return Math.max(0, Math.min(1, riskScore))
}
