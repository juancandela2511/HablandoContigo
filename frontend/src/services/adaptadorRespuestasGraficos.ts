/**
 * ============================================================================
 * ADAPTADOR DE RESPUESTAS A GRÁFICOS (adaptadorRespuestasGraficos.ts)
 * ============================================================================
 * Función pura encargada de transformar las respuestas en bruto de una encuesta
 * a datos estructurados para renderizar en gráficos de Barras o Pastel.
 * - Para preguntas con opciones cerradas: utiliza el color configurado en cada
 *   opción o la progresión de menor puntaje en ROJO (#ef4444) hasta mayor puntaje
 *   en VERDE (#10b981).
 * - Para preguntas de respuesta abierta (texto): agrupa dinámicamente las
 *   respuestas creando los puntos correspondientes (ej. Sistemas, Software,
 *   Data, Abogado, o temas abiertos).
 */

import { resolverColorExactoOpcion, type PreguntaEncuesta } from '@/ia'
import {
  clasificarRespuestaAbiertaParaGrafico,
  obtenerMetadatosCategoriaEstudio
} from '@/componentes/Dashboard/Estudios/clasificadorEstudiosIA'

export interface SegmentoGrafico {
  etiqueta: string
  valor: number
  porcentaje: number
  color: string
}

export interface ResultadoAdaptacionGrafico {
  totalMuestras: number
  segmentos: SegmentoGrafico[]
}

const PALETA_COLORES_ABIERTAS = [
  '#0ea5e9', // Sky
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316'  // Orange
]

/**
 * Transforma un conjunto de respuestas anónimas para una pregunta dada
 * en una estructura lista para graficar (frecuencias, porcentajes y colores).
 */
