<!--
  ============================================================================
  COMPONENTE PANTALLA DE CONFIRMACIÓN DE ENVÍO (EncuestaPantallaExito.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Pantalla final presentada al colaborador tras completar el cuestionario:
  - Mensaje empático de gratitud y confirmación de escucha activa.
  - Alerta de auditoría si la encuesta fue descartada por rapidez ("responder por responder").
  - Tarjeta de verificación técnica con fecha, hora exacta y UUID de hardware.
  - Sello de 'Garantía de Cero Almacenamiento de Cuentas o Sesiones'.
  - Botón atómico reutilizable para volver a la portada principal.
-->

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { TarjetaContenedor, BotonBase } from '@/componentes/ElementosBase'
import { CheckCircle2, Clock, Laptop, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-vue-next'

defineProps<{
  fechaYHora: { fecha: string; hora: string }
  dispositivoUUID: string
  fueDescartadaPorRapidez?: boolean
}>()

const router = useRouter()
</script>

<template>
  <TarjetaContenedor :mostrarVisores="true" relleno="amplio" class="text-center space-y-6 animate-fadeIn">
    
    <!-- Icono Principal: Esmeralda o Ámbar según si fue descartada por rapidez -->
    <div 
      v-if="!fueDescartadaPorRapidez"
      class="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10"
    >
      <CheckCircle2 class="w-8 h-8" />
    </div>
    <div 
      v-else
      class="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10"
    >
      <AlertTriangle class="w-8 h-8" />
    </div>

    <!-- Mensaje Principal de Gratitud -->
    <div class="space-y-2">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {{ fueDescartadaPorRapidez ? 'Respuesta Registrada con Observación' : '¡Tu voz ha sido escuchada!' }}
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 max-w-md mx-auto leading-relaxed">
        {{ fueDescartadaPorRapidez 
          ? 'Tu participación ha sido registrada en el sistema, pero el motor de auditoría detectó que las preguntas se contestaron por debajo del tiempo mínimo de lectura.'
          : 'Tu respuesta ha sido registrada y cifrada con éxito. La información recopilada será analizada bajo estrictos criterios de rigor por el motor analítico de Talento Humano.' 
        }}
      </p>
    </div>

    <!-- Banner de Descarte por Velocidad / Responder por responder -->
    <div 
      v-if="fueDescartadaPorRapidez"
      class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 max-w-md mx-auto text-left"
    >
      <div class="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span>Auditoría: Respuesta Descartada de Estadísticas Oficiales</span>
      </div>
      <p class="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
        Para garantizar la veracidad del estudio y evitar respuestas automáticas o impulsivas ("responder por que sí"), las preguntas cerradas requieren al menos 4 segundos y las abiertas 8 segundos de reflexión. Por haberse completado a una velocidad inferior a este umbral, tu registro no alterará los porcentajes oficiales de clima laboral.
      </p>
    </div>

    <!-- Tarjeta de Verificación de Privacidad y Anonimato -->
    <div class="p-4 rounded-2xl bg-slate-100 dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 text-left text-xs space-y-2.5 max-w-md mx-auto font-mono">
      <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400 border-b border-slate-200 dark:border-white/5 pb-2">
        <span class="flex items-center gap-1.5 text-[11px]">
          <Clock class="w-3.5 h-3.5 text-sky-500" />
          Marca de Tiempo:
        </span>
        <span class="text-slate-900 dark:text-white font-medium">{{ fechaYHora.fecha }} · {{ fechaYHora.hora }}</span>
      </div>

      <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400">
        <span class="flex items-center gap-1.5 text-[11px]">
          <Laptop class="w-3.5 h-3.5 text-sky-500" />
          UUID del Dispositivo:
        </span>
        <span class="text-sky-600 dark:text-sky-400 text-[11px]">{{ dispositivoUUID.slice(0, 18) }}...</span>
      </div>

      <div class="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 pt-1">
        <ShieldCheck class="w-3 h-3" />
        <span>Garantía de Cero Almacenamiento de Cuentas o Sesiones</span>
      </div>
    </div>

    <!-- Botón Reutilizable de Retorno -->
    <div class="pt-2">
      <BotonBase
        variante="primario"
        tamano="grande"
        @click="router.push('/')"
      >
        <span>Volver a la Portada Principal</span>
        <template #iconoDerecho>
          <ArrowRight class="w-4 h-4" />
        </template>
      </BotonBase>
    </div>

  </TarjetaContenedor>
</template>
