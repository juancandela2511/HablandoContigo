<!--
  ============================================================================
  ERROR DE CONECTIVIDAD: SIN INTERNET / MODO OFFLINE (ErrorSinInternet.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { WifiOff, RefreshCw, CheckCircle, Shield } from 'lucide-vue-next'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import TarjetaDetalleLegalError from '@/componentes/Errores/TarjetaDetalleLegalError.vue'
import type { DetalleIncidenteLegal } from '@/Almacenes/useManejadorErrores'
import { useManejadorErrores } from '@/Almacenes/useManejadorErrores'

const props = defineProps<{
  incidente?: DetalleIncidenteLegal
  mensajePersonalizado?: string
}>()

const emit = defineEmits<{
  (e: 'reintentar'): void
  (e: 'reconectado'): void
}>()

const verificando = ref(false)
const { estaOnline } = useManejadorErrores()

const comprobarConexion = async () => {
  verificando.value = true
  try {
    // Ping ligero a un recurso público
    await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' })
    emit('reconectado')
  } catch (e) {
    // Continúa offline
  } finally {
    setTimeout(() => {
      verificando.value = false
    }, 800)
  }
}
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-lg animate-bounce">
        <WifiOff class="w-8 h-8 stroke-[2]" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
        Modo Offline &bull; Sin Red
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Sin Conexión a Internet
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'Tu dispositivo no cuenta con acceso a internet. Las operaciones remotas se reanudarán automáticamente en cuanto se restablezca la conexión.' }}
      </p>

      <!-- Estado en vivo -->
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-xs mx-auto text-xs text-slate-500">
        <span v-if="estaOnline" class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
          <CheckCircle class="w-4 h-4" /> ¡Señal detectada!
        </span>
        <span v-else class="text-slate-400">
          Esperando señal de red...
        </span>
      </div>
    </div>

    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase
        variante="primario"
        tamano="pequeno"
        :cargando="verificando"
        @click="comprobarConexion"
      >
        <template #iconoIzquierdo>
          <RefreshCw class="w-4 h-4" />
        </template>
        <span>{{ verificando ? 'Verificando red...' : 'Comprobar Conexión' }}</span>
      </BotonBase>
    </div>
  </div>
</template>