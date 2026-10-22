<!--
  ============================================================================
  MODAL DE POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS (ModalPoliticaPrivacidad.vue)
  ============================================================================
-->

<script setup lang="ts">
import { X, Lock, ShieldCheck, Check } from 'lucide-vue-next'
import { useLegal } from '@/Almacenes/useLegal'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const { modalPrivacidadAbierto, versionPrivacidad, cerrarModales } = useLegal()
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
        v-if="modalPrivacidadAbierto"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-['Poppins',sans-serif]"
        role="dialog"
        aria-modal="true"
      >
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" @click="cerrarModales" />

        <div class="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 flex flex-col max-h-[85vh]">
          
          <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Lock class="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-black text-slate-900 dark:text-white">
                    Política de Privacidad y Tratamiento de Datos
                  </h3>
                  <span class="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">
                    {{ versionPrivacidad }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Marco RGPD &bull; Ley de Protección de Datos Personales / Habeas Data
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
                1. Responsable del Tratamiento
              </h4>
              <p>
                HablandoContigo actúa como encargado y custodio de la información de clima y salud laboral recolectada para la organización contratante, garantizando el aislamiento de datos y estrictas barreras de confidencialidad.
              </p>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm">
                2. Finalidad del Tratamiento
              </h4>
              <p>
                Los datos anonimizados se recopilan exclusivamente para:
              </p>
              <ul class="list-disc pl-5 space-y-1">
                <li>Diagnosticar el clima y satisfacción laboral en los equipos de trabajo.</li>
                <li>Identificar y mitigar factores de riesgo psicosocial, burnout y acoso.</li>
                <li>Diseñar programas de bienestar, ergonomía y salud ocupacional.</li>
              </ul>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm">
                3. Principio de Minimización y Anonimización
              </h4>
              <p>
                La plataforma no solicita nombres, números de identificación ni datos sensibles en las encuestas rutinarias. Toda la trazabilidad se efectúa a través de identificadores de sesión anonimizados (UUID) que no permiten la reidentificación inversa.
              </p>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm">
                4. Derechos ARCO del Titular
              </h4>
              <p>
                Cualquier usuario o colaborador puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición remitiendo una solicitud a través de los canales de soporte autorizados o mediante la mesa de ayuda institucional.
              </p>
            </section>

          </div>

          <div class="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
            <div class="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Conforme a RGPD y Normativa de Protección de Datos</span>
            </div>

            <BotonBase
              variante="primario"
              tamano="pequeno"
              @click="cerrarModales"
            >
              <template #iconoIzquierdo>
                <Check class="w-4 h-4" />
              </template>
              Entendido
            </BotonBase>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>