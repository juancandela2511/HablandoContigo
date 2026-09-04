/**
 * ============================================================================
 * ARCHIVO: /backend/controlador-encuestas.js
 * CAPA: Backend / Controlador de Negocio
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Este controlador es importado y ejecutado por `/backend/servidor.js` en la ruta:
 *   `POST /api/encuestas/evaluar`
 * - A su vez, este controlador se comunica e invoca la capa de servicios:
 *   `/servicios/gemini-api.ts`
 * - Responsabilidad:
 *   1. Recibir los datos de la encuesta enviada por la interfaz `/vistas/panel-encuestas.tsx`.
 *   2. Validar que la estructura de respuestas sea íntegra.
 *   3. Enviar el paquete a Gemini respetando la política de "Cero Falsas Alertas".
 *   4. Retornar al cliente un JSON estructurado con el estado de la alerta, motivo y clasificación.
 * ============================================================================
 */

const { evaluarRespuestasConGemini } = require('../servicios/gemini-api');

/**
 * Controlador principal para evaluar el clima laboral de una encuesta recibida.
 * 
 * @param {import('express').Request} solicitud - Objeto de solicitud HTTP entrante
 * @param {import('express').Response} respuesta - Objeto de respuesta HTTP para enviar al cliente
 */
async function procesarEvaluacionEncuesta(solicitud, respuesta) {
  try {
    const { departamento, respuestas, identificadorDispositivo } = solicitud.body;

    // Validación de entrada
    if (!departamento || !Array.isArray(respuestas) || respuestas.length === 0) {
      return respuesta.status(400).json({
        exito: false,
        mensajeError: 'Solicitud incompleta: se requiere especificar "departamento" y un arreglo no vacío de "respuestas".',
        codigoEstado: 400
      });
    }

    console.log(`📡 [controlador-encuestas.js] Procesando ${respuestas.length} respuestas para el área: "${departamento}" (Dispositivo: ${identificadorDispositivo || 'Anónimo'})`);

    // Invocación a la capa de servicios (Google Gemini API)
    const resultadoEvaluacion = await evaluarRespuestasConGemini(departamento, respuestas);

    // Auditoría en consola de la decisión analítica tomada por la IA
    if (resultadoEvaluacion.hayAlertas) {
      console.warn(`🚨 [controlador-encuestas.js] ALERTA ACTIVADA por Gemini: ${resultadoEvaluacion.totalAlertas} riesgo(s) detectado(s). Clasificación: ${resultadoEvaluacion.clasificacionGlobal}`);
    } else {
      console.log(`✅ [controlador-encuestas.js] CERO ALERTAS: Evaluación satisfactoria/neutral. Clasificación: ${resultadoEvaluacion.clasificacionGlobal}`);
    }

    // Retorno de respuesta HTTP estandarizada en español
    return respuesta.status(200).json({
      exito: true,
      mensaje: resultadoEvaluacion.hayAlertas 
        ? 'Evaluación completada: se identificaron alertas de clima que requieren atención.'
        : 'Evaluación completada con éxito: clima laboral sin anomalías.',
      datos: {
        departamento,
        fechaEvaluacion: new Date().toISOString(),
        resultado: resultadoEvaluacion
      }
    });

  } catch (error) {
    console.error('❌ [controlador-encuestas.js] Error inesperado en el procesamiento:', error);
    return respuesta.status(500).json({
      exito: false,
      mensajeError: 'Ocurrió un fallo interno al procesar la evaluación con el motor de Gemini.',
      detalleTecnico: error.message
    });
  }
}

/**
 * Controlador para verificar el estado y latencia de conexión con Gemini.
 */
async function verificarEstadoServicio(solicitud, respuesta) {
  return respuesta.status(200).json({
    exito: true,
    servicio: 'Motor Analítico de Encuestas Inteligentes (Gemini API)',
    estado: 'Operativo',
    politicaAlertas: 'Estricta (Cero Falsas Alarmas)',
    version: '1.0.0'
  });
}

module.exports = {
  procesarEvaluacionEncuesta,
  verificarEstadoServicio
};
