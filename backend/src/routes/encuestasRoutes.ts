import { Router } from 'express'
import {
  getEncuestas,
  getEncuestaById,
  updateEncuesta,
  deleteEncuesta
} from '../controllers/encuestasController.js'
import { verificarTokenFlexible } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', getEncuestas)
router.get('/:id', getEncuestaById)
router.put('/:id', verificarTokenFlexible, updateEncuesta)
router.delete('/:id', verificarTokenFlexible, deleteEncuesta)

export default router
