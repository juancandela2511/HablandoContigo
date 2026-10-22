-- ============================================================================
-- ESQUEMA DE BASE DE DATOS POSTGRESQL (schema.sql)
-- Sistema: HablandoContigo
-- ============================================================================

-- 1. Tabla de Encuestas
CREATE TABLE IF NOT EXISTS encuestas (
  id VARCHAR(100) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  departamento VARCHAR(150) NOT NULL DEFAULT 'General',
  creado_por VARCHAR(150) NOT NULL DEFAULT 'Super Administrador',
  fecha_creacion VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Activa',
  total_respuestas INT DEFAULT 0,
  alertas_registradas INT DEFAULT 0,
  puntaje_promedio NUMERIC(3,1) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Preguntas
CREATE TABLE IF NOT EXISTS preguntas (
  id VARCHAR(100) PRIMARY KEY,
  id_encuesta VARCHAR(100) REFERENCES encuestas(id) ON DELETE CASCADE,
  bloque_id VARCHAR(50),
  categoria VARCHAR(150) NOT NULL,
  texto TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'multiple',
  opciones JSONB DEFAULT '[]'::jsonb,
  secuencia INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Respuestas Anónimas
CREATE TABLE IF NOT EXISTS respuestas (
  id_respuesta VARCHAR(100) PRIMARY KEY,
  id_encuesta VARCHAR(100) REFERENCES encuestas(id) ON DELETE CASCADE,
  titulo_encuesta VARCHAR(255) NOT NULL,
  dispositivo_uuid VARCHAR(100) NOT NULL,
  nombre_equipo_pc VARCHAR(150),
  cuenta_usuario_pc VARCHAR(150),
  ubicacion JSONB DEFAULT '{}'::jsonb,
  fecha VARCHAR(50) NOT NULL,
  hora VARCHAR(50) NOT NULL,
  duracion_segundos INT DEFAULT 0,
  timestamp_iso VARCHAR(100) NOT NULL,
  puntaje_general NUMERIC(3,1) DEFAULT 5.0,
  alertas_detectadas JSONB DEFAULT '[]'::jsonb,
  categorias_alerta JSONB DEFAULT '[]'::jsonb,
  respuestas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Cuentas y Usuarios Administrativos
CREATE TABLE IF NOT EXISTS cuentas (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  rol VARCHAR(100) NOT NULL DEFAULT 'Administrador',
  departamento VARCHAR(150) NOT NULL DEFAULT 'General',
  avatar TEXT,
  foto_url TEXT,
  biografia TEXT,
  telefono VARCHAR(50),
  password_hash VARCHAR(255) DEFAULT '1012332747Js',
  estado VARCHAR(50) DEFAULT 'Activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Histórico de Periodos Anuales
CREATE TABLE IF NOT EXISTS historico_periodos (
  id VARCHAR(100) PRIMARY KEY,
  id_encuesta VARCHAR(100),
  titulo_periodo VARCHAR(255) NOT NULL,
  anio INT NOT NULL,
  fecha_cierre VARCHAR(100) NOT NULL,
  total_respuestas INT DEFAULT 0,
  alertas_registradas INT DEFAULT 0,
  puntaje_promedio NUMERIC(3,1) DEFAULT 0.0,
  porcentaje_satisfaccion NUMERIC(5,2) DEFAULT 0.0,
  desglose_bloques JSONB DEFAULT '[]'::jsonb,
  cerrado_por VARCHAR(150) DEFAULT 'Super Administrador',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id VARCHAR(100) PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  mensaje TEXT,
  departamento VARCHAR(150),
  tipo_alerta VARCHAR(150),
  severidad VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'Detectada',
  fecha VARCHAR(50),
  leida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Configuración de Alertas Psicosociales
CREATE TABLE IF NOT EXISTS alertas_config (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  nivel INT NOT NULL DEFAULT 1,
  severidad VARCHAR(50) NOT NULL DEFAULT 'Crítica',
  icono VARCHAR(50) DEFAULT 'AlertTriangle',
  color_hex VARCHAR(20) DEFAULT '#ef4444',
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DATOS SEMILLA INICIALES (SEED DATA)
-- ============================================================================

-- Insertar Encuesta Troncal Oficial por defecto si no existe
INSERT INTO encuestas (id, titulo, descripcion, departamento, creado_por, fecha_creacion, estado, total_respuestas, alertas_registradas, puntaje_promedio)
VALUES (
  'enc-001',
  'ENCUESTA DE CLIMA LABORAL Y DESARROLLO ORGANIZACIONAL — CONTIGO CALL CENTER',
  'Nota de confidencialidad: Esta encuesta es 100% anónima. Su objetivo es identificar áreas de mejora y optimizar las condiciones de trabajo basándonos en tu opinión sincera. Por favor, responde cada pregunta de forma independiente.',
  'Operaciones & Clima Laboral',
  'Super Administrador',
  '15 Sep 2026',
  'Activa',
  23,
  1,
  4.4
) ON CONFLICT (id) DO NOTHING;

-- Insertar Cierre Histórico Anual 2025 por defecto
INSERT INTO historico_periodos (id, id_encuesta, titulo_periodo, anio, fecha_cierre, total_respuestas, alertas_registradas, puntaje_promedio, porcentaje_satisfaccion, desglose_bloques, cerrado_por, notas)
VALUES (
  'hist-2025',
  'enc-001',
  'Cierre Anual 2025 - Clima Organizacional',
  2025,
  '2025-12-15T18:00:00.000Z',
  48,
  5,
  4.2,
  84.00,
  '[{"bloque": 1, "nombre": "Liderazgo & Gestión", "satisfaccion": 90.0}, {"bloque": 2, "nombre": "Cultura & Pertenencia", "satisfaccion": 80.0}, {"bloque": 3, "nombre": "Ambiente Físico & Herramientas", "satisfaccion": 82.0}]'::jsonb,
  'Super Administrador',
  'Cierre oficial del periodo 2025'
) ON CONFLICT (id) DO NOTHING;

-- Insertar Cuenta Única Administrativa Centralizada
INSERT INTO cuentas (id, nombre, email, rol, departamento, avatar, foto_url, biografia, telefono, estado)
VALUES (
  'cta-001',
  'Juan Sebastián Candela',
  'jscandela@ontime.es',
  'Super Administrador',
  'Tecnología & Soporte TI',
  '',
  '',
  'Gestión y administración integral de clima laboral.',
  '',
  'Activo'
) ON CONFLICT (id) DO NOTHING;
