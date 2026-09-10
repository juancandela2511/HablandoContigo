/**
 * ============================================================================
 * ENCUESTA OFICIAL — CONTIGO CALL CENTER
 * CLIMA LABORAL Y DESARROLLO ORGANIZACIONAL (preguntasCuestionario.ts)
 * ============================================================================
 *
 * Estructura oficial dividida en 8 bloques temáticos con preguntas atómicas
 * (un solo concepto por pregunta para máxima precisión psicométrica).
 *
 * Bloque 1 — Datos de Contexto y Segmentación
 * Bloque 2 — Bienestar Emocional, Estrés y Condiciones de Trabajo
 * Bloque 3 — Convivencia, Compañerismo y Trabajo en Equipo
 * Bloque 4 — Liderazgo, Instrucciones y Feedback del Jefe Inmediato
 * Bloque 5 — Capacitación, Plan Carrera, Beneficios y Gestión Humana
 * Bloque 6 — Nivel Académico, Estudios y Talento Humano
 * Bloque 7 — Proyección a Futuro y Visión en la Empresa
 * Bloque 8 — Propuestas de Mejora y Diagnóstico Abierto
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
// Metadatos de cada bloque (para separación visual en el editor y dashboard)
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
    descripcion: 'Evalúa cómo te sientes en tu entorno de trabajo, niveles de fatiga y condiciones del puesto.',
    icono: 'Heart',
    colorClase: 'from-violet-600 to-purple-700',
    textColorClase: 'text-violet-50'
  },
  {
    id: 'bloque-3',
    numero: 3,
    titulo: 'Convivencia, Compañerismo y Trabajo en Equipo',
    descripcion: 'Mide la calidad de las relaciones interpersonales, respeto y colaboración.',
    icono: 'Handshake',
    colorClase: 'from-sky-600 to-blue-700',
    textColorClase: 'text-sky-50'
  },
  {
    id: 'bloque-4',
    numero: 4,
    titulo: 'Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    descripcion: 'Evalúa la claridad, accesibilidad, reconocimiento y retroalimentación de tu líder directo.',
    icono: 'Star',
    colorClase: 'from-amber-500 to-orange-600',
    textColorClase: 'text-amber-50'
  },
  {
    id: 'bloque-5',
    numero: 5,
    titulo: 'Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    descripcion: 'Percepción sobre oportunidades de crecimiento, compensaciones y el área de RRHH.',
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
    descripcion: 'Espacio libre para sugerencias, mejoras de infraestructura, procesos y bienestar.',
    icono: 'MessageSquareText',
    colorClase: 'from-cyan-600 to-sky-700',
    textColorClase: 'text-cyan-50'
  }
]

// Opciones reutilizables estándar
const opsSiAvecesNo = (prefijo: string, alertaEnNo: boolean = false) => [
  { id: `${prefijo}-si`, texto: 'Sí', valor: 5, esAlerta: false },
  { id: `${prefijo}-av`, texto: 'Algunas veces', valor: 3, esAlerta: false },
  { id: `${prefijo}-no`, texto: 'No', valor: 1, esAlerta: alertaEnNo }
]

const opsAcuerdo = (prefijo: string) => [
  { id: `${prefijo}-ta`, texto: 'Totalmente de acuerdo', valor: 5, esAlerta: false },
  { id: `${prefijo}-da`, texto: 'De acuerdo', valor: 4, esAlerta: false },
  { id: `${prefijo}-de`, texto: 'En desacuerdo', valor: 2, esAlerta: true },
  { id: `${prefijo}-td`, texto: 'Totalmente en desacuerdo', valor: 1, esAlerta: true }
]

// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA OFICIAL ATÓMICA (UN SOLO CONCEPTO POR PREGUNTA)
// ─────────────────────────────────────────────────────────────────────────────
export const PLANTILLA_CLIMA_INTEGRAL_DETALLADA: PreguntaEncuesta[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 1: DATOS DE CONTEXTO Y SEGMENTACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b1-p1-antiguedad',
    categoria: 'Bloque 1: Datos de Contexto y Segmentación',
    texto: 'Pregunta 1 — ¿Cuánto tiempo tienes laborando en la empresa?',
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
    texto: 'Pregunta 2 — ¿A qué departamento o área perteneces?',
    tipo: 'multiple',
    tieneBifurcacion: true,
    opciones: [
      { id: 'area-1', texto: 'Operaciones / Call Center', valor: 1, esAlerta: false },
      { id: 'area-2', texto: 'Gestión Humana / RRHH', valor: 2, esAlerta: false },
      { id: 'area-3', texto: 'Tecnología / IT', valor: 3, esAlerta: false },
      { id: 'area-4', texto: 'Administrativo / Gerencia', valor: 4, esAlerta: false },
      { id: 'area-5', texto: 'Otro', valor: 5, esAlerta: false }
    ]
  },
  {
    id: 'b1-p2b-otro-area',
    categoria: 'Bloque 1: Datos de Contexto y Segmentación',
    texto: 'Pregunta 2b — ¿A qué área o departamento perteneces? (Especifique)',
    tipo: 'texto',
    esCondicional: true,
    disparadorPor: 'b1-p2-area',
    valoresDisparo: ['Otro'],
    opciones: []
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 2: BIENESTAR EMOCIONAL, ESTRÉS Y CONDICIONES DE TRABAJO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b2-p3-gusto',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 3 — ¿Cómo te sientes en tu entorno y puesto de trabajo actual?',
    tipo: 'multiple',
    opciones: [
      { id: 'b2p3-1', texto: 'Muy a gusto y motivado/a', valor: 5, esAlerta: false },
      { id: 'b2p3-2', texto: 'Satisfecho/a de manera regular', valor: 3, esAlerta: false },
      { id: 'b2p3-3', texto: 'Poco a gusto / Indiferente', valor: 2, esAlerta: true },
      { 
        id: 'b2p3-4', 
        texto: 'Nada a gusto / Incómodo/a', 
        valor: 1, 
        esAlerta: true,
        preguntaAnclada: {
          texto: '¿Por qué te sientes así y qué situación en particular te incomoda?',
          tipo: 'texto',
          placeholder: 'Cuéntanos qué te pasó o qué genera tu malestar con total confidencialidad...',
          obligatoria: true
        }
      }
    ]
  },
  {
    id: 'b2-p4-estres',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 4 — ¿Sientes niveles de estrés elevados en tus labores diarias?',
    tipo: 'multiple',
    opciones: [
      { 
        id: 'b2p4-si', 
        texto: 'Sí', 
        valor: 1, 
        esAlerta: true, 
        tipoAlertaId: 'tipo-depresion', 
        nombreAlerta: 'Estrés Severo y Agotamiento Crónico', 
        severidadAlerta: 'Crítica',
        preguntaAnclada: {
          texto: '¿Por qué? ¿Qué situaciones de tus labores diarias te generan mayor sobrecarga o estrés?',
          tipo: 'texto',
          placeholder: 'Cuéntanos qué te pasó o qué factores elevan tu nivel de fatiga...',
          obligatoria: false
        }
      },
      { id: 'b2p4-av', texto: 'Algunas veces', valor: 3, esAlerta: false },
      { id: 'b2p4-no', texto: 'No', valor: 5, esAlerta: false }
    ]
  },
  {
    id: 'b2-p5-fatiga',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 5 — ¿Sientes fatiga o cansancio físico/mental constante asociado a tu trabajo?',
    tipo: 'multiple',
    opciones: [
      { id: 'b2p5-si', texto: 'Sí', valor: 1, esAlerta: true, tipoAlertaId: 'tipo-depresion', nombreAlerta: 'Estrés Severo y Agotamiento Crónico', severidadAlerta: 'Crítica' },
      { id: 'b2p5-av', texto: 'Algunas veces', valor: 3, esAlerta: false },
      { id: 'b2p5-no', texto: 'No', valor: 5, esAlerta: false }
    ]
  },
  {
    id: 'b2-p6-herramientas',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 6 — ¿Consideras que las herramientas y equipos de trabajo son adecuados para desempeñar tu labor?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b2p6', true)
  },
  {
    id: 'b2-p7-condiciones-fisicas',
    categoria: 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo',
    texto: 'Pregunta 7 — ¿Consideras que las condiciones físicas de tu puesto (iluminación, espacio, ergonomía) son adecuadas?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b2p7', true)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 3: CONVIVENCIA, COMPAÑERISMO Y TRABAJO EN EQUIPO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b3-p8-colaboracion',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 8 — ¿Existe un ambiente de colaboración y apoyo mutuo entre compañeros de trabajo?',
    tipo: 'multiple',
    opciones: opsAcuerdo('b3p8')
  },
  {
    id: 'b3-p9-respeto',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 9 — ¿Sientes que existe respeto dentro de tu equipo de trabajo?',
    tipo: 'multiple',
    opciones: [
      { id: 'b3p9-si', texto: 'Sí', valor: 5, esAlerta: false },
      { id: 'b3p9-av', texto: 'Algunas veces', valor: 3, esAlerta: false },
      { id: 'b3p9-no', texto: 'No', valor: 1, esAlerta: true, tipoAlertaId: 'tipo-acoso', nombreAlerta: 'Acoso Laboral y Hostigamiento', severidadAlerta: 'Crítica' }
    ]
  },
  {
    id: 'b3-p10-comunicacion',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 10 — ¿Existe buena comunicación y fluidez de información con tus pares?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b3p10', true)
  },
  {
    id: 'b3-p11-clima-convivencia',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 11 — ¿Cómo calificarías el clima general de convivencia en tu área?',
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
    texto: 'Pregunta 12 — ¿Has tenido roces, conflictos o tensiones significativas con alguien en el equipo?',
    tipo: 'multiple',
    esSensibleAcoso: true,
    tieneBifurcacion: true,
    opciones: [
      { id: 'b3p12-no', texto: 'No, ninguno', valor: 5, esAlerta: false },
      { 
        id: 'b3p12-si', 
        texto: 'Sí (indique el contexto en el campo de texto)', 
        valor: 1, 
        esAlerta: true, 
        tipoAlertaId: 'tipo-acoso', 
        nombreAlerta: 'Acoso Laboral y Hostigamiento', 
        severidadAlerta: 'Crítica',
        preguntaAnclada: {
          texto: '¿Qué te ocurrió y por qué se dio el conflicto? Cuéntanos con total confidencialidad:',
          tipo: 'texto',
          placeholder: 'Escribe aquí qué situación ocurrió y cómo te afectó...',
          obligatoria: true
        }
      }
    ]
  },
  {
    id: 'b3-p12b-conflictos-detalle',
    categoria: 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo',
    texto: 'Pregunta 12b — Describa brevemente el contexto del conflicto o situación presentada:',
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
    id: 'b4-p13-instrucciones-claras',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 13 — ¿Recibes instrucciones claras por parte de tu jefe inmediato para realizar tus tareas?',
    tipo: 'multiple',
    opciones: [
      { id: 'b4p13-si', texto: 'Sí', valor: 5, esAlerta: false },
      { id: 'b4p13-av', texto: 'Algunas veces', valor: 3, esAlerta: false },
      { id: 'b4p13-no', texto: 'No', valor: 1, esAlerta: true, tipoAlertaId: 'tipo-jefes-gestion', nombreAlerta: 'Mala Gestión de los Jefes & Liderazgo Tóxico', severidadAlerta: 'Crítica' }
    ]
  },
  {
    id: 'b4-p14-instrucciones-estructuradas',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 14 — ¿Las directrices y asignaciones de tu jefe inmediato son estructuradas y organizadas?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b4p14', true)
  },
  {
    id: 'b4-p15-reconocimiento',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 15 — ¿Sientes que tu líder reconoce formal o verbalmente tu buen desempeño?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b4p15', true)
  },
  {
    id: 'b4-p16-valoracion-esfuerzo',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 16 — ¿Sientes que tu líder valora tu esfuerzo y dedicación diaria en el trabajo?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b4p16', true)
  },
  {
    id: 'b4-p17-accesibilidad-dudas',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 17 — ¿Tu jefe inmediato es accesible para resolver dudas sobre tu labor?',
    tipo: 'multiple',
    opciones: [
      { id: 'b4p17-1', texto: 'Sí, es muy accesible y abierto/a', valor: 5, esAlerta: false },
      { id: 'b4p17-2', texto: 'Más o menos / Depende del momento', valor: 3, esAlerta: false },
      { id: 'b4p17-3', texto: 'No, resulta poco accesible o intimidante', valor: 1, esAlerta: true, tipoAlertaId: 'tipo-jefes-gestion', nombreAlerta: 'Mala Gestión de los Jefes & Liderazgo Tóxico', severidadAlerta: 'Crítica' }
    ]
  },
  {
    id: 'b4-p18-escucha-inquietudes',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 18 — ¿Tu jefe inmediato muestra disposición para escuchar tus inquietudes y dificultades?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b4p18', true)
  },
  {
    id: 'b4-p19-confianza',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 19 — ¿Tu líder promueve un espacio de confianza donde puedas expresar tus opiniones sin temor?',
    tipo: 'multiple',
    opciones: [
      { id: 'b4p19-si', texto: 'Sí', valor: 5, esAlerta: false },
      { id: 'b4p19-av', texto: 'A veces', valor: 3, esAlerta: false },
      { id: 'b4p19-no', texto: 'No', valor: 1, esAlerta: true, tipoAlertaId: 'tipo-jefes-gestion', nombreAlerta: 'Mala Gestión de los Jefes & Liderazgo Tóxico', severidadAlerta: 'Crítica' }
    ]
  },
  {
    id: 'b4-p20-feedback',
    categoria: 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato',
    texto: 'Pregunta 20 — ¿Recibes retroalimentación (feedback) constructiva sobre tu trabajo de forma regular?',
    tipo: 'multiple',
    opciones: [
      { id: 'b4p20-1', texto: 'Sí, de manera constante', valor: 5, esAlerta: false },
      { id: 'b4p20-2', texto: 'Solo cuando hay errores', valor: 2, esAlerta: false },
      { id: 'b4p20-3', texto: 'No, nunca recibo feedback', valor: 1, esAlerta: true }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 5: CAPACITACIÓN, PLAN CARRERA, BENEFICIOS Y GESTIÓN HUMANA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b5-p21-capacitacion',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 21 — ¿Consideras que la empresa ofrece suficientes capacitaciones para mejorar tus habilidades?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p21')
  },
  {
    id: 'b5-p22-plan-carrera',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 22 — ¿Cuentas con claridad sobre los planes de crecimiento o líneas de carrera dentro de la organización?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p22')
  },
  {
    id: 'b5-p23-beneficios',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 23 — ¿Te sientes satisfecho/a con los beneficios adicionales ofrecidos por la empresa?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p23')
  },
  {
    id: 'b5-p24-compensaciones',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 24 — ¿Consideras satisfactorias las compensaciones económicas recibidas por tu trabajo?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p24')
  },
  {
    id: 'b5-p25-rrhh-respuesta',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 25 — ¿El área de Gestión Humana / RRHH brinda respuesta oportuna a tus solicitudes o inquietudes?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p25')
  },
  {
    id: 'b5-p26-procesos-agiles',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 26 — ¿Consideras que los procesos y trámites internos de la empresa son ágiles?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p26')
  },
  {
    id: 'b5-p27-procesos-claros',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 27 — ¿Los procedimientos e instructivos de la empresa son claros y comprensibles?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p27')
  },
  {
    id: 'b5-p28-equidad-tareas',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 28 — ¿Existe equidad en la asignación y distribución de tareas en tu área?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p28')
  },
  {
    id: 'b5-p29-equidad-oportunidades',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 29 — ¿Existe igualdad de oportunidades de desarrollo y crecimiento para todos en la empresa?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p29')
  },
  {
    id: 'b5-p30-equilibrio-vida',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 30 — ¿Consideras que la empresa se preocupa por el equilibrio entre la vida laboral y personal de sus empleados?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p30')
  },
  {
    id: 'b5-p31-comunicacion-interna',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 31 — ¿Los canales de comunicación interna de la compañía son efectivos?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p31')
  },
  {
    id: 'b5-p32-respaldo-organizacion',
    categoria: 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana',
    texto: 'Pregunta 32 — ¿Te sientes respaldado/a por la organización ante situaciones imprevistas o dificultades operativas?',
    tipo: 'multiple',
    opciones: opsSiAvecesNo('b5p32')
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 6: NIVEL ACADÉMICO, ESTUDIOS Y TALENTO HUMANO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b6-p33-estudia',
    categoria: 'Bloque 6: Nivel Académico, Estudios y Talento Humano',
    texto: 'Pregunta 33 — ¿Te encuentras actualmente cursando algún estudio técnico, tecnológico, profesional o posgrado?',
    tipo: 'multiple',
    tieneBifurcacion: true,
    opciones: [
      { id: 'b6p33-si', texto: 'Sí', valor: 5, esAlerta: false },
      { id: 'b6p33-no', texto: 'No (Pase directamente al Bloque 7)', valor: 1, esAlerta: false }
    ]
  },
  {
    id: 'b6-p33b-que-estudia',
    categoria: 'Bloque 6: Nivel Académico, Estudios y Talento Humano',
    texto: 'Pregunta 33b — Especifique qué área o programa de estudios se encuentra cursando actualmente:',
    tipo: 'texto',
    esCondicional: true,
    disparadorPor: 'b6-p33-estudia',
    valoresDisparo: ['Sí'],
    opciones: []
  },
  {
    id: 'b6-p34-talento-aprovechado',
    categoria: 'Bloque 6: Nivel Académico, Estudios y Talento Humano',
    texto: 'Pregunta 34 — ¿Consideras que tu nivel académico actual es aprovechado por la empresa?',
    tipo: 'multiple',
    opciones: [
      { id: 'b6p34-1', texto: 'Sí, totalmente aprovechados en mi rol o en proyecciones internas', valor: 5, esAlerta: false },
      { id: 'b6p34-2', texto: 'Parcialmente (solo se usa una parte)', valor: 3, esAlerta: false },
      { id: 'b6p34-3', texto: 'No, siento que mi perfil o nivel de estudios está subutilizado en mi puesto actual', valor: 1, esAlerta: true }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 7: PROYECCIÓN A FUTURO Y VISIÓN EN LA EMPRESA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b7-p35-vision-2anos',
    categoria: 'Bloque 7: Proyección a Futuro y Visión en la Empresa',
    texto: 'Pregunta 35 — ¿Cómo te visualizas a ti mismo/a y a tu crecimiento profesional dentro de la compañía en los próximos dos años?',
    tipo: 'texto',
    opciones: []
  },
  {
    id: 'b7-p36-permanencia',
    categoria: 'Bloque 7: Proyección a Futuro y Visión en la Empresa',
    texto: 'Pregunta 36 — ¿Te motiva permanecer y consolidar tu carrera a largo plazo en Contigo Call Center?',
    tipo: 'multiple',
    opciones: [
      { id: 'b7p36-1', texto: 'Sí, me motiva mucho crecer aquí si hay planes claros', valor: 5, esAlerta: false },
      { id: 'b7p36-2', texto: 'Tengo dudas, depende de cómo evolucionen las condiciones, salarios y vacantes', valor: 3, esAlerta: false },
      { id: 'b7p36-3', texto: 'No, no visualizo un crecimiento a largo plazo en la empresa', valor: 1, esAlerta: true }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE 8: PROPUESTAS DE MEJORA Y DIAGNÓSTICO ABIERTO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'b8-p37-mejoras-infraestructura',
    categoria: 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
    texto: 'Pregunta 37 — ¿Qué cambiarías o mejorarías de manera prioritaria en la infraestructura física y puestos de trabajo del Call Center?',
    tipo: 'texto',
    opciones: []
  },
  {
    id: 'b8-p38-mejoras-procesos',
    categoria: 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
    texto: 'Pregunta 38 — ¿Qué propuestas o cambios prioritarios implementarías en los procesos operativos del Call Center?',
    tipo: 'texto',
    opciones: []
  },
  {
    id: 'b8-p39-sugerencias-direccion',
    categoria: 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
    texto: 'Pregunta 39 — ¿Qué sugerencias le darías a la Alta Dirección para incrementar el bienestar y liderazgo organizacional?',
    tipo: 'texto',
    opciones: []
  },
  {
    id: 'b8-p40-sugerencias-rrhh',
    categoria: 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
    texto: 'Pregunta 40 — ¿Qué recomendaciones le darías a Gestión Humana / RRHH para incrementar el bienestar y la motivación general?',
    tipo: 'texto',
    opciones: []
  },
  {
    id: 'b8-p41-comentarios-libres',
    categoria: 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
    texto: 'Pregunta 41 — Escribe cualquier otro comentario, sugerencia o inquietud adicional que consideres relevante y no se haya mencionado en la encuesta:',
    tipo: 'texto',
    opciones: []
  }
]

