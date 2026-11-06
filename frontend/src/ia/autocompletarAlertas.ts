/**
 * Reconocimiento y Autocompletado de Alertas por Sección
 */

import type { SugerenciaAlerta, OpcionPregunta } from './tiposIA'

export function sugerirAlertaParaSeccion(
  textoSeccionOPregunta: string,
  tiposDisponibles?: Array<{ id: string; nombre: string; palabrasClave?: string[] }>
): SugerenciaAlerta {
  const txt = (textoSeccionOPregunta || '').toLowerCase()

  if (/sexual|tocamiento|propuesta indebida|inapropiad|connotaci[oó]n sexual/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-acoso-sexual',
      nombreAlerta: 'Alerta de Acoso Sexual',
      severidad: 'Crítica',
      explicacion: 'Detecta conductas de vulneración, contacto no consentido o insinuaciones sexuales.'
    }
  }

  if (/acoso|hostig|grito|humillaci|trata mal|grosero|se la monta|maltrato/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-molestias-cotidianas',
      nombreAlerta: 'Alerta de Molestias y Fastidio Cotidiano',
      severidad: 'Crítica',
      explicacion: 'Identifica trato hostil, gritos, humillaciones o roces interpersonales.'
    }
  }

  if (/lider|líder|jefe|supervisor|coordinad|direcci|autoritar|favoritism/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-reconocimiento-valoracion',
      nombreAlerta: 'Alerta de Reconocimiento y Valoración',
      severidad: 'Alta',
      explicacion: 'Identifica percepción de falta de apoyo, empatía directiva o respaldo del líder.'
    }
  }

  if (/salud mental|depresi|ansiedad|llanto|desesper|p[aá]nico|burnout|agotad|estrés|estres|cansancio/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-sobrecarga-burnout',
      nombreAlerta: 'Alerta de Sobrecarga y Agotamiento (Burnout)',
      severidad: 'Crítica',
      explicacion: 'Señales de fatiga física o mental extrema y estrés desmedido en el puesto.'
    }
  }

  if (/carga|sobrecarga|hora extra|turno|descanso|jornada|presi[oó]n|explotaci/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-sobrecarga-burnout',
      nombreAlerta: 'Alerta de Sobrecarga y Agotamiento (Burnout)',
      severidad: 'Alta',
      explicacion: 'Exceso en la carga operativa o falta de descansos reglamentarios.'
    }
  }

  if (/herramient|equipo|computador|instalaci|ruido|infraestructur|diadema|silla|lento/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-recursos-condiciones',
      nombreAlerta: 'Alerta de Fallas en Recursos, Herramientas y Condiciones Físicas',
      severidad: 'Moderada',
      explicacion: 'Fallas materiales, lentitud técnica o condiciones ergonómicas deficientes.'
    }
  }

  if (tiposDisponibles) {
    for (const t of tiposDisponibles) {
      if (t.palabrasClave?.some(p => txt.includes(p.toLowerCase()))) {
        return { tipoAlertaId: t.id, nombreAlerta: t.nombre, severidad: 'Alta', explicacion: `Mapeo por palabras clave de ${t.nombre}.` }
      }
    }
  }

  return {
    tipoAlertaId: 'tipo-alerta-general',
    nombreAlerta: 'Alerta Psicosocial Preventiva',
    severidad: 'Moderada',
    explicacion: 'Asignación preventiva estándar para clima laboral.'
  }
}

export function autocompletarOpcionesConAlerta(opciones: OpcionPregunta[], seccion: string): OpcionPregunta[] {
  const alerta = sugerirAlertaParaSeccion(seccion)
  return opciones.map(opc => {
    const esNegativa = opc.valor === 1 || /muy mal|totalmente en desacuerdo|nunca/i.test(opc.texto)
    if (esNegativa) {
      return { ...opc, esAlerta: true, tipoAlertaId: alerta.tipoAlertaId, nombreAlerta: alerta.nombreAlerta, severidadAlerta: alerta.severidad, color: '#ef4444' }
    }
    return opc
  })
}
