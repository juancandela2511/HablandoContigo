<!--
  ============================================================================
  COMPONENTE PESTAÑA VISIÓN GENERAL DEL DASHBOARD (DashboardPestanaGeneral.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Orquestador de la vista ejecutiva general de métricas organizacionales:
  - GeneralMetricasHero: 5 tarjetas principales (Salud, eNPS, Alertas, Participación, Ignoradas).
  - GeneralGraficosSeccion: Gauge de salud, Conclusiones IA, Radar 360 y Barras.
  - AnaliticaParticipacionHoraria: Telemetría de horas pico y turnos.
  - SimuladorImpactoClima: Simulador predictivo what-if.
  - ModalConfigurarGraficoRadial: Editor protegido de ejes radiales.
  
  ¿CON QUÉ SE CONECTA?
  - useEstadisticas.ts (Datos organizacionales consolidados)
  - DashboardView.vue (Componente vista principal)
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

import GeneralMetricasHero from './Pestanas/PestanaGeneral/GeneralMetricasHero.vue'
import GeneralGraficosSeccion from './Pestanas/PestanaGeneral/GeneralGraficosSeccion.vue'
import AnaliticaParticipacionHoraria from './AnaliticaParticipacionHoraria.vue'
import SimuladorImpactoClima from './SimuladorImpactoClima.vue'
import ModalConfigurarGraficoRadial from './ModalConfigurarGraficoRadial.vue'

defineProps<{
  promedioSalud: number
  enps: MetricaENPS
  totalAlertas: number
  participacion: MetricasParticipacion
  conclusionesIA: AnalisisConclusiones
  dimensionesRadiales: DimensionRadial[]
  dimensionesBarras: ItemBarra[]
  departamentosBarras: ItemBarra[]
  anguloInclinacion?: number
}>()

const emit = defineEmits<{
  (e: 'cambiarPestana', pestana: 'alertas' | 'auditoria'): void
}>()

const modalConfigRadialAbierto = ref(false)
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Tarjetas de Métricas Ejecutivas Clave -->
    <GeneralMetricasHero
      :promedioSalud="promedioSalud"
      :enps="enps"
      :totalAlertas="totalAlertas"
      :participacion="participacion"
      @cambiarPestana="emit('cambiarPestana', $event)"
    />

    <!-- 2. Gráficos, Gauge y Conclusiones de IA -->
    <GeneralGraficosSeccion
      :promedioSalud="promedioSalud"
      :conclusionesIA="conclusionesIA"
      :dimensionesRadiales="dimensionesRadiales"
      :dimensionesBarras="dimensionesBarras"
      :anguloInclinacion="anguloInclinacion"
      @configurarRadial="modalConfigRadialAbierto = true"
    />

 

    <!-- Modal de Configuración del Radar -->
    <ModalConfigurarGraficoRadial
      :abierto="modalConfigRadialAbierto"
      @cerrar="modalConfigRadialAbierto = false"
    />
  </div>
</template>
