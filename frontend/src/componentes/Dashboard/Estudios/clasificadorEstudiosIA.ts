/**
 * ============================================================================
 * CLASIFICADOR SEMÁNTICO DINÁMICO DE ESTUDIOS Y RESPUESTAS ABIERTAS (clasificadorEstudiosIA.ts)
 * ============================================================================
 * PROPÓSITO:
 * Encasilla automáticamente respuestas de texto abierto sobre estudios, carreras
 * o profesiones (y temas abiertos en general):
 * - Si alguien escribe "sistemas" / "ing de sistemas" -> "Sistemas"
 * - Si alguien escribe "software" / "adso" / "programación" -> "Software"
 * - Si alguien escribe "data" / "ciencia de datos" / "analítica" -> "Data"
 * - Si alguien escribe "abogado" / "derecho" / "leyes" -> "Abogado / Derecho"
 * - Si alguien escribe cualquier otra profesión (ej. "arquitecto", "enfermero",
 *   "economista", "médico", etc.), crea dinámicamente su propia categoría
 *   para saber exactamente cuál es el punto fuerte de profesionales de la empresa.
 */

export interface DefinicionCategoriaEstudio {
  categoria: string
  palabrasClave: string[]
  habilidades: string[]
  usoRecomendado: string
  color: string
}

/**
 * Catálogo base de profesiones/carreras reconocidas con sus palabras clave.
 * Si el usuario escribe otra profesión fuera de esta lista, el sistema crea
 * dinámicamente el punto con el nombre capitalizado de esa profesión.
 */
export const CATALOGO_CATEGORIAS_ESTUDIO: DefinicionCategoriaEstudio[] = [
  {
    categoria: 'Sistemas',
    palabrasClave: [
      'sistemas', 'ingenieria de sistemas', 'ing sistemas', 'ing de sistemas',
      'informatica', 'computacion', 'redes', 'telecomunicaciones', 'ciberseguridad',
      'infraestructura', 'soporte ti', 'tecnologia en sistemas'
    ],
    habilidades: ['Ingeniería de Sistemas', 'Infraestructura & Redes', 'Soporte TI', 'Ciberseguridad'],
    usoRecomendado: 'Punto fuerte en arquitectura tecnológica, soporte y administración de sistemas.',
    color: '#2563eb'
  },
  {
    categoria: 'Software',
    palabrasClave: [
      'software', 'ingenieria de software', 'adso', 'programacion', 'desarrollo',
      'desarrollador', 'web', 'fullstack', 'backend', 'frontend', 'analisis y desarrollo',
      'aplicaciones', 'apps', 'coding'
    ],
    habilidades: ['Desarrollo de Software', 'Automatización de Procesos', 'Arquitectura Web & Apps'],
    usoRecomendado: 'Ideal para liderar el desarrollo de aplicaciones internas y automatización.',
    color: '#4f46e5'
  },
  {
    categoria: 'Data',
    palabrasClave: [
      'data', 'datos', 'ciencia de datos', 'ingenieria en data', 'big data',
      'analitica', 'analytics', 'business intelligence', 'bi', 'estadistica',
      'machine learning', 'inteligencia artificial', 'ia', 'data science', 'data engineer'
    ],
    habilidades: ['Ingeniería de Datos', 'Analítica Avanzada & BI', 'Modelos Predictivos', 'IA'],
    usoRecomendado: 'Ideal para liderar analítica de negocio, tableros de control y modelos predictivos.',
    color: '#0ea5e9'
  },
  {
    categoria: 'Abogado / Derecho',
    palabrasClave: [
      'abogado', 'abogada', 'derecho', 'leyes', 'juridica', 'juridico',
      'ciencias juridicas', 'legislacion', 'penal', 'laboralista'
    ],
    habilidades: ['Normatividad Legal', 'Derecho Laboral & Comercial', 'Cumplimiento Normativo'],
    usoRecomendado: 'Fuerte respaldo para cumplimiento legal, contratos, normatividad y auditoría jurídica.',
    color: '#f59e0b'
  },
  {
    categoria: 'Administración y Negocios',
    palabrasClave: [
      'administracion', 'administrador', 'empresas', 'negocios', 'gerencia',
      'gestion empresarial', 'comercio', 'internacional', 'proyectos', 'direccion', 'emprendimiento', 'mba'
    ],
    habilidades: ['Gestión de Proyectos', 'Liderazgo Estratégico', 'Optimización Operativa'],
    usoRecomendado: 'Excelente para coordinar equipos de trabajo, supervisión y control de indicadores.',
    color: '#10b981'
  },
  {
    categoria: 'Psicología y Talento Humano',
    palabrasClave: [
      'psicologia', 'psicologo', 'psicologa', 'talento humano', 'recursos humanos',
      'rrhh', 'gestion humana', 'trabajo social', 'sociologia', 'salud ocupacional', 'sst', 'bienestar'
    ],
    habilidades: ['Clima y Cultura Laboral', 'Resolución de Conflictos', 'Bienestar Organizacional'],
    usoRecomendado: 'Clave para comités de convivencia, selección, formación y prevención de burnout.',
    color: '#ec4899'
  },
  {
    categoria: 'Contaduría y Finanzas',
    palabrasClave: [
      'contaduria', 'contador', 'contadora', 'contabilidad', 'finanzas', 'economia',
      'economista', 'bancaria', 'costos', 'auditoria', 'tributaria', 'financiera', 'presupuesto'
    ],
    habilidades: ['Modelación de Costos', 'Auditoría Interna', 'Presupuestación', 'Finanzas'],
    usoRecomendado: 'Aprovechable para control de nómina, facturación, costos operativos y auditoría.',
    color: '#d97706'
  },
  {
    categoria: 'Mercadeo, Diseño y Comunicación',
    palabrasClave: [
      'mercadeo', 'marketing', 'publicidad', 'comunicacion', 'periodismo',
      'diseno', 'disenador', 'grafico', 'audiovisual', 'multimedia', 'comercial', 'ventas'
    ],
    habilidades: ['Marketing Digital', 'Comunicación Interna', 'Diseño & Endomarketing'],
    usoRecomendado: 'Perfecto para campañas de cultura organizacional, comunicación y estrategia comercial.',
    color: '#8b5cf6'
  },
  {
    categoria: 'Ingeniería Industrial y Operaciones',
    palabrasClave: [
      'industrial', 'ingeniero industrial', 'logistica', 'operaciones', 'calidad',
      'procesos', 'produccion', 'cadena de suministro', 'supply chain'
    ],
    habilidades: ['Mejora Continua', 'Gestión de Calidad', 'Logística Operativa'],
    usoRecomendado: 'Idóneo para optimización de tiempos de atención, calidad y eficiencia.',
    color: '#14b8a6'
  }
]

