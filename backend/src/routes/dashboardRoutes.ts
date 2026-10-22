/**
 * ============================================================================
 * RUTAS DEL DASHBOARD (backend/src/routes/dashboardRoutes.ts)
 * ============================================================================
 */

import { Router } from 'express'
import {
  getDashboardStats,
  getDashboardRetencion,
  getDashboardRadar,
  saveDashboardRadar,
  restaurarDashboardRadar,
  getGraficosAnclados,
  saveGraficoAnclado,
  deleteGraficoAnclado
} from '../controllers/dashboardController.js'

const router = Router()

// GET /api/dashboard/stats?idEncuesta=enc-001&departamento=Operaciones
router.get('/stats', getDashboardStats)

// GET /api/dashboard/retencion?idEncuesta=enc-001
router.get('/retencion', getDashboardRetencion)

// Radar
router.get('/radar', getDashboardRadar)
router.post('/radar', saveDashboardRadar)
router.post('/radar/restaurar', restaurarDashboardRadar)

// Gráficos Anclados
router.get('/graficos-anclados', getGraficosAnclados)
router.post('/graficos-anclados', saveGraficoAnclado)
router.delete('/graficos-anclados/:id', deleteGraficoAnclado)

export default router
