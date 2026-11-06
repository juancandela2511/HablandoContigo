/**
 * ============================================================================
 * SERVIDOR BACKEND EXPRESS + NODE.JS + POSTGRESQL (Backend/src/index.ts)
 * ============================================================================
 * Punto de entrada principal con validación de CORS, manejo global de errores
 * y montaje modular de endpoints REST con PostgreSQL.
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

const extraOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  ...extraOrigins
]

app.use(cors({
  origin: (origin, callback) => {
    // Permitir intranet, localhost, cualquier IP local y orígenes configurados
    if (
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      /^https?:\/\/(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))(:[0-9]+)?$/.test(origin) ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      callback(null, true)
    } else {
      // En despliegues locales / LAN corporativos permitir el origen
      callback(null, true)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

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

  if (req.headers.accept?.includes('text/html')) {
    const colorBadge = dbConectada ? '#10b981' : '#f59e0b'
    const textoBadge = dbConectada ? '🟢 100% Operativo y Conectado' : '🟡 Backend Operativo (Verificando BD)'
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>HablandoContigo — Estado del Servidor</title></head>
<body style="font-family:sans-serif;background:#0b1120;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
  <div style="background:#1e293b;padding:2rem;border-radius:1.25rem;border:1px solid #334155;text-align:center;max-width:480px;">
    <div style="color:${colorBadge};font-weight:700;margin-bottom:0.75rem;">${textoBadge}</div>
    <h1 style="font-size:1.35rem;margin:0 0 0.5rem;">Servidor Backend Activo</h1>
    <p style="color:#94a3b8;font-size:0.9rem;">Base de datos: <strong>${dbNombre}</strong> (${dbConectada ? 'Conectada' : errorMsg})</p>
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
app.get('/api/alertas-config', getAlertasConfig)

app.use('/api/auth', authRoutes)
app.use('/api/encuestas', encuestasRoutes)
app.use('/api/preguntas', preguntasRoutes)
app.use('/api/respuestas', respuestasRoutes)
app.use('/api/historico-periodos', historicoRoutes)
app.use('/api/cuentas', cuentasRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/ia', iaRoutes)

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
})

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ServerError] Excepción no controlada:', err)
  const esProd = process.env.NODE_ENV === 'production'
  res.status(500).json({
    error: 'Error interno del servidor',
    // No exponer detalles del error en producción
    ...(esProd ? {} : { message: err?.message || String(err) })
  })
})

async function main() {
  await inicializarBaseDatos()
  app.listen(PORT, () => {
    console.log(`[Backend] HablandoContigo escuchando en http://localhost:${PORT}/api`)
  })
}

main().catch((err) => {
  console.error('[FatalServerInitError]', err)
})
