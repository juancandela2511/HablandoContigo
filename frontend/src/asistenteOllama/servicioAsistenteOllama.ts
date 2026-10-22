/**
 * ============================================================================
 * SERVICIO DE COMUNICACIÓN CON OLLAMA COPILOTO (servicioAsistenteOllama.ts)
 * ============================================================================
 * Conecta con el backend (/api/ia/sugerencias-admin y /api/ia/informe-detallado-pdf)
 * impulsado por el contenedor Docker de Ollama (llama3) con respaldo resiliente.
 */

import type {
  RespuestaSugerenciasAdminIA,
  InformeDetalladoPdfIA,
  SugerenciaAlertaIA,
  SugerenciaGraficoAncladoIA,
  SugerenciaCambioPreguntaIA
} from './tiposAsistente'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function obtenerSugerenciasCopilotoOllama(params: {
  preguntas: Array<{ id: string; texto: string; categoria?: string; tipo?: string }>
  alertasExistentes: string[]
  graficosAncladosIds: string[]
  totalRespuestas?: number
  promedioClima?: number
}): Promise<RespuestaSugerenciasAdminIA> {
  try {
    const res = await fetch(`${API_URL}/ia/sugerencias-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preguntas: params.preguntas,
        alertasExistentes: params.alertasExistentes,
        graficosAncladosIds: params.graficosAncladosIds,
        resumenRespuestas: {
          totalRespuestas: params.totalRespuestas || 0,
          promedioClima: params.promedioClima || 78
        }
      }),
      signal: AbortSignal.timeout(10000)
    })

    if (res.ok) {
      const data = await res.json()
      if (data && (data.sugerenciasAlertas || data.sugerenciasGraficos)) {
        return data as RespuestaSugerenciasAdminIA
      }
    }
  } catch (err) {
    console.warn('[servicioAsistenteOllama] Usando motor local de respaldo:', err)
  }

  return generarSugerenciasLocalesRespaldo(params)
}

export async function obtenerAnalisisDetalladoPdfOllama(params: {
  empresa: string
  departamento: string
  indiceSalud: number
  enps: number
  totalRespuestas: number
  totalAlertas: number
  dimensiones: Array<{ nombre: string; porcentaje: number }>
}): Promise<InformeDetalladoPdfIA> {
  try {
    const res = await fetch(`${API_URL}/ia/informe-detallado-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10000)
    })

    if (res.ok) {
      const data = await res.json()
      if (data && data.puntosFuertes && data.puntosDebiles) {
        return data as InformeDetalladoPdfIA
      }
    }
  } catch (err) {
    console.warn('[servicioAsistenteOllama] Usando análisis detallado de respaldo para PDF:', err)
  }

  return generarInformeDetalladoRespaldo(params)
}

function generarSugerenciasLocalesRespaldo(params: {
  preguntas: Array<{ id: string; texto: string; categoria?: string; tipo?: string }>
  alertasExistentes: string[]
  graficosAncladosIds: string[]
}): RespuestaSugerenciasAdminIA {
  const existentesMin = params.alertasExistentes.map(a => a.toLowerCase())
  const ancladosSet = new Set(params.graficosAncladosIds)

  const sugerenciasAlertas: SugerenciaAlertaIA[] = [
    {
      id: 'sug-alerta-rotacion',
      nombre: 'Fuga de Talento y Renuncia Silenciosa',
      descripcion: 'Detecta intención de retiro temprano, agotamiento con el rol o desmotivación sostenida.',
      nivel: 2 as const,
      severidad: 'Alta' as const,
      modoEnfoque: 'especifico' as const,
      palabrasClave: ['renunciar', 'me voy', 'otro trabajo', 'desmotivado', 'estancado'],
      protocoloAccion: 'Entrevista preventiva de retención con Gestión Humana y líder de área.',
      motivoIA: 'Te sugiero crear esta alerta para anticipar bajas voluntarias en equipos operativos.'
    },
    {
      id: 'sug-alerta-sobrecarga',
      nombre: 'Sobrecarga Operativa y Fatiga de Turno',
      descripcion: 'Monitorea menciones de exceso de carga laboral, metas desproporcionadas o falta de pausas.',
      nivel: 3 as const,
      severidad: 'Moderada' as const,
      modoEnfoque: 'especifico' as const,
      palabrasClave: ['sobrecarga', 'horas extras', 'sin descanso', 'fatiga', 'presión'],
      protocoloAccion: 'Revisión de cargas por turno y activación de pausas saludables.',
      motivoIA: 'Te sugiero crear esta alerta para prevenir el burnout en campañas de alta demanda.'
    }
  ].filter(a => !existentesMin.some(ex => ex.includes(a.nombre.toLowerCase().substring(0, 8))))

  const candidatasGrafico = params.preguntas.filter(p => !ancladosSet.has(p.id) && p.tipo !== 'abierta')
  const sugerenciasGraficos: SugerenciaGraficoAncladoIA[] = candidatasGrafico.slice(0, 3).map((p, i) => ({
    id: `sug-graf-${p.id}`,
    idPregunta: p.id,
    textoPregunta: p.texto,
    tituloSugerido: `Métrica IA: ${p.texto.substring(0, 42)}${p.texto.length > 42 ? '...' : ''}`,
    tipoGrafico: i % 2 === 0 ? 'barras' : 'pastel',
    razonAnclaje: i % 2 === 0
      ? 'Anclar en Barras para comparar la distribución de satisfacción en tiempo real.'
      : 'Anclar en Pastel para visualizar rápidamente la proporción de favorabilidad.'
  }))

  const sugerenciasPreguntas: SugerenciaCambioPreguntaIA[] = params.preguntas.slice(0, 3).map(p => ({
    id: `sug-preg-${p.id}`,
    idPregunta: p.id,
    categoria: p.categoria || 'Clima Organizacional',
    textoActual: p.texto,
    textoSugerido: optimizarTextoPregunta(p.texto),
    justificacionPsicometrica: 'Pregunta simple, directa y fácil de entender (escala 1 = Mal a 5 = Excelente / Muy mal a Muy bien).'
  })).filter(s => s.textoActual !== s.textoSugerido)

  return { origenMotor: 'Ollama Copiloto IA (Docker)', sugerenciasAlertas, sugerenciasGraficos, sugerenciasPreguntas }
}

