/**
 * Reconocimiento y Autocompletado de Alertas por Sección
 */

import type { SugerenciaAlerta, OpcionPregunta } from './tiposIA'

export function sugerirAlertaParaSeccion(
  textoSeccionOPregunta: string,
  tiposDisponibles?: Array<{ id: string; nombre: string; palabrasClave?: string[] }>
): SugerenciaAlerta {
  const txt = (textoSeccionOPregunta || '').toLowerCase()

  if (/acoso|tocamiento|hostig|discriminaci|sexual|intimidaci|humillaci/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-acoso',
      nombreAlerta: 'Acoso Laboral & Hostigamiento',
      severidad: 'Crítica',
      explicacion: 'Detecta conductas de vulneración o acoso.'
    }
  }

  if (/lider|líder|jefe|supervisor|coordinad|direcci|autoritar|gritos|favoritism/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-jefes-gestion',
      nombreAlerta: 'Mala Gestión de Jefes & Liderazgo Tóxico',
      severidad: 'Alta',
      explicacion: 'Identifica abuso de autoridad o falta de empatía directiva.'
    }
  }

  if (/salud mental|depresi|ansiedad|llanto|desesper|p[aá]nico|burnout|agotad/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-depresion',
      nombreAlerta: 'Crisis Anímica & Salud Mental (Burnout)',
      severidad: 'Crítica',
      explicacion: 'Señales de agotamiento o crisis emocional extrema.'
    }
  }

  if (/carga|sobrecarga|hora extra|turno|descanso|jornada|presi[oó]n|explotaci/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-sobrecarga',
      nombreAlerta: 'Sobrecarga & Jornada Extensiva',
      severidad: 'Alta',
      explicacion: 'Exceso en la carga operativa o falta de descansos reglamentarios.'
    }
  }

  if (/herramient|equipo|computador|instalaci|ruido|infraestructur/i.test(txt)) {
    return {
      tipoAlertaId: 'tipo-instalaciones',
      nombreAlerta: 'Infraestructura & Condiciones Físicas',
      severidad: 'Moderada',
      explicacion: 'Fallas materiales o condiciones inseguras en el puesto de trabajo.'
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
