/**
 * ============================================================================
 * ALERTAS TRONCALES DE NIVEL 1 Y 2 (alertasNivel1y2.ts)
 * ============================================================================
 * Alertas críticas y de alta severidad: Acoso Sexual, Molestias Cotidianas,
 * Burnout/Sobrecarga, Riesgo de Fuga, Invasión Vida Personal, Retribución
 * y Reconocimiento.
 */

import type { TipoAlertaPersonalizada } from '../useTiposAlertas'

export const ALERTAS_NIVEL_1_Y_2: TipoAlertaPersonalizada[] = [
  {
    id: 'tipo-acoso-sexual',
    nombre: 'Alerta de Acoso Sexual',
    descripcion: 'Detecta señalamientos de índole sexual: insinuaciones, propuestas indebidas, tocamientos, contacto físico no consentido o comentarios sexuales.',
    nivel: 1,
    severidad: 'Crítica',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Intervención inmediata y estricta ante cualquier conducta de connotación sexual, diferenciándola del roce operativo.',
    palabrasClave: [
      'acoso sexual', 'insinuación', 'insinuaciones', 'propuesta indebida',
      'propuestas indebidas', 'tocamiento', 'contacto físico', 'miradas lascivas',
      'comentarios sexuales', 'sobrepasó', 'propasar', 'indecente'
    ],
    protocoloAccion: 'Activación inmediata de protocolo de Comité de Convivencia Laboral, protección confidencial y ruta legal de Talento Humano.',
    icono: 'ShieldAlert',
    color: '#e11d48',
    activa: true
  },
  {
    id: 'tipo-molestias-cotidianas',
    nombre: 'Alerta de Molestias y Fastidio Cotidiano',
    descripcion: 'Identifica situaciones donde al colaborador "se la están montando", trato hostil, gritos, humillaciones, presión canzona o roces interpersonales (sin índole sexual).',
    nivel: 1,
    severidad: 'Crítica',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Enfocado en hostigamiento laboral no sexual, gritos, maltrato verbal, fastidio constante o persecución en el turno.',
    palabrasClave: [
      'se la monta', 'se la están montando', 'montándola', 'grita', 'gritos',
      'humilla', 'humillación', 'maltrato', 'hostil', 'fastidio', 'fastidia',
      'presión canzona', 'grosero', 'trata mal', 'conflicto'
    ],
    protocoloAccion: 'Mediación por Comité de Convivencia, revisión del estilo de supervisión y llamado a la comunicación respetuosa.',
    icono: 'AlertTriangle',
    color: '#f97316',
    activa: true
  },
  {
    id: 'tipo-sobrecarga-burnout',
    nombre: 'Alerta de Sobrecarga y Agotamiento (Burnout)',
    descripcion: 'Detecta estrés severo, fatiga física o mental extrema, metas desproporcionadas y agotamiento emocional crónico en el puesto.',
    nivel: 1,
    severidad: 'Crítica',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Monitorea cansancio extremo, sensación de colapso emocional, exceso de tareas e inequidad operativa.',
    palabrasClave: [
      'mucho estrés', 'sobrecargado', 'sobrecarga', 'mucho cansancio', 'agotamiento',
      'burnout', 'fatiga', 'colapso', 'metas imposibles', 'exceso de trabajo', 'ansiedad'
    ],
    protocoloAccion: 'Valoración por Psicología Organizacional / SST, redistribución de cargas operativas y pausas activas.',
    icono: 'Flame',
    color: '#ef4444',
    activa: true
  },
  {
    id: 'tipo-riesgo-fuga',
    nombre: 'Alerta de Riesgo de Fuga y Renuncia',
    descripcion: 'Identifica intención de retiro voluntario temprano, desmotivación severa con el puesto o falta de proyección a largo plazo en la empresa.',
    nivel: 2,
    severidad: 'Alta',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Anticipa bajas voluntarias cuando el colaborador expresa querer renunciar, buscar otro empleo o no visualizarse en la compañía.',
    palabrasClave: [
      'renunciar', 'renuncia', 'me voy', 'buscar otro trabajo', 'otro empleo',
      'no visualizo un crecimiento', 'desmotivado', 'no quiero seguir', 'retirarme'
    ],
    protocoloAccion: 'Entrevista preventiva de retención (Stay Interview) con Gestión Humana y revisión de factores motivacionales.',
    icono: 'UserX',
    color: '#f43f5e',
    activa: true
  },
  {
    id: 'tipo-invasion-vida-personal',
    nombre: 'Alerta de Invasión de Vida Personal / Desconexión Laboral',
    descripcion: 'Detecta vulneración del derecho a la desconexión laboral: mensajes o llamadas fuera de horario, en descansos, noches o fines de semana.',
    nivel: 2,
    severidad: 'Alta',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Vigila el respeto por los horarios de salida, descansos, vacaciones y equilibrio entre vida personal y trabajo.',
    palabrasClave: [
      'fuera de horario', 'desconexión', 'fin de semana', 'vacaciones',
      'whatsapp en la noche', 'llaman en descanso', 'equilibrio', 'vida personal', 'horas extras'
    ],
    protocoloAccion: 'Recordatorio formal de la Ley de Desconexión Laboral a líderes de área y control de comunicaciones fuera de turno.',
    icono: 'Clock',
    color: '#8b5cf6',
    activa: true
  },
  {
    id: 'tipo-retribucion-monetaria',
    nombre: 'Alerta de Insatisfacción en Retribución Monetaria y Beneficios',
    descripcion: 'Señala inconformidad crítica con el salario, comisiones, bonificaciones, pagos o programa de beneficios frente al esfuerzo exigido.',
    nivel: 2,
    severidad: 'Alta',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Evalúa la percepción de justicia salarial, puntualidad en pagos y atractivo de los beneficios corporativos.',
    palabrasClave: [
      'salario', 'sueldo', 'pago', 'remuneración', 'compensación', 'bono',
      'comisiones', 'beneficios', 'no alcanza', 'mal pagado', 'económico'
    ],
    protocoloAccion: 'Revisión de escala de compensación, claridad en liquidación de bonos y socialización del portafolio de beneficios.',
    icono: 'Coins',
    color: '#eab308',
    activa: true
  },
  {
    id: 'tipo-reconocimiento-valoracion',
    nombre: 'Alerta de Reconocimiento y Valoración',
    descripcion: 'Detecta percepción de invisibilidad del esfuerzo diario, ausencia de felicitaciones y falta de trato empático o respaldo del líder.',
    nivel: 2,
    severidad: 'Alta',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Monitorea si el jefe inmediato valora el esfuerzo, escucha ideas con respeto y brinda apoyo oportuno.',
    palabrasClave: [
      'no valora', 'nunca felicita', 'no reconoce', 'ignora el esfuerzo',
      'sin reconocimiento', 'no me escucha', 'nada de confianza', 'nunca me aconseja'
    ],
    protocoloAccion: 'Coaching de liderazgo asertivo para supervisores e implementación de rituales de reconocimiento continuo.',
    icono: 'HeartCrack',
    color: '#ec4899',
    activa: true
  }
]
