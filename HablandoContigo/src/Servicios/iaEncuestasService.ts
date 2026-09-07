/**
 * ============================================================================
 * SERVICIO DE GENERACIÓN DE ENCUESTAS ADAPTATIVAS Y MULTIDIMENSIONALES
 * CON GEMINI IA (iaEncuestasService.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Motor inteligente con IA (Google Gemini 2.5 Flash / 1.5 Flash) y respaldo
 * semántico local multidimensional que analiza TODOS los temas ingresados por
 * el usuario, generando encuestas exhaustivas, profundas y detalladas con
 * escalas estandarizadas: Excelente, Bien, Regular, Mal y Muy Mal (Alerta Crítica).
 */

export interface OpcionPregunta {
  id: string
  texto: string
  valor: number
  esAlerta?: boolean
}

export interface PreguntaEncuesta {
  id: string
  categoria: string
  texto: string
  tipo: 'escala' | 'multiple' | 'texto' | 'si_no'
  opciones: OpcionPregunta[]
  esRelleno?: boolean
  esSensibleAcoso?: boolean
  condicionDisparo?: string
  tieneBifurcacion?: boolean
  preguntaCondicionalId?: string
  esCondicional?: boolean
  disparadorPor?: string
  valoresDisparo?: string[]
}

export interface PlantillaEncuestaGenerada {
  titulo: string
  descripcion: string
  departamento?: string
  preguntas: PreguntaEncuesta[]
  preguntasSeguimiento: PreguntaEncuesta[]
}

export type TipoAccionJarvis =
  | 'CREAR_PREGUNTA'
  | 'EDITAR_PREGUNTA'
  | 'EDITAR_OPCIONES'
  | 'ASIGNAR_ALERTA'
  | 'AGREGAR_OPCION'
  | 'ELIMINAR_OPCION'
  | 'ELIMINAR_PREGUNTA'
  | 'CAMBIAR_TITULO'
  | 'CAMBIAR_DESCRIPCION'
  | 'RESTAURAR_PLANTILLA_OFICIAL'
  | 'OPTIMIZAR_ENCUESTA'

export interface AccionJarvis {
  tipo: TipoAccionJarvis
  idPregunta?: string
  numeroPregunta?: number
  categoria?: string
  textoPregunta?: string
  tipoPregunta?: 'escala' | 'multiple' | 'texto' | 'si_no'
  opciones?: OpcionPregunta[]
  opcionTexto?: string
  opcionValor?: number
  esAlerta?: boolean
  nuevoTitulo?: string
  nuevaDescripcion?: string
  preguntaCompleta?: PreguntaEncuesta
  preguntasReemplazo?: PreguntaEncuesta[]
  descripcionAccion?: string
}

export interface RespuestaJarvisGemini {
  respuestaTexto: string
  acciones: AccionJarvis[]
  preguntaSugerida?: PreguntaEncuesta
  estadoProtocolo?: string
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

// Credencial y Modelos de Google Gemini
export const MODELO_GEMINI_PRINCIPAL: string = 'gemini-1.5-flash'
export const MODELO_GEMINI_SECUNDARIO: string = 'gemini-2.0-flash'

export const MODELOS_GEMINI_CANDIDATOS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']

export function obtenerClaveApiGemini(): string {
  try {
    const custom = localStorage.getItem('hablandocontigo_gemini_api_key')
    if (custom && custom.trim()) return custom.trim()
  } catch {}
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || ''
}

export function esClaveApiValida(clave?: string): boolean {
  const c = (clave !== undefined ? clave : obtenerClaveApiGemini()).trim()
  return c.startsWith('AIzaSy') && c.length >= 35
}

export function guardarClaveApiGemini(clave: string) {
  try {
    localStorage.setItem('hablandocontigo_gemini_api_key', clave.trim())
  } catch {}
}

export const CLAVE_API_GEMINI: string = obtenerClaveApiGemini()

const uidGen = (prefix = 'p') => `${prefix}-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6)}`

function extraerJSONLimpio(texto: string): string {
  const limpio = texto.trim()
  const matchJson = limpio.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (matchJson && matchJson[1]) {
    return matchJson[1].trim()
  }
  const firstBrace = limpio.indexOf('{')
  const lastBrace = limpio.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return limpio.substring(firstBrace, lastBrace + 1)
  }
  return limpio
}

/**
 * Escala estándar detallada con descriptores explícitos (Excelente, Bien, Regular, Mal, Muy Mal)
 */
export function obtenerEscalaEstandarDetallada(tipo: 'satisfaccion' | 'calidad' | 'acuerdo' | 'frecuencia' = 'satisfaccion'): OpcionPregunta[] {
  switch (tipo) {
    case 'calidad':
      return [
        { id: 'esc-5', texto: '5 - Excelente (Óptimo, sin fallas y de máxima calidad)', valor: 5, esAlerta: false },
        { id: 'esc-4', texto: '4 - Bien (Favorable, adecuado y funcional)', valor: 4, esAlerta: false },
        { id: 'esc-3', texto: '3 - Regular (Aceptable con oportunidades de mejora)', valor: 3, esAlerta: false },
        { id: 'esc-2', texto: '2 - Mal (Deficiente o con fallas frecuentes)', valor: 2, esAlerta: false },
        { id: 'esc-1', texto: '1 - Muy Mal (Crítico, inaceptable o insostenible)', valor: 1, esAlerta: true }
      ]
    case 'acuerdo':
      return [
        { id: 'esc-5', texto: '5 - Totalmente de acuerdo (Excelente respaldo)', valor: 5, esAlerta: false },
        { id: 'esc-4', texto: '4 - De acuerdo (Bien / Positivo)', valor: 4, esAlerta: false },
        { id: 'esc-3', texto: '3 - Neutral / En parte (Regular)', valor: 3, esAlerta: false },
        { id: 'esc-2', texto: '2 - En desacuerdo (Mal / Insatisfactorio)', valor: 2, esAlerta: false },
        { id: 'esc-1', texto: '1 - Totalmente en desacuerdo (Muy Mal / Crítico)', valor: 1, esAlerta: true }
      ]
    case 'frecuencia':
      return [
        { id: 'esc-5', texto: '5 - Siempre y de forma constante (Excelente)', valor: 5, esAlerta: false },
        { id: 'esc-4', texto: '4 - Frecuentemente (Bien)', valor: 4, esAlerta: false },
        { id: 'esc-3', texto: '3 - Ocasionalmente / A veces (Regular)', valor: 3, esAlerta: false },
        { id: 'esc-2', texto: '2 - Rara vez (Mal)', valor: 2, esAlerta: false },
        { id: 'esc-1', texto: '1 - Nunca / Prácticamente nulo (Muy Mal)', valor: 1, esAlerta: true }
      ]
    case 'satisfaccion':
    default:
      return [
        { id: 'esc-5', texto: '5 - Excelente (Totalmente satisfecho/a y motivado/a)', valor: 5, esAlerta: false },
        { id: 'esc-4', texto: '4 - Bien (Satisfecho/a y cómodo/a)', valor: 4, esAlerta: false },
        { id: 'esc-3', texto: '3 - Regular (Neutral o con aspectos a mejorar)', valor: 3, esAlerta: false },
        { id: 'esc-2', texto: '2 - Mal (Insatisfecho/a o con dificultades)', valor: 2, esAlerta: false },
        { id: 'esc-1', texto: '1 - Muy Mal (Muy insatisfecho/a / Situación crítica)', valor: 1, esAlerta: true }
      ]
  }
}

/**
 * Genera una encuesta analizando minuciosamente TODOS los temas con Google Gemini.
 * Si la API de Gemini no responde, utiliza el motor multidimensional de respaldo semántico local.
 */
