<script setup lang="ts">
import { ref } from 'vue'
import { PlusCircle, X, Sparkles, FolderPlus, Building2 } from 'lucide-vue-next'
import { useEncuestas, type Encuesta } from '@/Almacenes/useEncuestas'
import { obtenerEscalaEstandarDetallada } from '@/ia'

const props = defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'proyectoCreado', nuevo: Encuesta): void
}>()

const { crearEncuesta } = useEncuestas()

const titulo = ref('')
const descripcion = ref('')
const departamento = ref('Operaciones')
const tipoEstudio = ref<'clima' | 'liderazgo' | 'pulso' | 'riesgo'>('clima')
const guardando = ref(false)

const departamentosDisponibles = [
  'General',
  'Operaciones',
  'Tecnología / IT',
  'Gestión Humana / RRHH',
  'Finanzas & Administración',
  'Comercial & Ventas',
  'Logística y Distribución'
]

const guardarNuevoProyecto = async () => {
  if (!titulo.value.trim()) {
    alert('Por favor ingresa un título para la nueva encuesta / proyecto.')
    return
  }

  guardando.value = true
  try {
    const escala = obtenerEscalaEstandarDetallada('satisfaccion')
    
    // Preguntas base de ejemplo según tipo
    const preguntasIniciales = [
      {
        id: `p-${Date.now()}-1`,
        categoria: 'Satisfacción General',
        texto: `¿Cómo calificas tu experiencia actual en el área de ${departamento.value}?`,
        tipo: 'escala' as const,
        opciones: escala
      },
      {
        id: `p-${Date.now()}-2`,
        categoria: 'Comunicación y Liderazgo',
        texto: '¿Sientes que existe suficiente apoyo y claridad en las metas de este proyecto?',
        tipo: 'escala' as const,
        opciones: escala
      },
      {
        id: `p-${Date.now()}-3`,
        categoria: 'Retroalimentación Abierta',
        texto: 'Comparte cualquier sugerencia, necesidad u oportunidad de mejora para este proyecto:',
        tipo: 'texto' as const,
        opciones: []
      }
    ]

    const nuevo = await crearEncuesta({
      titulo: titulo.value.trim(),
      descripcion: descripcion.value.trim() || `Encuesta de ${tipoEstudio.value} para el equipo de ${departamento.value}.`,
      departamento: departamento.value,
      creadoPor: 'Super Administrador',
      estado: 'Activa',
      preguntas: preguntasIniciales,
      preguntasSeguimiento: []
    })

    titulo.value = ''
    descripcion.value = ''
    if (nuevo) {
      emit('proyectoCreado', nuevo)
    }
    emit('cerrar')
  } catch (e) {
    console.error('Error creando proyecto:', e)
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div
    v-if="abierto"
    class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    @click.self="emit('cerrar')"
  >
    <div class="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden text-left">
      <!-- Glow superior -->
      <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600"></div>

      <!-- Header modal -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FolderPlus class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Crear Nueva Encuesta / Proyecto</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Inicia un nuevo instrumento de medición independiente</p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('cerrar')"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardarNuevoProyecto" class="space-y-4 pt-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Título de la Encuesta / Proyecto *
          </label>
          <input
            v-model="titulo"
            type="text"
            required
            placeholder="Ej: Evaluación de Riesgo Psicosocial Q3 - 2026"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Departamento Destino
            </label>
            <select
              v-model="departamento"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option v-for="dep in departamentosDisponibles" :key="dep" :value="dep">{{ dep }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Modalidad de Estudio
            </label>
            <select
              v-model="tipoEstudio"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="clima">Diagnóstico Clima Integral</option>
              <option value="liderazgo">Liderazgo & Mandos Medios</option>
              <option value="pulso">Encuesta Rápida de Pulso</option>
              <option value="riesgo">Riesgo Psicosocial y Salud</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Descripción y Objetivo
          </label>
          <textarea
            v-model="descripcion"
            rows="3"
            placeholder="Describe el objetivo y alcance de esta medición confidencial..."
            class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          ></textarea>
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="emit('cerrar')"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="guardando"
            class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <PlusCircle class="w-4 h-4" />
            <span>{{ guardando ? 'Guardando...' : 'Crear Proyecto' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
