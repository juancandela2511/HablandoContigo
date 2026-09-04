<!--
  ============================================================================
  COMPONENTE NOTIFICACIÓN DE ESTADO DE CONEXIÓN SUPABASE (AlertaConexionSupabase.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Banner flotante de alerta crítica que se activa automáticamente si la aplicación
  detecta que no se pudo conectar con Supabase o la base de datos remota es inaccesible.
  
  ¿PARA QUÉ SIRVE?
  - Notificar de inmediato al usuario en pantalla sobre cualquier fallo de conexión.
  - Ofrecer botón interactivo para reintentar la conexión con animación de carga.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useSupabaseStatus.ts: Estado reactivo y función de reintento.
  - App.vue: Montado a nivel global.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseStatus } from '@/Almacenes/useSupabaseStatus'
import { useCuentas } from '@/Almacenes/useCuentas'
import { 
  AlertTriangle, 
  RefreshCw, 
  X, 
  DatabaseZap, 
  WifiOff,
  CheckCircle2
} from 'lucide-vue-next'

const { 
  bannerVisible, 
  mensajeError, 
  reintentarConexion, 
  ocultarBanner 
} = useSupabaseStatus()

const { sembrarCuentasInicialesEnSupabase } = useCuentas()

const reintentando = ref(false)
const sembrando = ref(false)
const siembraExitosa = ref(false)

const ejecutarReintento = async () => {
  reintentando.value = true
  await reintentarConexion()
  reintentando.value = false
}

const ejecutarSiembra = async () => {
  sembrando.value = true
  const res = await sembrarCuentasInicialesEnSupabase()
  sembrando.value = false
  if (res.ok) {
    siembraExitosa.value = true
    await reintentarConexion()
    setTimeout(() => {
      ocultarBanner()
    }, 2000)
  }
}
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-4 scale-95"
  >
    <aside
      v-if="bannerVisible"
      id="banner-supabase-error"
      aria-label="Alerta de conexión"
      class="fixed top-4 right-4 sm:right-6 z-[9999] max-w-lg w-[calc(100vw-2rem)] bg-slate-900/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-rose-500/50 rounded-3xl p-4 shadow-2xl shadow-rose-950/50 font-['Poppins',sans-serif] text-slate-100 animate-in"
    >
      <div class="flex items-start gap-3">
        
        <!-- Icono de Alerta de Conexión -->
        <div class="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
          <WifiOff class="w-5 h-5 animate-pulse" />
        </div>

        <div class="flex-1 min-w-0 space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <h4 class="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Estado de Conexión</span>
            </h4>
            <button
              @click="ocultarBanner"
              class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Cerrar notificación"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">
            {{ mensajeError ? mensajeError.replace(/supabase/gi, 'Servidor Central').replace(/cuentas_admin/gi, 'usuarios') : 'No se pudo comunicar con el servidor central o los servicios están temporalmente inaccesibles.' }}
          </p>

          <div v-if="siembraExitosa" class="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 shrink-0" />
            <span>¡Datos iniciales del sistema sincronizados con éxito!</span>
          </div>

          <div class="pt-1 flex flex-wrap items-center gap-2">
            <button
              @click="ejecutarReintento"
              :disabled="reintentando || sembrando"
              class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw class="w-3 h-3" :class="reintentando ? 'animate-spin' : ''" />
              <span>{{ reintentando ? 'Comprobando...' : 'Reintentar Conexión' }}</span>
            </button>

            <button
              @click="ejecutarSiembra"
              :disabled="sembrando || reintentando"
              class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <DatabaseZap class="w-3 h-3" :class="sembrando ? 'animate-spin' : ''" />
              <span>{{ sembrando ? 'Sincronizando...' : 'Sincronizar Cuentas Base' }}</span>
            </button>
          </div>
        </div>

      </div>
    </aside>
  </transition>
</template>
