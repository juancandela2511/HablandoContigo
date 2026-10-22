<!--
  ============================================================================
  COMPONENTE PROBADOR EMOCIONAL INTERACTIVO (HeroProbadorEmocional.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Tarjeta interactiva 3D que permite al usuario probar en vivo la respuesta del sistema:
  - Selector de 5 estados emocionales (Sobrecargado, Desmotivado, Neutral, Positivo, Excelente).
  - Feedback visual instantáneo con cambio dinámico de color y diagnóstico empático.
  - Demostración visual de la adaptabilidad en tiempo real.
  
  ¿PARA QUÉ SIRVE?
  - Permitir a los visitantes experimentar la respuesta humana y adaptativa de la plataforma.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - HeroPrincipal.vue: Componente padre que lo monta en la portada.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, HeartHandshake } from 'lucide-vue-next'

const nivelSeleccionado = ref(4)

const opcionesEmocionales = [
  { valor: 1, emoji: '😫', label: 'Sobrecargado', desc: 'Activa protocolo de apoyo y preguntas confidenciales de seguimiento', color: 'border-red-500/50 bg-red-500/10 text-red-400' },
  { valor: 2, emoji: '😕', label: 'Desmotivado', desc: 'Detecta fricción en liderazgo y carga operativa', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
  { valor: 3, emoji: '😐', label: 'Neutral', desc: 'Evalúa equilibrio de tareas y recursos informáticos', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
  { valor: 4, emoji: '🙂', label: 'Positivo', desc: 'Omite preguntas de relleno y agiliza la encuesta', color: 'border-sky-500/50 bg-sky-500/10 text-sky-400' },
  { valor: 5, emoji: '🚀', label: 'Excelente', desc: 'Consolida cultura de alto desempeño y bienestar', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' }
]

const opcionActual = computed(() => {
  return opcionesEmocionales.find(o => o.valor === nivelSeleccionado.value) || opcionesEmocionales[3]
})
</script>

<template>
  <div class="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] space-y-6 relative overflow-hidden group hover:border-sky-500/40 transition-all">
    
    <div class="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="text-left space-y-1">
      <span class="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
        <Sparkles class="w-3.5 h-3.5" />
        Experiencia Adaptativa en Vivo
      </span>
      <h3 class="text-lg font-bold text-white">¿Cómo sientes hoy el clima de tu equipo?</h3>
    </div>

    <!-- Botones de Selección de Estado de Ánimo -->
    <div class="grid grid-cols-5 gap-2">
      <button
        v-for="opc in opcionesEmocionales"
        :key="opc.valor"
        type="button"
        @click="nivelSeleccionado = opc.valor"
        :class="[
          'p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer',
          nivelSeleccionado === opc.valor
            ? 'scale-105 shadow-lg shadow-sky-500/20 ' + opc.color
            : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-400'
        ]"
      >
        <span class="text-2xl">{{ opc.emoji }}</span>
        <span class="text-[10px] font-semibold truncate w-full">{{ opc.label }}</span>
      </button>
    </div>

    <!-- Feedback Adaptativo en Tiempo Real -->
    <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-1.5">
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold text-white flex items-center gap-1.5">
          <HeartHandshake class="w-4 h-4 text-sky-400" />
          Respuesta del Algoritmo Adaptativo:
        </span>
        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full" :class="opcionActual?.color">
          Nivel {{ nivelSeleccionado }}/5
        </span>
      </div>
      <p class="text-xs text-slate-400 leading-relaxed">
        {{ opcionActual?.desc }}
      </p>
    </div>

  </div>
</template>
