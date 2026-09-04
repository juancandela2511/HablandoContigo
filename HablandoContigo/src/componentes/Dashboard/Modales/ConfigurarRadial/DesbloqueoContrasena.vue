<!--
  ============================================================================
  BLOQUEO POR CONTRASEÑA ADMINISTRATIVA (DesbloqueoContrasena.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

defineProps<{
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'desbloquear', pass: string): void
}>()

const contrasena = ref('')
const mostrar = ref(false)

const enviar = () => {
  emit('desbloquear', contrasena.value)
}
</script>

<template>
  <div 
    @dblclick="emit('desbloquear', 'admin')"
    class="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto cursor-pointer"
    title="Doble clic para desbloquear automáticamente"
  >
    <div class="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10 hover:scale-105 transition-transform">
      <Lock class="w-8 h-8" />
    </div>

    <div class="space-y-1">
      <h4 class="text-lg font-bold text-slate-900 dark:text-white">
        Configuración Protegida
      </h4>
      <p class="text-xs text-slate-500 dark:text-neutral-400">
        Da <b>doble clic</b> en cualquier lugar para desbloquear, o pulsa el botón directo para editar y eliminar dimensiones.
      </p>
    </div>

    <div class="w-full space-y-3 pt-2">
      <BotonBase
        variante="primario"
        tamano="mediano"
        :bloqueCompleto="true"
        @click="emit('desbloquear', 'admin')"
      >
        <template #iconoIzquierdo>
          <ShieldCheck class="w-4 h-4" />
        </template>
        <span>Desbloquear para Editar y Eliminar</span>
      </BotonBase>

      <div class="text-[11px] text-slate-400 flex items-center justify-center gap-1">
        <span>⚡ Desbloqueo automático activo por doble clic</span>
      </div>
    </div>
  </div>
</template>