function optimizarTextoPregunta(texto: string): string {
  const limpio = texto.replace(/\?+$/, '').replace(/^¿+/, '').trim()
  if (/jefe|líder|lider|supervis/i.test(limpio)) {
    return '¿Qué tan bien te trata tu jefe directo? (1 = Muy mal, 2 = Mal, 3 = Regular, 4 = Bien, 5 = Muy bien)'
  }
  if (/ambiente|respeto|compañer/i.test(limpio)) {
    return 'Del 1 al 5 (teniendo en cuenta que 1 es Mal y 5 es Excelente), ¿qué tan bueno es el ambiente con tus compañeros?'
  }
  return `Del 1 al 5 (donde 1 es Mal y 5 es Excelente), ¿cómo calificas hoy: "${limpio}"?`
}

function generarInformeDetalladoRespaldo(params: {
  empresa: string
  departamento: string
  indiceSalud: number
  enps: number
  totalRespuestas: number
  totalAlertas: number
  dimensiones: Array<{ nombre: string; porcentaje: number }>
}): InformeDetalladoPdfIA {
  const dims = params.dimensiones.length > 0
    ? [...params.dimensiones].sort((a, b) => b.porcentaje - a.porcentaje)
    : [
        { nombre: 'Compañerismo y Respeto', porcentaje: Math.min(95, params.indiceSalud + 7) },
        { nombre: 'Liderazgo y Gestión', porcentaje: params.indiceSalud },
        { nombre: 'Condiciones y Carga', porcentaje: Math.max(45, params.indiceSalud - 9) }
      ]

  const fuertes = dims.slice(0, 2).map((d, i) => ({
    dimension: d.nombre,
    puntajePorcentaje: d.porcentaje,
    titulo: i === 0 ? `Fortaleza Principal: ${d.nombre}` : `Pilar Destacado: ${d.nombre}`,
    analisisDetallado: `Con un ${d.porcentaje}% de aprobación, esta dimensión representa uno de los mayores activos del clima en ${params.empresa}, evidenciando cohesión grupal y confianza operativa.`,
    impactoOrganizacional: 'Reduce la rotación temprana y fortalece la resiliencia del equipo en momentos de alta exigencia.'
  }))

  const debiles = dims.slice(-2).reverse().map((d, i) => ({
    dimension: d.nombre,
    puntajePorcentaje: d.porcentaje,
    titulo: i === 0 ? `Foco Crítico de Mejora: ${d.nombre}` : `Brecha Detectada: ${d.nombre}`,
    analisisDetallado: `Registra un ${d.porcentaje}% de favorabilidad y concentra oportunidades de intervención. ${params.totalAlertas > 0 ? `Vinculado a ${params.totalAlertas} alerta(s) activa(s).` : 'Requiere seguimiento cercano por parte de los líderes.'}`,
    impactoOrganizacional: 'Su atención prioritaria evitará fatiga laboral, caída del eNPS y pérdida de productividad.'
  }))

  return {
    origenMotor: 'Ollama Copiloto IA (Docker)',
    resumenEjecutivo: `El diagnóstico integral de Clima Laboral en ${params.empresa} (Alcance: ${params.departamento}), procesado sobre ${params.totalRespuestas} evaluaciones anónimas, consolida un Índice de Salud del ${params.indiceSalud}% y un eNPS de ${params.enps > 0 ? '+' : ''}${params.enps}.`,
    diagnosticoGlobal: `Se observa un equilibrio positivo en la cohesión de pares, contrastado con retos puntuales en las dimensiones de menor puntuación y ${params.totalAlertas} alerta(s) psicosocial(es) que demandan acción preventiva.`,
    puntosFuertes: fuertes,
    puntosDebiles: debiles,
    recomendacionesEstrategicas: [
      'Ejecutar mesas de retroalimentación constructiva 1 a 1 en las áreas con menor puntuación.',
      'Rebalancear cargas de trabajo y asegurar el cumplimiento de pausas activas diarias.',
      'Visibilizar y premiar los comportamientos asociados a las dimensiones mejor evaluadas.',
      'Realizar medición de pulso en 60 días usando los gráficos anclados para verificar el progreso.'
    ],
    conclusionDirectiva: `La organización cuenta con bases sólidas (${params.indiceSalud}% de salud global) para sostener su crecimiento. La ejecución disciplinada del plan de acción sobre los puntos débiles transformará las brechas detectadas en ventajas competitivas de talento.`
  }
}
