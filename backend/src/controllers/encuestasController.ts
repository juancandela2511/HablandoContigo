/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL DE ENCUESTAS (encuestasController.ts)
 * ============================================================================
 * Re-exporta los submódulos especializados de consulta, edición y eliminación
 * de encuestas y alertas en español.
 */

export {
  getEncuestas,
  getEncuestaById,
  getAlertasConfig
} from './encuestas/consultarEncuestasControlador.js'

export {
  updateEncuesta,
  deleteEncuesta
} from './encuestas/mutacionEncuestasControlador.js'
