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
import { useEstadisticas } from '@/Almacenes/useEstadisticas'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import { useSugerenciasOrganizacionales } from '@/Almacenes/useSugerenciasOrganizacionales'
import { useToast } from '@/Almacenes/useToast'
import type { ItemBarra } from './GraficoBarras.vue'

import {
  Clock,
  Briefcase,
  UserCheck,
  UserX,
  Sparkles,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Link2,
  Cpu,
  Building2,
  DollarSign,
  Smile
} from 'lucide-vue-next'

import GeneralMetricasHero from './Pestanas/PestanaGeneral/GeneralMetricasHero.vue'
import GeneralGraficosSeccion from './Pestanas/PestanaGeneral/GeneralGraficosSeccion.vue'
import AnaliticaParticipacionHoraria from './AnaliticaParticipacionHoraria.vue'
import SimuladorImpactoClima from './SimuladorImpactoClima.vue'
import ModalConfigurarGraficoRadial from './ModalConfigurarGraficoRadial.vue'
import ModalVincularPreguntasSugerencias from './ModalVincularPreguntasSugerencias.vue'

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

const { estadisticasAntiguedad, colaboradoresMencionados } = useEstadisticas()
const { sugerenciasConMetricas, totalPreguntasVinculadas } = useSugerenciasOrganizacionales()
const { crearTipoAlerta } = useTiposAlertas()
const { mostrarExito, mostrarAviso } = useToast()

const modalConfigRadialAbierto = ref(false)
const modalVincularSugerenciasAbierto = ref(false)

const mapaIconosSugerencias: Record<string, any> = {
  Cpu,
  Building2,
  DollarSign,
  Smile,
  Lightbulb
}

const encasillarColaboradorComoAlerta = (mencion: any) => {
  crearTipoAlerta({
    nombre: `Seguimiento: ${mencion.nombre}`,
    descripcion: `Menciones recurrentes detectadas en respuestas abiertas: ${mencion.frasesEjemplo.join(' / ')}`,
    nivel: 2,
    modoEnfoque: 'especifico',
    palabrasClave: [mencion.nombre.toLowerCase(), ...mencion.nombre.toLowerCase().split(/\s+/)],
    protocoloAccion: `Citar a revisión de Talento Humano y realizar entrevista 1 a 1 confidencial con ${mencion.nombre}.`,
    icono: 'UserX',
    color: '#f43f5e'
  })
  mostrarExito('Alerta Encasillada', `Se generó un criterio de alerta específico para vigilar menciones de "${mencion.nombre}".`)
}
</script>

