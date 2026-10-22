/**
 * ============================================================================
 * TIPOS DEL COPILOTO ADMINISTRATIVO OLLAMA (backend/src/asistenteIA/tiposAsistente.ts)
 * ============================================================================
 * Define los contratos de datos para sugerencias proactivas de alertas,
 * gráficos anclados, mejora de preguntas y análisis detallado para PDF.
 */

export interface SugerenciaAlertaIA {
  id: string
  nombre: string
  descripcion: string
  nivel: 1 | 2 | 3 | 4
  severidad: 'Crítica' | 'Alta' | 'Moderada' | 'Baja'
  modoEnfoque: 'especifico' | 'general'
  palabrasClave: string[]
  protocoloAccion: string
  motivoIA: string
}

export interface SugerenciaGraficoAncladoIA {
  id: string
  idPregunta: string
  textoPregunta: string
  tituloSugerido: string
  tipoGrafico: 'barras' | 'pastel'
  razonAnclaje: string
}

export interface SugerenciaCambioPreguntaIA {
  id: string
  idPregunta: string
  categoria: string
  textoActual: string
  textoSugerido: string
  justificacionPsicometrica: string
}

export interface RespuestaSugerenciasAdminIA {
  origenMotor: string
  sugerenciasAlertas: SugerenciaAlertaIA[]
  sugerenciasGraficos: SugerenciaGraficoAncladoIA[]
  sugerenciasPreguntas: SugerenciaCambioPreguntaIA[]
}

export interface PuntoAnalisisClima {
  dimension: string
  puntajePorcentaje: number
  titulo: string
  analisisDetallado: string
  impactoOrganizacional: string
}

export interface InformeDetalladoPdfIA {
  origenMotor: string
  resumenEjecutivo: string
  diagnosticoGlobal: string
  puntosFuertes: PuntoAnalisisClima[]
  puntosDebiles: PuntoAnalisisClima[]
  recomendacionesEstrategicas: string[]
  conclusionDirectiva: string
}
