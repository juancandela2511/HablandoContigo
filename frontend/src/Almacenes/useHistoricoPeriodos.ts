/**
 * ============================================================================
 * ALMACÉN DE HISTÓRICO DE PERIODOS & ANÁLISIS COMPARATIVO (useHistoricoPeriodos.ts)
 * ============================================================================
 * Administra el cierre anual de proyectos de clima y el ingreso de datos
 * de porcentaje de años anteriores para comparativas en español.
 */

import { ref } from 'vue'
import { useToast } from '@/Almacenes/useToast'
import type { ComparativaPeriodosResult, RegistroHistoricoPeriodo } from './historico/tiposHistorico'
import {
  cargarHistoricoDeLocalStorage,
  guardarHistoricoEnLocalStorage,
  sincronizarHistoricoDesdeBackend
} from './historico/persistenciaHistorico'

export type { ComparativaPeriodosResult, DesgloseBloqueHistorico, RegistroHistoricoPeriodo } from './historico/tiposHistorico'

const { mostrarExito } = useToast()
const historicoPeriodos = ref<RegistroHistoricoPeriodo[]>(cargarHistoricoDeLocalStorage())
const cargandoHistorico = ref(false)
let cargadoInicialHistorico = false

export function useHistoricoPeriodos() {
  const cargarHistorico = async (forzar: boolean = false) => {
    if (cargadoInicialHistorico && !forzar) return
    if (cargandoHistorico.value) return
    cargandoHistorico.value = true

    try {
      const local = cargarHistoricoDeLocalStorage()
      if (local.length > 0) {
        historicoPeriodos.value = local
      } else {
        const remoto = await sincronizarHistoricoDesdeBackend()
        if (remoto && remoto.length > 0) {
          historicoPeriodos.value = remoto
          guardarHistoricoEnLocalStorage(historicoPeriodos.value)
        }
      }
      cargadoInicialHistorico = true
    } catch {
      historicoPeriodos.value = cargarHistoricoDeLocalStorage()
    } finally {
      cargandoHistorico.value = false
    }
  }

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
    guardarHistoricoEnLocalStorage(historicoPeriodos.value)
    mostrarExito('Dato Histórico Guardado', `Año ${anio}: ${pctLimpio}% registrado para la comparativa.`)
  }

  const eliminarDatoAnioAnterior = (anioOId: number | string) => {
    historicoPeriodos.value = historicoPeriodos.value.filter(
      p => p.id !== anioOId && p.anio !== anioOId
    )
    guardarHistoricoEnLocalStorage(historicoPeriodos.value)
  }

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
    guardarHistoricoEnLocalStorage(historicoPeriodos.value)

    mostrarExito('Periodo Cerrado con Éxito', `Se guardó el cierre oficial del periodo ${guardadoLocal.anio} (${guardadoLocal.porcentajeSatisfaccion}% de satisfacción).`)
    return true
  }

  const revertirCierrePeriodo = (idEncuestaOAnio: string | number) => {
    historicoPeriodos.value = historicoPeriodos.value.filter(
      p => p.idEncuesta !== String(idEncuestaOAnio) && p.id !== String(idEncuestaOAnio) && p.anio !== Number(idEncuestaOAnio)
    )
    guardarHistoricoEnLocalStorage(historicoPeriodos.value)
  }

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
