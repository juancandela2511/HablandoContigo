<!--
  ============================================================================
  RESUMEN DE COMENTARIOS CON IA OLLAMA (ResumenComentariosOllama.vue)
  ============================================================================
  Sintetiza de forma automática con IA Ollama todos los comentarios libres
  dejados por los colaboradores en las preguntas evaluadas.
-->

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Sparkles, MessageSquareQuote, Bot, CheckCircle2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-vue-next'
import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'

const props = defineProps<{
  respuestas?: RegistroRespuesta[]
}>()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const cargandoResumen = ref(false)
const verComentariosCompletos = ref(false)
const datosResumen = ref<{
  resumen: string
  puntosClave: string[]
  totalComentarios: number
  modeloSintesis: string
} | null>(null)

// Extraer únicamente comentarios libres reales y respuestas de preguntas abiertas (nunca opciones múltiples)
const ETIQUETAS_OPCION_MULTIPLE_IGNORAR = new Set([
  'respuesta generada para prueba local.', 'sí', 'si', 'no', 'algunas veces', 'a veces',
  'parcialmente', 'de acuerdo', 'muy bien', 'bien', 'regular', 'mal', 'muy mal', 'excelente',
  'menos de 6 meses', 'de 6 meses a 1 año', 'de 1 a 3 años', 'más de 3 años', 'otro'
])

const comentariosExtraidos = computed(() => {
  const lista: Array<{ texto: string; pregunta?: string; calificacion?: number }> = []
  ;(props.respuestas || []).forEach(r => {
    (r.respuestas || []).forEach(item => {
      const idP = (item.idPregunta || '').toLowerCase()
      const esAbierta = idP.includes('12b') || idP.startsWith('b7-p35') || idP.startsWith('b8-')
      const rawTxt = esAbierta
        ? String(item.respuesta || item.comentario || '').trim()
        : String(item.comentario || '').trim()

      const lower = rawTxt.toLowerCase()
      if (
        rawTxt.length > 4 &&
        !ETIQUETAS_OPCION_MULTIPLE_IGNORAR.has(lower) &&
        !lower.startsWith('sí,') &&
        !lower.startsWith('no,') &&
        !lower.startsWith('pase directamente')
      ) {
        lista.push({
          texto: rawTxt,
          pregunta: item.textoPregunta || 'Pregunta Abierta de Evaluación',
          calificacion: item.valor
        })
      }
    })
  })
  return lista
})

const generarResumenConIA = async () => {
  if (comentariosExtraidos.value.length === 0) {
    datosResumen.value = null
    return
  }

  cargandoResumen.value = true
  try {
    const res = await fetch(`${API_URL}/ia/resumen-comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comentarios: comentariosExtraidos.value })
    })

    if (res.ok) {
      datosResumen.value = await res.json()
    }
  } catch (err) {
    console.warn('[ResumenComentariosOllama] Error al consultar IA:', err)
  } finally {
    cargandoResumen.value = false
  }
}

watch(() => comentariosExtraidos.value.length, () => {
  generarResumenConIA()
}, { immediate: true })

onMounted(() => {
  generarResumenConIA()
})
</script>

<template>
  <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-left font-['Poppins',sans-serif]">
    
    <!-- Encabezado con IA -->
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
          <Bot class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            
         
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Síntesis automática de los comentarios ingresados en preguntas con mejor calificación.
          </p>
        </div>
      </div>

      <div v-if="comentariosExtraidos.length > 0" class="flex items-center gap-2">
        <button
          type="button"
          @click="generarResumenConIA"
          :disabled="cargandoResumen"
          class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          title="Actualizar síntesis con Ollama"
        >
          <RefreshCw :class="['w-3.5 h-3.5', cargandoResumen ? 'animate-spin' : '']" />
        </button>
      </div>
    </div>

    <!-- Caso 1: Cargando con Ollama -->
    <div v-if="cargandoResumen" class="p-8 text-center space-y-3">
      <div class="inline-block w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
        Analizando y sintetizando comentarios con el modelo de lenguaje Ollama...
      </p>
    </div>

    <!-- Caso 2: No hay comentarios registrados aún -->
    <div v-else-if="comentariosExtraidos.length === 0" class="p-8 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
      <div class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
        <MessageSquareQuote class="w-5 h-5" />
      </div>
      <p class="text-xs font-bold text-slate-700 dark:text-slate-300">
        Aún no se registran comentarios en las preguntas
      </p>
      <p class="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        Cuando los colaboradores seleccionen la opción de mejor puntaje y agreguen comentarios, la IA Ollama generará aquí el resumen ejecutivo en tiempo real.
      </p>
    </div>

    <!-- Caso 3: Resumen Generado con Ollama -->
    <div v-else class="space-y-4">
      <!-- Párrafo Resumen Ejecutivo -->
      <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/60 via-indigo-50/30 to-transparent dark:from-purple-950/20 dark:via-slate-900/60 dark:to-transparent border border-purple-200/80 dark:border-purple-900/40 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300 font-mono">
          <span>Síntesis Ejecutiva</span>
     
        </div>
        <p class="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          {{ datosResumen?.resumen }}
        </p>
      </div>

      <!-- Puntos Clave Extraídos -->
      <div v-if="datosResumen?.puntosClave && datosResumen.puntosClave.length > 0" class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Aspectos Destacados por los Colaboradores:
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            v-for="(punto, idx) in datosResumen.puntosClave"
            :key="idx"
            class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
          >
            <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span class="leading-relaxed">{{ punto }}</span>
          </div>
        </div>
      </div>

      <!-- Acordeón para ver los comentarios individuales -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          @click="verComentariosCompletos = !verComentariosCompletos"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
        >
          <span>{{ verComentariosCompletos ? 'Ocultar comentarios individuales' : `Ver ${comentariosExtraidos.length} comentario(s) original(es)` }}</span>
          <ChevronUp v-if="verComentariosCompletos" class="w-3.5 h-3.5" />
          <ChevronDown v-else class="w-3.5 h-3.5" />
        </button>

        <div v-if="verComentariosCompletos" class="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
          <div
            v-for="(com, cIdx) in comentariosExtraidos"
            :key="cIdx"
            class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/70 space-y-1 text-xs"
          >
            <span class="text-[10px] font-bold text-slate-400 uppercase font-mono block">
              {{ com.pregunta }}
            </span>
            <p class="text-slate-800 dark:text-slate-200 italic">
              "{{ com.texto }}"
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
