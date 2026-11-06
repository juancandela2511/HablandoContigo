export type RolCuenta = 'Super Administrador' | 'Administrador' | 'Supervisor' | 'Analista RRHH'
export type EstadoCuenta = 'Activo' | 'Inactivo' | 'Pendiente'
export type GeneroUsuario = 'Masculino' | 'Femenino' | 'Otro'

export interface PermisosRol {
  proyectos: boolean
  dashboard: boolean
  alertas: boolean
  cuentas: boolean
  cambiarContrasenasOtros: boolean
  configuracion: boolean
  editarEncuestaClima: boolean
}

export interface PermisosTokenAcceso {
  proyectos: boolean
  crearEncuestasRapidas: boolean
  editarEncuestaClima: boolean
  dashboard: boolean
  alertas: boolean
  cuentas: boolean
  auditoriaErrores: boolean
  configuracion: boolean
}

export const PERMISOS_POR_ROL: Record<RolCuenta, PermisosRol> = {
  'Super Administrador': {
    proyectos: true,
    dashboard: true,
    alertas: true,
    cuentas: true,
    cambiarContrasenasOtros: true,
    configuracion: true,
    editarEncuestaClima: true
  },
  'Administrador': {
    proyectos: true,
    dashboard: true,
    alertas: true,
    cuentas: true,
    cambiarContrasenasOtros: false,
    configuracion: true,
    editarEncuestaClima: true
  },
  'Supervisor': {
    proyectos: true,
    dashboard: false,
    alertas: true,
    cuentas: false,
    cambiarContrasenasOtros: false,
    configuracion: true,
    editarEncuestaClima: false
  },
  'Analista RRHH': {
    proyectos: false,
    dashboard: true,
    alertas: true,
    cuentas: false,
    cambiarContrasenasOtros: false,
    configuracion: true,
    editarEncuestaClima: false
  }
}

export const DOMINIOS_CORPORATIVOS = ['ontime.es']

export function validarDominioCorporativo(email: string): boolean {
  if (!email || !email.includes('@')) return false
  const domain = email.split('@')[1]?.toLowerCase() || ''
  return DOMINIOS_CORPORATIVOS.includes(domain)
}
