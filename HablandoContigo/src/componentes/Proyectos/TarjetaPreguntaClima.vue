<!--
  ============================================================================
  TARJETA DE PREGUNTA CON CONTROL DE ALERTAS Y MINI-ESTADÍSTICAS (TarjetaPreguntaClima.vue)
  ============================================================================
  • Permite activar o desactivar la ALERTA 🔔 en CUALQUIER opción de respuesta con 1 clic.
  • Muestra opciones de respuesta detalladas y no genéricas.
  • Mini-estadística de respuestas en tiempo real (porcentaje y conteo).
  • Doble clic para abrir el modal de edición avanzada (agregar/quitar opciones, cambiar texto).
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Trash2,
  MousePointerClick,
  BarChart3,
  Bell,
  BellOff,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  GitBranch
} from 'lucide-vue-next'
import type { PreguntaEncuesta, OpcionPregunta } from '@/Servicios/iaEncuestasService'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'

const props = defineProps<{
  pregunta: PreguntaEncuesta
  indice: number
  puedeEditar: boolean
  idEncuesta?: string
}>()

const emit = defineEmits<{
  (e: 'abrirEditor', indice: number): void
  (e: 'eliminar', indice: number): void
}>()

const { respuestasAnonimas } = useEncuestas()
const { tiposAlertas, tiposActivos } = useTiposAlertas()

// Estado para mostrar/ocultar panel de estadísticas detalladas
const mostrarStats = ref(false)

// ─── Toggle Rápido de Alerta en Cualquier Opción ─────────────────────────────
const toggleAlertaOpcion = (opc: OpcionPregunta) => {
  if (!props.puedeEditar) return
  opc.esAlerta = !opc.esAlerta
  if (opc.esAlerta && !opc.tipoAlertaId) {
    const primera = tiposActivos.value[0] || tiposAlertas.value[0]
    if (primera) {
      opc.tipoAlertaId = primera.id
      opc.nombreAlerta = primera.nombre
      opc.severidadAlerta = primera.severidad
    }
  }
}

// ─── Cálculo de Estadísticas por Pregunta ─────────────────────────────────────
const estadisticas = computed(() => {
  const todasRespuestas = respuestasAnonimas.value || []
  const respuestasPregunta: { valorTexto: string; valorNum: number }[] = []

  todasRespuestas.forEach(registro => {
    if (props.idEncuesta && registro.idEncuesta && registro.idEncuesta !== props.idEncuesta) {
      return
    }

    registro.respuestas?.forEach(item => {
      const matchId = item.idPregunta && (item.idPregunta === props.pregunta.id || item.idPregunta.includes(props.pregunta.id))
      const matchTexto = item.textoPregunta && props.pregunta.texto && item.textoPregunta.trim().toLowerCase() === props.pregunta.texto.trim().toLowerCase()
      
      if (matchId || matchTexto) {
        respuestasPregunta.push({
          valorTexto: typeof item.respuesta === 'string' ? item.respuesta : String(item.respuesta ?? ''),
          valorNum: typeof item.valor === 'number' ? item.valor : Number(item.valor) || 0
        })
      }
    })
  })

  const total = respuestasPregunta.length

  const desgloseOpciones = props.pregunta.opciones.map(opc => {
    const conteo = respuestasPregunta.filter(r => {
      const matchTexto = r.valorTexto.trim().toLowerCase() === opc.texto.trim().toLowerCase()
      const matchValor = r.valorNum === opc.valor && opc.valor > 0
      return matchTexto || matchValor
    }).length

    const porcentaje = total > 0 ? Math.round((conteo / total) * 100) : 0
    return {
      id: opc.id,
      texto: opc.texto,
      valor: opc.valor,
      esAlerta: opc.esAlerta,
      conteo,
      porcentaje
    }
  })

  return {
    total,
    desgloseOpciones,
    tieneRespuestas: total > 0
  }
})

const numAlertas = computed(() => {
  return props.pregunta.opciones.filter(o => o.esAlerta).length
})

const handleDblClick = () => {
  if (props.puedeEditar) {
    emit('abrirEditor', props.indice)
  }
}
</script>

