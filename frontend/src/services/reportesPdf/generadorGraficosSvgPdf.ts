/**
 * ============================================================================
 * GENERADOR DE GRÁFICOS SVG Y UTILIDADES DE REPORTE (generadorGraficosSvgPdf.ts)
 * ============================================================================
 * Construye los gráficos circulares SVG y barras de opciones reales para los informes.
 */

import type { EstadisticasCompletas } from '@/Almacenes/useEstadisticas'
import type { Encuesta } from '@/Almacenes/useEncuestas'
import type { PreguntaEncuesta } from '@/ia'
import type { SegmentoGrafico } from '@/services/adaptadorRespuestasGraficos'
import type { ParametrosReporte } from '@/services/generadorReportes'

export function generarBloqueFirma(params: ParametrosReporte): string {
  if (!params.firmaDataUrl) return ''
  const fechaFirma = params.fechaFirma || new Date().toISOString()
  return `<section style="margin-top:32px;padding-top:16px;border-top:1px solid #cbd5e1;">
    <div style="font-weight:700;color:#0f172a;">Firma de validación</div>
    <img src="${params.firmaDataUrl}" alt="Firma del responsable" style="display:block;max-width:260px;height:80px;object-fit:contain;object-position:left bottom;" />
    <div style="font-size:10px;color:#64748b;">Firmado el ${fechaFirma}</div>
  </section>`
}

export function obtenerPreguntasActualesSincronizadas(
  encuestas: Encuesta[] = [],
  estadisticas: EstadisticasCompletas
): PreguntaEncuesta[] {
  const listaPreguntas: PreguntaEncuesta[] = []
  const idsVistos = new Set<string>()

  encuestas.forEach(enc => {
    ;(enc.preguntas || []).forEach(p => {
      if (!idsVistos.has(p.id)) {
        idsVistos.add(p.id)
        listaPreguntas.push(p)
      }
    })
  })

  if (listaPreguntas.length === 0 && estadisticas.desgloseRespuestasDetalladas) {
    estadisticas.desgloseRespuestasDetalladas.forEach(d => {
      listaPreguntas.push({
        id: d.idPregunta,
        texto: d.pregunta,
        categoria: d.categoria,
        tipo: 'multiple',
        opciones: []
      })
    })
  }

  return listaPreguntas
}

export function generarGraficoOpcionesRealesHtml(segmentos: SegmentoGrafico[], totalMuestras: number): string {
  const cx = 85
  const cy = 85
  const radio = 68
  const validSlices = segmentos.filter(s => s.porcentaje > 0)

  let paths = ''
  if (validSlices.length === 0) {
    paths = `<circle cx="${cx}" cy="${cy}" r="${radio}" fill="#e2e8f0" />`
  } else if (validSlices.length === 1 && validSlices[0]) {
    paths = `<circle cx="${cx}" cy="${cy}" r="${radio}" fill="${validSlices[0].color}" stroke="#ffffff" stroke-width="2.5" />`
  } else {
    let anguloAcumulado = -90
    paths = validSlices.map(s => {
      const anguloArco = (s.porcentaje / 100) * 360
      const aInicio = anguloAcumulado
      const aFin = anguloAcumulado + anguloArco
      anguloAcumulado = aFin

      const radInicio = (aInicio * Math.PI) / 180
      const radFin = (aFin * Math.PI) / 180
      const x1 = cx + radio * Math.cos(radInicio)
      const y1 = cy + radio * Math.sin(radInicio)
      const x2 = cx + radio * Math.cos(radFin)
      const y2 = cy + radio * Math.sin(radFin)
      const granArco = anguloArco > 180 ? 1 : 0

      return `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radio} ${radio} 0 ${granArco} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${s.color}" stroke="#ffffff" stroke-width="2" />`
    }).join('')
  }

  const filasOpciones = segmentos.length > 0
    ? segmentos.map(s => `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background-color: ${s.color}; flex-shrink: 0;"></span>
              <span style="color: #1e293b; font-weight: 700;">${s.etiqueta}</span>
            </div>
            <div style="font-family: monospace; font-weight: 800; color: #0f172a;">
              ${s.valor} resp. (${s.porcentaje}%)
            </div>
          </div>
          <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
            <div style="width: ${Math.max(s.porcentaje, s.valor > 0 ? 4 : 0)}%; height: 100%; background: ${s.color}; border-radius: 999px;"></div>
          </div>
        </div>
      `).join('')
    : `<div style="color: #64748b; font-size: 12px; font-style: italic;">Sin respuestas registradas aún para esta pregunta.</div>`

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 32px; width: 100%; margin: 10px 0;">
      <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
        <svg viewBox="0 0 170 170" width="160" height="160" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.12));">
          ${paths}
          <circle cx="${cx}" cy="${cy}" r="${radio * 0.38}" fill="#ffffff" />
        </svg>
        <span style="font-size: 11px; font-weight: 700; color: #64748b; margin-top: 4px;">Total: ${totalMuestras} respuesta(s)</span>
      </div>
      <div style="flex: 1; max-height: 250px; overflow: hidden;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.5px;">
          Opciones de la pregunta y respuestas obtenidas:
        </div>
        ${filasOpciones}
      </div>
    </div>
  `
}
