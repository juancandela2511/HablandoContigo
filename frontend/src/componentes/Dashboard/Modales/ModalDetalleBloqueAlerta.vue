<!--
  ============================================================================
  MODAL DE INSPECCIÓN DE CASOS Y COMENTARIOS CON IA (ModalDetalleBloqueAlerta.vue)
  ============================================================================
  Se abre al hacer clic en el botón del Ojo (👁️) en cualquier Tarjeta de Alerta
  o Tarjeta de Persona Mencionada, mostrando el resumen de IA, las preguntas de
  menor puntaje y los casos/comentarios individuales de cada persona.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import type { BloqueAlertaItem } from '../Pestanas/PestanaAlertas/TarjetaBloqueAlertaItem.vue'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import {
  Users,
  MessageSquare,
  Clock,
  Laptop,
  CheckCircle2,
  Eye,
  Building,
  Sparkles,
  UserX,
  HelpCircle,
  ShieldCheck
} from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
  bloque: BloqueAlertaItem | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'inspeccionarAlerta', alerta: NotificacionItem): void
  (e: 'cambiarEstado', id: string, nuevoEstado: 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'): void
}>()

const filtroEstadoInterno = ref<'todas' | 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'>('todas')

const alertasFiltradasInternas = computed(() => {
  if (!props.bloque) return []
  if (filtroEstadoInterno.value === 'todas') return props.bloque.alertas
  return props.bloque.alertas.filter(a => (a.estado || 'Detectada') === filtroEstadoInterno.value)
})
</script>

