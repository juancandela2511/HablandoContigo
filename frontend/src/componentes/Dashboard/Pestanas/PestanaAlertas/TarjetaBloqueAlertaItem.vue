<!--
  ============================================================================
  TARJETA DE ALERTA Y RESUMEN DETALLADO IA (TarjetaBloqueAlertaItem.vue)
  ============================================================================
  Muestra la tarjeta de cada una de las 11 alertas principales (o personalizadas):
  - Conteo de personas únicas analizadas por la IA (pueden estar en más de una alerta).
  - Preguntas de menor puntaje que dispararon la alerta y respuesta predominante.
  - Nombres de personas señaladas en los comentarios de esta alerta.
  - Resumen detallado de IA de todo lo que pasa en la alerta.
  - Botón del Ojo (👁️) para inspeccionar los casos y comentarios individuales.
-->

<script setup lang="ts">
import {
  ShieldAlert,
  Users,
  MessageSquare,
  Eye,
  Flame,
  LogOut,
  AlertTriangle,
  Clock,
  DollarSign,
  BookOpen,
  Compass,
  Laptop,
  TrendingUp,
  Award,
  Sparkles,
  UserX,
  HelpCircle
} from 'lucide-vue-next'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import type { TipoAlertaPersonalizada, NivelAlerta } from '@/Almacenes/useTiposAlertas'
import type { ResumenPreguntaEnAlerta, PersonaSeñaladaEnAlerta } from '@/ia/analizadorAlertasPorPersona'

export interface BloqueAlertaItem {
  id: string
  titulo: string
  descripcion: string
  nivel: NivelAlerta
  severidad: 'Crítica' | 'Alta' | 'Moderada' | 'Baja'
  tipoConfigurado?: TipoAlertaPersonalizada
  alertas: NotificacionItem[]
  totalPersonas: number
  conComentariosCount: number
  preguntasMenorPuntaje?: ResumenPreguntaEnAlerta[]
  personasSeñaladas?: PersonaSeñaladaEnAlerta[]
  analisisDetalladoIA?: string
  esTarjetaPersonaMencionada?: boolean
  nombrePersonaMencionada?: string
  conteosPorEstado: {
    detectadas: number
    enRevision: number
    atendidas: number
    descartadas: number
  }
}

defineProps<{
  bloque: BloqueAlertaItem
  claseColorNivel: { badge: string; border: string; bg?: string; text?: string }
}>()

const emit = defineEmits<{
  (e: 'abrirBloque', bloque: BloqueAlertaItem): void
}>()

const obtenerIconoBloque = (idOTitulo: string) => {
  const t = idOTitulo.toLowerCase()
  if (t.includes('sexual')) return ShieldAlert
  if (t.includes('molestias') || t.includes('fastidio')) return AlertTriangle
  if (t.includes('sobrecarga') || t.includes('burnout')) return Flame
  if (t.includes('fuga') || t.includes('renuncia')) return LogOut
  if (t.includes('vida personal') || t.includes('desconexi')) return Clock
  if (t.includes('retribuci') || t.includes('monetaria') || t.includes('salario')) return DollarSign
  if (t.includes('capacitaci')) return BookOpen
  if (t.includes('claridad') || t.includes('rol')) return Compass
  if (t.includes('recursos') || t.includes('físicas')) return Laptop
  if (t.includes('crecimiento')) return TrendingUp
  if (t.includes('reconocimiento') || t.includes('valoraci')) return Award
  return ShieldAlert
}
</script>

