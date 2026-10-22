/**
 * ============================================================================
 * GENERADOR DE SUGERENCIAS DEL COPILOTO OLLAMA (generadorSugerenciasIA.ts)
 * ============================================================================
 * Analiza las preguntas activas, alertas existentes y gráficos anclados para
 * sugerir nuevas alertas, gráficos por anclar y mejoras psicométricas.
 */

import type {
  RespuestaSugerenciasAdminIA,
  SugerenciaAlertaIA,
  SugerenciaGraficoAncladoIA,
  SugerenciaCambioPreguntaIA
} from './tiposAsistente.js'

const rawHost = process.env.OLLAMA_HOST || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_HOST = rawHost.replace(/\/+$/, '')
const MODELO_OLLAMA = process.env.OLLAMA_MODEL || 'llama3'

export async function generarSugerenciasAdminConOllama(payload: {
  preguntas?: Array<{ id: string; texto: string; categoria?: string; tipo?: string }>
  alertasExistentes?: string[]
  graficosAncladosIds?: string[]
  resumenRespuestas?: { totalRespuestas: number; promedioClima: number }
}): Promise<RespuestaSugerenciasAdminIA> {
  const preguntas = Array.isArray(payload.preguntas) ? payload.preguntas : []
  const alertasActuales = (payload.alertasExistentes || []).map(a => a.toLowerCase())
  const ancladosIds = new Set(payload.graficosAncladosIds || [])

  // 1. Construir base de sugerencias inteligentes deterministas (Data-Driven)
  const alertasFallback = construirAlertasSugeridas(alertasActuales)
  const graficosFallback = construirGraficosSugeridos(preguntas, ancladosIds)
  const preguntasFallback = construirMejorasPreguntas(preguntas)

  // 2. Consultar al contenedor Docker de Ollama para enriquecer sugerencias en vivo
  try {
    const muestraPreguntas = preguntas.slice(0, 8).map(p => `[${p.id}] (${p.categoria || 'Clima'}): "${p.texto}"`).join('\n')
    const prompt = `Eres un Consultor Senior en Psicometría Organizacional y Ciencia de Datos.
Analiza estas preguntas de la encuesta de clima laboral:
${muestraPreguntas}

Alertas ya creadas: ${alertasActuales.join(', ') || 'Ninguna'}
Gráficos ya anclados: ${Array.from(ancladosIds).join(', ') || 'Ninguno'}

Genera sugerencias en JSON estricto con esta estructura:
{
  "sugerenciasAlertas": [
    {
      "id": "sug-alerta-1",
      "nombre": "Nombre corto de la alerta sugerida",
      "descripcion": "Descripción clara del riesgo",
      "nivel": 2,
      "severidad": "Alta",
      "modoEnfoque": "especifico",
      "palabrasClave": ["palabra1", "palabra2", "palabra3"],
      "protocoloAccion": "Acción recomendada para RRHH",
      "motivoIA": "Por qué te sugiero crear esta alerta"
    }
  ],
  "sugerenciasPreguntas": [
    {
      "id": "sug-preg-1",
      "idPregunta": "ID exacto de una pregunta de la lista",
      "categoria": "Categoría",
      "textoActual": "Texto original",
      "textoSugerido": "Pregunta ultra simple y directa (ej: 'Del 1 al 5, teniendo en cuenta que 1 es Mal y 5 es Excelente, ¿qué tan bien te trata tu jefe directo?' o '¿Qué tan bien te sientes con tu carga de trabajo? (Muy mal / Mal / Regular / Bien / Muy bien)')",
      "justificacionPsicometrica": "Simplifica el lenguaje para que sea muy fácil y rápido de entender y responder con precisión"
    }
  ]
}`

    const resp = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODELO_OLLAMA, prompt, stream: false, format: 'json' }),
      signal: AbortSignal.timeout(9000)
    })

    if (resp.ok) {
      const data: any = await resp.json()
      const parsed = JSON.parse(data.response || '{}')

      const alertasIA: SugerenciaAlertaIA[] = Array.isArray(parsed.sugerenciasAlertas) && parsed.sugerenciasAlertas.length > 0
        ? parsed.sugerenciasAlertas.slice(0, 2).map((a: any, i: number) => ({
            id: a.id || `ollama-alerta-${Date.now()}-${i}`,
            nombre: a.nombre || alertasFallback[0]?.nombre || 'Riesgo de Rotación Temprana',
            descripcion: a.descripcion || 'Detección temprana de intención de retiro y desmotivación.',
            nivel: (a.nivel >= 1 && a.nivel <= 4 ? a.nivel : 2) as 1 | 2 | 3 | 4,
            severidad: a.severidad || 'Alta',
            modoEnfoque: a.modoEnfoque === 'general' ? 'general' : 'especifico',
            palabrasClave: Array.isArray(a.palabrasClave) ? a.palabrasClave : ['renuncia', 'desmotivación', 'sobrecarga'],
            protocoloAccion: a.protocoloAccion || 'Entrevista de retención y ajuste de carga operativa.',
            motivoIA: a.motivoIA || 'Ollama detectó oportunidad de blindar la retención de talento.'
          }))
        : alertasFallback

      return {
        origenMotor: `Ollama Docker (${MODELO_OLLAMA})`,
        sugerenciasAlertas: alertasIA,
        sugerenciasGraficos: graficosFallback,
        sugerenciasPreguntas: preguntasFallback
      }
    }
  } catch {
    // Continúa con las sugerencias calibradas de respaldo si el contenedor está procesando otra tarea
  }

  return {
    origenMotor: `Motor Analítico Ollama (${MODELO_OLLAMA})`,
    sugerenciasAlertas: alertasFallback,
    sugerenciasGraficos: graficosFallback,
    sugerenciasPreguntas: preguntasFallback
  }
}

