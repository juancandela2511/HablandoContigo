/**
 * ============================================================================
 * MÓDULO DE ERRORES Y CUMPLIMIENTO LEGAL (src/componentes/Errores/index.ts)
 * ============================================================================
 */

export { default as TarjetaDetalleLegalError } from './TarjetaDetalleLegalError.vue'
export { default as ContenedorError } from './ContenedorError.vue'

// Errores por Mal Uso del Usuario
export { default as Error400SolicitudInvalida } from './Usuario/Error400SolicitudInvalida.vue'
export { default as Error401NoAutorizado } from './Usuario/Error401NoAutorizado.vue'
export { default as Error403AccesoDenegado } from './Usuario/Error403AccesoDenegado.vue'
export { default as Error404NoEncontrado } from './Usuario/Error404NoEncontrado.vue'
export { default as Error422ValidacionFormulario } from './Usuario/Error422ValidacionFormulario.vue'
export { default as Error429LimitePeticiones } from './Usuario/Error429LimitePeticiones.vue'

// Errores del Sistema e Infraestructura
export { default as Error500ServidorCaido } from './Sistema/Error500ServidorCaido.vue'
export { default as Error503ServicioNoDisponible } from './Sistema/Error503ServicioNoDisponible.vue'
export { default as Error504TiempoAgotado } from './Sistema/Error504TiempoAgotado.vue'
export { default as ErrorSupabaseCaido } from './Sistema/ErrorSupabaseCaido.vue'

// Errores de Red y Conectividad
export { default as ErrorSinInternet } from './Red/ErrorSinInternet.vue'