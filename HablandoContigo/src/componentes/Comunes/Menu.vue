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
  X
} from 'lucide-vue-next'

const rutaActual = useRoute()
const { usuarioActual, estaAutenticado, esSuperAdmin, permisosUsuario, cerrarSesion } = useAuth()
const { noLeidas, togglePanel } = useNotificaciones()
const { abrirSpotlight } = useHighlight()
const { esOscuro, alternarTema } = useTheme()

const modalSoporteAbierto = ref(false)
const modalGestionAlertasAbierto = ref(false)
const submenuDashboardAbierto = ref(false)
const menuMovilAbierto = ref(false)

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
      nombre: 'Alertas',
      tipo: 'accion',
      accion: () => { modalGestionAlertasAbierto.value = true },
      icono: ShieldAlert,
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
  <div>
    <!-- BARRA LATERAL ESCRITORIO (Visible en pantallas md y mayores) -->
    <nav
      id="navbar"
      @mouseleave="submenuDashboardAbierto = false"
      class="hidden md:flex group fixed top-0 left-0 z-[999] h-screen w-14 hover:w-56 overflow-x-hidden overflow-y-auto bg-slate-900 dark:bg-[#070b12] border-r border-slate-800 shadow-2xl p-0 font-['Poppins',sans-serif] transition-all duration-300 ease-[cubic-bezier(0.175,0.685,0.32,1)] select-none flex-col justify-between"
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
          title="Actividad y Notificaciones"
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

    <!-- BOTÓN FLOTANTE MODO MÓVIL (Visible solo en dispositivos móviles < md) -->
    <div class="md:hidden fixed bottom-5 right-5 z-[9995]">
      <button
        type="button"
        @click="menuMovilAbierto = !menuMovilAbierto"
        class="w-14 h-14 rounded-full bg-slate-900 dark:bg-slate-800 text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-slate-700/80 flex items-center justify-center cursor-pointer active:scale-90 transition-all hover:bg-slate-800 relative group"
        :title="menuMovilAbierto ? 'Cerrar Menú' : 'Abrir Menú de Navegación'"
        aria-label="Abrir menú de navegación móvil"
      >
        <X v-if="menuMovilAbierto" class="w-6 h-6 text-amber-400 transition-transform duration-200" />
        <MenuIcon v-else class="w-6 h-6 text-white transition-transform duration-200" />

        <!-- Badge flotante de notificaciones no leídas -->
        <span
          v-if="noLeidas > 0 && !menuMovilAbierto"
          class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-lg border-2 border-slate-900 animate-pulse"
        >
          {{ noLeidas }}
        </span>
      </button>
    </div>

    <!-- DRAWER / VENTANA FLOTANTE DE MENÚ MÓVIL -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-8"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-8"
      >
        <div
          v-if="menuMovilAbierto"
          class="md:hidden fixed inset-0 z-[9990] flex flex-col justify-end bg-slate-950/70 backdrop-blur-md font-['Poppins',sans-serif] p-3 sm:p-4"
          @click.self="menuMovilAbierto = false"
        >
          <div class="w-full max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            <!-- Header del Menú Móvil -->
            <div class="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5 overflow-hidden">
                  <img src="/logo.png" alt="Ontime" class="w-full h-full object-contain" />
                </div>
                <div>
                  <span class="text-xs font-black tracking-wider text-white">HABLANDO CONTIGO</span>
                  <p class="text-[10px] text-amber-400 font-mono">ontime.es</p>
                </div>
              </div>
              <button
                type="button"
                @click="menuMovilAbierto = false"
                class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Cuerpo deslizable del Menú -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <!-- Tarjeta de Perfil Móvil -->
              <div v-if="usuarioActual" class="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center gap-3">
                <img
                  :src="fotoPerfil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'"
                  alt="Avatar"
                  class="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-white truncate">{{ usuarioActual.nombre }}</p>
                  <p class="text-[10px] text-slate-400 truncate">{{ usuarioActual.email }}</p>
                  <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {{ usuarioActual.rol }}
                  </span>
                </div>
              </div>

              <!-- Acciones Rápidas (Buscar + Notificaciones + Tema) -->
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="abrirSpotlight(); menuMovilAbierto = false"
                  class="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center gap-1 text-slate-300"
                >
                  <Search class="w-4 h-4 text-sky-400" />
                  <span class="text-[11px] font-medium">Buscar</span>
                </button>

                <button
                  type="button"
                  @click="togglePanel(); menuMovilAbierto = false"
                  class="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center gap-1 text-slate-300 relative"
                >
                  <Bell class="w-4 h-4 text-amber-400" />
                  <span class="text-[11px] font-medium">Actividad</span>
                  <span
                    v-if="noLeidas > 0"
                    class="absolute top-1.5 right-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black"
                  >
                    {{ noLeidas }}
                  </span>
                </button>

                <button
                  type="button"
                  @click="alternarTema"
                  class="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center gap-1 text-slate-300"
                >
                  <Sun v-if="esOscuro" class="w-4 h-4 text-amber-400" />
                  <Moon v-else class="w-4 h-4 text-slate-300" />
                  <span class="text-[11px] font-medium">{{ esOscuro ? 'Claro' : 'Oscuro' }}</span>
                </button>
              </div>

              <!-- Lista de Enlaces de Navegación -->
              <div class="space-y-1.5 pt-2 border-t border-slate-800/60">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Navegación</p>
                <template v-for="enlace in enlacesNavegacion" :key="enlace.nombre">
                  <router-link
                    v-if="enlace.tipo === 'ruta' && enlace.ruta"
                    :to="enlace.ruta"
                    @click="menuMovilAbierto = false"
                    class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                    :class="[
                      rutaActual.path === enlace.ruta
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    ]"
                  >
                    <component :is="enlace.icono" class="w-4 h-4" />
                    <span>{{ enlace.nombre }}</span>
                  </router-link>

                  <button
                    v-else-if="enlace.tipo === 'accion'"
                    type="button"
                    @click="enlace.accion?.(); menuMovilAbierto = false"
                    class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors text-left"
                  >
                    <component :is="enlace.icono" class="w-4 h-4" />
                    <span>{{ enlace.nombre }}</span>
                    <span v-if="enlace.badge" class="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {{ enlace.badge }}
                    </span>
                  </button>
                </template>
              </div>

              <!-- Botón de Cerrar Sesión -->
              <div class="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  @click="cerrarSesion(); menuMovilAbierto = false"
                  class="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-rose-500/20"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>