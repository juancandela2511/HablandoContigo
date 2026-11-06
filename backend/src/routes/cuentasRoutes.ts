import { Router } from 'express'
import {
  getCuentas,
  createCuenta,
  updateCuenta,
  deleteCuenta
} from '../controllers/cuentasController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', verificarToken, getCuentas)
router.post('/', verificarToken, createCuenta)
router.put('/:id', verificarToken, updateCuenta)
router.delete('/:id', verificarToken, deleteCuenta)

export default router