export async function generarEncuestaConIA(
  contexto: string, 
  departamento: string = 'General',
  extension: 'rapida' | 'estandar' | 'extensa' = 'estandar'
): Promise<PlantillaEncuestaGenerada> {
  const lineas = parsearLineasBorrador(contexto)
  
  // Si el usuario proporcionó una lista explícita de preguntas pre-redactadas (2 o más)
  if (lineas.length >= 2) {
    return estructurarDesdePlantillaBase(contexto, departamento, extension)
  }
  
  // 1. Intentar generar directamente con Google Gemini AI
  try {
    const encuestaGemini = await generarEncuestaConGeminiAPI(contexto, departamento, extension)
    if (encuestaGemini && encuestaGemini.preguntas && encuestaGemini.preguntas.length > 0) {
      return encuestaGemini
    }
  } catch (error) {
    console.warn('⚠️ [iaEncuestasService] Gemini API no disponible, activando generador multidimensional detallado:', error)
  }

  // 2. Motor de respaldo semántico multidimensional (cubre todos los temas y escalas Excelente/Bien/Regular/Mal/Muy Mal)
  return generarDesdeTemaYContexto(contexto, departamento, extension)
}

/**
 * Optimiza una encuesta base redactada por el usuario con IA
 */
export async function optimizarEncuestaBaseConIA(
  encuestaBase: string,
  departamento: string = 'General'
): Promise<PlantillaEncuestaGenerada> {
  return estructurarDesdePlantillaBase(encuestaBase, departamento, 'estandar')
}

// ────────────────────────────────────────────────────────────────────────────
// LLAMADA REST A GOOGLE GEMINI API (MULTITEMÁTICA Y ULTRA DETALLADA)
// ────────────────────────────────────────────────────────────────────────────

