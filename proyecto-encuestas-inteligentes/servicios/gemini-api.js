/**
 * ============================================================================
 * ARCHIVO: /servicios/gemini-api.js (Módulo Ejecutable Node.js)
 * CAPA: Servicios / Integración Externa
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Este archivo proporciona la implementación en JavaScript estándar para que
 *   `/backend/controlador-encuestas.js` pueda ser ejecutado directamente con `node`
 *   sin requerir pasos previos de transpilación TypeScript.
 * - Utiliza la credencial oficial de Gemini y las System Instructions mandatorias.
 * ============================================================================
 */

const CLAVE_API_GEMINI = 'AQ.Ab8RN6JIp5P2hWrBa4a6ZmArr9y55L0g17dCKMPv7hZ8Y14Ebg';
const MODELO_GEMINI_PRINCIPAL = 'gemini-2.5-flash';

const INSTRUCCION_DEL_SISTEMA_GEMINI = `
Eres el motor analítico de clima laboral de una plataforma corporativa de recursos humanos.
Evalúa las respuestas de los empleados con un rigor absoluto.
NUNCA generes una alerta por el simple hecho de completar una encuesta.
Las alertas son excepciones críticas basadas en riesgos reales, insatisfacción severa o conflictos graves;
de lo contrario, mantén la alerta inactiva y clasifica la respuesta como 'Buena'.
`;

/**
 * Evalúa las respuestas del empleado con Google Gemini API v1beta
 * aplicando estrictez máxima (Cero Falsas Alarmas).
 */
async function evaluarRespuestasConGemini(departamento, respuestas) {
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
          temperature: 0.1,
          topP: 0.95,
        },
      }),
    });

    if (!respuestaHttp.ok) {
      throw new Error(`Error en llamada a Gemini API: código ${respuestaHttp.status}`);
    }

    const datosRespuesta = await respuestaHttp.json();
    const textoGenerado = datosRespuesta?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let jsonLimpio = textoGenerado.trim();
    if (jsonLimpio.includes('```json')) {
      jsonLimpio = jsonLimpio.split('```json')[1].split('```')[0].trim();
    } else if (jsonLimpio.includes('```')) {
      jsonLimpio = jsonLimpio.split('```')[1].split('```')[0].trim();
    }

    return JSON.parse(jsonLimpio);
  } catch (error) {
    console.warn('⚠️ [gemini-api.js] Activando motor analítico determinista de respaldo:', error.message);
    return evaluarRespuestasRespaldoLocal(departamento, respuestas);
  }
}

/**
 * Respaldo analítico determinista que asegura el funcionamiento ininterrumpido.
 */
function evaluarRespuestasRespaldoLocal(departamento, respuestas) {
  const alertasDetectadas = [];

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

    // Detección estricta de acoso, hostigamiento o agresiones verbales
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

module.exports = {
  CLAVE_API_GEMINI,
  MODELO_GEMINI_PRINCIPAL,
  INSTRUCCION_DEL_SISTEMA_GEMINI,
  evaluarRespuestasConGemini,
};
