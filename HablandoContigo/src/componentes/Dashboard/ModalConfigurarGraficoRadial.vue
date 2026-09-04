<!--
  ============================================================================
  COMPONENTE MODAL CONFIGURADOR DEL GRÁFICO RADIAL (ModalConfigurarGraficoRadial.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Permite al usuario crear, editar, asociar y eliminar inclinaciones/ejes del radar
  con cálculo de valores 100% proporcional a las respuestas de encuestas existentes
  y ajuste del ángulo de inclinación / rotación general del radar.
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  useEstadisticas, 
  calcularDimensionesProporcionales,
  DIMENSIONES_RADIALES_BASE,
  type DimensionRadial 
} from '@/Almacenes/useEstadisticas'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { Sliders, RotateCcw, CheckCircle2, Compass, Plus, Sparkles } from 'lucide-vue-next'
import PresetsGraficoRadial from './Modales/ConfigurarRadial/PresetsGraficoRadial.vue'
import ListaSlidersCategorias from './Modales/ConfigurarRadial/ListaSlidersCategorias.vue'

const props = defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const { 
  datosEstadisticas, 
  dimensionesConfiguradas, 
  anguloRotacionRadar, 
  actualizarDimensionesRadiales, 
  restaurarDimensionesPorDefecto 
} = useEstadisticas()

const { encuestas, respuestasAnonimas } = useEncuestas()

const dimensionesEditables = ref<DimensionRadial[]>([])
const metaGlobalLocal = ref(85)
const anguloRotacionLocal = ref(0)
const mensajeExito = ref<string | null>(null)

const coloresSolidos = [
  { nombre: 'Azul Real', hex: '#2563eb' },
  { nombre: 'Esmeralda', hex: '#059669' },
  { nombre: 'Ámbar Cálido', hex: '#d97706' },
  { nombre: 'Índigo Sólido', hex: '#4f46e5' },
  { nombre: 'Púrpura Profundo', hex: '#7c3aed' },
  { nombre: 'Pizarra', hex: '#475569' },
  { nombre: 'Carmesí', hex: '#e11d48' },
  { nombre: 'Cian', hex: '#0284c7' }
]

// Extraer dinámicamente todas las categorías reales de las encuestas registradas
const categoriasDetectadas = computed(() => {
  const cats = new Set<string>()
  encuestas.value.forEach(enc => {
    enc.preguntas?.forEach(p => {
      if (p.categoria && p.categoria.trim()) cats.add(p.categoria.trim())
    })
  })
  respuestasAnonimas.value.forEach(r => {
    r.respuestas?.forEach(item => {
      if (item.categoria && item.categoria.trim()) cats.add(item.categoria.trim())
    })
  })
  return Array.from(cats)
})

// Calcula los valores proporcionales en tiempo real sobre las dimensiones editables
const dimensionesConValoresReales = computed(() => {
  return calcularDimensionesProporcionales(
    dimensionesEditables.value,
    respuestasAnonimas.value,
    metaGlobalLocal.value
  )
})

watch(() => props.abierto, (estaAbierto) => {
  if (estaAbierto) {
    mensajeExito.value = null
    metaGlobalLocal.value = datosEstadisticas.value.metaGlobalRadial || 85
    anguloRotacionLocal.value = anguloRotacionRadar.value || 0
    
    // Clonar dimensiones configuradas actuales
    const actuales = dimensionesConfiguradas.value || []
    dimensionesEditables.value = JSON.parse(JSON.stringify(actuales)).map((d: DimensionRadial) => ({
      ...d,
      inclinacion: typeof d.inclinacion === 'number' ? d.inclinacion : 0,
      categoriaMapeada: d.categoriaMapeada || d.eje
    }))

    // Si aún no hay dimensiones cargadas, usar base
    if (dimensionesEditables.value.length < 3) {
      dimensionesEditables.value = JSON.parse(JSON.stringify(DIMENSIONES_RADIALES_BASE))
    }

    // Actualizar valores proporcionales
    recalcularValores()
  }
})

