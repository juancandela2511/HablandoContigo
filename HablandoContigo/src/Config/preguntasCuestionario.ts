/**
 * ============================================================================
 * CATÁLOGO CENTRAL DE PREGUNTAS DE CUESTIONARIOS (preguntasCuestionario.ts)
 * ============================================================================
 * 
 * 📌 ¿DÓNDE ESTÁ ESTE ARCHIVO?
 * Ruta: src/Config/preguntasCuestionario.ts
 * 
 * 💡 ¿CÓMO MODIFICARLO?
 * Aquí puedes agregar, editar o eliminar las preguntas que el sistema utiliza
 * al momento de crear encuestas y cuestionarios automáticos o manuales.
 * 
 * Estructura de cada pregunta:
 * - id: Identificador único de la pregunta (ej. 'p-001', 'p-liderazgo', etc.)
 * - categoria: La dimensión o área a evaluar (ej. 'Liderazgo y Respeto', 'Carga Laboral')
 * - texto: El texto que verá el colaborador en pantalla
 * - tipo: 
 *     * 'escala': 1 a 5 estrellas / puntos.
 *     * 'multiple': Opciones de selección única.
 *     * 'texto': Campo abierto de respuesta libre.
 *     * 'si_no': Pregunta binaria Sí / No.
 * - opciones: Lista de opciones con:
 *     * id: Identificador de la opción.
 *     * texto: Lo que lee el usuario.
 *     * valor: Puntaje numérico del 1 al 5 (para calcular promedios de satisfacción).
 *     * esAlerta: true si esta respuesta representa una situación crítica que debe registrar alerta.
 * - tieneBifurcacion (opcional): true si activa una subpregunta condicional cuando responde negativo.
 * - preguntaCondicionalId (opcional): id de la subpregunta que se abre.
 */

import type { PreguntaEncuesta } from '@/Servicios/iaEncuestasService'

/**
 * 1. PREGUNTAS BASE POR DEFECTO PARA NUEVOS CUESTIONARIOS
 * Estas son las preguntas que se cargan automáticamente al iniciar un cuestionario
 * o al usar la plantilla estándar del sistema.
 */
