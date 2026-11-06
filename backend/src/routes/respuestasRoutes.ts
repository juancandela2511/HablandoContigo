import { Router } from 'express'
import {
  getRespuestas,
  createRespuesta,
  getMetricasEncuesta,
  limpiarRespuestas
} from '../controllers/respuestasController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', getRespuestas)
router.post('/', createRespuesta)
router.get('/metricas/:id_encuesta', getMetricasEncuesta)
router.delete('/limpiar', verificarToken, limpiarRespuestas)

export default router
