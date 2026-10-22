/**
 * ============================================================================
 * CONTROLADOR DEL COPILOTO OLLAMA EN ADMINISTRACIÓN (asistenteController.ts)
 * ============================================================================
 * Expone los endpoints REST para sugerencias interactivas de administración
 * (alertas, gráficos anclados, preguntas) y análisis detallado de informes PDF.
 */

import type { Request, Response } from 'express'
import { generarSugerenciasAdminConOllama } from './generadorSugerenciasIA.js'
import { generarInformeDetalladoPdfConOllama } from './analizadorInformePdfIA.js'

/**
 * POST /api/ia/sugerencias-admin
 * Genera sugerencias proactivas de alertas, gráficos anclados y preguntas
 */
export async function postSugerenciasAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { preguntas, alertasExistentes, graficosAncladosIds, resumenRespuestas } = req.body || {}
    const resultado = await generarSugerenciasAdminConOllama({
      preguntas,
      alertasExistentes,
      graficosAncladosIds,
      resumenRespuestas
    })
    res.json(resultado)
  } catch (error: any) {
    console.error('[asistenteController.postSugerenciasAdmin] Error:', error)
    res.status(500).json({ error: 'Error al generar sugerencias administrativas con Ollama' })
  }
}

/**
 * POST /api/ia/informe-detallado-pdf
 * Genera análisis profundo de fortalezas, debilidades y conclusiones para el PDF
 */
export async function postInformeDetalladoPdf(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await generarInformeDetalladoPdfConOllama(req.body || {})
    res.json(resultado)
  } catch (error: any) {
    console.error('[asistenteController.postInformeDetalladoPdf] Error:', error)
    res.status(500).json({ error: 'Error al generar análisis detallado para PDF con Ollama' })
  }
}