const recalcularValores = () => {
  const proporcionales = calcularDimensionesProporcionales(
    dimensionesEditables.value,
    respuestasAnonimas.value,
    metaGlobalLocal.value
  )
  dimensionesEditables.value.forEach((d, idx) => {
    if (proporcionales[idx]) {
      d.valor = proporcionales[idx].valor
      d.totalRespuestas = proporcionales[idx].totalRespuestas
      d.estado = proporcionales[idx].estado
    }
  })
}

// Preset: Todas las categorías de las encuestas activas
const aplicarPresetCategoriasDeEncuestas = () => {
  if (categoriasDetectadas.value.length === 0) return

  dimensionesEditables.value = categoriasDetectadas.value.map((cat, idx) => ({
    eje: cat,
    categoriaMapeada: cat,
    valor: 0,
    meta: metaGlobalLocal.value,
    estado: 'Óptimo',
    color: coloresSolidos[idx % coloresSolidos.length]?.hex || '#2563eb',
    inclinacion: 0,
    descripcion: `Dimensión extraída de encuestas: ${cat}`
  }))

  recalcularValores()
}

// Preset: Empatía y Afecto
const aplicarPresetEmpatiaAfectoSocializacion = () => {
  dimensionesEditables.value = [
    {
      eje: 'Empatía & Escucha',
      categoriaMapeada: 'Liderazgo y Confianza',
      valor: 0,
      meta: 85,
      estado: 'Óptimo',
      color: '#2563eb',
      inclinacion: 0,
      descripcion: 'Comprensión mutua, cercanía y trato humano en los equipos.'
    },
    {
      eje: 'Afecto & Calidez',
      categoriaMapeada: 'Bienestar y Reconocimiento',
      valor: 0,
      meta: 80,
      estado: 'Óptimo',
      color: '#059669',
      inclinacion: 0,
      descripcion: 'Clima de confianza, contención emocional y aprecio sincero.'
    },
    {
      eje: 'Socialización & Convivencia',
      categoriaMapeada: 'Trabajo en Equipo y Apoyo',
      valor: 0,
      meta: 80,
      estado: 'Óptimo',
      color: '#d97706',
      inclinacion: 0,
      descripcion: 'Integración interdepartamental, trabajo colaborativo y respeto.'
    }
  ]
  recalcularValores()
}

// Preset: Estándar 6 Ejes Organizacionales
const aplicarPresetEstandar = () => {
  dimensionesEditables.value = JSON.parse(JSON.stringify(DIMENSIONES_RADIALES_BASE))
  metaGlobalLocal.value = 85
  anguloRotacionLocal.value = 0
  recalcularValores()
}

// Crear cualquier inclinación o eje
const agregarNuevaDimension = (categoriaSugerida?: string) => {
  const nombre = categoriaSugerida || `Nueva Inclinación ${dimensionesEditables.value.length + 1}`
  const colorAleatorio = coloresSolidos[dimensionesEditables.value.length % coloresSolidos.length]?.hex || '#2563eb'

  dimensionesEditables.value.push({
    eje: nombre,
    categoriaMapeada: categoriaSugerida || nombre,
    valor: 0,
    meta: metaGlobalLocal.value,
    estado: 'Óptimo',
    color: colorAleatorio,
    inclinacion: 0,
    descripcion: 'Inclinación personalizada vinculada a respuestas de encuestas.'
  })

  recalcularValores()
}

const eliminarDimension = (indice: number) => {
  if (dimensionesEditables.value.length <= 3) {
    alert('El gráfico radial necesita al menos 3 inclinaciones/ejes para formar un polígono.')
    return
  }
  dimensionesEditables.value.splice(indice, 1)
}

