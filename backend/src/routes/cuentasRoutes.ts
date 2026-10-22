import { Router } from 'express'
import {
  getCuentas,
  createCuenta,
  updateCuenta,
  deleteCuenta
} from '../controllers/cuentasController.js'

const router = Router()

router.get('/', getCuentas)
router.post('/', createCuenta)
router.put('/:id', updateCuenta)
router.delete('/:id', deleteCuenta)

export default router
