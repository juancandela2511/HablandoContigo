<!--
  ============================================================================
  MODAL DE INACTIVIDAD (ModalInactividad.vue)
  ============================================================================

  Aparece cuando el usuario lleva TIEMPO_INACTIVIDAD_MS sin interactuar.
  Muestra una cuenta regresiva y dos opciones:
    - "Continuar sesión" → resetea el timer
    - "Cerrar sesión"   → llama cerrarSesionPorInactividad()
  Si la cuenta llega a 0 sin respuesta, cierra sesión automáticamente.

  Vinculado con: useSesionSegura.ts, App.vue
-->

<script setup lang="ts">
import { computed } from 'vue'
import { Shield, LogOut, RefreshCw, Clock } from 'lucide-vue-next'
import { useSesionSegura } from '@/Almacenes/useSesionSegura'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const {
  mostrarModalInactividad,
  segundosRestantes,
  continuarSesion,
  cerrarSesionPorInactividad
} = useSesionSegura()

/** Clase de color de la barra de progreso según los segundos restantes */
const claseBarraProgreso = computed(() => {
  if (segundosRestantes.value > 30) return 'bg-amber-400'
  if (segundosRestantes.value > 10) return 'bg-orange-500'
  return 'bg-red-500 animate-pulse'
})

/** Ancho de la barra de progreso (0% = sin tiempo, 100% = tiempo completo) */
const anchoBarraProgreso = computed(() => {
  return `${(segundosRestantes.value / 60) * 100}%`
})

/** Texto formateado del tiempo restante */
const textoTiempo = computed(() => {
  const s = segundosRestantes.value
  return s === 1 ? '1 segundo' : `${s} segundos`
})
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
        v-if="mostrarModalInactividad"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-inactividad-titulo"
      >
        <!-- Backdrop borroso -->
        <div class="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

        <!-- Tarjeta del modal -->
        <div class="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

          <!-- Barra de progreso superior -->
          <div class="h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
            <div
              class="h-full transition-all duration-1000 ease-linear rounded-full"
              :class="claseBarraProgreso"
              :style="{ width: anchoBarraProgreso }"
            />
          </div>

          <div class="p-8 space-y-6">
            <!-- Icono y encabezado -->
            <div class="flex flex-col items-center text-center space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                <Shield class="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>

              <div>
                <h2
                  id="modal-inactividad-titulo"
                  class="text-xl font-black text-slate-900 dark:text-white"
                >
                  ¿Sigues ahí?
                </h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Tu sesión está a punto de cerrarse por inactividad
                </p>
              </div>
            </div>

            <!-- Cuenta regresiva -->
            <div class="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <Clock
                class="w-5 h-5 shrink-0"
                :class="segundosRestantes <= 10 ? 'text-red-500 animate-pulse' : 'text-amber-500'"
              />
              <p class="text-sm text-slate-700 dark:text-slate-300">
                La sesión se cerrará en
                <strong
                  class="font-black tabular-nums"
                  :class="segundosRestantes <= 10 ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-300'"
                >
                  {{ textoTiempo }}
                </strong>
              </p>
            </div>

            <!-- Botones de acción -->
            <div class="flex flex-col sm:flex-row gap-3">
              <BotonBase
                variante="primario"
                tamano="mediano"
                class="flex-1"
                @click="continuarSesion"
              >
                <template #iconoIzquierdo>
                  <RefreshCw class="w-4 h-4" />
                </template>
                Continuar sesión
              </BotonBase>

              <BotonBase
                variante="peligro"
                tamano="mediano"
                class="flex-1"
                @click="cerrarSesionPorInactividad"
              >
                <template #iconoIzquierdo>
                  <LogOut class="w-4 h-4" />
                </template>
                Cerrar sesión
              </BotonBase>
            </div>

            <p class="text-center text-[11px] text-slate-400">
              Mueve el mouse o presiona cualquier tecla para continuar automáticamente
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

