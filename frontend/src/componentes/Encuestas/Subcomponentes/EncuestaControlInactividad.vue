<!--
  ============================================================================
  SUBCOMPONENTE CONTROL DE INACTIVIDAD (EncuestaControlInactividad.vue)
  ============================================================================
  Maneja el modal de advertencia por inactividad ("¡Ey, presta atención!")
  para reenganchar al colaborador durante el diligenciamiento de la encuesta.
-->

<script setup lang="ts">
import { AlertCircle, Hand } from 'lucide-vue-next'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

defineProps<{
  modalAbierto: boolean
  segundosSinActividad: number
}>()

const emit = defineEmits<{
  (e: 'reanudar'): void
}>()
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
        v-if="modalAbierto"
        class="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-['Poppins',sans-serif]"
      >
        <!-- Overlay oscuro -->
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="emit('reanudar')" />

        <!-- Modal Content -->
        <div class="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/50 shadow-2xl p-6 text-center space-y-5 animate-pulse">
          <div class="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle class="w-8 h-8 animate-bounce" />
          </div>

          <div class="space-y-2">
            <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Hand class="w-5 h-5 text-amber-500" />
              <span>¡Ey, presta atención!</span>
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Detectamos <strong class="text-amber-500 font-mono">{{ segundosSinActividad }} segundos</strong> de inactividad. Tu opinión es fundamental para la organización. Por favor continúa respondiendo.
            </p>
          </div>

          <BotonBase
            variante="primario"
            anchoCompleto
            @click="emit('reanudar')"
          >
            Entendido, continuar encuesta
          </BotonBase>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
