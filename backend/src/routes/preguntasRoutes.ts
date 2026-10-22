import { Router } from 'express'
import {
  getPreguntas,
  createPregunta,
  updatePregunta,
  deletePregunta
} from '../controllers/preguntasController.js'

const router = Router()

router.get('/', getPreguntas)
router.post('/', createPregunta)
router.put('/:id', updatePregunta)
router.delete('/:id', deletePregunta)

export default router