<template>
  <div class="space-y-6 text-left">
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

    <!-- 3. ANTIGÜEDAD, PROYECCIÓN DE RETENCIÓN Y RUTAS DE CARRERA -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Clock class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Proyección de Antigüedad, Retención y Rutas de Carrera</span>
              <span class="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
                Intel Talent
              </span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Análisis del tiempo de los colaboradores en la empresa, riesgo de fuga y carreras/rutas internas aprovechables.
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="item in estadisticasAntiguedad"
          :key="item.id"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-slate-800 dark:text-slate-200">
              {{ item.etiqueta }}
            </span>
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                item.riesgoRotacion === 'Alto'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : item.riesgoRotacion === 'Moderado'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              ]"
            >
              Riesgo {{ item.riesgoRotacion }}
            </span>
          </div>

          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {{ item.porcentaje }}%
            </span>
            <span class="text-xs font-bold text-slate-500">
              {{ item.cantidad }} colaboradores
            </span>
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px] text-slate-500">
              <span>Satisfacción laboral:</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ item.promedioSatisfaccion }}%</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full bg-indigo-500 rounded-full transition-all"
                :style="{ width: `${item.promedioSatisfaccion}%` }"
              ></div>
            </div>
          </div>

          <!-- Rutas de Carrera Recomendadas -->
          <div class="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
              <Briefcase class="w-3 h-3 text-indigo-500" />
              <span>Rutas de Carrera Sugeridas:</span>
            </span>
            <ul class="space-y-1">
              <li
                v-for="(carrera, cIdx) in item.carrerasRecomendadas"
                :key="cIdx"
                class="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <ArrowRight class="w-3 h-3 text-indigo-500 shrink-0" />
                <span>{{ carrera }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. DETECCIÓN DE COLABORADORES Y NOMBRES MENCIONADOS (IA) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
              <UserX class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white">
                Detección de Colaboradores / Nombres Mencionados (IA)
              </h3>
              <p class="text-[11px] text-slate-500">
                La IA indexa nombres propios o líderes citados en preguntas abiertas para encasillar o descartar.
              </p>
            </div>
          </div>
        </div>

        <div v-if="colaboradoresMencionados.length === 0" class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center space-y-2 text-xs text-slate-500">
          <CheckCircle2 class="w-8 h-8 text-emerald-500 mx-auto" />
          <p class="font-bold">No hay personas citadas con señales de conflicto en este momento.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="mencion in colaboradoresMencionados"
            :key="mencion.id"
            class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-slate-900 dark:text-white">
                  {{ mencion.nombre }}
                </span>
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    mencion.sentimiento === 'Atención/Fricción'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  ]"
                >
                  {{ mencion.sentimiento }} · {{ mencion.conteoMenciones }} mención(es)
                </span>
              </div>
              <p
                v-for="(frase, fIdx) in mencion.frasesEjemplo"
                :key="fIdx"
                class="text-[11px] text-slate-600 dark:text-slate-400 italic"
              >
                "{{ frase }}"
              </p>
            </div>

            <button
              type="button"
              @click="encasillarColaboradorComoAlerta(mencion)"
              class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shrink-0 cursor-pointer transition-colors"
            >
              🚨 Convertir en Alerta
            </button>
          </div>
        </div>
      </div>

      <!-- 5. ENCASILLAMIENTO DE SUGERENCIAS ORGANIZACIONALES -->
      <div class="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Lightbulb class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white">
                Sugerencias Organizacionales (IA)
              </h3>
              <p class="text-[11px] text-slate-500">
                Clasificación automática de recomendaciones constructivas.
              </p>
            </div>
          </div>

          <!-- Botón para Vincular Preguntas y eliminar carga operativa -->
          <button
            type="button"
            @click="modalVincularSugerenciasAbierto = true"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer border border-amber-500/20 shadow-xs"
            title="Vincular preguntas de las encuestas a las dimensiones de sugerencias"
          >
            <Link2 class="w-3.5 h-3.5" />
            <span>Vincular Preguntas</span>
            <span class="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black leading-none">
              {{ totalPreguntasVinculadas }}
            </span>
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="sug in sugerenciasConMetricas"
            :key="sug.id"
            class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <component 
                  :is="mapaIconosSugerencias[sug.icono] || Lightbulb" 
                  class="w-4 h-4"
                  :style="{ color: sug.color }"
                />
                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ sug.categoria }}
                </span>
                <span 
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :style="{ backgroundColor: `${sug.color}15`, color: sug.color }"
                >
                  {{ sug.totalPreguntasVinculadas }} pregs
                </span>
              </div>
              <span 
                class="text-xs font-black"
                :style="{ color: sug.color }"
              >
                {{ sug.porcentaje }}%
              </span>
            </div>

            <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{ width: `${sug.porcentaje}%`, backgroundColor: sug.color }"
              ></div>
            </div>

            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              💡 <span class="font-semibold text-slate-700 dark:text-slate-300">Plan:</span> {{ sug.accionSugerida }}
            </p>

            <!-- Ejemplos textuales o respuestas abiertas capturadas si existen -->
            <div v-if="sug.ejemplosTexto && sug.ejemplosTexto.length > 0" class="pt-1">
              <span class="text-[10px] text-slate-400 italic block truncate">
                💬 "{{ sug.ejemplosTexto[0] }}"
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Configuración del Radar -->
    <ModalConfigurarGraficoRadial
      :abierto="modalConfigRadialAbierto"
      @cerrar="modalConfigRadialAbierto = false"
    />

    <!-- Modal de Vinculación de Preguntas a Sugerencias (IA) -->
    <ModalVincularPreguntasSugerencias
      :abierto="modalVincularSugerenciasAbierto"
      @cerrar="modalVincularSugerenciasAbierto = false"
    />
  </div>
</template>

