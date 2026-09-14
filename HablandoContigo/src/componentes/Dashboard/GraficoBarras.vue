<!--
  ============================================================================
  COMPONENTE GRÁFICO DE BARRAS DE PROGRESO POR CATEGORÍAS (GraficoBarras.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Renderiza barras horizontales fluidas con gradientes cromáticos adaptativos 
  según el nivel de cumplimiento o riesgo (Verde esmeralda >=80%, Azul cielo 75-79%, 
  Ámbar naranja <75%), acompañadas de badges porcentuales y conteo de respuestas.
  
  ¿PARA QUÉ SIRVE?
  - Representar comparativas directas entre dimensiones, períodos y áreas organizacionales.
  - Ofrecer una lectura visual rápida de métricas en formato tabular simplificado.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - DashboardView.vue: Panel de comparativas temporales e índices por área.
-->

<script setup lang="ts">
/**
 * Estructura de un ítem de barra gráfica
 */
export interface ItemBarra {
  categoria: string
  puntaje: number
  porcentaje: number
  respuestas: number
  nivelAlerta?: string
}

withDefaults(
  defineProps<{
    datos: ItemBarra[]
    titulo?: string
    subtitulo?: string
  }>(),
  {
    titulo: 'Comparativa de Dimensiones por Porcentaje',
    subtitulo: 'Puntuación relativa y nivel de cumplimiento'
  }
)

/**
 * Retorna las clases de gradiente cromático según el porcentaje y respuestas
 * Bajo / Crítico / Riesgo (< 55%): Rojo
 * Medio / Atención / Moderado (55% - 74%): Amarillo
 * Alto / Óptimo (>= 75%): Azul
 */
const obtenerColorBarra = (porcentaje: number, nivelAlerta?: string) => {
  if (nivelAlerta === 'Sin datos' || porcentaje <= 0) {
    return 'from-slate-400 to-slate-500 dark:from-slate-700 dark:to-slate-800'
  }
  if (nivelAlerta === 'Critico' || nivelAlerta === 'Riesgo' || porcentaje < 55) {
    return 'from-red-600 via-rose-500 to-red-500'
  }
  if (nivelAlerta === 'Moderado' || nivelAlerta === 'Atencion' || porcentaje < 75) {
    return 'from-amber-500 via-amber-400 to-yellow-500'
  }
  return 'from-sky-500 via-blue-600 to-indigo-600'
}

/**
 * Retorna las clases del badge según el nivel de puntaje
 */
const obtenerBadgeClase = (porcentaje: number, nivelAlerta?: string) => {
  if (nivelAlerta === 'Sin datos' || porcentaje <= 0) {
    return 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
  }
  if (nivelAlerta === 'Critico' || nivelAlerta === 'Riesgo' || porcentaje < 55) {
    return 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
  }
  if (nivelAlerta === 'Moderado' || nivelAlerta === 'Atencion' || porcentaje < 75) {
    return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
  }
  return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
}
</script>

<template>
  <div class="space-y-4 w-full select-none">
    
    <!-- Encabezado de la Gráfica de Barras -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800/80 dark:border-slate-800">
      <div>
        <h4 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span>{{ titulo }}</span>
        </h4>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ subtitulo }}</p>
      </div>
      <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        Escala 0% - 100%
      </span>
    </div>

    <!-- Lista de Barras Responsivas -->
    <div class="space-y-3.5">
      <div 
        v-for="(item, index) in datos" 
        :key="index"
        class="space-y-1.5 group p-2.5 rounded-2xl hover:bg-slate-800/20 transition-all duration-200"
      >
        <!-- Fila Superior: Título de Categoría y Valores -->
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-sky-400 transition-colors">
              {{ item.categoria }}
            </span>
            <span 
              class="px-2 py-0.2 rounded-full text-[10px] font-bold border"
              :class="obtenerBadgeClase(item.porcentaje, item.nivelAlerta)"
            >
              {{ item.porcentaje }}%
            </span>
          </div>

          <div class="flex items-center gap-2 text-[11px]">
            <span class="font-bold text-slate-900 dark:text-white">{{ item.puntaje }} / 5.0</span>
            <span class="text-slate-400 hidden sm:inline">({{ item.respuestas }} resp)</span>
          </div>
        </div>

        <!-- Contenedor de la Barra con Track de Fondo y Relleno Gradiente Fluido -->
        <div class="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-950/80 p-0.5 border border-slate-300/60 dark:border-slate-800 overflow-hidden shadow-inner">
          <div 
            class="h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-md"
            :class="obtenerColorBarra(item.porcentaje, item.nivelAlerta)"
            :style="{ width: `${item.porcentaje}%` }"
          ></div>
        </div>
      </div>
    </div>

  </div>
</template>
