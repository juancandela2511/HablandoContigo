<!--
  ============================================================================
  DETECTOR Y RECONOCIMIENTO IA DE PERSONAS / LIDERAZGOS (SeccionDetectorPersonasIA.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  UserX,
  BrainCircuit,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  Sparkles,
  UserCheck
} from 'lucide-vue-next'
import {
  detectarPersonasProblemaConIA,
  type PersonaProblemaIdentificada
} from '@/Servicios/iaEncuestasService'

const props = defineProps<{
  respuestas: any[]
}>()

const personasDetectadas = ref<PersonaProblemaIdentificada[]>([])
const cargando = ref(false)
const desplegadoId = ref<string | null>(null)

const procesarDeteccion = async () => {
  cargando.value = true
  try {
    const res = await detectarPersonasProblemaConIA(props.respuestas)
    personasDetectadas.value = res
  } catch (e) {
    console.error('Error detectando personas con IA:', e)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  procesarDeteccion()
})

watch(
  () => props.respuestas.length,
  () => {
    procesarDeteccion()
  }
)

const alternarDesplegar = (id: string) => {
  desplegadoId.value = desplegadoId.value === id ? null : id
}
</script>

<template>
  <div class="space-y-4 text-left font-['Poppins',sans-serif]">
    
    <!-- Encabezado de la Sección de Inteligencia IA -->
    <div class="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
      <!-- Glow decorativo -->
      <div class="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div class="relative z-10 space-y-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 border border-rose-500/30">
            <BrainCircuit class="w-3.5 h-3.5 text-rose-400" />
            Detector Inteligente IA de Personas Mencionadas
          </span>
          <span class="text-xs text-slate-400 font-mono">
            {{ personasDetectadas.length }} liderazgos / supervisores identificados
          </span>
        </div>

        <h3 class="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <UserX class="w-5 h-5 text-rose-400" />
          <span>Reconocimiento de Personas Mencionadas en Evaluación</span>
        </h3>
        <p class="text-xs text-slate-300 max-w-3xl leading-relaxed">
          La Inteligencia Artificial escanea en tiempo real los comentarios cualitativos e inconformidades abiertas, extrayendo nombres propios de supervisores o coordinadores involucrados en situaciones de fricción laboral, acoso o maltrato.
        </p>
      </div>
    </div>

    <!-- Estado de Carga -->
    <div v-if="cargando" class="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
      <BrainCircuit class="w-8 h-8 text-sky-500 animate-spin mx-auto" />
      <p class="text-xs font-semibold text-slate-500">Escaneando menciones de personas en encuestas con IA...</p>
    </div>

    <!-- Estado Vacío si no se detectaron menciones -->
    <div
      v-else-if="personasDetectadas.length === 0"
      class="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
    >
      <UserCheck class="w-10 h-10 text-emerald-500 mx-auto" />
      <h4 class="text-sm font-bold text-slate-800 dark:text-white">Cero menciones de riesgo detectadas</h4>
      <p class="text-xs text-slate-500 max-w-md mx-auto">
        No se han encontrado nombres propios ni reportes de inconformidad sobre supervisores en las respuestas actuales.
      </p>
    </div>

    <!-- Grilla de Tarjetas de Personas Identificadas por la IA -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="persona in personasDetectadas"
        :key="persona.id"
        class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-rose-500/40 transition-all flex flex-col justify-between"
      >
        <!-- Encabezado de la Tarjeta de la Persona -->
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-lg font-mono shrink-0 shadow-xs border border-rose-200 dark:border-rose-900/60">
                {{ persona.nombre.substring(0, 2).toUpperCase() }}
              </div>
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-extrabold text-slate-900 dark:text-white">
                    {{ persona.nombre }}
                  </h4>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider',
                      persona.nivelRiesgo === 'Crítico'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                    ]"
                  >
                    Riesgo {{ persona.nivelRiesgo }}
                  </span>
                </div>
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {{ persona.cargoEstimado }} · <span class="text-sky-600 dark:text-sky-400">{{ persona.departamento }}</span>
                </p>
              </div>
            </div>

            <!-- Badge de Conteo de Menciones -->
            <div class="flex flex-col items-end shrink-0">
              <span class="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-mono font-extrabold border border-rose-200 dark:border-rose-900">
                {{ persona.totalMenciones }} {{ persona.totalMenciones === 1 ? 'mención' : 'menciones' }}
              </span>
            </div>
          </div>

          <!-- Diagnóstico Sintetizado de IA -->
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle class="w-3 h-3" />
              <span>Diagnóstico Síntesis IA</span>
            </span>
            <p class="text-xs text-slate-700 dark:text-slate-300 leading-snug">
              {{ persona.resumenProblemaIA }}
            </p>
          </div>

          <!-- Recomendación Ejecutiva de Acción IA -->
          <div class="p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5" />
              <span>Recomendación de Intervención RRHH</span>
            </span>
            <p class="text-xs text-slate-600 dark:text-slate-300 italic">
              "{{ persona.recomendacionIA }}"
            </p>
          </div>
        </div>

        <!-- Acordeón de Citas Directas / Testimonios Reales de Colaboradores -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="alternarDesplegar(persona.id)"
            class="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            <span class="flex items-center gap-1.5">
              <MessageSquare class="w-3.5 h-3.5 text-slate-400" />
              <span>Ver {{ persona.citasDirectas.length }} testimonios anónimos capturados</span>
            </span>
            <ChevronDown :class="['w-4 h-4 transition-transform duration-200', desplegadoId === persona.id ? 'rotate-180' : '']" />
          </button>

          <!-- Desplegable con Testimonios Reales -->
          <div v-if="desplegadoId === persona.id" class="mt-2 space-y-2">
            <div
              v-for="(cita, idx) in persona.citasDirectas"
              :key="idx"
              class="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-950 text-xs italic text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800"
            >
              "{{ cita }}"
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>
