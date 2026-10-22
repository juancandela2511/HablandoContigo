<!--
  ============================================================================
  TARJETA DE SUGERENCIA DE ALERTAS OLLAMA (TarjetaNotificacionAlertas.vue)
  ============================================================================
  Muestra la notificación interactiva:
  "Te sugiero crear estas alertas: ¿Sí o No?" con botones para crear individualmente
  o todas en un solo clic.
-->

<script setup lang="ts">
import type { SugerenciaAlertaIA } from '@/asistenteOllama/tiposAsistente'
import { ShieldAlert, Check, X, Sparkles } from 'lucide-vue-next'

defineProps<{
  sugerencias: SugerenciaAlertaIA[]
}>()

const emit = defineEmits<{
  (e: 'aceptarUna', sug: SugerenciaAlertaIA): void
  (e: 'rechazarUna', id: string): void
  (e: 'aceptarTodas'): void
  (e: 'rechazarTodas'): void
}>()
</script>

<template>
  <div
    v-if="sugerencias.length > 0"
    class="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/30 space-y-3 text-left"
  >
    <!-- Cabecera tipo Mini-Notificación Sí / No -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
          <ShieldAlert class="w-4 h-4" />
        </div>
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1">
            <Sparkles class="w-3 h-3" />
            <span>Sugerencia de Alertas · Ollama IA</span>
          </span>
          <h4 class="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
            Te sugiero crear estas alertas psicosociales. ¿Deseas crearlas?
          </h4>
        </div>
      </div>

      <!-- Botones globales Sí / No -->
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          @click="emit('aceptarTodas')"
          class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-xs transition-all active:scale-95"
          title="Crear todas las alertas sugeridas"
        >
          <Check class="w-3 h-3" />
          <span>Sí ({{ sugerencias.length }})</span>
        </button>
        <button
          type="button"
          @click="emit('rechazarTodas')"
          class="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
          title="Descartar sugerencias de alertas"
        >
          <X class="w-3 h-3" />
          <span>No</span>
        </button>
      </div>
    </div>

    <!-- Listado de alertas sugeridas -->
    <div class="space-y-2">
      <div
        v-for="alerta in sugerencias"
        :key="alerta.id"
        class="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3"
      >
        <div class="space-y-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-black text-slate-900 dark:text-white">
              {{ alerta.nombre }}
            </span>
            <span class="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] font-mono font-bold uppercase">
              Nivel {{ alerta.nivel }} · {{ alerta.severidad }}
            </span>
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {{ alerta.motivoIA || alerta.descripcion }}
          </p>
          <div class="flex items-center gap-1 flex-wrap pt-0.5">
            <span
              v-for="kw in alerta.palabrasClave.slice(0, 4)"
              :key="kw"
              class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono text-slate-500 dark:text-slate-400"
            >
              #{{ kw }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            @click="emit('aceptarUna', alerta)"
            class="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white text-[10px] font-extrabold transition-all cursor-pointer"
          >
            Sí, crear
          </button>
          <button
            type="button"
            @click="emit('rechazarUna', alerta.id)"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title="Omitir"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
