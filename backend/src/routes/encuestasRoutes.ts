import { Router } from 'express'
import {
  getEncuestas,
  getEncuestaById,
  updateEncuesta
} from '../controllers/encuestasController.js'

const router = Router()

router.get('/', getEncuestas)
router.get('/:id', getEncuestaById)
router.put('/:id', updateEncuesta)

export default router
