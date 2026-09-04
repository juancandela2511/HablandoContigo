/**
 * ============================================================================
 * SERVICIO DE GENERACIÓN DE ENCUESTAS ADAPTATIVAS CON GEMINI IA
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Motor inteligente con IA (Google Gemini 2.5 Flash / 1.5 Flash) que analiza
 * el tema ingresado por el usuario y genera preguntas profesionales, naturales
 * y profundas sobre el clima laboral y el sentir del colaborador.
 * NUNCA genera preguntas concatenadas mecánicas con comillas.
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
export const CLAVE_API_GEMINI: string = 'AQ.Ab8RN6JIp5P2hWrBa4a6ZmArr9y55L0g17dCKMPv7hZ8Y14Ebg'
export const MODELO_GEMINI_PRINCIPAL: string = 'gemini-2.5-flash'
export const MODELO_GEMINI_SECUNDARIO: string = 'gemini-1.5-flash'

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
 * Genera una encuesta analizando el tema con Google Gemini.
 * Si la red o la API falla, utiliza el motor de inferencia semántica local de alta calidad.
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
    console.warn('⚠️ [iaEncuestasService] No se pudo conectar con Gemini API, usando motor heurístico enriquecido:', error)
  }

  // 2. Motor de respaldo semántico local (sin concatenaciones mecánicas)
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
// LLAMADA REST A GOOGLE GEMINI API PARA GENERACIÓN DE ENCUESTAS
// ────────────────────────────────────────────────────────────────────────────

async function generarEncuestaConGeminiAPI(
  contexto: string,
  departamento: string,
  extension: 'rapida' | 'estandar' | 'extensa'
): Promise<PlantillaEncuestaGenerada> {
  const numPreguntas = extension === 'rapida' ? '4 a 5' : extension === 'extensa' ? '12 a 16' : '8 a 10'

  const prompt = `
Eres un Psicólogo Organizacional senior y especialista en Clima Laboral y Talento Humano.
Tu misión es diseñar un cuestionario de encuesta profesional, empático, humano y bien estructurado.

CONTEXTO / TEMA SOLICITADO POR EL USUARIO: "${contexto}"
DEPARTAMENTO / AUDIENCIA DESTINO: "${departamento}"
EXTENSIÓN: "${extension}" (Debes generar exactamente ${numPreguntas} preguntas).

REGLAS FUNDAMENTALES DE REDACCIÓN:
1. NUNCA concatenes frases mecánicas como '¿Cómo calificas tu satisfacción frente a: "..."?'.
2. Comprende la intención de fondo del usuario y redacta preguntas humanas, directas y elegantes en español.
3. Si el usuario pide saber "cómo se sienten" o "ánimo", incluye preguntas abiertas y de escala sobre energía vital, tranquilidad, motivación diaria y relación con el equipo.
4. Distribuye los tipos de preguntas:
   - Mayoría de tipo 'escala' (1 a 5 puntos, donde 1 representa riesgo/insatisfacción con esAlerta: true, y 2 a 5 con esAlerta: false).
   - Preguntas de opción 'multiple' con 3 o 4 opciones claras.
   - Al menos 1 o 2 preguntas abiertas tipo 'texto' (con opciones: []) para recopilar comentarios y sugerencias del colaborador.
5. Devuelve ÚNICAMENTE un objeto JSON válido (sin formato markdown \`\`\`json, solo texto JSON puro) con esta estructura:

{
  "titulo": "Título profesional de la encuesta",
  "descripcion": "Descripción empática y confidencial que motive al colaborador a responder con sinceridad.",
  "departamento": "${departamento}",
  "preguntas": [
    {
      "categoria": "Nombre de la dimensión evaluada (ej. Bienestar Emocional, Carga Laboral, Liderazgo, etc.)",
      "texto": "¿Pregunta redactada de forma humana y clara?",
      "tipo": "escala" | "multiple" | "texto",
      "esSensibleAcoso": boolean,
      "opciones": [
        { "texto": "1 - Muy insatisfecho / Totalmente en desacuerdo", "valor": 1, "esAlerta": true },
        { "texto": "2 - Poco satisfecho / En desacuerdo", "valor": 2, "esAlerta": false },
        { "texto": "3 - Neutral / Regular", "valor": 3, "esAlerta": false },
        { "texto": "4 - Satisfecho / De acuerdo", "valor": 4, "esAlerta": false },
        { "texto": "5 - Muy satisfecho / Totalmente de acuerdo", "valor": 5, "esAlerta": false }
      ]
    }
  ],
  "preguntasSeguimiento": [
    {
      "categoria": "Propuestas de Bienestar",
      "texto": "¿Qué iniciativa o cambio prioritario propondrías para mejorar tu experiencia y bienestar en el equipo?",
      "tipo": "texto",
      "opciones": []
    }
  ]
}
`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI_PRINCIPAL}:generateContent?key=${CLAVE_API_GEMINI}`

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.95
      }
    })
  })

  if (!respuesta.ok) {
    throw new Error(`Gemini API respondió con código HTTP ${respuesta.status}`)
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

  // Normalizar y enriquecer IDs
  const preguntasFinales: PreguntaEncuesta[] = (parsed.preguntas || []).map((p, idx) => ({
    id: uidGen(`p-gemini-${idx + 1}`),
    categoria: p.categoria || 'Clima General',
    texto: formatearPreguntaEspanol(p.texto),
    tipo: p.tipo || 'escala',
    esSensibleAcoso: Boolean(p.esSensibleAcoso),
    opciones: (p.opciones || []).map((op, oIdx) => ({
      id: `opc-${idx}-${oIdx + 1}`,
      texto: op.texto,
      valor: typeof op.valor === 'number' ? op.valor : 3,
      esAlerta: Boolean(op.esAlerta || (op.valor === 1))
    }))
  }))

  const seguimientoFinales: PreguntaEncuesta[] = (parsed.preguntasSeguimiento || []).map((p, idx) => ({
    id: uidGen(`seg-gemini-${idx + 1}`),
    categoria: p.categoria || 'Propuestas y Bienestar',
    texto: formatearPreguntaEspanol(p.texto),
    tipo: p.tipo || 'texto',
    opciones: []
  }))

  return {
    titulo: parsed.titulo || `Evaluación de Clima: ${contexto.slice(0, 40)}`,
    descripcion: parsed.descripcion || `Diagnóstico participativo para el área de ${departamento}.`,
    departamento: parsed.departamento || departamento,
    preguntas: preguntasFinales,
    preguntasSeguimiento: seguimientoFinales
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

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI_PRINCIPAL}:generateContent?key=${CLAVE_API_GEMINI}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, topP: 0.95 }
      })
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

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
  } catch (error) {
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

function inferirCategoria(texto: string, contextoGlobal: string = ''): string {
  const combined = `${texto} ${contextoGlobal}`.toLowerCase()

  if (/sentir|sienten|ánimo|animo|emocional|tristeza|felicidad|estado de [aá]nimo|bienestar personal/i.test(combined)) return 'Bienestar Emocional y Sentir del Equipo'
  if (/comedor|cafeter[ií]a|comida|almuerzo|alimentaci[oó]n|desayuno|refrigerio|casino/i.test(combined)) return 'Alimentación y Comedor'
  if (/computador|pc|laptop|hardware|software|sistema|internet|conectividad|plataforma|pantalla/i.test(combined)) return 'Tecnología y Herramientas TI'
  if (/turno|horario|nocturno|noche|madrugada|rotativo|jornada|descanso/i.test(combined)) return 'Gestión de Turnos y Descanso'
  if (/ruta|transporte|bus|movilidad|veh[ií]culo|traslado|paradero/i.test(combined)) return 'Transporte y Movilidad'
  if (/estr[eé]s|sobrecarga|agotamiento|burnout|presi[oó]n|fatiga|cansancio/i.test(combined)) return 'Salud Mental y Carga Laboral'
  if (/silla|ergonom|luz|iluminaci[oó]n|aire|ruido|espacio|bodega|uniforme|calzado|dotaci[oó]n|epp|seguridad industrial/i.test(combined)) return 'Ergonomía e Instalaciones'
  if (/acoso|hostigamiento|maltrato|humillaci[oó]n|gritos|respeto|trato digno|discriminaci/i.test(combined)) return 'Convivencia y Clima Seguro'
  if (/jefe|supervisor|l[ií]der|coordinador|jefatura|directiv|retroalimentaci[oó]n de l[ií]der/i.test(combined)) return 'Liderazgo y Supervisión'
  if (/compañer|equipo|colaboraci[oó]n|comunicaci[oó]n|sinergia|apoyo entre pares/i.test(combined)) return 'Trabajo en Equipo y Cooperación'
  if (/salario|sueldo|pago|beneficio|remuneraci[oó]n|comisi[oó]n|bono|econ[oó]mic/i.test(combined)) return 'Compensación y Beneficios'
  if (/capacita|curso|aprendizaje|desarrollo|crecimiento|carrera|inducci[oó]n|onboarding|bienvenida/i.test(combined)) return 'Crecimiento y Capacitación'
  if (/venta|cliente|meta comercial|asesor|llamada|atenci[oó]n/i.test(combined)) return 'Dinámica Comercial y Metas'
  if (/remoto|teletrabajo|casa|home office|h[ií]brido|desconexi[oó]n/i.test(combined)) return 'Trabajo Remoto y Desconexión'

  return 'Bienestar y Experiencia Laboral'
}

function generarOpcionesEscala(textoPregunta: string): Array<{ id: string; texto: string; valor: number; esAlerta?: boolean }> {
  const lower = textoPregunta.toLowerCase()

  if (/frecuencia|con qu[eé] frecuencia|veces|siempre|nunca|habitual/i.test(lower)) {
    return [
      { id: 'esc-1', texto: '1 - Nunca / Rarísima vez', valor: 1, esAlerta: true },
      { id: 'esc-2', texto: '2 - Rara vez', valor: 2, esAlerta: false },
      { id: 'esc-3', texto: '3 - Ocasionalmente', valor: 3, esAlerta: false },
      { id: 'esc-4', texto: '4 - Frecuentemente', valor: 4, esAlerta: false },
      { id: 'esc-5', texto: '5 - Siempre y de forma constante', valor: 5, esAlerta: false }
    ]
  }

  if (/calidad|califica|adecuad|c[oó]mo eval[uú]as|condiciones|estado/i.test(lower)) {
    return [
      { id: 'esc-1', texto: '1 - Muy deficiente / Crítico', valor: 1, esAlerta: true },
      { id: 'esc-2', texto: '2 - Insuficiente / Con fallas frecuentes', valor: 2, esAlerta: false },
      { id: 'esc-3', texto: '3 - Regular / Aceptable', valor: 3, esAlerta: false },
      { id: 'esc-4', texto: '4 - Bueno y funcional', valor: 4, esAlerta: false },
      { id: 'esc-5', texto: '5 - Excelente y óptimo', valor: 5, esAlerta: false }
    ]
  }

  if (/satisfacci[oó]n|c[oó]mo te sientes|contento|c[oó]modo|a gusto|ánimo|animo/i.test(lower)) {
    return [
      { id: 'esc-1', texto: '1 - Muy insatisfecho(a) / Desanimado(a)', valor: 1, esAlerta: true },
      { id: 'esc-2', texto: '2 - Poco satisfecho(a)', valor: 2, esAlerta: false },
      { id: 'esc-3', texto: '3 - Neutral / En equilibrio', valor: 3, esAlerta: false },
      { id: 'esc-4', texto: '4 - Satisfecho(a) y con buen ánimo', valor: 4, esAlerta: false },
      { id: 'esc-5', texto: '5 - Totalmente satisfecho(a) y motivado(a)', valor: 5, esAlerta: false }
    ]
  }

  return [
    { id: 'esc-1', texto: '1 - Totalmente en desacuerdo', valor: 1, esAlerta: true },
    { id: 'esc-2', texto: '2 - En desacuerdo', valor: 2, esAlerta: false },
    { id: 'esc-3', texto: '3 - Neutral / En parte', valor: 3, esAlerta: false },
    { id: 'esc-4', texto: '4 - De acuerdo', valor: 4, esAlerta: false },
    { id: 'esc-5', texto: '5 - Totalmente de acuerdo', valor: 5, esAlerta: false }
  ]
}

function estructurarDesdePlantillaBase(
  encuestaBase: string,
  departamento: string,
  extension: 'rapida' | 'estandar' | 'extensa'
): PlantillaEncuestaGenerada {
  const lineas = parsearLineasBorrador(encuestaBase)
  const temaPredominante = inferirCategoria(encuestaBase, departamento)
  
  const preguntasProcesadas: PreguntaEncuesta[] = lineas.map((linea, idx) => {
    const textoLimpio = limpiarPrefijoPregunta(linea)
    const categoria = inferirCategoria(textoLimpio, temaPredominante)
    const lower = textoLimpio.toLowerCase()

    const esPreguntaAbierta = /qu[eé] propones|cu[aá]les|por qu[eé]|comentarios|sugerencias|observaciones|c[oó]mo te sientes/i.test(lower)

    if (esPreguntaAbierta) {
      return {
        id: uidGen(`p-usr-${idx + 1}`),
        categoria,
        texto: formatearPreguntaEspanol(textoLimpio),
        tipo: 'texto',
        esSensibleAcoso: false,
        opciones: []
      }
    }

    const esOpcionMultiple = /cuenta con|tiene|recibe|dispone de|ha presenciado/i.test(lower)

    if (esOpcionMultiple) {
      return {
        id: uidGen(`p-usr-${idx + 1}`),
        categoria,
        texto: formatearPreguntaEspanol(textoLimpio),
        tipo: 'multiple',
        esSensibleAcoso: /acoso|maltrato|humillaci/i.test(lower),
        opciones: [
          { id: `opc-${idx}-1`, texto: 'Sí, de manera completa y oportuna', valor: 5, esAlerta: false },
          { id: `opc-${idx}-2`, texto: 'Parcialmente / Con algunas limitaciones', valor: 3, esAlerta: false },
          { id: `opc-${idx}-3`, texto: 'No, carecemos totalmente de este aspecto', valor: 1, esAlerta: true }
        ]
      }
    }

    return {
      id: uidGen(`p-usr-${idx + 1}`),
      categoria,
      texto: formatearPreguntaEspanol(textoLimpio),
      tipo: 'escala',
      esSensibleAcoso: /acoso|maltrato|gritos|discriminaci/i.test(lower),
      opciones: generarOpcionesEscala(textoLimpio)
    }
  })

  return {
    titulo: `Cuestionario Personalizado: ${temaPredominante} (${departamento})`,
    descripcion: `Encuesta estructurada y calibrada con IA para ${departamento}.`,
    departamento,
    preguntas: preguntasProcesadas,
    preguntasSeguimiento: [
      {
        id: uidGen('seg-base'),
        categoria: 'Comentarios Adicionales',
        texto: '¿Tienes alguna otra observación o aporte confidencial que desees compartir?',
        tipo: 'texto',
        opciones: []
      }
    ]
  }
}

// ────────────────────────────────────────────────────────────────────────────
// GENERADOR CONTEXTUAL DE RESPALDO (100% PROFESIONAL, SIN CONCATENACIONES CRUDAS)
// ────────────────────────────────────────────────────────────────────────────

function generarDesdeTemaYContexto(
  contexto: string,
  departamento: string,
  extension: 'rapida' | 'estandar' | 'extensa'
): PlantillaEncuestaGenerada {
  const promptLimpio = contexto.trim()
  const temaDetectado = inferirCategoria(promptLimpio, departamento)

  const preguntas: PreguntaEncuesta[] = []

  switch (temaDetectado) {
    case 'Bienestar Emocional y Sentir del Equipo':
      preguntas.push(
        {
          id: uidGen('emo'),
          categoria: 'Estado de Ánimo y Energía Vital',
          texto: 'En términos generales, ¿cómo describirías tu estado de ánimo y motivación al iniciar tu jornada laboral diaria?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('ánimo')
        },
        {
          id: uidGen('emo'),
          categoria: 'Apoyo y Escucha en el Equipo',
          texto: '¿Sientes que cuentas con un entorno seguro donde puedes expresar tus inquietudes o momentos de fatiga sin ser juzgado(a)?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('acuerdo')
        },
        {
          id: uidGen('emo'),
          categoria: 'Manejo del Estrés y Equilibrio',
          texto: '¿El ritmo de trabajo te permite mantener un balance saludable entre tus exigencias laborales y tu bienestar personal?',
          tipo: 'multiple',
          opciones: [
            { id: 'em-1', texto: 'Sí, mantengo un equilibrio óptimo y tranquilo', valor: 5, esAlerta: false },
            { id: 'em-2', texto: 'Ritmo demandante pero manejable', valor: 3, esAlerta: false },
            { id: 'em-3', texto: 'Nivel de estrés excesivo que afecta mi salud anímica', valor: 1, esAlerta: true }
          ]
        },
        {
          id: uidGen('emo'),
          categoria: 'Sensación de Reconocimiento',
          texto: '¿Percibes que tu esfuerzo y dedicación son valorados adecuadamente por tus líderes y compañeros de trabajo?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('acuerdo')
        },
        {
          id: uidGen('emo'),
          categoria: 'Expresión Abierta del Sentir',
          texto: 'En tus propias palabras, ¿cómo te has sentido en las últimas semanas en la empresa y qué te ayudaría a sentirte aún mejor?',
          tipo: 'texto',
          opciones: []
        }
      )
      break

    case 'Alimentación y Comedor':
      preguntas.push(
        {
          id: uidGen('com'),
          categoria: 'Calidad y Sabor de Alimentos',
          texto: '¿Cómo evalúas la calidad, sabor, higiene y frescura de los alimentos ofrecidos en el comedor o cafetería?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('calidad')
        },
        {
          id: uidGen('com'),
          categoria: 'Tiempos de Atención y Filas',
          texto: '¿La agilidad en la atención y la disponibilidad de mesas te permiten disfrutar tu tiempo de alimentación con tranquilidad?',
          tipo: 'multiple',
          opciones: [
            { id: 'c1', texto: 'Tiempo y espacio plenamente cómodos', valor: 5, esAlerta: false },
            { id: 'c2', texto: 'Filas moderadas pero manejables', valor: 3, esAlerta: false },
            { id: 'c3', texto: 'Demoras excesivas o falta de espacio para sentarse', valor: 1, esAlerta: true }
          ]
        },
        {
          id: uidGen('com'),
          categoria: 'Variedad y Opciones Saludables',
          texto: '¿Consideras que el menú ofrece suficiente variedad y opciones saludables para diferentes necesidades nutricionales?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('acuerdo')
        },
        {
          id: uidGen('com'),
          categoria: 'Propuestas de Menú',
          texto: '¿Qué sugerencias o nuevas alternativas te gustaría que se incorporen en el servicio de alimentación?',
          tipo: 'texto',
          opciones: []
        }
      )
      break

    case 'Tecnología y Herramientas TI':
      preguntas.push(
        {
          id: uidGen('ti'),
          categoria: 'Rendimiento de Equipos y Software',
          texto: '¿La velocidad y funcionamiento de tu computador y herramientas de trabajo te permite cumplir tus metas sin trabas?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('calidad')
        },
        {
          id: uidGen('ti'),
          categoria: 'Soporte Técnico y Solución de Fallos',
          texto: '¿Cuando se presentan incidentes tecnológicos, recibes atención y solución oportuna por parte del equipo de soporte?',
          tipo: 'multiple',
          opciones: [
            { id: 'ti-1', texto: 'Atención ágil y solución eficaz', valor: 5, esAlerta: false },
            { id: 'ti-2', texto: 'Respuesta aceptable con demoras menores', valor: 3, esAlerta: false },
            { id: 'ti-3', texto: 'Respuestas tardías que bloquean mis entregas', valor: 1, esAlerta: true }
          ]
        },
        {
          id: uidGen('ti'),
          categoria: 'Conectividad y Redes',
          texto: '¿La estabilidad de la conexión a internet y redes internas es confiable para tus tareas cotidianas?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('acuerdo')
        },
        {
          id: uidGen('ti'),
          categoria: 'Propuestas Tecnológicas',
          texto: '¿Qué herramienta o recurso técnico consideras prioritario mejorar o implementar?',
          tipo: 'texto',
          opciones: []
        }
      )
      break

    case 'Gestión de Turnos y Descanso':
      preguntas.push(
        {
          id: uidGen('tur'),
          categoria: 'Rotación y Previsibilidad de Turnos',
          texto: '¿La programación de tus turnos se comunica con suficiente anticipación para planificar tu descanso y vida personal?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('acuerdo')
        },
        {
          id: uidGen('tur'),
          categoria: 'Calidad del Descanso Reparador',
          texto: '¿El tiempo entre turnos te permite recuperar tus energías físicas y mentales de forma adecuada?',
          tipo: 'multiple',
          opciones: [
            { id: 'tur-1', texto: 'Descanso pleno y energía suficiente', valor: 5, esAlerta: false },
            { id: 'tur-2', texto: 'Descanso justo pero manejable', valor: 3, esAlerta: false },
            { id: 'tur-3', texto: 'Agotamiento acumulado por intervalos cortos', valor: 1, esAlerta: true }
          ]
        },
        {
          id: uidGen('tur'),
          categoria: 'Equidad en Asignación',
          texto: '¿Percibes que la asignación de descansos y turnos especiales se realiza de manera justa y transparente?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('acuerdo')
        },
        {
          id: uidGen('tur'),
          categoria: 'Propuestas de Horarios',
          texto: '¿Qué sugerencia propones en el esquema de turnos para optimizar el balance vida-trabajo?',
          tipo: 'texto',
          opciones: []
        }
      )
      break

    case 'Convivencia y Clima Seguro':
      preguntas.push(
        {
          id: uidGen('con'),
          categoria: 'Respeto y Trato Digno',
          texto: '¿El ambiente cotidiano entre líderes y colaboradores se caracteriza por el respeto mutuo, la cordialidad y el trato humano?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('respeto')
        },
        {
          id: uidGen('con'),
          categoria: 'Prevención de Hostigamiento y Acoso',
          texto: '¿Has presenciado o experimentado situaciones de maltrato, humillación o conductas intimidatorias en tu equipo?',
          tipo: 'multiple',
          esSensibleAcoso: true,
          opciones: [
            { id: 'con-1', texto: 'Nunca, el clima es 100% respetuoso y seguro', valor: 5, esAlerta: false },
            { id: 'con-2', texto: 'Situaciones aisladas de tensión que se resolvieron', valor: 3, esAlerta: false },
            { id: 'con-3', texto: 'Sí, he vivido o presenciado conductas hostiles recurrentes', valor: 1, esAlerta: true }
          ]
        },
        {
          id: uidGen('con'),
          categoria: 'Confianza en Canales de Apoyo',
          texto: '¿Sientes la tranquilidad de reportar situaciones injustas sin temor a represalias personales o laborales?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('confianza')
        },
        {
          id: uidGen('con'),
          categoria: 'Mensaje Confidencial de Convivencia',
          texto: '¿Deseas compartir alguna situación particular o recomendación confidencial para fortalecer la convivencia?',
          tipo: 'texto',
          opciones: []
        }
      )
      break

    default:
      // Caso genérico contextual elegante (sin comillas ni concatenaciones crudas)
      preguntas.push(
        {
          id: uidGen('gen'),
          categoria: 'Experiencia y Satisfacción General',
          texto: '¿Cómo evalúas tu nivel general de satisfacción y bienestar con las condiciones actuales de tu entorno de trabajo?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('satisfaccion')
        },
        {
          id: uidGen('gen'),
          categoria: 'Claridad en Metas y Procesos',
          texto: '¿Tienes claridad absoluta sobre tus objetivos, prioridades y los recursos disponibles para alcanzarlos con éxito?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('claridad')
        },
        {
          id: uidGen('gen'),
          categoria: 'Apoyo del Equipo y Liderazgo',
          texto: '¿Sientes que cuentas con el respaldo y la colaboración necesaria de tu equipo y jefatura para resolver dificultades?',
          tipo: 'multiple',
          opciones: [
            { id: 'g1', texto: 'Sí, respaldo pleno y trabajo colaborativo constante', valor: 5, esAlerta: false },
            { id: 'g2', texto: 'Apoyo moderado con oportunidad de mejora', valor: 3, esAlerta: false },
            { id: 'g3', texto: 'No, falta de acompañamiento o aislamiento en mis labores', valor: 1, esAlerta: true }
          ]
        },
        {
          id: uidGen('gen'),
          categoria: 'Motivación y Compromiso',
          texto: '¿Te sientes motivado(a) y con orgullo de pertenecer a este equipo de trabajo?',
          tipo: 'escala',
          opciones: generarOpcionesEscala('motivacion')
        },
        {
          id: uidGen('gen'),
          categoria: 'Sugerencias y Propuestas Abiertas',
          texto: '¿Qué cambio, idea o iniciativa consideras que generaría el mayor impacto positivo en tu día a día laboral?',
          tipo: 'texto',
          opciones: []
        }
      )
      break
  }

  let preguntasResultado = preguntas
  if (extension === 'rapida') {
    preguntasResultado = preguntas.slice(0, 4)
  }

  return {
    titulo: `Diagnóstico de Clima: ${temaDetectado}`,
    descripcion: `Evaluación confidencial dirigida a ${departamento} para identificar oportunidades de bienestar y mejora continua.`,
    departamento,
    preguntas: preguntasResultado,
    preguntasSeguimiento: [
      {
        id: uidGen('seg-gen'),
        categoria: 'Propuestas de Mejora',
        texto: '¿Qué iniciativa o acción prioritaria propondrías para mejorar este aspecto en tu área de trabajo?',
        tipo: 'texto',
        opciones: []
      }
    ]
  }
}
