<!--
  ============================================================================
  SELECTOR DE CUENTAS DEMO DE PRUEBA (SelectorCuentasDemo.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Sparkles, UserCheck } from 'lucide-vue-next'

defineProps<{
  cuentasDemo: Array<{ rol: string; email: string; desc: string }>
}>()

const emit = defineEmits<{
  (e: 'seleccionar', email: string): void
}>()
</script>

<template>
  <div class="space-y-3 pt-3 border-t border-slate-800 text-left">
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
        <Sparkles class="w-3.5 h-3.5 text-sky-400" />
        <span>Cuentas de Demostración:</span>
      </span>
      <span class="text-[10px] text-slate-500 font-mono">Clave: Admin123*</span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="c in cuentasDemo"
        :key="c.email"
        type="button"
        @click="emit('seleccionar', c.email)"
        class="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 text-left transition-all cursor-pointer group"
      >
        <div class="flex items-center gap-1.5 mb-1">
          <UserCheck class="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span class="text-[11px] font-bold text-white group-hover:text-sky-400 transition-colors truncate">
            {{ c.rol }}
          </span>
        </div>
        <p class="text-[10px] text-slate-400 truncate">{{ c.email }}</p>
      </button>
    </div>
  </div>
</template>
