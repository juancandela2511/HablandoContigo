/**
 * ============================================================================
 * POOL DE CONEXIÓN A POSTGRESQL (server/src/config/db.ts)
 * ============================================================================
 * Administra el pool de conexiones seguras hacia PostgreSQL con auto-reconectividad,
 * manejo de errores no capturados y auditoría de salud.
 */

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1012332747jS.',
  database: process.env.DB_NAME || 'mi_base_datos',
  max: Number(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS) || 5000,
})

// Manejo de errores en clientes inactivos del pool
pool.on('error', (err: any) => {
  console.error('[PostgreSQL] Error inesperado en el cliente inactivo del pool:', err.message)
})

/**
 * Prueba la conexión con la base de datos y reporta métricas iniciales
 */
export async function inicializarBaseDatos(): Promise<void> {
  let client
  try {
    client = await pool.connect()
    const res = await client.query('SELECT NOW() as now, version() as version;')
    console.log(`[PostgreSQL] Conexión establecida exitosamente con ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`)
    console.log(`[PostgreSQL] Motor: ${res.rows[0].version.split(' ')[0]} ${res.rows[0].version.split(' ')[1]} | Timestamp DB: ${res.rows[0].now}`)
  } catch (err: any) {
    console.error(`[PostgreSQL] Error crítico al conectar con la base de datos: ${err.message}`)
  } finally {
    if (client) client.release()
  }
}
