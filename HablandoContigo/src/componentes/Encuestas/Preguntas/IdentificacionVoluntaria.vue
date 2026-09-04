<!--
  ============================================================================
  MÓDULO DE IDENTIFICACIÓN VOLUNTARIA (IdentificacionVoluntaria.vue)
  ============================================================================
-->

<script setup lang="ts">
import { UserCheck } from 'lucide-vue-next'

defineProps<{
  dejarNombreVoluntario?: boolean
  nombreVoluntario?: string
}>()

defineEmits<{
  (e: 'update:dejarNombreVoluntario', valor: boolean): void
  (e: 'update:nombreVoluntario', valor: string): void
}>()
</script>

<template>
  <div class="p-4 rounded-2xl bg-slate-100 dark:bg-neutral-950/80 border border-slate-200 dark:border-white/10 space-y-3 text-left animate-fadeIn">
    <div class="flex items-start gap-3">
      <input
        id="check-identificacion-voluntaria"
        type="checkbox"
        :checked="dejarNombreVoluntario"
        @change="$emit('update:dejarNombreVoluntario', ($event.target as HTMLInputElement).checked)"
        class="mt-1 w-4 h-4 rounded text-sky-600 dark:text-white bg-white dark:bg-neutral-900 border-slate-300 dark:border-neutral-700 cursor-pointer focus:ring-0"
      />
      <label for="check-identificacion-voluntaria" class="text-xs text-slate-700 dark:text-neutral-300 cursor-pointer space-y-0.5">
        <strong class="text-slate-900 dark:text-white block flex items-center gap-1.5">
          <UserCheck class="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          Identificación Voluntaria (Opcional)
        </strong>
        <p class="text-slate-500 dark:text-neutral-400 text-[11px] leading-relaxed">
          Tu respuesta es 100% anónima de forma predeterminada. Marca esta casilla únicamente si deseas que Talento Humano conozca tu nombre para brindarte apoyo directo.
        </p>
      </label>
    </div>

    <!-- Campo de Nombre Desplegable -->
    <div v-if="dejarNombreVoluntario" class="pl-7 pt-1 animate-fadeIn">
      <input
        :value="nombreVoluntario"
        @input="$emit('update:nombreVoluntario', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Tu nombre completo o cargo (opcional)..."
        class="w-full py-2 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
      />
    </div>
  </div>
</template>
