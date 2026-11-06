import { Router } from 'express'
import {
  getHistoricoPeriodos,
  createHistoricoPeriodo,
  deleteHistoricoPeriodo
} from '../controllers/historicoController.js'

const router = Router()

router.get('/', getHistoricoPeriodos)
router.post('/', createHistoricoPeriodo)
router.delete('/:id', deleteHistoricoPeriodo)

export default router
