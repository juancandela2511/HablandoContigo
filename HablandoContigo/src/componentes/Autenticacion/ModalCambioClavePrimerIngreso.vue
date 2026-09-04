<!--
  ============================================================================
  MODAL DE CAMBIO OBLIGATORIO DE CONTRASEÑA EN PRIMER INGRESO (ModalCambioClavePrimerIngreso.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Obliga a los colaboradores que ingresan por primera vez con una contraseña asignada
  por el administrador a definir una nueva clave personal y segura administrada
  exclusivamente por Supabase Auth.
  
  ¿CON QUÉ SE CONECTA?
  - useAuth.ts (Método cambiarClavePrimerIngreso)
  - ElementosBase (ModalBase, BotonBase, InsigniaPill)
  - LoginView.vue
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/Almacenes/useAuth'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { KeyRound, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2, Lock } from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
  email: string
  nombre?: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'claveActualizada'): void
}>()

const nuevaClave = ref('')
const confirmarClave = ref('')
const mostrarClave = ref(false)
const cargando = ref(false)
const errorMensaje = ref<string | null>(null)
const exito = ref(false)

const tieneMinimo6 = computed(() => nuevaClave.value.length >= 6)
const tieneMayusculaONumero = computed(() => /[A-Z0-9]/.test(nuevaClave.value))
const clavesCoinciden = computed(() => nuevaClave.value.length > 0 && nuevaClave.value === confirmarClave.value)

const formularioValido = computed(() => {
  return tieneMinimo6.value && clavesCoinciden.value
})

const { actualizarClavePrimerIngreso } = useAuth()

const manejarCambioClave = async () => {
  errorMensaje.value = null

  if (!tieneMinimo6.value) {
    errorMensaje.value = 'La nueva contraseña debe tener al menos 6 caracteres.'
    return
  }

  if (nuevaClave.value !== confirmarClave.value) {
    errorMensaje.value = 'Las contraseñas ingresadas no coinciden.'
    return
  }

  if (nuevaClave.value.toLowerCase() === 'admin123*' || nuevaClave.value.toLowerCase() === '123456') {
    errorMensaje.value = 'Por seguridad, no puedes reutilizar una contraseña común o genérica.'
    return
  }

  cargando.value = true
  try {
    const resultado = await actualizarClavePrimerIngreso(props.email, nuevaClave.value)

    if (resultado.ok) {
      exito.value = true
      setTimeout(() => {
        emit('claveActualizada')
      }, 1200)
    } else {
      errorMensaje.value = resultado.mensaje || 'No se pudo actualizar la contraseña en Supabase.'
    }
  } catch (err: any) {
    errorMensaje.value = err?.message || 'Error de conexión con Supabase.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <ModalBase
    :abierto="abierto"
    titulo="Cambio Obligatorio de Contraseña"
    subtitulo="Por políticas de seguridad administradas por Supabase, debes actualizar la clave temporal asignada antes de acceder a tu cuenta."
    anchoMaximo="md"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
        <KeyRound class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="alerta" tamano="sm">
        PRIMER INGRESO
      </InsigniaPill>
    </template>

    <div class="space-y-4 text-left">
      <!-- Mensaje de Éxito -->
      <div
        v-if="exito"
        class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3 animate-fade-in"
      >
        <CheckCircle2 class="w-5 h-5 text-emerald-500 shrink-0" />
        <div>
          <div class="font-bold">¡Contraseña Actualizada con Éxito!</div>
          <div class="text-[11px] text-emerald-600 dark:text-emerald-400">
            Tu nueva credencial fue registrada de forma segura en Supabase. Redirigiendo...
          </div>
        </div>
      </div>

      <!-- Mensaje de Error -->
      <div
        v-if="errorMensaje"
        class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in"
      >
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-500" />
        <span>{{ errorMensaje }}</span>
      </div>

      <!-- Tarjeta informativa del Colaborador -->
      <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Cuenta:</span>
          <span class="font-bold text-slate-800 dark:text-white">{{ email }}</span>
        </div>
        <div class="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-mono font-bold bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-900">
          <ShieldCheck class="w-3 h-3" />
          <span>Supabase Auth</span>
        </div>
      </div>

      <!-- Formulario de cambio de clave -->
      <form @submit.prevent="manejarCambioClave" class="space-y-3.5">
        <!-- Nueva Contraseña -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Nueva Contraseña Personal
          </label>
          <div class="relative">
            <input
              v-model="nuevaClave"
              :type="mostrarClave ? 'text' : 'password'"
              required
              minlength="6"
              placeholder="Ingresa tu nueva contraseña segura"
              class="w-full pl-3 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:font-sans"
            />
            <button
              type="button"
              @click="mostrarClave = !mostrarClave"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              <EyeOff v-if="mostrarClave" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Confirmar Nueva Contraseña -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Confirmar Nueva Contraseña
          </label>
          <div class="relative">
            <input
              v-model="confirmarClave"
              :type="mostrarClave ? 'text' : 'password'"
              required
              minlength="6"
              placeholder="Vuelve a escribir la nueva contraseña"
              class="w-full pl-3 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:font-sans"
            />
          </div>
        </div>

        <!-- Requisitos de Seguridad -->
        <div class="space-y-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div class="flex items-center gap-1.5" :class="tieneMinimo6 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''">
            <span>{{ tieneMinimo6 ? '✓' : '•' }} Mínimo 6 caracteres de longitud</span>
          </div>
          <div class="flex items-center gap-1.5" :class="clavesCoinciden ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''">
            <span>{{ clavesCoinciden ? '✓' : '•' }} Ambas contraseñas deben ser idénticas</span>
          </div>
        </div>
      </form>
    </div>

    <template #pie>
      <div class="flex items-center justify-end gap-2 w-full">
        <BotonBase
          variante="secundario"
          tamano="pequeno"
          @click="emit('cerrar')"
        >
          Cancelar
        </BotonBase>

        <BotonBase
          tipo="submit"
          variante="primario"
          tamano="pequeno"
          :cargando="cargando"
          :deshabilitado="!formularioValido || cargando || exito"
          @click="manejarCambioClave"
        >
          <template #iconoIzquierdo>
            <Lock class="w-3.5 h-3.5" />
          </template>
          <span>Establecer Contraseña y Entrar</span>
        </BotonBase>
      </div>
    </template>
  </ModalBase>
</template>
