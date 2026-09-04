<!--
  ============================================================================
  COMPONENTE MODAL DE VERIFICACIÓN POR PIN DE 6 DÍGITOS (ModalVerificacionCorreo.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Bloquea el acceso a la plataforma hasta confirmar la titularidad de la cuenta
  mediante el código PIN de 6 dígitos enviado al correo corporativo:
  - VerificacionVisorBandeja: Simulador de bandeja corporativa.
  - VerificacionCasillasPin: 6 casillas numéricas interactivas con pegado.
  - BotonBase: Acciones de confirmación y reenvío.
  
  ¿CON QUÉ SE CONECTA?
  - useCuentas.ts (Métodos verificarCuentaPorPin y reenviarPinVerificacion)
  - ElementosBase (ModalBase, BotonBase, InsigniaPill)
  - LoginView.vue y AdminCuentasView.vue
-->

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useCuentas, type CuentaAdmin } from '@/Almacenes/useCuentas'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { Lock, Mail, RotateCw, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import VerificacionVisorBandeja from './VerificacionCorreo/VerificacionVisorBandeja.vue'
import VerificacionCasillasPin from './VerificacionCorreo/VerificacionCasillasPin.vue'

const props = defineProps<{
  abierto: boolean
  cuenta: CuentaAdmin | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'cuentaVerificada', cuenta: CuentaAdmin): void
}>()

const { verificarCuentaPorPin, reenviarPinVerificacion } = useCuentas()

const digitosPin = ref<string[]>(['', '', '', '', '', ''])
const refCasillas = ref<InstanceType<typeof VerificacionCasillasPin> | null>(null)
const verificando = ref(false)
const verificadoExito = ref(false)
const errorMensaje = ref<string | null>(null)
const reenviando = ref(false)
const mensajeReenvio = ref<string | null>(null)
const pinActualEnviado = ref('')

watch(() => props.cuenta, (c) => {
  if (c) {
    pinActualEnviado.value = c.pinVerificacion || c.tokenVerificacion || '842913'
    digitosPin.value = ['', '', '', '', '', '']
    errorMensaje.value = null
    nextTick(() => {
      refCasillas.value?.enfocarPrimero()
    })
  }
}, { immediate: true })

watch(() => props.abierto, (val) => {
  if (val) {
    digitosPin.value = ['', '', '', '', '', '']
    errorMensaje.value = null
    nextTick(() => {
      refCasillas.value?.enfocarPrimero()
    })
  }
})

const confirmarPin = async () => {
  const pinCompleto = digitosPin.value.join('')
  if (pinCompleto.length < 6 || !props.cuenta) {
    errorMensaje.value = 'Ingresa los 6 dígitos completos del PIN.'
    return
  }

  verificando.value = true
  errorMensaje.value = null

  const resultado = await verificarCuentaPorPin(props.cuenta.id, pinCompleto)
  verificando.value = false

  if (resultado.ok && resultado.cuenta) {
    verificadoExito.value = true
    setTimeout(() => {
      emit('cuentaVerificada', resultado.cuenta!)
    }, 1200)
  } else {
    errorMensaje.value = resultado.mensaje || 'PIN incorrecto. Revisa el código en tu correo corporativo.'
    digitosPin.value = ['', '', '', '', '', '']
    nextTick(() => {
      refCasillas.value?.enfocarPrimero()
    })
  }
}

const solicitarReenvio = async () => {
  if (!props.cuenta || reenviando.value) return
  reenviando.value = true
  errorMensaje.value = null

  const res = await reenviarPinVerificacion(props.cuenta.id)
  reenviando.value = false

  if (res.ok) {
    pinActualEnviado.value = res.pinNuevo
    mensajeReenvio.value = `¡Nuevo PIN ${res.pinNuevo} despachado a ${props.cuenta.email}!`
    digitosPin.value = ['', '', '', '', '', '']
    nextTick(() => {
      refCasillas.value?.enfocarPrimero()
    })
    setTimeout(() => {
      mensajeReenvio.value = null
    }, 5000)
  }
}
</script>

<template>
  <ModalBase
    :abierto="abierto && !!cuenta"
    titulo="Ingresa el PIN de Verificación"
    subtitulo="Tu cuenta está protegida. Ingresa el código PIN enviado a tu correo corporativo."
    anchoMaximo="lg"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <Lock class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="alerta" tamano="sm" :conPulso="true">
        ACTIVACIÓN OBLIGATORIA
      </InsigniaPill>
    </template>

    <div v-if="cuenta" class="space-y-4 text-left">
      <!-- Correo corporativo destinatario -->
      <div class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-sky-500/30 flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-sky-400">
        <Mail class="w-4 h-4 shrink-0 text-sky-500" />
        <span class="font-bold truncate">{{ cuenta.email }}</span>
      </div>

      <!-- Bandeja Corporativa Simulada -->
      <VerificacionVisorBandeja :pin="pinActualEnviado" />

      <!-- Casillas del PIN -->
      <div class="space-y-2 text-center">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Introduce el código de 6 dígitos:
        </label>

        <VerificacionCasillasPin
          ref="refCasillas"
          :digitos="digitosPin"
          :deshabilitado="verificando || verificadoExito"
          @updateDigitos="digitosPin = $event"
          @completado="confirmarPin"
        />
      </div>

      <!-- Alertas de Estado -->
      <div v-if="verificadoExito" class="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>¡PIN confirmado con éxito! Acceso concedido a la plataforma...</span>
      </div>

      <div v-if="errorMensaje" class="p-3 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
        <AlertCircle class="w-4 h-4 text-rose-400 shrink-0" />
        <span>{{ errorMensaje }}</span>
      </div>

      <div v-if="mensajeReenvio" class="p-3 rounded-2xl bg-sky-950/80 border border-sky-700 text-sky-300 text-xs flex items-center gap-2 animate-fade-in">
        <CheckCircle2 class="w-4 h-4 text-sky-400 shrink-0" />
        <span>{{ mensajeReenvio }}</span>
      </div>

      <!-- Reenviar PIN -->
      <div class="flex items-center justify-between text-xs pt-1">
        <span class="text-slate-400">¿No lo recibiste?</span>
        <button
          type="button"
          @click="solicitarReenvio"
          :disabled="reenviando"
          class="text-sky-500 hover:text-sky-400 font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RotateCw class="w-3.5 h-3.5" :class="reenviando ? 'animate-spin' : ''" />
          <span>{{ reenviando ? 'Generando...' : 'Reenviar nuevo PIN' }}</span>
        </button>
      </div>
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
          variante="primario"
          tamano="pequeno"
          :cargando="verificando"
          textoCarga="Validando..."
          :deshabilitado="digitosPin.join('').length < 6"
          @click="confirmarPin"
        >
          Verificar y Acceder
        </BotonBase>
      </div>
    </template>
  </ModalBase>
</template>