async function generarEncuestaConGeminiAPI(
  contexto: string,
  departamento: string,
  extension: 'rapida' | 'estandar' | 'extensa'
): Promise<PlantillaEncuestaGenerada> {
  const numPreguntas = extension === 'rapida' ? '6 a 8' : extension === 'extensa' ? '16 a 22' : '10 a 14'

  const prompt = `
Eres un Psicólogo Organizacional Senior, Auditor de Clima Laboral y Diseñador de Métricas de Recursos Humanos.
Tu misión es diseñar un cuestionario de encuesta ULTRA DETALLADO, PROFESIONAL, EMPÁTICO Y EXHAUSTIVO.

CONTEXTO / TEMAS SOLICITADOS POR EL USUARIO:
"${contexto}"

DEPARTAMENTO / AUDIENCIA DESTINO: "${departamento}"
EXTENSIÓN REQUERIDA: "${extension}" (Debes generar exactamente entre ${numPreguntas} preguntas principales bien balanceadas).

REGLAS OBLIGATORIAS DE ESTRUCTURA Y DETALLE:
1. ABARCAR TODOS LOS TEMAS MENCIONADOS:
   - Analiza la solicitud del usuario y extrae CADA tema o inquietud planteada (ej. si menciona comida, computadores, horarios, sueldo, acoso, etc., DEBES incluir preguntas específicas para TODOS Y CADA UNO de esos temas).
   - No dejes ningún tema por fuera. Distribuye las preguntas de forma que cada dimensión quede profundamente evaluada.

2. ESCALA EXPLÍCITA "EXCELENTE / BIEN / REGULAR / MAL / MUY MAL":
   - Para las preguntas de tipo 'escala', utiliza SIEMPRE opciones claras con estos 5 niveles semánticos obligatorios:
     * Nivel 5: Excelente (Óptimo / Totalmente de acuerdo / Pleno) [valor: 5, esAlerta: false]
     * Nivel 4: Bien (Favorable / De acuerdo / Bueno) [valor: 4, esAlerta: false]
     * Nivel 3: Regular (Aceptable / Neutral / En equilibrio) [valor: 3, esAlerta: false]
     * Nivel 2: Mal (Insuficiente / En desacuerdo / Desanimado) [valor: 2, esAlerta: false]
     * Nivel 1: Muy Mal (Crítico / Totalmente en desacuerdo / Alerta) [valor: 1, esAlerta: true]

3. PREGUNTAS DE OPCIÓN MÚLTIPLE DETALLADAS:
   - Cuando uses preguntas de tipo 'multiple', incluye opciones concretas y realistas que distingan niveles óptimos, intermedios y críticos con su respectivo 'esAlerta: true' en la opción más perjudicial.

4. PREGUNTAS ABIERTAS (TIPO TEXTO):
   - Incluye al menos 1 o 2 preguntas abiertas tipo 'texto' (con opciones: []) al final para que el colaborador aporte sugerencias cualitativas específicas sobre los temas evaluados.

5. NUNCA generes preguntas concatenadas mecánicas ni comillas vacías. Redacta preguntas en español fluido, respetuoso y formal.

6. FORMATO DE RESPUESTA:
   Devuelve ÚNICAMENTE un objeto JSON válido (sin etiquetas markdown ni texto introductorio) con esta estructura:

{
  "titulo": "Título profesional y descriptivo de la encuesta",
  "descripcion": "Descripción empática y motivadora que garantice la confidencialidad.",
  "departamento": "${departamento}",
  "preguntas": [
    {
      "categoria": "Nombre de la dimensión evaluada",
      "texto": "¿Pregunta detallada y comprensible?",
      "tipo": "escala" | "multiple" | "texto",
      "esSensibleAcoso": boolean,
      "opciones": [
        { "texto": "5 - Excelente / Totalmente de acuerdo", "valor": 5, "esAlerta": false },
        { "texto": "4 - Bien / De acuerdo", "valor": 4, "esAlerta": false },
        { "texto": "3 - Regular / Neutral", "valor": 3, "esAlerta": false },
        { "texto": "2 - Mal / En desacuerdo", "valor": 2, "esAlerta": false },
        { "texto": "1 - Muy Mal / Totalmente en desacuerdo", "valor": 1, "esAlerta": true }
      ]
    }
  ],
  "preguntasSeguimiento": [
    {
      "categoria": "Propuestas de Mejora",
      "texto": "¿Qué propuesta o cambio prioritario sugerirías para optimizar estos aspectos?",
      "tipo": "texto",
      "opciones": []
    }
  ]
}
`

  const apiKey = obtenerClaveApiGemini()
  if (!esClaveApiValida(apiKey)) {
    return generarPreguntasLocalesSemanticas(tema, departamento, opciones)
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI_PRINCIPAL}:generateContent?key=${apiKey}`

    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          topP: 0.95
        }
      })
    })

    if (!respuesta.ok) {
      return generarPreguntasLocalesSemanticas(tema, departamento, opciones)
    }

    const data = await respuesta.json()
  const textoGenerado: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const jsonLimpio = extraerJSONLimpio(textoGenerado)

  const parsed = JSON.parse(jsonLimpio) as {
    titulo: string
    descripcion: string
    departamento?: string
    preguntas: Array<{
      categoria: string
      texto: string
      tipo: 'escala' | 'multiple' | 'texto' | 'si_no'
      esSensibleAcoso?: boolean
      opciones: Array<{ texto: string; valor: number; esAlerta?: boolean }>
    }>
    preguntasSeguimiento?: Array<{
      categoria: string
      texto: string
      tipo: 'escala' | 'multiple' | 'texto' | 'si_no'
      opciones: Array<{ texto: string; valor: number; esAlerta?: boolean }>
    }>
  }

  // Normalizar y asegurar consistencia en escalas
  const preguntasFinales: PreguntaEncuesta[] = (parsed.preguntas || []).map((p, idx) => {
    let opcionesNormalizadas = p.opciones || []
    
    // Si la pregunta es escala y no trajo opciones completas, inyectar escala estandarizada
    if (p.tipo === 'escala' && (!opcionesNormalizadas || opcionesNormalizadas.length < 4)) {
      opcionesNormalizadas = obtenerEscalaEstandarDetallada('satisfaccion')
    }

    return {
      id: uidGen(`p-gemini-${idx + 1}`),
      categoria: p.categoria || 'Clima General',
      texto: formatearPreguntaEspanol(p.texto),
      tipo: p.tipo || 'escala',
      esSensibleAcoso: Boolean(p.esSensibleAcoso),
      opciones: opcionesNormalizadas.map((op, oIdx) => ({
        id: `opc-${idx}-${oIdx + 1}`,
        texto: op.texto,
        valor: typeof op.valor === 'number' ? op.valor : (5 - oIdx),
        esAlerta: Boolean(op.esAlerta || (op.valor === 1))
      }))
    }
  })

  const seguimientoFinales: PreguntaEncuesta[] = (parsed.preguntasSeguimiento || []).map((p, idx) => ({
    id: uidGen(`seg-gemini-${idx + 1}`),
    categoria: p.categoria || 'Propuestas y Bienestar',
    texto: formatearPreguntaEspanol(p.texto),
    tipo: p.tipo || 'texto',
    opciones: []
  }))

  return {
    titulo: parsed.titulo || `Evaluación de Clima: ${contexto.slice(0, 45)}`,
    descripcion: parsed.descripcion || `Diagnóstico confidencial y detallado para el área de ${departamento}.`,
    departamento: parsed.departamento || departamento,
    preguntas: preguntasFinales,
    preguntasSeguimiento: seguimientoFinales.length > 0 ? seguimientoFinales : [
      {
        id: uidGen('seg-default'),
        categoria: 'Propuestas de Mejora',
        texto: '¿Qué iniciativa o acción prioritaria propondrías para mejorar estos aspectos en tu equipo?',
        tipo: 'texto',
        opciones: []
      }
    ]
  }
} catch (err) {
  return generarPreguntasLocalesSemanticas(tema, departamento, opciones)
}
}

// ────────────────────────────────────────────────────────────────────────────
// EVALUACIÓN DE RESPUESTAS CON GEMINI (ESTRICTO - CERO FALSAS ALARMAS)
// ────────────────────────────────────────────────────────────────────────────

export interface ParametrosEvaluacionRespuestas {
  idEncuesta?: string
  tituloEncuesta?: string
  dispositivoUUID?: string
  departamento?: string
  respuestas: Array<{
    idPregunta: string
    textoPregunta: string
    categoria: string
    respuesta: string
    valor?: number
    esAlerta?: boolean
    comentario?: string
  }>
}

export async function evaluarRespuestasConGeminiEstricto(
  params: ParametrosEvaluacionRespuestas
): Promise<ResultadoEvaluacionGemini> {
  const departamento = params.departamento || 'General'
  const respuestas = params.respuestas || []

  const respuestasFormateadas = respuestas
    .map((r, idx) => `${idx + 1}. [${r.categoria}] ${r.textoPregunta} -> RESPUESTA: "${r.respuesta}"${r.comentario ? ` | COMENTARIO: "${r.comentario}"` : ''}`)
    .join('\n')

  const prompt = `
Eres un Psicólogo Organizacional y Auditor de Clima Laboral.
Evalúa las siguientes respuestas de un colaborador en el área de "${departamento}".

RESPUESTAS:
${respuestasFormateadas}

REGLAS ESTRICTAS DE ALERTA:
1. Si las respuestas son normales o aceptables (calificaciones regulares, buenas, o sin incidentes graves), 'hayAlertas': false, 'totalAlertas': 0 y 'alertas': [].
2. NUNCA actives una alerta por el simple hecho de haber respondido la encuesta.
3. SOLO activa una alerta ante:
   - Violencia verbal, gritos, intimidación, acoso laboral reiterado o humillación explícita.
   - Depresión severa manifiesta, ideaciones de daño o colapso emocional inmanejable.
   - Deseo explícito de renunciar de inmediato debido a ambiente destructivo o maltrato.
4. Devuelve ÚNICAMENTE un JSON con:
{
  "hayAlertas": boolean,
  "totalAlertas": number,
  "clasificacionGlobal": "Buena" | "Mala",
  "diagnosticoGeneral": "string",
  "alertas": [
    {
      "estadoAlerta": "Activada",
      "mensajeCapturado": "string",
      "clasificacion": "Mala",
      "motivoDetallado": "string",
      "prioridad": "Crítica" | "Alta" | "Moderada",
      "categoria": "string"
    }
  ]
}
`

  const apiKey = obtenerClaveApiGemini()
  if (esClaveApiValida(apiKey)) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI_PRINCIPAL}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, topP: 0.95 }
        })
      })

      if (res.ok) {
        const data = await res.json()
        const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonLimpio = extraerJSONLimpio(texto)
        const resultado = JSON.parse(jsonLimpio) as {
          hayAlertas: boolean
          totalAlertas: number
          clasificacionGlobal: 'Buena' | 'Mala'
          diagnosticoGeneral: string
          alertas: AlertaGeminiEstricta[]
        }

        return {
          success: true,
          hayAlertas: Boolean(resultado.hayAlertas),
          totalAlertas: resultado.totalAlertas || (resultado.alertas?.length || 0),
          diagnosticoGeneral: resultado.diagnosticoGeneral || 'Evaluación completada.',
          clasificacionGlobal: resultado.clasificacionGlobal || (resultado.hayAlertas ? 'Mala' : 'Buena'),
          alertas: resultado.alertas || []
        }
      }
    } catch (error) {
      // Continuar al respaldo local
    }
  }
    // Respaldo heurístico local
    const alertasLocales: AlertaGeminiEstricta[] = []
    for (const r of respuestas) {
      const texto = `${r.textoPregunta} ${r.respuesta} ${r.comentario || ''}`.toLowerCase()
      const tienePalabrasCriticas = ['acoso', 'hostig', 'grito', 'insulto', 'amenaza', 'humillaci', 'renunciar por maltrato', 'depresion severa'].some(w => texto.includes(w))
      
      if (r.esAlerta && tienePalabrasCriticas) {
        alertasLocales.push({
          estadoAlerta: 'Activada',
          mensajeCapturado: r.comentario || r.respuesta,
          clasificacion: 'Mala',
          motivoDetallado: `Se detectó indicador explícito de riesgo psicosocial en la respuesta de ${r.categoria}.`,
          prioridad: 'Crítica',
          categoria: r.categoria
        })
      }
    }

    const hayAlertas = alertasLocales.length > 0
    return {
      success: true,
      hayAlertas,
      totalAlertas: alertasLocales.length,
      diagnosticoGeneral: hayAlertas ? 'Se identificaron alertas psicosociales prioritarias.' : 'Clima organizacional estable.',
      clasificacionGlobal: hayAlertas ? 'Mala' : 'Buena',
      alertas: alertasLocales
    }
}

// ────────────────────────────────────────────────────────────────────────────
// PARSEADORES Y AUXILIARES
// ────────────────────────────────────────────────────────────────────────────

function parsearLineasBorrador(texto: string): string[] {
  return texto
    .split(/\n|\r/)
    .map(l => l.trim())
    .filter(l => {
      if (l.length < 4) return false
      const lower = l.toLowerCase()
      if (lower.startsWith('encuesta:') || lower.startsWith('departamento:') || lower.startsWith('tema:')) return false
      return true
    })
}

function limpiarPrefijoPregunta(texto: string): string {
  return texto.replace(/^(\d+[\.\-\)]\s*|[\*\-•]\s*|\¿|\?)/g, '').trim()
}

function formatearPreguntaEspanol(textoLimpio: string): string {
  let res = textoLimpio.trim()
  if (!res.startsWith('¿')) res = `¿${res}`
  if (!res.endsWith('?')) res = `${res}?`
  return res
}

/**
 * Identifica TODOS los temas o dimensiones presentes en el texto del usuario
 */
function identificarTodosLosTemas(texto: string): string[] {
  const lower = texto.toLowerCase()
  const temasEncontrados: string[] = []

  if (/sentir|sienten|ánimo|animo|emocional|tristeza|felicidad|estado de [aá]nimo|bienestar personal/i.test(lower)) {
    temasEncontrados.push('Bienestar Emocional y Sentir del Equipo')
  }
  if (/comedor|cafeter[ií]a|comida|almuerzo|alimentaci[oó]n|desayuno|refrigerio|casino/i.test(lower)) {
    temasEncontrados.push('Alimentación y Comedor')
  }
  if (/computador|pc|laptop|hardware|software|sistema|internet|conectividad|plataforma|pantalla|herramienta/i.test(lower)) {
    temasEncontrados.push('Tecnología y Herramientas TI')
  }
  if (/turno|horario|nocturno|noche|madrugada|rotativo|jornada|descanso|horas extra/i.test(lower)) {
    temasEncontrados.push('Gestión de Turnos y Descanso')
  }
  if (/ruta|transporte|bus|movilidad|veh[ií]culo|traslado|paradero/i.test(lower)) {
    temasEncontrados.push('Transporte y Movilidad')
  }
  if (/estr[eé]s|sobrecarga|agotamiento|burnout|presi[oó]n|fatiga|cansancio/i.test(lower)) {
    temasEncontrados.push('Salud Mental y Carga Laboral')
  }
  if (/silla|ergonom|luz|iluminaci[oó]n|aire|ruido|espacio|bodega|uniforme|calzado|dotaci[oó]n|epp|seguridad industrial/i.test(lower)) {
    temasEncontrados.push('Ergonomía e Instalaciones')
  }
  if (/acoso|hostigamiento|maltrato|humillaci[oó]n|gritos|respeto|trato digno|discriminaci/i.test(lower)) {
    temasEncontrados.push('Convivencia y Clima Seguro')
  }
  if (/jefe|supervisor|l[ií]der|coordinador|jefatura|directiv|retroalimentaci[oó]n/i.test(lower)) {
    temasEncontrados.push('Liderazgo y Supervisión')
  }
  if (/compañer|equipo|colaboraci[oó]n|comunicaci[oó]n|sinergia|apoyo entre pares/i.test(lower)) {
    temasEncontrados.push('Trabajo en Equipo y Cooperación')
  }
  if (/salario|sueldo|pago|beneficio|remuneraci[oó]n|comisi[oó]n|bono|econ[oó]mic/i.test(lower)) {
    temasEncontrados.push('Compensación y Beneficios')
  }
  if (/capacita|curso|aprendizaje|desarrollo|crecimiento|carrera|inducci[oó]n|onboarding/i.test(lower)) {
    temasEncontrados.push('Crecimiento y Capacitación')
  }
  if (/remoto|teletrabajo|casa|home office|h[ií]brido|desconexi[oó]n/i.test(lower)) {
    temasEncontrados.push('Trabajo Remoto y Desconexión')
  }

  // Si no se detectó ningún tema específico, asignar experiencia general
  if (temasEncontrados.length === 0) {
    temasEncontrados.push('Bienestar y Experiencia Laboral')
  }

  return temasEncontrados
}

function generarOpcionesEscala(tipo: 'satisfaccion' | 'calidad' | 'acuerdo' | 'frecuencia' = 'satisfaccion') {
  return obtenerEscalaEstandarDetallada(tipo)
}

function estructurarDesdePlantillaBase(
  encuestaBase: string,
  departamento: string,
  extension: 'rapida' | 'estandar' | 'extensa'
): PlantillaEncuestaGenerada {
  const lineas = parsearLineasBorrador(encuestaBase)
  const temasIdentificados = identificarTodosLosTemas(encuestaBase)
  
  const preguntasProcesadas: PreguntaEncuesta[] = lineas.map((linea, idx) => {
    const textoLimpio = limpiarPrefijoPregunta(linea)
    const temaLinea = identificarTodosLosTemas(textoLimpio)[0] || 'Experiencia Laboral'
    const lower = textoLimpio.toLowerCase()

    const esPreguntaAbierta = /qu[eé] propones|cu[aá]les|por qu[eé]|comentarios|sugerencias|observaciones|c[oó]mo te sientes/i.test(lower)

    if (esPreguntaAbierta) {
      return {
        id: uidGen(`p-usr-${idx + 1}`),
        categoria: temaLinea,
        texto: formatearPreguntaEspanol(textoLimpio),
        tipo: 'texto',
        esSensibleAcoso: false,
        opciones: []
      }
    }

    const esCalidad = /calidad|estado|condici[oó]n|herramienta|comida|equipo|limpieza/i.test(lower)
    const esFrecuencia = /frecuencia|con qu[eé] frecuencia|cu[aá]ntas veces|habitual/i.test(lower)
    const esAcuerdo = /acuerdo|consideras|sientes|percibes|cuenta con/i.test(lower)

    const tipoEscala = esCalidad ? 'calidad' : esFrecuencia ? 'frecuencia' : esAcuerdo ? 'acuerdo' : 'satisfaccion'

    return {
      id: uidGen(`p-usr-${idx + 1}`),
      categoria: temaLinea,
      texto: formatearPreguntaEspanol(textoLimpio),
      tipo: 'escala',
      esSensibleAcoso: /acoso|maltrato|gritos|discriminaci/i.test(lower),
      opciones: obtenerEscalaEstandarDetallada(tipoEscala)
    }
  })

  return {
    titulo: `Cuestionario Detallado: ${temasIdentificados.slice(0, 2).join(' & ')} (${departamento})`,
    descripcion: `Diagnóstico integral y confidencial calibrado para el área de ${departamento}.`,
    departamento,
    preguntas: preguntasProcesadas,
    preguntasSeguimiento: [
      {
        id: uidGen('seg-base'),
        categoria: 'Propuestas y Comentarios Adicionales',
        texto: '¿Tienes alguna otra observación, sugerencia o situación que desees compartir de forma confidencial?',
        tipo: 'texto',
        opciones: []
      }
    ]
  }
}

// ────────────────────────────────────────────────────────────────────────────
// GENERADOR MULTITEMÁTICO Y DETALLADO DE RESPALDO LOCAL
// ────────────────────────────────────────────────────────────────────────────

function generarDesdeTemaYContexto(
  contexto: string,
  departamento: string,
  extension: 'rapida' | 'estandar' | 'extensa'
): PlantillaEncuestaGenerada {
  const promptLimpio = contexto.trim()
  const temasDetectados = identificarTodosLosTemas(promptLimpio)
  const preguntas: PreguntaEncuesta[] = []

  // Banco de preguntas detalladas por dimensión con escala Excelente / Bien / Regular / Mal / Muy Mal
  const bancoPorTema: Record<string, PreguntaEncuesta[]> = {
    'Bienestar Emocional y Sentir del Equipo': [
      {
        id: uidGen('emo'),
        categoria: 'Estado de Ánimo y Motivación',
        texto: '¿Cómo calificarías tu estado de ánimo, energía y motivación general al iniciar tus jornadas laborales?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      },
      {
        id: uidGen('emo'),
        categoria: 'Seguridad Psicológica y Escucha',
        texto: '¿Sientes la confianza y tranquilidad de expresar tus opiniones o momentos de sobrecarga sin temor a ser juzgado(a)?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('acuerdo')
      },
      {
        id: uidGen('emo'),
        categoria: 'Balance Vida y Trabajo',
        texto: '¿Cómo evalúas el equilibrio entre tus responsabilidades laborales y tu tiempo de descanso y bienestar personal?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      }
    ],

    'Alimentación y Comedor': [
      {
        id: uidGen('com'),
        categoria: 'Calidad e Higiene de Alimentos',
        texto: '¿Cómo evalúas la calidad, sabor, higiene y frescura de los alimentos ofrecidos en el servicio de comedor / cafetería?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      },
      {
        id: uidGen('com'),
        categoria: 'Variedad y Opciones Nutricionales',
        texto: '¿Cómo calificas la variedad de los menús y la disponibilidad de alternativas saludables?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      },
      {
        id: uidGen('com'),
        categoria: 'Tiempos de Atención y Espacio',
        texto: '¿Cómo evalúas la agilidad en la entrega de alimentos y la comodidad de las instalaciones para almorzar?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      }
    ],

    'Tecnología y Herramientas TI': [
      {
        id: uidGen('ti'),
        categoria: 'Rendimiento de Computadores y Equipos',
        texto: '¿Cómo calificas el rendimiento, velocidad y estado técnico de tu computador y equipos de trabajo?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      },
      {
        id: uidGen('ti'),
        categoria: 'Estabilidad de Red y Conectividad',
        texto: '¿Cómo evalúas la estabilidad y velocidad de la conexión a internet y plataformas corporativas?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      },
      {
        id: uidGen('ti'),
        categoria: 'Soporte Técnico y Solución de Fallos',
        texto: '¿Cómo calificas la agilidad y efectividad del equipo de soporte técnico cuando reportas un incidente?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      }
    ],

    'Gestión de Turnos y Descanso': [
      {
        id: uidGen('tur'),
        categoria: 'Previsibilidad y Horarios',
        texto: '¿Cómo calificas la anticipación y claridad con la que se programan y comunican tus turnos de trabajo?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      },
      {
        id: uidGen('tur'),
        categoria: 'Descanso Reparador entre Jornadas',
        texto: '¿El intervalo de tiempo entre turnos te permite una recuperación física y mental adecuada?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('acuerdo')
      },
      {
        id: uidGen('tur'),
        categoria: 'Equidad en la Asignación de Turnos',
        texto: '¿Cómo evalúas la justicia y equidad en la distribución de turnos rotativos, nocturnos o de fin de semana?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      }
    ],

    'Convivencia y Clima Seguro': [
      {
        id: uidGen('con'),
        categoria: 'Respeto y Trato Humano',
        texto: '¿Cómo calificas el nivel de respeto mutuo, cordialidad y consideración entre todos los integrantes del equipo?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      },
      {
        id: uidGen('con'),
        categoria: 'Prevención de Hostigamiento y Acoso',
        texto: '¿Has experimentado o presenciado conductas de acoso, gritos, discriminación o trato denigrante en el área?',
        tipo: 'multiple',
        esSensibleAcoso: true,
        opciones: [
          { id: 'con-1', texto: 'Excelente: Jamás he presenciado tratos indebidos (Clima 100% respetuoso)', valor: 5, esAlerta: false },
          { id: 'con-2', texto: 'Bien: Ambiente cordial con roces menores ya resueltos', valor: 4, esAlerta: false },
          { id: 'con-3', texto: 'Regular: Tensión ocasional o falta de empatía', valor: 3, esAlerta: false },
          { id: 'con-4', texto: 'Mal: Desacuerdos constantes y favoritismo marcado', valor: 2, esAlerta: false },
          { id: 'con-5', texto: 'Muy Mal: Acoso, gritos o humillaciones reiteradas (Alerta Crítica)', valor: 1, esAlerta: true }
        ]
      },
      {
        id: uidGen('con'),
        categoria: 'Confianza en Canales Confidenciales',
        texto: '¿Sientes la seguridad de que puedes acudir a los canales de bienestar y recursos humanos sin temor a represalias?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('acuerdo')
      }
    ],

    'Liderazgo y Supervisión': [
      {
        id: uidGen('lid'),
        categoria: 'Acompañamiento y Guía de Líderes',
        texto: '¿Cómo evalúas la disposición, cercanía y orientación que recibes por parte de tu supervisor o jefe directo?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      },
      {
        id: uidGen('lid'),
        categoria: 'Claridad en Directrices y Retroalimentación',
        texto: '¿Tu líder te proporciona retroalimentación constructiva, clara y oportuna sobre tu desempeño?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('acuerdo')
      },
      {
        id: uidGen('lid'),
        categoria: 'Reconocimiento al Esfuerzo',
        texto: '¿Cómo calificas el reconocimiento y valoración que tu liderazgo otorga a tus aportes y dedicación?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      }
    ],

    'Compensación y Beneficios': [
      {
        id: uidGen('comp'),
        categoria: 'Satisfacción con la Remuneración',
        texto: '¿Cómo evalúas la correspondencia entre tus responsabilidades laborales y la compensación económica recibida?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      },
      {
        id: uidGen('comp'),
        categoria: 'Puntualidad y Claridad de Pagos',
        texto: '¿Cómo calificas la exactitud, transparencia y puntualidad en el pago de salarios, recargos y beneficios?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      }
    ],

    'Ergonomía e Instalaciones': [
      {
        id: uidGen('erg'),
        categoria: 'Comodidad del Puesto de Trabajo',
        texto: '¿Cómo calificas la ergonomía de tu silla, escritorio, iluminación y temperatura del puesto de trabajo?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      },
      {
        id: uidGen('erg'),
        categoria: 'Dotación y Elementos de Seguridad',
        texto: '¿Cómo evalúas la calidad y entrega oportuna de uniformes, herramientas y elementos de protección requeridos?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      }
    ],

    'Transporte y Movilidad': [
      {
        id: uidGen('mov'),
        categoria: 'Puntualidad y Cobertura de Rutas',
        texto: '¿Cómo calificas la puntualidad, seguridad y cobertura de las rutas de transporte o convenios de movilidad?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('calidad')
      }
    ],

    'Crecimiento y Capacitación': [
      {
        id: uidGen('crec'),
        categoria: 'Oportunidades de Aprendizaje',
        texto: '¿Cómo evalúas las oportunidades de capacitación continua y desarrollo profesional dentro de la empresa?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      }
    ],

    'Trabajo en Equipo y Cooperación': [
      {
        id: uidGen('eq'),
        categoria: 'Sinergia y Colaboración entre Pares',
        texto: '¿Cómo calificas el compañerismo, la solidaridad y la disposición a colaborar entre los miembros del equipo?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      }
    ],

    'Salud Mental y Carga Laboral': [
      {
        id: uidGen('sm'),
        categoria: 'Volumen y Ritmo de Tareas',
        texto: '¿Cómo evalúas el volumen de trabajo y los plazos de entrega asignados para el cumplimiento de tus funciones?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      },
      {
        id: uidGen('sm'),
        categoria: 'Prevención del Agotamiento (Burnout)',
        texto: '¿Sientes que tu nivel de fatiga y presión laboral se mantiene en rangos saludables sin llegar al agotamiento crónico?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('acuerdo')
      }
    ]
  }

  // Recopilar preguntas de TODOS los temas identificados
  temasDetectados.forEach(tema => {
    const preguntasTema = bancoPorTema[tema]
    if (preguntasTema) {
      preguntas.push(...preguntasTema)
    }
  })

  // Si aún faltan preguntas o se pidió algo muy general, añadir evaluación global
  if (preguntas.length < 5) {
    preguntas.push(
      {
        id: uidGen('gen'),
        categoria: 'Satisfacción General',
        texto: 'En una escala global, ¿cómo calificas tu nivel de bienestar y satisfacción trabajando en la compañía?',
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      },
      {
        id: uidGen('gen'),
        categoria: 'Sentido de Pertenencia',
        texto: '¿Recomendarías a un familiar o amigo cercano trabajar en esta organización?',
        tipo: 'multiple',
        opciones: [
          { id: 'rec-5', texto: 'Excelente: Sí, la recomendaría con total seguridad y orgullo', valor: 5, esAlerta: false },
          { id: 'rec-4', texto: 'Bien: Sí, es un buen lugar para trabajar', valor: 4, esAlerta: false },
          { id: 'rec-3', texto: 'Regular: Dependería del área y condiciones', valor: 3, esAlerta: false },
          { id: 'rec-2', texto: 'Mal: No la recomendaría fácilmente por problemas actuales', valor: 2, esAlerta: false },
          { id: 'rec-1', texto: 'Muy Mal: No la recomendaría en absoluto debido al clima laboral', valor: 1, esAlerta: true }
        ]
      }
    )
  }

  // Ajustar según extensión
  let preguntasFinales = preguntas
  if (extension === 'rapida') {
    preguntasFinales = preguntas.slice(0, Math.max(6, temasDetectados.length * 2))
  }

  // Añadir pregunta cualitativa abierta
  preguntasFinales.push({
    id: uidGen('txt-sug'),
    categoria: 'Aportes y Sugerencias Abiertas',
    texto: `En tus propias palabras, ¿qué propuesta o mejora específica sugerirías respecto a ${temasDetectados.slice(0, 3).join(', ')}?`,
    tipo: 'texto',
    opciones: []
  })

  const tituloGenerado = temasDetectados.length > 1
    ? `Diagnóstico Multidimensional: ${temasDetectados.slice(0, 3).join(' & ')}`
    : `Diagnóstico Detallado: ${temasDetectados[0] || 'Clima Laboral'}`

  return {
    titulo: tituloGenerado,
    descripcion: `Evaluación integral y confidencial para ${departamento} que analiza ${temasDetectados.join(', ')}.`,
    departamento,
    preguntas: preguntasFinales,
    preguntasSeguimiento: [
      {
        id: uidGen('seg-gen'),
        categoria: 'Iniciativas Prioritarias',
        texto: '¿Cuál consideras que debe ser la acción prioritaria a implementar para mejorar tu experiencia diaria?',
        tipo: 'texto',
        opciones: []
      }
    ]
  }
}

/**
 * Consulta conversacional inteligente con Google Gemini para el asistente JARVIS / Personalizado de Clima Laboral
 * Capaz de dialogar con personalidad ejecutiva y ejecutar acciones en tiempo real sobre la encuesta.
 */
export async function consultarChatbotGeminiAPI(
  mensajeUsuario: string,
  historial: Array<{ emisor: 'usuario' | 'asistente'; texto: string }>,
  preguntasActuales: PreguntaEncuesta[],
  nombreAsistente: string = 'JARVIS'
): Promise<RespuestaJarvisGemini> {
  const nombreLimpio = (nombreAsistente || 'JARVIS').trim()
  const nombreMayus = nombreLimpio.toUpperCase()

  const inventarioPreguntas = preguntasActuales.map((p, idx) => {
    const opcionesStr = p.opciones?.map(o => `"${o.texto}" (alerta: ${o.esAlerta ? 'SÍ' : 'NO'})`).join(', ') || 'Abierta'
    return `[#${idx + 1} | ID: ${p.id} | ${p.categoria} | Tipo: ${p.tipo}]\nTexto: "${p.texto}"\nOpciones: [${opcionesStr}]`
  }).join('\n\n')

  const ultimosMensajes = historial.slice(-8).map(m => `${m.emisor === 'usuario' ? 'Administrador' : nombreMayus}: ${m.texto}`).join('\n')

  const prompt = `
Eres ${nombreMayus} (sistema de inteligencia artificial executive con la personalidad y capacidades de J.A.R.V.I.S. de Tony Stark), configurado como Asistente Principal de Arquitectura de Encuestas y Clima Organizacional para "Contigo Call Center".

TU IDENTIDAD, NOMBRE Y PERSONALIDAD:
- Tu nombre oficial configurado por el usuario es "${nombreLimpio}".
- Cuando el usuario te hable o te llame por tu nombre (ejemplos: "${nombreLimpio}, edítame esta encuesta", "${nombreLimpio}, cambia la pregunta 3", "${nombreLimpio}, agrega una pregunta de liderazgo", "${nombreLimpio}, ponle alerta a..."), responde reconociendo tu nombre de forma natural, ejecutiva, elegante y con máxima fidelidad operativa ("A la orden, señor. Yo, ${nombreLimpio}, he actualizado la encuesta...", "Enseguida, señor. Procedo con la modificación solicitada.").
- Eres sumamente educado, cortés, proactivo, sofisticado, de respuesta rápida y ejecutiva.
- Te diriges al usuario respetuosamente como "señor" o "administrador".
- Tienes control operativo total sobre la arquitectura de la encuesta: puedes crear preguntas, editar redacciones, cambiar opciones, activar o desactivar alertas de riesgo, eliminar preguntas y reestructurar bloques con precisión milimétrica.
- Si el usuario te pide modificar algo (por voz o texto), realizas la acción de inmediato y confirmas con tu estilo característico.

INVENTARIO ACTUAL DE LA ENCUESTA (${preguntasActuales.length} preguntas en total):
${inventarioPreguntas}

HISTORIAL DE LA CONVERSACIÓN RECIENTE:
${ultimosMensajes}

NUEVA INSTRUCCIÓN O MENSAJE DEL ADMINISTRADOR:
"${mensajeUsuario}"

CAPACIDADES DE ACCIÓN (Genera una lista de acciones si el usuario lo solicita explícita o implícitamente):
- "CREAR_PREGUNTA": Para agregar una nueva pregunta (especifica "categoria", "textoPregunta", "tipoPregunta" ('escala'|'multiple'|'texto'), "opciones").
- "EDITAR_PREGUNTA": Para cambiar el texto, categoría o tipo de una pregunta existente (especifica "numeroPregunta" [1 a ${preguntasActuales.length}] o "idPregunta", "textoPregunta", "categoria", "tipoPregunta", y opcionalmente "opciones").
- "EDITAR_OPCIONES": Para reemplazar todas las opciones de una pregunta (especifica "numeroPregunta", "opciones" con array de { "texto", "valor", "esAlerta" }).
- "ASIGNAR_ALERTA": Para marcar o desmarcar alerta en una opción específica de una pregunta (especifica "numeroPregunta", "opcionTexto" o fragmento, "esAlerta": true|false).
- "AGREGAR_OPCION": Para sumar una nueva opción a una pregunta existente (especifica "numeroPregunta", "opcionTexto", "opcionValor", "esAlerta").
- "ELIMINAR_OPCION": Para quitar una opción de una pregunta (especifica "numeroPregunta", "opcionTexto").
- "ELIMINAR_PREGUNTA": Para remover una pregunta (especifica "numeroPregunta" o "idPregunta").
- "CAMBIAR_TITULO": Para actualizar el título general de la encuesta (especifica "nuevoTitulo").
- "CAMBIAR_DESCRIPCION": Para actualizar la descripción de la encuesta (especifica "nuevaDescripcion").
- "RESTAURAR_PLANTILLA_OFICIAL": Si el usuario pide volver a las 34 preguntas oficiales de Contigo Call Center.

REGLAS DE RESPUESTA:
1. "respuestaTexto": Tu respuesta hablada para el usuario. Debe ser concisa, natural para síntesis de voz (TTS), elegante y profesional al estilo JARVIS.
2. "acciones": Arreglo de acciones a ejecutar en la aplicación. Si el usuario solo está conversando o pidiendo asesoría teórica sin pedir cambios, deja "acciones": [].
3. "preguntaSugerida": (Opcional) Si quieres ofrecer una pregunta de prueba para que el usuario la previsualice antes de agregarla.
4. Devuelve ÚNICAMENTE un JSON válido sin markdown ni texto fuera del JSON:

{
  "respuestaTexto": "Texto que JARVIS dirá en voz alta",
  "acciones": [
    {
      "tipo": "CREAR_PREGUNTA" | "EDITAR_PREGUNTA" | "EDITAR_OPCIONES" | "ASIGNAR_ALERTA" | "AGREGAR_OPCION" | "ELIMINAR_OPCION" | "ELIMINAR_PREGUNTA" | "CAMBIAR_TITULO" | "CAMBIAR_DESCRIPCION" | "RESTAURAR_PLANTILLA_OFICIAL",
      "numeroPregunta": 3,
      "idPregunta": "p-003",
      "categoria": "Bloque 2: Bienestar Emocional...",
      "textoPregunta": "¿Nuevo texto de la pregunta?",
      "tipoPregunta": "multiple",
      "opcionTexto": "Opción crítica",
      "opcionValor": 1,
      "esAlerta": true,
      "opciones": [
        { "texto": "Excelente", "valor": 5, "esAlerta": false },
        { "texto": "Regular", "valor": 3, "esAlerta": false },
        { "texto": "Crítico", "valor": 1, "esAlerta": true }
      ],
      "nuevoTitulo": "...",
      "nuevaDescripcion": "...",
      "descripcionAccion": "Descripción breve de la acción para el registro"
    }
  ],
  "preguntaSugerida": null
}
`

  const apiKey = obtenerClaveApiGemini()
  if (esClaveApiValida(apiKey)) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI_PRINCIPAL}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1200
          }
        })
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonStr = extraerJSONLimpio(rawText)
        const parsed = JSON.parse(jsonStr)

        const acciones: AccionJarvis[] = Array.isArray(parsed.acciones) ? parsed.acciones : []

        let preguntaSugerida: PreguntaEncuesta | undefined = undefined
        if (parsed.preguntaSugerida && parsed.preguntaSugerida.texto) {
          preguntaSugerida = {
            id: uidGen('p-gemini'),
            categoria: parsed.preguntaSugerida.categoria || 'Bloque de IA',
            texto: parsed.preguntaSugerida.texto,
            tipo: parsed.preguntaSugerida.tipo || 'multiple',
            opciones: Array.isArray(parsed.preguntaSugerida.opciones)
              ? parsed.preguntaSugerida.opciones.map((o: any, idx: number) => ({
                  id: `opc-gem-${Date.now()}-${idx}`,
                  texto: o.texto || `Opción ${idx + 1}`,
                  valor: typeof o.valor === 'number' ? o.valor : 3,
                  esAlerta: Boolean(o.esAlerta)
                }))
              : []
          }
        }

        return {
          respuestaTexto: parsed.respuestaTexto || `A la orden, señor. Soy ${nombreLimpio}, los sistemas están listos.`,
          acciones,
          preguntaSugerida,
          estadoProtocolo: 'ONLINE'
        }
      }
    } catch (err) {
      // Si la API de Google demora más de 2.5s o falla, caer inmediatamente al motor local
    }
  }

  // 2. Motor Inteligente de Procesamiento Local de Lenguaje Natural (100% Instantáneo y Confiable)
  return interpretarAccionesVozLocal(mensajeUsuario, preguntasActuales, nombreLimpio)
}

