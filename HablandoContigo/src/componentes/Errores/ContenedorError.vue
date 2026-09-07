<!--
  ============================================================================
  CONTENEDOR GLOBAL DINÁMICO DE ERRORES (ContenedorError.vue)
  ============================================================================
  
  Renderiza dinámicamente el componente de error pequeño adecuado según el
  código del incidente activo, ya sea en modal emergente o vista embebida.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useManejadorErrores } from '@/Almacenes/useManejadorErrores'

// Importación de todos los subcomponentes pequeños
import Error400SolicitudInvalida from './Usuario/Error400SolicitudInvalida.vue'
import Error401NoAutorizado from './Usuario/Error401NoAutorizado.vue'
import Error403AccesoDenegado from './Usuario/Error403AccesoDenegado.vue'
import Error404NoEncontrado from './Usuario/Error404NoEncontrado.vue'
import Error422ValidacionFormulario from './Usuario/Error422ValidacionFormulario.vue'
import Error429LimitePeticiones from './Usuario/Error429LimitePeticiones.vue'

import Error500ServidorCaido from './Sistema/Error500ServidorCaido.vue'
import Error503ServicioNoDisponible from './Sistema/Error503ServicioNoDisponible.vue'
import Error504TiempoAgotado from './Sistema/Error504TiempoAgotado.vue'
import ErrorSupabaseCaido from './Sistema/ErrorSupabaseCaido.vue'

import ErrorSinInternet from './Red/ErrorSinInternet.vue'

const {
  incidenteActivo,
  mostrarContenedorError,
  limpiarError
} = useManejadorErrores()

/** Componente dinámico a renderizar según el código */
const componenteErrorActual = computed(() => {
  if (!incidenteActivo.value) return Error500ServidorCaido

  switch (incidenteActivo.value.codigo) {
    case 400: return Error400SolicitudInvalida
    case 401: return Error401NoAutorizado
    case 403: return Error403AccesoDenegado
    case 404: return Error404NoEncontrado
    case 422: return Error422ValidacionFormulario
    case 429: return Error429LimitePeticiones
    case 500: return Error500ServidorCaido
    case 503: return Error503ServicioNoDisponible
    case 504: return Error504TiempoAgotado
    case 'SUPABASE_ERROR': return ErrorSupabaseCaido
    case 'OFFLINE': return ErrorSinInternet
    default: return Error500ServidorCaido
  }
})

const manejarReintento = () => {
  limpiarError()
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="mostrarContenedorError && incidenteActivo"
        class="fixed inset-0 z-[9998] flex items-center justify-center p-4 overflow-y-auto"
        role="alertdialog"
        aria-modal="true"
      >
        <!-- Backdrop difuminado -->
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-md" @click="limpiarError" />

        <!-- Tarjeta del error dinámico -->
        <div class="relative z-10 w-full max-w-2xl my-8">
          
          <!-- Botón de cierre rápido superior -->
          <button
            @click="limpiarError"
            class="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            aria-label="Cerrar ventana de error"
          >
            <X class="w-4 h-4" />
          </button>

          <component
            :is="componenteErrorActual"
            :incidente="incidenteActivo"
            @reintentar="manejarReintento"
            @cerrar="limpiarError"
            @reconectado="limpiarError"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>