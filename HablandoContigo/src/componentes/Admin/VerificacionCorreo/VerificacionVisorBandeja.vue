<!--
  ============================================================================
  VISOR DE BANDEJA CORPORATIVA DE PIN (VerificacionVisorBandeja.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Simula la bandeja de correo corporativo para visualizar el PIN de 6 dígitos
  enviado en tiempo real, permitiendo copiarlo con un clic.
  
  ¿CON QUÉ SE CONECTA?
  - ModalVerificacionCorreo.vue (Componente contenedor)
-->

<script setup lang="ts">
import { ref } from 'vue'
import { MailCheck, Check, Copy } from 'lucide-vue-next'

const props = defineProps<{
  pin: string
}>()

const copiado = ref(false)

const copiarPin = () => {
  navigator.clipboard.writeText(props.pin)
  copiado.value = true
  setTimeout(() => {
    copiado.value = false
  }, 2500)
}
</script>

<template>
  <div class="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-950/80 to-sky-950/60 border border-sky-400/40 space-y-2 text-left">
    <div class="flex items-center justify-between text-[11px] text-sky-300 font-mono">
      <span class="flex items-center gap-1.5 font-bold">
        <MailCheck class="w-3.5 h-3.5 text-sky-400" />
        <span>Bandeja Corporativa: PIN Recibido</span>
      </span>
      <span class="text-slate-400">Ahora mismo</span>
    </div>

    <div class="flex items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
      <div class="space-y-0.5">
        <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Código de Seguridad:</span>
        <span class="text-xl sm:text-2xl font-black font-mono tracking-widest text-amber-400">
          {{ pin }}
        </span>
      </div>

      <button
        type="button"
        @click="copiarPin"
        class="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
        title="Copiar PIN"
      >
        <Check v-if="copiado" class="w-3.5 h-3.5 text-emerald-400" />
        <Copy v-else class="w-3.5 h-3.5 text-slate-300" />
        <span>{{ copiado ? '¡Copiado!' : 'Copiar' }}</span>
      </button>
    </div>
  </div>
</template>
