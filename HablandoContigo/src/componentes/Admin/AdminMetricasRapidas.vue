<!--
  ============================================================================
  COMPONENTE TARJETAS DE MÉTRICAS RÁPIDAS DE CUENTAS (AdminMetricasRapidas.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Muestra 4 tarjetas cristalinas con indicadores clave de administración de cuentas:
  - Total de usuarios registrados
  - Cuentas activas con acceso habilitado
  - Cuentas inactivas o en lista de espera
  - Encuestas activas en gestión
  
  ¿PARA QUÉ SIRVE?
  - Brindar al administrador una visión panorámica instantánea del estado de los accesos.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useCuentas.ts: Recibe las métricas reactivas por props.
  - AdminCuentasView.vue: Componente padre que lo renderiza.
-->

<script setup lang="ts">
import { Users, UserCheck, UserX, FileSpreadsheet } from 'lucide-vue-next'

defineProps<{
  totalCuentas: number
  cuentasActivas: number
  cuentasInactivas: number
  cuentasPendientes: number
  totalEncuestasGestionadas: number
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    
    <!-- Total Cuentas -->
    <div class="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-sky-500/40 transition-all">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Usuarios</span>
        <div class="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Users class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ totalCuentas }}</span>
        <span class="text-xs text-slate-500">cuentas creadas</span>
      </div>
    </div>

    <!-- Cuentas Activas -->
    <div class="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-emerald-500/40 transition-all">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cuentas Activas</span>
        <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <UserCheck class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ cuentasActivas }}</span>
        <span class="text-xs text-slate-500">con acceso habilitado</span>
      </div>
    </div>

    <!-- Cuentas Inactivas / Pendientes -->
    <div class="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-amber-500/40 transition-all">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Inactivos / Espera</span>
        <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <UserX class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ cuentasInactivas + cuentasPendientes }}</span>
        <span class="text-xs text-slate-500">{{ cuentasPendientes }} pendientes</span>
      </div>
    </div>

    <!-- Encuestas Asignadas -->
    <div class="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-indigo-500/40 transition-all">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Encuestas en Gestión</span>
        <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <FileSpreadsheet class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl font-bold text-sky-600 dark:text-sky-400">{{ totalEncuestasGestionadas }}</span>
        <span class="text-xs text-slate-500">encuestas activas</span>
      </div>
    </div>

  </div>
</template>
