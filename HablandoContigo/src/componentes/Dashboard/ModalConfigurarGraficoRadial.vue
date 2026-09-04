<!--
  ============================================================================
  COMPONENTE MODAL CONFIGURADOR DEL GRÁFICO RADIAL (ModalConfigurarGraficoRadial.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Permite a administradores configurar y editar los ejes, inclinaciones y dimensiones
  del gráfico radial con protección de contraseña.
  
  ARQUITECTURA MODULAR:
  - ModalBase: Contenedor modal estándar.
  - DesbloqueoContrasena: Pantalla de autenticación y validación.
  - PresetsGraficoRadial: Acceso rápido a configuraciones (Empatía/Afecto vs Estándar).
  - ListaSlidersCategorias: Gestión dinámica de ejes, colores y ponderaciones.
-->

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEstadisticas, type DimensionRadial } from '@/Almacenes/useEstadisticas'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { Sliders, RotateCcw, CheckCircle2 } from 'lucide-vue-next'
import DesbloqueoContrasena from './Modales/ConfigurarRadial/DesbloqueoContrasena.vue'
import PresetsGraficoRadial from './Modales/ConfigurarRadial/PresetsGraficoRadial.vue'
import ListaSlidersCategorias from './Modales/ConfigurarRadial/ListaSlidersCategorias.vue'

const props = defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const { datosEstadisticas, actualizarDimensionesRadiales, restaurarDimensionesPorDefecto } = useEstadisticas()

const desbloqueado = ref(false)
const errorContrasena = ref<string | null>(null)
const dimensionesEditables = ref<DimensionRadial[]>([])
const metaGlobalLocal = ref(85)
const mensajeExito = ref<string | null>(null)

const coloresSolidos = [
  { nombre: 'Azul Real', hex: '#2563eb' },
  { nombre: 'Esmeralda', hex: '#059669' },
  { nombre: 'Ámbar Cálido', hex: '#d97706' },
  { nombre: 'Índigo Sólido', hex: '#4f46e5' },
  { nombre: 'Púrpura Profundo', hex: '#7c3aed' },
  { nombre: 'Pizarra', hex: '#475569' },
  { nombre: 'Carmesí', hex: '#e11d48' }
]

watch(() => props.abierto, (estaAbierto) => {
  if (estaAbierto) {
    desbloqueado.value = true // Desbloqueado para permitir edición y eliminación inmediata
    errorContrasena.value = null
    mensajeExito.value = null
    metaGlobalLocal.value = datosEstadisticas.value.metaGlobalRadial || 85
    dimensionesEditables.value = JSON.parse(JSON.stringify(datosEstadisticas.value.dimensionesRadiales || []))
  }
})

const procesarDesbloqueo = (_pass?: string) => {
  errorContrasena.value = null
  desbloqueado.value = true
}

const aplicarPresetEmpatiaAfectoSocializacion = () => {
  dimensionesEditables.value = [
    {
      eje: 'Empatía & Escucha',
      valor: 86,
      meta: 85,
      estado: 'Óptimo',
      color: '#2563eb',
      benchmarkIndustria: 78,
      descripcion: 'Comprensión mutua, cercanía y trato humano en los equipos.'
    },
    {
      eje: 'Afecto & Calidez',
      valor: 82,
      meta: 80,
      estado: 'Óptimo',
      color: '#059669',
      benchmarkIndustria: 75,
      descripcion: 'Clima de confianza, contención emocional y aprecio sincero.'
    },
    {
      eje: 'Socialización & Convivencia',
      valor: 79,
      meta: 80,
      estado: 'Riesgo Moderado',
      color: '#d97706',
      benchmarkIndustria: 72,
      descripcion: 'Integración interdepartamental, trabajo colaborativo y respeto.'
    }
  ]
}

const aplicarPresetEstandar = () => {
  restaurarDimensionesPorDefecto()
  dimensionesEditables.value = JSON.parse(JSON.stringify(datosEstadisticas.value.dimensionesRadiales))
  metaGlobalLocal.value = 85
}

const agregarNuevaDimension = () => {
  const colorAleatorio = coloresSolidos[dimensionesEditables.value.length % coloresSolidos.length]?.hex || '#2563eb'
  dimensionesEditables.value.push({
    eje: `Nueva Dimensión ${dimensionesEditables.value.length + 1}`,
    valor: 80,
    meta: 85,
    estado: 'Óptimo',
    color: colorAleatorio,
    benchmarkIndustria: 75,
    descripcion: 'Dimensión personalizada vinculada a las encuestas.'
  })
}

const eliminarDimension = (indice: number) => {
  if (dimensionesEditables.value.length <= 3) {
    alert('El gráfico radial necesita al menos 3 dimensiones para formar un polígono.')
    return
  }
  dimensionesEditables.value.splice(indice, 1)
}

const guardarConfiguracion = () => {
  if (dimensionesEditables.value.length < 3) {
    alert('Debes incluir al menos 3 dimensiones.')
    return
  }

  dimensionesEditables.value.forEach(d => {
    d.estado = d.valor >= d.meta ? 'Óptimo' : d.valor >= d.meta - 10 ? 'Riesgo Moderado' : 'Atención'
  })

  actualizarDimensionesRadiales(dimensionesEditables.value, metaGlobalLocal.value)
  mensajeExito.value = '¡Gráfico radial actualizado exitosamente!'
  
  setTimeout(() => {
    emit('guardado')
    emit('cerrar')
  }, 900)
}
</script>

<template>
  <ModalBase
    :abierto="abierto"
    titulo="Editar Ejes e Inclinaciones del Radar"
    subtitulo="Personaliza las dimensiones estratégicas vinculadas con las evaluaciones de clima."
    anchoMaximo="xl"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
        <Sliders class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="info" tamano="sm">
        ADMIN
      </InsigniaPill>
    </template>

    <!-- Paso 1: Pantalla de Desbloqueo por Contraseña -->
    <DesbloqueoContrasena
      v-if="!desbloqueado"
      :error="errorContrasena"
      @desbloquear="procesarDesbloqueo"
    />

    <!-- Paso 2: Editor Desbloqueado de Dimensiones -->
    <div v-else class="space-y-4">
      <div v-if="mensajeExito" class="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{{ mensajeExito }}</span>
      </div>

      <!-- Presets Rápidos -->
      <PresetsGraficoRadial
        @presetEmpatia="aplicarPresetEmpatiaAfectoSocializacion"
        @presetEstandar="aplicarPresetEstandar"
      />

      <!-- Meta Global -->
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

      <!-- Sliders de Dimensiones -->
      <ListaSlidersCategorias
        :dimensiones="dimensionesEditables"
        :coloresSolidos="coloresSolidos"
        @agregar="agregarNuevaDimension"
        @eliminar="eliminarDimension"
      />
    </div>

    <!-- Pie de Acciones -->
    <template #pie v-if="desbloqueado">
      <div class="w-full flex items-center justify-between text-xs">
        <button
          type="button"
          @click="aplicarPresetEstandar"
          class="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restablecer todo</span>
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
