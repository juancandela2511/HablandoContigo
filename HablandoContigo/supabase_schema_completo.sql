-- ============================================================================
-- SCRIPT SQL COMPLETO PARA SUPABASE — HABLANDOCONTIGO (PRODUCCIÓN)
-- ============================================================================
-- Este script crea todas las tablas, índices, políticas de seguridad (RLS)
-- y datos iniciales para conectar al 100% todo el proyecto HablandoContigo.
--
-- INSTRUCCIONES:
-- 1. Entra a tu proyecto en Supabase (https://supabase.com/dashboard).
-- 2. Ve a la pestaña "SQL Editor".
-- 3. Pega todo este código y haz clic en "Run".
-- ============================================================================

-- 0. HABILITAR EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLA: cuentas_admin (Cuentas, Roles y Credenciales de Administradores)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cuentas_admin (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT NOT NULL DEFAULT 'Administrador',
    departamento TEXT NOT NULL DEFAULT 'General',
    estado TEXT NOT NULL DEFAULT 'Activo',
    contrasena TEXT NOT NULL DEFAULT 'Admin123*',
    avatar TEXT,
    foto_url TEXT,
    creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 2. TABLA: encuestas (Cuestionarios, Preguntas y Métricas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.encuestas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    departamento TEXT NOT NULL DEFAULT 'General',
    estado TEXT NOT NULL DEFAULT 'activa',
    fecha_creacion TEXT NOT NULL DEFAULT 'Hoy',
    total_respuestas INTEGER DEFAULT 0,
    promedio_satisfaccion NUMERIC DEFAULT 0,
    duracion_estimada TEXT DEFAULT '3 min',
    es_publica BOOLEAN DEFAULT true,
    preguntas JSONB DEFAULT '[]'::jsonb NOT NULL,
    preguntas_seguimiento JSONB DEFAULT '[]'::jsonb,
    creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 3. TABLA: respuestas_anonimas (Respuestas, Auditoría UUID, GPS y Hostname)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.respuestas_anonimas (
    id TEXT PRIMARY KEY,
    id_respuesta TEXT,
    id_encuesta TEXT NOT NULL,
    titulo_encuesta TEXT NOT NULL DEFAULT 'Encuesta de Clima Laboral',
    dispositivo_uuid TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    timestamp_iso TEXT,
    duracion_segundos INTEGER DEFAULT 0,
    puntaje_general NUMERIC DEFAULT 0,
    nombre_equipo_pc TEXT,
    cuenta_usuario_pc TEXT,
    alertas_detectadas TEXT[] DEFAULT '{}',
    categorias_alerta TEXT[] DEFAULT '{}',
    es_descartada_por_velocidad BOOLEAN DEFAULT false,
    respuestas JSONB DEFAULT '[]'::jsonb NOT NULL,
    ubicacion JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 4. TABLA: notificaciones_alertas (Incidentes, Alertas IA y Notificaciones)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notificaciones_alertas (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL DEFAULT 'alerta',
    titulo TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    mensaje TEXT DEFAULT '',
    departamento TEXT NOT NULL DEFAULT 'General',
    tipo_alerta TEXT,
    severidad TEXT DEFAULT 'Moderada',
    estado TEXT DEFAULT 'Detectada',
    detalle_respuesta TEXT,
    dispositivo_uuid TEXT,
    nombre_equipo_pc TEXT,
    cuenta_usuario_pc TEXT,
    ubicacion_sede TEXT DEFAULT 'Sede Principal',
    fecha TEXT NOT NULL DEFAULT 'Hoy',
    hora TEXT NOT NULL DEFAULT '12:00 PM',
    leida BOOLEAN DEFAULT false,
    ruta_destino TEXT DEFAULT '/dashboard',
    id_elemento TEXT,
    estado_alerta TEXT,
    mensaje_capturado TEXT,
    clasificacion TEXT,
    motivo_detallado TEXT,
    prioridad TEXT,
    creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 5. TABLA: tipos_alertas_config (Criterios y Niveles Creados por Admin)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tipos_alertas_config (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    nivel INTEGER DEFAULT 1 NOT NULL,
    severidad TEXT DEFAULT 'Crítica' NOT NULL,
    modo_enfoque TEXT DEFAULT 'especifico' NOT NULL,
    enfoque_detalle TEXT,
    palabras_clave TEXT[] DEFAULT '{}',
    protocolo_accion TEXT,
    icono TEXT DEFAULT 'ShieldAlert',
    activa BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS) Y POLÍTICAS PÚBLICAS TOTALES
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.cuentas_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_anonimas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_alertas_config ENABLE ROW LEVEL SECURITY;

-- Crear políticas universales (Permitir lectura, inserción, actualización y eliminación a la app)
DROP POLICY IF EXISTS "Acceso universal cuentas_admin" ON public.cuentas_admin;
CREATE POLICY "Acceso universal cuentas_admin" ON public.cuentas_admin FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso universal encuestas" ON public.encuestas;
CREATE POLICY "Acceso universal encuestas" ON public.encuestas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso universal respuestas_anonimas" ON public.respuestas_anonimas;
CREATE POLICY "Acceso universal respuestas_anonimas" ON public.respuestas_anonimas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso universal notificaciones_alertas" ON public.notificaciones_alertas;
CREATE POLICY "Acceso universal notificaciones_alertas" ON public.notificaciones_alertas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso universal tipos_alertas_config" ON public.tipos_alertas_config;
CREATE POLICY "Acceso universal tipos_alertas_config" ON public.tipos_alertas_config FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 7. ÍNDICES DE RENDIMIENTO Y CONSULTA RÁPIDA
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_encuestas_depto ON public.encuestas (departamento);
CREATE INDEX IF NOT EXISTS idx_respuestas_encuesta ON public.respuestas_anonimas (id_encuesta);
CREATE INDEX IF NOT EXISTS idx_respuestas_uuid ON public.respuestas_anonimas (dispositivo_uuid);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON public.notificaciones_alertas (tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_estado ON public.notificaciones_alertas (estado);

-- ============================================================================
-- 8. DATOS INICIALES SEMILLA (SEED DATA)
-- ============================================================================

-- A. Cuenta Super Administrador Inicial
INSERT INTO public.cuentas_admin (id, nombre, email, rol, departamento, estado, contrasena, avatar, foto_url)
VALUES (
    'usr-superadmin',
    'Juan Sebastian Candela',
    'admin@ontime.es',
    'Super Administrador',
    'Dirección General',
    'Activo',
    'Admin123*',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
)
ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    departamento = EXCLUDED.departamento,
    estado = EXCLUDED.estado;

-- B. Criterios de Alertas Base
INSERT INTO public.tipos_alertas_config (id, nombre, descripcion, nivel, severidad, modo_enfoque, enfoque_detalle, palabras_clave, protocolo_accion, icono, activa)
VALUES 
(
    'tipo-jefes-gestion',
    'Mala Gestión de los Jefes & Liderazgo Tóxico',
    'Conductas de abuso de poder, trato despectivo por parte de líderes, órdenes contradictorias, falta de empatía o favoritismo injustificado.',
    1,
    'Crítica',
    'especifico',
    'Enfócate en maltrato verbal, órdenes humillantes, autoritarismo y falta de escucha de supervisores y directores.',
    ARRAY['jefe', 'jefes', 'liderazgo', 'supervisor', 'mala gestión', 'favoritismo', 'autoritarismo', 'gritos', 'maltrato líder'],
    'Revisión prioritaria por Gestión Humana y citación a evaluación 360° del cuadro de mando.',
    'ShieldAlert',
    true
),
(
    'tipo-acoso',
    'Acoso Laboral & Hostigamiento',
    'Conductas de intimidación reiterada, amenazas, humillación pública, aislamiento deliberado o vulneración a la dignidad.',
    1,
    'Crítica',
    'especifico',
    'Enfócate en persecución laboral, acoso psicológico, amenazas de despido injustas y conductas denigrantes.',
    ARRAY['acoso', 'hostigamiento', 'humillación', 'amenaza', 'intimidación', 'insulto', 'maltrato', 'mobbing'],
    'Activación inmediata del Comité de Convivencia con medidas de protección confidencial.',
    'ShieldAlert',
    true
),
(
    'tipo-depresion',
    'Crisis Anímica & Salud Mental',
    'Estados de tristeza profunda, depresión severa, desánimo extremo, fatiga emocional crónica o ideaciones de daño.',
    1,
    'Crítica',
    'especifico',
    'Enfócate en desánimo severo, llanto recurrente, sensación de vacío o colapso emocional.',
    ARRAY['depresión', 'crisis', 'tristeza profunda', 'desánimo', 'desesperanza', 'llanto', 'daño', 'vacío emocional'],
    'Ofrecer contención psicológica confidencial inmediata y activación del canal de Bienestar.',
    'HeartCrack',
    true
)
ON CONFLICT (id) DO NOTHING;

-- C. Notificaciones Base de Sistema
INSERT INTO public.notificaciones_alertas (id, tipo, titulo, descripcion, mensaje, departamento, fecha, hora, leida, ruta_destino)
VALUES 
(
    'notif-init-1',
    'sistema',
    'Sistema Conectado a Supabase',
    'Base de datos en la nube conectada y lista para recibir datos.',
    'Se ha establecido conexión segura con Supabase. Todas las tablas, auditorías y alertas operan en tiempo real.',
    'Dirección General',
    'Hoy',
    '08:00 AM',
    false,
    '/dashboard'
)
ON CONFLICT (id) DO NOTHING;
