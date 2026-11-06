/**
 * ============================================================================
 * ALERTAS TRONCALES DE NIVEL 3 Y 4 (alertasNivel3y4.ts)
 * ============================================================================
 * Alertas de severidad moderada y baja: Claridad de Rol, Capacitación,
 * Recursos y Condiciones Físicas, Crecimiento/Plan Carrera y Procesos.
 */

import type { TipoAlertaPersonalizada } from '../useTiposAlertas'

export const ALERTAS_NIVEL_3_Y_4: TipoAlertaPersonalizada[] = [
  {
    id: 'tipo-claridad-rol',
    nombre: 'Alerta de Falta de Claridad en el Rol',
    descripcion: 'Identifica órdenes contradictorias, mala explicación de funciones, desorganización de metas o procedimientos confusos.',
    nivel: 3,
    severidad: 'Moderada',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Detecta fallas en la entrega de instrucciones claras, estructuración de tareas y agilidad de procesos internos.',
    palabrasClave: [
      'no explica claro', 'órdenes contradictorias', 'ordenes contradictorias',
      'confusión', 'cambia de funciones', 'desorganización', 'procesos lentos', 'instructivos'
    ],
    protocoloAccion: 'Estandarización de manuales operativos, alineación de directrices entre supervisores y feedback estructurado.',
    icono: 'Scale',
    color: '#0ea5e9',
    activa: true
  },
  {
    id: 'tipo-capacitacion-induccion',
    nombre: 'Alerta de Déficit de Capacitación e Inducción',
    descripcion: 'Registra carencia de formación práctica actualizada, inducción insuficiente al cargo o falta de acompañamiento técnico.',
    nivel: 3,
    severidad: 'Moderada',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Identifica colaboradores que operan sin las capacitaciones o actualizaciones necesarias para su rol.',
    palabrasClave: [
      'capacitación', 'capacitaciones', 'inducción', 'entrenamiento',
      'sin formación', 'no enseñan', 'falta preparación', 'curso'
    ],
    protocoloAccion: 'Refuerzo del plan de formación continua y cápsulas de reinducción operativa por campaña.',
    icono: 'Zap',
    color: '#6366f1',
    activa: true
  },
  {
    id: 'tipo-recursos-condiciones',
    nombre: 'Alerta de Fallas en Recursos, Herramientas y Condiciones Físicas',
    descripcion: 'Detecta fallas en equipos de cómputo, diademas, lentitud de software, sillas incómodas, ruido, iluminación o climatización.',
    nivel: 3,
    severidad: 'Moderada',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Supervisa la calidad de las herramientas tecnológicas y la ergonomía física del puesto en el Call Center.',
    palabrasClave: [
      'herramientas', 'computador', 'pc lento', 'sistema lento', 'diadema',
      'silla', 'incómodo', 'ruido', 'calor', 'frío', 'iluminación', 'infraestructura'
    ],
    protocoloAccion: 'Ticket prioritario a Soporte TI y Mantenimiento / SST para adecuación ergonómica y técnica del puesto.',
    icono: 'ShieldAlert',
    color: '#f59e0b',
    activa: true
  },
  {
    id: 'tipo-crecimiento-subutilizacion',
    nombre: 'Alerta de Estancamiento y Subutilización de Talento',
    descripcion: 'Identifica colaboradores cuyos estudios o habilidades están subutilizados y que desconocen oportunidades de ascenso o plan carrera.',
    nivel: 4,
    severidad: 'Baja',
    modoEnfoque: 'general',
    enfoqueDetalle: 'Monitorea el aprovechamiento del nivel académico (Data, Software, Administración, etc.) y la transparencia en ascensos.',
    palabrasClave: [
      'subutilizado', 'plan carrera', 'ascender', 'ascenso',
      'crecimiento', 'oportunidades', 'estancado', 'no aprovechan mis estudios'
    ],
    protocoloAccion: 'Vinculación al semillero de talento interno y socialización de convocatorias de ascenso.',
    icono: 'Target',
    color: '#10b981',
    activa: true
  },
  {
    id: 'tipo-fallas-procesos',
    nombre: 'Alerta Fallas en Procesos de la Empresa',
    descripcion: 'Identifica lentitud o burocracia en procesos internos, falta de respuesta oportuna de RRHH, canales de comunicación inefectivos o falta de apertura organizacional.',
    nivel: 3,
    severidad: 'Moderada',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Monitorea la agilidad de los procesos internos, la efectividad de los canales de comunicación y la capacidad de respuesta de Gestión Humana.',
    palabrasClave: [
      'procesos lentos', 'burocracia', 'no responden', 'rrhh no responde',
      'gestión humana', 'comunicación interna', 'canales inefectivos', 'trámites', 'demora'
    ],
    protocoloAccion: 'Optimización de flujos internos, revisión de SLA de respuesta en Gestión Humana y fortalecimiento de canales de comunicación.',
    icono: 'Scale',
    color: '#06b6d4',
    activa: true
  }
]
