<!--
  ============================================================================
  MODAL PARA ANCLAR NUEVO GRÁFICO AL DASHBOARD (ModalCrearGraficoAnclado.vue)
  ============================================================================
  Orquesta el catálogo infográfico con subcomponentes para selección de pregunta,
  modo de cálculo y visualización gráfica.
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, PieChart, BarChart3, CheckCircle2 } from 'lucide-vue-next'
import type { PreguntaEncuesta } from '@/Servicios/iaEncuestasService'
import {
  LISTA_TIPOS_GRAFICOS_INFOGRAFIA,
  type TipoAnalisis,
  type TipoGrafico,
  type GraficoAnclado,
  type CategoriaInfografiaGrafico,
  useGraficosAnclados
} from '@/Almacenes/useGraficosAnclados'
import { useToast } from '@/Almacenes/useToast'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import SeleccionPreguntaModoCalculo from './CrearGraficoSubcomponentes/SeleccionPreguntaModoCalculo.vue'

const props = defineProps<{
  abierto: boolean
  preguntasDisponibles: PreguntaEncuesta[]
  idEncuestaActual?: string
  preguntaInicialId?: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'anclar', grafico: Omit<GraficoAnclado, 'id' | 'fechaCreacion'>): void
}>()

const { mostrarAdvertencia } = useToast()
const { graficosAnclados } = useGraficosAnclados()

const preguntasSoloOpciones = computed(() => {
  return props.preguntasDisponibles.filter(p => p.tipo === 'multiple' || p.tipo === 'si_no' || p.tipo === 'escala')
})

const idPreguntaSeleccionada = ref('')
const tipoAnalisis = ref<TipoAnalisis>('distribucion_opciones')
const tipoGrafico = ref<TipoGrafico>('dona')
const categoriaSeleccionada = ref<CategoriaInfografiaGrafico | 'Todas'>('Todas')
const tituloPersonalizado = ref('')

const preguntaSeleccionadaObj = computed(() => {
  return preguntasSoloOpciones.value.find(p => p.id === idPreguntaSeleccionada.value) || null
})

const tiposGraficosExistentes = computed(() => {
  return new Set(graficosAnclados.value.map(g => g.tipoGrafico))
})

const tipoGraficoSeleccionadoExiste = computed(() => {
  return tiposGraficosExistentes.value.has(tipoGrafico.value)
})

const infoGraficoSeleccionado = computed(() => {
  return LISTA_TIPOS_GRAFICOS_INFOGRAFIA.find(g => g.id === tipoGrafico.value)
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
    const textoBase = preguntaSeleccionadaObj.value.texto || ''
    const primeraParte = textoBase.replace(/^(Pregunta \d+ — |¿|\?)/g, '').split('?')[0] || ''
    const textoCorto = primeraParte.trim()
    tituloPersonalizado.value = `Estadística: ${textoCorto.substring(0, 50)}`
  }
}

const categoriasInfografiaList: Array<CategoriaInfografiaGrafico | 'Todas'> = [
  'Todas', 'Desviación', 'Correlación', 'Clasificación', 'Distribución', 'Cambios en el tiempo', 'Magnitud', 'Parte de un todo', 'Espacial'
]

const graficosFiltrados = computed(() => {
  if (categoriaSeleccionada.value === 'Todas') {
    return LISTA_TIPOS_GRAFICOS_INFOGRAFIA
  }
  return LISTA_TIPOS_GRAFICOS_INFOGRAFIA.filter(g => g.categoria === categoriaSeleccionada.value)
})

