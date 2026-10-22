<!--
  ============================================================================
  MODAL DE POLÍTICA DE COOKIES Y ALMACENAMIENTO SEGURO (ModalPoliticaCookies.vue)
  ============================================================================
-->

<script setup lang="ts">
import { X, Cookie, ShieldCheck, Check } from 'lucide-vue-next'
import { useLegal } from '@/Almacenes/useLegal'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const { modalCookiesAbierto, cerrarModales } = useLegal()
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
        v-if="modalCookiesAbierto"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-['Poppins',sans-serif]"
        role="dialog"
        aria-modal="true"
      >
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" @click="cerrarModales" />

        <div class="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 flex flex-col max-h-[85vh]">
          
          <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Cookie class="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white">
                  Política de Cookies y Almacenamiento Seguro
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Uso de tecnologías de sesión y almacenamiento local
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
                1. ¿Qué almacenamiento utilizamos?
              </h4>
              <p>
                HablandoContigo <strong>NO utiliza cookies publicitarias ni de seguimiento de terceros</strong>. Empleamos exclusivamente almacenamiento local esencial (LocalStorage / SessionStorage) para:
              </p>
              <ul class="list-disc pl-5 space-y-1">
                <li>Mantener la sesión administrativa de forma segura.</li>
                <li>Preservar el tema visual seleccionado (Claro / Oscuro).</li>
                <li>Garantizar el temporizador y UUID de anonimato en encuestas.</li>
                <li>Gestionar la vigilancia de inactividad de sesión por seguridad.</li>
              </ul>
            </section>

          </div>

          <div class="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
            <div class="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck class="w-4 h-4 text-amber-500 shrink-0" />
              <span>Sin cookies publicitarias ni rastreo de terceros</span>
            </div>

            <BotonBase
              variante="primario"
              tamano="pequeno"
              @click="cerrarModales"
            >
              <template #iconoIzquierdo>
                <Check class="w-4 h-4" />
              </template>
              Aceptar Almacenamiento
            </BotonBase>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>