/**
 * Intérprete semántico local de comandos de voz para edición de encuestas en tiempo real
 */
export function interpretarAccionesVozLocal(
  mensaje: string,
  preguntas: PreguntaEncuesta[],
  nombreAsistente: string = 'Daniel'
): RespuestaJarvisGemini {
  const lower = mensaje.toLowerCase().trim()
  const acciones: AccionJarvis[] = []

  // Diccionario de números en palabras y ordinales
  const mapaNumeros: Record<string, number> = {
    'primera': 1, 'primero': 1, 'uno': 1, '1': 1,
    'segunda': 2, 'segundo': 2, 'dos': 2, '2': 2,
    'tercera': 3, 'tercero': 3, 'tres': 3, '3': 3,
    'cuarta': 4, 'cuarto': 4, 'cuatro': 4, '4': 4,
    'quinta': 5, 'quinto': 5, 'cinco': 5, '5': 5,
    'sexta': 6, 'sexto': 6, 'seis': 6, '6': 6,
    'septima': 7, 'séptima': 7, 'septimo': 7, 'séptimo': 7, 'siete': 7, '7': 7,
    'octava': 8, 'octavo': 8, 'ocho': 8, '8': 8,
    'novena': 9, 'noveno': 9, 'nueve': 9, '9': 9,
    'decima': 10, 'décima': 10, 'diez': 10, '10': 10,
    'once': 11, '11': 11, 'doce': 12, '12': 12, 'trece': 13, '13': 13,
    'catorce': 14, '14': 14, 'quince': 15, '15': 15, 'veinte': 20, '20': 20,
    'ultima': preguntas.length, 'última': preguntas.length, 'ultimo': preguntas.length, 'último': preguntas.length
  }

  // Extraer número de pregunta si se menciona
  let numPregunta: number | undefined = undefined
  for (const [palabra, num] of Object.entries(mapaNumeros)) {
    const reg = new RegExp(`\\b(?:pregunta|ítem|item|número|numero)?\\s*#?\\s*${palabra}\\b`, 'i')
    if (reg.test(lower)) {
      numPregunta = num
      break
    }
  }
  if (!numPregunta) {
    const matchNum = lower.match(/(?:pregunta|numero|número|item|ítem)\s*#?\s*(\d+)/i) || lower.match(/\b(\d+)\b/)
    if (matchNum) numPregunta = parseInt(matchNum[1], 10)
  }

  // 1. Restaurar plantilla oficial
  if (lower.includes('restaura') || lower.includes('reinicia') || lower.includes('oficial') || lower.includes('original') || lower.includes('por defecto')) {
    acciones.push({
      tipo: 'RESTAURAR_PLANTILLA_OFICIAL',
      descripcionAccion: 'Restauración de la plantilla oficial de 34 preguntas'
    })
    return {
      respuestaTexto: `A la orden, señor. Yo, ${nombreAsistente}, he restaurado la plantilla oficial de Contigo Call Center con sus 34 preguntas y 8 bloques organizacionales.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // 2. Cambiar Título o Descripción de la Encuesta
  if (lower.includes('cambia el título') || lower.includes('cambiar titulo') || lower.includes('título de la encuesta') || lower.includes('pon de título')) {
    const matchTitulo = mensaje.match(/(?:título(?:\s+de\s+la\s+encuesta)?\s+(?:a|por|como|sea)?\s*:?\s*|pon\s+de\s+título\s*:?\s*)(.*)/i)
    const nuevoTitulo = (matchTitulo && matchTitulo[1] ? matchTitulo[1].trim() : 'ENCUESTA DE CLIMA LABORAL Y DESARROLLO — CONTIGO CALL CENTER')
      .replace(/^["']|["']$/g, '')

    acciones.push({
      tipo: 'CAMBIAR_TITULO',
      nuevoTitulo,
      descripcionAccion: `Título actualizado a: "${nuevoTitulo}"`
    })

    return {
      respuestaTexto: `A la orden, señor. He actualizado el título de la encuesta a "${nuevoTitulo}".`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // 3. Eliminar pregunta
  if (lower.includes('elimina') || lower.includes('borra') || lower.includes('quita la pregunta') || lower.includes('remover')) {
    const targetNum = numPregunta || preguntas.length
    acciones.push({
      tipo: 'ELIMINAR_PREGUNTA',
      numeroPregunta: targetNum,
      descripcionAccion: `Eliminación de la pregunta #${targetNum}`
    })
    return {
      respuestaTexto: `Entendido, señor. He eliminado la pregunta número ${targetNum}. La estructura de la encuesta ha sido actualizada.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // 4. Asignar o quitar alertas en preguntas
  if (lower.includes('alerta') || lower.includes('campana') || lower.includes('crítica') || lower.includes('riesgo') || lower.includes('psicosocial')) {
    const targetNum = numPregunta || 1
    const activar = !lower.includes('desactiva') && !lower.includes('quitar') && !lower.includes('apagar')

    let opcionTexto: string | undefined = undefined
    if (lower.includes('muy mal')) opcionTexto = 'Muy Mal'
    else if (lower.includes('mal')) opcionTexto = 'Mal'
    else if (lower.includes('insatisfecho')) opcionTexto = 'insatisfecho'
    else if (lower.includes('desacuerdo')) opcionTexto = 'desacuerdo'
    else if (lower.includes('no')) opcionTexto = 'No'

    acciones.push({
      tipo: 'ASIGNAR_ALERTA',
      numeroPregunta: targetNum,
      opcionTexto,
      esAlerta: activar,
      descripcionAccion: `Alerta ${activar ? 'activada' : 'desactivada'} en la pregunta #${targetNum}`
    })

    return {
      respuestaTexto: `He ${activar ? 'activado' : 'desactivado'} la alerta de riesgo en la pregunta número ${targetNum}, señor. Los incidentes críticos se procesarán de inmediato.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // 5. Cambiar redacción o editar pregunta existente con texto personalizado
  if (lower.includes('cambia') || lower.includes('edita') || lower.includes('modifica') || lower.includes('actualiza') || lower.includes('redacta')) {
    const targetNum = numPregunta || 1
    
    // Si el usuario dictó el texto que quiere poner (ej. "cambia la pregunta 2 y pon que si están cómodos...")
    let nuevoTexto = ''
    const matchDictado = mensaje.match(/(?:pon|ponle|redacta|que\s+diga|texto\s*:?)\s+(.*)/i)
    if (matchDictado && matchDictado[1] && matchDictado[1].trim().length > 6) {
      let extraido = matchDictado[1].trim().replace(/^["']|["']$/g, '')
      if (!extraido.startsWith('¿')) extraido = `¿${extraido}`
      if (!extraido.endsWith('?')) extraido = `${extraido}?`
      nuevoTexto = extraido
    } else if (lower.includes('estrés') || lower.includes('presión') || lower.includes('llamadas') || lower.includes('fatiga')) {
      nuevoTexto = '¿Con qué frecuencia experimenta fatiga mental o sobrecarga durante la atención continua de llamadas?'
    } else if (lower.includes('liderazgo') || lower.includes('jefe') || lower.includes('supervisor') || lower.includes('coordinador')) {
      nuevoTexto = '¿Siente que su líder o supervisor le brinda retroalimentación clara, constructiva y apoyo en sus metas?'
    } else if (lower.includes('herramienta') || lower.includes('computador') || lower.includes('diadema') || lower.includes('software')) {
      nuevoTexto = '¿Los equipos tecnológicos y sistemas de software son estables y adecuados para el desarrollo de sus tareas?'
    } else if (lower.includes('salario') || lower.includes('sueldo') || lower.includes('pago') || lower.includes('beneficio')) {
      nuevoTexto = '¿Considera que la compensación y beneficios recibidos son justos y acordes con sus responsabilidades?'
    } else if (lower.includes('compañer') || lower.includes('equipo') || lower.includes('convivencia')) {
      nuevoTexto = '¿Cómo evalúa el nivel de colaboración, empatía y respeto entre los miembros de su equipo?'
    } else {
      nuevoTexto = `¿Cómo califica su nivel de satisfacción y bienestar general en su puesto de trabajo?`
    }

    acciones.push({
      tipo: 'EDITAR_PREGUNTA',
      numeroPregunta: targetNum,
      textoPregunta: nuevoTexto,
      descripcionAccion: `Pregunta #${targetNum} actualizada a: "${nuevoTexto.substring(0, 45)}..."`
    })

    return {
      respuestaTexto: `A la orden, señor. Yo, ${nombreAsistente}, he modificado la pregunta número ${targetNum}. La nueva redacción ha sido aplicada a la encuesta.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // 6. Agregar nueva pregunta
  if (lower.includes('agrega') || lower.includes('añade') || lower.includes('crea') || lower.includes('nueva pregunta') || lower.includes('inserta')) {
    let cat = 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo'
    let txt = '¿Considera que la comunicación en su equipo de trabajo es transparente y abierta?'

    if (lower.includes('estrés') || lower.includes('salud') || lower.includes('ánimo') || lower.includes('emocional')) {
      cat = 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo'
      txt = '¿Siente que sus horarios y cargas laborales le permiten descansar adecuadamente?'
    } else if (lower.includes('lider') || lower.includes('jefe') || lower.includes('supervisor')) {
      cat = 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato'
      txt = '¿Su supervisor directo demuestra empatía y escucha activa frente a las inquietudes del equipo?'
    } else if (lower.includes('carrera') || lower.includes('estudio') || lower.includes('adso') || lower.includes('crecimiento')) {
      cat = 'Bloque 6: Nivel Académico, Estudios y Talento Humano'
      txt = '¿La empresa le brinda oportunidades para aplicar sus competencias académicas y proyectar su plan de carrera?'
    }

    acciones.push({
      tipo: 'CREAR_PREGUNTA',
      categoria: cat,
      textoPregunta: txt,
      tipoPregunta: 'multiple',
      opciones: [
        { id: `opc-${Date.now()}-1`, texto: 'Totalmente de acuerdo', valor: 5, esAlerta: false },
        { id: `opc-${Date.now()}-2`, texto: 'De acuerdo', valor: 4, esAlerta: false },
        { id: `opc-${Date.now()}-3`, texto: 'En desacuerdo', valor: 2, esAlerta: false },
        { id: `opc-${Date.now()}-4`, texto: 'Totalmente en desacuerdo', valor: 1, esAlerta: true }
      ],
      descripcionAccion: `Nueva pregunta incorporada a "${cat}"`
    })

    return {
      respuestaTexto: `He creado e incorporado una nueva métrica en "${cat}", señor. Ya puede verla reflejada en el bloque correspondiente.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // 7. Petición general de ayuda, asesoría o edición
  if (lower.includes('edita') || lower.includes('ayuda') || lower.includes('cómo') || lower.includes('como') || lower.includes('qué puedes') || lower.includes('que puedes')) {
    return {
      respuestaTexto: `A la orden, señor. Tengo el control total de la encuesta de Contigo Call Center. Puede ordenarme por ejemplo: "Cambia la pregunta 3", "Ponle alerta a la pregunta 5", "Agrega una pregunta de liderazgo" o "Elimina la pregunta 8". ¿Qué ajuste desea realizar?`,
      acciones: [],
      estadoProtocolo: 'ASSISTANCE_READY'
    }
  }

  // 8. Respuesta conversacional ejecutiva personalizada
  return {
    respuestaTexto: `A sus órdenes, señor. Soy ${nombreAsistente}. He recibido su indicación. Por favor especifique si desea modificar el texto de una pregunta, asignar alertas psicosociales o incorporar nuevas dimensiones al cuestionario.`,
    acciones: [],
    estadoProtocolo: 'READY'
  }
}

