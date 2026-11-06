/**
 * ============================================================================
 * CONTROLADOR DEL DASHBOARD (backend/src/controllers/dashboardController.ts)
 * ============================================================================
 * Expone endpoints REST para alimentar el Dashboard ejecutivo directamente
 * con agregaciones SQL y métricas pre-calculadas en el backend.
 */

import type { Request, Response } from 'express'
import { DashboardService } from '../services/dashboardService.js'
import { pool } from '../config/db.js'

/**
 * GET /api/dashboard/stats
 * Retorna las métricas consolidadas del proyecto (Clima, eNPS, Antigüedad, Radar, etc.)
 */
export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const idEncuesta = String(req.query.idEncuesta || 'enc-001')
    const departamento = req.query.departamento ? String(req.query.departamento) : undefined

    const metricas = await DashboardService.obtenerMetricasProyecto(idEncuesta, departamento)
    res.json(metricas)
  } catch (error: any) {
    console.error('[dashboardController.getDashboardStats] Error:', error)
    res.json({ totalRespuestas: 0, saludPromedio: 0, alertasActivas: 0 })
  }
}

/**
 * GET /api/dashboard/retencion
 * Retorna exclusivamente el análisis de permanencia y retención ponderada
 */
export async function getDashboardRetencion(req: Request, res: Response): Promise<void> {
  try {
    const idEncuesta = String(req.query.idEncuesta || 'enc-001')
    const metricas = await DashboardService.obtenerMetricasProyecto(idEncuesta)
    res.json(metricas.antiguedadYRetencion)
  } catch (error: any) {
    console.error('[dashboardController.getDashboardRetencion] Error:', error)
    res.status(500).json({ error: 'Error al consultar retención' })
  }
}

/**
 * GET /api/dashboard/radar
 * Retorna la configuración de metas y dimensiones del radar
 */
export async function getDashboardRadar(req: Request, res: Response): Promise<void> {
  try {
    const resDb = await pool.query("SELECT COALESCE(metadata->'radarConfig', '{}'::jsonb) as radar FROM encuestas WHERE id = 'enc-001'")
    const radar = resDb.rows[0]?.radar || {}
    res.json({
      metaGlobal: radar.metaGlobal || 85,
      dimensiones: radar.dimensiones || []
    })
  } catch (error: any) {
    res.json({ metaGlobal: 85, dimensiones: [] })
  }
}

/**
 * POST /api/dashboard/radar
 * Guarda la configuración de metas y dimensiones del radar
 */
export async function saveDashboardRadar(req: Request, res: Response): Promise<void> {
  try {
    const { metaGlobal, dimensiones } = req.body
    await pool.query(
      "UPDATE encuestas SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{radarConfig}', $1::jsonb, true) WHERE id = 'enc-001'",
      [JSON.stringify({ metaGlobal: metaGlobal || 85, dimensiones: dimensiones || [] })]
    )
    res.json({ ok: true, mensaje: 'Configuración del radar guardada.' })
  } catch (error: any) {
    console.error('[dashboardController.saveDashboardRadar] Error:', error)
    res.status(500).json({ error: 'Error al guardar configuración del radar' })
  }
}

/**
 * POST /api/dashboard/radar/restaurar
 */
export async function restaurarDashboardRadar(req: Request, res: Response): Promise<void> {
  try {
    await pool.query(
      "UPDATE encuestas SET metadata = metadata - 'radarConfig' WHERE id = 'enc-001'"
    )
    res.json({ ok: true, mensaje: 'Configuración del radar restaurada.' })
  } catch (error: any) {
    res.json({ ok: true })
  }
}

/**
 * GET /api/dashboard/graficos-anclados
 */
export async function getGraficosAnclados(req: Request, res: Response): Promise<void> {
  try {
    const resDb = await pool.query("SELECT COALESCE(metadata->'graficosAnclados', '[]'::jsonb) as graficos FROM encuestas WHERE id = 'enc-001'")
    const graficos = resDb.rows[0]?.graficos || []
    res.json(Array.isArray(graficos) ? graficos : [])
  } catch (error: any) {
    res.json([])
  }
}

/**
 * POST /api/dashboard/graficos-anclados
 */
export async function saveGraficoAnclado(req: Request, res: Response): Promise<void> {
  try {
    const nuevo = req.body
    const resDb = await pool.query("SELECT COALESCE(metadata->'graficosAnclados', '[]'::jsonb) as graficos FROM encuestas WHERE id = 'enc-001'")
    let lista = resDb.rows[0]?.graficos || []
    if (!Array.isArray(lista)) lista = []

    const idx = lista.findIndex((g: any) => g.id === nuevo.id || (g.idPregunta && g.idPregunta === nuevo.idPregunta && g.tipoGrafico === nuevo.tipoGrafico))
    if (idx !== -1) {
      lista[idx] = nuevo
    } else {
      lista.push(nuevo)
    }

    await pool.query(
      "UPDATE encuestas SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{graficosAnclados}', $1::jsonb, true) WHERE id = 'enc-001'",
      [JSON.stringify(lista)]
    )
    res.json({ ok: true, mensaje: 'Gráfico anclado guardado.' })
  } catch (error: any) {
    res.status(500).json({ error: 'Error al guardar gráfico anclado' })
  }
}

/**
 * DELETE /api/dashboard/graficos-anclados/:id
 */
export async function deleteGraficoAnclado(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const resDb = await pool.query("SELECT COALESCE(metadata->'graficosAnclados', '[]'::jsonb) as graficos FROM encuestas WHERE id = 'enc-001'")
    let lista = resDb.rows[0]?.graficos || []
    if (Array.isArray(lista)) {
      lista = lista.filter((g: any) => g.id !== id)
      await pool.query(
        "UPDATE encuestas SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{graficosAnclados}', $1::jsonb, true) WHERE id = 'enc-001'",
        [JSON.stringify(lista)]
      )
    }
    res.json({ ok: true, mensaje: 'Gráfico desanclado.' })
  } catch (error: any) {
    res.json({ ok: true })
  }
}

