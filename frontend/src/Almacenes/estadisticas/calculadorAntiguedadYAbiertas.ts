/**
 * ============================================================================
 * CALCULADOR DE ANTIGÜEDAD Y PREGUNTAS ABIERTAS IA (calculadorAntiguedadYAbiertas.ts)
 * ============================================================================
 * Calcula las estadísticas de retención por antigüedad y el resumen de
 * comentarios libres reales con extracción de nombres sin falsos positivos.
 */

import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'
import { calcularPuntajeDeRegistro } from '@/services/calculadorClimaService'
import { extraerNombresDeTexto } from '@/ia/deteccionMenciones'
import { extraerComentarioLibreValido } from '@/ia/menciones/filtroComentariosReales'
import { clasificarRangoAntiguedad } from './calculadorDesglosePreguntas'
import type {
  AnalisisPreguntasAbiertas,
  PersonaProblemaDetectada
} from '@/shared/types/dashboard.types'

export function calcularEstadisticasAntiguedad(respuestasFiltradas: RegistroRespuesta[]) {
  const conteo = {
    'menos-6m': { etiqueta: 'Menos de 6 meses', count: 0, sumaPuntaje: 0 },
    '6m-1a': { etiqueta: 'De 6 meses a 1 año', count: 0, sumaPuntaje: 0 },
    '1a-3a': { etiqueta: 'De 1 a 3 años', count: 0, sumaPuntaje: 0 },
    'mas-3a': { etiqueta: 'Más de 3 años', count: 0, sumaPuntaje: 0 }
  }

  respuestasFiltradas.forEach(r => {
    const items = Array.isArray(r.respuestas) ? r.respuestas : (typeof r.respuestas === 'string' ? JSON.parse(r.respuestas || '[]') : [])
    const rango = clasificarRangoAntiguedad(items)
    const val = calcularPuntajeDeRegistro(r.respuestas, r.puntajeGeneral).porcentajeClima
    conteo[rango].count++
    conteo[rango].sumaPuntaje += val
  })

  const total = respuestasFiltradas.length || 1

  return Object.entries(conteo).map(([key, item]) => {
    const porcentaje = Math.round((item.count / total) * 100)
    const promedio = item.count > 0 ? Math.round(item.sumaPuntaje / item.count) : 0
    const riesgoRotacion: 'Alto' | 'Moderado' | 'Bajo' =
      key === 'menos-6m' ? 'Alto' : key === '6m-1a' ? 'Moderado' : 'Bajo'

    const planes: Record<string, { carreras: string[]; recomendacion: string }> = {
      'menos-6m': {
        carreras: ['Programa de Onboarding Intensivo', 'Certificación en Operaciones Básicas'],
        recomendacion: 'Acompañamiento estrecho en los primeros 90 días para mitigar deserciones tempranas.'
      },
      '6m-1a': {
        carreras: ['Capacitación en Tecnología / IT', 'Gestión de Clientes Complejos'],
        recomendacion: 'Etapa ideal para detectar talentos con aptitud técnica e invitarlos a semilleros.'
      },
      '1a-3a': {
        carreras: ['Liderazgo y Supervisión de Operaciones', 'Especialización en Gestión Humana / RRHH'],
        recomendacion: 'Momento óptimo para programas de ascenso interno a Supervisores o Analistas.'
      },
      'mas-3a': {
        carreras: ['Mentores Senior de Equipo', 'Gestión de Proyectos & Cuadro Directivo'],
        recomendacion: 'Colaboradores con alta fidelización; requieren planes de incentivos y liderazgo estratégico.'
      }
    }

    const infoPlan = planes[key] || planes['1a-3a']!

    return {
      id: key,
      etiqueta: item.etiqueta,
      cantidad: item.count,
      porcentaje,
      promedioSatisfaccion: promedio,
      riesgoRotacion,
      carrerasRecomendadas: infoPlan.carreras,
      recomendacionIA: infoPlan.recomendacion
    }
  })
}

export function calcularAnalisisPreguntasAbiertas(
  respuestasFiltradas: RegistroRespuesta[]
): AnalisisPreguntasAbiertas {
  let totalTextos = 0
  let cosasMalas = 0
  let mejoras = 0

  const personasMap: Record<string, {
    nombre: string
    menciones: number
    frases: string[]
    severo: boolean
    tipoProblema: string
  }> = {}

  respuestasFiltradas.forEach(r => {
    const items = Array.isArray(r.respuestas) ? r.respuestas : (typeof r.respuestas === 'string' ? JSON.parse(r.respuestas || '[]') : [])
    items.forEach((item: any) => {
      const rawTxt = extraerComentarioLibreValido(item)
      if (!rawTxt || rawTxt.length < 3) return
      totalTextos++

      const lower = rawTxt.toLowerCase()
      if (/grito|maltrat|acos|favoritism|no apoyan|sobrecarga|dañad|colapso|renuncia|pesad/i.test(lower)) {
        cosasMalas++
      }
      if (/mejorar|sugerencia|deberían|sería bueno|oportunidad|capacitar/i.test(lower)) {
        mejoras++
      }

      const nombresExtraidos = extraerNombresDeTexto(rawTxt, true)
      nombresExtraidos.forEach(nombreEncontrado => {
        const normKey = nombreEncontrado.toLowerCase()
        if (!personasMap[normKey]) {
          personasMap[normKey] = {
            nombre: nombreEncontrado,
            menciones: 0,
            frases: [],
            severo: false,
            tipoProblema: 'Falta de apoyo y liderazgo'
          }
        }
        personasMap[normKey]!.menciones++
        if (!personasMap[normKey]!.frases.includes(rawTxt)) {
          personasMap[normKey]!.frases.push(rawTxt)
        }
        if (/grito|acos|favoritism|maltrat/i.test(lower)) {
          personasMap[normKey]!.severo = true
          personasMap[normKey]!.tipoProblema = 'Abuso de Autoridad / Fricción Severa'
        }
      })
    })
  })

  const personasProblema: PersonaProblemaDetectada[] = Object.values(personasMap).map(p => {
    const esCritico = p.severo || p.menciones >= 2
    const severidad: PersonaProblemaDetectada['severidad'] =
      esCritico ? 'Crítica (Intervención RRHH)' : p.menciones > 1 ? 'Alta (Revisión Liderazgo)' : 'Moderada'

    return {
      id: `persona-${p.nombre.toLowerCase().replace(/\s+/g, '-')}`,
      nombre: p.nombre,
      rolSugerido: p.nombre.toLowerCase().includes('jefe') ? 'Jefe / Director' : 'Supervisor / Líder Directo',
      conteoMenciones: p.menciones,
      severidad,
      categoriaProblema: p.tipoProblema,
      motivoDetallado: `Señalado en ${p.menciones} comentario(s) libre(s) por temas de ${p.tipoProblema.toLowerCase()}.`,
      frasesEjemplo: p.frases.slice(0, 3),
      accionRecomendadaIA: esCritico
        ? 'Revisión prioritaria por Gestión Humana y citación a coaching confidencial de liderazgo.'
        : 'Seguimiento por psicología organizacional en la próxima evaluación.'
    }
  })

  return {
    totalRespuestasTextoAnalizadas: totalTextos,
    cosasMalasCount: cosasMalas,
    mejorasCount: mejoras,
    personasProblemaCount: personasProblema.length,
    personasProblema
  }
}
