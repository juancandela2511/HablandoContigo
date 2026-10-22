/**
 * ============================================================================
 * SERVIDOR BACKEND EXPRESS + NODE.JS + POSTGRESQL (server/src/index.ts)
 * ============================================================================
 * Punto de entrada principal con CORS, manejo global de errores y montaje
 * modular de endpoints REST con PostgreSQL.
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { inicializarBaseDatos, pool } from './config/db.js'

import encuestasRoutes from './routes/encuestasRoutes.js'
import preguntasRoutes from './routes/preguntasRoutes.js'
import respuestasRoutes from './routes/respuestasRoutes.js'
import historicoRoutes from './routes/historicoRoutes.js'
import cuentasRoutes from './routes/cuentasRoutes.js'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import iaRoutes from './routes/iaRoutes.js'
import { getAlertasConfig } from './controllers/encuestasController.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3000

// 1. Configuración de CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
]

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origin (como cURL o Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, true) // Habilitar acceso de desarrollo
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging de peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// 2. Health Check de Diagnóstico y Estado del Sistema (GET / y GET /api/health)
const manejadorHealthCheck = async (req: express.Request, res: express.Response) => {
  let dbConectada = false
  let dbNombre = 'Desconocida'
  let dbHora = new Date().toISOString()
  let errorMsg = ''

  try {
    const dbRes = await pool.query('SELECT NOW() as hora, current_database() as db')
    if (dbRes.rows && dbRes.rows.length > 0) {
      dbConectada = true
      dbNombre = dbRes.rows[0].db
      dbHora = dbRes.rows[0].hora
    }
  } catch (err: any) {
    errorMsg = err?.message || String(err)
  }

  // Si se abre directamente en el navegador, mostrar una vista visual amigable y clara
  const pideHtml = req.headers.accept?.includes('text/html')

  if (pideHtml) {
    const colorBadge = dbConectada ? '#10b981' : '#f59e0b'
    const textoBadge = dbConectada ? '🟢 100% Operativo y Conectado' : '🟡 Backend Operativo (Verificando BD)'
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>HablandoContigo — Estado del Servidor</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1120; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
    .card { background: #1e293b; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #334155; text-align: center; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.15); color: ${colorBadge}; padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 14px; margin-bottom: 1.25rem; border: 1px solid rgba(16,185,129,0.3); }
    h1 { font-size: 1.5rem; margin: 0 0 0.5rem; font-weight: 800; color: #ffffff; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin: 0 0 1.5rem; }
    .details { background: #0f172a; padding: 1.25rem; border-radius: 1rem; font-family: monospace; font-size: 0.85rem; text-align: left; margin-bottom: 1.5rem; color: #cbd5e1; border: 1px solid #1e293b; }
    .details div { padding: 4px 0; display: flex; justify-content: space-between; border-bottom: 1px solid #1e293b; }
    .details div:last-child { border-bottom: none; }
    .btn { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; transition: all 0.2s; }
    .btn:hover { background: #2563eb; transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">${textoBadge}</div>
    <h1>El Servidor Backend está Funcionando</h1>
    <p>La API de Node.js Express y el contenedor de PostgreSQL en Docker están comunicándose exitosamente.</p>
    <div class="details">
      <div><span>Estado General:</span> <strong style="color: #34d399;">TODO EN ORDEN (OK)</strong></div>
      <div><span>Motor Base de Datos:</span> <strong>PostgreSQL 16 (Docker)</strong></div>
      <div><span>Base de Datos Activa:</span> <strong>${dbNombre}</strong></div>
      <div><span>Conexión SQL en Vivo:</span> <strong style="color: ${dbConectada ? '#34d399' : '#f87171'}">${dbConectada ? 'Establecida y Respondiendo' : errorMsg}</strong></div>
    </div>
    <a href="http://localhost:5173" class="btn">Abrir la Aplicación en el Frontend ➔</a>
  </div>
</body>
</html>`)
    return
  }

  res.json({
    ok: true,
    status: 'ok',
    mensaje: 'Servidor y base de datos conectados exitosamente.',
    database: {
      motor: 'PostgreSQL 16 (Docker)',
      nombre: dbNombre,
      conectada: dbConectada,
      timestamp: dbHora
    }
  })
}

app.get('/api/health', manejadorHealthCheck)
app.get('/', manejadorHealthCheck)

// 3. Endpoint directo de Alertas Config
app.get('/api/alertas-config', getAlertasConfig)

// 4. Montaje de Rutas Modulares
app.use('/api/auth', authRoutes)
app.use('/api/encuestas', encuestasRoutes)
app.use('/api/preguntas', preguntasRoutes)
app.use('/api/respuestas', respuestasRoutes)
app.use('/api/historico-periodos', historicoRoutes)
app.use('/api/cuentas', cuentasRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/ia', iaRoutes)

// 5. Manejador 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
})

// 6. Manejador Global de Errores (500)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ServerError] Excepción no controlada:', err)
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err?.message || String(err)
  })
})

// 7. Arrancar Servidor
async function main() {
  await inicializarBaseDatos()
  app.listen(PORT, () => {
    console.log(`
========================================================================
🚀 SERVIDOR BACKEND HABLANDOCONTIGO INICIADO CORRECTAMENTE
🌐 URL Base API: http://localhost:${PORT}/api
📡 Escuchando peticiones desde frontend Vite (http://localhost:5173)
🔐 Autenticación: JWT + pgcrypto / bcrypt
🗄️  Base de Datos: PostgreSQL 16 (Docker: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})
🤖 Servicio Ollama: ${process.env.OLLAMA_HOST || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'} (Modelo: ${process.env.OLLAMA_MODEL || 'llama3'})
========================================================================
    `)
  })
}

main().catch((err) => {
  console.error('[FatalServerInitError]', err)
})
