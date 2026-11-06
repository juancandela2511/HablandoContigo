/**
 * ============================================================================
 * EXPORTADOR EXCEL ESTADÍSTICO (generadorExcel.ts)
 * ============================================================================
 * Genera el libro de cálculo .xls sincronizado con el Dashboard y las preguntas actuales.
 */

import type { ParametrosReporte } from '@/services/generadorReportes'
import { adaptarRespuestasAGrafico } from '@/services/adaptadorRespuestasGraficos'
import {
  generarBloqueFirma,
  obtenerPreguntasActualesSincronizadas
} from '@/services/reportesPdf/generadorGraficosSvgPdf'

export function exportarExcelEstadistico(params: ParametrosReporte): void {
  const {
    estadisticas,
    encuestas = [],
    respuestas = [],
    departamentoSeleccionado = 'Todos los Departamentos'
  } = params
  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
  const fecha = params.fechaPersonalizada || fechaHoy
  const empresa = params.nombreEmpresa || 'Sin empresa especificada'
  const presentador = params.nombrePresentador || 'Sin presentador especificado'
  const cargo = params.cargoPresentador || 'Sin cargo especificado'

  const kpis = {
    salud: estadisticas.analisisConclusionesIA.indiceGeneralSalud,
    enps: estadisticas.enps.score,
    participacion: estadisticas.participacion.tasaParticipacion,
    totalRespuestas: estadisticas.participacion.totalRespondieron
  }

  const preguntasActuales = obtenerPreguntasActualesSincronizadas(encuestas, estadisticas)

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #ffffff; color: #1e293b; }
        .titulo-principal { font-size: 18pt; font-weight: bold; color: #0284c7; padding: 10px 0; }
        .subtitulo { font-size: 10pt; color: #64748b; margin-bottom: 15px; }
        .seccion-header { font-size: 12pt; font-weight: bold; background-color: #0f172a; color: #ffffff; padding: 8px 12px; border-radius: 4px; }
        .kpi-card { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; text-align: center; }
        .kpi-valor { font-size: 16pt; font-weight: bold; color: #0284c7; }
        .kpi-etiqueta { font-size: 9pt; color: #475569; font-weight: 600; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 20px; }
        th { background-color: #1e293b; color: #ffffff; font-size: 9pt; font-weight: bold; padding: 8px 10px; border: 1px solid #334155; text-align: left; }
        td { font-size: 9pt; padding: 7px 10px; border: 1px solid #e2e8f0; vertical-align: middle; }
        .fila-par { background-color: #f8fafc; }
      </style>
    </head>
    <body>
      <table style="border: 2px solid #0284c7; background-color: #0f172a; margin-bottom: 25px;">
        <tr>
          <td colspan="4" style="background-color: #0369a1; color: #ffffff; padding: 18px; text-align: center;">
            <div style="font-size: 18pt; font-weight: 900; letter-spacing: 1px;">${empresa.toUpperCase()}</div>
            <div style="font-size: 11pt; color: #bae6fd; font-weight: bold; margin-top: 4px;">RESULTADOS CLIMA LABORAL · SINCRONIZADO CON DASHBOARD</div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: #94a3b8; font-size: 8pt; font-weight: bold; width: 25%;">PRESENTADO POR:</td>
          <td style="background-color: #0f172a; color: #ffffff; font-size: 9pt; font-weight: bold; width: 25%;">${presentador} (${cargo})</td>
          <td style="background-color: #1e293b; color: #94a3b8; font-size: 8pt; font-weight: bold; width: 25%;">FECHA DE EMISIÓN:</td>
          <td style="background-color: #0f172a; color: #ffffff; font-size: 9pt; font-weight: bold; width: 25%;">${fecha}</td>
        </tr>
      </table>

      <div class="titulo-principal">📊 RESULTADOS CLIMA LABORAL & OPCIONES DE RESPUESTA</div>
      <div class="subtitulo">${empresa} · Generado el ${fecha} · Filtro: <b>${departamentoSeleccionado}</b></div>
      
      <table>
        <tr>
          <td class="kpi-card">
            <div class="kpi-valor">${kpis.salud}%</div>
            <div class="kpi-etiqueta">ÍNDICE SALUD DE CLIMA</div>
          </td>
          <td class="kpi-card">
            <div class="kpi-valor">${kpis.enps > 0 ? '+' : ''}${kpis.enps}</div>
            <div class="kpi-etiqueta">eNPS LABORAL</div>
          </td>
          <td class="kpi-card">
            <div class="kpi-valor">${kpis.participacion}%</div>
            <div class="kpi-etiqueta">TASA DE PARTICIPACIÓN</div>
          </td>
          <td class="kpi-card">
            <div class="kpi-valor">${kpis.totalRespuestas}</div>
            <div class="kpi-etiqueta">TOTAL RESPUESTAS ANÓNIMAS</div>
          </td>
        </tr>
      </table>

      <div class="seccion-header">1. PREGUNTAS ACTUALIZADAS, OPCIONES DISPONIBLES Y RESPUESTAS OBTENIDAS</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Pregunta Actual</th>
            <th>Categoría</th>
            <th>Opciones de la Pregunta y Respuestas Obtenidas</th>
            <th>Total Respuestas</th>
          </tr>
        </thead>
        <tbody>
  `

  preguntasActuales.forEach((p, idx) => {
    const claseFila = idx % 2 === 0 ? 'fila-par' : ''
    const adaptacion = adaptarRespuestasAGrafico(p.id, p.texto, respuestas, preguntasActuales)
    const desgloseTexto = adaptacion.segmentos.length > 0
      ? adaptacion.segmentos.map(s => `${s.etiqueta}: ${s.valor} (${s.porcentaje}%)`).join(' | ')
      : 'Sin respuestas registradas'

    html += `
      <tr class="${claseFila}">
        <td>${idx + 1}</td>
        <td><b>${p.texto}</b></td>
        <td>${p.categoria || 'General'}</td>
        <td>${desgloseTexto}</td>
        <td><b>${adaptacion.totalMuestras}</b></td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
      ${generarBloqueFirma(params)}
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Resultados_Clima_Laboral_${new Date().toISOString().slice(0, 10)}.xls`
  a.click()
  URL.revokeObjectURL(url)
}
