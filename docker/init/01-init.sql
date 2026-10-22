-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN COMPLETA DE BASE DE DATOS (docker/init/01-init.sql)
-- Arquitectura: Tipo Supabase / Enterprise PostgreSQL 16+
-- Seguridad Criptográfica, Cero Pérdida de Datos y Alta Resiliencia
-- ============================================================================

-- 1. EXTENSIONES ESENCIALES (Criptografía y UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: usuarios (con contraseñas blindadas mediante pgcrypto / Blowfish)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'Administrador' CHECK (rol IN ('Super Administrador', 'Administrador', 'Auditor', 'Gestor')),
  departamento VARCHAR(150) DEFAULT 'General',
  avatar TEXT,
  foto_url TEXT,
  biografia TEXT,
  telefono VARCHAR(50),
  estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Vista o alias de compatibilidad con cuentas
CREATE OR REPLACE VIEW cuentas AS 
SELECT 
  id::text,
  nombre,
  email,
  rol,
  departamento,
  avatar,
  foto_url,
  biografia,
  telefono,
  password_hash,
  estado,
  created_at
FROM usuarios;

-- 3. TABLA: encuestas (Campañas y periodos)
CREATE TABLE IF NOT EXISTS encuestas (
  id VARCHAR(100) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  departamento VARCHAR(150) NOT NULL DEFAULT 'General',
  creado_por VARCHAR(150) NOT NULL DEFAULT 'Super Administrador',
  fecha_creacion VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Borrador', 'Cerrada', 'Archivada')),
  total_respuestas INT DEFAULT 0,
  alertas_registradas INT DEFAULT 0,
  puntaje_promedio NUMERIC(3,1) DEFAULT 5.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: preguntas (Las preguntas de clima con JSONB y opciones)
CREATE TABLE IF NOT EXISTS preguntas (
  id VARCHAR(100) PRIMARY KEY,
  id_encuesta VARCHAR(100) NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  secuencia INT NOT NULL DEFAULT 1,
  bloque_id VARCHAR(50) NOT NULL,
  categoria VARCHAR(150) NOT NULL,
  texto TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'multiple' CHECK (tipo IN ('multiple', 'escala', 'texto', 'booleano')),
  opciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  es_obligatoria BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: respuestas (Envíos de colaboradores anónimos o identificados)
CREATE TABLE IF NOT EXISTS respuestas (
  id_respuesta VARCHAR(100) PRIMARY KEY,
  id_encuesta VARCHAR(100) NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  id_usuario UUID REFERENCES usuarios(id) ON DELETE SET NULL,
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
  respuestas JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: historico_periodos (Comparativas anuales)
CREATE TABLE IF NOT EXISTS historico_periodos (
  id VARCHAR(100) PRIMARY KEY,
  id_encuesta VARCHAR(100) REFERENCES encuestas(id) ON DELETE SET NULL,
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
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id VARCHAR(100) PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  mensaje TEXT,
  departamento VARCHAR(150),
  tipo_alerta VARCHAR(150),
  severidad VARCHAR(50) DEFAULT 'Moderada',
  estado VARCHAR(50) DEFAULT 'Detectada',
  fecha VARCHAR(50),
  leida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA: alertas_config
CREATE TABLE IF NOT EXISTS alertas_config (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  nivel INT NOT NULL DEFAULT 1,
  severidad VARCHAR(50) NOT NULL DEFAULT 'Crítica',
  icono VARCHAR(50) DEFAULT 'AlertTriangle',
  color_hex VARCHAR(20) DEFAULT '#ef4444',
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ÍNDICES DE ALTO RENDIMIENTO (B-TREE & GIN PARA JSONB)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_preguntas_encuesta_secuencia ON preguntas(id_encuesta, secuencia);
CREATE INDEX IF NOT EXISTS idx_preguntas_bloque ON preguntas(bloque_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_opciones_gin ON preguntas USING GIN (opciones);
CREATE INDEX IF NOT EXISTS idx_respuestas_encuesta ON respuestas(id_encuesta);
CREATE INDEX IF NOT EXISTS idx_respuestas_dispositivo ON respuestas(dispositivo_uuid);
CREATE INDEX IF NOT EXISTS idx_respuestas_gin ON respuestas USING GIN (respuestas);
CREATE INDEX IF NOT EXISTS idx_respuestas_alertas_gin ON respuestas USING GIN (alertas_detectadas);

-- ============================================================================
-- FUNCIÓN Y TRIGGER: ENCRIPTACIÓN AUTOMÁTICA DE CONTRASEÑAS (Blowfish / bcrypt)
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_hash_password_usuarios()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el password_hash no comienza con un hash válido bcrypt ($2a$ o $2b$), se encripta automáticamente
  IF NEW.password_hash IS NOT NULL AND NEW.password_hash NOT LIKE '$2%' THEN
    NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf', 10));
  END IF;
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_hash_password ON usuarios;
CREATE TRIGGER trigger_hash_password
BEFORE INSERT OR UPDATE OF password_hash ON usuarios
FOR EACH ROW
EXECUTE FUNCTION trg_hash_password_usuarios();

-- Trigger para actualizar total_respuestas en encuestas al ingresar una respuesta
CREATE OR REPLACE FUNCTION trg_actualizar_metricas_encuesta()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE encuestas
  SET total_respuestas = (SELECT COUNT(*) FROM respuestas WHERE id_encuesta = NEW.id_encuesta),
      puntaje_promedio = COALESCE((SELECT ROUND(AVG(puntaje_general), 1) FROM respuestas WHERE id_encuesta = NEW.id_encuesta), 5.0),
      alertas_registradas = (SELECT COUNT(*) FROM respuestas WHERE id_encuesta = NEW.id_encuesta AND jsonb_array_length(alertas_detectadas) > 0),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id_encuesta;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_metricas ON respuestas;
CREATE TRIGGER trigger_actualizar_metricas
AFTER INSERT OR DELETE ON respuestas
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_metricas_encuesta();

-- ============================================================================
-- SEED DATA INICIAL
-- ============================================================================

-- 1. Insertar Usuario Super Administrador con contraseña '1012332747Js'
-- El trigger la encriptará con pgcrypto blowfish automáticamente
INSERT INTO usuarios (id, nombre, email, password_hash, rol, departamento, biografia, estado)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Juan Sebastián Candela',
  'jscandela@ontime.es',
  '1012332747Js',
  'Super Administrador',
  'Tecnología & Soporte TI',
  'Administración y gestión integral de clima organizacional.',
  'Activo'
) ON CONFLICT (email) DO NOTHING;

-- 2. Encuesta Base Troncal
INSERT INTO encuestas (id, titulo, descripcion, departamento, creado_por, fecha_creacion, estado, total_respuestas, alertas_registradas, puntaje_promedio)
VALUES (
  'enc-001',
  'ENCUESTA DE CLIMA LABORAL Y DESARROLLO ORGANIZACIONAL — CONTIGO CALL CENTER',
  'Nota de confidencialidad: Esta encuesta es 100% anónima. Su objetivo es identificar áreas de mejora y optimizar las condiciones de trabajo basándonos en tu opinión sincera.',
  'Operaciones & Clima Laboral',
  'Super Administrador',
  '15 Sep 2026',
  'Activa',
  0,
  0,
  5.0
) ON CONFLICT (id) DO NOTHING;

-- 3. Configuración de alertas base
INSERT INTO alertas_config (id, nombre, nivel, severidad, icono, color_hex, activa)
VALUES 
  ('alt-1', 'Acoso o Conflicto Laboral', 1, 'Crítica', 'AlertTriangle', '#ef4444', TRUE),
  ('alt-2', 'Sobrecarga y Burnout', 2, 'Alta', 'Zap', '#f97316', TRUE),
  ('alt-3', 'Insatisfacción Salarial / Beneficios', 3, 'Moderada', 'TrendingDown', '#eab308', TRUE)
ON CONFLICT (id) DO NOTHING;
