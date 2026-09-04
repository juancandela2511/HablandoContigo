<!--
  ============================================================================
  COMPONENTE PESTAÑA ALERTAS PSICOSOCIALES Y NIVELES (DashboardPestanaAlertas.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Orquestador principal de la vista de alertas del clima organizacional:
  - AlertasResumenNiveles: 4 tarjetas de conteo métrico por Niveles 1 al 4.
  - AlertasBarraFiltros: Filtros de estado y por tipo de alerta configurada.
  - TarjetaAlertaItem: Renderizado de alertas individuales.
  - ModalGestionTiposAlertas: Modal de configuración para Super Administrador.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import {
  useTiposAlertas,
  type TipoAlertaPersonalizada,
  type NivelAlerta
} from '@/Almacenes/useTiposAlertas'
import { BrainCircuit, Sliders } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'
import ModalGestionTiposAlertas from './ModalGestionTiposAlertas.vue'
import AlertasResumenNiveles from './Pestanas/PestanaAlertas/AlertasResumenNiveles.vue'
import AlertasBarraFiltros from './Pestanas/PestanaAlertas/AlertasBarraFiltros.vue'
import TarjetaAlertaItem from './Pestanas/PestanaAlertas/TarjetaAlertaItem.vue'

const props = defineProps<{
  alertas: NotificacionItem[]
  elementoResaltadoId: string | null
}>()

defineEmits<{
  (e: 'inspeccionarAlerta', alerta: NotificacionItem): void
}>()

const {
  tiposAlertas,
  eliminarTipoAlerta,
  obtenerClaseColorNivel
} = useTiposAlertas()

const modalTiposAbierto = ref(false)
const filtroNivel = ref<'todos' | NivelAlerta>('todos')
const filtroTipoId = ref<string>('todas')
const filtroEstado = ref<'todas' | 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'>('todas')

const obtenerTipoConfiguradoDeAlerta = (alerta: NotificacionItem): TipoAlertaPersonalizada | undefined => {
  const nombreAlerta = (alerta.tipoAlerta || alerta.titulo || '').toLowerCase()
  const slug = (alerta.tipo || '').toLowerCase()

  return tiposAlertas.value.find(t => {
    const tNombre = t.nombre.toLowerCase()
    const tSlug = t.id.replace('tipo-', '').toLowerCase()
    return tNombre.includes(nombreAlerta) || nombreAlerta.includes(tNombre) || tSlug === slug
  })
}

const obtenerNivelDeAlerta = (alerta: NotificacionItem): NivelAlerta => {
  const tipoConf = obtenerTipoConfiguradoDeAlerta(alerta)
  if (tipoConf?.nivel) return tipoConf.nivel

  const sev = (alerta.severidad || 'Moderada').toLowerCase()
  if (sev === 'crítica' || sev === 'critica') return 1
  if (sev === 'alta') return 2
  if (sev === 'moderada') return 3
  return 4
}

const metricasPorNivel = computed(() => {
  let n1 = 0, n2 = 0, n3 = 0, n4 = 0
  props.alertas.forEach(a => {
    const lvl = obtenerNivelDeAlerta(a)
    if (lvl === 1) n1++
    else if (lvl === 2) n2++
    else if (lvl === 3) n3++
    else if (lvl === 4) n4++
  })
  return { n1, n2, n3, n4, total: props.alertas.length }
})

const contarAlertasPorTipo = (tipo: TipoAlertaPersonalizada) => {
  const nombreNorm = tipo.nombre.toLowerCase()
  const slugId = tipo.id.replace('tipo-', '').toLowerCase()

  return props.alertas.filter(a => {
    if (filtroEstado.value !== 'todas' && (a.estado || 'Detectada') !== filtroEstado.value) {
      return false
    }
    if (a.tipo && a.tipo.toLowerCase() === slugId) return true
    if (a.tipoAlerta && a.tipoAlerta.toLowerCase().includes(nombreNorm)) return true
    if (a.titulo && a.titulo.toLowerCase().includes(nombreNorm)) return true
    if (a.mensaje && tipo.palabrasClave.some(kw => kw.length > 2 && a.mensaje!.toLowerCase().includes(kw.toLowerCase()))) return true
    return false
  }).length
}

const alertasFiltradas = computed(() => {
  return props.alertas.filter(a => {
    if (filtroEstado.value !== 'todas') {
      const est = a.estado || 'Detectada'
      if (est !== filtroEstado.value) return false
    }

    if (filtroNivel.value !== 'todos') {
      const nivelAlerta = obtenerNivelDeAlerta(a)
      if (nivelAlerta !== filtroNivel.value) return false
    }

    if (filtroTipoId.value !== 'todas') {
      const tipoSel = tiposAlertas.value.find(t => t.id === filtroTipoId.value)
      if (tipoSel) {
        const nombreNorm = tipoSel.nombre.toLowerCase()
        const slugId = tipoSel.id.replace('tipo-', '').toLowerCase()
        const coincideTipo = a.tipo && a.tipo.toLowerCase() === slugId
        const coincideTitulo = (a.tipoAlerta || a.titulo || '').toLowerCase().includes(nombreNorm)
        const coincideMensaje = a.mensaje && tipoSel.palabrasClave.some(kw => kw.length > 2 && a.mensaje!.toLowerCase().includes(kw.toLowerCase()))
        if (!coincideTipo && !coincideTitulo && !coincideMensaje) return false
      }
    }

    return true
  })
})
</script>

<template>
  <div 
    id="seccion-alertas-detalle"
    class="space-y-5 transition-all duration-500 text-left font-['Poppins',sans-serif]"
    :class="elementoResaltadoId === 'seccion-alertas-detalle' ? 'ring-4 ring-amber-400 scale-[1.01] animate-pulse p-2 rounded-3xl' : ''"
  >
    <!-- Encabezado Principal y Botón de Calibración -->
    <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider">
          <BrainCircuit class="w-3.5 h-3.5" />
          <span>Inteligencia Artificial & Encasillamiento por Niveles</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Protocolo de Alertas Psicosociales & Convivencia</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          La IA clasifica y encasilla automáticamente las respuestas de las encuestas en los Niveles (1 al 4) y criterios creados por el Super Administrador.
        </p>
      </div>

      <BotonBase
        variante="primario"
        tamano="mediano"
        @click="modalTiposAbierto = true"
      >
        <template #iconoIzquierdo>
          <Sliders class="w-4 h-4" />
        </template>
        <span>Configurar Alertas & Niveles</span>
      </BotonBase>
    </div>

    <!-- 1. Tarjetas Resumen por Niveles 1 al 4 -->
    <AlertasResumenNiveles
      :metricas="metricasPorNivel"
      :filtroNivel="filtroNivel"
      @update:filtroNivel="filtroNivel = $event"
    />

    <!-- 2. Barra de Filtros (Estado y Criterios) -->
    <AlertasBarraFiltros
      :totalAlertas="alertas.length"
      :filtroEstado="filtroEstado"
      :filtroTipoId="filtroTipoId"
      :tiposAlertas="tiposAlertas"
      :contarAlertasPorTipo="contarAlertasPorTipo"
      @update:filtroEstado="filtroEstado = $event"
      @update:filtroTipoId="filtroTipoId = $event"
      @eliminarTipoAlerta="eliminarTipoAlerta"
    />

    <!-- 3. Lista de Alertas Encasilladas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TarjetaAlertaItem
        v-for="alerta in alertasFiltradas"
        :key="alerta.id"
        :alerta="alerta"
        :nivel="obtenerNivelDeAlerta(alerta)"
        :claseColorNivel="obtenerClaseColorNivel(obtenerNivelDeAlerta(alerta))"
        :tipoConfigurado="obtenerTipoConfiguradoDeAlerta(alerta)"
        @inspeccionar="$emit('inspeccionarAlerta', $event)"
      />

      <div v-if="alertasFiltradas.length === 0" class="col-span-full py-12 text-center text-slate-500 font-sans text-xs">
        No se encontraron alertas para los filtros seleccionados.
      </div>
    </div>

    <!-- Modal de Configuración de Tipos de Alerta -->
    <ModalGestionTiposAlertas
      :abierto="modalTiposAbierto"
      @cerrar="modalTiposAbierto = false"
    />
  </div>
</template>
