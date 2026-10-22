/**
 * ============================================================================
 * RUTAS DE INTELIGENCIA ARTIFICIAL (backend/src/routes/iaRoutes.ts)
 * ============================================================================
 */

import { Router } from 'express'
import { postAnalizarRespuesta, postGenerarConclusiones, postResumirComentarios } from '../controllers/iaController.js'
import { postSugerenciasAdmin, postInformeDetalladoPdf } from '../asistenteIA/asistenteController.js'

const router = Router()

// POST /api/ia/analizar-respuesta
router.post('/analizar-respuesta', postAnalizarRespuesta)

// POST /api/ia/conclusiones
router.post('/conclusiones', postGenerarConclusiones)

// POST /api/ia/resumen-comentarios
router.post('/resumen-comentarios', postResumirComentarios)

// POST /api/ia/sugerencias-admin (Alertas, Gráficos Anclados y Mejora de Preguntas)
router.post('/sugerencias-admin', postSugerenciasAdmin)

// POST /api/ia/informe-detallado-pdf (Fortalezas, Debilidades y Conclusiones PDF)
router.post('/informe-detallado-pdf', postInformeDetalladoPdf)

export default router
