<!--
  ============================================================================
  ACCIONES DE ESTADO DE LA ALERTA (DetalleAlertaAccionesEstado.vue)
  ============================================================================
-->

<script setup lang="ts">
import { CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

defineProps<{
  alertaId: string
  estadoActual: string
}>()

const emit = defineEmits<{
  (e: 'cambiarEstado', id: string, nuevoEstado: 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'): void
}>()
</script>

<template>
  <div class="space-y-2 text-left pt-2 border-t border-slate-200 dark:border-slate-800">
    <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200">
      Gestión de Estado de la Alerta:
    </h5>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <!-- 1. Detectada / Reabrir -->
      <BotonBase
        :variante="estadoActual === 'Detectada' ? 'primario' : 'esquema'"
        tamano="xs"
        @click="emit('cambiarEstado', alertaId, 'Detectada')"
      >
        <template #iconoIzquierdo>
          <RotateCcw class="w-3 h-3" />
        </template>
        <span>Detectada</span>
      </BotonBase>

      <!-- 2. En Revisión -->
      <BotonBase
        :variante="estadoActual === 'En Revisión' ? 'primario' : 'esquema'"
        tamano="xs"
        @click="emit('cambiarEstado', alertaId, 'En Revisión')"
      >
        <template #iconoIzquierdo>
          <Clock class="w-3 h-3" />
        </template>
        <span>En Revisión</span>
      </BotonBase>

      <!-- 3. Atendida / Resuelta -->
      <BotonBase
        :variante="estadoActual === 'Atendida' ? 'exito' : 'esquema'"
        tamano="xs"
        @click="emit('cambiarEstado', alertaId, 'Atendida')"
      >
        <template #iconoIzquierdo>
          <CheckCircle2 class="w-3 h-3" />
        </template>
        <span>Atendida</span>
      </BotonBase>

      <!-- 4. Descartada -->
      <BotonBase
        :variante="estadoActual === 'Descartada' ? 'peligro' : 'esquema'"
        tamano="xs"
        @click="emit('cambiarEstado', alertaId, 'Descartada')"
      >
        <template #iconoIzquierdo>
          <XCircle class="w-3 h-3" />
        </template>
        <span>Descartar</span>
      </BotonBase>
    </div>
  </div>
</template>
