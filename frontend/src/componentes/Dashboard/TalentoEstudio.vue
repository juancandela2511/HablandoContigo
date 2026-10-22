<!--
  ============================================================================
  TALENTO Y BLOQUE DE ESTUDIO (TalentoEstudio.vue)
  ============================================================================
  Analítica de correlación entre formación académica / bloques de estudio
  y las respuestas de clima de los colaboradores.
-->

<script setup lang="ts">
import AnaliticaBloqueEstudio from './AnaliticaBloqueEstudio.vue'

defineProps<{
  departamentoSeleccionado?: string
  periodoSeleccionado?: string
}>()
</script>

<template>
  <div class="space-y-4">
    <AnaliticaBloqueEstudio
      :departamentoSeleccionado="departamentoSeleccionado || 'todos'"
      :periodoSeleccionado="periodoSeleccionado || 'semanal'"
    />
  </div>
</template>
