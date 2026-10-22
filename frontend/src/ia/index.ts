/**
 * Punto de Entrada Unificado del Módulo de IA (src/ia)
 */

export * from './tiposIA'
export * from './clienteOllama'
export * from './analisisAbiertas'
export * from './autocompletarAlertas'
export * from './deteccionMenciones'
export * from './analizadorAlertasPorPersona'
export * from './utilidadesUI'

// Stubs de compatibilidad
export async function generarEncuestaConIA(): Promise<any> { return null }
export async function optimizarEncuestaBaseConIA(): Promise<any> { return null }
export async function evaluarRespuestasConGeminiEstricto(params: any): Promise<any> {
  const respuestas = params.respuestas || []
  const alertas: any[] = []
  for (const r of respuestas) {
    if (r.esAlerta || /acoso|grito|llanto/i.test(`${r.respuesta} ${r.comentario || ''}`)) {
      alertas.push({ estadoAlerta: 'Activada', clasificacion: 'Mala', prioridad: 'Alta', categoria: r.categoria })
    }
  }
  return { success: true, hayAlertas: alertas.length > 0, totalAlertas: alertas.length, alertas }
}
export async function clasificarRespuestaAbiertaConIA(pregunta: string, respuesta: string) {
  const { analizarRespuestaAbierta } = await import('./analisisAbiertas')
  const r = await analizarRespuestaAbierta(pregunta, respuesta)
  return { clasificacion: r.clasificacion, puntaje: r.puntaje, tema: r.tema, justificacion: r.resumen }
}
