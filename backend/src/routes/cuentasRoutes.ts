import { Router } from 'express'
import {
  getCuentas,
  createCuenta,
  updateCuenta,
  deleteCuenta
} from '../controllers/cuentasController.js'
import { verificarToken, exigirRol } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', verificarToken, getCuentas)
router.post('/', verificarToken, exigirRol(['Super Administrador', 'Administrador']), createCuenta)
router.put('/:id', verificarToken, exigirRol(['Super Administrador', 'Administrador']), updateCuenta)
router.delete('/:id', verificarToken, exigirRol(['Super Administrador']), deleteCuenta)

export default router
