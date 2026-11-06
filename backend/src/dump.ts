import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1012332747Js',
  database: process.env.DB_NAME || 'mi_base_datos'
})

function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  return "'" + String(val).replace(/'/g, "''") + "'"
}

async function exportar() {
  try {
    const client = await pool.connect()
    console.log('[Dump] Conectado a PostgreSQL para extraer todos los datos...')

    let sql = `-- ============================================================================
-- VOLCADO COMPLETO DE DATOS (DATA DUMP) - HABLANDO CONTIGO
-- Fecha de generación: ${new Date().toISOString()}
-- Compatible con: PostgreSQL 16+ con pgcrypto y uuid-ossp
-- ============================================================================

`

    // 1. Usuarios
    const usuarios = await client.query('SELECT * FROM usuarios ORDER BY created_at ASC')
    sql += `-- 1. TABLA: usuarios (${usuarios.rows.length} registros)\n`
    for (const u of usuarios.rows) {
      sql += `INSERT INTO usuarios (id, nombre, email, password_hash, rol, departamento, avatar, foto_url, biografia, telefono, estado)
VALUES (${escapeSql(u.id)}, ${escapeSql(u.nombre)}, ${escapeSql(u.email)}, ${escapeSql(u.password_hash)}, ${escapeSql(u.rol)}, ${escapeSql(u.departamento)}, ${escapeSql(u.avatar || '')}, ${escapeSql(u.foto_url || '')}, ${escapeSql(u.biografia || '')}, ${escapeSql(u.telefono || '')}, ${escapeSql(u.estado || 'Activo')})
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;\n`
    }
    sql += '\n'

    // 2. Encuestas
    const encuestas = await client.query('SELECT * FROM encuestas ORDER BY created_at ASC')
    sql += `-- 2. TABLA: encuestas (${encuestas.rows.length} registros)\n`
    for (const e of encuestas.rows) {
      sql += `INSERT INTO encuestas (id, titulo, descripcion, departamento, creado_por, fecha_creacion, estado, total_respuestas, alertas_registradas, puntaje_promedio)
VALUES (${escapeSql(e.id)}, ${escapeSql(e.titulo)}, ${escapeSql(e.descripcion)}, ${escapeSql(e.departamento)}, ${escapeSql(e.creado_por)}, ${escapeSql(e.fecha_creacion)}, ${escapeSql(e.estado)}, ${e.total_respuestas || 0}, ${e.alertas_registradas || 0}, ${e.puntaje_promedio || 5.0})
ON CONFLICT (id) DO UPDATE SET total_respuestas = EXCLUDED.total_respuestas, puntaje_promedio = EXCLUDED.puntaje_promedio;\n`
    }
    sql += '\n'

    // 3. Alertas Config
    const alertas = await client.query('SELECT * FROM alertas_config ORDER BY nivel ASC')
    sql += `-- 3. TABLA: alertas_config (${alertas.rows.length} registros)\n`
    for (const a of alertas.rows) {
      sql += `INSERT INTO alertas_config (id, nombre, nivel, severidad, icono, color_hex, activa)
VALUES (${escapeSql(a.id)}, ${escapeSql(a.nombre)}, ${a.nivel}, ${escapeSql(a.severidad)}, ${escapeSql(a.icono)}, ${escapeSql(a.color_hex)}, ${a.activa})
ON CONFLICT (id) DO NOTHING;\n`
    }
    sql += '\n'

    // 4. Preguntas (44)
    const preguntas = await client.query('SELECT * FROM preguntas ORDER BY secuencia ASC')
    sql += `-- 4. TABLA: preguntas (${preguntas.rows.length} registros oficiales con opciones JSONB)\n`
    for (const p of preguntas.rows) {
      const opcionesJson = escapeSql(JSON.stringify(p.opciones))
      sql += `INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES (${escapeSql(p.id)}, ${escapeSql(p.id_encuesta)}, ${p.secuencia}, ${escapeSql(p.bloque_id)}, ${escapeSql(p.categoria)}, ${escapeSql(p.texto)}, ${escapeSql(p.tipo)}, ${opcionesJson}::jsonb, ${p.es_obligatoria !== false})
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;\n`
    }
    sql += '\n'

    // 5. Respuestas (23)
    const respuestas = await client.query('SELECT * FROM respuestas ORDER BY created_at ASC')
    sql += `-- 5. TABLA: respuestas (${respuestas.rows.length} respuestas anónimas históricas)\n`
    for (const r of respuestas.rows) {
      const ubicacionJson = escapeSql(JSON.stringify(r.ubicacion || {}))
      const alertasJson = escapeSql(JSON.stringify(r.alertas_detectadas || []))
      const catAlertasJson = escapeSql(JSON.stringify(r.categorias_alerta || []))
      const respuestasJson = escapeSql(JSON.stringify(r.respuestas || []))

      sql += `INSERT INTO respuestas (id_respuesta, id_encuesta, titulo_encuesta, dispositivo_uuid, nombre_equipo_pc, cuenta_usuario_pc, ubicacion, fecha, hora, duracion_segundos, timestamp_iso, puntaje_general, alertas_detectadas, categorias_alerta, respuestas)
VALUES (${escapeSql(r.id_respuesta)}, ${escapeSql(r.id_encuesta)}, ${escapeSql(r.titulo_encuesta)}, ${escapeSql(r.dispositivo_uuid)}, ${escapeSql(r.nombre_equipo_pc || '')}, ${escapeSql(r.cuenta_usuario_pc || '')}, ${ubicacionJson}::jsonb, ${escapeSql(r.fecha)}, ${escapeSql(r.hora)}, ${r.duracion_segundos || 0}, ${escapeSql(r.timestamp_iso)}, ${r.puntaje_general || 5.0}, ${alertasJson}::jsonb, ${catAlertasJson}::jsonb, ${respuestasJson}::jsonb)
ON CONFLICT (id_respuesta) DO NOTHING;\n`
    }

    const outputPath = path.resolve(__dirname, '../../docker/init/02-data-dump.sql')
    fs.writeFileSync(outputPath, sql, 'utf-8')
    console.log(`[Dump] Archivo generado exitosamente en: ${outputPath}`)
    console.log(`[Dump] Total: ${usuarios.rows.length} usuarios, ${encuestas.rows.length} encuestas, ${preguntas.rows.length} preguntas, ${respuestas.rows.length} respuestas.`)

    client.release()
    await pool.end()
  } catch (error) {
    console.error('[Dump Error]:', error)
    process.exit(1)
  }
}

exportar()