<template>
  <ModalBase
    :abierto="abierto && !!bloque"
    :titulo="bloque ? (bloque.esTarjetaPersonaMencionada ? `Menciones hacia: ${bloque.nombrePersonaMencionada}` : bloque.titulo) : 'Detalle de Casos'"
    subtitulo="Inspección detallada del análisis de IA, preguntas de menor puntaje y comentarios escritos por cada persona."
    anchoMaximo="4xl"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
        <Eye class="w-5 h-5" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="critico" tamano="sm">
        {{ bloque?.esTarjetaPersonaMencionada ? 'Persona Mencionada' : `Nivel ${bloque?.nivel || 1} — ${bloque?.severidad || 'Crítica'}` }}
      </InsigniaPill>
    </template>

    <div v-if="bloque" class="space-y-4 text-left font-['Poppins',sans-serif]">
      <!-- 1. Resumen Detallado de IA -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50/50 dark:from-sky-950/40 dark:to-indigo-950/30 border border-sky-200 dark:border-sky-800/60 space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-xs font-black uppercase tracking-wider text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
            <Sparkles class="w-4 h-4 text-sky-500" />
            <span>Análisis y Resumen Detallado de IA</span>
          </span>
          <span class="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-xs font-black text-slate-800 dark:text-sky-200 flex items-center gap-1.5">
            <Users class="w-3.5 h-3.5 text-amber-500" />
            <span>{{ bloque.totalPersonas }} {{ bloque.totalPersonas === 1 ? 'persona analizada' : 'personas analizadas' }}</span>
          </span>
        </div>
        <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
          {{ bloque.analisisDetalladoIA || bloque.descripcion }}
        </p>

        <!-- Personas mencionadas en esta alerta -->
        <div v-if="bloque.personasSeñaladas && bloque.personasSeñaladas.length > 0 && !bloque.esTarjetaPersonaMencionada" class="pt-1 flex items-center gap-1.5 flex-wrap">
          <span class="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <UserX class="w-3.5 h-3.5" />
            <span>Nombres detectados en estos casos:</span>
          </span>
          <span
            v-for="p in bloque.personasSeñaladas"
            :key="p.nombre"
            class="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold"
          >
            {{ p.nombre }} ({{ p.menciones }})
          </span>
        </div>
      </div>

      <!-- 2. Desglose por Pregunta de Menor Puntaje -->
      <div
        v-if="bloque.preguntasMenorPuntaje && bloque.preguntasMenorPuntaje.length > 0"
        class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
      >
        <p class="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <HelpCircle class="w-4 h-4 text-rose-500" />
          <span>Preguntas de menor puntaje que dispararon esta alerta:</span>
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            v-for="preg in bloque.preguntasMenorPuntaje"
            :key="preg.idPregunta"
            class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
          >
            <p class="font-bold text-slate-800 dark:text-white leading-snug">{{ preg.textoPregunta }}</p>
            <div class="flex items-center justify-between text-[11px] pt-1">
              <span class="text-rose-600 dark:text-rose-400 font-bold">Respuesta: {{ preg.respuestaFrecuente }}</span>
              <span class="font-mono font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                Promedio: {{ preg.promedioPuntaje }}/5
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Filtro rápido de estados -->
      <div class="flex items-center gap-1.5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-850 text-xs flex-wrap border border-slate-200 dark:border-slate-800">
        <button
          v-for="est in (['todas', 'Detectada', 'En Revisión', 'Atendida', 'Descartada'] as const)"
          :key="est"
          type="button"
          @click="filtroEstadoInterno = est"
          :class="[
            'px-3 py-1 rounded-xl font-bold transition-all text-xs cursor-pointer',
            filtroEstadoInterno === est ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
          ]"
        >
          {{ est === 'todas' ? `Todos los Casos (${bloque.alertas.length})` : est }}
        </button>
      </div>

      <!-- 4. Lista de Casos y Comentarios por Persona -->
      <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        <div
          v-for="(alerta, index) in alertasFiltradasInternas"
          :key="alerta.id"
          class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 hover:border-amber-400/60 transition-all"
        >
          <div class="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-black text-[11px]">
                Persona #{{ index + 1 }}
              </span>
              <span class="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                <Laptop class="w-3.5 h-3.5 text-slate-400" />
                {{ alerta.nombreEquipoPC || 'PC-CORP' }}
              </span>
              <span class="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                <Building class="w-3 h-3" />
                {{ alerta.departamento || 'General' }}
              </span>
              <span
                v-if="alerta.cuentaUsuarioPC && alerta.cuentaUsuarioPC.includes('Menciona')"
                class="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold border border-rose-300 dark:border-rose-800"
              >
                {{ alerta.cuentaUsuarioPC }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Clock class="w-3 h-3" />
                {{ alerta.fecha }} - {{ alerta.hora }}
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {{ alerta.estado || 'Detectada' }}
              </span>
            </div>
          </div>

          <!-- Preguntas de bajo puntaje respondidas por esta persona -->
          <div v-if="alerta.descripcion" class="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <strong class="text-slate-800 dark:text-slate-200">Preguntas de bajo puntaje:</strong> {{ alerta.descripcion }}
          </div>

          <!-- Comentario cualitativo escrito por la persona -->
          <div
            v-if="alerta.detalleRespuesta && alerta.detalleRespuesta.trim().length > 0"
            class="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 space-y-1"
          >
            <p class="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <MessageSquare class="w-3.5 h-3.5" />
              <span>💬 Comentario escrito por la persona:</span>
            </p>
            <p class="text-xs font-medium text-amber-950 dark:text-amber-100 leading-relaxed italic">
              "{{ alerta.detalleRespuesta }}"
            </p>
          </div>

          <!-- Acciones rápidas -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <span class="text-[10px] text-slate-400">Sede: {{ alerta.ubicacionSede || 'Sede Principal' }}</span>
            <div class="flex items-center gap-1.5">
              <button
                v-if="alerta.estado !== 'Atendida'"
                type="button"
                @click="emit('cambiarEstado', alerta.id, 'Atendida')"
                class="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 class="w-3 h-3" />
                <span>Marcar Atendida</span>
              </button>
              <button
                type="button"
                @click="emit('inspeccionarAlerta', alerta)"
                class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Eye class="w-3 h-3 text-amber-500" />
                <span>Ficha Completa</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="alertasFiltradasInternas.length === 0" class="py-8 text-center text-slate-400 text-xs">
          No hay casos registrados en este bloque para el filtro seleccionado.
        </div>
      </div>
    </div>

    <template #pie>
      <div class="flex items-center justify-between w-full">
        <span class="text-xs text-slate-400 flex items-center gap-1">
          <ShieldCheck class="w-4 h-4 text-emerald-500" />
          <span>Conteo inteligente por persona analizada (una persona puede figurar en múltiples alertas si reporta varios problemas)</span>
        </span>
        <BotonBase variante="primario" tamano="pequeno" @click="emit('cerrar')">
          Cerrar
        </BotonBase>
      </div>
    </template>
  </ModalBase>
</template>
