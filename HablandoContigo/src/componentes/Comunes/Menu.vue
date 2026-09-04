<!--
  ============================================================================
  COMPONENTE MENÚ LATERAL DESPLEGABLE (Menu.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Barra de navegación vertical orquestada con subcomponentes modulares:
  - MenuNavegacionPrincipal: Enlaces protegidos con RBAC y submenú del Dashboard.
  - MenuUsuarioPerfil: Avatar dinámico, rol y cierre de sesión.
  - ModalSoporte y ModalGestionTiposAlertas: Modales interactivos.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import { useNotificaciones } from '@/Almacenes/useNotificaciones'
import { useHighlight } from '@/Almacenes/useHighlight'
import { useTheme } from '@/Almacenes/useTheme'

import ModalSoporte from '@/componentes/Menu/ModalSoporte.vue'
import ModalGestionTiposAlertas from '@/componentes/Dashboard/ModalGestionTiposAlertas.vue'
import MenuNavegacionPrincipal from '@/componentes/Menu/MenuNavegacionPrincipal.vue'
import MenuUsuarioPerfil from '@/componentes/Menu/MenuUsuarioPerfil.vue'

import {
  Home,
  FolderOpen,
  PieChart,
  Users,
  Settings,
  Search,
  MessageSquare,
  Bell,
  Sun,
  Moon,
  Menu as MenuIcon,
  LayoutDashboard,
  HelpCircle,
  ShieldAlert,
  Laptop,
  BrainCircuit
} from 'lucide-vue-next'

const rutaActual = useRoute()
const { usuarioActual, estaAutenticado, esSuperAdmin, permisosUsuario, cerrarSesion } = useAuth()
const { noLeidas, togglePanel } = useNotificaciones()
const { abrirSpotlight } = useHighlight()
const { esOscuro, alternarTema } = useTheme()

const modalSoporteAbierto = ref(false)
const modalGestionAlertasAbierto = ref(false)
const submenuDashboardAbierto = ref(false)

const seccionesDashboard = computed(() => {
  const list = [
    { id: 'general', nombre: 'Estadísticas Generales', icono: LayoutDashboard },
    { id: 'preguntas', nombre: 'Desglose Preguntas', icono: HelpCircle }
  ]
  if (permisosUsuario.value?.alertas) {
    list.push({ id: 'alertas', nombre: 'Alertas Convivencia', icono: ShieldAlert })
  }
  list.push({ id: 'auditoria', nombre: 'Auditoría UUIDs', icono: Laptop })
  return list
})

const enlacesNavegacion = computed(() => {
  const itemsNoAuth: Array<{
    nombre: string
    tipo: 'ruta' | 'accion'
    ruta?: string
    accion?: () => void
    icono: any
    badge?: string
  }> = [
    { nombre: 'Buscar', tipo: 'accion', accion: abrirSpotlight, icono: Search, badge: '⌘K' },
    { nombre: 'Inicio', tipo: 'ruta', ruta: '/', icono: Home },
    { nombre: 'Soporte', tipo: 'accion', accion: () => { modalSoporteAbierto.value = true }, icono: MessageSquare }
  ]

  if (!estaAutenticado.value) {
    return itemsNoAuth
  }

  const items: Array<{
    nombre: string
    tipo: 'ruta' | 'accion'
    ruta?: string
    accion?: () => void
    icono: any
    badge?: string
  }> = [
    { nombre: 'Buscar', tipo: 'accion', accion: abrirSpotlight, icono: Search, badge: '⌘K' },
    { nombre: 'Inicio', tipo: 'ruta', ruta: '/', icono: Home }
  ]

  if (permisosUsuario.value?.proyectos) {
    items.push({ nombre: 'Proyectos', tipo: 'ruta', ruta: '/proyectos', icono: FolderOpen })
  }
  if (permisosUsuario.value?.dashboard) {
    items.push({ nombre: 'Dashboard', tipo: 'ruta', ruta: '/dashboard', icono: PieChart })
  }
  if (permisosUsuario.value?.cuentas) {
    items.push({ nombre: 'Cuentas', tipo: 'ruta', ruta: '/admin/cuentas', icono: Users })
  }
  if (esSuperAdmin.value || usuarioActual.value?.rol === 'Super Administrador') {
    items.push({
      nombre: 'Alertas IA',
      tipo: 'accion',
      accion: () => { modalGestionAlertasAbierto.value = true },
      icono: BrainCircuit,
      badge: 'Niveles'
    })
  }

  items.push({ nombre: 'Soporte', tipo: 'accion', accion: () => { modalSoporteAbierto.value = true }, icono: MessageSquare })
  items.push({ nombre: 'Configuración', tipo: 'ruta', ruta: '/configuracion', icono: Settings })

  return items
})

const fotoPerfil = computed(() => {
  return usuarioActual.value?.fotoUrl || usuarioActual.value?.avatar || ''
})
</script>

<template>
  <nav
    id="navbar"
    @mouseleave="submenuDashboardAbierto = false"
    class="group fixed top-0 left-0 z-[999] h-screen w-14 hover:w-56 overflow-x-hidden overflow-y-auto bg-slate-900 dark:bg-[#070b12] border-r border-slate-800 shadow-2xl p-0 font-['Poppins',sans-serif] transition-all duration-300 ease-[cubic-bezier(0.175,0.685,0.32,1)] select-none flex flex-col justify-between"
  >
    <!-- SECCIÓN SUPERIOR: Logo + Navegación -->
    <div class="w-full">
      <router-link
        to="/"
        @click="submenuDashboardAbierto = false"
        class="flex items-center w-full h-14 bg-slate-950/80 border-b border-slate-800/80 hover:bg-slate-800/60 transition-colors px-3 gap-3"
        title="HablandoContigo · Inicio"
      >
        <div class="w-8 min-w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-md shrink-0 overflow-hidden p-0.5">
          <img src="/logo.png" alt="HablandoContigo" class="w-full h-full object-contain rounded-lg" />
        </div>
        <span class="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 text-xs font-extrabold tracking-wider text-white">
          HABLANDO CONTIGO
        </span>
      </router-link>

      <!-- Lista de Enlaces Principales -->
      <MenuNavegacionPrincipal
        :enlaces="enlacesNavegacion"
        :seccionesDashboard="seccionesDashboard"
        :submenuDashboardAbierto="submenuDashboardAbierto"
        :rutaActualPath="rutaActual.path"
        :rutaActualSeccion="rutaActual.query.seccion"
        @toggleSubmenuDashboard="submenuDashboardAbierto = !submenuDashboardAbierto"
        @cerrarSubmenu="submenuDashboardAbierto = false"
      />
    </div>

    <!-- SECCIÓN INFERIOR: Notificaciones + Tema + Usuario -->
    <div class="w-full p-1.5 border-t border-slate-800/80 space-y-1 bg-slate-950/40">
      <!-- Campana de Notificaciones (Autenticado) -->
      <button
        v-if="estaAutenticado"
        type="button"
        @click="togglePanel"
        class="flex items-center h-10 w-full rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/90 transition-all cursor-pointer relative text-left"
        title="Alertas y Notificaciones"
      >
        <div class="w-11 min-w-11 flex items-center justify-center shrink-0 relative">
          <Bell class="w-4 h-4 text-amber-400" />
          <span
            v-if="noLeidas > 0"
            class="absolute top-1.5 right-2.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow-md animate-pulse"
          >
            {{ noLeidas }}
          </span>
        </div>
        <span class="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 text-xs font-medium tracking-wide flex items-center justify-between w-full pr-2">
          <span>Notificaciones</span>
          <span v-if="noLeidas > 0" class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
            {{ noLeidas }}
          </span>
        </span>
      </button>

      <!-- Conmutador de Modo Oscuro / Claro -->
      <button
        type="button"
        @click="alternarTema"
        class="flex items-center h-10 w-full rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800/90 transition-all cursor-pointer text-left"
        :title="esOscuro ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'"
      >
        <div class="w-11 min-w-11 flex items-center justify-center shrink-0">
          <Sun v-if="esOscuro" class="w-4 h-4 text-amber-400" />
          <Moon v-else class="w-4 h-4 text-slate-300" />
        </div>
        <span class="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 text-xs font-medium tracking-wide">
          {{ esOscuro ? 'Modo Claro' : 'Modo Oscuro' }}
        </span>
      </button>

      <!-- Usuario y Cierre de Sesión -->
      <MenuUsuarioPerfil
        :usuarioActual="usuarioActual"
        :estaAutenticado="estaAutenticado"
        :fotoPerfil="fotoPerfil"
        @cerrarSesion="cerrarSesion"
      />
    </div>

    <!-- Modales -->
    <ModalSoporte
      :abierto="modalSoporteAbierto"
      @cerrar="modalSoporteAbierto = false"
    />

    <ModalGestionTiposAlertas
      :abierto="modalGestionAlertasAbierto"
      @cerrar="modalGestionAlertasAbierto = false"
    />
  </nav>
</template>