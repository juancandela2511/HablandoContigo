-- ============================================================================
-- SCRIPT SQL COMPLETO PARA SUPABASE — HABLANDOCONTIGO (PRODUCCIÓN / MIGRACIÓN SEGURA)
-- ============================================================================
-- Este script es 100% IDEMPOTENTE y SEGURO:
-- 1. Crea las tablas si no existen.
-- 2. Si las tablas YA EXISTÍAN previamente, agrega automáticamente cualquier 
--    columna faltante (como 'contrasena', 'verificado', 'preguntas', etc.) sin borrar tus datos.
-- 3. Habilita RLS y crea políticas universales de lectura/escritura.
-- 4. Inserta o actualiza los datos semilla sin conflictos.
--
-- INSTRUCCIONES:
-- 1. Entra a tu proyecto en Supabase (https://supabase.com/dashboard).
-- 2. Ve al menú lateral "SQL Editor" -> "+ New query".
-- 3. Pega TODO este código y haz clic en "Run".
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
    verificado BOOLEAN DEFAULT true,
    token_verificacion TEXT,
    biografia TEXT DEFAULT 'Gestión y análisis de clima laboral.',
    telefono TEXT DEFAULT '',
    avatar TEXT,
    foto_url TEXT,
    creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Garantizar que existan todas las columnas si la tabla ya existía previamente
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS contrasena TEXT DEFAULT 'Admin123*';
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT true;
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS token_verificacion TEXT;
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS biografia TEXT DEFAULT 'Gestión y análisis de clima laboral.';
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS telefono TEXT DEFAULT '';
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'Administrador';
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT 'General';
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Activo';
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE public.cuentas_admin ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

-- ============================================================================
-- 2. TABLA: encuestas (Cuestionarios, Preguntas y Métricas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.encuestas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    departamento TEXT NOT NULL DEFAULT 'General',
    creado_por TEXT DEFAULT 'Super Administrador',
    fecha_creacion TEXT NOT NULL DEFAULT 'Hoy',
    estado TEXT NOT NULL DEFAULT 'Activa',
    total_respuestas INTEGER DEFAULT 0,
    alertas_registradas INTEGER DEFAULT 0,
    puntaje_promedio NUMERIC DEFAULT 5.0,
    duracion_estimada TEXT DEFAULT '3 min',
    es_publica BOOLEAN DEFAULT true,
    preguntas JSONB DEFAULT '[]'::jsonb NOT NULL,
    preguntas_seguimiento JSONB DEFAULT '[]'::jsonb,
    creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Garantizar que existan todas las columnas si la tabla ya existía previamente
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS descripcion TEXT DEFAULT '';
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT 'General';
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS creado_por TEXT DEFAULT 'Super Administrador';
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS fecha_creacion TEXT DEFAULT 'Hoy';
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Activa';
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS total_respuestas INTEGER DEFAULT 0;
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS alertas_registradas INTEGER DEFAULT 0;
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS puntaje_promedio NUMERIC DEFAULT 5.0;
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS duracion_estimada TEXT DEFAULT '3 min';
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS es_publica BOOLEAN DEFAULT true;
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS preguntas JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS preguntas_seguimiento JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.encuestas ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

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

-- Garantizar que existan todas las columnas si la tabla ya existía previamente
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS id_respuesta TEXT;
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS titulo_encuesta TEXT DEFAULT 'Encuesta de Clima Laboral';
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS timestamp_iso TEXT;
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS duracion_segundos INTEGER DEFAULT 0;
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS puntaje_general NUMERIC DEFAULT 0;
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS nombre_equipo_pc TEXT;
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS cuenta_usuario_pc TEXT;
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS alertas_detectadas TEXT[] DEFAULT '{}';
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS categorias_alerta TEXT[] DEFAULT '{}';
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS es_descartada_por_velocidad BOOLEAN DEFAULT false;
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS respuestas JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS ubicacion JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.respuestas_anonimas ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

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

-- Garantizar que existan todas las columnas si la tabla ya existía previamente
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'alerta';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS descripcion TEXT DEFAULT '';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS mensaje TEXT DEFAULT '';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT 'General';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS tipo_alerta TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS severidad TEXT DEFAULT 'Moderada';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Detectada';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS detalle_respuesta TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS dispositivo_uuid TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS nombre_equipo_pc TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS cuenta_usuario_pc TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS ubicacion_sede TEXT DEFAULT 'Sede Principal';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS fecha TEXT DEFAULT 'Hoy';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS hora TEXT DEFAULT '12:00 PM';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS leida BOOLEAN DEFAULT false;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS ruta_destino TEXT DEFAULT '/dashboard';
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS id_elemento TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS estado_alerta TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS mensaje_capturado TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS clasificacion TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS motivo_detallado TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS prioridad TEXT;
ALTER TABLE public.notificaciones_alertas ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

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

-- Garantizar que existan todas las columnas si la tabla ya existía previamente
ALTER TABLE public.tipos_alertas_config ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT 1;
ALTER TABLE public.tipos_alertas_config ADD COLUMN IF NOT EXISTS severidad TEXT DEFAULT 'Crítica';
ALTER TABLE public.tipos_alertas_config ADD COLUMN IF NOT EXISTS modo_enfoque TEXT DEFAULT 'especifico';
ALTER TABLE public.tipos_alertas_config ADD COLUMN IF NOT EXISTS enfoque_detalle TEXT;
ALTER TABLE public.tipos_alertas_config ADD COLUMN IF NOT EXISTS palabras_clave TEXT[] DEFAULT '{}';
ALTER TABLE public.tipos_alertas_config ADD COLUMN IF NOT EXISTS protocolo_accion TEXT;
ALTER TABLE public.tipos_alertas_config ADD COLUMN IF NOT EXISTS icono TEXT DEFAULT 'ShieldAlert';
ALTER TABLE public.tipos_alertas_config ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;
ALTER TABLE public.tipos_alertas_config ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

-- ============================================================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS) Y POLÍTICAS PÚBLICAS TOTALES
-- ============================================================================

ALTER TABLE public.cuentas_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_anonimas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_alertas_config ENABLE ROW LEVEL SECURITY;

-- Políticas universales (Permitir lectura, inserción, actualización y eliminación a la app)
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
-- ============================================================================
-- 8. STORAGE BUCKET PARA AVATARES Y POLÍTICAS DE SUBIDA
-- ============================================================================
DO $$ 
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('avatars', 'avatars', true) 
    ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Storage Avatars" ON storage.objects;
    CREATE POLICY "Public Storage Avatars" ON storage.objects FOR ALL USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

-- 9. DATOS INICIALES SEMILLA (SEED DATA)
-- ============================================================================

-- A. Cuentas de Administradores Iniciales
INSERT INTO public.cuentas_admin (id, nombre, email, rol, departamento, estado, contrasena, avatar, foto_url)
VALUES 
(
    'usr-superadmin',
    'Juan Sebastian Candela',
    'admin@ontime.es',
    'Super Administrador',
    'Dirección General',
    'Activo',
    'Admin123*',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
),
(
    'cta-002',
    'Carolina Gómez',
    'carolina.gomez@ontime.es',
    'Administrador',
    'Recursos Humanos y Cultura',
    'Activo',
    'Admin123*',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
),
(
    'cta-003',
    'Andrés Morales',
    'andres.morales@ontime.es',
    'Supervisor',
    'Operaciones y Contact Center',
    'Activo',
    'Admin123*',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
),
(
    'cta-004',
    'Valeria Martínez',
    'valeria.martinez@ontime.es',
    'Analista RRHH',
    'Recursos Humanos y Cultura',
    'Activo',
    'Admin123*',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'
)
ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    departamento = EXCLUDED.departamento,
    estado = EXCLUDED.estado,
    contrasena = COALESCE(public.cuentas_admin.contrasena, EXCLUDED.contrasena);

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

-- D. Encuesta Troncal Oficial de Clima Laboral (34 preguntas completas)
INSERT INTO public.encuestas (
    id, 
    titulo, 
    descripcion, 
    departamento, 
    creado_por, 
    fecha_creacion, 
    estado, 
    total_respuestas, 
    alertas_registradas, 
    puntaje_promedio, 
    duracion_estimada, 
    es_publica, 
    preguntas, 
    preguntas_seguimiento
)
VALUES (
    'enc-001',
    'ENCUESTA DE CLIMA LABORAL Y DESARROLLO ORGANIZACIONAL — CONTIGO CALL CENTER',
    'Nota de confidencialidad: Esta encuesta es 100% anónima. Su objetivo es identificar áreas de mejora y optimizar las condiciones de trabajo basándonos en tu opinión sincera. Por favor, responde cada pregunta de forma independiente.',
    'General',
    'Super Administrador',
    'Hoy',
    'Activa',
    0,
    0,
    5.0,
    '5 min',
    true,
    '[{"id":"b1-p1-antiguedad","categoria":"Bloque 1: Datos de Contexto y Segmentación","texto":"Pregunta 1 — ¿Cuál es su antigüedad en la empresa?","tipo":"multiple","opciones":[{"id":"ant-1","texto":"Menos de 6 meses","valor":1,"esAlerta":false},{"id":"ant-2","texto":"De 6 meses a 1 año","valor":2,"esAlerta":false},{"id":"ant-3","texto":"De 1 a 3 años","valor":3,"esAlerta":false},{"id":"ant-4","texto":"Más de 3 años","valor":4,"esAlerta":false}]},{"id":"b1-p2-area","categoria":"Bloque 1: Datos de Contexto y Segmentación","texto":"Pregunta 2 — ¿A qué área o departamento pertenece?","tipo":"multiple","opciones":[{"id":"area-1","texto":"Operaciones / Call Center","valor":1,"esAlerta":false},{"id":"area-2","texto":"Gestión Humana / RRHH","valor":2,"esAlerta":false},{"id":"area-3","texto":"Calidad y Control","valor":3,"esAlerta":false},{"id":"area-4","texto":"Tecnología / IT","valor":4,"esAlerta":false},{"id":"area-5","texto":"Comercial / Ventas","valor":5,"esAlerta":false},{"id":"area-6","texto":"Finanzas / Contabilidad","valor":6,"esAlerta":false},{"id":"area-7","texto":"Administrativo / Gerencia","valor":7,"esAlerta":false},{"id":"area-8","texto":"Otro","valor":8,"esAlerta":false}]},{"id":"b2-p3-gusto","categoria":"Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo","texto":"Pregunta 3 — En términos generales, ¿qué tan a gusto, motivado/a y cómodo/a se siente trabajando en esta empresa?","tipo":"multiple","opciones":[{"id":"b2p3-1","texto":"Muy a gusto y motivado/a","valor":5,"esAlerta":false},{"id":"b2p3-2","texto":"Satisfecho/a de manera regular","valor":3,"esAlerta":false},{"id":"b2p3-3","texto":"Poco a gusto / Indiferente","valor":2,"esAlerta":true},{"id":"b2p3-4","texto":"Nada a gusto / Incómodo/a","valor":1,"esAlerta":true}]},{"id":"b2-p4-parte-equipo","categoria":"Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo","texto":"Pregunta 4 — Siento que realmente hago parte del equipo de trabajo y que mi presencia y labor son valoradas.","tipo":"escala","esSensibleAcoso":false,"opciones":[{"id":"b2p4-ta","texto":"Totalmente de acuerdo","valor":5,"esAlerta":false},{"id":"b2p4-da","texto":"De acuerdo","valor":4,"esAlerta":false},{"id":"b2p4-de","texto":"En desacuerdo","valor":2,"esAlerta":true},{"id":"b2p4-td","texto":"Totalmente en desacuerdo","valor":1,"esAlerta":true}]},{"id":"b2-p5-estres","categoria":"Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo","texto":"Pregunta 5 — Los trabajadores de la empresa sufren de alto estrés debido a la exigencia del trabajo.","tipo":"multiple","opciones":[{"id":"b2p5-si","texto":"Sí","valor":1,"esAlerta":true},{"id":"b2p5-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b2p5-no","texto":"No","valor":5,"esAlerta":false}]},{"id":"b2-p6-herramientas","categoria":"Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo","texto":"Pregunta 6 — Cuento con los implementos, herramientas, equipos y mobiliario ergonómico óptimos para desarrollar mis funciones sin contratiempos.","tipo":"multiple","opciones":[{"id":"b2p6-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b2p6-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b2p6-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b2-p7-espacios","categoria":"Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo","texto":"Pregunta 7 — Considero que los espacios de trabajo (oficinas, iluminación, ventilación y zonas de descanso) son limpios, adecuados y seguros.","tipo":"multiple","opciones":[{"id":"b2p7-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b2p7-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b2p7-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b3-p8-trabajo-equipo","categoria":"Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo","texto":"Pregunta 8 — Mis compañeros y yo trabajamos juntos de manera práctica, coordinada y efectiva.","tipo":"escala","opciones":[{"id":"b3p8-ta","texto":"Totalmente de acuerdo","valor":5,"esAlerta":false},{"id":"b3p8-da","texto":"De acuerdo","valor":4,"esAlerta":false},{"id":"b3p8-de","texto":"En desacuerdo","valor":2,"esAlerta":true},{"id":"b3p8-td","texto":"Totalmente en desacuerdo","valor":1,"esAlerta":true}]},{"id":"b3-p9-comunicacion","categoria":"Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo","texto":"Pregunta 9 — Existe buena comunicación entre los compañeros de trabajo.","tipo":"multiple","opciones":[{"id":"b3p9-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b3p9-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b3p9-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b3-p10-trato-equitativo","categoria":"Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo","texto":"Pregunta 10 — Es equitativo el trato y el trabajo en mi área.","tipo":"multiple","opciones":[{"id":"b3p10-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b3p10-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b3p10-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b3-p11-convivencia","categoria":"Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo","texto":"Pregunta 11 — ¿Cómo califica la convivencia general con los demás miembros de la empresa?","tipo":"multiple","opciones":[{"id":"b3p11-1","texto":"Excelente (ambiente de apoyo y armonía)","valor":5,"esAlerta":false},{"id":"b3p11-2","texto":"Buena (relación cordial)","valor":4,"esAlerta":false},{"id":"b3p11-3","texto":"Regular (hay indiferencia o poca cooperación)","valor":2,"esAlerta":true},{"id":"b3p11-4","texto":"Mala (existen tensiones o fricciones frecuentes)","valor":1,"esAlerta":true}]},{"id":"b3-p12-conflictos","categoria":"Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo","texto":"Pregunta 12 — ¿Existen actualmente problemas, roces o conflictos de convivencia con algún compañero o área específica? Si respondió Sí, indique brevemente el contexto.","tipo":"multiple","esSensibleAcoso":true,"tieneBifurcacion":true,"opciones":[{"id":"b3p12-no","texto":"No, ninguno","valor":5,"esAlerta":false},{"id":"b3p12-si","texto":"Sí (indique el contexto en el campo de texto)","valor":1,"esAlerta":true}]},{"id":"b3-p12b-conflictos-detalle","categoria":"Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo","texto":"Pregunta 12b — Si respondió \"Sí\" en la pregunta anterior, describa brevemente el contexto del conflicto:","tipo":"texto","esCondicional":true,"disparadorPor":"b3-p12-conflictos","valoresDisparo":["Sí (indique el contexto en el campo de texto)"],"opciones":[]},{"id":"b4-p13-claridad-jefe","categoria":"Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato","texto":"Pregunta 13 — Mi jefe inmediato es claro, preciso y oportuno con las instrucciones y directrices que da para realizar el trabajo.","tipo":"multiple","opciones":[{"id":"b4p13-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b4p13-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b4p13-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b4-p14-info-oportuna","categoria":"Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato","texto":"Pregunta 14 — Recibo de forma oportuna la información clara y necesaria para desempeñar mis funciones correctamente.","tipo":"multiple","opciones":[{"id":"b4p14-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b4p14-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b4p14-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b4-p15-accesibilidad-jefe","categoria":"Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato","texto":"Pregunta 15 — Es fácil hablar con mi jefe inmediato sobre temas relacionados al trabajo, resolver dudas o plantear dificultades.","tipo":"multiple","opciones":[{"id":"b4p15-1","texto":"Sí, es muy accesible y abierto/a","valor":5,"esAlerta":false},{"id":"b4p15-2","texto":"Más o menos / Depende del momento","valor":3,"esAlerta":false},{"id":"b4p15-3","texto":"No, resulta poco accesible o intimidante","valor":1,"esAlerta":true}]},{"id":"b4-p16-escucha-jefe","categoria":"Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato","texto":"Pregunta 16 — Siento que mi jefe inmediato escucha verdaderamente al personal y toma en cuenta mis opiniones y sugerencias.","tipo":"multiple","opciones":[{"id":"b4p16-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b4p16-av","texto":"A veces","valor":3,"esAlerta":false},{"id":"b4p16-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b4-p17-feedback","categoria":"Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato","texto":"Pregunta 17 — Recibo feedback (retroalimentación) constructivo y constante por parte de mi jefe inmediato para mejorar mi desempeño.","tipo":"multiple","opciones":[{"id":"b4p17-1","texto":"Sí, de manera constante","valor":5,"esAlerta":false},{"id":"b4p17-2","texto":"Solo cuando hay errores","valor":2,"esAlerta":false},{"id":"b4p17-3","texto":"No, nunca recibo feedback","valor":1,"esAlerta":true}]},{"id":"b5-p18-capacitacion","categoria":"Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana","texto":"Pregunta 18 — He recibido las capacitaciones adecuadas y oportunas para desempeñar con éxito el trabajo que me corresponde.","tipo":"multiple","opciones":[{"id":"b5p18-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p18-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p18-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b5-p19-plan-carrera","categoria":"Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana","texto":"Pregunta 19 — El plan carrera de la compañía permite un crecimiento personal y profesional real para los colaboradores.","tipo":"multiple","opciones":[{"id":"b5p19-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p19-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p19-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b5-p20-nomina","categoria":"Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana","texto":"Pregunta 20 — El proceso de nómina y pago se realiza de forma justa, transparente y en los tiempos establecidos.","tipo":"multiple","opciones":[{"id":"b5p20-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p20-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p20-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b5-p21-padrino","categoria":"Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana","texto":"Pregunta 21 — El plan padrino permite que las personas nuevas se adapten mejor al ambiente laboral.","tipo":"multiple","opciones":[{"id":"b5p21-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p21-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p21-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b5-p22-fechas-especiales","categoria":"Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana","texto":"Pregunta 22 — La empresa nos genera detalles y celebra de forma adecuada las fechas especiales (cumpleaños, etc.).","tipo":"multiple","opciones":[{"id":"b5p22-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p22-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p22-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b5-p23-beneficios-satisfaccion","categoria":"Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana","texto":"Pregunta 23 — Estoy satisfecho/a con los beneficios que ofrece la empresa (tiempos libres, fechas especiales, antigüedad, etc.).","tipo":"multiple","opciones":[{"id":"b5p23-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p23-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p23-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b5-p24-beneficios-competitivos","categoria":"Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana","texto":"Pregunta 24 — La empresa ofrece beneficios competitivos en comparación a otras empresas del sector.","tipo":"multiple","opciones":[{"id":"b5p24-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p24-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p24-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b5-p25-rrhh-atencion","categoria":"Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana","texto":"Pregunta 25 — El área de Gestión Humana (RRHH) atiende de forma oportuna y cordial en temas laborales.","tipo":"multiple","opciones":[{"id":"b5p25-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p25-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p25-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b5-p26-rrhh-respaldo","categoria":"Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana","texto":"Pregunta 26 — Me siento respaldado/a y apoyado/a por RRHH en temas laborales.","tipo":"multiple","opciones":[{"id":"b5p26-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p26-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p26-no","texto":"No","valor":1,"esAlerta":true}]},{"id":"b6-p27-estudia","categoria":"Bloque 6: Nivel Académico, Estudios y Talento Humano","texto":"Pregunta 27 — ¿Actualmente se encuentra estudiando algún programa académico, curso técnico, tecnológico, universitario, diplomado o certificaciones?","tipo":"multiple","tieneBifurcacion":true,"opciones":[{"id":"b6p27-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b6p27-no","texto":"No (pase directamente al Bloque 7)","valor":1,"esAlerta":false}]},{"id":"b6-p28-que-estudia","categoria":"Bloque 6: Nivel Académico, Estudios y Talento Humano","texto":"Pregunta 28 — Si actualmente estudia, ¿qué está estudiando y en qué institución? (Ej. Tecnología en Análisis y Software Development ADSO, Idiomas, etc.)","tipo":"texto","esCondicional":true,"disparadorPor":"b6-p27-estudia","valoresDisparo":["Sí"],"opciones":[]},{"id":"b6-p29-talento-aprovechado","categoria":"Bloque 6: Nivel Académico, Estudios y Talento Humano","texto":"Pregunta 29 — ¿Considera que los conocimientos adquiridos en sus estudios actuales o su perfil académico son aprovechados y valorados adecuadamente dentro de la empresa?","tipo":"multiple","opciones":[{"id":"b6p29-1","texto":"Sí, totalmente aprovechados en mi rol o en proyecciones internas","valor":5,"esAlerta":false},{"id":"b6p29-2","texto":"Parcialmente (solo se usa una parte)","valor":3,"esAlerta":false},{"id":"b6p29-3","texto":"No, siento que mi perfil o nivel de estudios está subutilizado en mi puesto actual","valor":1,"esAlerta":true}]},{"id":"b7-p30-vision-2anos","categoria":"Bloque 7: Proyección a Futuro y Visión en la Empresa","texto":"Pregunta 30 — ¿Dónde se ve a sí mismo/a profesionalmente en un plazo de dos años? (Ej. Creciendo dentro de esta empresa en un rol superior / Liderando procesos / Consolidando mi carrera técnica o profesional)","tipo":"texto","opciones":[]},{"id":"b7-p31-permanencia","categoria":"Bloque 7: Proyección a Futuro y Visión en la Empresa","texto":"Pregunta 31 — Visualizando su permanencia, ¿le gustaría consolidar su futuro laboral y plan de carrera dentro de esta organización?","tipo":"multiple","opciones":[{"id":"b7p31-1","texto":"Sí, me motiva mucho crecer aquí si hay planes claros","valor":5,"esAlerta":false},{"id":"b7p31-2","texto":"Tengo dudas, depende de cómo evolucionen las condiciones, salarios y vacantes","valor":3,"esAlerta":false},{"id":"b7p31-3","texto":"No, no visualizo un crecimiento a largo plazo en la empresa","valor":1,"esAlerta":true}]},{"id":"b8-p32-mejoras-estructurales","categoria":"Bloque 8: Propuestas de Mejora y Diagnóstico Abierto","texto":"Pregunta 32 — A largo plazo, ¿qué mejoras estructurales, de cultura, salariales o de procesos debería tener la empresa para asegurar su éxito y el bienestar del personal?","tipo":"texto","opciones":[]},{"id":"b8-p33-mejoras-inmediatas","categoria":"Bloque 8: Propuestas de Mejora y Diagnóstico Abierto","texto":"Pregunta 33 — ¿Qué mejoras prioritarias o cambios inmediatos considera que la organización debería implementar (en cuanto a herramientas, espacios de descanso, parqueadero gratuito/económico, bienestar o clima laboral)?","tipo":"texto","opciones":[]},{"id":"b8-p34-comentarios-libres","categoria":"Bloque 8: Propuestas de Mejora y Diagnóstico Abierto","texto":"Pregunta 34 — Comentarios adicionales o sugerencias que desee manifestar de forma totalmente libre:","tipo":"texto","opciones":[]}]'::jsonb,
    '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    descripcion = EXCLUDED.descripcion,
    departamento = EXCLUDED.departamento,
    preguntas = EXCLUDED.preguntas;