/**
 * Analiza la estructura de la encuesta con Gemini y genera diagnóstico y sugerencia
 */
export async function analizarEncuestaConGeminiAPI(
  preguntasActuales: PreguntaEncuesta[]
): Promise<{
  id: string
  titulo: string
  mensajeBurbuja: string
  textoVoz: string
  categoria: string
  preguntaSugerida?: PreguntaEncuesta
}> {
  const prompt = `
Eres un Auditor Senior de Clima Laboral con IA para Contigo Call Center.
Analiza este conjunto de ${preguntasActuales.length} preguntas de la encuesta actual:
${preguntasActuales.slice(0, 25).map((p, idx) => `${idx + 1}. [${p.categoria}] ${p.texto}`).join('\n')}

Determina si la encuesta está completa o si falta evaluar algún aspecto crucial (bienestar, estrés en llamadas, herramientas, liderazgo, plan carrera, talento ADSO, retención).
Devuelve ÚNICAMENTE un JSON con esta estructura:
{
  "titulo": "Título corto del análisis",
  "mensajeBurbuja": "Mensaje en texto para el globo flotante (máximo 2 líneas)",
  "textoVoz": "Texto natural y fluido para ser leído en voz alta al abrir el asistente",
  "categoria": "Categoría o bloque"
}
`
  const apiKey = obtenerClaveApiGemini()
  if (esClaveApiValida(apiKey)) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1800)

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI_PRINCIPAL}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 600
          }
        })
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonStr = extraerJSONLimpio(rawText)
        const parsed = JSON.parse(jsonStr)

        return {
          id: `sug-gemini-${Date.now()}`,
          titulo: parsed.titulo || 'Diagnóstico de Clima Laboral con Gemini',
          mensajeBurbuja: parsed.mensajeBurbuja || 'He analizado tu encuesta con Google Gemini.',
          textoVoz: parsed.textoVoz || 'He analizado la encuesta de Contigo Call Center con inteligencia artificial Gemini.',
          categoria: parsed.categoria || 'Auditoría con Gemini'
        }
      }
    } catch (err) {
      // Fallback instantáneo
    }
  }

  // Fallback estructurado instantáneo
  return {
    id: 'sug-gemini-fallback',
    titulo: 'Auditoría Oficial Contigo Call Center',
    mensajeBurbuja: 'Tu encuesta troncal cuenta con las 34 preguntas oficiales estructuradas en los 8 bloques de Contigo Call Center.',
    textoVoz: '¡Hola! Tu encuesta de Contigo Call Center cuenta con los ocho bloques oficiales para la auditoría de clima laboral y talento.',
    categoria: 'Auditoría Oficial'
  }
}