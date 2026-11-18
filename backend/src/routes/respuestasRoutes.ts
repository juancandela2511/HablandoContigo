import { Router } from 'express'
import {
  getRespuestas,
  createRespuesta,
  getMetricasEncuesta,
  limpiarRespuestas
} from '../controllers/respuestasController.js'
import { verificarTokenFlexible } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', verificarTokenFlexible, getRespuestas)
router.post('/', createRespuesta)
router.get('/metricas/:id_encuesta', getMetricasEncuesta)
router.delete('/limpiar', verificarTokenFlexible, limpiarRespuestas)
router.delete('/:id', verificarTokenFlexible, async (req, res) => {
  const { pool } = await import('../config/db.js')
  try {
    await pool.query('DELETE FROM respuestas WHERE id_respuesta = $1', [req.params.id])
    res.json({ ok: true, mensaje: 'Respuesta eliminada' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
