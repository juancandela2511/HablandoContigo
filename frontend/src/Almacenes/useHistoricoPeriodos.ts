/**
 * ============================================================================
 * ALMACÉN DE HISTÓRICO DE PERIODOS & ANÁLISIS COMPARATIVO (useHistoricoPeriodos.ts)
 * ============================================================================
 *
 * Administra el cierre anual de proyectos de clima y el ingreso manual de datos
 * de porcentaje de años anteriores para hacer una comparación efectiva con el
 * momento actual. Si no hay datos ingresados, indica claramente que no hay
 * datos de años anteriores.
 */

import { ref } from 'vue'
import { useToast } from '@/Almacenes/useToast'
import type { ComparativaPeriodosResult, RegistroHistoricoPeriodo } from './historico/tiposHistorico'

export type { ComparativaPeriodosResult, DesgloseBloqueHistorico, RegistroHistoricoPeriodo } from './historico/tiposHistorico'

import { obtenerApiBaseUrl } from '@/services/api'

const API_URL = obtenerApiBaseUrl()
const STORAGE_KEY = 'hablandocontigo_historico_periodos_v2'

const { mostrarExito } = useToast()

// Por defecto vacío para que si no se han ingresado datos de años anteriores diga "No hay datos de años anteriores"
const DEFAULT_HISTORICO: RegistroHistoricoPeriodo[] = []

function cargarDeLocalStorage(): RegistroHistoricoPeriodo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.warn('[Historico] Error leyendo localStorage:', e)
  }
  return [...DEFAULT_HISTORICO]
}

function guardarEnLocalStorage(items: RegistroHistoricoPeriodo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.warn('[Historico] Error guardando en localStorage:', e)
  }
}

const historicoPeriodos = ref<RegistroHistoricoPeriodo[]>(cargarDeLocalStorage())
const cargandoHistorico = ref(false)

let cargadoInicialHistorico = false

