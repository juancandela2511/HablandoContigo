/**
 * ============================================================================
 * CONTROLADOR DE INTELIGENCIA ARTIFICIAL (backend/src/controllers/iaController.ts)
 * ============================================================================
 * Expone endpoints para análisis de sentimiento NLP y conclusiones ejecutivas.
 */

import type { Request, Response } from 'express'
import { IAService } from '../services/iaService.js'

/**
 * POST /api/ia/analizar-respuesta
 * Analiza texto libre detectando sentimiento y alertas psicosociales
 */
export async function postAnalizarRespuesta(req: Request, res: Response): Promise<void> {
  try {
    const { textoPregunta, respuestaTexto } = req.body
    if (!respuestaTexto) {
      res.status(400).json({ error: 'Se requiere el campo respuestaTexto' })
      return
    }

    const resultado = await IAService.analizarTextoAbierto(
      textoPregunta || 'Comentario de encuesta',
      respuestaTexto
    )

    res.json(resultado)
  } catch (error: any) {
    console.error('[iaController.postAnalizarRespuesta] Error:', error)
    res.status(500).json({ error: 'Error en el servicio de IA' })
  }
}

/**
 * POST /api/ia/conclusiones
 * Genera conclusiones ejecutivas a partir de los indicadores actuales
 */
export async function postGenerarConclusiones(req: Request, res: Response): Promise<void> {
  try {
    const { porcentajeClima, enps, totalRespuestas } = req.body

    const conclusiones = await IAService.generarConclusionesEjecutivas(
      Number(porcentajeClima || 75),
      Number(enps || 20),
      Number(totalRespuestas || 30)
    )

    res.json(conclusiones)
  } catch (error: any) {
    console.error('[iaController.postGenerarConclusiones] Error:', error)
    res.status(500).json({ error: 'Error al generar conclusiones con IA' })
  }
}

/**
 * POST /api/ia/resumen-comentarios
 * Resume y sintetiza los comentarios libres dejados por los colaboradores con Ollama
 */
export async function postResumirComentarios(req: Request, res: Response): Promise<void> {
  try {
    const { comentarios } = req.body
    const lista = Array.isArray(comentarios) ? comentarios : []

    const resultado = await IAService.resumirComentariosOllama(lista)
    res.json(resultado)
  } catch (error: any) {
    console.error('[iaController.postResumirComentarios] Error:', error)
    res.status(500).json({ error: 'Error al resumir comentarios con IA Ollama' })
  }
}
