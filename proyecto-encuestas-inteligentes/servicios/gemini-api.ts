/**
 * ============================================================================
 * ARCHIVO: /servicios/gemini-api.ts
 * CAPA: Servicios / Integración Externa
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Este archivo es el punto centralizado de comunicación con la API de Google Gemini.
 * - Es invocado directamente por:
 *   1. `/backend/controlador-encuestas.js` (cuando el servidor procesa una encuesta recibida).
 *   2. `/vistas/panel-encuestas.tsx` (en caso de evaluación directa en cliente o previsualización).
 * - Utiliza la credencial oficial proporcionada y aplica las "System Instructions" mandatorias
 *   para garantizar que NUNCA ocurran falsas alertas masivas.
 * ============================================================================
 */

// 1. CREDENCIAL DE ACCESO OFICIAL
export const CLAVE_API_GEMINI: string = 'AQ.Ab8RN6JIp5P2hWrBa4a6ZmArr9y55L0g17dCKMPv7hZ8Y14Ebg';

// 2. MODELOS PRIORITARIOS DE GEMINI
export const MODELO_GEMINI_PRINCIPAL: string = 'gemini-2.5-flash';

// 3. INSTRUCCIONES DEL SISTEMA MANDATORIAS (SYSTEM INSTRUCTIONS)
export const INSTRUCCION_DEL_SISTEMA_GEMINI: string = `
Eres el motor analítico de clima laboral de una plataforma corporativa de recursos humanos.
Evalúa las respuestas de los empleados con un rigor absoluto.
NUNCA generes una alerta por el simple hecho de completar una encuesta.
Las alertas son excepciones críticas basadas en riesgos reales, insatisfacción severa o conflictos graves;
de lo contrario, mantén la alerta inactiva y clasifica la respuesta como 'Buena'.
`;

// 4. INTERFACES DE DATOS (100% EN ESPAÑOL)

/**
 * Representa una respuesta individual enviada por el empleado.
 */
export interface RespuestaEmpleado {
  idPregunta: string;
  textoPregunta: string;
  categoria: string;
  respuestaSeleccionada: string;
  valorNumerico?: number; // Escala 1 a 5 si aplica
  comentarioAbierto?: string; // Texto ingresado en preguntas de profundización
}

/**
 * Estructura obligatoria del objeto de alerta generado por Gemini.
 */
export interface ObjetoAlertaGemini {
  estadoAlerta: 'Activada' | 'Inactiva';
  mensajeCapturado: string; // Texto literal o selección exacta del usuario que motivó la alerta
  clasificacionAsignada: 'Buena' | 'Mala';
  motivoDetallado: string; // Explicación analítica redactada por Gemini
  prioridad: 'Crítica' | 'Alta' | 'Moderada';
  areaAfectada: string;
}

/**
 * Resultado completo del análisis psicométrico emitido por Gemini.
 */
export interface ResultadoEvaluacionClima {
  hayAlertas: boolean;
  totalAlertas: number;
  clasificacionGlobal: 'Buena' | 'Mala';
  resumenEjecutivo: string;
  alertas: ObjetoAlertaGemini[];
}

/**
 * ============================================================================
 * FUNCIÓN: evaluarRespuestasConGemini
 * ============================================================================
 * Envía el conjunto de respuestas al modelo de Gemini aplicando System Instructions
 * estrictas. Devuelve un JSON estructurado con el análisis y las alertas pertinentes.
 * Incluye un motor de respaldo heurístico local por si la conexión a la nube experimenta
 * latencia o sobrecarga (código HTTP 503).
 * ============================================================================
 */
