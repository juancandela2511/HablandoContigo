/**
 * ============================================================================
 * ENCUESTA OFICIAL — CONTIGO CALL CENTER
 * CLIMA LABORAL Y DESARROLLO ORGANIZACIONAL (preguntasCuestionario.ts)
 * ============================================================================
 *
 * 34 preguntas distribuidas en 8 bloques:
 *   Bloque 1 — Datos de Contexto y Segmentación (2 preguntas)
 *   Bloque 2 — Bienestar Emocional, Estrés y Condiciones (5 preguntas)
 *   Bloque 3 — Convivencia, Compañerismo y Trabajo en Equipo (5 preguntas)
 *   Bloque 4 — Liderazgo, Instrucciones y Feedback del Jefe Inmediato (5 preguntas)
 *   Bloque 5 — Capacitación, Plan Carrera, Beneficios y Gestión Humana (9 preguntas)
 *   Bloque 6 — Nivel Académico, Estudios y Talento Humano (3 preguntas)
 *   Bloque 7 — Proyección a Futuro y Visión en la Empresa (2 preguntas)
 *   Bloque 8 — Propuestas de Mejora y Diagnóstico Abierto (3 preguntas)
 */

import type { PreguntaEncuesta } from '@/Servicios/iaEncuestasService'

// ─────────────────────────────────────────────────────────────────────────────
// Metadatos globales de la encuesta
// ─────────────────────────────────────────────────────────────────────────────
export const TITULO_ENCUESTA_CLIMA_INTEGRAL =
  'ENCUESTA DE CLIMA LABORAL Y DESARROLLO ORGANIZACIONAL — CONTIGO CALL CENTER'

export const DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL =
  'Nota de confidencialidad: Esta encuesta es 100% anónima. Su objetivo es identificar áreas de mejora y optimizar las condiciones de trabajo basándonos en tu opinión sincera. Por favor, responde cada pregunta de forma independiente.'

// ─────────────────────────────────────────────────────────────────────────────
// Metadatos de cada bloque (para separación visual en el editor)
// ─────────────────────────────────────────────────────────────────────────────
export interface MetadataBloque {
  id: string
  numero: number
  titulo: string
  descripcion: string
  icono: string          // nombre de ícono Lucide
  colorClase: string     // clases de Tailwind para el gradiente del encabezado
  textColorClase: string
}

export const BLOQUES_ENCUESTA_CLIMA: MetadataBloque[] = [
  {
    id: 'bloque-1',
    numero: 1,
    titulo: 'Datos de Contexto y Segmentación',
    descripcion: 'Información general para identificar tendencias por área sin comprometer la identidad.',
    icono: 'Users',
    colorClase: 'from-slate-600 to-slate-800',
    textColorClase: 'text-slate-100'
  },
  {
    id: 'bloque-2',
    numero: 2,
    titulo: 'Bienestar Emocional, Estrés y Condiciones de Trabajo',
    descripcion: 'Evalúa cómo te sientes en tu entorno de trabajo y las condiciones físicas del puesto.',
    icono: 'Heart',
    colorClase: 'from-violet-600 to-purple-700',
    textColorClase: 'text-violet-50'
  },
  {
    id: 'bloque-3',
    numero: 3,
    titulo: 'Convivencia, Compañerismo y Trabajo en Equipo',
    descripcion: 'Mide la calidad de las relaciones interpersonales y la colaboración dentro del equipo.',
    icono: 'Handshake',
    colorClase: 'from-sky-600 to-blue-700',
    textColorClase: 'text-sky-50'
  },
  {
    id: 'bloque-4',
    numero: 4,
    titulo: 'Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    descripcion: 'Evalúa la claridad, accesibilidad y retroalimentación de tu líder directo.',
    icono: 'Star',
    colorClase: 'from-amber-500 to-orange-600',
    textColorClase: 'text-amber-50'
  },
  {
    id: 'bloque-5',
    numero: 5,
    titulo: 'Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    descripcion: 'Percepción sobre las oportunidades de crecimiento, compensaciones y el área de RRHH.',
    icono: 'TrendingUp',
    colorClase: 'from-emerald-600 to-teal-700',
    textColorClase: 'text-emerald-50'
  },
  {
    id: 'bloque-6',
    numero: 6,
    titulo: 'Nivel Académico, Estudios y Talento Humano',
    descripcion: 'Identifica el potencial académico del equipo y si sus estudios son aprovechados.',
    icono: 'GraduationCap',
    colorClase: 'from-indigo-600 to-violet-700',
    textColorClase: 'text-indigo-50'
  },
  {
    id: 'bloque-7',
    numero: 7,
    titulo: 'Proyección a Futuro y Visión en la Empresa',
    descripcion: 'Conoce las aspiraciones y el nivel de compromiso a largo plazo del colaborador.',
    icono: 'Telescope',
    colorClase: 'from-rose-500 to-pink-700',
    textColorClase: 'text-rose-50'
  },
  {
    id: 'bloque-8',
    numero: 8,
    titulo: 'Propuestas de Mejora y Diagnóstico Abierto',
    descripcion: 'Espacio libre para sugerencias, mejoras estructurales y comentarios adicionales.',
    icono: 'MessageSquareText',
    colorClase: 'from-cyan-600 to-sky-700',
    textColorClase: 'text-cyan-50'
  }
]