export const PREGUNTAS_DEFECTO_CUESTIONARIO: PreguntaEncuesta[] = [
  {
    id: 'p-jefe-relacion',
    categoria: 'Liderazgo y Supervisión Directa',
    texto: '¿Cómo calificarías la relación cotidiana y la comunicación con tu líder directo?',
    tipo: 'multiple',
    esSensibleAcoso: true,
    tieneBifurcacion: true,
    preguntaCondicionalId: 'p-jefe-subpregunta-falencias',
    opciones: [
      { id: 'o-jefe-bien', texto: 'Excelente / Muy respetuosa', valor: 5, esAlerta: false },
      { id: 'o-jefe-regular', texto: 'Aceptable / Con altibajos', valor: 3, esAlerta: false },
      { id: 'o-jefe-mal', texto: 'Deficiente / Difícil o tensa', valor: 1, esAlerta: true }
    ]
  },
  {
    id: 'p-jefe-subpregunta-falencias',
    categoria: 'Profundización de Gestión del Líder',
    texto: '¿Qué situaciones, oportunidades de mejora o dificultades has experimentado en el trato con tu jefatura?',
    tipo: 'texto',
    esSensibleAcoso: true,
    esCondicional: true,
    disparadorPor: 'p-jefe-relacion',
    valoresDisparo: ['Deficiente / Difícil o tensa', 'Aceptable / Con altibajos', 'Mal', 'Regular'],
    opciones: []
  },
  {
    id: 'p-respeto-liderazgo',
    categoria: 'Liderazgo y Respeto',
    texto: '¿Sientes que tus coordinadores y líderes te tratan con respeto, imparcialidad y apertura para escuchar tus propuestas?',
    tipo: 'escala',
    esSensibleAcoso: true,
    opciones: [
      { id: 'o-1', texto: '1 - Totalmente en desacuerdo (Trato inapropiado)', valor: 1, esAlerta: true },
      { id: 'o-2', texto: '2 - En desacuerdo', valor: 2, esAlerta: true },
      { id: 'o-3', texto: '3 - Neutral / A veces', valor: 3, esAlerta: false },
      { id: 'o-4', texto: '4 - De acuerdo', valor: 4, esAlerta: false },
      { id: 'o-5', texto: '5 - Totalmente de acuerdo (Gran respeto)', valor: 5, esAlerta: false }
    ]
  },
  {
    id: 'p-convivencia-acoso',
    categoria: 'Prevención de Acoso y Clima Seguro',
    texto: '¿Has experimentado o presenciado en los últimos meses situaciones de hostigamiento, humillación o exclusión en el equipo?',
    tipo: 'multiple',
    esSensibleAcoso: true,
    opciones: [
      { id: 'o-1', texto: 'Nunca, el trato en el área es profesional y digno', valor: 5, esAlerta: false },
      { id: 'o-2', texto: 'Rara vez o fricciones menores ya resueltas', valor: 3, esAlerta: false },
      { id: 'o-3', texto: 'Sí, he sentido presión hostil, comentarios despectivos o aislamiento', valor: 1, esAlerta: true },
      { id: 'o-4', texto: 'Sí, existen conductas reiteradas de acoso o abuso de poder', valor: 1, esAlerta: true }
    ]
  },
  {
    id: 'p-carga-laboral',
    categoria: 'Carga Laboral y Bienestar',
    texto: '¿Consideras que tu volumen de trabajo diario y los tiempos asignados te permiten mantener un balance sano sin agotamiento extremo?',
    tipo: 'escala',
    opciones: [
      { id: 'o-1', texto: '1 - Sobrecarga extrema / Alto nivel de estrés', valor: 1, esAlerta: true },
      { id: 'o-2', texto: '2 - Carga pesada frecuente', valor: 2, esAlerta: true },
      { id: 'o-3', texto: '3 - Carga manejable', valor: 3, esAlerta: false },
      { id: 'o-4', texto: '4 - Adecuada y equilibrada', valor: 4, esAlerta: false },
      { id: 'o-5', texto: '5 - Ritmo óptimo y balanceado', valor: 5, esAlerta: false }
    ]
  },
  {
    id: 'p-equipo-colaboracion',
    categoria: 'Trabajo en Equipo y Cooperación',
    texto: '¿Existe disposición, empatía y apoyo mutuo entre compañeros al resolver dificultades del día a día?',
    tipo: 'multiple',
    opciones: [
      { id: 'o-1', texto: 'Excelente compañerismo y trabajo en equipo', valor: 5, esAlerta: false },
      { id: 'o-2', texto: 'Generalmente bueno, aunque con diferencias normales', valor: 4, esAlerta: false },
      { id: 'o-3', texto: 'Poco apoyo, existe división o tensión entre compañeros', valor: 2, esAlerta: false },
      { id: 'o-4', texto: 'Ambiente muy hostil y nula cooperación', valor: 1, esAlerta: true }
    ]
  },
  {
    id: 'p-herramientas-ti',
    categoria: 'Recursos y Herramientas de Trabajo',
    texto: '¿Cuentas con las herramientas, equipos informáticos y accesos necesarios para desempeñar tus funciones con agilidad?',
    tipo: 'escala',
    opciones: [
      { id: 'o-1', texto: '1 - Deficientes (Frenan mi labor)', valor: 1, esAlerta: false },
      { id: 'o-2', texto: '2 - Insuficientes', valor: 2, esAlerta: false },
      { id: 'o-3', texto: '3 - Aceptables', valor: 3, esAlerta: false },
      { id: 'o-4', texto: '4 - Buenas', valor: 4, esAlerta: false },
      { id: 'o-5', texto: '5 - Excelentes (Equipos modernos y estables)', valor: 5, esAlerta: false }
    ]
  },
  {
    id: 'p-sentir-general',
    categoria: 'Bienestar Humano y Motivación',
    texto: 'En una escala general, ¿cómo te sientes actualmente trabajando en la empresa y en tu posición?',
    tipo: 'escala',
    opciones: [
      { id: 'o-1', texto: '1 - Muy insatisfecho / Desmotivado', valor: 1, esAlerta: true },
      { id: 'o-2', texto: '2 - Poco motivado', valor: 2, esAlerta: false },
      { id: 'o-3', texto: '3 - Neutral / En equilibrio', valor: 3, esAlerta: false },
      { id: 'o-4', texto: '4 - Contento y motivado', valor: 4, esAlerta: false },
      { id: 'o-5', texto: '5 - Muy feliz y comprometido', valor: 5, esAlerta: false }
    ]
  }
]

