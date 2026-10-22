<!--
  ============================================================================
  SUB-SECCIÓN DE SUGERENCIAS ORGANIZACIONALES (GeneralSeccionSugerencias.vue)
  ============================================================================
-->
<script setup lang="ts">
import { 
  Lightbulb, 
  Link2, 
  Cpu, 
  Building2, 
  DollarSign, 
  Smile 
} from 'lucide-vue-next'

const mapaIconosSugerencias: Record<string, any> = {
  Cpu,
  Building2,
  DollarSign,
  Smile,
  Lightbulb
}

defineProps<{
  sugerenciasConMetricas: Array<{
    id: string
    categoria: string
    icono: string
    color: string
    totalPreguntasVinculadas: number
    porcentaje: number
    accionSugerida: string
    ejemplosTexto?: string[]
  }>
}>()

const emit = defineEmits<{
  (e: 'abrirModalVinculacion'): void
}>()
</script>

<template>
  <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
          <Lightbulb class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white">
            Sugerencias Organizacionales
          </h3>
          <p class="text-[11px] text-slate-500">
            Clasificación automática de recomendaciones constructivas.
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="emit('abrirModalVinculacion')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer border border-amber-500/20 shadow-xs"
        title="Vincular preguntas de las encuestas a las dimensiones de sugerencias"
      >
        <Link2 class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="sug in sugerenciasConMetricas"
        :key="sug.id"
        class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 transition-all hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <component 
              :is="mapaIconosSugerencias[sug.icono] || Lightbulb" 
              class="w-4 h-4"
              :style="{ color: sug.color }"
            />
            <span class="text-xs font-bold text-slate-900 dark:text-white">
              {{ sug.categoria }}
            </span>
            <span 
              class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              :style="{ backgroundColor: `${sug.color}15`, color: sug.color }"
            >
              {{ sug.totalPreguntasVinculadas }} pregs
            </span>
          </div>
          <span 
            class="text-xs font-black"
            :style="{ color: sug.color }"
          >
            {{ sug.porcentaje }}%
          </span>
        </div>

        <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: `${sug.porcentaje}%`, backgroundColor: sug.color }"
          ></div>
        </div>

        <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          💡 <span class="font-semibold text-slate-700 dark:text-slate-300">Plan:</span> {{ sug.accionSugerida }}
        </p>

        <div v-if="sug.ejemplosTexto && sug.ejemplosTexto.length > 0" class="pt-1">
          <span class="text-[10px] text-slate-400 italic block truncate">
            💬 "{{ sug.ejemplosTexto[0] }}"
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