<template>
  <div
    :id="`pregunta-${pregunta.id}`"
    :class="[
      'group relative p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm',
      puedeEditar
        ? 'cursor-pointer hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-md'
        : 'cursor-default border-slate-200 dark:border-slate-800'
    ]"
    @dblclick="handleDblClick"
    :title="puedeEditar ? 'Doble clic para editar texto/opciones de la pregunta' : 'Modo solo lectura'"
  >
    <!-- Hint de doble clic en hover (si puede editar) -->
    <div
      v-if="puedeEditar"
      class="hidden group-hover:flex items-center gap-1 text-[10px] text-sky-500 dark:text-sky-400 font-semibold absolute top-3.5 right-4 pointer-events-none z-10 bg-white/95 dark:bg-slate-900/95 px-2.5 py-0.5 rounded-full shadow-sm border border-sky-200 dark:border-sky-800"
    >
      <MousePointerClick class="w-3 h-3" />
      Doble clic para editar opciones
    </div>

    <!-- ── Header de la Tarjeta ── -->
    <div class="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono text-xs font-black flex items-center justify-center flex-shrink-0">
          {{ indice + 1 }}
        </span>
        <input
          v-if="puedeEditar"
          v-model="pregunta.categoria"
          type="text"
          placeholder="Categoría..."
          class="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-800 outline-none w-full max-w-xs"
          @dblclick.stop
        />
        <span
          v-else
          class="text-xs font-bold text-sky-600 dark:text-sky-400 truncate"
        >
          {{ pregunta.categoria }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 flex-shrink-0">
        <!-- Badge de tipo de pregunta -->
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
          {{ pregunta.tipo }}
        </span>

        <!-- Badge Condicional (Salto de Pregunta) -->
        <span
          v-if="pregunta.esCondicional"
          class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 border border-indigo-200 dark:border-indigo-900/50"
          :title="`Condición: ${pregunta.accionCondicion === 'omitir_si' ? 'Omitir si responde' : 'Mostrar si responde'} ${(pregunta.valoresDisparo || []).join(', ') || 'Sí'}`"
        >
          <GitBranch class="w-2.5 h-2.5" />
          {{ pregunta.accionCondicion === 'omitir_si' ? 'Omitir si' : 'Si' }} "{{ (pregunta.valoresDisparo || []).join(', ') || 'Sí' }}"
        </span>

        <!-- Badge de total de alertas activas en esta pregunta -->
        <span
          v-if="numAlertas > 0"
          class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center gap-1 border border-rose-200 dark:border-rose-900/50"
          title="Total de opciones marcadas como alerta"
        >
          <Bell class="w-2.5 h-2.5" /> {{ numAlertas }} alerta{{ numAlertas !== 1 ? 's' : '' }}
        </span>

        <!-- Botón Ver Estadísticas de la Pregunta -->
        <button
          type="button"
          @click.stop="mostrarStats = !mostrarStats"
          :class="[
            'p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all cursor-pointer',
            mostrarStats
              ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600'
          ]"
          :title="mostrarStats ? 'Ocultar estadísticas' : 'Ver estadísticas de respuestas'"
        >
          <BarChart3 class="w-3.5 h-3.5" />
          <span class="text-[10px] font-bold hidden sm:inline">Stats</span>
        </button>

        <!-- Botón Eliminar Pregunta -->
        <button
          v-if="puedeEditar"
          type="button"
          @click.stop="emit('eliminar', indice)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          title="Eliminar pregunta"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- ── Texto de la Pregunta ── -->
    <div class="pt-1">
      <input
        v-if="puedeEditar"
        v-model="pregunta.texto"
        type="text"
        placeholder="Escribe la pregunta..."
        class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
        @dblclick.stop
      />
      <p
        v-else
        class="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed px-1"
      >
        {{ pregunta.texto }}
      </p>
    </div>

    <!-- ── Opciones de Respuesta con Control Directo de Alertas ── -->
    <div v-if="pregunta.tipo !== 'texto' && pregunta.opciones && pregunta.opciones.length > 0" class="space-y-1.5 pt-1">
      <div class="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
        <span>Respuestas configuradas ({{ pregunta.opciones.length }}) · Clic en la campana 🔔 para poner o quitar alertas:</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
        <div
          v-for="opc in pregunta.opciones"
          :key="opc.id"
          :class="[
            'px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-2 transition-all',
            opc.esAlerta
              ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          ]"
          @dblclick.stop="puedeEditar ? $emit('abrirEditor', indice) : null"
        >
          <div class="flex items-center gap-1.5 min-w-0 flex-1">
            <span class="truncate">{{ opc.texto }}</span>
            <span
              v-if="opc.esAlerta && opc.nombreAlerta"
              class="hidden sm:inline-flex text-[9px] px-1.5 py-0.2 rounded-full bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold truncate max-w-[130px] border border-rose-300 dark:border-rose-800"
              :title="`Asociada a: ${opc.nombreAlerta}`"
            >
              {{ opc.nombreAlerta }}
            </span>
          </div>

          <!-- ── Botón Toggle Alerta en esta Opción ── -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              v-if="puedeEditar"
              type="button"
              @click.stop="toggleAlertaOpcion(opc)"
              :class="[
                'px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer select-none',
                opc.esAlerta
                  ? 'bg-rose-500 text-white shadow-sm hover:bg-rose-600 ring-2 ring-rose-400/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50'
              ]"
              :title="opc.esAlerta ? `Alerta vinculada a: ${opc.nombreAlerta || 'General'}. Clic para desactivar.` : 'Clic para activar alerta en esta respuesta'"
            >
              <Bell v-if="opc.esAlerta" class="w-3 h-3 text-white" />
              <BellOff v-else class="w-3 h-3" />
              <span>{{ opc.esAlerta ? 'ALERTA' : '+ Alerta' }}</span>
            </button>

            <!-- Solo lectura de alerta si no puede editar -->
            <span
              v-else-if="opc.esAlerta"
              class="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black flex items-center gap-0.5"
            >
              <Bell class="w-2.5 h-2.5" /> {{ opc.nombreAlerta || 'ALERTA' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── NOTA TEXTO ABIERTO CON CONTROL DE ALERTA ── -->
    <div
      v-else-if="pregunta.tipo === 'texto'"
      class="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 text-[11px] flex items-center justify-between gap-2"
    >
      <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 italic">
        <Info class="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
        <span>Respuesta abierta (campo de texto libre).</span>
      </div>

      <!-- Toggle Alerta para Texto Abierto -->
      <button
        v-if="puedeEditar"
        type="button"
        @click.stop="pregunta.esSensibleAcoso = !pregunta.esSensibleAcoso"
        :class="[
          'px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer select-none',
          pregunta.esSensibleAcoso
            ? 'bg-rose-500 text-white shadow-sm hover:bg-rose-600 ring-2 ring-rose-400/30'
            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50'
        ]"
        :title="pregunta.esSensibleAcoso ? 'Alerta activa en texto: la IA analizará si hay acoso, estrés o quejas graves' : 'Clic para activar supervisión de alertas con IA en este texto'"
      >
        <Bell v-if="pregunta.esSensibleAcoso" class="w-3 h-3 text-white" />
        <BellOff v-else class="w-3 h-3" />
        <span>{{ pregunta.esSensibleAcoso ? 'ALERTA IA ACTIVA' : '+ Alerta IA' }}</span>
      </button>

      <span
        v-else-if="pregunta.esSensibleAcoso"
        class="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black flex items-center gap-0.5"
      >
        <Bell class="w-2.5 h-2.5" /> ALERTA IA
      </span>
    </div>

    <!-- ── PANEL DE ESTADÍSTICAS POR PREGUNTA (COLLAPSIBLE) ── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="mostrarStats"
        class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3 overflow-hidden"
        @dblclick.stop
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <BarChart3 class="w-3.5 h-3.5 text-sky-500" />
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
              Estadísticas en Tiempo Real
            </span>
          </div>
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Total respuestas: {{ estadisticas.total }}
          </span>
        </div>

        <!-- Barras de distribución por opción -->
        <div v-if="estadisticas.tieneRespuestas && pregunta.tipo !== 'texto'" class="space-y-2">
          <div
            v-for="opc in estadisticas.desgloseOpciones"
            :key="opc.id"
            class="space-y-1"
          >
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[70%]">
                {{ opc.texto }}
              </span>
              <span class="font-mono font-bold text-[10px]" :class="opc.esAlerta && opc.conteo > 0 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'">
                {{ opc.conteo }} ({{ opc.porcentaje }}%)
              </span>
            </div>
            
            <!-- Barra de progreso -->
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="opc.esAlerta ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-500 to-indigo-500'"
                :style="{ width: `${opc.porcentaje}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Sin respuestas registradas -->
        <div
          v-else
          class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-400"
        >
          {{ pregunta.tipo === 'texto' ? 'Las respuestas abiertas se recopilan de forma cualitativa en el Dashboard.' : 'Aún no se han registrado respuestas anónimas para esta pregunta en Supabase.' }}
        </div>
      </div>
    </Transition>

  </div>
</template>
