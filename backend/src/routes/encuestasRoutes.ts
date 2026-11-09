import { Router } from 'express'
import {
  getEncuestas,
  getEncuestaById,
  updateEncuesta,
  deleteEncuesta
} from '../controllers/encuestasController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', getEncuestas)
router.get('/:id', getEncuestaById)
router.put('/:id', verificarToken, updateEncuesta)
router.delete('/:id', verificarToken, deleteEncuesta)

export default router
