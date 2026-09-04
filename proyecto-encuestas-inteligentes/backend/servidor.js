/**
 * ============================================================================
 * ARCHIVO: /backend/servidor.js
 * CAPA: Backend / Servidor de Aplicación
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Este es el punto de entrada principal del backend Node.js / Express.
 * - Conecta las solicitudes entrantes del cliente frontend (/vistas/panel-encuestas.tsx)
 *   con el controlador de negocio `/backend/controlador-encuestas.js`.
 * - Rutas expuestas:
 *   1. `GET  /api/estado`            -> Invocado para verificar salud del servicio.
 *   2. `POST /api/encuestas/evaluar` -> Invocado al finalizar el envío de la encuesta.
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const { procesarEvaluacionEncuesta, verificarEstadoServicio } = require('./controlador-encuestas');

// Inicialización de la aplicación Express
const aplicacion = express();
const PUERTO = process.env.PUERTO || 4000;

// Configuración de middlewares globales
aplicacion.use(cors({
  origin: '*', // Permite peticiones desde cualquier origen local o de producción
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

aplicacion.use(express.json({ limit: '5mb' }));

// Middleware de auditoría de peticiones en consola
aplicacion.use((solicitud, respuesta, siguiente) => {
  const marcaTiempo = new Date().toLocaleTimeString('es-CO');
  console.log(`[${marcaTiempo}] 🌐 ${solicitud.method} ${solicitud.originalUrl}`);
  siguiente();
});

// ============================================================================
// DEFINICIÓN DE RUTAS Y CONEXIÓN CON CONTROLADORES
// ============================================================================

// Ruta 1: Comprobación de salud y estado operativo
aplicacion.get('/api/estado', verificarEstadoServicio);

// Ruta 2: Evaluación estricta de respuestas de encuestas con Gemini
aplicacion.post('/api/encuestas/evaluar', procesarEvaluacionEncuesta);

// Manejador de rutas no encontradas (404)
aplicacion.use((solicitud, respuesta) => {
  respuesta.status(404).json({
    exito: false,
    mensajeError: `La ruta solicitada "${solicitud.originalUrl}" no existe en el servidor.`,
    rutasDisponibles: [
      'GET  /api/estado',
      'POST /api/encuestas/evaluar'
    ]
  });
});

// Inicio del servidor HTTP
aplicacion.listen(PUERTO, () => {
  console.log('=================================================================');
  console.log(`🚀 SERVIDOR INICIADO EXITOSAMENTE`);
  console.log(`📍 Escuchando en el puerto: ${PUERTO}`);
  console.log(`🔗 URL Base: http://localhost:${PUERTO}`);
  console.log(`🎯 Enlace de evaluación: http://localhost:${PUERTO}/api/encuestas/evaluar`);
  console.log(`🤖 Motor IA: Google Gemini API (AQ.Ab8RN... | Cero Falsas Alertas)`);
  console.log('=================================================================');
});

module.exports = aplicacion;
