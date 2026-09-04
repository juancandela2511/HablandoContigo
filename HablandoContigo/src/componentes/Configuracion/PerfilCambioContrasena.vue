<!--
  ============================================================================
  COMPONENTE CAMBIO DE CONTRASEÑA Y SEGURIDAD (PerfilCambioContrasena.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Permite al usuario autenticado actualizar su contraseña en Supabase Auth:
  - FormularioCambioClave: Inputs seguros con ojito de visibilidad y BotonBase.
  - RequisitosSeguridadClave: Medidor de fortaleza y checklist de seguridad.
  - Almacén useAuth: Persistencia en la nube de Supabase.
  
  ¿CON QUÉ SE CONECTA?
  - useAuth.ts (Método cambiarContrasena)
  - ConfiguracionView.vue (Vista padre)
  - FormularioCambioClave.vue y RequisitosSeguridadClave.vue
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/Almacenes/useAuth'
import { KeyRound, ShieldCheck, AlertCircle } from 'lucide-vue-next'
import FormularioCambioClave from './Perfil/FormularioCambioClave.vue'
import RequisitosSeguridadClave from './Perfil/RequisitosSeguridadClave.vue'

const emit = defineEmits<{
  (e: 'mostrarAlerta', tipo: 'exito' | 'error', mensaje: string): void
}>()

const { cambiarContrasena } = useAuth()

const contrasenaActual = ref('')
const nuevaContrasena = ref('')
const confirmarContrasena = ref('')
const procesando = ref(false)
const errorLocal = ref<string | null>(null)

const tieneLongitudMinima = computed(() => nuevaContrasena.value.length >= 6)
const tieneMayuscula = computed(() => /[A-Z]/.test(nuevaContrasena.value))
const tieneNumero = computed(() => /[0-9]/.test(nuevaContrasena.value))
const contrasenasCoinciden = computed(() => 
  nuevaContrasena.value.length > 0 && nuevaContrasena.value === confirmarContrasena.value
)

const porcentajeFortaleza = computed(() => {
  if (!nuevaContrasena.value) return 0
  let puntaje = 0
  if (nuevaContrasena.value.length >= 6) puntaje += 35
  if (nuevaContrasena.value.length >= 10) puntaje += 15
  if (tieneMayuscula.value) puntaje += 25
  if (tieneNumero.value) puntaje += 25
  return Math.min(puntaje, 100)
})

const colorFortaleza = computed(() => {
  const p = porcentajeFortaleza.value
  if (p < 40) return 'bg-rose-500 text-rose-500'
  if (p < 75) return 'bg-amber-500 text-amber-500'
  return 'bg-emerald-500 text-emerald-500'
})

const etiquetaFortaleza = computed(() => {
  const p = porcentajeFortaleza.value
  if (p === 0) return 'Ingresa una clave'
  if (p < 40) return 'Débil'
  if (p < 75) return 'Aceptable'
  return 'Excelente / Segura'
})

const deshabilitadoEnvio = computed(() => {
  return !tieneLongitudMinima.value || !contrasenasCoinciden.value || procesando.value
})

const manejarCambioContrasena = async () => {
  errorLocal.value = null

  if (!tieneLongitudMinima.value) {
    errorLocal.value = 'La nueva contraseña debe tener al menos 6 caracteres.'
    return
  }

  if (nuevaContrasena.value !== confirmarContrasena.value) {
    errorLocal.value = 'Las contraseñas no coinciden. Por favor verifícalas.'
    return
  }

  if (contrasenaActual.value && contrasenaActual.value === nuevaContrasena.value) {
    errorLocal.value = 'La nueva contraseña no puede ser igual a la anterior.'
    return
  }

  procesando.value = true
  const resultado = await cambiarContrasena(nuevaContrasena.value)
  procesando.value = false

  if (resultado.ok) {
    contrasenaActual.value = ''
    nuevaContrasena.value = ''
    confirmarContrasena.value = ''
    emit('mostrarAlerta', 'exito', resultado.mensaje)
  } else {
    errorLocal.value = resultado.mensaje
    emit('mostrarAlerta', 'error', resultado.mensaje)
  }
}
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xl space-y-6 text-left">
    <!-- Encabezado -->
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <KeyRound class="w-4 h-4" />
          </div>
          <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Seguridad & Cambio de Contraseña
          </h3>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Actualiza tu clave de acceso en Supabase Authentication para proteger tu cuenta.
        </p>
      </div>

      <span class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
        <span>Cifrado SSL/TLS</span>
      </span>
    </div>

    <!-- Alerta de Error -->
    <div
      v-if="errorLocal"
      class="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in"
    >
      <AlertCircle class="w-4 h-4 shrink-0 text-rose-500" />
      <span>{{ errorLocal }}</span>
    </div>

    <!-- Formulario Desacoplado -->
    <FormularioCambioClave
      v-model:contrasenaActual="contrasenaActual"
      v-model:nuevaContrasena="nuevaContrasena"
      v-model:confirmarContrasena="confirmarContrasena"
      :procesando="procesando"
      :deshabilitado="deshabilitadoEnvio"
      @submit="manejarCambioContrasena"
    />

    <!-- Requisitos y Medidor de Fortaleza -->
    <RequisitosSeguridadClave
      :porcentajeFortaleza="porcentajeFortaleza"
      :colorFortaleza="colorFortaleza"
      :etiquetaFortaleza="etiquetaFortaleza"
      :tieneLongitudMinima="tieneLongitudMinima"
      :tieneMayuscula="tieneMayuscula"
      :tieneNumero="tieneNumero"
      :contrasenasCoinciden="contrasenasCoinciden"
      :nuevaContrasena="nuevaContrasena"
      :confirmarContrasena="confirmarContrasena"
    />
  </div>
</template>
