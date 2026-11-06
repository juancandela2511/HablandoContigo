import { Router } from 'express'
import {
  login,
  me,
  cambiarContrasena,
  actualizarPerfil,
  logout
} from '../controllers/authController.js'
import { verificarToken, verificarTokenFlexible } from '../middlewares/authMiddleware.js'

const router = Router()

// Rutas públicas
router.post('/login', login)
router.post('/logout', logout)

// Rutas protegidas con JWT
router.get('/me', verificarToken, me)
router.get('/perfil', verificarToken, me)
router.post('/cambiar-contrasena', verificarToken, cambiarContrasena)
router.put('/perfil', verificarTokenFlexible, actualizarPerfil)

export default router
