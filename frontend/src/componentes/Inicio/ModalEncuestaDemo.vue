<!--
  ============================================================================
  MODAL DE ENCUESTA RÁPIDA DE DEMOSTRACIÓN (ModalEncuestaDemo.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Permite al visitante responder una encuesta de prueba directamente desde la portada:
  - Construido sobre el componente estándar ModalBase.
  - Lista de encuestas activas para elegir.
  - Garantía de anonimato y confidencialidad.
-->

<script setup lang="ts">
import type { Encuesta } from '@/Almacenes/useEncuestas'
import { ModalBase, InsigniaPill } from '@/componentes/ElementosBase'
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-vue-next'

defineProps<{
  abierto: boolean
  encuestas: Encuesta[]
}>()

defineEmits<{
  (e: 'cerrar'): void
  (e: 'seleccionarEncuesta', id: string): void
}>()
</script>

<template>
  <ModalBase
    :abierto="abierto"
    titulo="Selecciona una Encuesta Activa"
    subtitulo="Tu participación es 100% confidencial. No requerimos login ni datos personales."
    anchoMaximo="lg"
    @cerrar="$emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
        <Sparkles class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="exito" tamano="sm" :conPulso="true">
        ANÓNIMO
      </InsigniaPill>
    </template>

    <!-- Lista de Encuestas Disponibles -->
    <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
      <div
        v-for="enc in encuestas"
        :key="enc.id"
        @click="$emit('seleccionarEncuesta', enc.id)"
        class="p-4 rounded-2xl bg-slate-100/70 dark:bg-neutral-950/80 border border-slate-200 dark:border-white/10 hover:border-sky-500/50 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div class="space-y-1 pr-3">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
            {{ enc.departamento }}
          </span>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
            {{ enc.titulo }}
          </h4>
          <p class="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1">
            {{ enc.descripcion }}
          </p>
        </div>

        <div class="w-8 h-8 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center text-slate-400 shrink-0 transition-colors">
          <ArrowRight class="w-4 h-4" />
        </div>
      </div>
    </div>

    <template #pie>
      <div class="w-full text-center">
        <p class="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
          <span>Protegido por UUID criptográfico anónimo de hardware</span>
        </p>
      </div>
    </template>
  </ModalBase>
</template>