/**
 * 2. PREGUNTAS DE SEGUIMIENTO / PROFUNDIZACIÓN CONFIDENCIAL
 * Estas preguntas se presentan al final de la encuesta para recopilar propuestas,
 * sugerencias o detalles adicionales anónimos.
 */
export const PREGUNTAS_SEGUIMIENTO_DEFECTO: PreguntaEncuesta[] = [
  {
    id: 'deep-seguimiento-propuestas',
    categoria: 'Espacio Abierto de Propuestas',
    texto: '¿Qué cambio concreto, idea o sugerencia propondrías para mejorar el bienestar y la convivencia en tu equipo?',
    tipo: 'texto',
    opciones: []
  },
  {
    id: 'deep-seguimiento-apoyo',
    categoria: 'Bienestar y Acompañamiento',
    texto: '¿Hay alguna situación especial o apoyo que requieras por parte de Talento Humano o la organización?',
    tipo: 'texto',
    opciones: []
  }
]

/**
 * 3. PREGUNTAS TEMÁTICAS ESPECIALIZADAS (GENERADOR ADAPTATIVO)
 * Preguntas agrupadas por temática para cuando el usuario crea cuestionarios sobre
 * turnos, comedor, salarios, ergonomía, liderazgo o ventas.
 */
export const BANCO_PREGUNTAS_TEMATICAS = {
  turnos: [
    {
      id: 'p-turnos-descanso',
      categoria: 'Horarios y Jornadas',
      texto: '¿La organización de tus turnos te permite disfrutar de un descanso reparador y atender tu vida personal?',
      tipo: 'escala' as const,
      opciones: [
        { id: 't-1', texto: '1 - Afecta gravemente mi descanso', valor: 1, esAlerta: true },
        { id: 't-2', texto: '2 - Poco tiempo de recuperación', valor: 2, esAlerta: false },
        { id: 't-3', texto: '3 - Manejable', valor: 3, esAlerta: false },
        { id: 't-4', texto: '4 - Buen horario', valor: 4, esAlerta: false },
        { id: 't-5', texto: '5 - Horario excelente y balanceado', valor: 5, esAlerta: false }
      ]
    }
  ],
  comedor: [
    {
      id: 'p-comedor-calidad',
      categoria: 'Alimentación y Comedor',
      texto: '¿Cómo evalúas la calidad, variedad e higiene del servicio de comedor / cafetería?',
      tipo: 'multiple' as const,
      opciones: [
        { id: 'c-1', texto: 'Excelente y muy balanceado', valor: 5, esAlerta: false },
        { id: 'c-2', texto: 'Aceptable con opciones a mejorar', valor: 3, esAlerta: false },
        { id: 'c-3', texto: 'Deficiente o poco higiénico', valor: 1, esAlerta: true }
      ]
    }
  ],
  ergonomia: [
    {
      id: 'p-ergonomia-puesto',
      categoria: 'Ergonomía e Instalaciones',
      texto: '¿Tu puesto físico (silla, iluminación, temperatura y ruido) te brinda comodidad para realizar tu trabajo sin molestias físicas?',
      tipo: 'escala' as const,
      opciones: [
        { id: 'e-1', texto: '1 - Muy incómodo / Causa dolores físicos', valor: 1, esAlerta: true },
        { id: 'e-2', texto: '2 - Incómodo en jornadas largas', valor: 2, esAlerta: false },
        { id: 'e-3', texto: '3 - Aceptable', valor: 3, esAlerta: false },
        { id: 'e-4', texto: '4 - Cómodo y adecuado', valor: 4, esAlerta: false },
        { id: 'e-5', texto: '5 - Excelente diseño ergonómico', valor: 5, esAlerta: false }
      ]
    }
  ],
  salario: [
    {
      id: 'p-salario-percepcion',
      categoria: 'Compensación y Beneficios',
      texto: '¿Consideras que tu paquete salarial y beneficios son justos respecto a tus responsabilidades y al mercado?',
      tipo: 'escala' as const,
      opciones: [
        { id: 's-1', texto: '1 - Totalmente en desacuerdo (Muy bajo)', valor: 1, esAlerta: false },
        { id: 's-2', texto: '2 - En desacuerdo', valor: 2, esAlerta: false },
        { id: 's-3', texto: '3 - Neutral', valor: 3, esAlerta: false },
        { id: 's-4', texto: '4 - De acuerdo', valor: 4, esAlerta: false },
        { id: 's-5', texto: '5 - Totalmente satisfecho', valor: 5, esAlerta: false }
      ]
    }
  ]
}
