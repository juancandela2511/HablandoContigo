<!--
  ============================================================================
  COMPONENTE GENERADOR PASO 1: PROMPT O REFINAMIENTO DE ENCUESTA BASE
  (ProyectosCreadorPasoPrompt.vue - MÓDULO 2)
  ============================================================================
  - Selección libre de área, audiencia o público objetivo.
  - Pestañas duales:
    1. Generar nueva encuesta con IA desde prompt libre.
    2. Refinar y optimizar encuesta base redactada por el usuario (cero sesgo, neutralidad y tipos lógicos).
  - Selector de extensión del cuestionario.
  - Botón de procesamiento inteligente con Gemini.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Layers, Users, Sliders, CheckCircle2, FileText, Wand2 } from 'lucide-vue-next'

const props = defineProps<{
  departamentoSeleccionado: string
  promptContexto: string
  generacionEnProgreso: boolean
  sugerenciasPrompt: string[]
  extensionSeleccionada?: 'rapida' | 'estandar' | 'extensa'
  modoCreacion?: 'prompt' | 'refinar_base'
}>()

const emit = defineEmits<{
  (e: 'update:departamentoSeleccionado', valor: string): void
  (e: 'update:promptContexto', valor: string): void
  (e: 'update:extensionSeleccionada', valor: 'rapida' | 'estandar' | 'extensa'): void
  (e: 'update:modoCreacion', valor: 'prompt' | 'refinar_base'): void
  (e: 'aplicarSugerencia', sugerencia: string): void
  (e: 'iniciarGeneracion'): void
  (e: 'crearManual'): void
}>()

const extension = ref<'rapida' | 'estandar' | 'extensa'>(props.extensionSeleccionada || 'estandar')
const modo = ref<'prompt' | 'refinar_base'>(props.modoCreacion || 'prompt')

const cambiarExtension = (nueva: 'rapida' | 'estandar' | 'extensa') => {
  extension.value = nueva
  emit('update:extensionSeleccionada', nueva)
}

const cambiarModo = (nuevoModo: 'prompt' | 'refinar_base') => {
  modo.value = nuevoModo
  emit('update:modoCreacion', nuevoModo)
}
</script>

