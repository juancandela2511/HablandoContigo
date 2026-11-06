/**
 * ============================================================================
 * ESTADO REACTIVO GLOBAL DE ENCUESTAS (estadoEncuestas.ts)
 * ============================================================================
 * Mantiene el estado singleton y las funciones de carga asíncrona unificada en español.
 */

import { ref } from 'vue'
import type { Encuesta, RegistroRespuesta } from './tiposEncuestas'
import {
  encuestasBaseDefault,
  obtenerEncuestasLocalesGuardadas,
  obtenerRespuestasLocalesGuardadas,
  cargarEncuestasUnificadas,
  cargarRespuestasUnificadas
} from './persistenciaEncuestas'

const encuestasIniciales = obtenerEncuestasLocalesGuardadas()
export const encuestas = ref<Encuesta[]>(encuestasIniciales.length > 0 ? encuestasIniciales : [...encuestasBaseDefault])
export const respuestasAnonimas = ref<RegistroRespuesta[]>(obtenerRespuestasLocalesGuardadas())
export const cargandoEncuestas = ref(false)
export const cargandoRespuestas = ref(false)

let cargadoInicialEncuestas = false
let cargadoInicialRespuestas = false
let promesaCargaEncuestas: Promise<void> | null = null
let promesaCargaRespuestas: Promise<void> | null = null

export const cargarEncuestasDesdeLocal = async (forzar: boolean = false) => {
  if (cargadoInicialEncuestas && !forzar) return
  if (promesaCargaEncuestas && !forzar) return promesaCargaEncuestas

  promesaCargaEncuestas = (async () => {
    cargandoEncuestas.value = true
    try {
      const resultado = await cargarEncuestasUnificadas(encuestas.value)
      encuestas.value = resultado
      cargadoInicialEncuestas = true
    } finally {
      cargandoEncuestas.value = false
      promesaCargaEncuestas = null
    }
  })()

  return promesaCargaEncuestas
}

export const cargarRespuestasDesdeLocal = async (forzar: boolean = false) => {
  if (cargadoInicialRespuestas && !forzar) return
  if (promesaCargaRespuestas && !forzar) return promesaCargaRespuestas

  promesaCargaRespuestas = (async () => {
    cargandoRespuestas.value = true
    try {
      const resultado = await cargarRespuestasUnificadas(respuestasAnonimas.value)
      respuestasAnonimas.value = resultado
      cargadoInicialRespuestas = true
    } finally {
      cargandoRespuestas.value = false
      promesaCargaRespuestas = null
    }
  })()

  return promesaCargaRespuestas
}
