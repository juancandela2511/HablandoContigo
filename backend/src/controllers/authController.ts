/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL DE AUTENTICACIÓN (authController.ts)
 * ============================================================================
 * Re-exporta los submódulos especializados de inicio de sesión, perfil
 * y cambio de contraseña en español.
 */

export { login, logout } from './auth/loginControlador.js'
export { me, actualizarPerfil } from './auth/perfilControlador.js'
export { cambiarContrasena } from './auth/contrasenaControlador.js'
