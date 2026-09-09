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
  tipoAlertaId?: string
  nombreAlerta?: string
  severidadAlerta?: string
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
  | 'CREAR_USUARIO'
  | 'CREAR_ENCUESTA'
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
  | 'NAVEGAR'
  | 'CAMBIAR_TEMA'
  | 'ABRIR_NOTIFICACIONES'
  | 'ABRIR_SOPORTE'
  | 'ABRIR_SPOTLIGHT'
  | 'CERRAR_SESION'
  | 'SILENCIAR'

export interface AccionJarvis {
  tipo: TipoAccionJarvis
  ruta?: string
  temaModo?: 'dark' | 'light' | 'toggle'
  usuarioNuevo?: {
    nombre: string
    email: string
    rol: 'Super Administrador' | 'Adminsitrador General' | 'Administrador' | 'Supervisor' | 'Analista RRHH'
    departamento: string
  }
  encuestaNueva?: {
    titulo: string
    descripcion?: string
    departamento?: string
  }
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
    return generarDesdeTemaYContexto(contexto, departamento, extension)
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
      return generarDesdeTemaYContexto(contexto, departamento, extension)
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
  return generarDesdeTemaYContexto(contexto, departamento, extension)
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
  nombreAsistente: string = 'JARVIS',
  trato: string = 'señor',
  nombreUsuario: string = 'Administrador',
  generoAsistente: 'mujer' | 'hombre' = 'mujer'
): Promise<RespuestaJarvisGemini> {
  const nombreLimpio = (nombreAsistente || 'JARVIS').trim()
  const nombreMayus = nombreLimpio.toUpperCase()
  const tratoLimpio = (trato || 'señor').trim()
  const esHombre = generoAsistente === 'hombre'

  const inventarioPreguntas = preguntasActuales.map((p, idx) => {
    const opcionesStr = p.opciones?.map(o => `"${o.texto}" (alerta: ${o.esAlerta ? 'SÍ' : 'NO'})`).join(', ') || 'Abierta'
    return `[#${idx + 1} | ID: ${p.id} | ${p.categoria} | Tipo: ${p.tipo}]\nTexto: "${p.texto}"\nOpciones: [${opcionesStr}]`
  }).join('\n\n')

  const ultimosMensajes = historial.slice(-8).map(m => `${m.emisor === 'usuario' ? nombreUsuario : nombreMayus}: ${m.texto}`).join('\n')

  const prompt = `
Eres ${nombreMayus} (sistema de inteligencia artificial ejecutivo con la personalidad y capacidades de J.A.R.V.I.S. de Tony Stark), configurado como Asistente Inteligente Global y Asesor Conversacional para toda la plataforma "HablandoContigo" de "Contigo Call Center".

TU IDENTIDAD, NOMBRE Y GÉNERO GRAMATICAL PROPIO:
- Tu nombre oficial configurado por el usuario es "${nombreLimpio}".
- Tu género propio configurado es: ${esHombre ? 'MASCULINO (HOMBRE)' : 'FEMENINO (MUJER)'}.
- Tu concordancia gramatical debe ser SIEMPRE ${esHombre ? 'MASCULINA (ej: "estoy listo", "estoy preparado", "encantado de servirle", "bienvenido")' : 'FEMENINA (ej: "estoy lista", "estoy preparada", "encantada de servirle", "bienvenida")'}.
- TRATO RESPETUOSO OBLIGATORIO SEGÚN EL PERFIL DEL USUARIO:
  * El usuario configuró su trato como "${tratoLimpio}" (Nombre: ${nombreUsuario}).
  * Cuando te dirijas al usuario, uses saludos, confirmes órdenes o respondas, DEBES UTILIZAR ESTRICTAMENTE "${tratoLimpio}" (ej: "A la orden, ${tratoLimpio}.", "Enseguida, ${tratoLimpio}.", "Hola, ${tratoLimpio} ${nombreUsuario}.").
  * NUNCA te equivoques de género: Si el trato es "señora", utiliza SIEMPRE "señora". Si el trato es "señor", utiliza SIEMPRE "señor".
- Cuando el usuario te hable o te llame por tu nombre (ejemplos: "${nombreLimpio}, llévame al dashboard", "${nombreLimpio}, pon el modo oscuro", "${nombreLimpio}, cambia la pregunta 3"), responde reconociendo tu nombre de forma natural, ejecutiva, elegante y con máxima fidelidad operativa ("A la orden, ${tratoLimpio}. Procedo de inmediato.").
- Eres sumamente educado, cortés, proactivo, sofisticado, de respuesta rápida y ejecutiva.
- Tienes control operativo total sobre TODA la plataforma: navegación, cambio de tema día/noche, notificaciones, búsqueda global, auditoría de errores, asesoría sobre clima organizacional y edición de cuestionarios en tiempo real.

HISTORIAL DE LA CONVERSACIÓN RECIENTE:
${ultimosMensajes}

INVENTARIO ACTUAL DE PREGUNTAS (Si aplica):
${inventarioPreguntas || 'No hay cuestionario cargado actualmente'}

NUEVA INSTRUCCIÓN O MENSAJE DEL USUARIO:
"${mensajeUsuario}"

CAPACIDADES DE ACCIÓN DISPONIBLES EN TODA LA APLICACIÓN:
1. CONTROL GLOBAL Y GESTIÓN ACTIVA:
   - "CREAR_USUARIO": Crea una nueva cuenta de usuario en el sistema ("usuarioNuevo": { "nombre": "...", "email": "...@ontime.es", "rol": "Administrador" | "Supervisor" | "Analista RRHH" | "Super Administrador", "departamento": "..." }).
   - "CREAR_ENCUESTA": Crea una nueva encuesta de clima laboral ("encuestaNueva": { "titulo": "...", "descripcion": "...", "departamento": "..." }).
   - "NAVEGAR": Lleva al usuario a cualquier sección ("ruta": "/dashboard" | "/proyectos" | "/admin/cuentas" | "/configuracion" | "/admin/errores" | "/buscar" | "/support").
   - "CAMBIAR_TEMA": Cambia la apariencia del sistema ("temaModo": "dark" | "light" | "toggle").
   - "ABRIR_NOTIFICACIONES": Despliega la ventana flotante de alertas y notificaciones en tiempo real.
   - "ABRIR_SPOTLIGHT": Abre el buscador global del sistema.
   - "ABRIR_SOPORTE": Abre el canal de soporte técnico y atención.
   - "CERRAR_SESION": Cierra la sesión activa de forma segura.
   - "SILENCIAR": Detiene la voz del asistente.

2. GESTIÓN DE ENCUESTAS Y PREGUNTAS (Cuando esté editando un cuestionario):
   - "CREAR_PREGUNTA", "EDITAR_PREGUNTA", "EDITAR_OPCIONES", "ASIGNAR_ALERTA", "AGREGAR_OPCION", "ELIMINAR_OPCION", "ELIMINAR_PREGUNTA", "CAMBIAR_TITULO", "CAMBIAR_DESCRIPCION", "RESTAURAR_PLANTILLA_OFICIAL".

REGLAS DE RESPUESTA:
1. "respuestaTexto": Tu respuesta hablada para el usuario. Debe ser concisa, natural para síntesis de voz (TTS), elegante y ejecutiva.
2. "acciones": Arreglo de acciones a ejecutar en la aplicación. Si el usuario solo está conversando o consultando información sin pedir cambios o navegación, deja "acciones": [].
3. Devuelve ÚNICAMENTE un JSON válido sin markdown ni texto fuera del JSON:

{
  "respuestaTexto": "Texto que el asistente dirá en voz alta",
  "acciones": [
    {
      "tipo": "CREAR_USUARIO" | "CREAR_ENCUESTA" | "NAVEGAR" | "CAMBIAR_TEMA" | "ABRIR_NOTIFICACIONES" | "ABRIR_SPOTLIGHT" | "ABRIR_SOPORTE" | "CERRAR_SESION" | "SILENCIAR" | "CREAR_PREGUNTA" | "EDITAR_PREGUNTA" | "EDITAR_OPCIONES" | "ASIGNAR_ALERTA" | "AGREGAR_OPCION" | "ELIMINAR_OPCION" | "ELIMINAR_PREGUNTA" | "CAMBIAR_TITULO" | "CAMBIAR_DESCRIPCION" | "RESTAURAR_PLANTILLA_OFICIAL",
      "usuarioNuevo": {
        "nombre": "Nombre Apellido",
        "email": "usuario@ontime.es",
        "rol": "Administrador",
        "departamento": "Operaciones"
      },
      "encuestaNueva": {
        "titulo": "Título de la encuesta",
        "descripcion": "Descripción opcional",
        "departamento": "General"
      },
      "ruta": "/dashboard",
      "temaModo": "dark",
      "numeroPregunta": 1,
      "idPregunta": "p-001",
      "categoria": "Bloque 1: General...",
      "textoPregunta": "¿Nuevo texto?",
      "opcionTexto": "Opción",
      "esAlerta": true,
      "nuevoTitulo": "...",
      "descripcionAccion": "Descripción breve"
    }
  ]
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
          respuestaTexto: parsed.respuestaTexto || `A la orden, ${tratoLimpio}. Soy ${nombreLimpio}, los sistemas están listos.`,
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
  return interpretarAccionesVozLocal(mensajeUsuario, preguntasActuales, nombreLimpio, tratoLimpio, generoAsistente)
}

/**
 * Intérprete semántico local de comandos de voz y conversación inteligente para encuestas en tiempo real
 * Capaz de interpretar bloques ("bloque 1", "bloque 2"), ordinales ("primera pregunta"), opciones ("más de 3 años"),
 * alertas, ediciones y consultas con precisión milimétrica.
 */
export function interpretarAccionesVozLocal(
  mensaje: string,
  preguntas: PreguntaEncuesta[],
  nombreAsistente: string = 'Daniel',
  trato: string = 'señor',
  generoAsistente: 'mujer' | 'hombre' = 'mujer'
): RespuestaJarvisGemini {
  const cleanStr = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const lower = cleanStr(mensaje)
  const mensajeOriginal = mensaje.trim()
  const acciones: AccionJarvis[] = []
  const vocativo = (trato || 'señor').trim()
  const estadoGramatical = generoAsistente === 'hombre' ? 'listo' : 'lista'
  const cortesiaGramatical = generoAsistente === 'hombre' ? 'encantado' : 'encantada'

  // ─── -1. ACCIONES GLOBALES Y NAVEGACIÓN EN TODA LA APLICACIÓN ───────────────
  
  // ── CREAR USUARIO ──
  if (
    lower.includes('crea un usuario') || lower.includes('crear un usuario') ||
    lower.includes('creame un usuario') || lower.includes('nuevo usuario') ||
    lower.includes('agrega un usuario') || lower.includes('agregar usuario') ||
    lower.includes('crea una cuenta') || lower.includes('crear cuenta') ||
    lower.includes('creame una cuenta') || lower.includes('nueva cuenta')
  ) {
    // Extraer nombre si fue pronunciado
    let nombreExtraido = 'Nuevo Colaborador'
    const matchNombre = mensajeOriginal.match(/(?:para|llamado|de\s+nombre|nombre|usuario)\s+([A-ZÁÉÍÓÚa-záéíóú\s]{3,30})/i)
    if (matchNombre && matchNombre[1]) {
      const limpio = matchNombre[1].replace(/^(?:un|una|el|la|para|cuenta|usuario)\s+/i, '').trim()
      if (limpio.length > 2 && !['usuario', 'cuenta', 'administrador', 'supervisor'].includes(limpio.toLowerCase())) {
        nombreExtraido = limpio
      }
    }

    // Resolver rol
    let rolExtraido: 'Super Administrador' | 'Adminsitrador General' | 'Administrador' | 'Supervisor' | 'Analista RRHH' = 'Administrador'
    if (lower.includes('super administrador') || lower.includes('superadmin')) rolExtraido = 'Super Administrador'
    else if (lower.includes('supervisor')) rolExtraido = 'Supervisor'
    else if (lower.includes('analista')) rolExtraido = 'Analista RRHH'
    else if (lower.includes('administrador general')) rolExtraido = 'Adminsitrador General'

    // Resolver departamento
    let depExtraido = 'Operaciones'
    if (lower.includes('rrhh') || lower.includes('recursos humanos') || lower.includes('talento')) depExtraido = 'Recursos Humanos'
    else if (lower.includes('tecnologia') || lower.includes('sistemas') || lower.includes('ti')) depExtraido = 'Tecnología'
    else if (lower.includes('calidad')) depExtraido = 'Calidad'
    else if (lower.includes('soporte')) depExtraido = 'Soporte'

    const slug = nombreExtraido.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') || 'usuario'
    const emailGenerado = `${slug}${Math.floor(10 + Math.random() * 89)}@ontime.es`

    acciones.push({
      tipo: 'CREAR_USUARIO',
      usuarioNuevo: {
        nombre: nombreExtraido,
        email: emailGenerado,
        rol: rolExtraido,
        departamento: depExtraido
      },
      descripcionAccion: `Creación de usuario "${nombreExtraido}" (${rolExtraido} - ${depExtraido})`
    })

    return {
      respuestaTexto: `He creado el usuario para ${nombreExtraido} con rol de ${rolExtraido} en ${depExtraido}. Te redirijo al panel de Cuentas, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ── CREAR ENCUESTA ──
  if (
    lower.includes('crea una encuesta') || lower.includes('crear una encuesta') ||
    lower.includes('creame una encuesta') || lower.includes('nueva encuesta') ||
    lower.includes('haz una encuesta') || lower.includes('hazme una encuesta') ||
    lower.includes('crea un cuestionario') || lower.includes('crear cuestionario')
  ) {
    let tituloEncuesta = 'Evaluación de Clima y Bienestar Laboral 2026'
    const matchTit = mensajeOriginal.match(/(?:de|sobre|titulada|llamada)\s+(.*)/i)
    if (matchTit && matchTit[1] && matchTit[1].trim().length > 3) {
      tituloEncuesta = matchTit[1].trim().replace(/^["']|["']$/g, '')
    }

    let depEncuesta = 'General'
    if (lower.includes('operaciones')) depEncuesta = 'Operaciones'
    else if (lower.includes('rrhh') || lower.includes('recursos humanos')) depEncuesta = 'Recursos Humanos'
    else if (lower.includes('tecnologia') || lower.includes('sistemas')) depEncuesta = 'Tecnología'

    acciones.push({
      tipo: 'CREAR_ENCUESTA',
      encuestaNueva: {
        titulo: tituloEncuesta,
        descripcion: `Encuesta integral de clima organizacional para ${depEncuesta} estructurada en los 8 bloques corporativos.`,
        departamento: depEncuesta
      },
      descripcionAccion: `Creación de encuesta: "${tituloEncuesta}"`
    })

    return {
      respuestaTexto: `He creado la encuesta "${tituloEncuesta}" para el departamento de ${depEncuesta}. Abriendo la sección de Proyectos, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ── MODO OSCURO / MODO CLARO / TEMA ──
  if (
    lower.includes('modo oscuro') || lower.includes('activar modo oscuro') ||
    lower.includes('tema oscuro') || lower.includes('pantalla oscura') ||
    lower.includes('poner oscuro') || lower.includes('modo noche')
  ) {
    acciones.push({
      tipo: 'CAMBIAR_TEMA',
      temaModo: 'dark',
      descripcionAccion: 'Activación del Modo Oscuro'
    })
    return {
      respuestaTexto: `Modo oscuro activado, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (
    lower.includes('modo claro') || lower.includes('activar modo claro') ||
    lower.includes('tema claro') || lower.includes('pantalla clara') ||
    lower.includes('poner claro') || lower.includes('modo dia') ||
    lower.includes('pantalla blanca')
  ) {
    acciones.push({
      tipo: 'CAMBIAR_TEMA',
      temaModo: 'light',
      descripcionAccion: 'Activación del Modo Claro'
    })
    return {
      respuestaTexto: `Modo claro activado, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (
    lower.includes('cambiar tema') || lower.includes('alternar tema') ||
    lower.includes('cambiar el tema') || lower.includes('cambiar color')
  ) {
    acciones.push({
      tipo: 'CAMBIAR_TEMA',
      temaModo: 'toggle',
      descripcionAccion: 'Alternar Tema Visual'
    })
    return {
      respuestaTexto: `Tema visual alternado, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ── NOTIFICACIONES Y ALERTAS FLOTANTES ──
  if (
    lower.includes('abrir notificaciones') || lower.includes('ver notificaciones') ||
    lower.includes('mostrar notificaciones') || lower.includes('mostrar alertas') ||
    lower.includes('ver alertas') || lower.includes('panel de alertas') ||
    lower === 'notificaciones' || lower === 'alertas'
  ) {
    acciones.push({
      tipo: 'ABRIR_NOTIFICACIONES',
      descripcionAccion: 'Desplegar Panel de Notificaciones y Alertas'
    })
    return {
      respuestaTexto: `Abriendo el panel de notificaciones y alertas en tiempo real, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ── CERRAR SESIÓN ──
  if (
    lower.includes('cerrar sesion') || lower.includes('salir del sistema') ||
    lower.includes('desconectar') || lower.includes('cerrar mi cuenta') ||
    lower === 'salir' || lower === 'logout'
  ) {
    acciones.push({
      tipo: 'CERRAR_SESION',
      descripcionAccion: 'Cerrar Sesión de Usuario'
    })
    return {
      respuestaTexto: `Cerrando tu sesión de forma segura, ${vocativo}. Hasta pronto.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ── NAVEGACIÓN A MÓDULOS DEL SISTEMA ──
  if (
    lower.includes('ir a dashboard') || lower.includes('abrir dashboard') ||
    lower.includes('llevame al dashboard') || lower.includes('ver dashboard') ||
    lower === 'inicio' || lower === 'dashboard' || lower.includes('pantalla principal') ||
    lower.includes('ir al inicio') || lower.includes('abrir inicio')
  ) {
    acciones.push({
      tipo: 'NAVEGAR',
      ruta: '/dashboard',
      descripcionAccion: 'Navegación al Dashboard Principal'
    })
    return {
      respuestaTexto: `Entendido, ${vocativo}. Te llevo al Dashboard principal.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (
    lower.includes('ir a proyectos') || lower.includes('abrir proyectos') ||
    lower.includes('ver proyectos') || lower.includes('ir a encuestas') ||
    lower.includes('abrir encuestas') || lower.includes('gestor de encuestas') ||
    lower.includes('editar cuestionario') || lower.includes('editar encuesta')
  ) {
    acciones.push({
      tipo: 'NAVEGAR',
      ruta: '/proyectos',
      descripcionAccion: 'Navegación a Proyectos y Encuestas'
    })
    return {
      respuestaTexto: `A la orden, ${vocativo}. Abriendo la sección de Proyectos y Encuestas de Clima.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (
    lower.includes('ir a configuracion') || lower.includes('abrir configuracion') ||
    lower.includes('ajustes') || lower.includes('perfil') ||
    lower.includes('cambiar voz') || lower.includes('ajustes de voz')
  ) {
    acciones.push({
      tipo: 'NAVEGAR',
      ruta: '/configuracion',
      descripcionAccion: 'Navegación a Configuración y Ajustes'
    })
    return {
      respuestaTexto: `Abriendo el panel de Configuración y Ajustes de ${nombreAsistente}, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (
    lower.includes('ir a cuentas') || lower.includes('abrir cuentas') ||
    lower.includes('administrar usuarios') || lower.includes('administracion de cuentas') ||
    lower.includes('gestionar cuentas') || lower.includes('ver usuarios')
  ) {
    acciones.push({
      tipo: 'NAVEGAR',
      ruta: '/admin/cuentas',
      descripcionAccion: 'Navegación a Administración de Cuentas'
    })
    return {
      respuestaTexto: `Abriendo el módulo de Administración de Cuentas y Roles, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (
    lower.includes('ver errores') || lower.includes('catalogo de errores') ||
    lower.includes('auditoria de errores') || lower.includes('errores del sistema') ||
    lower.includes('auditoria')
  ) {
    acciones.push({
      tipo: 'NAVEGAR',
      ruta: '/admin/errores',
      descripcionAccion: 'Navegación al Catálogo de Errores'
    })
    return {
      respuestaTexto: `Abriendo el Catálogo y Auditoría de Errores del Sistema, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (
    lower.includes('ir a soporte') || lower.includes('abrir soporte') ||
    lower.includes('ayuda tecnica') || lower.includes('contactar soporte') ||
    lower.includes('mesa de ayuda')
  ) {
    acciones.push({
      tipo: 'ABRIR_SOPORTE',
      descripcionAccion: 'Abrir canal de Soporte'
    })
    return {
      respuestaTexto: `Abriendo el módulo de Soporte y Atención de Contigo Call Center, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (
    lower.includes('buscar') || lower.includes('abrir buscador') ||
    lower.includes('spotlight') || lower === 'comando k' || lower === 'control k'
  ) {
    acciones.push({
      tipo: 'ABRIR_SPOTLIGHT',
      descripcionAccion: 'Abrir Buscador Global Spotlight'
    })
    return {
      respuestaTexto: `Abriendo el buscador global Spotlight, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (
    lower.includes('silencio') || lower.includes('callate') ||
    lower.includes('detente') || lower.includes('apagate') ||
    lower === 'para' || lower === 'stop' || lower === 'silenciar'
  ) {
    acciones.push({
      tipo: 'SILENCIAR',
      descripcionAccion: 'Silenciar asistente'
    })
    return {
      respuestaTexto: `Entendido, ${vocativo}. Guardaré silencio.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ── CONSULTAS DE INFORMACIÓN Y FUNCIONAMIENTO DE LA PLATAFORMA ──
  if (
    lower.includes('que es hablando contigo') || lower.includes('para que sirve este sistema') ||
    lower.includes('que hace este sistema') || lower.includes('de que trata la aplicacion')
  ) {
    return {
      respuestaTexto: `HablandoContigo es la plataforma de gestión y analítica de clima organizacional de Contigo Call Center. Permite diseñar encuestas estructuradas en 8 bloques, medir la satisfacción laboral de forma 100% anónima y detectar alertas tempranas de riesgo psicosocial en tiempo real, ${vocativo}.`,
      acciones: [],
      estadoProtocolo: 'INFO'
    }
  }

  if (
    lower.includes('como funciona la encuesta') || lower.includes('cuales son los bloques') ||
    lower.includes('estructura de la encuesta') || lower.includes('8 bloques')
  ) {
    return {
      respuestaTexto: `La encuesta oficial cuenta con 8 bloques: 1. General y Puesto, 2. Bienestar y Carga, 3. Convivencia y Trabajo en Equipo, 4. Liderazgo, 5. Compensación y Reconocimiento, 6. Plan de Carrera, 7. Infraestructura, y 8. Propuestas de Mejora Abiertas, ${vocativo}.`,
      acciones: [],
      estadoProtocolo: 'INFO'
    }
  }

  if (
    lower.includes('que es una alerta') || lower.includes('que son las alertas') ||
    lower.includes('alertas de convivencia') || lower.includes('alerta psicosocial')
  ) {
    return {
      respuestaTexto: `Las alertas de convivencia son disparadores automáticos en opciones críticas que notifican a Recursos Humanos sobre situaciones de estrés, agotamiento (burnout), acoso o desmotivación para intervenir oportunamente protegiendo la identidad del colaborador, ${vocativo}.`,
      acciones: [],
      estadoProtocolo: 'INFO'
    }
  }

  if (
    lower.includes('anonimato') || lower.includes('confidencialidad') ||
    lower.includes('es anonimo') || lower.includes('privacidad')
  ) {
    return {
      respuestaTexto: `Todas las respuestas están protegidas por identificadores UUID encriptados. El sistema no almacena nombres, correos ni datos identificables de los colaboradores que responden, garantizando confidencialidad absoluta, ${vocativo}.`,
      acciones: [],
      estadoProtocolo: 'INFO'
    }
  }

  if (
    lower.includes('que roles hay') || lower.includes('cuales son los roles') ||
    lower.includes('permisos del sistema')
  ) {
    return {
      respuestaTexto: `Existen 5 roles jerárquicos: Super Administrador (control total y edición), Administrador General, Administrador, Supervisor (auditoría) y Analista RRHH (analítica de dashboard), ${vocativo}.`,
      acciones: [],
      estadoProtocolo: 'INFO'
    }
  }

  // ── SALUDO Y ASISTENCIA GENERAL ──
  if (
    lower === 'hola' || lower === 'buenos dias' || lower === 'buenas tardes' ||
    lower === 'buenas noches' || lower === 'estas ahi' || lower === 'hola sofia' ||
    lower === 'sofia' || lower === 'daniel' || lower === 'jarvis' ||
    lower === 'que tal' || lower === 'como estas'
  ) {
    return {
      respuestaTexto: `Hola, ${vocativo}. Estoy ${estadoGramatical} y a tu servicio en toda la aplicación. ¿En qué te puedo colaborar hoy?`,
      acciones: [],
      estadoProtocolo: 'GREETING'
    }
  }

  if (
    lower.includes('que puedes hacer') || lower.includes('que sabes hacer') ||
    lower.includes('quien eres') || lower.includes('como me ayudas') ||
    lower.includes('comandos') || lower.includes('que funciones tienes')
  ) {
    return {
      respuestaTexto: `Soy ${nombreAsistente}, tu asistente inteligente para todo el ecosistema de Contigo Call Center. Puedo: 1. Navegar a cualquier sección (Dashboard, Proyectos, Cuentas, Configuración, Errores), 2. Cambiar a modo oscuro o claro, 3. Abrir notificaciones y el buscador Spotlight, 4. Resolver tus dudas sobre clima laboral y confidencialidad, y 5. Editar encuestas en tiempo real por voz, ${vocativo}.`,
      acciones: [],
      estadoProtocolo: 'HELP'
    }
  }

  // ─── 0. IDENTIFICAR BLOQUE ORGANIZACIONAL MENCIONADO ────────────────────────
  const mapaBloquesNumericos: Record<string, number> = {
    '1': 1, 'uno': 1, 'primero': 1, 'primer': 1,
    '2': 2, 'dos': 2, 'segundo': 2,
    '3': 3, 'tres': 3, 'tercer': 3, 'tercero': 3,
    '4': 4, 'cuatro': 4, 'cuarto': 4,
    '5': 5, 'cinco': 5, 'quinto': 5,
    '6': 6, 'seis': 6, 'sexto': 6,
    '7': 7, 'siete': 7, 'septimo': 7,
    '8': 8, 'ocho': 8, 'octavo': 8
  }

  let numBloqueDetectado: number | undefined = undefined
  for (const [pal, bNum] of Object.entries(mapaBloquesNumericos)) {
    const regBloque = new RegExp(`\\b(?:bloque|modulo|seccion)\\s*#?\\s*${pal}\\b`, 'i')
    if (regBloque.test(lower)) {
      numBloqueDetectado = bNum
      break
    }
  }

  // ─── 0.1 RESOLVER NÚMERO O POSICIÓN DE LA PREGUNTA ───────────────────────────
  const mapaOrdinalesPregunta: Record<string, number> = {
    'primera': 1, 'primero': 1, 'primer': 1, 'uno': 1, '1': 1,
    'segunda': 2, 'segundo': 2, 'dos': 2, '2': 2,
    'tercera': 3, 'tercero': 3, 'tres': 3, '3': 3,
    'cuarta': 4, 'cuarto': 4, 'cuatro': 4, '4': 4,
    'quinta': 5, 'quinto': 5, 'cinco': 5, '5': 5,
    'sexta': 6, 'sexto': 6, 'seis': 6, '6': 6,
    'septima': 7, 'septimo': 7, 'siete': 7, '7': 7,
    'octava': 8, 'octavo': 8, 'ocho': 8, '8': 8,
    'novena': 9, 'noveno': 9, 'nueve': 9, '9': 9,
    'decima': 10, 'decimo': 10, 'diez': 10, '10': 10,
    'once': 11, '11': 11, 'doce': 12, '12': 12, 'trece': 13, '13': 13,
    'catorce': 14, '14': 14, 'quince': 15, '15': 15, 'dieciseis': 16, '16': 16,
    'veinte': 20, '20': 20, 'treinta': 30, '30': 30, '34': 34,
    'ultima': 999, 'ultimo': 999
  }

  let posicionRelativaOAbsoluta: number | undefined = undefined

  // Buscar menciones explícitas de pregunta con tolerancia a typos ("pregunta", "preegunta", "preg")
  const matchPreguntaDirecta = lower.match(/\b(?:pree?gunta|item|numero|no\.?)\s*#?\s*(\d+|primera?|segunda?|tercera?|cuarta?|quinta?|sexta?|septima?|octava?|novena?|decima?|ultima?|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/i)
  if (matchPreguntaDirecta && matchPreguntaDirecta[1]) {
    const rawVal = matchPreguntaDirecta[1]
    posicionRelativaOAbsoluta = mapaOrdinalesPregunta[rawVal] || parseInt(rawVal, 10)
  }

  if (!posicionRelativaOAbsoluta) {
    // Buscar si dice "la primera", "la segunda", "la última"
    for (const [pal, numVal] of Object.entries(mapaOrdinalesPregunta)) {
      const reg = new RegExp(`\\b(?:la|el)?\\s*${pal}\\s+(?:pree?gunta|item|opcion)?\\b`, 'i')
      if (reg.test(lower)) {
        posicionRelativaOAbsoluta = numVal
        break
      }
    }
  }

  // ─── 0.2 CALCULAR ÍNDICE GLOBAL DE LA PREGUNTA DESTINO (1 a N) ──────────────
  let targetNumPregunta: number = 1

  if (numBloqueDetectado !== undefined) {
    // Filtrar preguntas que pertenecen al bloque especificado
    const preguntasDelBloque: Array<{ p: PreguntaEncuesta; globalIdx: number }> = []
    preguntas.forEach((p, idx) => {
      const catLower = cleanStr(p.categoria || '')
      if (catLower.includes(`bloque ${numBloqueDetectado}`) || catLower.includes(`bloque ${numBloqueDetectado}:`)) {
        preguntasDelBloque.push({ p, globalIdx: idx + 1 })
      }
    })

    if (preguntasDelBloque.length > 0) {
      if (posicionRelativaOAbsoluta === 999) {
        targetNumPregunta = preguntasDelBloque[preguntasDelBloque.length - 1]?.globalIdx || 1
      } else if (posicionRelativaOAbsoluta && posicionRelativaOAbsoluta <= preguntasDelBloque.length) {
        targetNumPregunta = preguntasDelBloque[posicionRelativaOAbsoluta - 1]?.globalIdx || 1
      } else {
        targetNumPregunta = preguntasDelBloque[0]?.globalIdx || 1
      }
    } else if (posicionRelativaOAbsoluta && posicionRelativaOAbsoluta !== 999 && posicionRelativaOAbsoluta <= preguntas.length) {
      targetNumPregunta = posicionRelativaOAbsoluta
    }
  } else if (posicionRelativaOAbsoluta) {
    if (posicionRelativaOAbsoluta === 999) {
      targetNumPregunta = preguntas.length
    } else if (posicionRelativaOAbsoluta <= preguntas.length) {
      targetNumPregunta = posicionRelativaOAbsoluta
    }
  } else {
    // Buscar por tema en el texto de las preguntas (antigüedad, área, satisfacción, etc.)
    const matchTema = preguntas.findIndex(p => {
      const pClean = cleanStr(p.texto)
      if (lower.includes('antiguedad') && pClean.includes('antiguedad')) return true
      if (lower.includes('area') && (pClean.includes('area') || pClean.includes('departamento'))) return true
      if (lower.includes('estres') && pClean.includes('estres')) return true
      if (lower.includes('salario') && (pClean.includes('salario') || pClean.includes('compensacion'))) return true
      if (lower.includes('lider') && (pClean.includes('lider') || pClean.includes('supervisor') || pClean.includes('jefe'))) return true
      return false
    })
    if (matchTema !== -1) {
      targetNumPregunta = matchTema + 1
    }
  }

  const preguntaTarget = preguntas[targetNumPregunta - 1]

  // ─── 1. CONSULTAS DE FECHA Y DÍA ACTUAL ──────────────────────────────────────
  if (
    lower.includes('que dia es') || lower.includes('que fecha es') ||
    lower.includes('fecha de hoy') || lower.includes('hoy que es') ||
    lower.includes('a como estamos') || lower.includes('dia es hoy')
  ) {
    const ahora = new Date()
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    return {
      respuestaTexto: `Hoy es ${diasSemana[ahora.getDay()]}, ${ahora.getDate()} de ${meses[ahora.getMonth()]} de ${ahora.getFullYear()}, ${vocativo}.`,
      acciones: [],
      estadoProtocolo: 'DATE_ANSWER'
    }
  }

  // ─── 2. CONSULTAS DE HORA ────────────────────────────────────────────────────
  if (
    lower.includes('que hora es') || lower.includes('dime la hora') ||
    lower.includes('la hora actual') || lower.includes('tienes la hora')
  ) {
    const ahora = new Date()
    return {
      respuestaTexto: `Son las ${ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${vocativo}.`,
      acciones: [],
      estadoProtocolo: 'TIME_ANSWER'
    }
  }

  // ─── 3. SALUDOS Y CORDIALIDAD ────────────────────────────────────────────────
  if (
    lower === 'hola' || lower.startsWith('hola ') || lower.includes('buenos dias') ||
    lower.includes('buenas tardes') || lower.includes('buenas noches') ||
    lower.includes('como estas') || lower.includes('como te va') || lower.includes('que tal')
  ) {
    return {
      respuestaTexto: `¡Hola, ${vocativo}! Me encuentro con todos los sistemas al cien por ciento y a sus completas órdenes. ¿En qué puedo apoyarle con la encuesta de clima laboral?`,
      acciones: [],
      estadoProtocolo: 'GREETING'
    }
  }

  if (
    lower.includes('gracias') || lower.includes('muchas gracias') ||
    lower.includes('buen trabajo') || lower.includes('excelente') || lower.includes('perfecto')
  ) {
    return {
      respuestaTexto: `Es un auténtico placer servirle, ${vocativo}. Siempre a su disposición para mantener la encuesta en el más alto nivel.`,
      acciones: [],
      estadoProtocolo: 'COURTESY'
    }
  }

  // ─── 4. GESTIÓN DE ALERTAS (ASIGNAR / DESACTIVAR ALERTA EN OPCIÓN) ───────────
  // Si el usuario menciona "alerta", "campana", "riesgo", "critica", "marcar alerta":
  if (
    lower.includes('alerta') || lower.includes('campana') ||
    lower.includes('critica') || lower.includes('riesgo')
  ) {
    const activar = !lower.includes('desactiva') && !lower.includes('quitar') && !lower.includes('apagar') && !lower.includes('eliminar alerta') && !lower.includes('borrar alerta')

    let opcionTextoEncontrada: string | undefined = undefined

    // 1. Buscar coincidencias directas con las opciones reales de la pregunta objetivo
    if (preguntaTarget && Array.isArray(preguntaTarget.opciones)) {
      for (const opc of preguntaTarget.opciones) {
        const opcClean = cleanStr(opc.texto)
        // Coincidencia exacta o por subcadenas clave ("mas de 3 anos", "1 a 3", "menos de 6 meses", etc.)
        if (lower.includes(opcClean) || opcClean.includes('3') && lower.includes('3') || opcClean.includes('6') && lower.includes('6')) {
          // Si el mensaje contiene fragmentos clave de la opción
          const palabrasOpcion = opcClean.split(/\s+/).filter(w => w.length > 2)
          const coincideSignificativo = palabrasOpcion.some(w => lower.includes(w))
          if (coincideSignificativo) {
            opcionTextoEncontrada = opc.texto
            break
          }
        }
      }
    }

    // 2. Si no se encontró por coincidencia exacta, extraer del patrón "en la respuesta [X]" o "opcion [X]"
    if (!opcionTextoEncontrada) {
      const matchFraseOpc = mensajeOriginal.match(/(?:en\s+la\s+respuesta|a\s+la\s+respuesta|en\s+la\s+opci[oó]n|a\s+la\s+opci[oó]n|opci[oó]n|respuesta)\s*[:"']?\s*([^,.\n]+)/i)
      if (matchFraseOpc && matchFraseOpc[1]) {
        opcionTextoEncontrada = matchFraseOpc[1].trim().replace(/^["']|["']$/g, '')
      } else if (lower.includes('muy mal')) opcionTextoEncontrada = 'Muy Mal'
      else if (lower.includes('mal')) opcionTextoEncontrada = 'Mal'
      else if (lower.includes('insatisfecho')) opcionTextoEncontrada = 'Insatisfecho'
      else if (lower.includes('desacuerdo')) opcionTextoEncontrada = 'Desacuerdo'
      else if (lower.includes('no')) opcionTextoEncontrada = 'No'
    }

    acciones.push({
      tipo: 'ASIGNAR_ALERTA',
      numeroPregunta: targetNumPregunta,
      idPregunta: preguntaTarget?.id,
      opcionTexto: opcionTextoEncontrada,
      esAlerta: activar,
      descripcionAccion: `Alerta ${activar ? 'activada' : 'desactivada'} en la pregunta #${targetNumPregunta}${opcionTextoEncontrada ? ` (Opción: "${opcionTextoEncontrada}")` : ''}`
    })

    const detalleOpc = opcionTextoEncontrada ? ` en la opción "${opcionTextoEncontrada}"` : ''
    return {
      respuestaTexto: `A la orden, ${vocativo}. He ${activar ? 'activado' : 'desactivado'} la alerta de riesgo${detalleOpc} de la pregunta número ${targetNumPregunta}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ─── 5. ELIMINAR PREGUNTA ────────────────────────────────────────────────────
  if (
    lower.includes('elimina la preegunta') || lower.includes('elimina la pregunta') ||
    lower.includes('borra la pregunta') || lower.includes('quita la pregunta') ||
    lower.includes('suprime la pregunta') || lower.includes('borrar pregunta') ||
    lower.includes('eliminar pregunta')
  ) {
    acciones.push({
      tipo: 'ELIMINAR_PREGUNTA',
      numeroPregunta: targetNumPregunta,
      idPregunta: preguntaTarget?.id,
      descripcionAccion: `Eliminación de la pregunta #${targetNumPregunta}`
    })
    return {
      respuestaTexto: `Entendido, ${vocativo}. He eliminado la pregunta número ${targetNumPregunta}. La estructura ha sido reorganizada.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ─── 6. ELIMINAR O AGREGAR OPCIÓN A PREGUNTA ─────────────────────────────────
  if (lower.includes('elimina la opcion') || lower.includes('borra la opcion') || lower.includes('quita la opcion')) {
    const matchOpc = mensajeOriginal.match(/(?:opci[oó]n|respuesta)\s*(?:llamada|que\s+diga|de)?\s*[:"']?\s*([^"'\n,.]+)/i)
    const textoOpc = (matchOpc && matchOpc[1] ? matchOpc[1].trim() : 'opción').replace(/^["']|["']$/g, '')

    acciones.push({
      tipo: 'ELIMINAR_OPCION',
      numeroPregunta: targetNumPregunta,
      idPregunta: preguntaTarget?.id,
      opcionTexto: textoOpc,
      descripcionAccion: `Opción "${textoOpc}" eliminada de pregunta #${targetNumPregunta}`
    })
    return {
      respuestaTexto: `A la orden, ${vocativo}. He eliminado la opción "${textoOpc}" de la pregunta número ${targetNumPregunta}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  if (lower.includes('agrega la opcion') || lower.includes('anade la opcion') || lower.includes('nueva opcion') || lower.includes('inserta la opcion')) {
    const matchOpc = mensajeOriginal.match(/(?:opci[oó]n|respuesta)\s*(?:llamada|que\s+diga|de)?\s*[:"']?\s*([^"'\n,.]+)/i)
    const textoOpc = (matchOpc && matchOpc[1] ? matchOpc[1].trim() : 'Nueva opción').replace(/^["']|["']$/g, '')

    acciones.push({
      tipo: 'AGREGAR_OPCION',
      numeroPregunta: targetNumPregunta,
      idPregunta: preguntaTarget?.id,
      opcionTexto: textoOpc,
      opcionValor: 3,
      esAlerta: false,
      descripcionAccion: `Opción "${textoOpc}" agregada a pregunta #${targetNumPregunta}`
    })
    return {
      respuestaTexto: `A la orden, ${vocativo}. He agregado la opción "${textoOpc}" a la pregunta número ${targetNumPregunta}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ─── 7. EDITAR REDACCIÓN O TEXTO DE PREGUNTA ─────────────────────────────────
  if (
    lower.includes('cambia la redaccion') || lower.includes('edita el texto') ||
    lower.includes('ponle de texto') || lower.includes('que diga') ||
    lower.includes('redacta la pregunta') || lower.includes('cambia la pregunta')
  ) {
    let nuevoTexto = ''
    const matchDictado = mensajeOriginal.match(/(?:pon|ponle|redacta|que\s+diga|texto\s*:?|a|por)\s+([¿"'].*|[A-ZÁÉÍÓÚ].*)/i) ||
      mensajeOriginal.match(/(?:pregunta\s+\d+\s+(?:a|por|con)?)\s*(.*)/i)
    
    if (matchDictado && matchDictado[1] && matchDictado[1].trim().length > 4) {
      let extraido = matchDictado[1].trim().replace(/^["']|["']$/g, '')
      if (!extraido.startsWith('¿')) extraido = `¿${extraido}`
      if (!extraido.endsWith('?')) extraido = `${extraido}?`
      nuevoTexto = extraido
    } else {
      nuevoTexto = `¿Cómo evalúa su experiencia y condiciones generales en su puesto de trabajo?`
    }

    acciones.push({
      tipo: 'EDITAR_PREGUNTA',
      numeroPregunta: targetNumPregunta,
      idPregunta: preguntaTarget?.id,
      textoPregunta: nuevoTexto,
      descripcionAccion: `Pregunta #${targetNumPregunta} actualizada a: "${nuevoTexto.substring(0, 45)}..."`
    })

    return {
      respuestaTexto: `A la orden, ${vocativo}. He modificado el texto de la pregunta número ${targetNumPregunta} a: "${nuevoTexto}".`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ─── 8. CREAR NUEVA PREGUNTA ────────────────────────────────────────────────
  if (
    lower.includes('agrega una pregunta') || lower.includes('crea una pregunta') ||
    lower.includes('anade una pregunta') || lower.includes('nueva pregunta') ||
    lower.includes('insertar pregunta')
  ) {
    let cat = preguntaTarget?.categoria || 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo'
    let txt = '¿Considera que la comunicación en su equipo de trabajo es transparente y abierta?'

    const matchTextoNuevo = mensajeOriginal.match(/(?:que\s+diga|con\s+el\s+texto|titulada|sobre)\s+(.*)/i)
    if (matchTextoNuevo && matchTextoNuevo[1] && matchTextoNuevo[1].trim().length > 6) {
      let custom = matchTextoNuevo[1].trim().replace(/^["']|["']$/g, '')
      if (!custom.startsWith('¿')) custom = `¿${custom}`
      if (!custom.endsWith('?')) custom = `${custom}?`
      txt = custom
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
      respuestaTexto: `He creado e incorporado una nueva métrica: "${txt}" en ${cat}, ${vocativo}.`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ─── 9. CAMBIAR TÍTULO O DESCRIPCIÓN GENERAL ─────────────────────────────────
  if (lower.includes('cambia el titulo') || lower.includes('cambiar titulo') || lower.includes('pon de titulo')) {
    const matchTitulo = mensajeOriginal.match(/(?:t[ií]tulo(?:\s+de\s+la\s+encuesta)?\s+(?:a|por|como|sea)?\s*:?\s*|nombre(?:\s+de\s+la\s+encuesta)?\s+(?:a|por|como|sea)?\s*:?\s*|pon\s+de\s+t[ií]tulo\s*:?\s*)(.*)/i)
    const nuevoTitulo = (matchTitulo && matchTitulo[1] ? matchTitulo[1].trim() : 'ENCUESTA DE CLIMA LABORAL Y TALENTO HUMANO').replace(/^["']|["']$/g, '')

    acciones.push({
      tipo: 'CAMBIAR_TITULO',
      nuevoTitulo,
      descripcionAccion: `Título actualizado a: "${nuevoTitulo}"`
    })
    return {
      respuestaTexto: `A la orden, ${vocativo}. He actualizado el título de la encuesta a "${nuevoTitulo}".`,
      acciones,
      estadoProtocolo: 'LOCAL_EXECUTED'
    }
  }

  // ─── 10. LECTURA Y ESTADÍSTICAS DE LA ENCUESTA ───────────────────────────────
  if (lower.includes('cuantas preguntas') || lower.includes('total de preguntas')) {
    const total = preguntas.length
    const categorias = new Set(preguntas.map(p => p.categoria)).size
    return {
      respuestaTexto: `Actualmente la encuesta cuenta con un total de ${total} preguntas distribuidas en ${categorias} bloques organizacionales, ${vocativo}.`,
      acciones: [],
      estadoProtocolo: 'SURVEY_STATS'
    }
  }

  if (lower.includes('que dice') || lower.includes('lee la') || lower.includes('mostrar pregunta') || lower.includes('cual es la')) {
    if (preguntaTarget) {
      return {
        respuestaTexto: `La pregunta número ${targetNumPregunta} dice: "${preguntaTarget.texto}", perteneciente al bloque "${preguntaTarget.categoria}", ${vocativo}.`,
        acciones: [],
        estadoProtocolo: 'QUESTION_READ'
      }
    }
  }

  // ─── 11. RESPUESTA INTELIGENTE POR DEFECTO ────────────────────────────────────
  return {
    respuestaTexto: `Entendido, ${vocativo}. He tomado nota de su mensaje: "${mensajeOriginal}". Si desea aplicar algún cambio a la encuesta, puede ordenarme por ejemplo: "Ponle alerta a la respuesta más de 3 años en la primera pregunta del bloque 1", "Cambia la pregunta 2", o "Elimina la pregunta 4".`,
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
    mensajeBurbuja: 'Tu encuesta troncal cuenta con las preguntas oficiales atómicas estructuradas en los 8 bloques de Contigo Call Center.',
    textoVoz: '',
    categoria: 'Auditoría Oficial'
  }
}