export function useHistoricoPeriodos() {
  /**
   * Carga el historial de cierres de periodo desde localStorage / backend
   */
  const cargarHistorico = async (forzar: boolean = false) => {
    if (cargadoInicialHistorico && !forzar) return
    if (cargandoHistorico.value) return
    cargandoHistorico.value = true

    try {
      const local = cargarDeLocalStorage()
      if (local.length > 0) {
        historicoPeriodos.value = local
      } else {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 1200)

        const respuesta = await fetch(`${API_URL}/historico-periodos`, {
          signal: controller.signal
        }).catch(() => null)

        clearTimeout(timeoutId)

        if (respuesta && respuesta.ok) {
          const data = await respuesta.json()
          if (Array.isArray(data) && data.length > 0) {
            historicoPeriodos.value = data.map((item: any) => ({
              id: item.id,
              idEncuesta: item.id_encuesta || 'enc-001',
              tituloPeriodo: item.titulo_periodo || `Periodo ${item.anio}`,
              anio: Number(item.anio) || 2025,
              fechaCierre: item.fecha_cierre || new Date().toISOString(),
              totalRespuestas: Number(item.total_respuestas) || 0,
              alertasRegistradas: Number(item.alertas_registradas) || 0,
              puntajePromedio: Number(item.puntaje_promedio) || 0,
              porcentajeSatisfaccion: Number(item.porcentaje_satisfaccion) || 0,
              desgloseBloques: Array.isArray(item.desglose_bloques) ? item.desglose_bloques : [],
              cerradoPor: item.cerrado_por || 'Super Administrador',
              notas: item.notas || ''
            }))
            guardarEnLocalStorage(historicoPeriodos.value)
          }
        }
      }
      cargadoInicialHistorico = true
    } catch (e: any) {
      historicoPeriodos.value = cargarDeLocalStorage()
    } finally {
      cargandoHistorico.value = false
    }
  }

  /**
   * Permite ingresar o actualizar manualmente el porcentaje de un año anterior (ej. 2023, 2024, 2025)
   */
  const guardarDatoAnioAnterior = (anio: number, porcentajeSatisfaccion: number, notas?: string) => {
    const pctLimpio = Math.max(0, Math.min(100, Number(porcentajeSatisfaccion) || 0))
    const puntajeEquivalente = Number(((pctLimpio / 100) * 5).toFixed(2))
    const idxExistente = historicoPeriodos.value.findIndex(p => p.anio === anio)

    const nuevoRegistro: RegistroHistoricoPeriodo = {
      id: idxExistente >= 0 ? historicoPeriodos.value[idxExistente]!.id : `hist-${anio}-${Date.now()}`,
      idEncuesta: 'enc-001',
      tituloPeriodo: `Resultado Histórico ${anio}`,
      anio,
      fechaCierre: `${anio}-12-31T18:00:00.000Z`,
      totalRespuestas: idxExistente >= 0 ? historicoPeriodos.value[idxExistente]!.totalRespuestas : 0,
      alertasRegistradas: 0,
      puntajePromedio: puntajeEquivalente,
      porcentajeSatisfaccion: pctLimpio,
      desgloseBloques: [],
      cerradoPor: 'Super Administrador',
      notas: notas || `Porcentaje histórico del año ${anio} registrado para comparativa.`
    }

    if (idxExistente >= 0) {
      historicoPeriodos.value[idxExistente] = nuevoRegistro
    } else {
      historicoPeriodos.value.push(nuevoRegistro)
    }

    historicoPeriodos.value.sort((a, b) => a.anio - b.anio)
    guardarEnLocalStorage(historicoPeriodos.value)
    mostrarExito('Dato Histórico Guardado', `Año ${anio}: ${pctLimpio}% registrado para la comparativa.`)
  }

  /**
   * Elimina el registro de un año anterior
   */
  const eliminarDatoAnioAnterior = (anioOId: number | string) => {
    historicoPeriodos.value = historicoPeriodos.value.filter(
      p => p.id !== anioOId && p.anio !== anioOId
    )
    guardarEnLocalStorage(historicoPeriodos.value)
  }

  /**
   * Registra el cierre de un periodo anual con persistencia local inmediata
   */
  const cerrarYGuardarPeriodoAnual = async (nuevoCierre: Omit<RegistroHistoricoPeriodo, 'id'>): Promise<boolean> => {
    const nuevoId = `hist-${Date.now()}`
    const guardadoLocal: RegistroHistoricoPeriodo = {
      ...nuevoCierre,
      id: nuevoId
    }

    const idx = historicoPeriodos.value.findIndex(p => p.anio === nuevoCierre.anio)
    if (idx >= 0) {
      historicoPeriodos.value[idx] = guardadoLocal
    } else {
      historicoPeriodos.value.push(guardadoLocal)
    }
    historicoPeriodos.value.sort((a, b) => a.anio - b.anio)
    guardarEnLocalStorage(historicoPeriodos.value)

    mostrarExito('Periodo Cerrado con Éxito', `Se guardó el cierre oficial del periodo ${guardadoLocal.anio} (${guardadoLocal.porcentajeSatisfaccion}% de satisfacción).`)
    return true
  }

  /**
   * Revierte y remueve el cierre de periodo anual si el proyecto fue revertido dentro de los 3 días hábiles
   */
  const revertirCierrePeriodo = (idEncuestaOAnio: string | number) => {
    historicoPeriodos.value = historicoPeriodos.value.filter(
      p => p.idEncuesta !== String(idEncuestaOAnio) && p.id !== String(idEncuestaOAnio) && p.anio !== Number(idEncuestaOAnio)
    )
    guardarEnLocalStorage(historicoPeriodos.value)
  }

  /**
   * Calcula la comparativa porcentual entre el valor actual y el año anterior más reciente
   */
  const calcularComparativaHistorica = (porcentajeActual: number): ComparativaPeriodosResult => {
    const anioActual = new Date().getFullYear()
    const anteriores = historicoPeriodos.value
      .filter(p => p.anio < anioActual)
      .sort((a, b) => b.anio - a.anio)

    const periodoAnterior = anteriores[0] || null

    if (!periodoAnterior) {
      return {
        periodoAnterior: null,
        tieneDatosAnteriores: false,
        periodoActualPct: porcentajeActual,
        periodoAnteriorPct: null,
        diferenciaPct: null,
        esCrecimientoPositivo: true
      }
    }

    const pctAnterior = periodoAnterior.porcentajeSatisfaccion
    const delta = Number((porcentajeActual - pctAnterior).toFixed(1))

    return {
      periodoAnterior,
      tieneDatosAnteriores: true,
      periodoActualPct: porcentajeActual,
      periodoAnteriorPct: pctAnterior,
      diferenciaPct: delta,
      esCrecimientoPositivo: delta >= 0
    }
  }

  return {
    historicoPeriodos,
    cargandoHistorico,
    cargarHistoricoDesdeSupabase: cargarHistorico,
    cargarHistorico,
    guardarDatoAnioAnterior,
    eliminarDatoAnioAnterior,
    cerrarYGuardarPeriodoAnual,
    revertirCierrePeriodo,
    calcularComparativaHistorica
  }
}
