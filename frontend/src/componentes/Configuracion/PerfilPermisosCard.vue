<script setup lang="ts">
import { computed } from 'vue'
import { Shield, Check } from 'lucide-vue-next'
import { PERMISOS_POR_ROL } from '@/Almacenes/useCuentas'
import type { RolCuenta } from '@/shared/types/common.types'

const props = defineProps<{
  rol: RolCuenta
}>()

const permisos = computed(() => PERMISOS_POR_ROL[props.rol] || PERMISOS_POR_ROL['Administrador'])
</script>

<template>
  <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-left">
    <div class="flex items-center gap-2">
      <Shield class="w-4 h-4 text-sky-500" />
      <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Permisos de Tu Rol</h4>
    </div>
    <div class="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
      <div v-for="(val, clave) in permisos" :key="clave" class="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
        <span class="capitalize">{{ String(clave) }}</span>
        <span :class="val ? 'text-emerald-500 font-bold flex items-center gap-1' : 'text-slate-400 font-normal'">
          <Check v-if="val" class="w-3.5 h-3.5" />
          {{ val ? 'Permitido' : 'No permitido' }}
        </span>
      </div>
    </div>
  </div>
</template>
