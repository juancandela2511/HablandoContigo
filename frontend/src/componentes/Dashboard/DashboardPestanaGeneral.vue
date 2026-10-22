<!--
  ============================================================================
  COMPONENTE PESTAÑA VISIÓN GENERAL DEL DASHBOARD (DashboardPestanaGeneral.vue)
  ============================================================================
  Orquestador principal de la vista ejecutiva con todas las secciones visibles
  y textos resumidos para una lectura limpia y directa:
  1. Salud de Clima + Alertas Críticas + Participación + Resumen Comentarios IA
  2. Predicción de Riesgo de Fuga por Área (Mejora #1) + Anti-Straightlining (Mejora #6)
  3. Proyección de Antigüedad y Retención
  4. Detección de Personas / Menciones + Sugerencias Organizacionales (Económico, TI, etc.)
  5. Estadística de Estudios y Talento (Encasillamiento Inteligente en Data, Software, etc.)
-->

<script setup lang="ts">
import { ref } from 'vue'
import type {
  DimensionRadial,
  MetricaENPS,
  AnalisisConclusiones,
  MetricasParticipacion
} from '@/Almacenes/useEstadisticas'
import type { ItemBarra } from './GraficoBarras.vue'

import GeneralGraficosSeccion from './Pestanas/PestanaGeneral/GeneralGraficosSeccion.vue'
import CalidadYPrediccionIA from './CalidadYPrediccionIA.vue'
import AntiguedadRetencion from './AntiguedadRetencion.vue'
import DeteccionPersonasProblema from './DeteccionPersonasProblema.vue'
import SugerenciasOrganizacionales from './SugerenciasOrganizacionales.vue'
import TalentoEstudio from './TalentoEstudio.vue'
import ModalConfigurarGraficoRadial from './ModalConfigurarGraficoRadial.vue'

defineProps<{
  promedioSalud: number
  enps: MetricaENPS
  totalAlertas: number
  participacion: MetricasParticipacion
  conclusionesIA: AnalisisConclusiones
  dimensionesRadiales: DimensionRadial[]
  dimensionesBarras?: ItemBarra[]
  departamentosBarras: ItemBarra[]
  anguloInclinacion?: number
  departamentoSeleccionado?: string
  periodoSeleccionado?: string
}>()

const emit = defineEmits<{
  (e: 'cambiarPestana', pestana: 'alertas' | 'auditoria'): void
}>()

const modalConfigRadialAbierto = ref(false)
</script>

<template>
  <div class="space-y-6 text-left">
    <!-- 1. Sección Unificada: Salud de Clima + Alertas Críticas + Participación + Resumen IA -->
    <GeneralGraficosSeccion
      :promedioSalud="promedioSalud"
      :totalAlertas="totalAlertas"
      :participacion="participacion"
      :conclusionesIA="conclusionesIA"
      :dimensionesRadiales="dimensionesRadiales"
      :dimensionesBarras="dimensionesBarras || departamentosBarras"
      :departamentosBarras="departamentosBarras"
      :anguloInclinacion="anguloInclinacion"
      @cambiarPestana="emit('cambiarPestana', $event)"
      @abrirConfiguracionRadial="modalConfigRadialAbierto = true"
    />

    <!-- 2. Tiempo de Antigüedad y Retención (Pregunta #1 del Cuestionario) -->
    <AntiguedadRetencion />

    <!-- 3. Predicción de Riesgo de Fuga por Área y Auditoría Anti-Straightlining (Bloques Intermedios) -->
    <CalidadYPrediccionIA />

    <!-- 4. Talento y Bloque de Estudio (Encasillamiento Abierto en Data, Software, etc. — Bloque 6) -->
    <TalentoEstudio
      :departamentoSeleccionado="departamentoSeleccionado || 'todos'"
      :periodoSeleccionado="periodoSeleccionado || 'semanal'"
    />

    <!-- 5. Detección de Menciones de Personas y Análisis de Puntos de la Empresa (Bloques Finales 7 y 8) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7">
        <DeteccionPersonasProblema />
      </div>

      <div class="lg:col-span-5">
        <SugerenciasOrganizacionales />
      </div>
    </div>

    <!-- Modal de Configuración del Radar -->
    <ModalConfigurarGraficoRadial
      :abierto="modalConfigRadialAbierto"
      @cerrar="modalConfigRadialAbierto = false"
    />
  </div>
</template>
