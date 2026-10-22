<!--
  ============================================================================
  PESTAÑA DE ALERTAS PRINCIPALES Y TARJETAS DE MENCIONES IA (DashboardPestanaAlertas.vue)
  ============================================================================
  Orquesta las 11 alertas principales del sistema (y las adicionales que se creen),
  contabilizando por PERSONA analizada por IA (una persona puede estar en más de una
  tarjeta de alerta si presenta múltiples problemáticas) y generando tarjetas gemelas
  para las personas mencionadas por nombre con su resumen IA y botón de Ojo (👁️).
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import { useNotificaciones } from '@/Almacenes/useNotificaciones'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import {
  useTiposAlertas,
  type TipoAlertaPersonalizada,
  type NivelAlerta
} from '@/Almacenes/useTiposAlertas'
import {
  analizarAlertasPorPersonaConIA,
  generarTarjetasPersonasMencionadasIA
} from '@/ia/analizadorAlertasPorPersona'
import { AlertTriangle, Sliders, UserX, Eye } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'
import ModalGestionTiposAlertas from './ModalGestionTiposAlertas.vue'
import ModalDetalleBloqueAlerta from './Modales/ModalDetalleBloqueAlerta.vue'
import AlertasResumenNiveles from './Pestanas/PestanaAlertas/AlertasResumenNiveles.vue'
import AlertasBarraFiltros from './Pestanas/PestanaAlertas/AlertasBarraFiltros.vue'
import TarjetaAlertaItem from './Pestanas/PestanaAlertas/TarjetaAlertaItem.vue'
import TarjetaBloqueAlertaItem, { type BloqueAlertaItem } from './Pestanas/PestanaAlertas/TarjetaBloqueAlertaItem.vue'
import TarjetaPersonaMencionadaItem from './Pestanas/PestanaAlertas/TarjetaPersonaMencionadaItem.vue'

const props = defineProps<{
  alertas: NotificacionItem[]
  respuestas?: any[]
  elementoResaltadoId: string | null
}>()

const emit = defineEmits<{
  (e: 'inspeccionarAlerta', alerta: NotificacionItem): void
}>()

const { respuestasAnonimas } = useEncuestas()
const { tiposAlertas, tiposActivos, eliminarTipoAlerta, obtenerClaseColorNivel } = useTiposAlertas()
const { estadosCasos, actualizarEstadoAlerta, eliminarNotificacion } = useNotificaciones()

const modoVista = ref<'bloques' | 'individual'>('bloques')
const mostrarSoloConCasos = ref(false)
const modalTiposAbierto = ref(false)
const filtroNivel = ref<'todos' | NivelAlerta>('todos')
const filtroTipoId = ref<string>('todas')
const filtroEstado = ref<'todas' | 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'>('todas')

const modalBloqueAbierto = ref(false)
const bloqueSeleccionado = ref<BloqueAlertaItem | null>(null)
const tarjetasPersonasMencionadas = ref<BloqueAlertaItem[]>([])

const respuestasParaAnalisis = computed(() => {
  return props.respuestas && props.respuestas.length > 0 ? props.respuestas : respuestasAnonimas.value
})

const analisisAlertasIA = computed(() => {
  return analizarAlertasPorPersonaConIA(
    respuestasParaAnalisis.value,
    tiposActivos.value,
    estadosCasos.value
  )
})

const actualizarTarjetasPersonas = async () => {
  tarjetasPersonasMencionadas.value = await generarTarjetasPersonasMencionadasIA(
    respuestasParaAnalisis.value,
    estadosCasos.value
  )
}

watch(() => [respuestasParaAnalisis.value.length, estadosCasos.value], actualizarTarjetasPersonas, { immediate: true, deep: true })

const bloquesAlertas = computed<BloqueAlertaItem[]>(() => {
  return analisisAlertasIA.value.bloquesAlertasPrincipales.filter(b => {
    if (mostrarSoloConCasos.value && b.totalPersonas === 0) return false
    if (filtroNivel.value !== 'todos' && b.nivel !== filtroNivel.value) return false
    if (filtroTipoId.value !== 'todas' && b.id !== filtroTipoId.value) return false
    return true
  })
})

const metricasPorNivel = computed(() => {
  let n1 = 0, n2 = 0, n3 = 0, n4 = 0
  analisisAlertasIA.value.bloquesAlertasPrincipales.forEach(b => {
    if (b.nivel === 1) n1 += b.totalPersonas
    else if (b.nivel === 2) n2 += b.totalPersonas
    else if (b.nivel === 3) n3 += b.totalPersonas
    else n4 += b.totalPersonas
  })
  return { n1, n2, n3, n4, total: n1 + n2 + n3 + n4 }
})

const contarAlertasPorTipo = (tipo: TipoAlertaPersonalizada) => {
  const encontrado = analisisAlertasIA.value.bloquesAlertasPrincipales.find(b => b.id === tipo.id)
  return encontrado ? encontrado.totalPersonas : 0
}

const alertasIndividuales = computed(() => {
  const lista: NotificacionItem[] = []
  bloquesAlertas.value.forEach(b => {
    b.alertas.forEach(a => {
      if (filtroEstado.value === 'todas' || (a.estado || 'Detectada') === filtroEstado.value) {
        lista.push(a)
      }
    })
  })
  return lista
})

