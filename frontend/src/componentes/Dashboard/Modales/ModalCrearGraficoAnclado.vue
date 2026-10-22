<!--
  ============================================================================
  MODAL CREAR GRÁFICO ANCLADO (ModalCrearGraficoAnclado.vue)
  ============================================================================
  Permite vincular cualquier pregunta a un Gráfico de Barras o de Pastel.
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, PieChart, BarChart3, CheckCircle2 } from 'lucide-vue-next'
import type { PreguntaEncuesta } from '@/ia'
import {
  type TipoGraficoAnclado,
  type GraficoAnclado,
  useAnclajeGraficos
} from '@/Almacenes/useAnclajeGraficos'
import { useToast } from '@/Almacenes/useToast'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const props = defineProps<{
  abierto: boolean
  preguntasDisponibles: PreguntaEncuesta[]
  idEncuestaActual?: string
  preguntaInicialId?: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'anclar', grafico: Omit<GraficoAnclado, 'id'>): void
}>()

const { mostrarAdvertencia } = useToast()
const { graficosAnclados } = useAnclajeGraficos()

const preguntasSoloOpciones = computed(() => {
  return props.preguntasDisponibles.filter(p => p.tipo === 'multiple' || p.tipo === 'si_no' || p.tipo === 'escala' || p.tipo === 'texto')
})

const idPreguntaSeleccionada = ref('')
const tipoGrafico = ref<TipoGraficoAnclado>('barras')
const tituloPersonalizado = ref('')

const opcionesGraficos: Array<{ id: TipoGraficoAnclado; titulo: string; descripcion: string; icono: any }> = [
  {
    id: 'barras',
    titulo: 'Gráfico de Barras',
    descripcion: 'Comparación horizontal clara con porcentajes y cantidad de votos por opción.',
    icono: BarChart3
  },
  {
    id: 'pastel',
    titulo: 'Gráfico de Pastel (Circular)',
    descripcion: 'Proporciones circulares con porcentajes y leyenda de colores interactiva.',
    icono: PieChart
  }
]

const preguntaSeleccionadaObj = computed(() => {
  return preguntasSoloOpciones.value.find(p => p.id === idPreguntaSeleccionada.value) || null
})

watch(
  () => props.abierto,
  (val) => {
    if (val) {
      if (props.preguntaInicialId && preguntasSoloOpciones.value.some(p => p.id === props.preguntaInicialId)) {
        idPreguntaSeleccionada.value = props.preguntaInicialId
      } else if (preguntasSoloOpciones.value.length > 0) {
        idPreguntaSeleccionada.value = preguntasSoloOpciones.value[0]?.id || ''
      }
      actualizarTituloPorDefecto()
    }
  }
)

watch(idPreguntaSeleccionada, () => {
  actualizarTituloPorDefecto()
})

const actualizarTituloPorDefecto = () => {
  if (preguntaSeleccionadaObj.value) {
    const texto = preguntaSeleccionadaObj.value.texto
    tituloPersonalizado.value = `Estadística: ${texto.substring(0, 45)}${texto.length > 45 ? '...' : ''}`
  }
}

const manejarAnclar = () => {
  if (!idPreguntaSeleccionada.value || !preguntaSeleccionadaObj.value) {
    mostrarAdvertencia('Pregunta requerida', 'Debes seleccionar una pregunta para crear su gráfica.')
    return
  }

  emit('anclar', {
    idEncuesta: props.idEncuestaActual,
    idPregunta: preguntaSeleccionadaObj.value.id,
    textoPregunta: preguntaSeleccionadaObj.value.texto,
    titulo: tituloPersonalizado.value.trim() || `Estadística: ${preguntaSeleccionadaObj.value.texto.substring(0, 45)}`,
    tipoGrafico: tipoGrafico.value,
    descripcion: `Gráfico configurado para la pregunta "${preguntaSeleccionadaObj.value.texto.substring(0, 40)}...".`
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="abierto" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-['Poppins',sans-serif]">
        <div class="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" @click="emit('cerrar')" />

        <div class="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <!-- Encabezado Modal -->
          <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-t-3xl text-white">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <BarChart3 class="w-5 h-5 text-white" />
              </div>
              <div class="text-left">
                <h3 class="text-base font-extrabold leading-tight">Anclar Gráfico al Dashboard</h3>
                <p class="text-xs text-sky-100">Selecciona la pregunta y el tipo de gráfico (Barras o Pastel)</p>
              </div>
            </div>
            <button @click="emit('cerrar')" class="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
              <X class="w-4 h-4 text-white" />
            </button>
          </div>

          <!-- Formulario -->
          <div class="px-6 pb-6 space-y-5 text-left">
            <!-- 1. Selección de Pregunta -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Pregunta a Graficar
              </label>
              <select
                v-model="idPreguntaSeleccionada"
                class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option v-for="p in preguntasSoloOpciones" :key="p.id" :value="p.id">
                  {{ p.texto }} ({{ p.tipo === 'texto' ? 'Respuesta Abierta - Agrupación IA' : p.categoria }})
                </option>
              </select>
            </div>

            <!-- 2. Selección de Tipo de Gráfico (Solo Barras o Pastel) -->
            <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PieChart class="w-3.5 h-3.5 text-sky-500" />
                <span>2. Tipo de Gráfico</span>
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  v-for="opc in opcionesGraficos"
                  :key="opc.id"
                  type="button"
                  @click="tipoGrafico = opc.id"
                  :class="[
                    'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3',
                    tipoGrafico === opc.id 
                      ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 ring-2 ring-sky-500/30 shadow-md' 
                      : 'bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-sky-300'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <component :is="opc.icono" class="w-6 h-6 text-sky-500" />
                    <CheckCircle2 v-if="tipoGrafico === opc.id" class="w-4 h-4 text-sky-500" />
                  </div>
                  <div>
                    <h4 class="text-xs font-extrabold text-slate-900 dark:text-white">{{ opc.titulo }}</h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ opc.descripcion }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- 3. Título personalizado -->
            <div class="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                3. Título en el Dashboard
              </label>
              <input
                v-model="tituloPersonalizado"
                type="text"
                class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                placeholder="Título del gráfico..."
              />
            </div>

            <!-- Botones -->
            <div class="flex items-center justify-end gap-3 pt-3">
              <BotonBase variante="secundario" tamano="mediano" @click="emit('cerrar')">
                <span>Cancelar</span>
              </BotonBase>
              <BotonBase variante="primario" tamano="mediano" @click="manejarAnclar">
                <template #iconoIzquierdo><BarChart3 class="w-4 h-4" /></template>
                <span>Anclar Gráfico</span>
              </BotonBase>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
