<!--
  ============================================================================
  PANTALLA DE CONSENTIMIENTO INFORMADO PREVIO A ENCUESTAS (PantallaConsentimientoEncuesta.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ShieldCheck,
  Lock,
  HeartHandshake,
  MapPin
} from 'lucide-vue-next'
import { BotonRevelacionFlecha } from '@/componentes/ElementosBase'
import { useLegal } from '@/Almacenes/useLegal'
import {
  solicitarUbicacionGpsObligatoria,
  obtenerUbicacionExactaDispositivo,
  type UbicacionExacta
} from '@/services/ubicacionService'

defineProps<{
  tituloEncuesta: string
  departamento?: string
  duracionEstimadaMinutos?: number
}>()

const emit = defineEmits<{
  (e: 'consentimientoOtorgado'): void
}>()

const { abrirTerminos, abrirPrivacidad } = useLegal()
const aceptaAnonimato = ref(true)
const aceptaTratamiento = ref(true)
const comprendeVoluntariedad = ref(true)

const ubicacionCapturada = ref<UbicacionExacta | null>(null)

// Pedir la ubicación al navegador de forma natural sin alarmar en pantalla
const solicitarUbicacionDiscreta = async () => {
  try {
    const u = await solicitarUbicacionGpsObligatoria()
    ubicacionCapturada.value = u
  } catch {
    try {
      const uFallback = await obtenerUbicacionExactaDispositivo()
      ubicacionCapturada.value = uFallback
    } catch {}
  }
}

onMounted(() => {
  solicitarUbicacionDiscreta()
})

const validarYContinuar = async () => {
  if (!aceptaAnonimato.value || !aceptaTratamiento.value || !comprendeVoluntariedad.value) {
    return
  }
  // Si aún no se ha pedido, intentar pedirla una vez más
  if (!ubicacionCapturada.value) {
    await solicitarUbicacionDiscreta()
  }
  emit('consentimientoOtorgado')
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-left font-['Poppins',sans-serif] transition-all">
    
    <!-- Encabezado con Icono -->
    <div class="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
      <div class="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
        <HeartHandshake class="w-7 h-7 stroke-[1.8]" />
      </div>
      <div>
        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
          Paso 1 de 2 &bull; Espacio Seguro y Confidencial
        </span>
        <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
          {{ tituloEncuesta }}
        </h2>
        <div class="flex items-center gap-2.5 flex-wrap mt-1">
          <span class="text-xs text-slate-500 dark:text-slate-400">
            Alcance: {{ departamento || 'General' }} &bull; Tiempo: ~{{ duracionEstimadaMinutos || 3 }} min
          </span>

          <!-- Icono pequeño y discreto de ubicación -->
          <button
            type="button"
            @click="solicitarUbicacionDiscreta"
            :title="ubicacionCapturada ? `Ubicación: ${ubicacionCapturada.ciudad}` : 'Activar ubicación aproximada'"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border cursor-pointer select-none"
            :class="ubicacionCapturada 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400'"
          >
            <MapPin class="w-3 h-3 text-sky-500 shrink-0" />
            <span>{{ ubicacionCapturada ? ubicacionCapturada.ciudad : 'Ubicación' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Garantías Fundamentales -->
    <div class="space-y-3">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Garantías del Colaborador
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
            <Lock class="w-4 h-4" />
            <span>Participación 100% Confidencial</span>
          </div>
          <p class="text-[11px] text-slate-500 leading-snug">
            Tus respuestas son estrictamente anónimas y se consolidan en reportes globales para mejorar el bienestar del equipo.
          </p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck class="w-4 h-4" />
            <span>Entorno Seguro</span>
          </div>
          <p class="text-[11px] text-slate-500 leading-snug">
            Tus aportes son valorados para promover una cultura de confianza, respeto y desarrollo continuo.
          </p>
        </div>
      </div>
    </div>

    <!-- Checkboxes de Consentimiento -->
    <div class="space-y-3 pt-2">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Declaración de Participación
      </h3>

      <div class="space-y-2.5">
        
        <label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all select-none">
          <input
            type="checkbox"
            v-model="aceptaAnonimato"
            class="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0 cursor-pointer"
          />
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Entiendo que esta evaluación es <strong>confidencial y anónima</strong> y que los resultados se analizan de manera grupal.
          </span>
        </label>

        <label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all select-none">
          <input
            type="checkbox"
            v-model="aceptaTratamiento"
            class="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0 cursor-pointer"
          />
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Acepto los <button type="button" @click.prevent="abrirTerminos" class="text-sky-600 dark:text-sky-400 underline font-bold hover:text-sky-500">Términos de Uso</button> y la <button type="button" @click.prevent="abrirPrivacidad" class="text-sky-600 dark:text-sky-400 underline font-bold hover:text-sky-500">Política de Privacidad</button>.
          </span>
        </label>

        <label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all select-none">
          <input
            type="checkbox"
            v-model="comprendeVoluntariedad"
            class="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0 cursor-pointer"
          />
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Confirmo mi <strong>participación voluntaria</strong> con el fin de contribuir al bienestar y clima de nuestro equipo.
          </span>
        </label>

      </div>
    </div>

    <!-- Botón de Continuar -->
    <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span class="text-[11px] text-slate-400">
        Tus respuestas no se asocian a tu nombre ni a tu usuario personal
      </span>

      <BotonRevelacionFlecha
        etiqueta="Comenzar Cuestionario"
        colorFondo="#0f172a"
        colorTexto="#FFFFFF"
        colorInsignia="#2563eb"
        colorIcono="#FFFFFF"
        :deshabilitado="!aceptaAnonimato || !aceptaTratamiento || !comprendeVoluntariedad"
        @click="validarYContinuar"
      />
    </div>

  </div>
</template>