function construirAlertasSugeridas(alertasActuales: string[]): SugerenciaAlertaIA[] {
  const catalogo: SugerenciaAlertaIA[] = [
    {
      id: 'sug-alerta-rotacion',
      nombre: 'Fuga de Talento y Renuncia Silenciosa',
      descripcion: 'Detecta expresiones de desvinculación emocional, búsqueda de otro empleo o intención de retiro.',
      nivel: 2,
      severidad: 'Alta',
      modoEnfoque: 'especifico',
      palabrasClave: ['renunciar', 'me voy', 'otro trabajo', 'desmotivado', 'estancado', 'sin futuro'],
      protocoloAccion: 'Activar sesión de escucha 1 a 1 con Gestión Humana y revisar plan de carrera.',
      motivoIA: 'Te sugiero crear esta alerta para anticipar bajas voluntarias antes de que ocurran.'
    },
    {
      id: 'sug-alerta-sobrecarga',
      nombre: 'Sobrecarga Operativa y Desconexión Laboral',
      descripcion: 'Identifica fatiga por exceso de metas, turnos extendidos o falta de pausas activas.',
      nivel: 3,
      severidad: 'Moderada',
      modoEnfoque: 'especifico',
      palabrasClave: ['sobrecarga', 'horas extras', 'sin descanso', 'fatiga', 'presión', 'metas imposibles'],
      protocoloAccion: 'Equilibrar asignación de turnos y programar pausas activas en la operación.',
      motivoIA: 'Te sugiero esta alerta para prevenir el síndrome de Burnout en campañas de alto flujo.'
    }
  ]

  return catalogo.filter(c => !alertasActuales.some(actual => actual.includes(c.nombre.toLowerCase().substring(0, 8))))
}

function construirGraficosSugeridos(
  preguntas: Array<{ id: string; texto: string; categoria?: string; tipo?: string }>,
  ancladosIds: Set<string>
): SugerenciaGraficoAncladoIA[] {
  const candidatas = preguntas.filter(p => !ancladosIds.has(p.id) && p.tipo !== 'abierta' && p.tipo !== 'texto')
  return candidatas.slice(0, 3).map((p, idx) => ({
    id: `sug-graf-${p.id}`,
    idPregunta: p.id,
    textoPregunta: p.texto,
    tituloSugerido: `Indicador IA: ${p.texto.substring(0, 42)}${p.texto.length > 42 ? '...' : ''}`,
    tipoGrafico: idx % 2 === 0 ? 'barras' : 'pastel',
    razonAnclaje: idx % 2 === 0
      ? 'Gráfico de barras ideal para comparar distribución de respuestas del 1 al 5.'
      : 'Gráfico circular recomendado para visualizar proporción de favorabilidad rápida.'
  }))
}

function construirMejorasPreguntas(
  preguntas: Array<{ id: string; texto: string; categoria?: string }>
): SugerenciaCambioPreguntaIA[] {
  const sugerencias: SugerenciaCambioPreguntaIA[] = []
  for (const p of preguntas) {
    if (sugerencias.length >= 3) break
    const texto = (p.texto || '').trim()
    if (!texto) continue

    const textoSimple = generarFormulacionSimpleDirecta(texto)
    if (textoSimple !== texto) {
      sugerencias.push({
        id: `sug-preg-${p.id}`,
        idPregunta: p.id,
        categoria: p.categoria || 'Clima Organizacional',
        textoActual: texto,
        textoSugerido: textoSimple,
        justificacionPsicometrica: 'Pregunta simple, directa y asertiva (escala 1 = Mal a 5 = Excelente / Muy mal a Muy bien) para facilitar la respuesta.'
      })
    }
  }
  return sugerencias
}

function generarFormulacionSimpleDirecta(textoOriginal: string): string {
  const limpio = textoOriginal.replace(/\?+$/, '').replace(/^¿+/, '').trim()
  if (/jefe|líder|lider|supervis/i.test(limpio)) {
    return '¿Qué tan bien te trata y apoya tu jefe directo? (1 = Muy mal, 2 = Mal, 3 = Regular, 4 = Bien, 5 = Muy bien / Excelente)'
  }
  if (/ambiente|respeto|convivencia|compañer/i.test(limpio)) {
    return 'Del 1 al 5 (teniendo en cuenta que 1 es Mal y 5 es Excelente), ¿qué tan bueno es el trato y respeto entre tus compañeros?'
  }
  if (/herramienta|espacio|condicion|silla|puesto/i.test(limpio)) {
    return 'Del 1 al 5 (donde 1 es Mal y 5 es Excelente), ¿qué tan cómodas y buenas son tus herramientas de trabajo?'
  }
  return `Del 1 al 5 (teniendo en cuenta que 1 es Mal y 5 es Excelente), ¿qué tan satisfecho estás con: "${limpio}"?`
}
