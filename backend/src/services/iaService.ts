/**
 * ============================================================================
 * SERVICIO DE INTELIGENCIA ARTIFICIAL & NLP (backend/src/services/iaService.ts)
 * ============================================================================
 * Orquestador principal de análisis de sentimiento, conclusiones ejecutivas
 * y síntesis de comentarios en español.
 */

import { verificarEstadoOllama } from './ia/clienteOllama.js'
import {
  analizarTextoAbierto,
  type AnalisisSentimientoRespuesta
} from './ia/analizadorTextoAbierto.js'
import {
  generarConclusionesEjecutivas,
  resumirComentariosOllama
} from './ia/sintesisComentarios.js'

export type { AnalisisSentimientoRespuesta }

export class IAService {
  /**
   * Verifica la conectividad con Ollama en el servidor
   */
  static verificarEstadoOllama(): Promise<boolean> {
    return verificarEstadoOllama()
  }

  /**
   * Analiza una respuesta de texto abierto detectando sentimiento y posibles alertas
   */
  static analizarTextoAbierto(
    textoPregunta: string,
    respuestaTexto: string
  ): Promise<AnalisisSentimientoRespuesta> {
    return analizarTextoAbierto(textoPregunta, respuestaTexto)
  }

  /**
   * Genera conclusiones ejecutivas para directivos sobre el clima global
   */
  static generarConclusionesEjecutivas(
    porcentajeClima: number,
    enps: number,
    totalRespuestas: number
  ) {
    return generarConclusionesEjecutivas(porcentajeClima, enps, totalRespuestas)
  }

  /**
   * Resume y sintetiza los comentarios libres dejados por los colaboradores
   */
  static resumirComentariosOllama(
    comentarios: Array<{ texto: string; pregunta?: string; calificacion?: number }>
  ) {
    return resumirComentariosOllama(comentarios)
  }
}
