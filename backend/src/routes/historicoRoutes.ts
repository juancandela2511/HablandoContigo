import { Router } from 'express'
import {
  getHistoricoPeriodos,
  createHistoricoPeriodo,
  deleteHistoricoPeriodo
} from '../controllers/historicoController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', getHistoricoPeriodos)
router.post('/', verificarToken, createHistoricoPeriodo)
router.delete('/:id', verificarToken, deleteHistoricoPeriodo)

export default router