<template>
  <div
    class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 relative group hover:border-amber-500/60 hover:shadow-md transition-all flex flex-col justify-between text-left"
  >
    <div class="space-y-3">
      <!-- Encabezado de la Tarjeta + Botón del Ojo -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div
            class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
            :class="bloque.nivel === 1
              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
              : bloque.nivel === 2
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'"
          >
            <component :is="obtenerIconoBloque(bloque.id + ' ' + bloque.titulo)" class="w-5 h-5" />
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span
                class="text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase"
                :class="claseColorNivel.badge"
              >
                Nivel {{ bloque.nivel }} — {{ bloque.severidad }}
              </span>
              <span
                v-if="bloque.id === 'tipo-acoso-sexual'"
                class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-pink-600 text-white uppercase"
              >
                Índole Sexual
              </span>
              <span
                v-else-if="bloque.id === 'tipo-molestias-cotidianas'"
                class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-orange-600 text-white uppercase"
              >
                Hostigamiento / Se la montan
              </span>
            </div>

            <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
              {{ bloque.titulo }}
            </h4>
          </div>
        </div>

        <!-- Botón del Ojo (👁️) para ver casos y comentarios -->
        <button
          type="button"
          @click.stop="emit('abrirBloque', bloque)"
          title="Ver casos y comentarios detallados"
          class="w-9 h-9 rounded-2xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/30 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
        >
          <Eye class="w-4 h-4" />
        </button>
      </div>

      <!-- Conteo de Personas analizadas por IA -->
      <div class="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/25 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-amber-950 dark:text-amber-200">
          <Users class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span class="text-xs font-black">
            {{ bloque.totalPersonas }} {{ bloque.totalPersonas === 1 ? 'persona en esta alerta (IA)' : 'personas en esta alerta (IA)' }}
          </span>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-amber-800 dark:text-amber-300 border border-amber-400/30">
          {{ bloque.conComentariosCount }} con comentario
        </span>
      </div>

      <!-- Criterio base de la alerta -->
      <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {{ bloque.descripcion }}
      </p>

      <!-- Preguntas de menor puntaje que dispararon esta alerta -->
      <div
        v-if="bloque.preguntasMenorPuntaje && bloque.preguntasMenorPuntaje.length > 0"
        class="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
      >
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <HelpCircle class="w-3.5 h-3.5 text-rose-500" />
          <span>Preguntas de menor puntaje vinculadas:</span>
        </p>
        <div
          v-for="preg in bloque.preguntasMenorPuntaje.slice(0, 2)"
          :key="preg.idPregunta"
          class="text-[11px] text-slate-700 dark:text-slate-300 flex items-start justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80"
        >
          <span class="font-semibold line-clamp-1">{{ preg.textoPregunta }}</span>
          <span class="shrink-0 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            {{ preg.respuestaFrecuente }}
          </span>
        </div>
      </div>

      <!-- Personas señaladas con nombre dentro de esta alerta -->
      <div
        v-if="bloque.personasSeñaladas && bloque.personasSeñaladas.length > 0"
        class="flex items-center gap-1.5 flex-wrap pt-0.5"
      >
        <span class="text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <UserX class="w-3.5 h-3.5" />
          <span>Viene de / Menciona a:</span>
        </span>
        <span
          v-for="p in bloque.personasSeñaladas"
          :key="p.nombre"
          class="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-[10px] font-black"
        >
          {{ p.nombre }} ({{ p.menciones }})
        </span>
      </div>

      <!-- Resumen Detallado de IA de lo que pasa en la alerta -->
      <div
        v-if="bloque.analisisDetalladoIA"
        class="p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/25 border border-sky-200/70 dark:border-sky-900/50 space-y-1"
      >
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1">
          <Sparkles class="w-3.5 h-3.5 text-sky-500" />
          <span>Análisis y Resumen Detallado IA:</span>
        </p>
        <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
          {{ bloque.analisisDetalladoIA }}
        </p>
      </div>
    </div>

    <!-- Pie: Botón del Ojo (👁️) para ver los casos -->
    <div class="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
      <span class="text-[10px] text-slate-400 font-medium flex items-center gap-1">
        <MessageSquare class="w-3.5 h-3.5 text-amber-500" />
        <span>Conteo por persona analizada (no por click)</span>
      </span>

      <button
        type="button"
        @click.stop="emit('abrirBloque', bloque)"
        class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
      >
        <Eye class="w-3.5 h-3.5" />
        <span>Ver Casos ({{ bloque.totalPersonas }})</span>
      </button>
    </div>
  </div>
</template>
