<!--
  ============================================================================
  ANÁLISIS DE PUNTOS DE LA EMPRESA & SUGERENCIAS (SugerenciasOrganizacionales.vue)
  ============================================================================
  Muestra los puntos clave de la empresa (Económico, Tecnología, Infraestructura,
  Cultura) con diseño limpio y directo sin exceso de texto.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Lightbulb, Link2, Cpu, Building2, DollarSign, Smile } from 'lucide-vue-next'
import { useSugerenciasOrganizacionales } from '@/Almacenes/useSugerenciasOrganizacionales'
import ModalVincularPreguntasSugerencias from './ModalVincularPreguntasSugerencias.vue'

const { sugerenciasConMetricas } = useSugerenciasOrganizacionales()
const modalVinculacionAbierto = ref(false)

const mapaIconosSugerencias: Record<string, any> = {
  Cpu,
  Building2,
  DollarSign,
  Smile,
  Lightbulb
}
</script>

<template>
  <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 text-left">
    <!-- Encabezado Directo -->
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
          <Lightbulb class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white">
          Puntos de la Empresa & Áreas de Mejora
        </h3>
      </div>

      <button
        type="button"
        @click="modalVinculacionAbierto = true"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer border border-amber-500/20"
      >
        <Link2 class="w-3 h-3" />
        <span>Vincular</span>
      </button>
    </div>

    <!-- Lista Compacta de Dimensiones (Económico, TI, Infraestructura, Cultura) -->
    <div class="space-y-2.5">
      <div
        v-for="sug in sugerenciasConMetricas"
        :key="sug.id"
        class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <component
              :is="mapaIconosSugerencias[sug.icono] || Lightbulb"
              class="w-4 h-4 shrink-0"
              :style="{ color: sug.color }"
            />
            <span class="text-xs font-bold text-slate-900 dark:text-white">
              {{ sug.categoria }}
            </span>
          </div>
          <span class="text-xs font-black font-mono" :style="{ color: sug.color }">
            {{ sug.porcentaje }}%
          </span>
        </div>

        <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: `${sug.porcentaje}%`, backgroundColor: sug.color }"
          ></div>
        </div>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {{ sug.accionSugerida }}
        </p>
      </div>
    </div>

    <ModalVincularPreguntasSugerencias
      :abierto="modalVinculacionAbierto"
      @cerrar="modalVinculacionAbierto = false"
    />
  </div>
</template>
