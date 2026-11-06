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
  CheckCircle2,
  AlertTriangle,
  MapPin,
  RefreshCw
} from 'lucide-vue-next'
import { BotonRevelacionFlecha } from '@/componentes/ElementosBase'
import { useLegal } from '@/Almacenes/useLegal'
import {
  solicitarUbicacionGpsObligatoria,
  obtenerUbicacionGpsVerificada,
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
const aceptaAnonimato = ref(false)
const aceptaTratamiento = ref(false)
const comprendeVoluntariedad = ref(false)

const ubicacionGps = ref<UbicacionExacta | null>(obtenerUbicacionGpsVerificada())
const cargandoGps = ref(false)
const errorGps = ref('')

const solicitarGpsExacto = async (): Promise<boolean> => {
  cargandoGps.value = true
  errorGps.value = ''
  try {
    const u = await solicitarUbicacionGpsObligatoria()
    ubicacionGps.value = u
    return true
  } catch (err: any) {
    errorGps.value =
      err?.message ||
      'Debes permitir el acceso a la ubicación exacta del navegador para responder la encuesta.'
    return false
  } finally {
    cargandoGps.value = false
  }
}

onMounted(() => {
  if (!ubicacionGps.value) {
    solicitarGpsExacto()
  }
})

const validarYContinuar = async () => {
  if (!aceptaAnonimato.value || !aceptaTratamiento.value || !comprendeVoluntariedad.value) {
    return
  }
  if (!ubicacionGps.value?.esGpsReal) {
    const ok = await solicitarGpsExacto()
    if (!ok) return
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
          Paso 1 de 2 &bull; Consentimiento Legal & Confidencialidad
        </span>
        <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
          {{ tituloEncuesta }}
        </h2>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          Área / Alcance: {{ departamento || 'General' }} &bull; Tiempo: ~{{ duracionEstimadaMinutos || 3 }} min
        </span>
      </div>
    </div>

    <!-- Garantías Fundamentales -->
    <div class="space-y-3">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Garantías Legales del Colaborador
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
            <Lock class="w-4 h-4" />
            <span>Anonimato 100% Cifrado</span>
          </div>
          <p class="text-[11px] text-slate-500 leading-snug">
            Tus respuestas se procesan de forma estrictamente confidencial sin vincular tu nombre ni tu computador.
          </p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck class="w-4 h-4" />
            <span>Cero Represalias</span>
          </div>
          <p class="text-[11px] text-slate-500 leading-snug">
            Tus respuestas son estrictamente confidenciales con fines de bienestar y salud laboral.
          </p>
        </div>
      </div>
    </div>

    <!-- Verificación Obligatoria de Ubicación GPS Exacta -->
    <div
      :class="[
        'p-4 rounded-2xl border transition-all space-y-2',
        ubicacionGps?.esGpsReal
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
          : errorGps
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-800 dark:text-rose-200'
            : 'bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-200'
      ]"
    >
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2 text-xs font-extrabold">
          <CheckCircle2 v-if="ubicacionGps?.esGpsReal" class="w-4 h-4 text-emerald-500 shrink-0" />
          <AlertTriangle v-else-if="errorGps" class="w-4 h-4 text-rose-500 shrink-0" />
          <RefreshCw v-else-if="cargandoGps" class="w-4 h-4 text-sky-500 animate-spin shrink-0" />
          <MapPin v-else class="w-4 h-4 text-sky-500 shrink-0" />

          <span v-if="ubicacionGps?.esGpsReal">
            Ubicación GPS Exacta Verificada: {{ ubicacionGps.ciudad }} ({{ ubicacionGps.lat.toFixed(5) }}, {{ ubicacionGps.lng.toFixed(5) }} &bull; &plusmn;{{ ubicacionGps.precisionMetros }}m)
          </span>
          <span v-else-if="cargandoGps">
            Solicitando ubicación GPS exacta al navegador... Por favor haz clic en "Permitir".
          </span>
          <span v-else>
            Permiso de Ubicación GPS Exacta Requerido (Obligatorio)
          </span>
        </div>

        <button
          v-if="!ubicacionGps?.esGpsReal"
          type="button"
          :disabled="cargandoGps"
          @click="solicitarGpsExacto"
          class="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all shrink-0"
        >
          <MapPin class="w-3.5 h-3.5" />
          <span>{{ cargandoGps ? 'Verificando GPS...' : 'Activar Ubicación Exacta' }}</span>
        </button>
      </div>

      <p v-if="errorGps" class="text-[11px] leading-relaxed font-medium text-rose-600 dark:text-rose-300">
        {{ errorGps }} Haz clic en el icono de ubicación o candado en la barra superior del navegador, selecciona <strong>"Permitir"</strong> y presiona <strong>"Activar Ubicación Exacta"</strong>.
      </p>
    </div>

    <!-- Checkboxes de Consentimiento Obligatorio -->
    <div class="space-y-3 pt-2">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Declaración de Consentimiento Requerida
      </h3>

      <div class="space-y-2.5">
        
        <label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all select-none">
          <input
            type="checkbox"
            v-model="aceptaAnonimato"
            class="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0 cursor-pointer"
          />
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Entiendo que esta evaluación es <strong>confidencial y anónima</strong> y que mis respuestas serán analizadas de forma estadística y agrupada.
          </span>
        </label>

        <label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all select-none">
          <input
            type="checkbox"
            v-model="aceptaTratamiento"
            class="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0 cursor-pointer"
          />
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Acepto los <button type="button" @click.prevent="abrirTerminos" class="text-sky-600 dark:text-sky-400 underline font-bold hover:text-sky-500">Términos de Servicio</button> y la <button type="button" @click.prevent="abrirPrivacidad" class="text-sky-600 dark:text-sky-400 underline font-bold hover:text-sky-500">Política de Privacidad</button> (RGPD / Habeas Data).
          </span>
        </label>

        <label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all select-none">
          <input
            type="checkbox"
            v-model="comprendeVoluntariedad"
            class="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0 cursor-pointer"
          />
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Confirmo mi <strong>participación voluntaria</strong> con el fin de contribuir a la mejora del clima y bienestar laboral.
          </span>
        </label>

      </div>
    </div>

    <!-- Botón de Continuar -->
    <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span class="text-[11px] text-slate-400">
        Debes marcar los 3 consentimientos y permitir la ubicación GPS exacta para iniciar
      </span>

      <BotonRevelacionFlecha
        etiqueta="Comenzar Encuesta"
        colorFondo="#0f172a"
        colorTexto="#FFFFFF"
        colorInsignia="#3600FF"
        colorIcono="#FFFFFF"
        :deshabilitado="!aceptaAnonimato || !aceptaTratamiento || !comprendeVoluntariedad || cargandoGps"
        @click="validarYContinuar"
      />
    </div>

  </div>
</template>
