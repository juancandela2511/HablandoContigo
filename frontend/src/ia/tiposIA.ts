/**
 * Tipos e Interfaces de IA y Encuestas
 */

export interface OpcionPregunta {
  id: string
  texto: string
  valor: number
  color?: string
  imagen?: string
  imagenRompecabezas?: string
  esAlerta?: boolean
  tipoAlertaId?: string
  nombreAlerta?: string
  severidadAlerta?: string
  solicitarPorQue?: boolean
  saltarHastaId?: string
  preguntaAnclada?: PreguntaAncladaConfig
}

export interface PreguntaAncladaConfig {
  id?: string
  texto: string
  tipo?: 'texto' | 'multiple' | 'si_no'
  placeholder?: string
  opciones?: string[]
  obligatoria?: boolean
}

export interface PreguntaEncuesta {
  id: string
  bloqueId?: string
  categoria: string
  texto: string
  tipo: 'escala' | 'multiple' | 'texto' | 'si_no'
  tipoGrafico?: 'barras' | 'pastel'
  opciones: OpcionPregunta[]
  obligatoria?: boolean
  esRelleno?: boolean
  esSensibleAcoso?: boolean
  condicionDisparo?: string
  tieneBifurcacion?: boolean
  preguntaCondicionalId?: string
  esCondicional?: boolean
  disparadorPor?: string
  valoresDisparo?: string[]
  accionCondicion?: 'mostrar_si' | 'omitir_si' | 'saltar_hasta'
  saltarHastaId?: string
  activarSaltoCondicional?: boolean
  preguntaAnclada?: PreguntaAncladaConfig
  solicitarPorQueSiNegativo?: boolean
  deteccionQuejas?: boolean
  comentariosHabilitados?: boolean
  modoPresentacion?: 'click' | 'rompecabezas' | 'deslizador_emocional' | 'deslizador_tiempo' | 'juego_gusanito' | 'semaforo' | 'termometro' | 'palanca_sino' | 'tarjetas'
  imagenRompecabezas?: string
  imagen?: string
  maxAnos?: number
  maxMeses?: number
}

export interface AnalisisRespuestaAbierta {
  clasificacion: 'Buena' | 'Mala' | 'Neutra'
  puntaje: number
  tema: string
  resumen: string
  palabrasClave: string[]
  esAlerta: boolean
  alertaSugerida?: {
    tipoAlertaId: string
    nombre: string
    severidad: 'Crítica' | 'Alta' | 'Moderada'
    motivo: string
  }
}

export interface ResumenEstadisticaAbiertas {
  totalRespuestas: number
  porcentajeBuenas: number
  porcentajeMalas: number
  porcentajeNeutras: number
  promedioPuntaje: number
  resumenEjecutivo: string
  temasPrincipales: { tema: string; conteo: number }[]
  alertasDetectadas: { tipo: string; cantidad: number; severidad: string }[]
  detalles: AnalisisRespuestaAbierta[]
}

export interface SugerenciaAlerta {
  tipoAlertaId: string
  nombreAlerta: string
  severidad: 'Crítica' | 'Alta' | 'Moderada'
  explicacion: string
}

export interface AlertaGeminiEstricta {
  id?: string
  estadoAlerta: string
  mensajeCapturado: string
  clasificacion: 'Buena' | 'Mala'
  motivoDetallado: string
  prioridad: 'Crítica' | 'Alta' | 'Moderada'
  tipoAlerta?: string
  idPregunta?: string
  categoria?: string
}

export interface ResultadoEvaluacionGemini {
  success: boolean
  hayAlertas: boolean
  totalAlertas: number
  diagnosticoGeneral: string
  clasificacionGlobal: 'Buena' | 'Mala'
  alertas: AlertaGeminiEstricta[]
}

export interface CasoMencionPersona {
  idRespuesta: string
  comentario: string
  textoPregunta: string
  respuestaSeleccionada: string
  valor?: number
  fecha: string
  hora: string
  departamento: string
  sede: string
  nombreEquipoPC: string
  tipoConducta: string
}

export interface PersonaProblemaIdentificada {
  nombre: string
  cargo: string
  departamento: string
  menciones: number
  citas: string[]
  nivelRiesgo: 'Crítico' | 'Alto' | 'Moderado'
  resumenProblemaIA: string
  recomendacionIA: string
  ultimaFecha?: string
  esProblemaCritico?: boolean
  quejasFrecuentes?: string[]
  tipoConductaPrincipal?: string
  alertasRelacionadas?: string[]
  casosDetallados?: CasoMencionPersona[]
}

export type PersonaProblemaIA = PersonaProblemaIdentificada
export type ClasificacionRespuestaAbierta = {
  clasificacion: 'Buena' | 'Mala' | 'Neutra'
  puntaje: number
  tema: string
  justificacion: string
  palabrasClave?: string[]
}
export type AccionJarvis = { tipo: string; [key: string]: any }
