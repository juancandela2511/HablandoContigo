<!--
  ============================================================================
  BANNER DE SESIÓN TEMPORAL POR TOKEN / PIN (BannerSesionTemporal.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { KeyRound, Clock, LogOut, ShieldAlert } from 'lucide-vue-next'
import { useAuth } from '@/Almacenes/useAuth'
import { useTokensAcceso, PRESETS_TOKENS } from '@/Almacenes/useTokensAcceso'

const { usuarioActual, cerrarSesion } = useAuth()
const { calcularTiempoRestante } = useTokensAcceso()

const tick = ref(Date.now())
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    tick.value = Date.now()
    // Si ya expiró en vivo, cerrar sesión automáticamente
    if (usuarioActual.value?.esSesionTemporal && usuarioActual.value.tokenExpiraEn) {
      const expiraMs = new Date(usuarioActual.value.tokenExpiraEn).getTime()
      if (Date.now() >= expiraMs) {
        cerrarSesion()
      }
    }
  }, 10000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const infoTiempo = computed(() => {
  if (!usuarioActual.value?.tokenExpiraEn) {
    return { texto: 'Indefinido', expirado: false }
  }
  // Forzar reactividad con tick
  if (tick.value) {}
  return calcularTiempoRestante(usuarioActual.value.tokenExpiraEn)
})

const nombrePreset = computed(() => {
  if (usuarioActual.value?.presetToken && PRESETS_TOKENS[usuarioActual.value.presetToken]) {
    return PRESETS_TOKENS[usuarioActual.value.presetToken].nombre
  }
  return 'Acceso Restringido'
})
</script>

<template>
  <div
    v-if="usuarioActual?.esSesionTemporal"
    class="sticky top-0 z-[990] w-full bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-700/90 backdrop-blur-md text-white px-4 py-2 shadow-lg border-b border-amber-400/40 font-['Poppins',sans-serif] animate-fade-in"
  >
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
      
      <!-- Izquierda: Estado de sesión -->
      <div class="flex items-center gap-2.5">
        <div class="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
          <KeyRound class="w-3.5 h-3.5 text-amber-200" />
        </div>
        <div class="flex items-center gap-2">
          <span class="font-extrabold uppercase tracking-wider text-[11px] bg-black/30 px-2 py-0.5 rounded-full border border-amber-300/30">
            Sesión Temporal Restringida
          </span>
          <span class="hidden sm:inline text-white/90">
            <strong>{{ usuarioActual.nombre }}</strong> ({{ usuarioActual.codigoToken || 'TOKEN' }})
          </span>
          <span class="hidden md:inline-block text-amber-100 text-[11px]">
            • Permisos: <strong>{{ nombrePreset }}</strong>
          </span>
        </div>
      </div>

      <!-- Derecha: Temporizador y Salida -->
      <div class="flex items-center gap-3 ml-auto">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/30 border border-amber-300/30 font-semibold text-[11px]">
          <Clock class="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>{{ infoTiempo.texto }}</span>
        </div>

        <button
          type="button"
          @click="cerrarSesion"
          class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 hover:bg-black/60 text-white text-[11px] font-bold transition-all cursor-pointer border border-white/20 active:scale-95"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Salir</span>
        </button>
      </div>

    </div>
  </div>
</template>
