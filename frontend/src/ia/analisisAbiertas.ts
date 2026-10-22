/**
 * Análisis y Comprensión de Preguntas Abiertas con Ollama
 */

import { consultarOllama } from './clienteOllama'
import type { AnalisisRespuestaAbierta, ResumenEstadisticaAbiertas } from './tiposIA'

export async function analizarRespuestaAbierta(
  pregunta: string,
  respuesta: string
): Promise<AnalisisRespuestaAbierta> {
  const texto = (respuesta || '').trim()
  if (!texto || texto.length < 2) {
    return {
      clasificacion: 'Neutra',
      puntaje: 3,
      tema: 'Sin comentarios',
      resumen: 'Sin observaciones adicionales.',
      palabrasClave: [],
      esAlerta: false
    }
  }

  const prompt = `Analiza como psicólogo organizacional esta respuesta abierta de clima laboral:
PREGUNTA: "${pregunta}"
RESPUESTA: "${texto}"
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
    if (match) {
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

export interface ResumenComentariosPregunta {
  totalComentarios: number
  resumen: string
  sentimientoPredominante: 'Favorable' | 'Constructivo' | 'Crítico' | 'Sin comentarios'
  problemasPrincipales: string[]
  citasDirectas?: string[]
}

export async function resumirComentariosPreguntaConOllama(
  preguntaTexto: string,
  comentarios: string[]
): Promise<ResumenComentariosPregunta> {
  const limpios = comentarios
    .map(c => c.trim())
    .filter(c => c.length > 1 && !c.startsWith('No (Pase') && !c.startsWith('Parcialmente'))
    
  if (limpios.length === 0) {
    return {
      totalComentarios: 0,
      resumen: 'Aún no se han registrado comentarios cualitativos para esta pregunta.',
      sentimientoPredominante: 'Sin comentarios',
      problemasPrincipales: [],
      citasDirectas: []
    }
  }

  const prompt = `Actúa como psicólogo y especialista en analítica de clima laboral.
Analiza con total especificidad estos ${limpios.length} comentarios reales dejados por colaboradores en la encuesta para la pregunta:
PREGUNTA: "${preguntaTexto}"
COMENTARIOS DE COLABORADORES:
${limpios.slice(0, 25).map((c, i) => `${i + 1}. "${c}"`).join('\n')}

Genera un resumen ejecutivo MUY ESPECÍFICO (no genérico). Detalla exactamente qué quejas, personas señaladas, herramientas o conductas mencionan los colaboradores y cuál es el impacto.
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
      if (match) {
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
  } catch (err) {
    console.warn('[resumirComentariosPreguntaConOllama] Fallback local:', err)
  }

  // Fallback local analítico avanzado y específico
  return sintetizarComentariosLocalmente(preguntaTexto, limpios)
}

export function sintetizarComentariosLocalmente(preguntaTexto: string, comentarios: string[]): ResumenComentariosPregunta {
  const limpios = comentarios
    .map(c => c.trim())
    .filter(c => c.length > 1 && !c.startsWith('No (Pase') && !c.startsWith('Parcialmente'))

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
  const detallesEspecificos: string[] = []

  // 1. Detección de Acoso e Intimidación
  if (/acos|intimid|amenaz|miedo|toco|tocamiento/i.test(textoUnido)) {
    problemas.push('Señalamiento directo de acoso laboral e intimidación')
    detallesEspecificos.push('Los colaboradores reportan conductas de acoso e intimidación directa por parte de líderes o compañeros, exigiendo intervención inmediata de Gestión Humana')
  }

  // 2. Fricciones interpersonales y conductas molestas
  if (/habla mucho|no deja trabajar|fastidios|ruido|interrump/i.test(textoUnido)) {
    problemas.push('Interrupciones y dificultades para concentrarse en la labor')
    detallesEspecificos.push('Se reportan quejas sobre compañeros o supervisores que hablan en exceso durante el turno y no permiten operar adecuadamente')
  }

  // 3. Trato irrespetuoso y gritos
  if (/grito|grit[oó]|humill|groser|maltrato|alzar la voz/i.test(textoUnido)) {
    problemas.push('Trato irrespetuoso y comunicación agresiva')
    detallesEspecificos.push('Colaboradores expresan haber recibido gritos o descalificaciones en el área operativa')
  }

  // 4. Herramientas y Condiciones de Trabajo
  if (/herramienta|equipo|sistema|computador|pc|pantalla|lent|diadema|auricular/i.test(textoUnido)) {
    problemas.push('Fallas en herramientas, sistemas y equipos de trabajo')
    detallesEspecificos.push('Dificultades técnicas y falta de adecuación en herramientas físicas y software que impactan la productividad')
  }

  // 5. Carga de Trabajo y Turnos
  if (/carga|sobrecarga|tiempo|turno|horas extras|presi[oó]n|descanso/i.test(textoUnido)) {
    problemas.push('Sobrecarga operativa y presión horaria')
    detallesEspecificos.push('Inconformidades por extensión de turnos, descansos insuficientes o presión excesiva')
  }

  // 6. Trato desigual o favoritismo
  if (/favoritis|desigual|preferen|rosca/i.test(textoUnido)) {
    problemas.push('Percepción de favoritismo en el área')
    detallesEspecificos.push('Señalamientos sobre trato desigual en la asignación de turnos, permisos o metas')
  }

  // 7. Molestias generales expresadas
  if (/molesta|fastidia|incomod|pesad|cae mal/i.test(textoUnido) && detallesEspecificos.length === 0) {
    problemas.push('Incomodidades en el clima de convivencia diaria')
    detallesEspecificos.push('Se reportan actitudes y roces personales que deterioran la armonía y concentración del puesto')
  }

  const esCritico = problemas.length > 0 || /mal|inconforme|p[eé]simo|terrible|odio|harto/i.test(textoUnido)
  const esFavorable = /excelente|muy bien|positivo|content|buen|apoyo|gracias/i.test(textoUnido) && !esCritico

  let resumen = ''
  if (detallesEspecificos.length > 0) {
    resumen = `${detallesEspecificos.join('. ')}. La retroalimentación recopilada refleja puntos críticos que demandan atención específica.`
  } else if (esCritico) {
    resumen = `Se registraron ${total} queja(s) donde los colaboradores expresan inconformidad explícita con las condiciones y relaciones en esta pregunta.`
  } else if (esFavorable) {
    resumen = `Los ${total} comentarios recibidos destacan una percepción positiva y constructiva frente a esta dimensión de la organización.`
  } else {
    resumen = `Se registraron ${total} comentario(s) de retroalimentación donde los colaboradores aportan sugerencias y observaciones operativas directas.`
  }

  return {
    totalComentarios: total,
    resumen,
    sentimientoPredominante: esCritico ? 'Crítico' : esFavorable ? 'Favorable' : 'Constructivo',
    problemasPrincipales: problemas.length > 0 ? problemas : ['Observaciones operativas del equipo'],
    citasDirectas: limpios
  }
}

