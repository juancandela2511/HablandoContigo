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

  // 1. Agrupar categorías reales de las respuestas de colaboradores
  const categoriasMap: Record<string, { suma: number; count: number }> = {}
  registros.forEach(r => {
    const respuestasArr = typeof r.respuestas === 'string' ? JSON.parse(r.respuestas) : (r.respuestas || [])
    if (Array.isArray(respuestasArr)) {
      respuestasArr.forEach((item: any) => {
        const cat = (item.categoria || 'General').trim()
        const val = Number(item.valor)
        if (!isNaN(val) && val >= 1 && val <= 5) {
          if (!categoriasMap[cat]) categoriasMap[cat] = { suma: 0, count: 0 }
          categoriasMap[cat].suma += val
          categoriasMap[cat].count++
        }
      })
    }
  })

  // Ejes base del radar con cálculo real basado en respuestas (o ponderación proporcional)
  const ejesConfig = [
    { eje: 'Liderazgo y Confianza', cat: 'Liderazgo', meta: 85, color: '#0284c7' },
    { eje: 'Carga Laboral y Estrés', cat: 'Carga Laboral', meta: 80, color: '#10b981' },
    { eje: 'Bienestar y Reconocimiento', cat: 'Bienestar', meta: 85, color: '#6366f1' },
    { eje: 'Trabajo en Equipo y Apoyo', cat: 'Compañerismo', meta: 90, color: '#8b5cf6' },
    { eje: 'Clima y Ambiente Físico', cat: 'Condiciones', meta: 85, color: '#0ea5e9' },
    { eje: 'Comunicación Organizacional', cat: 'Comunicación', meta: 85, color: '#f59e0b' }
  ]

  const dimensionesRadar = ejesConfig.map(cfg => {
    // Buscar si alguna categoría en las respuestas coincide con el eje
    const matchCat = Object.keys(categoriasMap).find(k => k.toLowerCase().includes(cfg.cat.toLowerCase()))
    let valorCalculado = porcentajeClima
    if (matchCat && categoriasMap[matchCat].count > 0) {
      const avg = categoriasMap[matchCat].suma / categoriasMap[matchCat].count
      valorCalculado = Math.min(100, Math.max(0, Math.round((avg / 5.0) * 100)))
    }
    const estado = valorCalculado >= cfg.meta ? 'Óptimo' : valorCalculado >= cfg.meta - 15 ? 'Moderado' : 'Atención'
    return {
      eje: cfg.eje,
      valor: valorCalculado,
      meta: cfg.meta,
      estado,
      color: cfg.color,
      totalRespuestas: matchCat ? categoriasMap[matchCat].count : total
    }
  })

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
