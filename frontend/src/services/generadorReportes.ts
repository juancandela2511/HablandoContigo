/**
 * ============================================================================
 * GENERADOR DE REPORTES Y PRESENTACIONES EJECUTIVAS (generadorReportes.ts)
 * ============================================================================
 * Orquesta la exportación en PDF/Presentación y Excel sincronizada con el Dashboard.
 */

import type { EstadisticasCompletas } from '@/Almacenes/useEstadisticas'
import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import type { InformeDetalladoPdfIA } from '@/asistenteOllama/tiposAsistente'
import { construirSlidesAnalisisDetalladoIA } from '@/services/reportesPdf/generadorSlidesConclusionesIA'
import { adaptarRespuestasAGrafico, type SegmentoGrafico } from '@/services/adaptadorRespuestasGraficos'
import { ESTILOS_PRESENTACION_PDF } from '@/services/reportesPdf/estilosPresentacionPdf'
import {
  generarBloqueFirma,
  obtenerPreguntasActualesSincronizadas,
  generarGraficoOpcionesRealesHtml
} from '@/services/reportesPdf/generadorGraficosSvgPdf'
import { exportarExcelEstadistico } from '@/services/reportesPdf/generadorExcel'

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

export { exportarExcelEstadistico }

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

  const slidesPreguntasHtml = preguntasActuales.map((p, idx) => {
    const adaptacion = adaptarRespuestasAGrafico(p.id, p.texto, respuestas, preguntasActuales)
    const opcionMayor = [...adaptacion.segmentos].sort((a, b) => b.valor - a.valor)[0]

    const textoAnalisis = adaptacion.totalMuestras > 0 && opcionMayor
      ? `De un total de <b>${adaptacion.totalMuestras} respuesta(s)</b> registradas en el Dashboard para esta pregunta, la opción con mayor elección es <b>"${opcionMayor.etiqueta}"</b> con <b>${opcionMayor.valor} voto(s) (${opcionMayor.porcentaje}%)</b>.`
      : `Pregunta activa en el cuestionario actual con ${adaptacion.segmentos.length} opciones configuradas. Pendiente de recibir respuestas.`

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
          <p class="slide-analisis-texto">${textoAnalisis}</p>
          <div class="slide-logo-caja">
            <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>
    `
  }).join('')

  const itemsAnt = estadisticas.estadisticasAntiguedad || []
  const menos6m = itemsAnt.find(i => i.id === 'menos-6m')?.cantidad || 0
  const de6m1a = itemsAnt.find(i => i.id === '6m-1a')?.cantidad || 0
  const de1a3a = itemsAnt.find(i => i.id === '1a-3a')?.cantidad || 0
  const mas3a = itemsAnt.find(i => i.id === 'mas-3a')?.cantidad || 0
  const totalAnt = menos6m + de6m1a + de1a3a + mas3a
  const sumaAnt = totalAnt || 1
  const retencionFormulaPct = totalAnt > 0
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
        ${generarGraficoOpcionesRealesHtml(segmentosAntiguedad, totalAnt)}
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
          <p class="conclusion-parrafo">${estadisticas.analisisConclusionesIA.diagnosticoEjecutivo}</p>
          <div class="firma-evaluador">
            <div class="firma-linea"></div>
            <strong>${presentador}</strong>
            <span>${cargo}</span>
            <span style="color: #0284c7; font-weight: 600;">${empresa}</span>
          </div>
        </div>
      </div>
      <div class="slide-footer-pregunta" style="margin-top: 20px;">
        <div style="font-size: 11px; color: #64748b; font-weight: 600;">${fecha} · Informe Sincronizado con el Dashboard</div>
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
      <style>${ESTILOS_PRESENTACION_PDF}</style>
    </head>
    <body>
      <button class="boton-imprimir-flotante" onclick="window.print()">🖨️ Imprimir / Guardar Presentación en PDF</button>
      <div class="diapositiva-slide portada-bg">
        <div>
          <div class="portada-empresa">${empresa}</div>
          <h1 class="portada-titulo-grande">RESULTADOS<br />CLIMA<br />LABORAL</h1>
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

      <div class="diapositiva-slide fondo-blanco">
        <div class="slide-header-pregunta" style="margin-bottom: 20px;">
          <h2 class="slide-titulo-grande">Resumen General del Dashboard</h2>
          <div class="linea-decorativa" style="margin: 6px 0 0 0;"></div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px; line-height: 1.65; font-size: 13px; color: #334155;">
          <p style="margin: 0;">Este informe imprime directamente las preguntas actualizadas, las opciones configuradas en cada pregunta y los resultados en vivo del Dashboard de <b>${empresa}</b>.</p>
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
          <div style="font-size: 11px; color: #64748b; font-weight: 500;">Sincronizado en tiempo real con el Dashboard y Editor de Preguntas</div>
          <div class="slide-logo-caja">
            <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>

      ${slidesPreguntasHtml}
      ${slideAntiguedadDashboardHtml}
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
