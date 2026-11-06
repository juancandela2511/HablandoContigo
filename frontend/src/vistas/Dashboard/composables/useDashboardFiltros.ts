/**
 * ============================================================================
 * COMPOSABLE DE FILTROS Y ALCANCES DEL DASHBOARD (useDashboardFiltros.ts)
 * ============================================================================
 * Centraliza la lógica de filtrado por modalidad (clima vs rápida), encuesta,
 * departamento y periodo temporal para el Dashboard.
 */

import { ref, computed, watch, type Ref } from 'vue'
import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import { calcularDimensionesProporcionales } from '@/Almacenes/useDashboardStats'
import { calcularClimaGlobalDeRespuestas } from '@/services/calculadorClimaService'

export function useDashboardFiltros(
  encuestas: Ref<Encuesta[]>,
  respuestasAnonimas: Ref<RegistroRespuesta[]>,
  alertasConvivencia: Ref<NotificacionItem[]>,
  dimensionesConfiguradas: Ref<any[]>,
  departamentosDisponibles: Ref<string[]>,
  departamentoFiltro: Ref<string>,
  metaGlobalRadial: Ref<number>
) {
  // Filtro de Modalidad de Dashboard: Clima Laboral vs Encuestas Rápidas vs Consolidado
  const modoDashboard = ref<'clima' | 'rapida' | 'consolidado'>('clima')
  const encuestaFiltro = ref('enc-001')
  const filtroPeriodoTemporal = ref('mensual')

  // Resetear encuestaFiltro al cambiar de modalidad seleccionando el primer proyecto disponible
  watch(modoDashboard, () => {
    const disponibles = encuestasDisponiblesSegunModo.value
    encuestaFiltro.value = disponibles.length > 0 ? disponibles[0].id : ''
  })

  // Encuestas filtradas según la modalidad seleccionada
  const encuestasDisponiblesSegunModo = computed(() => {
    if (modoDashboard.value === 'consolidado') return encuestas.value
    if (modoDashboard.value === 'clima') {
      return encuestas.value.filter(e => 
        e.id === 'enc-001' || 
        (e as { tipo?: string }).tipo === 'clima' || 
        e.titulo.toLowerCase().includes('clima') || 
        e.titulo.toLowerCase().includes('diagnóstico') || 
        (e.preguntas && e.preguntas.length >= 10)
      )
    }
    return encuestas.value.filter(e => 
      (e as { tipo?: string }).tipo === 'rapida' || 
      (e as { tipo?: string }).tipo === 'pulso' || 
      e.titulo.toLowerCase().includes('pulso') || 
      e.titulo.toLowerCase().includes('rápida') || 
      (e.preguntas && e.preguntas.length < 10)
    )
  })

  // Objeto de la encuesta activa seleccionada
  const encuestaSeleccionadaObj = computed(() => {
    if (!encuestaFiltro.value || encuestaFiltro.value === 'todas') return null
    return encuestas.value.find(e => e.id === encuestaFiltro.value) || null
  })

  // Preguntas disponibles según el alcance seleccionado
  const preguntasDisponiblesAlcance = computed(() => {
    if (encuestaSeleccionadaObj.value?.preguntas) {
      return encuestaSeleccionadaObj.value.preguntas
    }
    return []
  })

  // Respuestas válidas en el alcance actual (estrictamente del proyecto para no mezclar)
  const respuestasValidasAlcance = computed(() => {
    if (!encuestaFiltro.value) return []

    return respuestasAnonimas.value.filter(r => {
      // Si es el proyecto principal enc-001, incluye respuestas con id o sin id de versiones previas
      const coincideProyecto = r.idEncuesta === encuestaFiltro.value || 
        (encuestaFiltro.value === 'enc-001' && (!r.idEncuesta || r.idEncuesta === 'enc-001'))
      
      if (!coincideProyecto) return false

      if (departamentoFiltro.value !== 'todos') {
        const enc = encuestas.value.find(e => e.id === r.idEncuesta)
        if (enc?.departamento !== departamentoFiltro.value) return false
      }
      return true
    })
  })

  // Dimensiones dinámicas para el radar
  const dimensionesRadialesDinamicas = computed(() => {
    return calcularDimensionesProporcionales(
      dimensionesConfiguradas.value,
      respuestasValidasAlcance.value,
      metaGlobalRadial.value || 85
    )
  })

  // Alertas válidas filtradas por departamento
  const alertasValidasAlcance = computed(() => {
    return alertasConvivencia.value.filter(alerta => {
      if (departamentoFiltro.value !== 'todos' && alerta.departamento) {
        const deptoAlerta = alerta.departamento.toLowerCase()
        const deptoFiltro = departamentoFiltro.value.toLowerCase()
        if (deptoAlerta !== deptoFiltro && deptoAlerta !== 'general' && deptoAlerta !== 'sede principal') {
          return false
        }
      }
      return true
    })
  })

  // Departamentos en barras
  const departamentosBarras = computed(() => {
    if (departamentosDisponibles.value.length === 0 || respuestasAnonimas.value.length === 0) {
      return []
    }

    return departamentosDisponibles.value.map(dep => {
      const respsDep = respuestasAnonimas.value.filter(r => {
        const enc = encuestas.value.find(e => e.id === r.idEncuesta)
        return enc?.departamento === dep
      })
      if (respsDep.length > 0) {
        const evalDep = calcularClimaGlobalDeRespuestas(respsDep)
        const puntaje = evalDep.puntajePromedio
        const porcentaje = evalDep.porcentajeClima
        return {
          categoria: dep,
          puntaje,
          porcentaje,
          respuestas: respsDep.length,
          nivelAlerta: (puntaje >= 4.0 ? 'Optimo' : puntaje >= 3.0 ? 'Moderado' : 'Critico') as 'Optimo' | 'Moderado' | 'Critico' | 'Sin datos'
        }
      }
      return {
        categoria: dep,
        puntaje: 0.0,
        porcentaje: 0,
        respuestas: 0,
        nivelAlerta: 'Sin datos' as const
      }
    })
  })

  return {
    modoDashboard,
    encuestaFiltro,
    filtroPeriodoTemporal,
    encuestasDisponiblesSegunModo,
    encuestaSeleccionadaObj,
    preguntasDisponiblesAlcance,
    respuestasValidasAlcance,
    dimensionesRadialesDinamicas,
    alertasValidasAlcance,
    departamentosBarras
  }
}
