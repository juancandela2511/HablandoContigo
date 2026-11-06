/**
 * Script rápido de prueba de conexión a PostgreSQL.
 * Ejecutar con:  npx tsx test-db-connection.ts
 */
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mi_base_datos',
  connectionTimeoutMillis: 5000
})

async function testConnection() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Test de Conexión PostgreSQL')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  Host:     ${process.env.DB_HOST || '127.0.0.1'}`)
  console.log(`  Port:     ${process.env.DB_PORT || 5432}`)
  console.log(`  User:     ${process.env.DB_USER || 'postgres'}`)
  console.log(`  Database: ${process.env.DB_NAME || 'mi_base_datos'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  let client
  try {
    console.log('\n⏳ Conectando...')
    client = await pool.connect()
    const res = await client.query('SELECT NOW() as now, version() as version;')
    console.log('✅ ¡Conexión exitosa!')
    console.log(`   Timestamp DB: ${res.rows[0].now}`)
    console.log(`   Motor:        ${res.rows[0].version.split(',')[0]}`)

    // Verificar que las tablas principales existen
    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)
    console.log(`\n📋 Tablas encontradas (${tablesRes.rows.length}):`)
    tablesRes.rows.forEach((r: any) => console.log(`   - ${r.table_name}`))

  } catch (err: any) {
    console.error('❌ Error de conexión:', err.message)
    if (err.code === 'ECONNREFUSED') {
      console.error('\n💡 Sugerencias:')
      console.error('   1. Verifica que PostgreSQL esté corriendo: docker ps')
      console.error('   2. Levanta los contenedores:  docker compose up -d postgres-db')
      console.error('   3. Verifica el puerto:  netstat -ano | findstr 5432')
    }
    process.exit(1)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

testConnection()
