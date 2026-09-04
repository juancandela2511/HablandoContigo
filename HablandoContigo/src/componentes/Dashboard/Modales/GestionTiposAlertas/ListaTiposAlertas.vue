<!--
  ============================================================================
  LISTA DE 3 ALERTAS CONFIGURADAS (ListaTiposAlertas.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Presenta las 3 alertas del sistema y permite editar directamente en cada una:
  1. Nombre de la alerta.
  2. ¿De qué trata la alerta? (Descripción/Enfoque).
  3. Palabras clave para definirla y activarla más rápido.
-->

<script setup lang="ts">
import { ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-vue-next'
import TarjetaTipoAlertaItem from './TarjetaTipoAlertaItem.vue'
import type { TipoAlertaPersonalizada, NivelAlerta } from '@/Almacenes/useTiposAlertas'

defineProps<{
  tiposAlertas: TipoAlertaPersonalizada[]
  tiposFiltrados: TipoAlertaPersonalizada[]
  obtenerClaseColorNivel: (nivel: NivelAlerta) => { badge: string; border: string; bg?: string; text?: string; glow?: string }
}>()

const emit = defineEmits<{
  (e: 'guardarEdicion', datos: { id: string; nombre: string; descripcion: string; palabrasClave: string[] }): void
  (e: 'toggleActiva', id: string): void
}>()
</script>

<template>
  <div class="space-y-4 text-left">
    <!-- Encabezado Informativo de las 3 Alertas -->
    <div class="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
          <ShieldAlert class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-sky-950 dark:text-sky-200">
            3 Criterios de Alertas Activas en Supabase
          </h4>
          <p class="text-[11px] text-sky-800/80 dark:text-sky-300/80">
            Puedes editar el nombre, de qué trata y las palabras clave de cada alerta para calibrar la detección de IA.
          </p>
        </div>
      </div>

      <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-[10px] font-mono font-bold text-sky-700 dark:text-sky-300 shrink-0">
        <CheckCircle2 class="w-3 h-3 text-emerald-500" />
        <span>3 de 3 Calibradas</span>
      </div>
    </div>

    <!-- Lista de las 3 Tarjetas de Alerta -->
    <div class="space-y-3">
      <TarjetaTipoAlertaItem
        v-for="tipo in tiposAlertas.slice(0, 3)"
        :key="tipo.id"
        :tipo="tipo"
        :claseColorNivel="obtenerClaseColorNivel(tipo.nivel)"
        @guardarEdicion="emit('guardarEdicion', $event)"
        @toggleActiva="emit('toggleActiva', $event)"
      />
    </div>
  </div>
</template>