<template>
  <div class="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-6 sm:p-9 shadow-2xl space-y-6 backdrop-blur-xl font-['Poppins',sans-serif]">
    
    <div class="space-y-2 text-left">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-sky-400 text-xs font-semibold">
        <Sparkles class="w-3.5 h-3.5" />
        <span>PASO 1: DISEÑO Y CREACIÓN DE LA ENCUESTA</span>
      </div>

      <!-- Selector de Modo de Creación: IA / Refinar / Manual -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <button
          type="button"
          @click="cambiarModo('prompt')"
          :class="[
            'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3',
            modo === 'prompt'
              ? 'bg-blue-50 dark:bg-blue-950/60 border-sky-500 text-sky-950 dark:text-white font-bold shadow-md'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
          ]"
        >
          <div class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Wand2 class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold">1. Estructurar con IA</div>
            <div class="text-[11px] opacity-75 font-normal">Mándale el tema o la encuesta y la IA la estructura completa</div>
          </div>
        </button>

        <button
          type="button"
          @click="cambiarModo('refinar_base')"
          :class="[
            'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3',
            modo === 'refinar_base'
              ? 'bg-blue-50 dark:bg-blue-950/60 border-sky-500 text-sky-950 dark:text-white font-bold shadow-md'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
          ]"
        >
          <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <FileText class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold">2. Refinar Borrador</div>
            <div class="text-[11px] opacity-75 font-normal">Calibra preguntas para eliminar sesgos y ordenar lógica</div>
          </div>
        </button>

        <button
          type="button"
          @click="emit('crearManual')"
          class="p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 hover:border-amber-500 hover:shadow-md"
        >
          <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Layers class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold">3. Crear Manualmente</div>
            <div class="text-[11px] opacity-75 font-normal">Escribe el título, agrega tus preguntas y escalas desde cero</div>
          </div>
        </button>
      </div>

      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-1">
        {{ modo === 'refinar_base' 
          ? 'Pega tu borrador de preguntas. Gemini eliminará ambigüedades, garantizará neutralidad psicométrica y estructurará tipos de respuestas lógicos con ramificación condicional.'
          : 'Personaliza la audiencia, la cantidad de preguntas y el tema libremente para que la IA diseñe el cuestionario a tu medida.' 
        }}
      </p>
    </div>

    <!-- 1. Audiencia / Departamento Libre y Extensión -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      
      <!-- Audiencia / Área Libre -->
      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Users class="w-3.5 h-3.5 text-sky-500" />
          <span>Público / Área o Departamento Destino</span>
        </label>
        <input
          :value="departamentoSeleccionado"
          @input="$emit('update:departamentoSeleccionado', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Ej. Toda la empresa, Contact Center, Líderes, Tecnología..."
          class="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 font-medium"
        />
      </div>

      <!-- Selector de Extensión de la Encuesta -->
      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Layers class="w-3.5 h-3.5 text-sky-500" />
          <span>Extensión del Cuestionario</span>
        </label>
        <div class="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            @click="cambiarExtension('rapida')"
            :class="[
              'p-2.5 rounded-2xl border text-center transition-all cursor-pointer',
              extension === 'rapida'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-sky-500 text-sky-900 dark:text-white font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            ]"
          >
            <span class="block text-xs">⚡ Rápida</span>
            <span class="text-[10px] opacity-75">4 - 6 pregs</span>
          </button>

          <button
            type="button"
            @click="cambiarExtension('estandar')"
            :class="[
              'p-2.5 rounded-2xl border text-center transition-all cursor-pointer',
              extension === 'estandar'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-sky-500 text-sky-900 dark:text-white font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            ]"
          >
            <span class="block text-xs">📋 Estándar</span>
            <span class="text-[10px] opacity-75">8 - 10 pregs</span>
          </button>

          <button
            type="button"
            @click="cambiarExtension('extensa')"
            :class="[
              'p-2.5 rounded-2xl border text-center transition-all cursor-pointer',
              extension === 'extensa'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-sky-500 text-sky-900 dark:text-white font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            ]"
          >
            <span class="block text-xs">📚 Extensa</span>
            <span class="text-[10px] opacity-75">12 - 20 pregs</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Textarea de Prompt / Entrada de Encuesta Base -->
    <div class="space-y-1.5 text-left">
      <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
        <span>{{ modo === 'refinar_base' ? 'Pega tu Encuesta Base redactada para optimización psicométrica:' : '¿Qué temas o aspectos específicos deseas evaluar?' }}</span>
        <span class="text-[11px] text-sky-600 dark:text-sky-400 font-mono">{{ modo === 'refinar_base' ? 'Gemini 2.5/3.8 Refiner' : 'Gemini Prompt' }}</span>
      </label>
      <textarea
        :value="promptContexto"
        @input="$emit('update:promptContexto', ($event.target as HTMLTextAreaElement).value)"
        rows="5"
        :placeholder="modo === 'refinar_base' 
          ? 'Pega aquí tus preguntas en borrador. Ejemplo:\n1. ¿Qué tal te la llevas con tu jefe?\n2. ¿Sientes que tus líderes te escuchan?\n3. ¿Has presenciado comentarios humillantes o acoso?\n4. ¿Tu carga de trabajo es excesiva?\n5. ¿Qué falencias encuentras en tu día a día?'
          : 'Ej. Deseo una encuesta para evaluar la relación con supervisores directos, detectar acoso laboral temprano, medir sobrecarga en horas pico y consultar de forma abierta cómo se siente el colaborador anímicamente...'"
        class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-all resize-none"
      ></textarea>
    </div>

    <!-- Sugerencias Rápidas -->
    <div class="space-y-2 text-left">
      <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {{ modo === 'refinar_base' ? 'Borradores de ejemplo para probar el refinamiento:' : 'Ideas frecuentes de diagnóstico:' }}
      </span>
      <div class="flex flex-col gap-2">
        <button
          v-for="(sugerencia, idx) in sugerenciasPrompt"
          :key="idx"
          type="button"
          @click="$emit('aplicarSugerencia', sugerencia)"
          class="text-left text-xs p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-950/70 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          💡 {{ sugerencia }}
        </button>
      </div>
    </div>

    <!-- Botón de Generación / Refinamiento -->
    <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
      <button
        @click="$emit('iniciarGeneracion')"
        :disabled="generacionEnProgreso"
        class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-blue-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        <Sparkles class="w-4 h-4 text-white" :class="generacionEnProgreso ? 'animate-spin' : 'animate-pulse'" />
        <span>
          {{ generacionEnProgreso 
            ? (modo === 'refinar_base' ? 'Optimizando Encuesta Base con Gemini...' : 'Diseñando Encuesta con IA...') 
            : (modo === 'refinar_base' ? 'Refinar y Optimizar con Gemini AI' : 'Generar Cuestionario con IA') 
          }}
        </span>
      </button>
    </div>

  </div>
</template>
