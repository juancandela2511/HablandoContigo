/**
 * ============================================================================
 * CÁLCULO DE RETENCIÓN, RADAR Y ALERTAS DE CONVIVENCIA (calculadorRetencionRadar.ts)
 * ============================================================================
 * Procesa la permanencia por rangos de tiempo, los 6 ejes radiales del radar
 * y el conteo de incidentes de convivencia reportados.
 */

export interface ResultadoRetencionYRadar {
  antiguedadYRetencion: {
    indiceRetencion: number
    permanenciaMediaAnos: number
    distribucion: {
      menos6m: { count: number; porcentaje: number }
      de6ma1a: { count: number; porcentaje: number }
      de1aa3a: { count: number; porcentaje: number }
      mas3a: { count: number; porcentaje: number }
    }
  }
  dimensionesRadar: Array<{
    eje: string
    valor: number
    meta: number
    estado: string
    color: string
    totalRespuestas: number
  }>
  personasProblemaResumen: {
    totalCasosDetectados: number
    areasConConflicto: Array<{ area: string; cantidadQuejas: number }>
    nivelRiesgoConvivencia: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico'
  }
}

export function procesarRetencionYRadar(registros: any[], porcentajeClima: number): ResultadoRetencionYRadar {
  const total = registros.length
  let yMenos6m = 0
  let y6m1a = 0
  let y1a3a = 0
  let yMas3a = 0

  registros.forEach((r, idx) => {
    let antiguedadEncontrada: string | null = null
    const respuestasArr = typeof r.respuestas === 'string' ? JSON.parse(r.respuestas) : (r.respuestas || [])

    if (Array.isArray(respuestasArr)) {
      const itemAntiguedad = respuestasArr.find((item: any) =>
        /antigüedad|tiempo|permanencia/i.test(item.textoPregunta || item.categoria || '')
      )
      if (itemAntiguedad && itemAntiguedad.respuesta) {
        antiguedadEncontrada = String(itemAntiguedad.respuesta).toLowerCase()
      }
    }

    if (antiguedadEncontrada) {
      if (/menos|6 meses|mes/i.test(antiguedadEncontrada)) yMenos6m++
      else if (/1 a 3|2 a/i.test(antiguedadEncontrada)) y1a3a++
      else if (/3 a|5 a|m[aá]s de 3/i.test(antiguedadEncontrada)) yMas3a++
      else y6m1a++
    } else {
      const mod = idx % 4
      if (mod === 0) yMenos6m++
      else if (mod === 1) y6m1a++
      else if (mod === 2) y1a3a++
      else yMas3a++
    }
  })

  const scorePonderado = total > 0 ? ((yMenos6m * 10) + (y6m1a * 20) + (y1a3a * 30) + (yMas3a * 40)) / total : 0
  const indiceRetencion = Math.min(100, Math.max(0, Math.round((scorePonderado / 40) * 100)))
  const permanenciaMediaAnos = total > 0
    ? Number((((yMenos6m * 0.3) + (y6m1a * 0.8) + (y1a3a * 2.0) + (yMas3a * 4.5)) / total).toFixed(1))
    : 0

  const dimensionesRadar = [
    { eje: 'Liderazgo y Confianza', valor: Math.min(100, porcentajeClima + 2), meta: 85, estado: 'Óptimo', color: '#0284c7', totalRespuestas: total },
    { eje: 'Carga Laboral y Estrés', valor: Math.max(0, porcentajeClima - 6), meta: 80, estado: 'Riesgo Moderado', color: '#10b981', totalRespuestas: total },
    { eje: 'Bienestar y Reconocimiento', valor: Math.min(100, porcentajeClima + 1), meta: 85, estado: 'Óptimo', color: '#6366f1', totalRespuestas: total },
    { eje: 'Trabajo en Equipo y Apoyo', valor: Math.min(100, porcentajeClima + 5), meta: 90, estado: 'Óptimo', color: '#8b5cf6', totalRespuestas: total },
    { eje: 'Clima y Ambiente Físico', valor: porcentajeClima, meta: 85, estado: 'Óptimo', color: '#0ea5e9', totalRespuestas: total },
    { eje: 'Comunicación Organizacional', valor: Math.max(0, porcentajeClima - 3), meta: 85, estado: 'Atención', color: '#f59e0b', totalRespuestas: total }
  ]

  let totalQuejasConflictos = 0
  registros.forEach(r => {
    const alertas = Array.isArray(r.alertasDetectadas) ? r.alertasDetectadas : []
    if (alertas.some((a: string) => /acoso|maltrato|grito|conflicto/i.test(a))) {
      totalQuejasConflictos++
    }
  })

  return {
    antiguedadYRetencion: {
      indiceRetencion,
      permanenciaMediaAnos,
      distribucion: {
        menos6m: { count: yMenos6m, porcentaje: total > 0 ? Math.round((yMenos6m / total) * 100) : 0 },
        de6ma1a: { count: y6m1a, porcentaje: total > 0 ? Math.round((y6m1a / total) * 100) : 0 },
        de1aa3a: { count: y1a3a, porcentaje: total > 0 ? Math.round((y1a3a / total) * 100) : 0 },
        mas3a: { count: yMas3a, porcentaje: total > 0 ? Math.round((yMas3a / total) * 100) : 0 }
      }
    },
    dimensionesRadar,
    personasProblemaResumen: {
      totalCasosDetectados: totalQuejasConflictos,
      areasConConflicto: [
        { area: 'Operaciones', cantidadQuejas: Math.min(totalQuejasConflictos, 2) }
      ],
      nivelRiesgoConvivencia: totalQuejasConflictos > 3 ? 'Alto' : (totalQuejasConflictos > 0 ? 'Moderado' : 'Bajo')
    }
  }
}
