/**
 * ============================================================================
 * ANÁLISIS Y SÍNTESIS DE PREGUNTAS ABIERTAS CON OLLAMA (analisisAbiertas.ts)
 * ============================================================================
 * Analiza exclusivamente comentarios libres y respuestas abiertas, filtrando
 * cualquier etiqueta de selección múltiple.
 */

import { consultarOllama } from './clienteOllama'
import type { AnalisisRespuestaAbierta } from './tiposIA'
import { esOpcionMultipleCerrada } from './menciones/filtroComentariosReales'

export interface ResumenComentariosPregunta {
  totalComentarios: number
  resumen: string
  sentimientoPredominante: 'Favorable' | 'Constructivo' | 'Crítico' | 'Sin comentarios'
  problemasPrincipales: string[]
  citasDirectas?: string[]
}

export async function analizarRespuestaAbierta(
  pregunta: string,
  respuesta: string
): Promise<AnalisisRespuestaAbierta> {
  const texto = (respuesta || '').trim()
  if (!texto || texto.length < 3 || esOpcionMultipleCerrada(texto)) {
    return {
      clasificacion: 'Neutra',
      puntaje: 3,
      tema: 'Sin comentarios',
      resumen: 'Sin observaciones adicionales.',
      palabrasClave: [],
      esAlerta: false
    }
  }

  const prompt = `Analiza como psicólogo organizacional este comentario libre de clima laboral:
PREGUNTA: "${pregunta}"
COMENTARIO: "${texto}"
Responde ÚNICAMENTE un JSON:
{
  "clasificacion": "Buena" | "Mala" | "Neutra",
  "puntaje": 1 a 5,
  "tema": "Liderazgo" | "Salud Mental" | "Carga Laboral" | "Acoso y Convivencia" | "Infraestructura" | "Procesos",
  "resumen": "Resumen conciso de 1 frase de lo que pasa",
  "esAlerta": true o false,
  "alerta": { "tipoAlertaId": "tipo-jefes-gestion", "nombre": "Nombre Alerta", "severidad": "Alta", "motivo": "Explicación" }
}`

  const raw = await consultarOllama(prompt)
  if (raw) {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match && match[0]) {
      try {
        const p = JSON.parse(match[0])
        return {
          clasificacion: p.clasificacion || (p.puntaje <= 2 ? 'Mala' : 'Neutra'),
          puntaje: Math.max(1, Math.min(5, Number(p.puntaje) || 3)),
          tema: p.tema || 'General',
          resumen: p.resumen || 'Resumen procesado por Ollama.',
          palabrasClave: [p.tema || 'clima'],
          esAlerta: Boolean(p.esAlerta || p.clasificacion === 'Mala'),
          alertaSugerida: p.esAlerta && p.alerta ? p.alerta : undefined
        }
      } catch {}
    }
  }

  return fallbackLocalAbierta(texto)
}

function fallbackLocalAbierta(texto: string): AnalisisRespuestaAbierta {
  const low = texto.toLowerCase()
  if (/acoso|me toco|toco|tocamiento|inapropiad|sexual|humillaci/i.test(low)) {
    return {
      clasificacion: 'Mala', puntaje: 1, tema: 'Acoso y Convivencia',
      resumen: `Reporte de posible vulneración o acoso: "${texto.slice(0, 90)}..."`,
      palabrasClave: ['acoso'], esAlerta: true,
      alertaSugerida: { tipoAlertaId: 'tipo-acoso', nombre: 'Acoso Laboral', severidad: 'Crítica', motivo: 'Reporte de hostigamiento o contacto inapropiado.' }
    }
  }
  if (/grito|insult|amenaz|maltrato|jefe grita|autoritari/i.test(low)) {
    return {
      clasificacion: 'Mala', puntaje: 1, tema: 'Liderazgo',
      resumen: `Inconformidad con el trato o jefatura directa: "${texto.slice(0, 90)}..."`,
      palabrasClave: ['liderazgo'], esAlerta: true,
      alertaSugerida: { tipoAlertaId: 'tipo-jefes-gestion', nombre: 'Liderazgo Tóxico', severidad: 'Alta', motivo: 'Trato autoritario o gritos en el área.' }
    }
  }
  if (/excelente|muy bien|motivad|feliz|gran equipo|apoyo|gracias/i.test(low)) {
    return {
      clasificacion: 'Buena', puntaje: 5, tema: 'Satisfacción',
      resumen: 'Comentario positivo con percepción favorable de bienestar y equipo.',
      palabrasClave: ['motivación'], esAlerta: false
    }
  }
  return {
    clasificacion: 'Neutra', puntaje: 3, tema: 'Mejora Operativa',
    resumen: 'Propuesta constructiva u observación sin evidencia de riesgo psicosocial.',
    palabrasClave: ['mejora'], esAlerta: false
  }
}

