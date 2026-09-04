<!--
  ============================================================================
  VISTA DE INICIO DE SESIÓN ADMINISTRATIVO (LoginView.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Interfaz de autenticación orquestada con subcomponentes modulares en español:
  - FormularioLogin: Captura segura de correo y contraseña, y acceso rápido.
  - SelectorCuentasDemo: Accesos de prueba rápidos por roles.
  - EstadoConexionSupabase: Monitoreo en vivo y siembra en BD.
  - ModalVerificacionCorreo: Modal de validación de código PIN.
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import { useCuentas, type CuentaAdmin } from '@/Almacenes/useCuentas'
import { useSupabaseStatus } from '@/Almacenes/useSupabaseStatus'
import {
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Info,
  KeyRound
} from 'lucide-vue-next'

import FormularioLogin from '@/componentes/Autenticacion/FormularioLogin.vue'
import SelectorCuentasDemo from '@/componentes/Autenticacion/SelectorCuentasDemo.vue'
import EstadoConexionSupabase from '@/componentes/Autenticacion/EstadoConexionSupabase.vue'
import ModalVerificacionCorreo from '@/componentes/Admin/ModalVerificacionCorreo.vue'
import ModalCambioClavePrimerIngreso from '@/componentes/Autenticacion/ModalCambioClavePrimerIngreso.vue'

const route = useRoute()
const router = useRouter()
const { 
  iniciarSesion, 
  accesoRapidoAdmin, 
  cargando, 
  errorAutenticacion, 
  cuentaPendienteVerificacion, 
  limpiarCuentaPendiente,
  requiereCambioClavePrimerIngreso,
  emailPrimerIngreso,
  cerrarModalPrimerIngreso
} = useAuth()
const { cuentas, verificarCuentaPorCorreo, sembrarCuentasInicialesEnSupabase, cargandoCuentas } = useCuentas()
const { mensajeError: errorConexion, tieneError, verificarConexionSupabase } = useSupabaseStatus()

const refFormulario = ref<InstanceType<typeof FormularioLogin> | null>(null)
const mensajeExito = ref(false)
const cuentaDesactivadaNotif = ref(route.query.desactivada === '1')
const cuentaActivadaNotif = ref(false)
const sembrandoCuentas = ref(false)
const siembraExitosa = ref(false)

const modalVerificacionAbierto = ref(false)
const cuentaParaVerificar = ref<CuentaAdmin | null>(null)

onMounted(async () => {
  const activarId = route.query.activar_id as string
  if (activarId) {
    const res = await verificarCuentaPorCorreo(activarId)
    if (res && res.ok) {
      cuentaActivadaNotif.value = true
    }
  }
})

const ejecutarSiembraEnSupabase = async () => {
  sembrandoCuentas.value = true
  const res = await sembrarCuentasInicialesEnSupabase()
  sembrandoCuentas.value = false
  if (res.ok) {
    siembraExitosa.value = true
    await verificarConexionSupabase(false)
    setTimeout(() => { siembraExitosa.value = false }, 4000)
  }
}

const cuentasDemoRoles = computed(() => {
  return cuentas.value.slice(0, 4).map(c => ({
    rol: c.rol,
    email: c.email,
    desc: c.departamento
  }))
})

const seleccionarCuentaDemo = (email: string) => {
  refFormulario.value?.establecerCredenciales(email, 'Admin123*')
}

const abrirVerificacionDesdeLogin = () => {
  const encontrada = cuentas.value.find(c => c.estado === 'Pendiente') || cuentas.value[0]
  if (encontrada) {
    cuentaParaVerificar.value = encontrada
    modalVerificacionAbierto.value = true
  }
}

const manejarEnvio = async (credenciales: { email: string; pass: string }) => {
  const exito = await iniciarSesion(credenciales.email, credenciales.pass)
  if (exito) {
    mensajeExito.value = true
    setTimeout(() => {
      const email = credenciales.email.toLowerCase()
      if (email.includes('admin') || email.includes('siticore')) {
        router.push('/admin/cuentas')
      } else if (email.includes('supervisor') || email.includes('morales')) {
        router.push('/proyectos')
      } else {
        router.push('/dashboard')
      }
    }, 600)
  } else if (cuentaPendienteVerificacion.value) {
    cuentaParaVerificar.value = cuentaPendienteVerificacion.value
    modalVerificacionAbierto.value = true
  }
}

const manejarAccesoRapido = async () => {
  const exito = await accesoRapidoAdmin()
  if (exito) {
    mensajeExito.value = true
    setTimeout(() => {
      router.push('/admin/cuentas')
    }, 500)
  }
}

const alVerificarCuentaConPin = async (cuentaVerificada: CuentaAdmin) => {
  modalVerificacionAbierto.value = false
  limpiarCuentaPendiente()
  const ok = await iniciarSesion(cuentaVerificada.email, 'Admin123*')
  if (ok) router.push('/dashboard')
}

const alActualizarClavePrimerIngreso = () => {
  mensajeExito.value = true
  setTimeout(() => {
    router.push('/dashboard')
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen w-full bg-[#0a0f0d] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-['Poppins',sans-serif]">
    <!-- Luces ambientales de fondo -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Botón Volver al Inicio -->
    <router-link 
      to="/" 
      class="absolute top-6 left-6 sm:left-10 z-20 inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all duration-200"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Volver al Inicio</span>
    </router-link>

    <!-- Tarjeta Principal de Login -->
    <div class="w-full max-w-md relative z-10 my-auto py-6">
      <div class="rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-7 sm:p-9 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>

        <!-- Encabezado / Logo -->
        <div class="text-center space-y-2 mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-inner mb-2">
            <ShieldCheck class="w-7 h-7 text-sky-400" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Acceso Corporativo
          </h1>
          <p class="text-xs sm:text-sm text-slate-400">
            Ingreso exclusivo para colaboradores de <span class="text-sky-400 font-medium">@siticore</span> y <span class="text-sky-400 font-medium">@ontime</span>.
          </p>
        </div>


        <!-- Notificaciones de cuenta -->
        <div v-if="cuentaActivadaNotif" class="mb-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-start gap-2.5 text-left">
          <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p class="font-bold text-white">¡Cuenta Activada y Verificada!</p>
            <p class="text-[11px] text-emerald-300/90">Tu correo ha sido confirmado correctamente.</p>
          </div>
        </div>

        <div v-if="cuentaDesactivadaNotif" class="mb-5 p-3.5 rounded-xl bg-amber-950/70 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2.5 text-left">
          <Info class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>Tu cuenta ha sido desactivada correctamente. Los accesos han sido suspendidos.</span>
        </div>

        <div v-if="errorAutenticacion" class="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-300 text-xs space-y-2 text-left">
          <div class="flex items-start gap-2.5">
            <AlertCircle class="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{{ errorAutenticacion }}</span>
          </div>
          <button
            v-if="errorAutenticacion.includes('PIN') || errorAutenticacion.includes('bloqueada') || errorAutenticacion.includes('verificar')"
            type="button"
            @click="abrirVerificacionDesdeLogin"
            class="w-full py-2 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <KeyRound class="w-3.5 h-3.5" />
            <span>Ingresar PIN de 6 Dígitos para Desbloquear</span>
          </button>
        </div>

        <div v-if="mensajeExito" class="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5 text-left">
          <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
          <span>¡Acceso concedido! Redirigiendo según tus permisos de rol...</span>
        </div>

        <!-- Formulario Desacoplado -->
        <FormularioLogin
          ref="refFormulario"
          :cargando="cargando"
          @enviar="manejarEnvio"
          @accesoRapido="manejarAccesoRapido"
        />

        <!-- Selector Desacoplado de Cuentas Demo -->
        <SelectorCuentasDemo
          :cuentasDemo="cuentasDemoRoles"
          @seleccionar="seleccionarCuentaDemo"
        />

        <p class="text-center text-[11px] text-slate-500 mt-5 flex items-center justify-center gap-1.5">
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
          <span>Políticas de dominio @siticore y @ontime activas</span>
        </p>
      </div>
    </div>

    <!-- Modal de Verificación de Correo con PIN -->
    <ModalVerificacionCorreo
      :abierto="modalVerificacionAbierto"
      :cuenta="cuentaParaVerificar"
      @cerrar="modalVerificacionAbierto = false"
      @cuentaVerificada="alVerificarCuentaConPin"
    />

    <!-- Modal Obligatorio de Cambio de Contraseña en Primer Ingreso -->
    <ModalCambioClavePrimerIngreso
      :abierto="requiereCambioClavePrimerIngreso"
      :email="emailPrimerIngreso"
      @cerrar="cerrarModalPrimerIngreso"
      @claveActualizada="alActualizarClavePrimerIngreso"
    />
  </div>
</template>
