-- ============================================================================
-- SCRIPT DE ACTUALIZACIÓN BASE DE DATOS SUPABASE - HABLANDOCONTIGO
-- Módulo de Reconocimiento IA, Catálogo de Alertas Personalizadas y Estadísticas
-- ============================================================================

-- 1. TABLA DE TIPOS DE ALERTAS PERSONALIZADAS (CRUD Ilimitado, Íconos y Colores)
CREATE TABLE IF NOT EXISTS public.tipos_alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    nivel SMALLINT NOT NULL DEFAULT 1 CHECK (nivel BETWEEN 1 AND 4),
    modo_enfoque TEXT NOT NULL DEFAULT 'general',
    enfoque_detalle TEXT,
    palabras_clave TEXT[] NOT NULL DEFAULT '{}',
    protocolo_accion TEXT,
    icono TEXT NOT NULL DEFAULT 'ShieldAlert',
    color TEXT NOT NULL DEFAULT '#ef4444',
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) y Políticas de Acceso Público / Autenticado
ALTER TABLE public.tipos_alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de tipos_alertas" ON public.tipos_alertas
    FOR SELECT USING (true);

CREATE POLICY "Permitir insercion/edicion/eliminacion publica de tipos_alertas" ON public.tipos_alertas
    FOR ALL USING (true);


-- 2. TABLA DE AJUSTES Y CONFIGURACIÓN DE RECONOCIMIENTO IA
CREATE TABLE IF NOT EXISTS public.ajustes_ia_reconocimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensibilidad_clasificacion NUMERIC(3,2) NOT NULL DEFAULT 0.85,
    auto_encasillar_comentarios BOOLEAN NOT NULL DEFAULT true,
    detectar_nombres_colaboradores BOOLEAN NOT NULL DEFAULT true,
    notificar_alertas_criticas BOOLEAN NOT NULL DEFAULT true,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ajustes_ia_reconocimiento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo en ajustes_ia_reconocimiento" ON public.ajustes_ia_reconocimiento
    FOR ALL USING (true);


-- 3. TABLA DE EJEMPLOS DE ENTRENAMIENTO FEW-SHOT (RECONOCIMIENTO IA)
CREATE TABLE IF NOT EXISTS public.entrenamiento_ia_ejemplos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    texto TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('Buena', 'Regular', 'Mala')),
    sentimiento TEXT NOT NULL CHECK (sentimiento IN ('Positivo', 'Neutro', 'Negativo', 'Critico')),
    palabras_clave TEXT[] DEFAULT '{}',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.entrenamiento_ia_ejemplos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo en entrenamiento_ia_ejemplos" ON public.entrenamiento_ia_ejemplos
    FOR ALL USING (true);


-- 4. TABLA DE COLABORADORES MENCIONADOS DETECTADOS POR IA (ALERTAS DE EMPLEADOS)
CREATE TABLE IF NOT EXISTS public.menciones_colaboradores_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    cargo TEXT,
    departamento TEXT,
    conteo_menciones INT NOT NULL DEFAULT 1,
    sentimiento_predominante TEXT NOT NULL CHECK (sentimiento_predominante IN ('Positivo', 'Atencion', 'Conflicto')),
    alertas_asociadas TEXT[] DEFAULT '{}',
    ultimo_comentario TEXT,
    registrado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.menciones_colaboradores_ia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo en menciones_colaboradores_ia" ON public.menciones_colaboradores_ia
    FOR ALL USING (true);


-- 5. VALORES INICIALES DE EJEMPLO PARA TIPOS DE ALERTAS
INSERT INTO public.tipos_alertas (nombre, descripcion, nivel, modo_enfoque, enfoque_detalle, palabras_clave, protocolo_accion, icono, color)
VALUES
('Descontento Salarial', 'Detecta insatisfacción severa con la remuneración, bonos o estructura de pagos.', 1, 'especifico', 'Comentarios sobre sueldo bajo, falta de aumentos o pagos tardíos.', ARRAY['salario', 'sueldo', 'pago', 'aumento', 'remuneración', 'bonos'], 'Revisión por la Dirección de Compensación y Gestión Humana.', 'Flame', '#ef4444'),
('Ambiente Laboral Hostil', 'Señales de acoso, mal trato, favoritismo o clima tenso en el equipo.', 1, 'general', 'Comentarios de tensión, maltrato o fricción con líderes.', ARRAY['jefe', 'líder', 'acoso', 'gritos', 'favoritismo', 'maltrato', 'ambiente feo'], 'Intervención inmediata del equipo de Bienestar Laboral.', 'ShieldAlert', '#f43f5e'),
('Sobrecarga de Trabajo / Burnout', 'Exceso de horas extra, fatiga extrema o riesgo de agotamiento.', 2, 'general', 'Mención de fatiga, horas extra excesivas y estrés.', ARRAY['estrés', 'burnout', 'sobrecarga', 'cansado', 'horas extra', 'sin descanso'], 'Evaluación de distribución de cargas de trabajo.', 'AlertTriangle', '#f59e0b'),
('Falta de Herramientas / Equipos', 'Reportes de fallas tecnológicas, equipos viejos o falta de licencias.', 3, 'especifico', 'Reportes de computadores lentos o falta de insumos.', ARRAY['computador', 'herramientas', 'sistema', 'internet', 'lento', 'equipo'], 'Notificación prioritaria al departamento de Tecnología e Infraestructura.', 'Sliders', '#0ea5e9')
ON CONFLICT DO NOTHING;
