<!--
  ============================================================================
  PANTALLA DE CONSENTIMIENTO INFORMADO PREVIO A ENCUESTAS (PantallaConsentimientoEncuesta.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref } from 'vue'
import {
  ShieldCheck,
  Lock,
  HeartHandshake,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-vue-next'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import { useLegal } from '@/Almacenes/useLegal'

const props = defineProps<{
  tituloEncuesta: string
  departamento?: string
  duracionEstimadaMinutos?: number
}>()

const emit = defineEmits<{
  (e: 'consentimientoOtorgado'): void
}>()

const { abrirTerminos, abrirPrivacidad } = useLegal()
const aceptaAnonimato = ref(false)
const aceptaTratamiento = ref(false)
const comprendeVoluntariedad = ref(false)

const todoAceptado = ref(false)

const validarYContinuar = () => {
  if (aceptaAnonimato.value && aceptaTratamiento.value && comprendeVoluntariedad.value) {
    emit('consentimientoOtorgado')
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-left font-['Poppins',sans-serif] transition-all">
    
    <!-- Encabezado con Icono -->
    <div class="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
      <div class="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
        <HeartHandshake class="w-7 h-7 stroke-[1.8]" />
      </div>
      <div>
        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
          Paso 1 de 2 &bull; Consentimiento Legal & Confidencialidad
        </span>
        <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
          {{ tituloEncuesta }}
        </h2>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          Área / Alcance: {{ departamento || 'General' }} &bull; Tiempo: ~{{ duracionEstimadaMinutos || 3 }} min
        </span>
      </div>
    </div>

    <!-- Garantías Fundamentales -->
    <div class="space-y-3">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Garantías Legales del Colaborador
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
            <Lock class="w-4 h-4" />
            <span>Anonimato Total UUID</span>
          </div>
          <p class="text-[11px] text-slate-500 leading-snug">
            Tus respuestas se identifican únicamente con un identificador digital cifrado sin vincular tu nombre.
          </p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck class="w-4 h-4" />
            <span>Cero Represalias</span>
          </div>
          <p class="text-[11px] text-slate-500 leading-snug">
            Tus respuestas son estrictamente confidenciales con fines de bienestar y salud laboral.
          </p>
        </div>
      </div>
    </div>

    <!-- Checkboxes de Consentimiento Obligatorio -->
    <div class="space-y-3 pt-2">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Declaración de Consentimiento Requerida
      </h3>

      <div class="space-y-2.5">
        
        <label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all select-none">
          <input
            type="checkbox"
            v-model="aceptaAnonimato"
            class="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0 cursor-pointer"
          />
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Entiendo que esta evaluación es <strong>confidencial y anónima</strong> y que mis respuestas serán analizadas de forma estadística y agrupada.
          </span>
        </label>

        <label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all select-none">
          <input
            type="checkbox"
            v-model="aceptaTratamiento"
            class="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0 cursor-pointer"
          />
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Acepto los <button type="button" @click.prevent="abrirTerminos" class="text-sky-600 dark:text-sky-400 underline font-bold hover:text-sky-500">Términos de Servicio</button> y la <button type="button" @click.prevent="abrirPrivacidad" class="text-sky-600 dark:text-sky-400 underline font-bold hover:text-sky-500">Política de Privacidad</button> (RGPD / Habeas Data).
          </span>
        </label>

        <label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all select-none">
          <input
            type="checkbox"
            v-model="comprendeVoluntariedad"
            class="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0 cursor-pointer"
          />
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Confirmo mi <strong>participación voluntaria</strong> con el fin de contribuir a la mejora del clima y bienestar laboral.
          </span>
        </label>

      </div>
    </div>

    <!-- Botón de Continuar -->
    <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span class="text-[11px] text-slate-400">
        Debes marcar los 3 consentimientos para iniciar
      </span>

      <BotonBase
        variante="primario"
        tamano="grande"
        :deshabilitado="!aceptaAnonimato || !aceptaTratamiento || !comprendeVoluntariedad"
        @click="validarYContinuar"
      >
        <template #iconoDerecho>
          <ArrowRight class="w-4 h-4" />
        </template>
        Comenzar Encuesta
      </BotonBase>
    </div>

  </div>
</template>