// Opciones reutilizables
const opsSiAvecesNo = (prefijo: string) => [
  { id: `${prefijo}-si`, texto: 'Sí', valor: 5, esAlerta: false },
  { id: `${prefijo}-av`, texto: 'Algunas veces', valor: 3, esAlerta: false },
  { id: `${prefijo}-no`, texto: 'No', valor: 1, esAlerta: true }
]

const opsSiNo = (prefijo: string) => [
  { id: `${prefijo}-si`, texto: 'Sí', valor: 5, esAlerta: false },
  { id: `${prefijo}-no`, texto: 'No', valor: 1, esAlerta: false }
]

const opsAcuerdo = (prefijo: string) => [
  { id: `${prefijo}-ta`, texto: 'Totalmente de acuerdo', valor: 5, esAlerta: false },
  { id: `${prefijo}-da`, texto: 'De acuerdo', valor: 4, esAlerta: false },
  { id: `${prefijo}-de`, texto: 'En desacuerdo', valor: 2, esAlerta: true },
  { id: `${prefijo}-td`, texto: 'Totalmente en desacuerdo', valor: 1, esAlerta: true }
]

// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA OFICIAL — 34 PREGUNTAS / 8 BLOQUES
// ─────────────────────────────────────────────────────────────────────────────
export const PLANTILLA_CLIMA_INTEGRAL_DETALLADA: PreguntaEncuesta[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 1: DATOS DE CONTEXTO Y SEGMENTACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b1-p1-antiguedad',
    categoria: 'Bloque 1: Datos de Contexto y Segmentación',
    texto: 'Pregunta 1 — ¿Cuál es su antigüedad en la empresa?',
    tipo: 'multiple',
    opciones: [
      { id: 'ant-1', texto: 'Menos de 6 meses', valor: 1, esAlerta: false },
      { id: 'ant-2', texto: 'De 6 meses a 1 año', valor: 2, esAlerta: false },
      { id: 'ant-3', texto: 'De 1 a 3 años', valor: 3, esAlerta: false },
      { id: 'ant-4', texto: 'Más de 3 años', valor: 4, esAlerta: false }
    ]
  },
  {
    id: 'b1-p2-area',
    categoria: 'Bloque 1: Datos de Contexto y Segmentación',
    texto: 'Pregunta 2 — ¿A qué área o departamento pertenece?',
    tipo: 'multiple',
    opciones: [
      { id: 'area-1', texto: 'Operaciones / Call Center', valor: 1, esAlerta: false },
      { id: 'area-2', texto: 'Gestión Humana / RRHH', valor: 2, esAlerta: false },
      { id: 'area-3', texto: 'Calidad y Control', valor: 3, esAlerta: false },
      { id: 'area-4', texto: 'Tecnología / IT', valor: 4, esAlerta: false },
      { id: 'area-5', texto: 'Comercial / Ventas', valor: 5, esAlerta: false },
      { id: 'area-6', texto: 'Finanzas / Contabilidad', valor: 6, esAlerta: false },
      { id: 'area-7', texto: 'Administrativo / Gerencia', valor: 7, esAlerta: false },
      { id: 'area-8', texto: 'Otro', valor: 8, esAlerta: false }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 2: BIENESTAR EMOCIONAL, ESTRÉS Y CONDICIONES DE TRABAJO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b2-p3-gusto',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 3 — En términos generales, ¿qué tan a gusto, motivado/a y cómodo/a se siente trabajando en esta empresa?',
    tipo: 'multiple',
    opciones: [
      { id: 'b2p3-1', texto: 'Muy a gusto y motivado/a', valor: 5, esAlerta: false },
      { id: 'b2p3-2', texto: 'Satisfecho/a de manera regular', valor: 3, esAlerta: false },
      { id: 'b2p3-3', texto: 'Poco a gusto / Indiferente', valor: 2, esAlerta: true },
      { id: 'b2p3-4', texto: 'Nada a gusto / Incómodo/a', valor: 1, esAlerta: true }
    ]
  },
  {
    id: 'b2-p4-parte-equipo',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 4 — Siento que realmente hago parte del equipo de trabajo y que mi presencia y labor son valoradas.',
    tipo: 'escala',
    esSensibleAcoso: false,
    opciones: opsAcuerdo('b2p4')
  },
  {
    id: 'b2-p5-estres',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 5 — Los trabajadores de la empresa sufren de alto estrés debido a la exigencia del trabajo.',
    tipo: 'multiple',
    opciones: [
      { id: 'b2p5-si', texto: 'Sí', valor: 1, esAlerta: true },
      { id: 'b2p5-av', texto: 'Algunas veces', valor: 3, esAlerta: false },
      { id: 'b2p5-no', texto: 'No', valor: 5, esAlerta: false }
    ]
  },
  {
    id: 'b2-p6-herramientas',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 6 — Cuento con los implementos, herramientas, equipos y mobiliario ergonómico óptimos para desarrollar mis funciones sin contratiempos.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b2p6')
  },
  {
    id: 'b2-p7-espacios',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 7 — Considero que los espacios de trabajo (oficinas, iluminación, ventilación y zonas de descanso) son limpios, adecuados y seguros.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b2p7')
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 3: CONVIVENCIA, COMPAÑERISMO Y TRABAJO EN EQUIPO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b3-p8-trabajo-equipo',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 8 — Mis compañeros y yo trabajamos juntos de manera práctica, coordinada y efectiva.',
    tipo: 'escala',
    opciones: opsAcuerdo('b3p8')
  },
  {
    id: 'b3-p9-comunicacion',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 9 — Existe buena comunicación entre los compañeros de trabajo.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b3p9')
  },
  {
    id: 'b3-p10-trato-equitativo',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 10 — Es equitativo el trato y el trabajo en mi área.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b3p10')
  },
  {
    id: 'b3-p11-convivencia',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 11 — ¿Cómo califica la convivencia general con los demás miembros de la empresa?',
    tipo: 'multiple',
    opciones: [
      { id: 'b3p11-1', texto: 'Excelente (ambiente de apoyo y armonía)', valor: 5, esAlerta: false },
      { id: 'b3p11-2', texto: 'Buena (relación cordial)', valor: 4, esAlerta: false },
      { id: 'b3p11-3', texto: 'Regular (hay indiferencia o poca cooperación)', valor: 2, esAlerta: true },
      { id: 'b3p11-4', texto: 'Mala (existen tensiones o fricciones frecuentes)', valor: 1, esAlerta: true }
    ]
  },
  {
    id: 'b3-p12-conflictos',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 12 — ¿Existen actualmente problemas, roces o conflictos de convivencia con algún compañero o área específica? Si respondió Sí, indique brevemente el contexto.',
    tipo: 'multiple',
    esSensibleAcoso: true,
    tieneBifurcacion: true,
    opciones: [
      { id: 'b3p12-no', texto: 'No, ninguno', valor: 5, esAlerta: false },
      { id: 'b3p12-si', texto: 'Sí (indique el contexto en el campo de texto)', valor: 1, esAlerta: true }
    ]
  },
  {
    id: 'b3-p12b-conflictos-detalle',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 12b — Si respondió "Sí" en la pregunta anterior, describa brevemente el contexto del conflicto:',
    tipo: 'texto',
    esCondicional: true,
    disparadorPor: 'b3-p12-conflictos',
    valoresDisparo: ['Sí (indique el contexto en el campo de texto)'],
    opciones: []
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 4: LIDERAZGO, INSTRUCCIONES Y FEEDBACK DEL JEFE INMEDIATO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b4-p13-claridad-jefe',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 13 — Mi jefe inmediato es claro, preciso y oportuno con las instrucciones y directrices que da para realizar el trabajo.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b4p13')
  },
  {
    id: 'b4-p14-info-oportuna',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 14 — Recibo de forma oportuna la información clara y necesaria para desempeñar mis funciones correctamente.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b4p14')
  },
  {
    id: 'b4-p15-accesibilidad-jefe',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 15 — Es fácil hablar con mi jefe inmediato sobre temas relacionados al trabajo, resolver dudas o plantear dificultades.',
    tipo: 'multiple',
    opciones: [
      { id: 'b4p15-1', texto: 'Sí, es muy accesible y abierto/a', valor: 5, esAlerta: false },
      { id: 'b4p15-2', texto: 'Más o menos / Depende del momento', valor: 3, esAlerta: false },
      { id: 'b4p15-3', texto: 'No, resulta poco accesible o intimidante', valor: 1, esAlerta: true }
    ]
  },
  {
    id: 'b4-p16-escucha-jefe',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 16 — Siento que mi jefe inmediato escucha verdaderamente al personal y toma en cuenta mis opiniones y sugerencias.',
    tipo: 'multiple',
    opciones: [
      { id: 'b4p16-si', texto: 'Sí', valor: 5, esAlerta: false },
      { id: 'b4p16-av', texto: 'A veces', valor: 3, esAlerta: false },
      { id: 'b4p16-no', texto: 'No', valor: 1, esAlerta: true }
    ]
  },
  {
    id: 'b4-p17-feedback',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 17 — Recibo feedback (retroalimentación) constructivo y constante por parte de mi jefe inmediato para mejorar mi desempeño.',
    tipo: 'multiple',
    opciones: [
      { id: 'b4p17-1', texto: 'Sí, de manera constante', valor: 5, esAlerta: false },
      { id: 'b4p17-2', texto: 'Solo cuando hay errores', valor: 2, esAlerta: false },
      { id: 'b4p17-3', texto: 'No, nunca recibo feedback', valor: 1, esAlerta: true }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 5: CAPACITACIÓN, PLAN CARRERA, BENEFICIOS Y GESTIÓN HUMANA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b5-p18-capacitacion',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 18 — He recibido las capacitaciones adecuadas y oportunas para desempeñar con éxito el trabajo que me corresponde.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p18')
  },
  {
    id: 'b5-p19-plan-carrera',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 19 — El plan carrera de la compañía permite un crecimiento personal y profesional real para los colaboradores.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p19')
  },
  {
    id: 'b5-p20-nomina',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 20 — El proceso de nómina y pago se realiza de forma justa, transparente y en los tiempos establecidos.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p20')
  },
  {
    id: 'b5-p21-padrino',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 21 — El plan padrino permite que las personas nuevas se adapten mejor al ambiente laboral.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p21')
  },
  {
    id: 'b5-p22-fechas-especiales',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 22 — La empresa nos genera detalles y celebra de forma adecuada las fechas especiales (cumpleaños, etc.).',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p22')
  },
  {
    id: 'b5-p23-beneficios-satisfaccion',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 23 — Estoy satisfecho/a con los beneficios que ofrece la empresa (tiempos libres, fechas especiales, antigüedad, etc.).',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p23')
  },
  {
    id: 'b5-p24-beneficios-competitivos',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 24 — La empresa ofrece beneficios competitivos en comparación a otras empresas del sector.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p24')
  },
  {
    id: 'b5-p25-rrhh-atencion',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 25 — El área de Gestión Humana (RRHH) atiende de forma oportuna y cordial en temas laborales.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p25')
  },
  {
    id: 'b5-p26-rrhh-respaldo',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 26 — Me siento respaldado/a y apoyado/a por RRHH en temas laborales.',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p26')
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 6: NIVEL ACADÉMICO, ESTUDIOS Y TALENTO HUMANO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b6-p27-estudia',
    categoria: 'Bloque 6: Nivel Académico, Estudios y Talento Humano',
    texto: 'Pregunta 27 — ¿Actualmente se encuentra estudiando algún programa académico, curso técnico, tecnológico, universitario, diplomado o certificaciones?',
    tipo: 'multiple',
    tieneBifurcacion: true,
    opciones: [
      { id: 'b6p27-si', texto: 'Sí', valor: 5, esAlerta: false },
      { id: 'b6p27-no', texto: 'No (pase directamente al Bloque 7)', valor: 1, esAlerta: false }
    ]
  },
  {
    id: 'b6-p28-que-estudia',
    categoria: 'Bloque 6: Nivel Académico, Estudios y Talento Humano',
    texto: 'Pregunta 28 — Si actualmente estudia, ¿qué está estudiando y en qué institución? (Ej. Tecnología en Análisis y Software Development ADSO, Idiomas, etc.)',
    tipo: 'texto',
    esCondicional: true,
    disparadorPor: 'b6-p27-estudia',
    valoresDisparo: ['Sí'],
    opciones: []
  },
  {
    id: 'b6-p29-talento-aprovechado',
    categoria: 'Bloque 6: Nivel Académico, Estudios y Talento Humano',
    texto: 'Pregunta 29 — ¿Considera que los conocimientos adquiridos en sus estudios actuales o su perfil académico son aprovechados y valorados adecuadamente dentro de la empresa?',
    tipo: 'multiple',
    opciones: [
      { id: 'b6p29-1', texto: 'Sí, totalmente aprovechados en mi rol o en proyecciones internas', valor: 5, esAlerta: false },
      { id: 'b6p29-2', texto: 'Parcialmente (solo se usa una parte)', valor: 3, esAlerta: false },
      { id: 'b6p29-3', texto: 'No, siento que mi perfil o nivel de estudios está subutilizado en mi puesto actual', valor: 1, esAlerta: true }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 7: PROYECCIÓN A FUTURO Y VISIÓN EN LA EMPRESA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b7-p30-vision-2anos',
    categoria: 'Bloque 7: Proyección a Futuro y Visión en la Empresa',
    texto: 'Pregunta 30 — ¿Dónde se ve a sí mismo/a profesionalmente en un plazo de dos años? (Ej. Creciendo dentro de esta empresa en un rol superior / Liderando procesos / Consolidando mi carrera técnica o profesional)',
    tipo: 'texto',
    opciones: []
  },
  {
    id: 'b7-p31-permanencia',
    categoria: 'Bloque 7: Proyección a Futuro y Visión en la Empresa',
    texto: 'Pregunta 31 — Visualizando su permanencia, ¿le gustaría consolidar su futuro laboral y plan de carrera dentro de esta organización?',
    tipo: 'multiple',
    opciones: [
      { id: 'b7p31-1', texto: 'Sí, me motiva mucho crecer aquí si hay planes claros', valor: 5, esAlerta: false },
      { id: 'b7p31-2', texto: 'Tengo dudas, depende de cómo evolucionen las condiciones, salarios y vacantes', valor: 3, esAlerta: false },
      { id: 'b7p31-3', texto: 'No, no visualizo un crecimiento a largo plazo en la empresa', valor: 1, esAlerta: true }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 8: PROPUESTAS DE MEJORA Y DIAGNÓSTICO ABIERTO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b8-p32-mejoras-estructurales',
    categoria: 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
    texto: 'Pregunta 32 — A largo plazo, ¿qué mejoras estructurales, de cultura, salariales o de procesos debería tener la empresa para asegurar su éxito y el bienestar del personal?',
    tipo: 'texto',
    opciones: []
  },
  {
    id: 'b8-p33-mejoras-inmediatas',
    categoria: 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
    texto: 'Pregunta 33 — ¿Qué mejoras prioritarias o cambios inmediatos considera que la organización debería implementar (en cuanto a herramientas, espacios de descanso, parqueadero gratuito/económico, bienestar o clima laboral)?',
    tipo: 'texto',
    opciones: []
  },
  {
    id: 'b8-p34-comentarios-libres',
    categoria: 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
    texto: 'Pregunta 34 — Comentarios adicionales o sugerencias que desee manifestar de forma totalmente libre:',
    tipo: 'texto',
    opciones: []
  }
]
