<!--
  ============================================================================
  MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE CUENTA (ModalEliminarCuenta.vue)
  ============================================================================
-->

<script setup lang="ts">
import type { CuentaAdmin } from '@/Almacenes/useCuentas'
import { ModalBase, BotonBase } from '@/componentes/ElementosBase'
import { AlertTriangle, Trash2 } from 'lucide-vue-next'

defineProps<{
  abierto: boolean
  cuenta: CuentaAdmin | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'confirmar'): void
}>()
</script>

<template>
  <ModalBase
    :abierto="abierto"
    titulo="¿Eliminar cuenta de acceso?"
    subtitulo="Esta acción revocará inmediatamente todos los permisos en Supabase."
    anchoMaximo="sm"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
        <AlertTriangle class="w-4 h-4" />
      </div>
    </template>

    <div class="space-y-2 text-center py-1">
      <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Estás a punto de remover la cuenta de <strong class="text-slate-900 dark:text-white">{{ cuenta?.nombre }}</strong> ({{ cuenta?.email }}). Esta acción no se puede deshacer.
      </p>
    </div>

    <template #pie>
      <div class="flex items-center justify-end gap-2 w-full">
        <BotonBase
          variante="secundario"
          tamano="pequeno"
          @click="emit('cerrar')"
        >
          Cancelar
        </BotonBase>

        <BotonBase
          variante="peligro"
          tamano="pequeno"
          @click="emit('confirmar')"
        >
          <template #iconoIzquierdo>
            <Trash2 class="w-3.5 h-3.5" />
          </template>
          <span>Sí, Eliminar</span>
        </BotonBase>
      </div>
    </template>
  </ModalBase>
</template>
