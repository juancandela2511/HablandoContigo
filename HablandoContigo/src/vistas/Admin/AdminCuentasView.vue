<!--
  ============================================================================
  VISTA ADMINISTRACIÓN DE CUENTAS Y ROLES (AdminCuentasView.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Vista principal de gestión administrativa. Orquesta:
  - Top Bar con breadcrumbs y perfil del administrador logueado.
  - Tarjetas de métricas rápidas (`AdminMetricasRapidas.vue`).
  - Barra de búsqueda y filtros secundarios (`AdminBarraFiltros.vue`).
  - Tabla de registros de cuentas (`AdminTablaCuentas.vue`).
  - Modales de creación/edición (`ModalCuentaFormulario.vue`) y eliminación (`ModalEliminarCuenta.vue`).
  
  ¿PARA QUÉ SIRVE?
  - Proveer una arquitectura modular, limpia y desacoplada para la administración de accesos.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useCuentas.ts, useAuth.ts, useHighlight.ts.
  - Subcomponentes en `src/componentes/Admin/`.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import { useCuentas, type CuentaAdmin, type RolCuenta, type EstadoCuenta } from '@/Almacenes/useCuentas'
import { useHighlight } from '@/Almacenes/useHighlight'
import { CheckCircle2, ChevronRight, LogOut } from 'lucide-vue-next'

// Componentes modulares
import AdminMetricasRapidas from '@/componentes/Admin/AdminMetricasRapidas.vue'
import AdminBarraFiltros from '@/componentes/Admin/AdminBarraFiltros.vue'
import AdminTablaCuentas from '@/componentes/Admin/AdminTablaCuentas.vue'
import ModalCuentaFormulario from '@/componentes/Admin/ModalCuentaFormulario.vue'
import ModalEliminarCuenta from '@/componentes/Admin/ModalEliminarCuenta.vue'
import ModalVerificacionCorreo from '@/componentes/Admin/ModalVerificacionCorreo.vue'

const router = useRouter()
const { usuarioActual, cerrarSesion } = useAuth()
const { elementoResaltadoId } = useHighlight()
const {
  cuentas,
  totalCuentas,
  cuentasActivas,
  cuentasInactivas,
  cuentasPendientes,
  totalEncuestasGestionadas,
  departamentosUnicos,
  agregarCuenta,
  editarCuenta,
  cambiarContrasenaPorAdmin,
  verificarCuentaPorCorreo,
  toggleEstado,
  eliminarCuenta,
  reiniciarDatosDemo
} = useCuentas()

// Filtros y Búsqueda reactiva
const terminoBusqueda = ref('')
const filtroRol = ref<string>('todos')
const filtroDepartamento = ref<string>('todos')
const filtroEstado = ref<string>('todos')

// Modales interactivos
const modalAbierto = ref(false)
const modoEdicion = ref(false)
const cuentaIdEditando = ref<string | null>(null)

const formularioCuenta = ref({
  nombre: '',
  email: '',
  rol: 'Administrador' as RolCuenta,
  departamento: 'Recursos Humanos',
  estado: 'Pendiente' as EstadoCuenta
})

const modalEliminarAbierto = ref(false)
const cuentaAEliminar = ref<CuentaAdmin | null>(null)

const modalVerificacionAbierto = ref(false)
const cuentaParaVerificar = ref<CuentaAdmin | null>(null)

// Notificaciones temporales Toast
const mensajeToast = ref<string | null>(null)
function mostrarToast(mensaje: string) {
  mensajeToast.value = mensaje
  setTimeout(() => {
    mensajeToast.value = null
  }, 3500)
}

/** Colección de cuentas filtrada reactivamente */
const cuentasFiltradas = computed(() => {
  return cuentas.value.filter((cuenta) => {
    const coincideTexto =
      cuenta.nombre.toLowerCase().includes(terminoBusqueda.value.toLowerCase()) ||
      cuenta.email.toLowerCase().includes(terminoBusqueda.value.toLowerCase())

    const coincideRol = filtroRol.value === 'todos' || cuenta.rol === filtroRol.value
    const coincideDep = filtroDepartamento.value === 'todos' || cuenta.departamento === filtroDepartamento.value
    const coincideEstado = filtroEstado.value === 'todos' || cuenta.estado === filtroEstado.value

    return coincideTexto && coincideRol && coincideDep && coincideEstado
  })
})

const abrirModalCrear = () => {
  modoEdicion.value = false
  cuentaIdEditando.value = null
  formularioCuenta.value = {
    nombre: '',
    email: '',
    rol: 'Administrador',
    departamento: 'Recursos Humanos',
    estado: 'Pendiente'
  }
  modalAbierto.value = true
}

const abrirModalEditar = (cuenta: CuentaAdmin) => {
  modoEdicion.value = true
  cuentaIdEditando.value = cuenta.id
  formularioCuenta.value = {
    nombre: cuenta.nombre,
    email: cuenta.email,
    rol: cuenta.rol,
    departamento: cuenta.departamento,
    estado: cuenta.estado
  }
  modalAbierto.value = true
}

const abrirVerificacion = (cuenta: CuentaAdmin) => {
  cuentaParaVerificar.value = cuenta
  modalVerificacionAbierto.value = true
}

const guardarCuenta = async (datos: typeof formularioCuenta.value & { nuevaContrasena?: string }) => {
  if (!datos.nombre || !datos.email) {
    mostrarToast('Por favor diligencia nombre y correo.')
    return
  }

  if (modoEdicion.value && cuentaIdEditando.value) {
    await editarCuenta(cuentaIdEditando.value, { 
      nombre: datos.nombre,
      email: datos.email,
      rol: datos.rol,
      departamento: datos.departamento,
      estado: datos.estado
    })

    if (datos.nuevaContrasena) {
      await cambiarContrasenaPorAdmin(cuentaIdEditando.value, datos.nuevaContrasena)
      mostrarToast(`Contraseña y datos de "${datos.nombre}" actualizados en Supabase`)
    } else {
      mostrarToast(`Cuenta de "${datos.nombre}" actualizada con éxito en Supabase`)
    }
    modalAbierto.value = false
  } else {
    const res = await agregarCuenta({ 
      nombre: datos.nombre,
      email: datos.email,
      rol: datos.rol,
      departamento: datos.departamento,
      contrasena: datos.nuevaContrasena,
      estado: 'Pendiente'
    })
    
    if (!res.ok) {
      mostrarToast(res.mensaje)
      return
    }

    modalAbierto.value = false
    const cuentaCreada = cuentas.value.find(c => c.email.toLowerCase() === datos.email.toLowerCase()) || null
    cuentaParaVerificar.value = cuentaCreada
    modalVerificacionAbierto.value = true
    mostrarToast(`Cuenta registrada en Supabase. Haz clic en el botón para verificar.`)
  }
}

const confirmarEliminacion = (cuenta: CuentaAdmin) => {
  cuentaAEliminar.value = cuenta
  modalEliminarAbierto.value = true
}

const ejecutarEliminacion = () => {
  if (cuentaAEliminar.value) {
    eliminarCuenta(cuentaAEliminar.value.id)
    mostrarToast(`Cuenta de ${cuentaAEliminar.value.nombre} eliminada`)
    modalEliminarAbierto.value = false
    cuentaAEliminar.value = null
  }
}

const manejarToggle = (cuenta: CuentaAdmin) => {
  toggleEstado(cuenta.id)
  const nuevoEstado = cuenta.estado === 'Activo' ? 'Inactivo' : 'Activo'
  mostrarToast(`Estado cambiado a ${nuevoEstado}`)
}

const restablecerFiltros = () => {
  terminoBusqueda.value = ''
  filtroRol.value = 'todos'
  filtroDepartamento.value = 'todos'
  filtroEstado.value = 'todos'
}

const manejarCerrarSesion = async () => {
  await cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 pl-14 sm:pl-16 pr-4 sm:pr-8 py-8 relative font-['Poppins',sans-serif] transition-colors duration-300">
    
    <!-- Luces sutiles de fondo -->
    <div class="fixed top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-0 left-1/3 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Notificación Toast -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-4 opacity-0"
    >
      <div 
        v-if="mensajeToast" 
        class="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 border border-sky-500/50 shadow-2xl text-slate-900 dark:text-white text-sm px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl"
      >
        <CheckCircle2 class="w-5 h-5 text-sky-500 shrink-0" />
        <span>{{ mensajeToast }}</span>
      </div>
    </transition>

    <div class="max-w-7xl mx-auto space-y-8 relative z-10">
      
      <!-- Top Bar: Breadcrumb + Info Admin Logueado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Panel de Control</span>
            <ChevronRight class="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            <span class="text-sky-600 dark:text-sky-400 font-semibold">Administración de Cuentas</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Administrador de Cuentas</span>
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
              {{ totalCuentas }} Registros
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gestiona los accesos, permisos departamentales y roles para el sistema de encuestas y clima laboral.
          </p>
        </div>

        <!-- Tarjeta del Administrador Actual y Logout -->
        <div class="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 p-2.5 rounded-2xl backdrop-blur-xl shadow-md">
          <div class="w-10 h-10 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-sky-500/10 shrink-0 flex items-center justify-center">
            <img 
              v-if="usuarioActual?.avatar || usuarioActual?.fotoUrl"
              :src="usuarioActual.avatar || usuarioActual.fotoUrl" 
              alt="Avatar Admin" 
              class="w-full h-full object-cover"
            />
            <span v-else class="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase">
              {{ usuarioActual?.nombre ? usuarioActual.nombre.charAt(0) : 'A' }}
            </span>
          </div>
          <div class="text-left pr-2">
            <p class="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {{ usuarioActual?.nombre || 'Administrador General' }}
            </p>
            <p class="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
              {{ usuarioActual?.rol || 'Super Administrador' }}
            </p>
          </div>
          <button
            @click="manejarCerrarSesion"
            title="Cerrar Sesión"
            class="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Tarjetas de Métricas Rápidas (Componente Modular) -->
      <AdminMetricasRapidas
        :totalCuentas="totalCuentas"
        :cuentasActivas="cuentasActivas"
        :cuentasInactivas="cuentasInactivas"
        :cuentasPendientes="cuentasPendientes"
        :totalEncuestasGestionadas="totalEncuestasGestionadas"
      />

      <!-- Barra de Acciones y Filtros (Componente Modular) -->
      <AdminBarraFiltros
        v-model:terminoBusqueda="terminoBusqueda"
        v-model:filtroRol="filtroRol"
        v-model:filtroDepartamento="filtroDepartamento"
        v-model:filtroEstado="filtroEstado"
        :departamentosUnicos="departamentosUnicos"
        @abrirModalCrear="abrirModalCrear"
        @reiniciarDatosDemo="reiniciarDatosDemo"
      />

      <!-- Tabla Principal de Cuentas (Componente Modular) -->
      <AdminTablaCuentas
        :cuentas="cuentasFiltradas"
        :elementoResaltadoId="elementoResaltadoId"
        @manejarToggle="manejarToggle"
        @abrirModalEditar="abrirModalEditar"
        @abrirVerificacion="abrirVerificacion"
        @confirmarEliminacion="confirmarEliminacion"
        @restablecerFiltros="restablecerFiltros"
      />

    </div>

    <!-- Modales Modulares -->
    <ModalCuentaFormulario
      :abierto="modalAbierto"
      :modoEdicion="modoEdicion"
      :datosIniciales="formularioCuenta"
      @cerrar="modalAbierto = false"
      @guardar="guardarCuenta"
    />

    <ModalEliminarCuenta
      :abierto="modalEliminarAbierto"
      :cuenta="cuentaAEliminar"
      @cerrar="modalEliminarAbierto = false"
      @confirmar="ejecutarEliminacion"
    />

    <ModalVerificacionCorreo
      :abierto="modalVerificacionAbierto"
      :cuenta="cuentaParaVerificar"
      @cerrar="modalVerificacionAbierto = false"
      @cuentaVerificada="mostrarToast('¡Cuenta verificada y activada con éxito!')"
    />

  </div>
</template>
