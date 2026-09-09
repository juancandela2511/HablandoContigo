<!--
  ============================================================================
  SELECTOR DE LAS 2 MODALIDADES EXCLUSIVAS DE ENCUESTAS (ProyectosSelectorModalidades.vue)
  ============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue'
import { Building2, Zap, ArrowRight, Sparkles, Volume2, Clock, CheckCircle2, Lock } from 'lucide-vue-next'
import { useAuth } from '@/Almacenes/useAuth'

const emit = defineEmits<{
  (e: 'seleccionarModalidad', modalidad: 'clima_fijo' | 'encuesta_rapida'): void
}>()

const { usuarioActual, permisosUsuario } = useAuth()

const puedeEditarClima = computed(() => {
  if (usuarioActual.value?.esSesionTemporal && usuarioActual.value.permisosToken) {
    return Boolean(usuarioActual.value.permisosToken.editarEncuestaClima)
  }
  return true
})

const puedeCrearRapidas = computed(() => {
  if (usuarioActual.value?.esSesionTemporal && usuarioActual.value.permisosToken) {
    return Boolean(usuarioActual.value.permisosToken.crearEncuestasRapidas)
  }
  return true
})

const alHacerClicModalidad = (modalidad: 'clima_fijo' | 'encuesta_rapida') => {
  if (modalidad === 'clima_fijo' && !puedeEditarClima.value) {
    alert('Tu Token de acceso temporal solo te permite gestionar Encuestas Rápidas (IA). La edición de la Encuesta Troncal de Clima está restringida por el Administrador.')
    return
  }
  if (modalidad === 'encuesta_rapida' && !puedeCrearRapidas.value) {
    alert('Tu Token de acceso temporal no tiene autorización para crear encuestas rápidas.')
    return
  }
  emit('seleccionarModalidad', modalidad)
}
</script>

<template>
  <div class="space-y-8 max-w-5xl mx-auto text-center font-['Poppins',sans-serif]">
    
    <!-- Titular de Bienvenida -->
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold">
        <Sparkles class="w-3.5 h-3.5" />
        <span>SISTEMA OFICIAL DE EVALUACIONES</span>
      </div>
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        ¿Qué tipo de encuesta deseas gestionar hoy?
      </h2>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
        Elige entre la evaluación troncal permanente de clima organizacional o una encuesta rápida de pulso del día.
      </p>
    </div>

    <!-- Las 2 Tarjetas de Modalidad -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      
      <!-- MODALIDAD 1: CLIMA LABORAL TRONCAL FIJO -->
      <div
        @click="alHacerClicModalidad('clima_fijo')"
        :class="[
          'group relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden',
          puedeEditarClima
            ? 'border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500'
            : 'border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-80'
        ]"
      >
        <div class="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />

        <div class="space-y-4 relative z-10">
          <div class="flex items-center justify-between">
            <div class="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
              <Building2 class="w-7 h-7 stroke-[1.8]" />
            </div>
            <div class="flex items-center gap-1.5">
              <span v-if="!puedeEditarClima" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Lock class="w-3 h-3" />
                Restringido por Token
              </span>
              <span v-else class="text-[10px] font-mono px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-extrabold border border-sky-300 dark:border-sky-800 flex items-center gap-1">
                <Volume2 class="w-3 h-3 text-sky-500" />
                Asistente con Voz
              </span>
            </div>
          </div>

          <div class="space-y-1.5">
            <h3 class="text-lg font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              1. Encuesta Troncal de Clima Laboral
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              La encuesta oficial y permanente de la organización. Es una estructura fija y continua que tú editas y actualizas con ayuda de un Asistente Virtual que te opina por escrito y te <strong>habla en voz alta</strong> para mejorar cada dimensión.
            </p>
          </div>

          <ul class="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Diagnóstico integral de salud psicosocial y liderazgo</span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Asistente con burbuja parlante y sugerencias de voz</span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Escalas estandarizadas: Excelente a Muy Mal</span>
            </li>
          </ul>
        </div>

        <div class="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
          <span>Gestionar Encuesta de Clima</span>
          <ArrowRight class="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>

      <!-- MODALIDAD 2: ENCUESTAS RÁPIDAS / PULSO DEL DÍA -->
      <div
        @click="emit('seleccionarModalidad', 'encuesta_rapida')"
        class="group relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

        <div class="space-y-4 relative z-10">
          <div class="flex items-center justify-between">
            <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Zap class="w-7 h-7 stroke-[1.8]" />
            </div>
            <span class="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-300 dark:border-amber-800 flex items-center gap-1">
              <Clock class="w-3 h-3 text-amber-500" />
              ~30 Segundos
            </span>
          </div>

          <div class="space-y-1.5">
            <h3 class="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              2. Encuestas Rápidas / Pulso del Día
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cuestionarios ultrarrápidos de 1 a 3 preguntas para saber <strong>cómo están hoy</strong> los colaboradores, verificar el estado de ánimo al inicio de la jornada o medir la sobrecarga al cierre de turno.
            </p>
          </div>

          <ul class="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-amber-500 shrink-0" />
              <span>Plantillas express de 1 clic ("¿Cómo te sientes hoy?")</span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-amber-500 shrink-0" />
              <span>Medición instantánea sin fatiga para el colaborador</span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-amber-500 shrink-0" />
              <span>Enlace y distribución inmediata</span>
            </li>
          </ul>
        </div>

        <div class="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
          <span>Lanzar Pulso Rápido</span>
          <ArrowRight class="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>

    </div>

  </div>
</template>