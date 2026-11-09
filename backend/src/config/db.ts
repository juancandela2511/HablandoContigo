/**
 * ============================================================================
 * POOL DE CONEXIÓN A POSTGRESQL (Backend/src/config/db.ts)
 * ============================================================================
 * Administra el pool de conexiones hacia PostgreSQL con variables de entorno
 * seguras y sincronización resiliente de preguntas predeterminadas.
 */

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

if (!process.env.DB_PASSWORD) {
  console.warn('[PostgreSQL] AVISO: DB_PASSWORD no está definido en el archivo .env.')
}

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mi_base_datos',
  max: Number(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS) || 5000
})

pool.on('error', (err: any) => {
  console.error('[PostgreSQL] Error inesperado en el cliente inactivo del pool:', err.message)
})

async function leerPreguntasInicialesResiliente(): Promise<any[] | null> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const rutasCandidatas = [
    path.resolve(process.cwd(), 'src/data/preguntas.json'),
    path.resolve(process.cwd(), 'data/preguntas.json'),
    path.resolve(process.cwd(), '../frontend/src/database/preguntas.json'),
    path.resolve(process.cwd(), '../Frontend/src/database/preguntas.json'),
    path.resolve(process.cwd(), '../frontend/src/Config/preguntas.json'),
    path.resolve(process.cwd(), '../Frontend/src/Config/preguntas.json')
  ]

  for (const ruta of rutasCandidatas) {
    const raw = await fs.readFile(ruta, 'utf-8').catch(() => null)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }
  }
  return null
}

export async function inicializarBaseDatos(): Promise<void> {
  let client
  try {
    client = await pool.connect()
    const res = await client.query('SELECT NOW() as now, version() as version;')
    await client.query('ALTER TABLE encuestas DROP CONSTRAINT IF EXISTS encuestas_estado_check;').catch(() => {})
    await client.query('ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;').catch(() => {})
    await client.query('ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_estado_check;').catch(() => {})

    // Corregir trigger de métricas para soportar DELETE e INSERT con robustez
    await client.query(`
      CREATE OR REPLACE FUNCTION trg_actualizar_metricas_encuesta()
      RETURNS TRIGGER AS $$
      DECLARE
        target_id VARCHAR(100);
      BEGIN
        IF TG_OP = 'DELETE' THEN
          target_id := OLD.id_encuesta;
        ELSE
          target_id := NEW.id_encuesta;
        END IF;

        IF target_id IS NOT NULL THEN
          UPDATE encuestas
          SET total_respuestas = (SELECT COUNT(*) FROM respuestas WHERE id_encuesta = target_id),
              puntaje_promedio = COALESCE((SELECT ROUND(AVG(puntaje_general), 1) FROM respuestas WHERE id_encuesta = target_id), 5.0),
              alertas_registradas = (SELECT COUNT(*) FROM respuestas WHERE id_encuesta = target_id AND jsonb_array_length(COALESCE(alertas_detectadas, '[]'::jsonb)) > 0),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = target_id;
        END IF;

        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql;
    `).catch(() => {})

    // Garantizar que las columnas de fotos y avatares permitan cadenas Base64 completas sin truncamiento
    await client.query('ALTER TABLE usuarios ALTER COLUMN avatar TYPE TEXT;').catch(() => {})
    await client.query('ALTER TABLE usuarios ALTER COLUMN foto_url TYPE TEXT;').catch(() => {})

    console.log(`[PostgreSQL] Conexión establecida con ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'mi_base_datos'}`)
    console.log(`[PostgreSQL] Motor: ${res.rows[0].version.split(' ')[0]} ${res.rows[0].version.split(' ')[1]} | Timestamp DB: ${res.rows[0].now}`)

    try {
      const preguntasConfig = await leerPreguntasInicialesResiliente()
      if (preguntasConfig) {
        await client.query(`
          INSERT INTO encuestas (id, titulo, descripcion, departamento, estado, fecha_creacion, creado_por, metadata)
          VALUES ('enc-001', 'Proyecto Clima Laboral — Diagnóstico Organizacional', 'Evaluación troncal de bienestar, liderazgo, respeto y desarrollo en el equipo.', 'Operaciones & Clima Laboral', 'Activa', TO_CHAR(CURRENT_TIMESTAMP, 'DD Mon YYYY'), 'Super Administrador', '{}'::jsonb)
          ON CONFLICT (id) DO NOTHING
        `)

        const countRes = await client.query("SELECT COUNT(*) FROM preguntas WHERE id_encuesta = 'enc-001'")
        const totalActual = parseInt(countRes.rows[0].count, 10)

        if (totalActual === 0 || totalActual !== preguntasConfig.length) {
          await client.query("DELETE FROM preguntas WHERE id_encuesta = 'enc-001'")
          for (let i = 0; i < preguntasConfig.length; i++) {
            const p = preguntasConfig[i]
            const pregMeta = {
              tipoGrafico: p.tipoGrafico || (i % 2 === 0 ? 'barras' : 'pastel'),
              comentariosHabilitados: p.comentariosHabilitados ?? true,
              deteccionQuejas: p.deteccionQuejas ?? true,
              solicitarPorQueSiNegativo: p.solicitarPorQueSiNegativo ?? true,
              modoPresentacion: p.modoPresentacion || undefined,
              maxAnos: p.maxAnos || undefined
            }
            await client.query(
              `INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria, metadata)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                p.id,
                'enc-001',
                i + 1,
                p.bloqueId || `bloque-${Math.floor(i / 5) + 1}`,
                p.categoria || 'General',
                p.texto || '',
                p.tipo || 'multiple',
                JSON.stringify(p.opciones || []),
                Boolean(p.obligatoria ?? true),
                JSON.stringify(pregMeta)
              ]
            )
          }
          console.log('[PostgreSQL] Preguntas predeterminadas sincronizadas exitosamente.')
        }
      }
    } catch (syncErr: any) {
      console.warn('[PostgreSQL] Advertencia al sincronizar preguntas:', syncErr.message)
    }
  } catch (err: any) {
    console.error(`[PostgreSQL] Error crítico al conectar con la base de datos: ${err.message}`)
  } finally {
    if (client) client.release()
  }
}
