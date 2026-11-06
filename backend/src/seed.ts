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

async function seed() {
  try {
    const client = await pool.connect()
    console.log('[Seed] Conectado a la base de datos PostgreSQL...')

    // 1. Asegurar encuesta principal enc-001
    await client.query(`
      INSERT INTO encuestas (id, titulo, descripcion, departamento, creado_por, fecha_creacion, estado, total_respuestas, alertas_registradas, puntaje_promedio)
      VALUES (
        'enc-001',
        'ENCUESTA DE CLIMA LABORAL Y DESARROLLO ORGANIZACIONAL — CONTIGO CALL CENTER',
        'Nota de confidencialidad: Esta encuesta es 100% anónima. Su objetivo es identificar áreas de mejora y optimizar las condiciones de trabajo basándonos en tu opinión sincera.',
        'Operaciones & Clima Laboral',
        'Super Administrador',
        '15 Sep 2026',
        'Activa',
        23,
        1,
        4.4
      ) ON CONFLICT (id) DO NOTHING;
    `)

    // 2. Cargar preguntas.json
    const posiblesRutas = [
      path.resolve(__dirname, '../../frontend/src/database/preguntas.json'),
      path.resolve(__dirname, '../../frontend/src/Config/preguntas.json'),
      path.resolve(__dirname, '../../HablandoContigo/src/database/preguntas.json')
    ]
    const preguntasJsonPath = posiblesRutas.find(r => fs.existsSync(r))
    if (preguntasJsonPath) {
      const preguntas = JSON.parse(fs.readFileSync(preguntasJsonPath, 'utf-8'))
      console.log(`[Seed] Encontradas ${preguntas.length} preguntas en ${preguntasJsonPath}. Insertando...`)

      for (let i = 0; i < preguntas.length; i++) {
        const p = preguntas[i]
        await client.query(`
          INSERT INTO preguntas (id, id_encuesta, bloque_id, categoria, texto, tipo, opciones, secuencia)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE 
          SET id_encuesta = EXCLUDED.id_encuesta,
              bloque_id = EXCLUDED.bloque_id,
              categoria = EXCLUDED.categoria,
              texto = EXCLUDED.texto,
              tipo = EXCLUDED.tipo,
              opciones = EXCLUDED.opciones,
              secuencia = EXCLUDED.secuencia
        `, [
          p.id,
          'enc-001',
          p.bloqueId || 'bloque-1',
          p.categoria,
          p.texto,
          p.tipo || 'multiple',
          JSON.stringify(p.opciones || []),
          i + 1
        ])
      }
      console.log(`[Seed] ¡${preguntas.length} preguntas migradas e insertadas correctamente en PostgreSQL!`)
    }

    // 3. Cargar respuestas.json si existe
    const respuestasJsonPath = path.resolve(__dirname, '../../HablandoContigo/src/database/respuestas.json')
    if (fs.existsSync(respuestasJsonPath)) {
      const respuestas = JSON.parse(fs.readFileSync(respuestasJsonPath, 'utf-8'))
      console.log(`[Seed] Encontradas ${respuestas.length} respuestas previas. Insertando...`)

      for (const r of respuestas) {
        await client.query(`
          INSERT INTO respuestas (
            id_respuesta, id_encuesta, titulo_encuesta, dispositivo_uuid,
            nombre_equipo_pc, cuenta_usuario_pc, ubicacion, fecha, hora,
            duracion_segundos, timestamp_iso, puntaje_general, alertas_detectadas,
            categorias_alerta, respuestas
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id_respuesta) DO NOTHING
        `, [
          r.idRespuesta,
          r.idEncuesta || 'enc-001',
          r.tituloEncuesta || 'Encuesta de Clima Laboral',
          r.dispositivoUuid || 'uuid-anonimo',
          r.nombreEquipoPc || '',
          r.cuentaUsuarioPc || '',
          JSON.stringify(r.ubicacion || {}),
          r.fecha || '15/09/2026',
          r.hora || '12:00:00',
          r.duracionSegundos || 180,
          r.timestampIso || new Date().toISOString(),
          r.puntajeGeneral || 5.0,
          JSON.stringify(r.alertasDetectadas || []),
          JSON.stringify(r.categoriasAlerta || []),
          JSON.stringify(r.respuestas || [])
        ])
      }
      console.log(`[Seed] ¡${respuestas.length} respuestas migradas e insertadas con éxito!`)
    }

    client.release()
    await pool.end()
    console.log('[Seed] Proceso completado exitosamente.')
  } catch (err) {
    console.error('[Seed Error]:', err)
    process.exit(1)
  }
}

seed()
