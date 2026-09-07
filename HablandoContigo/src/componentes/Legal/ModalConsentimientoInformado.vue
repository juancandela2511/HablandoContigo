<!--
  ============================================================================
  MODAL DE CONSENTIMIENTO INFORMADO PSICOSOCIAL (ModalConsentimientoInformado.vue)
  ============================================================================
-->

<script setup lang="ts">
import { X, HeartHandshake, ShieldCheck, Check } from 'lucide-vue-next'
import { useLegal } from '@/Almacenes/useLegal'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const { modalConsentimientoAbierto, versionConsentimiento, cerrarModales } = useLegal()
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
        v-if="modalConsentimientoAbierto"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-['Poppins',sans-serif]"
        role="dialog"
        aria-modal="true"
      >
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" @click="cerrarModales" />

        <div class="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 flex flex-col max-h-[85vh]">
          
          <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <HeartHandshake class="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-black text-slate-900 dark:text-white">
                    Consentimiento Informado para Evaluación Psicosocial
                  </h3>
                  <span class="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold">
                    {{ versionConsentimiento }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Participación Voluntaria y Confidencial en Diagnósticos de Clima Laboral
                </p>
              </div>
            </div>

            <button
              @click="cerrarModales"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-left">
            
            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm">
                Declaración de Voluntariedad y Confidencialidad
              </h4>
              <p>
                Al participar en esta evaluación, manifiestas que lo haces de manera libre, informada y voluntaria. Se te garantiza que tus respuestas serán tratadas de manera agregada y estadística, sin ninguna consecuencia perjudicial ni represalia laboral.
              </p>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm">
                Compromiso de No Represalias
              </h4>
              <p>
                La organización suscribe un protocolo estricto de cero represalias por las opiniones, valoraciones o comentarios expresados en los cuestionarios de clima y bienestar.
              </p>
            </section>

          </div>

          <div class="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
            <div class="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck class="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Garantía de Cero Represalias y Confidencialidad</span>
            </div>

            <BotonBase
              variante="primario"
              tamano="pequeno"
              @click="cerrarModales"
            >
              <template #iconoIzquierdo>
                <Check class="w-4 h-4" />
              </template>
              Acepto los Términos
            </BotonBase>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>