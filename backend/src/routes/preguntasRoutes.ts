import { Router } from 'express'
import {
  getPreguntas,
  createPregunta,
  updatePregunta,
  deletePregunta
} from '../controllers/preguntasController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', getPreguntas)
router.post('/', verificarToken, createPregunta)
router.put('/:id', verificarToken, updatePregunta)
router.delete('/:id', verificarToken, deletePregunta)

export default router
