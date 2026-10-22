/**
 * ============================================================================
 * GENERADOR DE REPORTES Y PRESENTACIONES EJECUTIVAS (generadorReportes.ts)
 * ============================================================================
 * 
 * ¿QUÉ HACE?
 * Genera informes ejecutivos sincronizados 100% con el Dashboard y las preguntas actuales:
 * 1. PDF / Presentación de Diapositivas:
 *    - Muestra todas las preguntas actuales de la encuesta activa con su enunciado actualizado.
 *    - En cada gráfica muestra exactamente las opciones de respuesta que tenía la pregunta
 *      (con sus votos reales, porcentajes y colores desde rojo menor puntaje hasta verde mayor puntaje)
 *      y para preguntas abiertas muestra los puntos dinámicos creados (ej. Sistemas, Software, Data, Abogado).
 *    - Incluye la diapositiva de Antigüedad y Retención (con la fórmula oficial) y los gráficos del Dashboard.
 * 2. Excel (.xls): Libro de cálculo con las preguntas actualizadas, sus opciones exactas y desglose real.
 */

import type { EstadisticasCompletas } from '@/Almacenes/useEstadisticas'
import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import type { InformeDetalladoPdfIA } from '@/asistenteOllama/tiposAsistente'
import type { PreguntaEncuesta } from '@/ia'
import { construirSlidesAnalisisDetalladoIA } from '@/services/reportesPdf/generadorSlidesConclusionesIA'
import { adaptarRespuestasAGrafico, type SegmentoGrafico } from '@/services/adaptadorRespuestasGraficos'

export interface ParametrosReporte {
  estadisticas: EstadisticasCompletas
  encuestas?: Encuesta[]
  respuestas?: RegistroRespuesta[]
  departamentoSeleccionado?: string
  encuestaSeleccionada?: string
  nombrePresentador?: string
  cargoPresentador?: string
  nombreEmpresa?: string
  fechaPersonalizada?: string
  logoPersonalizadoUrl?: string
  firmaDataUrl?: string
  fechaFirma?: string
  informeDetalladoIA?: InformeDetalladoPdfIA
}

function generarBloqueFirma(params: ParametrosReporte): string {
  if (!params.firmaDataUrl) return ''
  const fechaFirma = params.fechaFirma || new Date().toISOString()
  return `<section style="margin-top:32px;padding-top:16px;border-top:1px solid #cbd5e1;">
    <div style="font-weight:700;color:#0f172a;">Firma de validación</div>
    <img src="${params.firmaDataUrl}" alt="Firma del responsable" style="display:block;max-width:260px;height:80px;object-fit:contain;object-position:left bottom;" />
    <div style="font-size:10px;color:#64748b;">Firmado el ${fechaFirma}</div>
  </section>`
}

function generarBarraGraficaTexto(porcentaje: number): string {
  const bloquesTotal = 10
  const llenos = Math.max(0, Math.min(bloquesTotal, Math.round(porcentaje / 10)))
  const vacios = bloquesTotal - llenos
  return '█'.repeat(llenos) + '░'.repeat(vacios) + ` ${porcentaje}%`
}

function obtenerColorPorcentaje(porcentaje: number): string {
  if (porcentaje >= 80) return '#10b981'
  if (porcentaje >= 65) return '#22c55e'
  if (porcentaje >= 50) return '#f59e0b'
  return '#ef4444'
}

/**
 * Obtiene la lista consolidada de preguntas actuales de la encuesta activa para que
 * cualquier cambio hecho en las preguntas u opciones se refleje inmediatamente en el informe.
 */
