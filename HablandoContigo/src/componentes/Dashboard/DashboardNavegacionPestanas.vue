<!--
  ============================================================================
  COMPONENTE BARRA DE PESTAÑAS DEL DASHBOARD (DashboardNavegacionPestanas.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Controla el intercambio entre las 5 vistas estratégicas del Dashboard:
  1. `general`: Visión General & Métricas Clave
  2. `matriz`: Matriz de Calor & Diagnóstico de Áreas
  3. `preguntas`: Desglose Pregunta a Pregunta
  4. `alertas`: Alertas de Acoso y Convivencia (con badge de cantidad)
  5. `auditoria`: Auditoría Anónima por UUID
  
  ¿PARA QUÉ SIRVE?
  - Estructurar la navegación interna del Dashboard de forma fluida y accesible.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - DashboardView.vue: Sincroniza `pestanaActiva`.
-->

<script setup lang="ts">
import { LayoutDashboard, HelpCircle, ShieldAlert, Laptop } from 'lucide-vue-next'

defineProps<{
  pestanaActiva: 'general' | 'preguntas' | 'alertas' | 'auditoria'
  totalAlertas: number
  mostrarAlertas?: boolean
}>()

defineEmits<{
  (e: 'update:pestanaActiva', pestana: 'general' | 'preguntas' | 'alertas' | 'auditoria'): void
}>()
</script>

<template>
  <div class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 overflow-x-auto">

    <button
      @click="$emit('update:pestanaActiva', 'general')"
      :class="[
        'px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer',
        pestanaActiva === 'general'
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      ]"
    >
      <LayoutDashboard class="w-3.5 h-3.5" />
      <span>Estadísticas Generales</span>
    </button>

    <button
      @click="$emit('update:pestanaActiva', 'preguntas')"
      :class="[
        'px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer',
        pestanaActiva === 'preguntas'
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      ]"
    >
      <HelpCircle class="w-3.5 h-3.5" />
      <span>Desglose de Preguntas</span>
    </button>

    <button
      v-if="mostrarAlertas !== false"
      @click="$emit('update:pestanaActiva', 'alertas')"
      :class="[
        'px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer',
        pestanaActiva === 'alertas'
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      ]"
    >
      <ShieldAlert class="w-3.5 h-3.5 text-amber-500" />
      <span>Alertas de Convivencia</span>
      <span 
        v-if="totalAlertas > 0"
        class="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold"
      >
        {{ totalAlertas }}
      </span>
    </button>

    <button
      @click="$emit('update:pestanaActiva', 'auditoria')"
      :class="[
        'px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer',
        pestanaActiva === 'auditoria'
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      ]"
    >
      <Laptop class="w-3.5 h-3.5 text-sky-500" />
      <span>Auditoría de UUIDs</span>
    </button>

  </div>
</template>
