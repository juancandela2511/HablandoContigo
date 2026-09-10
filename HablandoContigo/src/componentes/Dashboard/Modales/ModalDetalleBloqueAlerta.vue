<!--
  ============================================================================
  MODAL INSPECCIÓN DE BLOQUE DE ALERTAS Y COMENTARIOS (ModalDetalleBloqueAlerta.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Modal modular para visualizar todas las personas y respuestas que activaron un
  bloque específico de alerta psicosocial:
  - Resumen métrico del bloque: Total personas que activaron la alerta.
  - Filtro por estado interno (Todas, Detectadas, En Revisión, Atendidas, Descartadas).
  - Tarjetas de respuestas mostrando DENTRO el comentario de cada colaborador ("Lo que escribió el colaborador").
  - Botones de acción rápida para cambiar estado individualmente en Supabase.
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
  AlertTriangle,
  XCircle,
  Eye,
  Building,
  Target,
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
    :titulo="bloque ? `Bloque: ${bloque.titulo}` : 'Detalle de Bloque'"
    subtitulo="Visualiza todas las respuestas, dispositivos y comentarios dejados por los colaboradores para este bloque de alerta."
    anchoMaximo="4xl"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
        <Users class="w-5 h-5" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="critico" tamano="sm">
        Nivel {{ bloque?.nivel || 2 }} — {{ bloque?.severidad || 'Alta' }}
      </InsigniaPill>
    </template>

    <div v-if="bloque" class="space-y-5 text-left font-['Poppins',sans-serif]">
      <!-- Encabezado Métrico del Bloque -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-2xl font-black text-slate-900 dark:text-amber-200">
              {{ bloque.totalPersonas }}
            </span>
            <span class="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
              {{ bloque.totalPersonas === 1 ? 'Persona / Respuesta registrada' : 'Personas que dieron clic / activaron esta alerta' }}
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300">
            {{ bloque.descripcion }}
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-800 text-xs font-bold text-slate-800 dark:text-amber-300 flex items-center gap-1.5 shadow-sm">
            <MessageSquare class="w-4 h-4 text-sky-500" />
            <span>{{ bloque.conComentariosCount }} con texto</span>
          </span>
        </div>
      </div>

      <!-- Protocolo / Foco de Alerta -->
      <div v-if="bloque.tipoConfigurado?.enfoqueDetalle" class="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 flex items-start gap-2.5 text-xs text-sky-900 dark:text-sky-200">
        <Target class="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
        <div>
          <strong>Instrucción / Foco de Alerta:</strong>
          <span class="ml-1 text-slate-700 dark:text-sky-300">{{ bloque.tipoConfigurado.enfoqueDetalle }}</span>
        </div>
      </div>

      <!-- Barra de Filtro de Estado Interno -->
      <div class="flex items-center gap-1.5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-850 text-xs flex-wrap border border-slate-200 dark:border-slate-800">
        <span class="text-[11px] font-semibold text-slate-400 px-2">Filtro por estado:</span>

        <button
          type="button"
          @click="filtroEstadoInterno = 'todas'"
          :class="[
            'px-3 py-1 rounded-xl font-medium transition-all text-xs cursor-pointer',
            filtroEstadoInterno === 'todas' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
          ]"
        >
          Todas ({{ bloque.alertas.length }})
        </button>

        <button
          type="button"
          @click="filtroEstadoInterno = 'Detectada'"
          :class="[
            'px-3 py-1 rounded-xl font-medium transition-all text-xs flex items-center gap-1 cursor-pointer',
            filtroEstadoInterno === 'Detectada' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-amber-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-800'
          ]"
        >
          <AlertTriangle class="w-3 h-3" />
          <span>Nuevas / Detectadas ({{ bloque.conteosPorEstado.detectadas }})</span>
        </button>

        <button
          type="button"
          @click="filtroEstadoInterno = 'En Revisión'"
          :class="[
            'px-3 py-1 rounded-xl font-medium transition-all text-xs flex items-center gap-1 cursor-pointer',
            filtroEstadoInterno === 'En Revisión' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-sky-600 dark:text-sky-400 hover:bg-white dark:hover:bg-slate-800'
          ]"
        >
          <Clock class="w-3 h-3" />
          <span>En Revisión ({{ bloque.conteosPorEstado.enRevision }})</span>
        </button>

        <button
          type="button"
          @click="filtroEstadoInterno = 'Atendida'"
          :class="[
            'px-3 py-1 rounded-xl font-medium transition-all text-xs flex items-center gap-1 cursor-pointer',
            filtroEstadoInterno === 'Atendida' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-800'
          ]"
        >
          <CheckCircle2 class="w-3 h-3" />
          <span>Atendidas ({{ bloque.conteosPorEstado.atendidas }})</span>
        </button>

        <button
          type="button"
          @click="filtroEstadoInterno = 'Descartada'"
          :class="[
            'px-3 py-1 rounded-xl font-medium transition-all text-xs flex items-center gap-1 cursor-pointer',
            filtroEstadoInterno === 'Descartada' ? 'bg-slate-600 text-white font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
          ]"
        >
          <XCircle class="w-3 h-3" />
          <span>Descartadas ({{ bloque.conteosPorEstado.descartadas }})</span>
        </button>
      </div>

      <!-- Lista de Respuestas / Colaboradores -->
      <div class="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
        <div
          v-for="(alerta, index) in alertasFiltradasInternas"
          :key="alerta.id"
          class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-amber-400/50 transition-all"
        >
          <!-- Encabezado de la Respuesta Individual -->
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2 text-xs">
              <span class="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold flex items-center justify-center text-[11px]">
                #{{ index + 1 }}
              </span>
              <span class="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                <Laptop class="w-3.5 h-3.5 text-slate-400" />
                {{ alerta.nombreEquipoPC || 'PC-CORP' }}
              </span>
              <span class="text-slate-400 text-[10px]">
                ({{ alerta.dispositivoUUID ? alerta.dispositivoUUID.substring(0, 8) + '...' : 'UUID Anónimo' }})
              </span>
              <span class="text-slate-400 text-[11px] flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                <Building class="w-3 h-3" />
                {{ alerta.departamento || 'General' }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Clock class="w-3 h-3" />
                {{ alerta.fecha }} - {{ alerta.hora }}
              </span>

              <!-- Badge de Estado -->
              <span 
                :class="[
                  'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border',
                  alerta.estado === 'Descartada'
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    : alerta.estado === 'Atendida'
                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : alerta.estado === 'En Revisión'
                    ? 'bg-sky-100 dark:bg-sky-950 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-400'
                    : 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                ]"
              >
                {{ alerta.estado || 'Detectada' }}
              </span>
            </div>
          </div>

          <!-- LO QUE ESCRIBIÓ EL COLABORADOR (SECCIÓN DESTACADA) -->
          <div
            v-if="alerta.detalleRespuesta && alerta.detalleRespuesta.trim().length > 0"
            class="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 space-y-1.5 shadow-xs"
          >
            <p class="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <MessageSquare class="w-3.5 h-3.5" />
              <span>💬 Lo que escribió el colaborador:</span>
            </p>
            <p class="text-xs font-medium text-amber-950 dark:text-amber-100 leading-relaxed italic">
              "{{ alerta.detalleRespuesta }}"
            </p>
          </div>
          <div v-else class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-[11px] text-slate-400 italic">
            El colaborador activó esta alerta al seleccionar la opción correspondiente sin redactar texto adicional.
          </div>

          <!-- Motivo o Mensaje del Sistema -->
          <div class="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p class="line-clamp-2">
              <strong class="text-slate-700 dark:text-slate-300">Motivo detectado:</strong> {{ alerta.mensaje || alerta.descripcion }}
            </p>
          </div>

          <!-- Acciones Rápidas sobre la Respuesta Individual -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
            <span class="text-[11px] text-slate-400 font-medium">
              Sede: {{ alerta.ubicacionSede || 'Sede Principal' }}
            </span>

            <div class="flex items-center gap-1.5">
              <!-- Cambiar Estado a Atendida -->
              <button
                type="button"
                v-if="alerta.estado !== 'Atendida'"
                @click="emit('cambiarEstado', alerta.id, 'Atendida')"
                class="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 class="w-3 h-3" />
                <span>Marcar Atendida</span>
              </button>

              <!-- Cambiar Estado a En Revisión -->
              <button
                type="button"
                v-if="alerta.estado !== 'En Revisión'"
                @click="emit('cambiarEstado', alerta.id, 'En Revisión')"
                class="px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[11px] font-bold hover:bg-sky-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Clock class="w-3 h-3" />
                <span>En Revisión</span>
              </button>

              <!-- Botón Ver Ficha Individual -->
              <button
                type="button"
                @click="emit('inspeccionarAlerta', alerta)"
                class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Eye class="w-3 h-3 text-amber-500" />
                <span>Examinar Ficha</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="alertasFiltradasInternas.length === 0" class="py-10 text-center text-slate-400 text-xs">
          No hay respuestas para el filtro seleccionado en este bloque.
        </div>
      </div>
    </div>

    <template #pie>
      <div class="flex items-center justify-between w-full">
        <span class="text-xs text-slate-400 flex items-center gap-1">
          <ShieldCheck class="w-4 h-4 text-emerald-500" />
          <span>Respuestas protegidas y registradas en Supabase</span>
        </span>

        <BotonBase
          variante="primario"
          tamano="pequeno"
          @click="emit('cerrar')"
        >
          Cerrar Bloque
        </BotonBase>
      </div>
    </template>
  </ModalBase>
</template>
