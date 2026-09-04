/**
 * ============================================================================
 * ENRUTADOR PRINCIPAL DE LA APLICACIÓN (router/index.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Define la tabla de rutas de Vue Router 4 para la navegación Single Page Application (SPA).
 * Establece guardias de navegación (`beforeEach`) para proteger las secciones administrativas
 * (`/admin/cuentas`, `/proyectos`, `/dashboard`, `/configuracion`) e impedir el acceso
 * no autorizado redirigiendo al `/login`.
 * 
 * ¿PARA QUÉ SIRVE?
 * - Orquestar el flujo de navegación entre la página de bienvenida, encuestas anónimas y paneles administrativos.
 * - Desplazar suavemente el scroll hacia la parte superior (`scrollBehavior: top: 0`) al cambiar de ruta.
 * 
 * ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
 * - useAuth.ts: Provee `estaAutenticado` para validar las guardias de ruta.
 * - Vistas: HeroPrincipal, LoginView, ResponderEncuestaView, AdminCuentasView, ProyectosView, DashboardView, ConfiguracionView, VistaGenerica.
 * - main.ts: Se registra con `app.use(router)`.
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HeroPrincipal from '@/vistas/Inicio/HeroPrincipal.vue'
import LoginView from '@/vistas/Auth/LoginView.vue'
import AdminCuentasView from '@/vistas/Admin/AdminCuentasView.vue'
import ProyectosView from '@/vistas/Proyectos/ProyectosView.vue'
import DashboardView from '@/vistas/Dashboard/DashboardView.vue'
import ConfiguracionView from '@/vistas/Configuracion/ConfiguracionView.vue'
import ResponderEncuestaView from '@/vistas/Encuestas/ResponderEncuestaView.vue'
import VistaGenerica from '@/vistas/Comunes/VistaGenerica.vue'
import Error404View from '@/vistas/Comunes/Error404View.vue'
import { useAuth } from '@/Almacenes/useAuth'

/**
 * Definición estructurada de rutas del ecosistema HablandoContigo
 */
const rutas: Array<RouteRecordRaw> = [
  // Ruta Principal / Portada de Bienvenida 3D
  {
    path: '/',
    name: 'Inicio',
    component: HeroPrincipal
  },
  // Acceso Administrativo
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  // Ruta pública y confidencial para responder encuestas anónimas con UUID
  {
    path: '/responder/:id?',
    name: 'ResponderEncuesta',
    component: ResponderEncuestaView
  },
  {
    path: '/encuesta/:id?',
    redirect: to => `/responder/${to.params.id || 'enc-001'}`
  },
  // ==========================================
  // ==========================================
  // SECCIONES ADMINISTRATIVAS PROTEGIDAS CON RBAC
  // ==========================================
  {
    path: '/admin',
    redirect: '/admin/cuentas'
  },
  {
    path: '/admin/cuentas',
    name: 'AdminCuentas',
    component: AdminCuentasView,
    meta: {
      requiereAuth: true,
      rolesPermitidos: ['Super Administrador']
    }
  },
  {
    path: '/proyectos',
    name: 'Proyectos',
    component: ProyectosView,
    meta: {
      requiereAuth: true,
      rolesPermitidos: ['Super Administrador', 'Administrador', 'Supervisor']
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: {
      requiereAuth: true,
      rolesPermitidos: ['Super Administrador', 'Administrador', 'Analista RRHH']
    }
  },
  {
    path: '/configuracion',
    name: 'Configuracion',
    component: ConfiguracionView,
    meta: {
      requiereAuth: true,
      rolesPermitidos: ['Super Administrador', 'Administrador', 'Supervisor', 'Analista RRHH']
    }
  },
  {
    path: '/team',
    redirect: '/admin/cuentas'
  },
  {
    path: '/buscar',
    name: 'Buscar',
    component: VistaGenerica,
    props: {
      titulo: 'Búsqueda Global',
      descripcion: 'Explora encuestas, métricas de colaboradores y reportes de clima.',
      icono: '🔍'
    }
  },
  {
    path: '/support',
    name: 'Soporte',
    component: VistaGenerica,
    props: {
      titulo: 'Soporte & Atención al Usuario',
      descripcion: 'Línea directa para dudas sobre cuestionarios y confidencialidad.',
      icono: '💬'
    }
  },
  {
    path: '/404',
    name: 'Error404',
    component: Error404View
  },
  // Captura y renderiza ventana de error 404 para cualquier ruta desconocida
  {
    path: '/:pathMatch(.*)*',
    name: 'NoEncontrado',
    component: Error404View
  }
]

/**
 * Instancia del enrutador de Vue
 */
const enrutador = createRouter({
  history: createWebHistory(),
  routes: rutas,
  scrollBehavior() {
    return { top: 0 }
  }
})

/**
 * Guardia de navegación global para proteger rutas con `meta.requiereAuth` y control de roles (RBAC)
 */
enrutador.beforeEach((rutaHacia, rutaDesde, siguiente) => {
  const { estaAutenticado, usuarioActual, permisosUsuario } = useAuth()

  if (rutaHacia.meta.requiereAuth && !estaAutenticado.value) {
    // Si intenta ingresar a una sección protegida sin sesión, redirigir al login
    siguiente({ path: '/login', query: { redirect: rutaHacia.fullPath } })
    return
  }

  if (rutaHacia.path === '/login' && estaAutenticado.value) {
    // Si ya está autenticado, redirigir a su vista principal según rol
    if (usuarioActual.value?.rol === 'Super Administrador') {
      siguiente('/admin/cuentas')
    } else if (usuarioActual.value?.rol === 'Supervisor') {
      siguiente('/proyectos')
    } else {
      siguiente('/dashboard')
    }
    return
  }

  // Verificación estricta de permisos por Rol (RBAC)
  const rolesPermitidos = rutaHacia.meta.rolesPermitidos as string[] | undefined
  if (rolesPermitidos && usuarioActual.value) {
    const tienePermiso = rolesPermitidos.includes(usuarioActual.value.rol)
    if (!tienePermiso) {
      // Redirigir a una ruta permitida para su rol
      if (permisosUsuario.value?.proyectos) {
        siguiente('/proyectos')
      } else if (permisosUsuario.value?.dashboard) {
        siguiente('/dashboard')
      } else {
        siguiente('/configuracion')
      }
      return
    }
  }

  siguiente()
})

export default enrutador
