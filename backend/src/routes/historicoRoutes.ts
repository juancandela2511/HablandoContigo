import { Router } from 'express'
import {
  getHistoricoPeriodos,
  createHistoricoPeriodo
} from '../controllers/historicoController.js'

const router = Router()

router.get('/', getHistoricoPeriodos)
router.post('/', createHistoricoPeriodo)

export default router
