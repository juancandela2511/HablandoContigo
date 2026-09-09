-- ============================================================================
-- SCHEMA DE BASE DE DATOS COMPLETO PARA SUPABASE - HABLANDOCONTIGO
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase para crear
-- todas las tablas necesarias (Alertas, IA, Cuentas, Encuestas y Notificaciones).
-- ============================================================================

-- 1. TABLA DE CONFIGURACIÓN Y CATÁLOGO DE TIPOS DE ALERTAS (useTiposAlertas.ts)
CREATE TABLE IF NOT EXISTS public.tipos_alertas_config (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    nivel SMALLINT NOT NULL DEFAULT 1 CHECK (nivel BETWEEN 1 AND 4),
    severidad TEXT DEFAULT 'Crítica',
    modo_enfoque TEXT NOT NULL DEFAULT 'general',
    enfoque_detalle TEXT,
    palabras_clave TEXT[] NOT NULL DEFAULT '{}',
    protocolo_accion TEXT,
    icono TEXT NOT NULL DEFAULT 'ShieldAlert',
    color TEXT NOT NULL DEFAULT '#ef4444',
    activa BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear alias por compatibilidad
CREATE TABLE IF NOT EXISTS public.tipos_alertas (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    nivel SMALLINT NOT NULL DEFAULT 1 CHECK (nivel BETWEEN 1 AND 4),
    severidad TEXT DEFAULT 'Crítica',
    modo_enfoque TEXT NOT NULL DEFAULT 'general',
    enfoque_detalle TEXT,
    palabras_clave TEXT[] NOT NULL DEFAULT '{}',
    protocolo_accion TEXT,
    icono TEXT NOT NULL DEFAULT 'ShieldAlert',
    color TEXT NOT NULL DEFAULT '#ef4444',
    activa BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLAS DE ENTRENAMIENTO Y RECONOCIMIENTO DE IA (useReconocimientoIA.ts)
CREATE TABLE IF NOT EXISTS public.ia_entrenamiento_config (
    id TEXT PRIMARY KEY DEFAULT 'global_config',
    config JSONB NOT NULL,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ia_ejemplos_entrenamiento (
    id TEXT PRIMARY KEY,
    texto_ejemplo TEXT NOT NULL,
    clasificacion TEXT NOT NULL,
    tipo_alerta_id TEXT,
    nombre_alerta TEXT,
    explicacion_criterio TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE CUENTAS DE USUARIOS Y ADMINISTRADORES (useCuentas.ts)
CREATE TABLE IF NOT EXISTS public.cuentas_admin (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT NOT NULL DEFAULT 'Administrador',
    departamento TEXT DEFAULT 'General',
    estado TEXT NOT NULL DEFAULT 'Activo',
    verificado BOOLEAN DEFAULT true,
    foto_url TEXT,
    avatar TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA DE ENCUESTAS (useEncuestas.ts)
CREATE TABLE IF NOT EXISTS public.encuestas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    departamento TEXT DEFAULT 'General',
    creado_por TEXT DEFAULT 'Super Administrador',
    fecha_creacion TEXT,
    estado TEXT NOT NULL DEFAULT 'Activa',
    preguntas JSONB NOT NULL DEFAULT '[]'::jsonb,
    preguntas_seguimiento JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_respuestas INT DEFAULT 0,
    alertas_registradas INT DEFAULT 0,
    puntaje_promedio NUMERIC(3,1) DEFAULT 5.0,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLA DE RESPUESTAS ANÓNIMAS (useEncuestas.ts)
CREATE TABLE IF NOT EXISTS public.respuestas_anonimas (
    id TEXT PRIMARY KEY,
    id_encuesta TEXT NOT NULL,
    titulo_encuesta TEXT,
    respuestas JSONB NOT NULL DEFAULT '[]'::jsonb,
    alertas_detectadas JSONB DEFAULT '[]'::jsonb,
    categorias_alerta TEXT[] DEFAULT '{}',
    puntaje_general NUMERIC(3,1) DEFAULT 5.0,
    fecha TEXT,
    hora TEXT,
    timestamp_iso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dispositivo_info JSONB DEFAULT '{}'::jsonb
);

-- 6. TABLA DE NOTIFICACIONES Y ALERTAS DETECTADAS (useNotificaciones.ts)
CREATE TABLE IF NOT EXISTS public.notificaciones_alertas (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL DEFAULT 'alerta',
    titulo TEXT NOT NULL,
    descripcion TEXT,
    mensaje TEXT,
    departamento TEXT DEFAULT 'General',
    tipo_alerta TEXT,
    severidad TEXT DEFAULT 'Alta',
    estado TEXT DEFAULT 'Detectada',
    fecha TEXT,
    hora TEXT,
    leida BOOLEAN DEFAULT false,
    ruta_destino TEXT DEFAULT '/dashboard',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABLAS DE ESTADÍSTICAS Y MENCIONES IA (useEstadisticas.ts)
CREATE TABLE IF NOT EXISTS public.menciones_colaboradores_ia (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nombre TEXT NOT NULL,
    cargo TEXT,
    departamento TEXT,
    conteo_menciones INT NOT NULL DEFAULT 1,
    sentimiento_predominante TEXT NOT NULL DEFAULT 'Atencion',
    alertas_asociadas TEXT[] DEFAULT '{}',
    ultimo_comentario TEXT,
    registrado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sugerencias_clasificadas_ia (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    categoria TEXT NOT NULL,
    sugerencia TEXT NOT NULL,
    fecha TEXT,
    registrado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DESACTIVAR RLS / HABILITAR POLÍTICAS DE ACCESO LIBRE PARA TODAS LAS TABLAS
ALTER TABLE public.tipos_alertas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_entrenamiento_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_ejemplos_entrenamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuentas_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_anonimas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menciones_colaboradores_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugerencias_clasificadas_ia ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso libre total (Select, Insert, Update, Delete)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('tipos_alertas_config', 'tipos_alertas', 'ia_entrenamiento_config', 'ia_ejemplos_entrenamiento', 'cuentas_admin', 'encuestas', 'respuestas_anonimas', 'notificaciones_alertas', 'menciones_colaboradores_ia', 'sugerencias_clasificadas_ia')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "permitir_todo_%I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "permitir_todo_%I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;

-- 9. INSERTAR DATOS INICIALES SEMILLA PARA ALERTAS CONFIGURADAS
INSERT INTO public.tipos_alertas_config (id, nombre, descripcion, nivel, severidad, modo_enfoque, enfoque_detalle, palabras_clave, protocolo_accion, icono, color, activa)
VALUES
('tipo-jefes-gestion', 'Mala Gestión de los Jefes & Liderazgo Tóxico', 'Conductas de abuso de poder, trato despectivo por parte de líderes, órdenes contradictorias, falta de empatía o favoritismo injustificado.', 1, 'Crítica', 'especifico', 'Enfócate en maltrato verbal, órdenes humillantes, autoritarismo y falta de escucha de supervisores y directores.', ARRAY['jefe', 'jefes', 'liderazgo', 'supervisor', 'mala gestión', 'favoritismo', 'autoritarismo', 'gritos', 'maltrato líder'], 'Revisión prioritaria por Gestión Humana y citación a evaluación 360° del cuadro de mando.', 'ShieldAlert', '#ef4444', true),
('tipo-acoso', 'Acoso Laboral & Hostigamiento', 'Conductas de maltrato reiterado, intimidación, amenazas, humillación pública o conductas que vulneren la dignidad del colaborador.', 1, 'Crítica', 'especifico', 'Enfócate en persecución laboral, amenazas de despido injustas, humillaciones colectivas y mobbing.', ARRAY['acoso', 'hostigamiento', 'humillación', 'amenaza', 'intimidación', 'insulto', 'maltrato', 'mobbing'], 'Activar inmediatamente el Comité de Convivencia y medidas de protección confidencial.', 'ShieldAlert', '#f43f5e', true),
('tipo-depresion', 'Crisis Anímica & Salud Mental', 'Estados de tristeza profunda, depresión severa, desánimo extremo constante, fatiga emocional o ideaciones de colapso.', 1, 'Crítica', 'especifico', 'Vas a estar pendiente de todo signo de colapso emocional, llanto frecuente, desesperanza o angustia crítica.', ARRAY['depresión', 'crisis anímica', 'tristeza profunda', 'desesperanza', 'llanto incontrolable', 'colapso emocional', 'no puedo más'], 'Ofrecer contención psicológica confidencial inmediata y activación de canal de Bienestar.', 'HeartCrack', '#8b5cf6', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tipos_alertas (id, nombre, descripcion, nivel, severidad, modo_enfoque, enfoque_detalle, palabras_clave, protocolo_accion, icono, color, activa)
VALUES
('tipo-jefes-gestion', 'Mala Gestión de los Jefes & Liderazgo Tóxico', 'Conductas de abuso de poder, trato despectivo por parte de líderes, órdenes contradictorias, falta de empatía o favoritismo injustificado.', 1, 'Crítica', 'especifico', 'Enfócate en maltrato verbal, órdenes humillantes, autoritarismo y falta de escucha de supervisores y directores.', ARRAY['jefe', 'jefes', 'liderazgo', 'supervisor', 'mala gestión', 'favoritismo', 'autoritarismo', 'gritos', 'maltrato líder'], 'Revisión prioritaria por Gestión Humana y citación a evaluación 360° del cuadro de mando.', 'ShieldAlert', '#ef4444', true),
('tipo-acoso', 'Acoso Laboral & Hostigamiento', 'Conductas de maltrato reiterado, intimidación, amenazas, humillación pública o conductas que vulneren la dignidad del colaborador.', 1, 'Crítica', 'especifico', 'Enfócate en persecución laboral, amenazas de despido injustas, humillaciones colectivas y mobbing.', ARRAY['acoso', 'hostigamiento', 'humillación', 'amenaza', 'intimidación', 'insulto', 'maltrato', 'mobbing'], 'Activar inmediatamente el Comité de Convivencia y medidas de protección confidencial.', 'ShieldAlert', '#f43f5e', true),
('tipo-depresion', 'Crisis Anímica & Salud Mental', 'Estados de tristeza profunda, depresión severa, desánimo extremo constante, fatiga emocional o ideaciones de colapso.', 1, 'Crítica', 'especifico', 'Vas a estar pendiente de todo signo de colapso emocional, llanto frecuente, desesperanza o angustia crítica.', ARRAY['depresión', 'crisis anímica', 'tristeza profunda', 'desesperanza', 'llanto incontrolable', 'colapso emocional', 'no puedo más'], 'Ofrecer contención psicológica confidencial inmediata y activación de canal de Bienestar.', 'HeartCrack', '#8b5cf6', true)
ON CONFLICT (id) DO NOTHING;