const guardarConfiguracion = async () => {
  if (dimensionesEditables.value.length < 3) {
    alert('Debes incluir al menos 3 inclinaciones o ejes para formar el radar.')
    return
  }

  // Recalcular proporciones exactas antes de guardar
  recalcularValores()

  await actualizarDimensionesRadiales(
    dimensionesEditables.value, 
    metaGlobalLocal.value, 
    anguloRotacionLocal.value
  )

  mensajeExito.value = '¡Inclinaciones y proporciones del gráfico radial guardadas exitosamente!'
  
  setTimeout(() => {
    emit('guardado')
    emit('cerrar')
  }, 700)
}
</script>

<template>
  <ModalBase
    :abierto="abierto"
    titulo="Configurar Inclinaciones y Ejes del Radar"
    subtitulo="Crea tantas inclinaciones como quieras y ajusta la orientación angular proporcional a las encuestas."
    anchoMaximo="2xl"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
        <Sliders class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="info" tamano="sm">
        PROPORCIONAL 100%
      </InsigniaPill>
    </template>

    <div class="space-y-4">
      <!-- Alerta de éxito -->
      <div v-if="mensajeExito" class="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{{ mensajeExito }}</span>
      </div>

      <!-- Presets Rápidos -->
      <PresetsGraficoRadial
        :totalCategoriasDetectadas="categoriasDetectadas.length"
        @presetCategorias="aplicarPresetCategoriasDeEncuestas"
        @presetEmpatia="aplicarPresetEmpatiaAfectoSocializacion"
        @presetEstandar="aplicarPresetEstandar"
      />

      <!-- Barra de Inclinación / Rotación General del Radar -->
      <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-left">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Compass class="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div>
              <span class="font-bold text-slate-800 dark:text-slate-200">Inclinación y Rotación del Gráfico:</span>
              <p class="text-[10px] text-slate-400">Rota el polígono radial al ángulo deseado (0° a 360°)</p>
            </div>
          </div>
          <span class="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm px-2.5 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800">
            {{ anguloRotacionLocal }}°
          </span>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <input
            v-model.number="anguloRotacionLocal"
            type="range"
            min="0"
            max="360"
            step="5"
            class="w-full accent-sky-600"
          />
        </div>

        <!-- Botones de Inclinación Rápida -->
        <div class="flex items-center gap-1.5 pt-1">
          <span class="text-[10px] text-slate-400">Ángulos rápidos:</span>
          <button
            v-for="ang in [0, 30, 45, 90, 180]"
            :key="ang"
            type="button"
            @click="anguloRotacionLocal = ang"
            :class="[
              'px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer border',
              anguloRotacionLocal === ang
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            {{ ang }}°
          </button>
        </div>
      </div>

      <!-- Meta Global de Referencia Corporativa -->
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span class="font-bold text-slate-800 dark:text-slate-200">Meta Global de Referencia:</span>
          <p class="text-[10px] text-slate-400">Polígono punteado de referencia corporativa</p>
        </div>
        <div class="flex items-center gap-2">
          <input
            v-model.number="metaGlobalLocal"
            type="range"
            min="50"
            max="100"
            class="w-24 accent-sky-600"
          />
          <span class="font-bold text-sky-600 dark:text-sky-400 font-mono text-xs">{{ metaGlobalLocal }}%</span>
        </div>
      </div>

      <!-- Sliders y Lista de Inclinaciones -->
      <ListaSlidersCategorias
        :dimensiones="dimensionesEditables"
        :coloresSolidos="coloresSolidos"
        :categoriasSugeridas="categoriasDetectadas"
        @agregar="agregarNuevaDimension"
        @eliminar="eliminarDimension"
      />
    </div>

    <!-- Pie de Acciones -->
    <template #pie>
      <div class="w-full flex items-center justify-between text-xs">
        <button
          type="button"
          @click="aplicarPresetEstandar"
          class="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restablecer ejes base</span>
        </button>

        <div class="flex items-center gap-2">
          <BotonBase
            variante="secundario"
            tamano="pequeno"
            @click="emit('cerrar')"
          >
            Cancelar
          </BotonBase>
          <BotonBase
            variante="primario"
            tamano="pequeno"
            @click="guardarConfiguracion"
          >
            Guardar y Aplicar
          </BotonBase>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
