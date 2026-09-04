/**
 * ============================================================================
 * CATÁLOGO DE NAVEGACIÓN RÁPIDA SPOTLIGHT (catalogoSpotlight.ts)
 * ============================================================================
 * 
 * ¿QUÉ HACE?
 * Define la lista de accesos directos indexados para el buscador global Ctrl+K.
 * 
 * ¿CON QUÉ SE CONECTA?
 * - BuscadorSpotlight.vue
 * - useHighlight.ts
 */

import {
  ShieldAlert,
  Users,
  FolderOpen,
  Settings,
  Home,
  Activity
} from 'lucide-vue-next'

export interface ElementoSpotlight {
  id: string
  titulo: string
  subtitulo: string
  palabrasClave: string[]
  categoria: string
  icono: any
  colorIcono: string
  ruta: string
  idElemento: string
  requiereAuth: boolean
}

export const CATALOGO_SPOTLIGHT: ElementoSpotlight[] = [
  {
    id: 'elem-inicio',
    titulo: 'Portal de Inicio y Bienvenida 3D',
    subtitulo: 'Portada interactiva, globo WebGL y diagnóstico rápido',
    palabrasClave: ['inicio', 'home', 'portada', 'bienvenida', 'globo', '3d'],
    categoria: 'Navegación',
    icono: Home,
    colorIcono: 'text-sky-400 bg-sky-950/80 border-sky-800',
    ruta: '/',
    idElemento: '',
    requiereAuth: false
  },
  {
    id: 'elem-alerta-acoso',
    titulo: 'Alertas de Convivencia y Prevención',
    subtitulo: 'Monitoreo de alertas psicosociales y protocolos de bienestar',
    palabrasClave: ['alerta', 'acoso', 'hostigamiento', 'convivencia', 'incidentes', 'violencia', 'estres'],
    categoria: 'Alertas',
    icono: ShieldAlert,
    colorIcono: 'text-amber-400 bg-amber-950/80 border-amber-800',
    ruta: '/dashboard',
    idElemento: 'seccion-alertas-detalle',
    requiereAuth: true
  },
  {
    id: 'elem-grafico-radial',
    titulo: 'Radar 360° de Seguridad Psicológica',
    subtitulo: '6 dimensiones: Liderazgo, Carga, Seguridad, Respeto y Mitigación',
    palabrasClave: ['grafico', 'radar', 'radial', 'dimensiones', 'estadisticas', 'dashboard', 'metricas'],
    categoria: 'Estadísticas',
    icono: Activity,
    colorIcono: 'text-sky-400 bg-blue-950 border-blue-800',
    ruta: '/dashboard',
    idElemento: '',
    requiereAuth: true
  },
  {
    id: 'elem-proyectos-ia',
    titulo: 'Estudio de Proyectos de Encuestas con IA',
    subtitulo: 'Generador adaptativo inteligente de cuestionarios con IA',
    palabrasClave: ['proyectos', 'encuestas', 'ia', 'crear', 'generador', 'preguntas', 'prompt'],
    categoria: 'Proyectos',
    icono: FolderOpen,
    colorIcono: 'text-indigo-400 bg-indigo-950 border-indigo-800',
    ruta: '/proyectos',
    idElemento: 'seccion-estudio-proyectos',
    requiereAuth: true
  },
  {
    id: 'elem-cuentas-admin',
    titulo: 'Administrador de Cuentas y Accesos',
    subtitulo: 'Gestión de roles, permisos, supervisores y analistas de RRHH',
    palabrasClave: ['cuentas', 'usuarios', 'roles', 'admin', 'permisos', 'supervisores', 'analistas'],
    categoria: 'Cuentas',
    icono: Users,
    colorIcono: 'text-purple-400 bg-purple-950 border-purple-800',
    ruta: '/admin/cuentas',
    idElemento: 'seccion-tabla-cuentas',
    requiereAuth: true
  },
  {
    id: 'elem-perfil-foto',
    titulo: 'Configuración de Perfil y Foto de Administrador',
    subtitulo: 'Edición de nombre, avatar dinámico, correo y biografía',
    palabrasClave: ['perfil', 'configuracion', 'foto', 'avatar', 'usuario', 'cuenta', 'datos'],
    categoria: 'Configuración',
    icono: Settings,
    colorIcono: 'text-slate-300 bg-slate-800 border-slate-700',
    ruta: '/configuracion',
    idElemento: 'seccion-perfil-foto',
    requiereAuth: true
  }
]
