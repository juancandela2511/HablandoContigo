/**
 * ============================================================================
 * CÁLCULO DE CLIMA LABORAL Y ENPS (calculadorClimaEnps.ts)
 * ============================================================================
 * Procesa las respuestas de colaboradores, pondera preguntas válidas y
 * calcula los índices netos de clima laboral y lealtad organizacional (eNPS).
 */

export interface ResultadoClimaEnps {
  puntajePromedio: number
  porcentajeClimaLaboral: number
  enps: {
    score: number
    promotores: number
    pasivos: number
    detractores: number
    clasificacion: string
  }
}

export function procesarClimaYEnps(registros: any[]): ResultadoClimaEnps {
  const total = registros.length
  if (total === 0) {
    return {
      puntajePromedio: 0,
      porcentajeClimaLaboral: 0,
      enps: { score: 0, promotores: 0, pasivos: 0, detractores: 0, clasificacion: 'Sin Respuestas' }
    }
  }

  let sumaPuntajeGeneral = 0

  registros.forEach(r => {
    const items = Array.isArray(r.respuestas)
      ? r.respuestas
      : (typeof r.respuestas === 'string' ? JSON.parse(r.respuestas || '[]') : [])

    if (items.length > 0) {
      let sumaNeta = 0
      let evaluadas = 0
      let buenas = 0

      items.forEach((item: any) => {
        const id = String(item.idPregunta || '').toLowerCase()
        const cat = String(item.categoria || '').toLowerCase()
        if (
          id.includes('tiempo-empresa') ||
          id.includes('antiguedad') ||
          id.includes('area-departamento') ||
          id.includes('b6-p33-estudia') ||
          id.includes('b6-p33b-que-estudia') ||
          cat.includes('datos de contexto')
        ) {
          return
        }

        const valor = Number(item.valor)
        if ((isNaN(valor) || valor <= 0) && !item.esAlerta) return

        evaluadas++
        let nivel = (valor === 5 && item.esAlerta)
          ? 1
          : (valor <= 5 ? Math.max(1, Math.min(5, Math.round(valor))) : (valor >= 90 ? 5 : valor >= 70 ? 4 : valor >= 50 ? 3 : valor >= 25 ? 2 : 1))

        if (item.esAlerta && nivel > 2) nivel = valor <= 15 ? 1 : 2

        if (item.esAlerta || nivel <= 2) {
          // Detectada alerta o calificación baja
        } else if (nivel >= 4) {
          buenas++
        }

        const puntosPregunta = item.esAlerta
          ? (item.severidadAlerta === 'Crítica' ? 1.0 : Math.min(nivel, 2.0))
          : nivel

        sumaNeta += puntosPregunta
      })

      let puntajeNeto = 0
      if (evaluadas > 0) {
        puntajeNeto = Number(Math.max(1, Math.min(5, sumaNeta / evaluadas)).toFixed(2))
      }

      r.puntajeGeneral = puntajeNeto
      sumaPuntajeGeneral += puntajeNeto
    } else {
      const rawP = Number(r.puntajeGeneral || 0)
      const pNorm = rawP <= 5 ? rawP : (rawP / 100) * 5
      r.puntajeGeneral = pNorm
      sumaPuntajeGeneral += pNorm
    }
  })

  const puntajePromedio = Number((sumaPuntajeGeneral / total).toFixed(2))
  const porcentajeClimaLaboral = Math.min(100, Math.max(0, Math.round((puntajePromedio / 5) * 100)))

  // Cálculo de eNPS
  let promotores = 0
  let pasivos = 0
  let detractores = 0

  registros.forEach(r => {
    const p = Number(r.puntajeGeneral || 0)
    if (p >= 4.4) promotores++
    else if (p >= 3.4) pasivos++
    else detractores++
  })

  const pctProm = (promotores / total) * 100
  const pctDet = (detractores / total) * 100
  const enpsScore = Math.round(pctProm - pctDet)
  const enpsClasificacion = enpsScore >= 50 ? 'Excelente' : enpsScore >= 10 ? 'Favorable' : enpsScore >= 0 ? 'Neutro' : 'Crítico'

  return {
    puntajePromedio,
    porcentajeClimaLaboral,
    enps: {
      score: enpsScore,
      promotores: Math.round(pctProm),
      pasivos: Math.round((pasivos / total) * 100),
      detractores: Math.round(pctDet),
      clasificacion: enpsClasificacion
    }
  }
}
