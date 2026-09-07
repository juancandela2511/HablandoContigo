/**
 * ============================================================================
 * ALMACÉN DE CUMPLIMIENTO LEGAL, TÉRMINOS Y CONSENTIMIENTO INFORMADO
 * (useLegal.ts)
 * ============================================================================
 * 
 * ¿QUÉ HACE?
 * Gestiona el marco normativo y legal del ecosistema HablandoContigo:
 * - Versionamiento y trazabilidad de Términos y Condiciones (v1.0-2026).
 * - Política de Privacidad y Tratamiento de Datos Personales (RGPD / Habeas Data).
 * - Consentimiento Informado para encuestas anónimas y evaluación psicosocial.
 * - Orquestación de modales legales interactivos.
 * - Registro de aceptación obligatoria en primer ingreso de cuentas administrativas.
 */

import { ref } from 'vue'

export const VERSION_TERMINOS_ACTUAL = 'v1.0-2026'
export const VERSION_PRIVACIDAD_ACTUAL = 'v1.0-2026'
export const VERSION_CONSENTIMIENTO_ACTUAL = 'v1.0-2026'

const CLAVE_CONSENTIMIENTO_ADMIN = 'hablandocontigo_consentimiento_admin_'
const CLAVE_CONSENTIMIENTO_ENCUESTA = 'hablandocontigo_consentimiento_encuesta_'

const modalTerminosAbierto = ref(false)
const modalPrivacidadAbierto = ref(false)
const modalConsentimientoAbierto = ref(false)
const modalCookiesAbierto = ref(false)

export function useLegal() {
  const abrirTerminos = () => {
    modalTerminosAbierto.value = true
  }

  const abrirPrivacidad = () => {
    modalPrivacidadAbierto.value = true
  }

  const abrirConsentimiento = () => {
    modalConsentimientoAbierto.value = true
  }

  const abrirCookies = () => {
    modalCookiesAbierto.value = true
  }

  const cerrarModales = () => {
    modalTerminosAbierto.value = false
    modalPrivacidadAbierto.value = false
    modalConsentimientoAbierto.value = false
    modalCookiesAbierto.value = false
  }

  const registrarAceptacionPrimerIngreso = (email: string) => {
    if (typeof localStorage === 'undefined' || !email) return
    const registro = {
      email: email.toLowerCase().trim(),
      fechaAceptacionISO: new Date().toISOString(),
      versionTerminos: VERSION_TERMINOS_ACTUAL,
      versionPrivacidad: VERSION_PRIVACIDAD_ACTUAL,
      aceptado: true
    }
    localStorage.setItem(`${CLAVE_CONSENTIMIENTO_ADMIN}${email.toLowerCase().trim()}`, JSON.stringify(registro))
  }

  const haAceptadoTerminosAdmin = (email: string): boolean => {
    if (typeof localStorage === 'undefined' || !email) return false
    try {
      const raw = localStorage.getItem(`${CLAVE_CONSENTIMIENTO_ADMIN}${email.toLowerCase().trim()}`)
      if (!raw) return false
      const parseado = JSON.parse(raw)
      return parseado.aceptado === true && parseado.versionTerminos === VERSION_TERMINOS_ACTUAL
    } catch {
      return false
    }
  }

  const registrarConsentimientoEncuesta = (uuidDispositivo: string, idEncuesta: string) => {
    if (typeof localStorage === 'undefined' || !uuidDispositivo) return
    const clave = `${CLAVE_CONSENTIMIENTO_ENCUESTA}${idEncuesta}_${uuidDispositivo}`
    const registro = {
      uuidDispositivo,
      idEncuesta,
      fechaConsentimientoISO: new Date().toISOString(),
      versionConsentimiento: VERSION_CONSENTIMIENTO_ACTUAL,
      consentimientoOtorgado: true
    }
    localStorage.setItem(clave, JSON.stringify(registro))
  }

  const haAceptadoConsentimientoEncuesta = (uuidDispositivo: string, idEncuesta: string): boolean => {
    if (typeof localStorage === 'undefined' || !uuidDispositivo) return false
    try {
      const clave = `${CLAVE_CONSENTIMIENTO_ENCUESTA}${idEncuesta}_${uuidDispositivo}`
      const raw = localStorage.getItem(clave)
      if (!raw) return false
      const parseado = JSON.parse(raw)
      return parseado.consentimientoOtorgado === true
    } catch {
      return false
    }
  }

  return {
    modalTerminosAbierto,
    modalPrivacidadAbierto,
    modalConsentimientoAbierto,
    modalCookiesAbierto,
    versionTerminos: VERSION_TERMINOS_ACTUAL,
    versionPrivacidad: VERSION_PRIVACIDAD_ACTUAL,
    versionConsentimiento: VERSION_CONSENTIMIENTO_ACTUAL,
    abrirTerminos,
    abrirPrivacidad,
    abrirConsentimiento,
    abrirCookies,
    cerrarModales,
    registrarAceptacionPrimerIngreso,
    haAceptadoTerminosAdmin,
    registrarConsentimientoEncuesta,
    haAceptadoConsentimientoEncuesta
  }
}