const manejarAnclar = () => {
  if (!preguntaSeleccionadaObj.value) return

  const nombreGrafico = infoGraficoSeleccionado.value?.titulo || 'Radial / Dona'

  if (tipoGraficoSeleccionadoExiste.value) {
    mostrarAdvertencia(
      'Estadística Ya Creada',
      `⚠️ Ya creaste una estadística de tipo "${nombreGrafico}". Solo puedes crear una estadística de cada tipo (1 radial/dona, 1 barras, 1 gauge, etc.). Por favor selecciona otro tipo de gráfico.`
    )
    return
  }

  emit('anclar', {
    idEncuesta: props.idEncuestaActual,
    titulo: tituloPersonalizado.value.trim() || 'Nueva Estadística de Pregunta',
    idPregunta: preguntaSeleccionadaObj.value.id,
    textoPregunta: preguntaSeleccionadaObj.value.texto,
    tipoAnalisis: tipoAnalisis.value,
    tipoGrafico: tipoGrafico.value,
    colorTema: '#0284c7'
  })
  emit('cerrar')
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="abierto" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-['Poppins',sans-serif]">
        <div class="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" @click="emit('cerrar')" />

        <div class="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <!-- Encabezado Modal -->
          <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-t-3xl text-white">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <BarChart3 class="w-5 h-5 text-white" />
              </div>
              <div class="text-left">
                <h3 class="text-base font-extrabold leading-tight">Crear Estadística de Pregunta</h3>
                <p class="text-xs text-sky-100">Catálogo Infográfico de Visualización de Datos (Guía FT / FEMP)</p>
              </div>
            </div>
            <button @click="emit('cerrar')" class="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
              <X class="w-4 h-4 text-white" />
            </button>
          </div>

          <!-- Formulario Modular -->
          <div class="px-6 pb-6 space-y-5 text-left">
            <!-- Subcomponente: Paso 1 y 2 (Pregunta y Modo) -->
            <SeleccionPreguntaModoCalculo
              v-model:idPreguntaSeleccionada="idPreguntaSeleccionada"
              v-model:tipoAnalisis="tipoAnalisis"
              :preguntasSoloOpciones="preguntasSoloOpciones"
            />

            <!-- PASO 3: CATÁLOGO DE IMÁGENES Y REPRESENTACIONES GRÁFICAS -->
            <div class="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PieChart class="w-3.5 h-3.5 text-sky-500" />
                  <span>3. Tipo de Gráfico (Representación Ilustrada)</span>
                </label>
                <span class="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold">
                  {{ graficosFiltrados.length }} visualizaciones disponibles
                </span>
              </div>

              <!-- Filtro por Categorías -->
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="cat in categoriasInfografiaList"
                  :key="cat"
                  type="button"
                  @click="categoriaSeleccionada = cat"
                  :class="[
                    'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
                    categoriaSeleccionada === cat ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  ]"
                >
                  {{ cat }}
                </button>
              </div>

              <!-- Grilla de Tarjetas Infográficas -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                <button
                  v-for="g in graficosFiltrados"
                  :key="g.id"
                  type="button"
                  @click="tipoGrafico = g.id"
                  :class="[
                    'p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 group',
                    tipoGrafico === g.id ? 'bg-sky-50/80 dark:bg-sky-950/50 border-sky-500 ring-2 ring-sky-500/30 shadow-md' : 'bg-slate-50/50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700'
                  ]"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-[9px] font-mono font-extrabold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                      {{ g.categoria }}
                    </span>
                    <CheckCircle2 v-if="tipoGrafico === g.id" class="w-4 h-4 text-sky-500 shrink-0" />
                  </div>
                  <div class="space-y-0.5">
                    <h4 class="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">{{ g.titulo }}</h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">{{ g.descripcion }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- PASO 4: PERSONALIZACIÓN DEL TÍTULO -->
            <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Título de la Estadística en el Dashboard</label>
              <input v-model="tituloPersonalizado" type="text" class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500" placeholder="Ej: Estadística..." />
            </div>

            <!-- Botones de Acción -->
            <div class="flex items-center justify-end gap-3 pt-3">
              <BotonBase variante="secundario" tamano="mediano" @click="emit('cerrar')">
                <span>Cancelar</span>
              </BotonBase>
              <BotonBase variante="primario" tamano="mediano" @click="manejarAnclar">
                <template #iconoIzquierdo><BarChart3 class="w-4 h-4" /></template>
                <span>Crear Estadística de Pregunta</span>
              </BotonBase>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