export async function resumirComentariosPreguntaConOllama(
  preguntaTexto: string,
  comentarios: string[]
): Promise<ResumenComentariosPregunta> {
  const limpios = comentarios
    .map(c => c.trim())
    .filter(c => c.length >= 3 && !esOpcionMultipleCerrada(c))

  if (limpios.length === 0) {
    return {
      totalComentarios: 0,
      resumen: 'Aún no se han registrado comentarios cualitativos para esta pregunta.',
      sentimientoPredominante: 'Sin comentarios',
      problemasPrincipales: [],
      citasDirectas: []
    }
  }

  const prompt = `Actúa como psicólogo especialista en clima laboral.
Analiza estos ${limpios.length} comentarios escritos por colaboradores para la pregunta:
PREGUNTA: "${preguntaTexto}"
COMENTARIOS:
${limpios.slice(0, 25).map((c, i) => `${i + 1}. "${c}"`).join('\n')}

Responde ÚNICAMENTE en JSON:
{
  "resumen": "Resumen detallado y específico de lo que pasa en los comentarios...",
  "sentimientoPredominante": "Crítico" | "Constructivo" | "Favorable",
  "problemasPrincipales": ["Problema específico 1", "Problema específico 2"]
}`

  try {
    const raw = await consultarOllama(prompt)
    if (raw) {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match && match[0]) {
        const parsed = JSON.parse(match[0])
        return {
          totalComentarios: limpios.length,
          resumen: parsed.resumen || 'Resumen cualitativo generado con IA.',
          sentimientoPredominante: parsed.sentimientoPredominante || 'Crítico',
          problemasPrincipales: Array.isArray(parsed.problemasPrincipales) ? parsed.problemasPrincipales.slice(0, 5) : [],
          citasDirectas: limpios
        }
      }
    }
  } catch {}

  return sintetizarComentariosLocalmente(preguntaTexto, limpios)
}

export function sintetizarComentariosLocalmente(_preguntaTexto: string, comentarios: string[]): ResumenComentariosPregunta {
  const limpios = comentarios.map(c => c.trim()).filter(c => c.length >= 3 && !esOpcionMultipleCerrada(c))
  const total = limpios.length
  if (total === 0) {
    return {
      totalComentarios: 0,
      resumen: 'Aún no se han registrado observaciones cualitativas para esta pregunta.',
      sentimientoPredominante: 'Sin comentarios',
      problemasPrincipales: [],
      citasDirectas: []
    }
  }

  const textoUnido = limpios.join(' ').toLowerCase()
  const problemas: string[] = []
  const detalles: string[] = []

  if (/acos|intimid|amenaz|miedo|toco|tocamiento/i.test(textoUnido)) {
    problemas.push('Señalamiento directo de acoso laboral e intimidación')
    detalles.push('Se reportan conductas de acoso o intimidación que exigen intervención de RRHH')
  }
  if (/grito|grit[oó]|humill|groser|maltrato|alzar la voz/i.test(textoUnido)) {
    problemas.push('Trato irrespetuoso y comunicación agresiva')
    detalles.push('Colaboradores expresan haber recibido gritos o descalificaciones')
  }
  if (/herramienta|equipo|sistema|computador|pc|pantalla|lent|diadema/i.test(textoUnido)) {
    problemas.push('Fallas en herramientas, sistemas y equipos de trabajo')
    detalles.push('Dificultades técnicas en equipos y software que impactan la operación')
  }
  if (/carga|sobrecarga|tiempo|turno|horas extras|presi[oó]n|descanso/i.test(textoUnido)) {
    problemas.push('Sobrecarga operativa y presión horaria')
    detalles.push('Inconformidades por extensión de turnos o descansos insuficientes')
  }
  if (/favoritis|desigual|preferen|rosca/i.test(textoUnido)) {
    problemas.push('Percepción de favoritismo en el área')
    detalles.push('Señalamientos sobre trato desigual en asignación de turnos o metas')
  }

  const esCritico = problemas.length > 0 || /mal|inconforme|p[eé]simo|terrible|harto/i.test(textoUnido)
  const esFavorable = /excelente|muy bien|positivo|content|buen|apoyo|gracias/i.test(textoUnido) && !esCritico

  const resumen = detalles.length > 0
    ? `${detalles.join('. ')}.`
    : esCritico
      ? `Se registraron ${total} queja(s) con inconformidad explícita en esta pregunta.`
      : esFavorable
        ? `Los ${total} comentarios recibidos destacan una percepción positiva y constructiva.`
        : `Se registraron ${total} comentario(s) con sugerencias y observaciones operativas.`

  return {
    totalComentarios: total,
    resumen,
    sentimientoPredominante: esCritico ? 'Crítico' : esFavorable ? 'Favorable' : 'Constructivo',
    problemasPrincipales: problemas.length > 0 ? problemas : ['Observaciones operativas del equipo'],
    citasDirectas: limpios
  }
}