export const NOMBRES_CATEGORIAS_ESTUDIO = CATALOGO_CATEGORIAS_ESTUDIO.map(c => c.categoria)

const PALETA_DINAMICA = [
  '#0ea5e9', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#6366f1'
]

/**
 * Normaliza un texto eliminando tildes, signos y pasándolo a minúsculas.
 */
function normalizarTexto(texto: string): string {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Limpia prefijos conversacionales ("actualmente estudio...", "soy...", "carrera de...")
 * y formatea en Title Case para crear dinámicamente una categoría limpia cuando
 * el usuario ingresa una profesión nueva (ej. "soy arquitecto" -> "Arquitecto").
 */
function extraerNombreProfesionDinamica(respuestaRaw: string): string {
  let limpio = (respuestaRaw || '')
    .trim()
    .replace(/^(actualmente\s+)?(yo\s+)?(estudio|cursando|curso|soy|estoy\s+en|estoy\s+estudiando|carrera\s+de|profesion|profesión|tecnologia\s+en|tecnología\s+en|tecnico\s+en|técnico\s+en|pregrado\s+en)\s+/i, '')
    .replace(/[.,;:!?]+$/g, '')
    .trim()

  if (!limpio) limpio = respuestaRaw.trim()
  if (limpio.length > 38) {
    limpio = limpio.substring(0, 38).trim()
  }

  return limpio
    .split(/\s+/)
    .map(p => p.length > 2 ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p.toLowerCase())
    .join(' ')
    .replace(/^./, c => c.toUpperCase())
}

/**
 * Clasifica (encasilla) cualquier respuesta abierta de estudio/profesión en su punto estadístico.
 * - "sistemas" -> "Sistemas"
 * - "software" -> "Software"
 * - "data" -> "Data"
 * - "abogado" -> "Abogado / Derecho"
 * - Cualquier otra carrera/profesión escrita -> Crea su propio punto dinámico con el nombre de la profesión!
 */
export function clasificarEstudioAbierto(respuestaRaw: string): string | null {
  const limpio = normalizarTexto(respuestaRaw)
  if (!limpio || limpio.length < 2) return null

  const respuestasNegativas = new Set([
    'no', 'ninguno', 'ninguna', 'nada', 'n a', 'na', 'no estudio',
    'no aplica', 'pase directamente al bloque 7', 'si', 'respuesta generada para prueba local',
    'ningun', 'sin estudios'
  ])
  if (respuestasNegativas.has(limpio) || limpio.startsWith('no ') || limpio.includes('pase directamente')) {
    return null
  }

  // Prioridad explícita para Data, Software, Sistemas y Abogado según lo solicitado
  if (/\b(data|datos|big data|ciencia de datos|analitica|analytics|bi)\b/.test(limpio)) {
    return 'Data'
  }
  if (/\b(software|adso|programacion|desarrollador|desarrollo web|fullstack|frontend|backend)\b/.test(limpio)) {
    return 'Software'
  }
  if (/\b(sistemas|informatica|computacion|redes|telecomunicaciones|ciberseguridad)\b/.test(limpio)) {
    return 'Sistemas'
  }
  if (/\b(abogado|abogada|derecho|leyes|juridica|juridico)\b/.test(limpio)) {
    return 'Abogado / Derecho'
  }

  // Verificar coincidencia en el resto del catálogo base
  for (const def of CATALOGO_CATEGORIAS_ESTUDIO) {
    if (normalizarTexto(def.categoria) === limpio) {
      return def.categoria
    }
    const coincide = def.palabrasClave.some(kw => {
      const kwNorm = normalizarTexto(kw)
      if (kwNorm.length <= 2) {
        return limpio.split(' ').includes(kwNorm)
      }
      return limpio.includes(kwNorm)
    })
    if (coincide) {
      return def.categoria
    }
  }

  // Excluir frases comunes de respuestas de opinión, opciones de encuesta o actitudes
  const esFraseOpinionOpcion = /\b(conocimiento|estable|retos|puesto|avanzar|empresa|organizacion|acuerdo|desacuerdo|neutral|excelente|regular|bueno|malo|siempre|nunca|a veces|casi siempre|opcion|siento|considero|laboral|oportunidad|crecimiento|salario|beneficios|liderazgo|jefe|ambiente)\b/.test(limpio)
  if (esFraseOpinionOpcion) {
    return null
  }

  // Si es otra profesión no listada (ej. "Arquitecto", "Enfermería", "Medicina", "Idiomas"),
  // se crea dinámicamente el punto para esa profesión
  return extraerNombreProfesionDinamica(respuestaRaw)
}

/**
 * Clasificador general para CUALQUIER pregunta de respuesta abierta anclada al Dashboard.
 * Si la pregunta trata de carreras/estudios/profesiones usa `clasificarEstudioAbierto`.
 * Si trata de otro tema abierto (ej. mejoras, problemas, sugerencias), agrupa respuestas
 * similares por punto clave o crea puntos dinámicos por cada tema expresado.
 */
export function clasificarRespuestaAbiertaParaGrafico(
  textoPregunta: string,
  respuestaRaw: string
): string | null {
  const pregNorm = normalizarTexto(textoPregunta)
  const respNorm = normalizarTexto(respuestaRaw)
  if (!respNorm || respNorm.length < 2) return null

  if (
    pregNorm.includes('estudi') ||
    pregNorm.includes('carrera') ||
    pregNorm.includes('profesion') ||
    pregNorm.includes('programa') ||
    pregNorm.includes('formacion')
  ) {
    return clasificarEstudioAbierto(respuestaRaw)
  }

  // También si la respuesta misma menciona una carrera conocida directamente
  if (/\b(sistemas|software|adso|data|datos|abogado|derecho|psicologia|administracion|contaduria|industrial|mercadeo)\b/.test(respNorm)) {
    const est = clasificarEstudioAbierto(respuestaRaw)
    if (est) return est
  }

  // Agrupación semántica para otras preguntas abiertas (ej. clima, liderazgo, herramientas, horarios)
  if (/\b(salario|sueldo|pago|remuneracion|bono|incentivo|aument)\b/.test(respNorm)) return 'Salario e Incentivos'
  if (/\b(horario|tiempo|descanso|turno|jornada|flexibilidad|horas)\b/.test(respNorm)) return 'Horarios y Flexibilidad'
  if (/\b(jefe|lider|supervisor|trato|comunicacion|respeto|escucha)\b/.test(respNorm)) return 'Liderazgo y Comunicación'
  if (/\b(equipo|computador|pc|internet|herramienta|sistema|silla|infraestructura)\b/.test(respNorm)) return 'Herramientas e Infraestructura'
  if (/\b(capacitacion|formacion|crecimiento|ascenso|oportunidad|carrera)\b/.test(respNorm)) return 'Crecimiento y Capacitación'
  if (/\b(carga|estres|presion|metas|sobrecarga|agotamiento)\b/.test(respNorm)) return 'Carga Laboral y Metas'
  if (/\b(ambiente|companerismo|clima|union|apoyo|equipo de trabajo)\b/.test(respNorm)) return 'Ambiente y Compañerismo'

  // Crear punto dinámico limpio con la idea expresada
  return extraerNombreProfesionDinamica(respuestaRaw)
}

/**
 * Obtiene los metadatos (habilidades, uso recomendado, color) de una categoría de estudio (fija o dinámica).
 */
export function obtenerMetadatosCategoriaEstudio(nombreCategoria: string, indexFallback: number = 0) {
  const encontrada = CATALOGO_CATEGORIAS_ESTUDIO.find(c => c.categoria.toLowerCase() === nombreCategoria.toLowerCase())
  if (encontrada) {
    return {
      habilidades: encontrada.habilidades,
      usoRecomendado: encontrada.usoRecomendado,
      color: encontrada.color
    }
  }

  return {
    habilidades: [`Talento en ${nombreCategoria}`, 'Especialización Profesional'],
    usoRecomendado: `Aprovechar el perfil profesional en ${nombreCategoria} para fortalecer proyectos del área.`,
    color: PALETA_DINAMICA[indexFallback % PALETA_DINAMICA.length] || '#0284c7'
  }
}
