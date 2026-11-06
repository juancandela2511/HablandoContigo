/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL DE RESPUESTAS (respuestasController.ts)
 * ============================================================================
 * Re-exporta los submódulos especializados de consulta, registro transaccional
 * y vaciado de respuestas de prueba en español.
 */

export { getRespuestas, getMetricasEncuesta } from './respuestas/consultarRespuestasControlador.js'
export { createRespuesta, limpiarRespuestas } from './respuestas/registroRespuestasControlador.js'
