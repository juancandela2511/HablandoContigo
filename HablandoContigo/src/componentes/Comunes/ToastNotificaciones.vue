<!--
  ============================================================================
  COMPONENTE DE TOASTS GLOBALES (ToastNotificaciones.vue)
  ============================================================================

  ¿QUÉ ES Y QUÉ HACE?
  Renderiza la cola de toasts del sistema useToast en la esquina inferior derecha
  de la pantalla. Muestra errores en rojo, éxitos en verde y avisos en amarillo.
  Cada toast se cierra automáticamente o al hacer clic en la X.

  ¿CON QUÉ ESTÁ VINCULADO?
  - useToast.ts: Fuente de datos de los toasts.
  - App.vue: Montado a nivel global.
-->

<script setup lang="ts">
import { useToast, type TipoToast } from '@/Almacenes/useToast'
import { AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-vue-next'

const { toasts, eliminar } = useToast()

const clasesPorTipo: Record<TipoToast, string> = {
  error:  'bg-red-950/95 border-red-500/60 text-red-100',
  exito:  'bg-emerald-950/95 border-emerald-500/60 text-emerald-100',
  aviso:  'bg-yellow-950/95 border-yellow-500/60 text-yellow-100'
}

const clasesBarra: Record<TipoToast, string> = {
  error:  'bg-red-500',
  exito:  'bg-emerald-500',
  aviso:  'bg-yellow-500'
}
</script>

<template>
  <!-- Cola de toasts — esquina inferior derecha, encima de todo -->
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-[22rem] max-w-[calc(100vw-2rem)] pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['pointer-events-auto rounded-2xl border backdrop-blur-sm shadow-2xl overflow-hidden', clasesPorTipo[toast.tipo]]"
        >
          <!-- Barra de color superior -->
          <div :class="['h-1 w-full', clasesBarra[toast.tipo]]" />

          <div class="flex items-start gap-3 px-4 py-3">
            <!-- Icono -->
            <div class="mt-0.5 shrink-0">
              <AlertCircle  v-if="toast.tipo === 'error'"  class="w-5 h-5 text-red-400" />
              <CheckCircle2 v-else-if="toast.tipo === 'exito'" class="w-5 h-5 text-emerald-400" />
              <AlertTriangle v-else class="w-5 h-5 text-yellow-400" />
            </div>

            <!-- Contenido -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold leading-tight">{{ toast.titulo }}</p>
              <p class="text-xs opacity-80 mt-1 leading-snug break-words">{{ toast.descripcion }}</p>
            </div>

            <!-- Cerrar -->
            <button
              @click="eliminar(toast.id)"
              class="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer mt-0.5"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