function obtenerPreguntasActualesSincronizadas(
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

/**
 * Genera el gráfico circular SVG + barras de opciones reales con las opciones que había en la pregunta
 */
function generarGraficoOpcionesRealesHtml(segmentos: SegmentoGrafico[], totalMuestras: number): string {
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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. EXPORTACIÓN A EXCEL (.xls) SINCRONIZADA CON EL DASHBOARD Y PREGUNTAS ACTUALES
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function exportarExcelEstadistico(params: ParametrosReporte): void {
  const { estadisticas, encuestas = [], respuestas = [], departamentoSeleccionado = 'Todos los Departamentos' } = params
  const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const fecha = params.fechaPersonalizada || fechaHoy
  const empresa = params.nombreEmpresa || 'Sin empresa especificada'
  const presentador = params.nombrePresentador || 'Sin presentador especificado'
  const cargo = params.cargoPresentador || 'Sin cargo especificado'

  const kpis = {
    salud: estadisticas.analisisConclusionesIA.indiceGeneralSalud,
    enps: estadisticas.enps.score,
    participacion: estadisticas.participacion.tasaParticipacion,
    totalRespuestas: estadisticas.participacion.totalRespondieron,
    alertas: estadisticas.posiblesFallosAreas.length
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
        .badge-optimo { background-color: #d1fae5; color: #065f46; font-weight: bold; text-align: center; }
        .badge-moderado { background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center; }
        .badge-critico { background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center; }
        .barra-grafica { font-family: monospace; font-size: 10pt; font-weight: bold; }
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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. EXPORTACIÓN A PDF / PRESENTACIÓN SINCRONIZADA CON EL DASHBOARD
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function exportarPDFEjecutivo(params: ParametrosReporte): void {
  const { estadisticas, encuestas = [], respuestas = [] } = params
  const fechaHoy = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
  const fecha = params.fechaPersonalizada || fechaHoy
  const empresa = params.nombreEmpresa || 'Sin empresa especificada'
  const presentador = params.nombrePresentador || 'Sin presentador especificado'
  const cargo = params.cargoPresentador || 'Sin cargo especificado'
  const logoUrl = params.logoPersonalizadoUrl || ''

  const preguntasActuales = obtenerPreguntasActualesSincronizadas(encuestas, estadisticas)

  // Generar una diapositiva por cada pregunta actual mostrando SUS opciones reales y SUS respuestas
  const slidesPreguntasHtml = preguntasActuales.map((p, idx) => {
    const adaptacion = adaptarRespuestasAGrafico(p.id, p.texto, respuestas, preguntasActuales)
    const opcionMayor = [...adaptacion.segmentos].sort((a, b) => b.valor - a.valor)[0]

    let textoAnalisis = ''
    if (adaptacion.totalMuestras > 0 && opcionMayor) {
      textoAnalisis = `De un total de <b>${adaptacion.totalMuestras} respuesta(s)</b> registradas en el Dashboard para esta pregunta, la opción con mayor elección es <b>"${opcionMayor.etiqueta}"</b> con <b>${opcionMayor.valor} voto(s) (${opcionMayor.porcentaje}%)</b>.`
    } else {
      textoAnalisis = `Pregunta activa en el cuestionario actual con ${adaptacion.segmentos.length} opciones configuradas. Pendiente de recibir respuestas.`
    }

    return `
      <div class="diapositiva-slide fondo-blanco">
        <div class="slide-header-pregunta">
          <div class="badge-dim">${p.categoria || 'Diagnóstico de Clima'} · ${p.tipo === 'texto' ? 'Pregunta Abierta (Agrupación Dinámica IA)' : 'Opciones de la Pregunta'}</div>
          <h3 class="slide-titulo-pregunta">${idx + 1}. ${p.texto}</h3>
        </div>

        <div class="slide-cuerpo-pai">
          ${generarGraficoOpcionesRealesHtml(adaptacion.segmentos, adaptacion.totalMuestras)}
        </div>

        <div class="slide-footer-pregunta">
          <p class="slide-analisis-texto">
            ${textoAnalisis}
          </p>
          <div class="slide-logo-caja">
            <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>
    `
  }).join('')

  // Diapositiva de Antigüedad y Retención del Dashboard (con la fórmula oficial)
  const itemsAnt = estadisticas.estadisticasAntiguedad || []
  const menos6m = itemsAnt.find(i => i.id === 'menos-6m')?.cantidad || 0
  const de6m1a = itemsAnt.find(i => i.id === '6m-1a')?.cantidad || 0
  const de1a3a = itemsAnt.find(i => i.id === '1a-3a')?.cantidad || 0
  const mas3a = itemsAnt.find(i => i.id === 'mas-3a')?.cantidad || 0
  const sumaAnt = (menos6m + de6m1a + de1a3a + mas3a) || 1
  const retencionFormulaPct = (menos6m + de6m1a + de1a3a + mas3a) > 0
    ? Number((((menos6m * 0.10) + (de6m1a * 0.20) + (de1a3a * 0.30) + (mas3a * 0.40)) / (sumaAnt * 0.40) * 100).toFixed(1))
    : 0

  const segmentosAntiguedad: SegmentoGrafico[] = [
    { etiqueta: 'Menos de 6 meses (Peso 10%)', valor: menos6m, porcentaje: Math.round((menos6m / sumaAnt) * 100), color: '#ef4444' },
    { etiqueta: 'De 6 meses a 1 año (Peso 20%)', valor: de6m1a, porcentaje: Math.round((de6m1a / sumaAnt) * 100), color: '#f97316' },
    { etiqueta: 'De 1 a 3 años (Peso 30%)', valor: de1a3a, porcentaje: Math.round((de1a3a / sumaAnt) * 100), color: '#f59e0b' },
    { etiqueta: 'Más de 3 años (Peso 40%)', valor: mas3a, porcentaje: Math.round((mas3a / sumaAnt) * 100), color: '#10b981' }
  ]

  const slideAntiguedadDashboardHtml = `
    <div class="diapositiva-slide fondo-blanco">
      <div class="slide-header-pregunta">
        <div class="badge-dim">Métrica Sincronizada del Dashboard</div>
        <h3 class="slide-titulo-pregunta">Proyección de Antigüedad y Retención — Resultado Fórmula: ${retencionFormulaPct}%</h3>
      </div>

      <div class="slide-cuerpo-pai">
        ${generarGraficoOpcionesRealesHtml(segmentosAntiguedad, menos6m + de6m1a + de1a3a + mas3a)}
      </div>

      <div class="slide-footer-pregunta">
        <p class="slide-analisis-texto">
          <b>Fórmula aplicada:</b> =((Menos de 6m × 10%) + (6m a 1 año × 20%) + (1 a 3 años × 30%) + (Más de 3 años × 40%)) / Total Evaluados = <b>${retencionFormulaPct}%</b>.
        </p>
        <div class="slide-logo-caja">
          <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>
  `

  // Diapositiva Conclusión
  const slideConclusionHtml = params.informeDetalladoIA
    ? construirSlidesAnalisisDetalladoIA({
        informeIA: params.informeDetalladoIA,
        empresa,
        presentador,
        cargo,
        fecha,
        logoUrl,
        indiceSalud: estadisticas.analisisConclusionesIA.indiceGeneralSalud,
        enps: estadisticas.enps.score
      })
    : `
    <div class="diapositiva-slide fondo-blanco">
      <div class="slide-header-pregunta" style="margin-bottom: 24px;">
        <h2 class="slide-titulo-grande">Conclusión</h2>
        <div class="linea-decorativa" style="margin: 6px 0 0 0;"></div>
      </div>

      <div class="cuerpo-conclusion">
        <div class="conclusion-texto-caja">
          <p class="conclusion-parrafo">
            ${estadisticas.analisisConclusionesIA.diagnosticoEjecutivo}
          </p>
          <div class="firma-evaluador">
            <div class="firma-linea"></div>
            <strong>${presentador}</strong>
            <span>${cargo}</span>
            <span style="color: #0284c7; font-weight: 600;">${empresa}</span>
          </div>
        </div>
      </div>

      <div class="slide-footer-pregunta" style="margin-top: 20px;">
        <div style="font-size: 11px; color: #64748b; font-weight: 600;">
          ${fecha} · Informe Sincronizado con el Dashboard
        </div>
        <div class="slide-logo-caja">
          <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>
  `

  const contenidoHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Resultados Clima Laboral - ${empresa}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 24px 10px;
          background-color: #0b1329;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          align-items: center;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .diapositiva-slide {
          width: 960px;
          height: 540px;
          max-width: 100%;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
          page-break-after: always;
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 46px 28px 46px;
          margin-bottom: 30px;
        }
        .fondo-blanco {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
        }
        .portada-bg {
          background: linear-gradient(135deg, #071938 0%, #0d2757 45%, #13397d 80%, #0a2046 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .portada-empresa {
          font-size: 16px;
          font-weight: 700;
          color: #60a5fa;
          letter-spacing: 0.5px;
          margin-bottom: 24px;
        }
        .portada-titulo-grande {
          font-size: 44px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.12;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .portada-datos {
          margin-top: 30px;
        }
        .portada-fecha {
          font-size: 14px;
          color: #93c5fd;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .portada-presentador {
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
        }
        .portada-cargo {
          font-size: 13px;
          color: #cbd5e1;
          margin-top: 2px;
        }
        .portada-logo-caja {
          background: #ffffff;
          padding: 8px 16px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .portada-logo-img {
          max-height: 48px;
          max-width: 170px;
          object-fit: contain;
        }
        .slide-header-pregunta {
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 10px;
        }
        .badge-dim {
          font-size: 10px;
          font-weight: 800;
          color: #0284c7;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 4px;
        }
        .slide-titulo-pregunta {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.35;
        }
        .slide-cuerpo-pai {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .slide-footer-pregunta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid #f1f5f9;
          padding-top: 10px;
        }
        .slide-analisis-texto {
          font-size: 11.5px;
          color: #334155;
          margin: 0;
          line-height: 1.5;
          max-width: 760px;
          font-weight: 500;
        }
        .slide-logo-caja {
          flex-shrink: 0;
        }
        .slide-logo-img {
          max-height: 32px;
          max-width: 120px;
          object-fit: contain;
        }
        .slide-titulo-grande {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
        }
        .linea-decorativa {
          width: 50px;
          height: 3px;
          background: #0284c7;
          border-radius: 2px;
          margin: 8px auto 0 auto;
        }
        .cuerpo-conclusion {
          display: grid;
          grid-template-columns: 1fr;
          align-items: center;
          gap: 30px;
          flex: 1;
        }
        .conclusion-texto-caja {
          line-height: 1.6;
        }
        .conclusion-parrafo {
          font-size: 13px;
          color: #334155;
          margin: 0 0 14px 0;
          font-weight: 500;
        }
        .firma-evaluador {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          font-size: 12px;
        }
        .firma-linea {
          width: 140px;
          height: 1.5px;
          background: #94a3b8;
          margin-bottom: 6px;
        }
        .boton-imprimir-flotante {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0284c7;
          color: #ffffff;
          padding: 14px 28px;
          border-radius: 30px;
          font-weight: 800;
          font-size: 14px;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(2, 132, 199, 0.4);
          z-index: 9999;
        }
        @media print {
          body {
            background-color: #ffffff;
            padding: 0;
            margin: 0;
          }
          .diapositiva-slide {
            width: 100vw;
            height: 100vh;
            max-width: none;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-after: always;
            page-break-inside: avoid;
            padding: 40px 48px;
          }
          .boton-imprimir-flotante {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <button class="boton-imprimir-flotante" onclick="window.print()">
        🖨️ Imprimir / Guardar Presentación en PDF
      </button>

      <!-- DIAPOSITIVA 1: PORTADA CORPORATIVA -->
      <div class="diapositiva-slide portada-bg">
        <div>
          <div class="portada-empresa">${empresa}</div>
          <h1 class="portada-titulo-grande">
            RESULTADOS<br />
            CLIMA<br />
            LABORAL
          </h1>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div class="portada-datos">
            <div class="portada-fecha">${fecha}</div>
            <div class="portada-presentador">${presentador}</div>
            <div class="portada-cargo">${cargo}</div>
          </div>
          <div class="portada-logo-caja">
            <img src="${logoUrl}" alt="Logo" class="portada-logo-img" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>

      <!-- DIAPOSITIVA 2: RESUMEN DEL DASHBOARD -->
      <div class="diapositiva-slide fondo-blanco">
        <div class="slide-header-pregunta" style="margin-bottom: 20px;">
          <h2 class="slide-titulo-grande">Resumen General del Dashboard</h2>
          <div class="linea-decorativa" style="margin: 6px 0 0 0;"></div>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px; line-height: 1.65; font-size: 13px; color: #334155;">
          <p style="margin: 0;">
            Este informe imprime directamente las preguntas actualizadas, las opciones configuradas en cada pregunta y los resultados en vivo del Dashboard de <b>${empresa}</b>.
          </p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 10px 0;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; color: #0284c7;">${estadisticas.participacion.totalRespondieron}</div>
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Colaboradores Evaluados</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; color: #10b981;">${preguntasActuales.length}</div>
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Preguntas Actuales Impresas</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; color: #f59e0b;">${estadisticas.analisisConclusionesIA.indiceGeneralSalud}%</div>
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Salud Global de Clima</div>
            </div>
          </div>
        </div>

        <div class="slide-footer-pregunta">
          <div style="font-size: 11px; color: #64748b; font-weight: 500;">
            Sincronizado en tiempo real con el Dashboard y Editor de Preguntas
          </div>
          <div class="slide-logo-caja">
            <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>

      <!-- DIAPOSITIVAS DE CADA PREGUNTA CON SUS OPCIONES Y RESPUESTAS REALES -->
      ${slidesPreguntasHtml}

      <!-- DIAPOSITIVA DE PROYECCIÓN DE ANTIGÜEDAD Y RETENCIÓN DEL DASHBOARD -->
      ${slideAntiguedadDashboardHtml}

      <!-- DIAPOSITIVA FINAL: CONCLUSIÓN -->
      ${slideConclusionHtml}
      ${generarBloqueFirma(params)}
    </body>
    </html>
  `

  const ventana = window.open('', '_blank')
  if (ventana) {
    ventana.document.write(contenidoHtml)
    ventana.document.close()
    setTimeout(() => {
      ventana.focus()
      ventana.print()
    }, 600)
  }
}
