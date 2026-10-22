<script setup lang="ts">
import { ref, computed } from 'vue'
import FormularioCambioClave from './Perfil/FormularioCambioClave.vue'
import RequisitosSeguridadClave from './Perfil/RequisitosSeguridadClave.vue'
import { useAutenticacion } from '@/Almacenes/useAutenticacion'

const emit = defineEmits<{
  (e: 'mostrarAlerta', tipo: 'exito' | 'error', mensaje: string): void
}>()

const { cambiarContrasena } = useAutenticacion()
const contrasenaActual = ref('')
const nuevaContrasena = ref('')
const confirmarContrasena = ref('')
const procesando = ref(false)

const tieneLongitudMinima = computed(() => nuevaContrasena.value.length >= 6)
const tieneMayuscula = computed(() => /[A-Z]/.test(nuevaContrasena.value))
const tieneNumero = computed(() => /[0-9]/.test(nuevaContrasena.value))
const contrasenasCoinciden = computed(() => Boolean(nuevaContrasena.value && nuevaContrasena.value === confirmarContrasena.value))

const porcentajeFortaleza = computed(() => {
  if (!nuevaContrasena.value) return 0
  let pts = 0
  if (tieneLongitudMinima.value) pts += 40
  if (tieneMayuscula.value) pts += 30
  if (tieneNumero.value) pts += 30
  return pts
})

const colorFortaleza = computed(() => {
  if (porcentajeFortaleza.value >= 90) return 'bg-emerald-500 text-emerald-600'
  if (porcentajeFortaleza.value >= 60) return 'bg-sky-500 text-sky-600'
  if (porcentajeFortaleza.value >= 40) return 'bg-amber-500 text-amber-600'
  return 'bg-rose-500 text-rose-600'
})

const etiquetaFortaleza = computed(() => {
  if (porcentajeFortaleza.value >= 90) return 'Fuerte'
  if (porcentajeFortaleza.value >= 60) return 'Buena'
  if (porcentajeFortaleza.value >= 40) return 'Regular'
  return 'Débil'
})

const manejarSubmit = async () => {
  if (nuevaContrasena.value !== confirmarContrasena.value) {
    emit('mostrarAlerta', 'error', 'La nueva contraseña y su confirmación no coinciden.')
    return
  }
  procesando.value = true
  const res = await cambiarContrasena(nuevaContrasena.value)
  procesando.value = false
  if (res.ok) {
    contrasenaActual.value = ''
    nuevaContrasena.value = ''
    confirmarContrasena.value = ''
    emit('mostrarAlerta', 'exito', '¡Contraseña actualizada exitosamente!')
  } else {
    emit('mostrarAlerta', 'error', res.mensaje || 'Error al actualizar contraseña.')
  }
}
</script>

<template>
  <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
    <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">Cambio de Contraseña</h3>
      <p class="text-xs text-slate-500">Actualiza las credenciales de acceso a tu cuenta.</p>
    </div>
    <FormularioCambioClave
      v-model:contrasenaActual="contrasenaActual"
      v-model:nuevaContrasena="nuevaContrasena"
      v-model:confirmarContrasena="confirmarContrasena"
      :procesando="procesando"
      :deshabilitado="!nuevaContrasena || nuevaContrasena.length < 6"
      @submit="manejarSubmit"
    />
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