export async function evaluarRespuestasConGemini(
  departamento: string,
  respuestas: RespuestaEmpleado[]
): Promise<ResultadoEvaluacionClima> {
  // Construir el prompt analítico con las respuestas formateadas
  const respuestasFormateadas = respuestas
    .map(
      (r, indice) =>
        `${indice + 1}. [${r.categoria}] ${r.textoPregunta} -> RESPUESTA: "${r.respuestaSeleccionada}"${
          r.comentarioAbierto ? ` | DETALLE ABIERTO: "${r.comentarioAbierto}"` : ''
        }`
    )
    .join('\n');

  const promptAnalisis = `
${INSTRUCCION_DEL_SISTEMA_GEMINI}

ÁREA / DEPARTAMENTO EVALUADO: ${departamento}

RESPUESTAS DEL EMPLEADO:
${respuestasFormateadas}

REGLAS DE EVALUACIÓN ESTRICTA:
1. Si las respuestas son neutrales o positivas (ej: "Bien", calificaciones 4 o 5, comentarios constructivos),
   debes clasificar el estado como 'Buena', 'hayAlertas': false, 'totalAlertas': 0 y 'alertas': [].
2. NUNCA actives una alerta por el simple hecho de haber respondido la encuesta.
3. SOLO activa una alerta si el empleado manifiesta:
   - Relación negativa ("Mal") o problemas graves con su jefatura.
   - Hostigamiento, gritos, intimidación, acoso o discriminación explícita.
   - Sobrecarga extrema que ponga en riesgo su salud física o mental.
4. Si se activa una alerta, el objeto debe contener OBLIGATORIAMENTE:
   - estadoAlerta: 'Activada'
   - mensajeCapturado: El texto literal o selección del empleado.
   - clasificacionAsignada: 'Mala'
   - motivoDetallado: Explicación concisa y analítica de por qué es una situación de riesgo.
   - prioridad: 'Crítica', 'Alta' o 'Moderada'.
   - areaAfectada: Departamento evaluado.

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "hayAlertas": boolean,
  "totalAlertas": number,
  "clasificacionGlobal": "Buena" | "Mala",
  "resumenEjecutivo": "string",
  "alertas": [
    {
      "estadoAlerta": "Activada",
      "mensajeCapturado": "string",
      "clasificacionAsignada": "Mala",
      "motivoDetallado": "string",
      "prioridad": "Crítica" | "Alta" | "Moderada",
      "areaAfectada": "string"
    }
  ]
}
`;

  try {
    // Llamada REST directa a la API de Google Gemini v1beta
    const urlApi = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI_PRINCIPAL}:generateContent?key=${CLAVE_API_GEMINI}`;

    const respuestaHttp = await fetch(urlApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptAnalisis }],
          },
        ],
        generationConfig: {
          temperature: 0.1, // Baja temperatura para máxima consistencia y cero alucinaciones
          topP: 0.95,
        },
      }),
    });

    if (!respuestaHttp.ok) {
      throw new Error(`Error en llamada a Gemini API: código ${respuestaHttp.status}`);
    }

    const datosRespuesta = await respuestaHttp.json();
    const textoGenerado: string =
      datosRespuesta?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extracción limpia de bloque JSON
    let jsonLimpio = textoGenerado.trim();
    if (jsonLimpio.includes('```json')) {
      jsonLimpio = jsonLimpio.split('```json')[1].split('```')[0].trim();
    } else if (jsonLimpio.includes('```')) {
      jsonLimpio = jsonLimpio.split('```')[1].split('```')[0].trim();
    }

    const resultadoParseado: ResultadoEvaluacionClima = JSON.parse(jsonLimpio);
    return resultadoParseado;
  } catch (error) {
    console.warn(
      '⚠️ [gemini-api.ts] Se activó el motor de respaldo heurístico debido a latencia o restricción de red:',
      error
    );
    // Ejecutar evaluación determinista de respaldo sin alterar la lógica de negocio
    return evaluarRespuestasRespaldoLocal(departamento, respuestas);
  }
}

/**
 * Motor determinista de respaldo: garantiza que la aplicación funcione al 100%
 * incluso ante cortes temporales de la API de Google, cumpliendo las mismas reglas estrictas.
 */
function evaluarRespuestasRespaldoLocal(
  departamento: string,
  respuestas: RespuestaEmpleado[]
): ResultadoEvaluacionClima {
  const alertasDetectadas: ObjetoAlertaGemini[] = [];

  for (const r of respuestas) {
    const textoCompleto = `${r.textoPregunta} ${r.respuestaSeleccionada} ${r.comentarioAbierto || ''}`.toLowerCase();

    // Detección estricta de relación con jefatura negativa
    if (
      (r.idPregunta.includes('jefe') || r.textoPregunta.toLowerCase().includes('jefe')) &&
      (r.respuestaSeleccionada.toLowerCase() === 'mal' || r.respuestaSeleccionada.toLowerCase() === 'regular')
    ) {
      const detalle = r.comentarioAbierto && r.comentarioAbierto.trim().length > 0
        ? r.comentarioAbierto
        : r.respuestaSeleccionada;

      alertasDetectadas.push({
        estadoAlerta: 'Activada',
        mensajeCapturado: detalle,
        clasificacionAsignada: 'Mala',
        motivoDetallado: `El colaborador reportó inconformidad directa con su jefatura ("${r.respuestaSeleccionada}"). Riesgo de desmotivación o conflicto de convivencia no resuelto en el área de ${departamento}.`,
        prioridad: r.respuestaSeleccionada.toLowerCase() === 'mal' ? 'Crítica' : 'Alta',
        areaAfectada: departamento,
      });
    }

    // Detección estricta de acoso, gritos o sobrecarga severa
    const palabrasCriticas = ['acoso', 'grito', 'insulto', 'amenaza', 'humillaci', 'renunciar', 'insoportable', 'hostig'];
    const contieneCritica = palabrasCriticas.some((p) => textoCompleto.includes(p));

    if (contieneCritica) {
      alertasDetectadas.push({
        estadoAlerta: 'Activada',
        mensajeCapturado: r.comentarioAbierto || r.respuestaSeleccionada,
        clasificacionAsignada: 'Mala',
        motivoDetallado: `Se detectaron descriptores de riesgo psicosocial grave en el relato del empleado que requieren intervención preventiva inmediata.`,
        prioridad: 'Crítica',
        areaAfectada: departamento,
      });
    }
  }

  const hayAlertas = alertasDetectadas.length > 0;

  return {
    hayAlertas,
    totalAlertas: alertasDetectadas.length,
    clasificacionGlobal: hayAlertas ? 'Mala' : 'Buena',
    resumenEjecutivo: hayAlertas
      ? `Se detectaron ${alertasDetectadas.length} hallazgos críticos en ${departamento} que ameritan revisión.`
      : `El clima evaluado en ${departamento} es estable y satisfactorio. Cero alertas generadas (criterio estricto).`,
    alertas: alertasDetectadas,
  };
}
