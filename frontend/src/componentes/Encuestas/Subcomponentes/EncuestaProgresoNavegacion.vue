<!--
  ============================================================================
  SUBCOMPONENTE BARRA DE PROGRESO Y NAVEGACIÓN (EncuestaProgresoNavegacion.vue)
  ============================================================================
  Maneja la barra de progreso superior, indicadores de tiempo reflexivo y los
  botones de navegación Anterior/Siguiente/Finalizar de la encuesta.
-->

<script setup lang="ts">
import { BotonBase, BotonRevelacionFlecha, InsigniaPill } from '@/componentes/ElementosBase'
import {
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-vue-next'

defineProps<{
  categoria: string
  indicePreguntaActual: number
  totalPreguntasCola: number
  porcentajeProgreso: number
  segundosRestantes: number
  tiempoMinimoCumplido: boolean
  esUltimaPregunta: boolean
  puedeAvanzar: boolean
  enviando: boolean
  esPreguntaTexto: boolean
}>()

const emit = defineEmits<{
  (e: 'avanzar'): void
  (e: 'retroceder'): void
}>()
</script>

<template>
  <div class="space-y-6 select-none font-['Poppins',sans-serif]">
    <!-- Barra de Progreso Superior -->
    <div class="space-y-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
      <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-mono">
        <div class="flex items-center gap-2 flex-wrap">
          <InsigniaPill variante="info" tamano="sm">
            <template #icono>
              <Sparkles class="w-3 h-3 text-sky-500" />
            </template>
            {{ categoria }}
          </InsigniaPill>

          <!-- Temporizador Visual Antirapidez -->
          <InsigniaPill v-if="!tiempoMinimoCumplido" variante="alerta" tamano="sm">
            <template #icono>
              <Clock class="w-3 h-3 text-amber-500 animate-pulse" />
            </template>
            <span>{{ esPreguntaTexto ? 'Redacción reflexiva' : 'Lectura reflexiva' }}: {{ segundosRestantes }}s</span>
          </InsigniaPill>
          <InsigniaPill v-else variante="exito" tamano="sm">
            <template #icono>
              <CheckCircle2 class="w-3 h-3 text-emerald-500" />
            </template>
            <span>Tiempo mínimo cumplido</span>
          </InsigniaPill>
        </div>
        <span>Paso {{ indicePreguntaActual + 1 }} de {{ totalPreguntasCola }} ({{ porcentajeProgreso }}%)</span>
      </div>

      <!-- Barra de Progreso -->
      <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-neutral-900 overflow-hidden relative">
        <div 
          class="h-full bg-gradient-to-r from-sky-400 via-white to-sky-300 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]"
          :style="{ width: `${porcentajeProgreso}%` }"
        ></div>
      </div>
    </div>

    <!-- Contenido Inyectado (Pregunta + Opciones) -->
    <slot />

    <!-- Botones de Navegación -->
    <div class="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4">
      <BotonBase
        v-if="indicePreguntaActual > 0"
        variante="fantasma"
        @click="emit('retroceder')"
        class="!px-4"
      >
        <template #iconoIzquierda>
          <ArrowLeft class="w-4 h-4" />
        </template>
        Anterior
      </BotonBase>
      <div v-else class="w-20" />

      <div class="flex items-center gap-2">
        <!-- Botón de Saltar Recomendaciones cuando es pregunta de propuestas / recomendaciones -->
        <button
          v-if="esPreguntaTexto || categoria === 'Propuestas'"
          type="button"
          @click="emit('avanzar')"
          class="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-1.5"
          title="Saltar este campo de recomendaciones adicionales"
        >
          <span>Saltar Recomendaciones ➔</span>
        </button>

        <BotonBase
          v-if="!esUltimaPregunta"
          variante="primario"
          :deshabilitado="!puedeAvanzar"
          @click="emit('avanzar')"
          class="!px-6 !py-2.5"
        >
          <span>{{ !tiempoMinimoCumplido ? `Espera (${segundosRestantes}s)` : 'Siguiente' }}</span>
          <template #iconoDerecha>
            <ArrowRight class="w-4 h-4" />
          </template>
        </BotonBase>

        <BotonRevelacionFlecha
          v-else
          :etiqueta="!tiempoMinimoCumplido ? `Espera (${segundosRestantes}s)` : (enviando ? 'Enviando...' : 'Finalizar y Enviar')"
          colorFondo="#FFFFFF"
          colorTexto="#000000"
          colorInsignia="#00c853"
          colorIcono="#FFFFFF"
          :deshabilitado="!puedeAvanzar || enviando"
          :cargando="enviando"
          @click="emit('avanzar')"
        >
          <template #icono>
            <Check class="w-5 h-5 text-white" />
          </template>
        </BotonRevelacionFlecha>
      </div>
    </div>
  </div>
</template>
