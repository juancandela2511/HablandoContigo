<!--
  ============================================================================
  MODALIDAD 2: LANZADOR DE ENCUESTAS RÁPIDAS / PULSO DEL DÍA (ProyectosModoEncuestaRapida.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref } from 'vue'
import {
  Zap,
  ArrowLeft,
  Sun,
  Moon,
  Coffee,
  HeartPulse,
  Send,
  Sparkles,
  CheckCircle2
} from 'lucide-vue-next'
import type { PreguntaEncuesta } from '@/Servicios/iaEncuestasService'
import { obtenerEscalaEstandarDetallada } from '@/Servicios/iaEncuestasService'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const emit = defineEmits<{
  (e: 'lanzarEncuestaRapida', datos: any): void
  (e: 'volver'): void
}>()

const departamento = ref('General')
const plantillaSeleccionada = ref<'animo_hoy' | 'cierre_turno' | 'cafe_equipo' | 'sobrecarga_express'>('animo_hoy')

const plantillasRapidas = [
  {
    id: 'animo_hoy',
    titulo: '☀️ Pulso de Ánimo y Energía de Hoy',
    descripcion: 'Check-in rápido de 30 segundos para conocer cómo inicia la jornada el equipo.',
    icono: Sun,
    color: 'amber',
    preguntas: [
      {
        id: 'p-rap-1',
        categoria: 'Energía y Motivación',
        texto: '¿Cómo calificarías tu nivel de ánimo, energía y motivación el día de hoy?',
        tipo: 'escala' as const,
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      },
      {
        id: 'p-rap-2',
        categoria: 'Claridad del Día',
        texto: '¿Cuentas con claridad sobre tus prioridades y metas asignadas para hoy?',
        tipo: 'multiple' as const,
        opciones: [
          { id: 'r1', texto: 'Excelente: Todo 100% claro y listo', valor: 5, esAlerta: false },
          { id: 'r2', texto: 'Bien: Prioridades definidas', valor: 4, esAlerta: false },
          { id: 'r3', texto: 'Regular: Algunas dudas menores', valor: 3, esAlerta: false },
          { id: 'r4', texto: 'Mal: Desorganización o bloqueo (Alerta)', valor: 1, esAlerta: true }
        ]
      }
    ]
  },
  {
    id: 'cierre_turno',
    titulo: '🏁 Check-Out de Cierre de Turno / Jornada',
    descripcion: 'Medición rápida al finalizar la jornada para detectar sobrecargas o bloqueos.',
    icono: Moon,
    color: 'indigo',
    preguntas: [
      {
        id: 'p-rap-3',
        categoria: 'Cierre de Jornada',
        texto: '¿Cómo evalúas el desarrollo y balance de tu jornada de trabajo el día de hoy?',
        tipo: 'escala' as const,
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      },
      {
        id: 'p-rap-4',
        categoria: 'Fatiga y Carga',
        texto: '¿Pudiste cumplir tus responsabilidades sin experimentar sobrecarga extrema o agotamiento?',
        tipo: 'multiple' as const,
        opciones: [
          { id: 'rc1', texto: 'Sí, jornada fluida y con buen ritmo', valor: 5, esAlerta: false },
          { id: 'rc2', texto: 'Jornada pesada pero finalizada', valor: 3, esAlerta: false },
          { id: 'rc3', texto: 'Sobrecarga crítica e insostenible (Alerta)', valor: 1, esAlerta: true }
        ]
      }
    ]
  },
  {
    id: 'cafe_equipo',
    titulo: '☕ Pulso de Apoyo y Trabajo en Equipo',
    descripcion: 'Evalúa rápidamente la sinergia y colaboración entre compañeros.',
    icono: Coffee,
    color: 'emerald',
    preguntas: [
      {
        id: 'p-rap-5',
        categoria: 'Cooperación',
        texto: '¿Sentiste el respaldo, empatía y apoyo de tus compañeros de equipo hoy?',
        tipo: 'escala' as const,
        opciones: obtenerEscalaEstandarDetallada('acuerdo')
      }
    ]
  },
  {
    id: 'sobrecarga_express',
    titulo: '🚨 Pulso Exprés de Sobrecarga y Apoyo',
    descripcion: 'Termómetro inmediato para detectar momentos de estrés o cuellos de botella.',
    icono: HeartPulse,
    color: 'rose',
    preguntas: [
      {
        id: 'p-rap-6',
        categoria: 'Alerta Operativa',
        texto: '¿Requieres apoyo inmediato o ajuste en la carga de tareas de tu turno?',
        tipo: 'multiple' as const,
        opciones: [
          { id: 's1', texto: 'No, todo bajo control y en orden', valor: 5, esAlerta: false },
          { id: 's2', texto: 'Carga alta pero manejable por mí', valor: 3, esAlerta: false },
          { id: 's3', texto: 'Sí, requiero apoyo urgente de liderazgo (Alerta Crítica)', valor: 1, esAlerta: true }
        ]
      }
    ]
  }
]

const lanzarEncuesta = () => {
  const elegida = plantillasRapidas.find(p => p.id === plantillaSeleccionada.value) || plantillasRapidas[0]
  if (!elegida) return

  emit('lanzarEncuestaRapida', {
    titulo: elegida.titulo,
    descripcion: elegida.descripcion,
    departamento: departamento.value,
    preguntas: elegida.preguntas,
    preguntasSeguimiento: []
  })
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto text-left font-['Poppins',sans-serif]">
    
    <!-- Barra Superior -->
    <div class="flex items-center justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="emit('volver')"
          class="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Encuestas Rápidas / Pulso del Día
            </h2>
            <span class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold">
              Pulso Express
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Lanza diagnósticos breves de 1 o 2 preguntas para medir el ánimo del equipo hoy.
          </p>
        </div>
      </div>
    </div>

    <!-- Selección de Plantilla Rápida -->
    <div class="space-y-3">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Selecciona una Plantilla Express (1 Clic)
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="item in plantillasRapidas"
          :key="item.id"
          @click="plantillaSeleccionada = item.id as any"
          :class="[
            'p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3',
            plantillaSeleccionada === item.id
              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <component :is="item.icono" class="w-5 h-5 stroke-[2]" />
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                {{ item.preguntas.length }} pregunta(s)
              </span>
            </div>

            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              {{ item.titulo }}
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {{ item.descripcion }}
            </p>
          </div>

          <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>{{ plantillaSeleccionada === item.id ? 'Seleccionada' : 'Seleccionar esta plantilla' }}</span>
            <CheckCircle2 v-if="plantillaSeleccionada === item.id" class="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- Botón de Lanzamiento Inmediato -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 class="text-xs font-bold text-slate-800 dark:text-white">
          Audiencia / Departamento Destino:
        </h4>
        <input
          v-model="departamento"
          type="text"
          class="mt-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
        />
      </div>

      <BotonBase
        variante="primario"
        tamano="grande"
        @click="lanzarEncuesta"
      >
        <template #iconoIzquierdo>
          <Send class="w-4 h-4" />
        </template>
        Publicar y Obtener Enlace de Pulso
      </BotonBase>
    </div>

  </div>
</template>