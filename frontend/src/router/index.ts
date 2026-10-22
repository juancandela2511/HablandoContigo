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
// Rutas públicas: cargadas de forma inmediata (el usuario las ve primero)
import HeroPrincipal from '@/vistas/Inicio/HeroPrincipal.vue'
import LoginView from '@/vistas/Autenticacion/LoginView.vue'
import ResponderEncuestaView from '@/vistas/Encuestas/ResponderEncuestaView.vue'

// Rutas protegidas: lazy-loaded (se descargan solo cuando el usuario navega a ellas)
const ProyectosView = () => import('@/vistas/Proyectos/ProyectosView.vue')
const DashboardView = () => import('@/vistas/Dashboard/DashboardView.vue')
const ConfiguracionView = () => import('@/vistas/Configuracion/ConfiguracionView.vue')
const VistaGenerica = () => import('@/vistas/Comunes/VistaGenerica.vue')
const Error404View = () => import('@/vistas/Comunes/Error404View.vue')

import { useAutenticacion } from '@/Almacenes/useAutenticacion'


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
  // SECCIONES ADMINISTRATIVAS PROTEGIDAS CON RBAC
  // ==========================================
  {
    path: '/admin',
    redirect: '/dashboard'
  },
  {
    path: '/admin/cuentas',
    redirect: '/dashboard'
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
    redirect: '/dashboard'
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
    path: '/admin/errores',
    name: 'CatalogoErrores',
    component: VistaGenerica,
    props: {
      titulo: 'Catálogo de Alertas y Errores',
      descripcion: 'Monitoreo de excepciones, alertas psicosociales y logs del sistema.',
      icono: '⚠️'
    },
    meta: {
      requiereAuth: true,
      rolesPermitidos: ['Super Administrador', 'Administrador', 'Supervisor', 'Analista RRHH']
    }
  },
  {
    path: '/errores',
    redirect: '/admin/errores'
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
enrutador.beforeEach((rutaHacia) => {
  const { estaAutenticado, usuarioActual, permisosUsuario } = useAutenticacion()

  if (rutaHacia.meta.requiereAuth && !estaAutenticado.value) {
    // Si intenta ingresar a una sección protegida sin sesión, redirigir al login
    return { path: '/login', query: { redirect: rutaHacia.fullPath } }
  }

  if (rutaHacia.path === '/login' && estaAutenticado.value) {
    // Si ya está autenticado, redirigir a su vista principal según rol
    if (usuarioActual.value?.rol === 'Super Administrador') {
      return '/dashboard'
    } else if (usuarioActual.value?.rol === 'Supervisor') {
      return '/proyectos'
    } else {
      return '/dashboard'
    }
  }

  // Verificación estricta de permisos por Rol estándar (RBAC)
  const rolesPermitidos = rutaHacia.meta.rolesPermitidos as string[] | undefined
  if (rolesPermitidos && usuarioActual.value) {
    const tienePermiso = rolesPermitidos.includes(usuarioActual.value.rol)
    if (!tienePermiso) {
      // Redirigir a una ruta permitida para su rol
      if (permisosUsuario.value?.proyectos) {
        return '/proyectos'
      } else if (permisosUsuario.value?.dashboard) {
        return '/dashboard'
      } else {
        return '/configuracion'
      }
    }
  }

  return true
})

export default enrutador
