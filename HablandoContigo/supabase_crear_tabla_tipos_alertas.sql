-- ============================================================================
-- SCRIPT DE MIGRACIÓN SUPABASE: CREACIÓN DE TABLA tipos_alertas_config
-- ============================================================================
-- Ejecuta este script en el SQL Editor de tu panel de Supabase
-- (https://supabase.com/dashboard/project/yxskysegqxuttyxzmubl/sql)
-- ============================================================================

-- 1. Crear la tabla tipos_alertas_config
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

-- 2. Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.tipos_alertas_config ENABLE ROW LEVEL SECURITY;

-- 3. Crear Política de Acceso Universal para lectura y escritura desde la aplicación
DROP POLICY IF EXISTS "Acceso universal tipos_alertas_config" ON public.tipos_alertas_config;
CREATE POLICY "Acceso universal tipos_alertas_config" 
ON public.tipos_alertas_config 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Insertar Criterios Base de Alertas de Clima Laboral
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
    'Revisión confidencial por Gerencia de Gestión Humana y plan de mediación.',
    'ShieldAlert',
    true
),
(
    'tipo-acoso-laboral',
    'Acoso Laboral y Hostigamiento',
    'Persecución laboral, aislamiento deliberado, amenazas de despido injustificadas o discriminación.',
    1,
    'Crítica',
    'especifico',
    'Detecta situaciones de hostigamiento sistemático, burlas, exclusión o sobrecarga punitiva.',
    ARRAY['acoso', 'hostigamiento', 'persecución', 'amenazas', 'humillación', 'discriminación'],
    'Activación inmediata del Comité de Convivencia Laboral bajo estricta confidencialidad.',
    'Flame',
    true
),
(
    'tipo-estres-burnout',
    'Estrés Crónico y Sobrecarga (Burnout)',
    'Agotamiento físico o emocional severo por alta exigencia en llamadas o falta de descansos.',
    2,
    'Alta',
    'especifico',
    'Identifica signos de agotamiento extremo, turnos extenuantes y saturación mental.',
    ARRAY['estrés', 'burnout', 'agotamiento', 'colapso', 'cansancio extremo', 'ansiedad', 'sobrecarga'],
    'Intervención con pausas activas y soporte psicológico ocupacional.',
    'HeartPulse',
    true
),
(
    'tipo-infraestructura-herramientas',
    'Fallas de Herramientas y Ergonomía',
    'Problemas con diademas, software, sillas, iluminación o temperatura en puestos de trabajo.',
    3,
    'Moderada',
    'especifico',
    'Mapea requerimientos técnicos, equipos defectuosos o condiciones físicas desfavorables.',
    ARRAY['herramientas', 'equipos', 'diademas', 'sillas', 'ergonomía', 'computador lento', 'software'],
    'Envío de ticket prioritario al área de Tecnología y Mantenimiento.',
    'Sliders',
    true
),
(
    'tipo-talento-estudios',
    'Estudios y Subutilización de Perfil',
    'Colaboradores que estudian programas técnicos/universitarios y sienten que su perfil no es aprovechado.',
    4,
    'Baja',
    'especifico',
    'Identifica potencial para semilleros de desarrollo, TI y plan carrera interno.',
    ARRAY['estudio', 'adso', 'universidad', 'carrera', 'tecnología', 'software', 'crecimiento', 'estudiando'],
    'Registro en base de datos de Talento Humano para futuras vacantes y semilleros.',
    'GraduationCap',
    true
)
ON CONFLICT (id) DO NOTHING;