export function adaptarRespuestasAGrafico(
  idPregunta: string,
  textoPregunta: string,
  respuestas: any[],
  preguntasDisponibles: PreguntaEncuesta[] = []
): ResultadoAdaptacionGrafico {
  // 1. Encontrar la pregunta en la plantilla si está disponible
  const pregunta = preguntasDisponibles.find(p => 
    p.id === idPregunta || 
    (p.texto && textoPregunta && p.texto.trim().toLowerCase() === textoPregunta.trim().toLowerCase())
  )

  const esPreguntaAbierta =
    !pregunta ||
    pregunta.tipo === 'texto' ||
    !pregunta.opciones ||
    pregunta.opciones.length === 0

  // 2. Extraer respuestas relevantes (tanto texto como valor numérico y comentario)
  interface RespuestaExtraida {
    texto: string
    valor?: number
    comentario?: string
  }
  const respuestasExtraidas: RespuestaExtraida[] = []

  respuestas.forEach(r => {
    if (r.respuestas && Array.isArray(r.respuestas)) {
      const match = r.respuestas.find((item: any) => 
        item.idPregunta === idPregunta ||
        (item.textoPregunta && textoPregunta && item.textoPregunta.trim().toLowerCase() === textoPregunta.trim().toLowerCase())
      )
      if (match) {
        const rawResp = match.respuesta
        let txt = ''
        let valNum = typeof match.valor === 'number' && !isNaN(match.valor) ? match.valor : undefined
        if (typeof rawResp === 'object' && rawResp !== null) {
          txt = String(rawResp.texto || rawResp.label || '').trim()
          if (valNum === undefined && typeof rawResp.valor === 'number') valNum = rawResp.valor
        } else if (rawResp !== undefined && rawResp !== null) {
          txt = String(rawResp).trim()
        }
        const com = match.comentario ? String(match.comentario).trim() : ''
        if (!txt && com) txt = com
        if (txt || valNum !== undefined) {
          respuestasExtraidas.push({ texto: txt, valor: valNum, comentario: com })
        }
      }
    } else if (r[idPregunta] !== undefined && r[idPregunta] !== null && r[idPregunta] !== '') {
      const v = r[idPregunta]
      respuestasExtraidas.push({
        texto: String(v).trim(),
        valor: typeof v === 'number' ? v : undefined
      })
    }
  })

  // 3. Si es una pregunta CERRADA con opciones configuradas:
  // Ordenar de menor a mayor puntaje y aplicar progresión de color Rojo -> Verde (o color configurado)
  if (!esPreguntaAbierta && pregunta && pregunta.opciones && pregunta.opciones.length > 0) {
    const opcionesOrdenadas = [...pregunta.opciones].sort((a, b) => {
      const vA = typeof a.valor === 'number' ? a.valor : 0
      const vB = typeof b.valor === 'number' ? b.valor : 0
      return vA - vB
    })

    const conteosPorIndice: number[] = new Array(opcionesOrdenadas.length).fill(0)

    respuestasExtraidas.forEach(resp => {
      const respNorm = resp.texto.toLowerCase().trim()
      const comNorm = (resp.comentario || '').toLowerCase().trim()
      const combinadoNorm = `${respNorm} ${comNorm}`.trim()
      let idxAsignado = -1

      // Regla especial para Pregunta 1 de Antigüedad (meses exactos o tramos)
      if (idPregunta === 'b1-p1-antiguedad' || textoPregunta.toLowerCase().includes('laborando') || textoPregunta.toLowerCase().includes('antigüedad')) {
        const matchAnos = combinadoNorm.match(/(\d+)\s*a[ñn]o/i)
        const matchMeses = combinadoNorm.match(/(\d+)\s*mes/i)
        const anosNum = matchAnos && matchAnos[1] ? parseInt(matchAnos[1], 10) : 0
        const mesesNum = matchMeses && matchMeses[1] ? parseInt(matchMeses[1], 10) : 0
        const totalMeses = anosNum * 12 + mesesNum

        if (combinadoNorm.includes('más de 3') || combinadoNorm.includes('mas de 3') || combinadoNorm.includes('más de tres') || combinadoNorm.includes('mas de tres') || totalMeses > 36) {
          idxAsignado = opcionesOrdenadas.findIndex(o => o.texto.toLowerCase().includes('más de 3') || o.texto.toLowerCase().includes('mas de 3') || o.valor === 4)
          if (idxAsignado === -1) idxAsignado = opcionesOrdenadas.length - 1
        } else if (combinadoNorm.includes('menos de 6') || (totalMeses > 0 && totalMeses < 6)) {
          idxAsignado = opcionesOrdenadas.findIndex(o => o.texto.toLowerCase().includes('menos de 6') || o.valor === 1)
          if (idxAsignado === -1) idxAsignado = 0
        } else if (combinadoNorm.includes('6 meses') || (totalMeses >= 6 && totalMeses < 12)) {
          idxAsignado = opcionesOrdenadas.findIndex(o => o.texto.toLowerCase().includes('6 meses') || o.valor === 2)
        } else if (combinadoNorm.includes('1 a 3') || (totalMeses >= 12 && totalMeses <= 36)) {
          idxAsignado = opcionesOrdenadas.findIndex(o => o.texto.toLowerCase().includes('1 a 3') || o.valor === 3)
        }
      }

      // 1) Coincidencia exacta por texto normalizado
      if (idxAsignado === -1 && respNorm) {
        idxAsignado = opcionesOrdenadas.findIndex(o => (o.texto || '').toLowerCase().trim() === respNorm)
      }

      // 2) Coincidencia por valor numérico de la respuesta === valor de la opción o texto numérico de la opción
      if (idxAsignado === -1 && resp.valor !== undefined) {
        idxAsignado = opcionesOrdenadas.findIndex(o => o.valor === resp.valor || (o.texto || '').trim() === String(resp.valor))
      }

      // 3) Coincidencia por número al inicio del texto (ej. "4 - Bien" -> coincide con opción "4" o valor 4)
      if (idxAsignado === -1 && respNorm) {
        const matchNumInicial = respNorm.match(/^(\d+)\b/)
        if (matchNumInicial && matchNumInicial[1]) {
          const numInicial = parseInt(matchNumInicial[1], 10)
          idxAsignado = opcionesOrdenadas.findIndex(o => {
            const oTxt = (o.texto || '').trim()
            return oTxt === String(numInicial) || oTxt.startsWith(`${numInicial} `) || oTxt.startsWith(`${numInicial}-`) || o.valor === numInicial
          })
        }
      }

      // 4) Coincidencia parcial por inclusión de texto
      if (idxAsignado === -1 && respNorm.length >= 2) {
        idxAsignado = opcionesOrdenadas.findIndex(o => {
          const oNorm = (o.texto || '').toLowerCase().trim()
          return oNorm.length >= 2 && (respNorm.includes(oNorm) || oNorm.includes(respNorm))
        })
      }

      // 5) Fallback proporcional por puntaje para que ninguna respuesta quede huérfana y los conteos siempre sumen totalMuestras
      if (idxAsignado === -1) {
        if (resp.valor !== undefined && opcionesOrdenadas.length > 0) {
          let mejorIdx = 0
          let menorDiff = Infinity
          opcionesOrdenadas.forEach((o, i) => {
            const vO = typeof o.valor === 'number' ? o.valor : (i + 1)
            const diff = Math.abs(vO - resp.valor!)
            if (diff < menorDiff) {
              menorDiff = diff
              mejorIdx = i
            }
          })
          idxAsignado = mejorIdx
        } else {
          idxAsignado = Math.floor((opcionesOrdenadas.length - 1) / 2)
        }
      }

      if (idxAsignado >= 0 && idxAsignado < conteosPorIndice.length) {
        conteosPorIndice[idxAsignado] = (conteosPorIndice[idxAsignado] || 0) + 1
      }
    })

    const total = conteosPorIndice.reduce((acc, c) => acc + c, 0)

    const segmentos: SegmentoGrafico[] = opcionesOrdenadas.map((opc, idx) => {
      const conteo = conteosPorIndice[idx] || 0
      const porcentaje = total > 0 ? Math.round((conteo / total) * 100) : 0
      const color = resolverColorExactoOpcion(opc, idx, opcionesOrdenadas.length)

      return {
        etiqueta: opc.texto || `Opción ${idx + 1}`,
        valor: conteo,
        porcentaje,
        color
      }
    })

    return { totalMuestras: total, segmentos }
  }

  // 4. Si es una pregunta ABIERTA (tipo === 'texto' o sin opciones):
  // Agrupar inteligentemente creando puntos dinámicos (ej. Sistemas, Software, Data, Abogado, etc.)
  const frecuenciasAgrupadas: Record<string, number> = {}
  let totalValidas = 0

  respuestasExtraidas.forEach(item => {
    const rawResp = item.texto || item.comentario || ''
    const puntoAgrupado = clasificarRespuestaAbiertaParaGrafico(
      pregunta?.texto || textoPregunta || '',
      rawResp
    )
    if (puntoAgrupado) {
      frecuenciasAgrupadas[puntoAgrupado] = (frecuenciasAgrupadas[puntoAgrupado] || 0) + 1
      totalValidas++
    }
  })

  if (totalValidas === 0) {
    return { totalMuestras: 0, segmentos: [] }
  }

  const segmentos: SegmentoGrafico[] = Object.entries(frecuenciasAgrupadas)
    .sort((a, b) => b[1] - a[1])
    .map(([etiqueta, valor], idx) => {
      const meta = obtenerMetadatosCategoriaEstudio(etiqueta, idx)
      return {
        etiqueta,
        valor,
        porcentaje: Math.round((valor / totalValidas) * 100),
        color: meta.color || PALETA_COLORES_ABIERTAS[idx % PALETA_COLORES_ABIERTAS.length] || '#0ea5e9'
      }
    })

  return { totalMuestras: totalValidas, segmentos }
}
