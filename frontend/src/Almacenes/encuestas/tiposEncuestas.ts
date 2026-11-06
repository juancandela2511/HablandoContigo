/**
 * ============================================================================
 * TIPOS Y MODELOS DE DATOS DE ENCUESTAS (tiposEncuestas.ts)
 * ============================================================================
 */

import type { PreguntaEncuesta } from '@/ia'

export type CategoriaAlertaPsicosocial =
  | 'acoso'
  | 'depresion'
  | 'renuncia_inminente'
  | 'aislamiento_social'
  | 'burnout'

export interface UbicacionAuditoria {
  ciudad: string
  pais: string
  sede: string
  direccionAprox?: string
  lat: number
  lng: number
  ipAprox: string
  proveedorRed?: string
}

export interface RespuestaItem {
  idPregunta: string
  textoPregunta: string
  categoria: string
  respuesta: any
  valor?: number
  esAlerta?: boolean
  tipoAlertaId?: string
  nombreAlerta?: string
  severidadAlerta?: string
  comentario?: string
}

export interface RegistroRespuesta {
  idRespuesta: string
  idEncuesta: string
  tituloEncuesta: string
  dispositivoUUID: string
  nombreEquipoPC: string
  cuentaUsuarioPC: string
  ubicacion: UbicacionAuditoria
  fecha: string
  hora: string
  duracionSegundos?: number
  timestampISO: string
  respuestas: RespuestaItem[]
  alertasDetectadas: string[]
  categoriasAlerta?: CategoriaAlertaPsicosocial[]
  puntajeGeneral: number
}

export interface Encuesta {
  id: string
  titulo: string
  descripcion: string
  departamento: string
  creadoPor: string
  fechaCreacion: string
  estado: 'Activa' | 'Borrador' | 'Finalizada'
  bloques?: any[]
  preguntas: PreguntaEncuesta[]
  preguntasSeguimiento?: PreguntaEncuesta[]
  totalRespuestas?: number
  alertasRegistradas?: number
  puntajePromedio?: number
  porcentajeClimaFinal?: number
  anioCierre?: number
  fechaFinalizacion?: string
  fechaFinalizacionISO?: string
  limiteReversionISO?: string
  idHistoricoCierre?: string
  idProyectoOrigen?: string
  respuestasArchivadas?: RegistroRespuesta[]
}
