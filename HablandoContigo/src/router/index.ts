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
import LoginView from '@/vistas/Auth/LoginView.vue'
import ResponderEncuestaView from '@/vistas/Encuestas/ResponderEncuestaView.vue'

// Rutas protegidas: lazy-loaded (se descargan solo cuando el usuario navega a ellas)
const AdminCuentasView = () => import('@/vistas/Admin/AdminCuentasView.vue')
const ProyectosView = () => import('@/vistas/Proyectos/ProyectosView.vue')
const DashboardView = () => import('@/vistas/Dashboard/DashboardView.vue')
const ConfiguracionView = () => import('@/vistas/Configuracion/ConfiguracionView.vue')
const ReconocimientoIAView = () => import('@/vistas/IA/ReconocimientoIAView.vue')
const VistaGenerica = () => import('@/vistas/Comunes/VistaGenerica.vue')
const Error404View = () => import('@/vistas/Comunes/Error404View.vue')
const CatalogoErroresView = () => import('@/vistas/Errores/CatalogoErroresView.vue')

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
    path: '/reconocimiento-ia',
    name: 'ReconocimientoIA',
    component: ReconocimientoIAView,
    meta: {
      requiereAuth: true,
      rolesPermitidos: ['Super Administrador', 'Administrador', 'Adminsitrador General', 'Supervisor', 'Analista RRHH']
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
    path: '/admin/errores',
    name: 'CatalogoErrores',
    component: CatalogoErroresView,
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
 * Guardia de navegación global para proteger rutas con `meta.requiereAuth` y control de roles (RBAC) y Tokens Temporales
 */
enrutador.beforeEach((rutaHacia, rutaDesde, siguiente) => {
  const { estaAutenticado, usuarioActual, permisosUsuario } = useAuth()

  // 1. Validar si la sesión temporal por Token ya expiró
  if (usuarioActual.value?.esSesionTemporal && usuarioActual.value.tokenExpiraEn) {
    const ahora = Date.now()
    const expira = new Date(usuarioActual.value.tokenExpiraEn).getTime()
    if (ahora >= expira) {
      localStorage.removeItem('hablandocontigo_usuario_sesion')
      siguiente({ path: '/login', query: { expirado: '1' } })
      return
    }
  }

  if (rutaHacia.meta.requiereAuth && !estaAutenticado.value) {
    // Si intenta ingresar a una sección protegida sin sesión, redirigir al login
    siguiente({ path: '/login', query: { redirect: rutaHacia.fullPath } })
    return
  }

  if (rutaHacia.path === '/login' && estaAutenticado.value) {
    // Si ya está autenticado con token temporal, redirigir a su ruta inicial asignada
    if (usuarioActual.value?.esSesionTemporal) {
      siguiente(usuarioActual.value.rutaInicialToken || '/proyectos')
      return
    }

    // Si ya está autenticado con cuenta estándar, redirigir a su vista principal según rol
    if (usuarioActual.value?.rol === 'Super Administrador') {
      siguiente('/admin/cuentas')
    } else if (usuarioActual.value?.rol === 'Supervisor') {
      siguiente('/proyectos')
    } else {
      siguiente('/dashboard')
    }
    return
  }

  // 2. Control de Permisos Especiales para Sesiones Temporales por Token
  if (usuarioActual.value?.esSesionTemporal) {
    const p = permisosUsuario.value
    const path = rutaHacia.path

    if (path.startsWith('/admin/cuentas') && !p?.cuentas) {
      siguiente(usuarioActual.value.rutaInicialToken || (p?.proyectos ? '/proyectos' : (p?.dashboard ? '/dashboard' : '/configuracion')))
      return
    }
    if (path.startsWith('/proyectos') && !p?.proyectos) {
      siguiente(p?.dashboard ? '/dashboard' : '/configuracion')
      return
    }
    if (path.startsWith('/dashboard') && !p?.dashboard) {
      siguiente(p?.proyectos ? '/proyectos' : '/configuracion')
      return
    }
    if (path.startsWith('/configuracion') && !p?.configuracion) {
      siguiente(p?.proyectos ? '/proyectos' : (p?.dashboard ? '/dashboard' : '/login'))
      return
    }
    siguiente()
    return
  }

  // 3. Verificación estricta de permisos por Rol estándar (RBAC)
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