const abrirDetalleBloque = (bloque: BloqueAlertaItem) => {
  bloqueSeleccionado.value = bloque
  modalBloqueAbierto.value = true
}

const manejarCambioEstadoIndiv = async (id: string, nuevoEstado: 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada') => {
  await actualizarEstadoAlerta(id, nuevoEstado)
  if (bloqueSeleccionado.value) {
    const item = bloqueSeleccionado.value.alertas.find(a => a.id === id)
    if (item) item.estado = nuevoEstado
  }
}
</script>

<template>
  <div
    id="seccion-alertas-detalle"
    class="space-y-5 transition-all duration-500 text-left font-['Poppins',sans-serif]"
    :class="elementoResaltadoId === 'seccion-alertas-detalle' ? 'ring-4 ring-amber-400 scale-[1.01] animate-pulse p-2 rounded-3xl' : ''"
  >
    <!-- Encabezado Principal -->
    <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-300 dark:border-amber-800">
          <AlertTriangle class="w-3.5 h-3.5" />
          <span>11 Alertas Principales • Análisis por Persona & Menciones IA</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Tarjetas de Alerta por Pregunta de Menor Puntaje y Comentarios
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Contabilizado por persona analizada por IA (una persona puede figurar en múltiples alertas si reporta varios problemas). Diferencia entre Acoso Sexual y Molestias Cotidianas ("se la están montando").
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          @click="mostrarSoloConCasos = !mostrarSoloConCasos"
          class="px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer"
          :class="mostrarSoloConCasos
            ? 'bg-amber-500 text-white border-amber-600'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
        >
          {{ mostrarSoloConCasos ? 'Ver las 11 Alertas' : 'Solo con Casos Activos' }}
        </button>

        <BotonBase variante="primario" tamano="mediano" @click="modalTiposAbierto = true">
          <template #iconoIzquierdo>
            <Sliders class="w-4 h-4" />
          </template>
          <span>Configurar / Crear Alertas</span>
        </BotonBase>
      </div>
    </div>

    <!-- 1. Resumen por Niveles -->
    <AlertasResumenNiveles
      :metricas="metricasPorNivel"
      :filtroNivel="filtroNivel"
      @update:filtroNivel="filtroNivel = $event"
    />

    <!-- 2. Barra de Filtros -->
    <AlertasBarraFiltros
      :totalAlertas="metricasPorNivel.total"
      :filtroEstado="filtroEstado"
      :filtroTipoId="filtroTipoId"
      :modoVista="modoVista"
      :tiposAlertas="tiposAlertas"
      :contarAlertasPorTipo="contarAlertasPorTipo"
      @update:filtroEstado="filtroEstado = $event"
      @update:filtroTipoId="filtroTipoId = $event"
      @update:modoVista="modoVista = $event"
      @eliminarTipoAlerta="eliminarTipoAlerta"
    />

    <!-- 3. SECCIÓN DE TARJETAS DE PERSONAS MENCIONADAS (Sin crear nueva alerta en el catálogo) -->
    <div v-if="tarjetasPersonasMencionadas.length > 0" class="space-y-3">
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
            <UserX class="w-4 h-4" />
          </span>
          <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
            Tarjetas de Personas Mencionadas en Comentarios ({{ tarjetasPersonasMencionadas.length }})
          </h4>
        </div>
        <span class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Eye class="w-3.5 h-3.5 text-rose-500" />
          <span>Haz clic en el ojo para ver los comentarios sobre cada persona</span>
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TarjetaPersonaMencionadaItem
          v-for="tarjetaPersona in tarjetasPersonasMencionadas"
          :key="tarjetaPersona.id"
          :tarjeta="tarjetaPersona"
          @abrirCasosPersona="abrirDetalleBloque"
        />
      </div>
    </div>

    <!-- 4. SECCIÓN DE TARJETAS DE LAS 11 ALERTAS PRINCIPALES -->
    <div v-if="modoVista === 'bloques'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TarjetaBloqueAlertaItem
        v-for="bloque in bloquesAlertas"
        :key="bloque.id"
        :bloque="bloque"
        :claseColorNivel="obtenerClaseColorNivel(bloque.nivel)"
        @abrirBloque="abrirDetalleBloque"
      />
    </div>

    <!-- 5. Vista de Casos Individuales -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TarjetaAlertaItem
        v-for="alerta in alertasIndividuales"
        :key="alerta.id"
        :alerta="alerta"
        :nivel="1"
        :claseColorNivel="obtenerClaseColorNivel(1)"
        @inspeccionar="$emit('inspeccionarAlerta', $event)"
        @eliminar="eliminarNotificacion"
      />
    </div>

    <!-- Modal del Ojo (👁️): Inspección de Casos y Comentarios -->
    <ModalDetalleBloqueAlerta
      :abierto="modalBloqueAbierto"
      :bloque="bloqueSeleccionado"
      @cerrar="modalBloqueAbierto = false"
      @inspeccionarAlerta="$emit('inspeccionarAlerta', $event)"
      @cambiarEstado="manejarCambioEstadoIndiv"
    />

    <!-- Modal de Configuración para agregar más alertas si se desea -->
    <ModalGestionTiposAlertas
      :abierto="modalTiposAbierto"
      @cerrar="modalTiposAbierto = false"
    />
  </div>
</template>
