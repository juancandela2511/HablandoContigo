/**
 * ============================================================================
 * GENERADOR DE DIAPOSITIVAS PDF DE FORTALEZAS Y DEBILIDADES CON OLLAMA
 * (frontend/src/services/reportesPdf/generadorSlidesConclusionesIA.ts)
 * ============================================================================
 * Construye las páginas de análisis detallado del informe PDF especificando:
 * 1. Puntos Fuertes (Fortalezas consolidadas del Clima Laboral).
 * 2. Puntos Débiles (Brechas, focos de riesgo y oportunidades de mejora).
 * 3. Diagnóstico Ejecutivo y Conclusiones detalladas de Ollama IA.
 */

import type { InformeDetalladoPdfIA } from '@/asistenteOllama/tiposAsistente'

export function construirSlidesAnalisisDetalladoIA(params: {
  informeIA: InformeDetalladoPdfIA
  empresa: string
  presentador: string
  cargo: string
  fecha: string
  logoUrl: string
  indiceSalud: number
  enps: number
}): string {
  const { informeIA, empresa, presentador, cargo, fecha, logoUrl, indiceSalud, enps } = params

  const htmlPuntosFuertes = (informeIA.puntosFuertes || []).map(f => `
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <strong style="font-size: 12px; color: #065f46;">✅ ${f.titulo} (${f.dimension})</strong>
        <span style="background: #10b981; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 99px;">
          ${f.puntajePorcentaje}% Favorable
        </span>
      </div>
      <p style="font-size: 10.5px; color: #1e293b; margin: 0 0 4px 0; line-height: 1.45;">
        ${f.analisisDetallado}
      </p>
      <div style="font-size: 9.5px; color: #047857; font-weight: 700;">
        Impacto Positivo: ${f.impactoOrganizacional}
      </div>
    </div>
  `).join('')

  const htmlPuntosDebiles = (informeIA.puntosDebiles || []).map(d => `
    <div style="background: #fff1f2; border-left: 4px solid #f43f5e; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <strong style="font-size: 12px; color: #9f1239;">⚠️ ${d.titulo} (${d.dimension})</strong>
        <span style="background: #f43f5e; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 99px;">
          ${d.puntajePorcentaje}% Atención
        </span>
      </div>
      <p style="font-size: 10.5px; color: #1e293b; margin: 0 0 4px 0; line-height: 1.45;">
        ${d.analisisDetallado}
      </p>
      <div style="font-size: 9.5px; color: #be123c; font-weight: 700;">
        Riesgo Detectado: ${d.impactoOrganizacional}
      </div>
    </div>
  `).join('')

  const htmlRecomendaciones = (informeIA.recomendacionesEstrategicas || []).map((rec, idx) => `
    <li style="margin-bottom: 6px; font-size: 11px; color: #1e293b; line-height: 1.45;">
      <strong style="color: #0284c7;">Acción ${idx + 1}:</strong> ${rec}
    </li>
  `).join('')

  return `
    <!-- ================================================================== -->
    <!-- DIAPOSITIVA ESPECIAL IA: PUNTOS FUERTES Y PUNTOS DÉBILES           -->
    <!-- ================================================================== -->
    <div class="diapositiva-slide fondo-blanco">
      <div class="slide-header-pregunta" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div class="badge-dim">ANÁLISIS PROFUNDO CON INTELIGENCIA ARTIFICIAL · ${informeIA.origenMotor}</div>
          <h2 class="slide-titulo-grande" style="font-size: 21px;">Diagnóstico de Puntos Fuertes y Puntos Débiles</h2>
        </div>
        <div style="font-size: 11px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 4px 12px; border-radius: 99px;">
          Clima Global: ${indiceSalud}% · eNPS: ${enps > 0 ? '+' : ''}${enps}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; flex: 1; align-items: start;">
        <!-- Columna Izquierda: Puntos Fuertes -->
        <div>
          <h4 style="font-size: 13px; font-weight: 900; color: #065f46; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.4px;">
            🟢 Puntos Fuertes (Fortalezas Clave)
          </h4>
          ${htmlPuntosFuertes}
        </div>

        <!-- Columna Derecha: Puntos Débiles -->
        <div>
          <h4 style="font-size: 13px; font-weight: 900; color: #9f1239; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.4px;">
            🔴 Puntos Débiles (Brechas y Focos de Mejora)
          </h4>
          ${htmlPuntosDebiles}
        </div>
      </div>

      <div class="slide-footer-pregunta" style="margin-top: 8px;">
        <div style="font-size: 10.5px; color: #475569; font-weight: 600;">
          <b>Síntesis Diagnóstica:</b> ${informeIA.diagnosticoGlobal}
        </div>
        <div class="slide-logo-caja">
          <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>

    <!-- ================================================================== -->
    <!-- DIAPOSITIVA FINAL: CONCLUSIONES DETALLADAS DE CLIMA LABORAL (IA)   -->
    <!-- ================================================================== -->
    <div class="diapositiva-slide fondo-blanco">
      <div class="slide-header-pregunta" style="margin-bottom: 14px;">
        <div class="badge-dim">CONCLUSIONES EJECUTIVAS Y HOJA DE RUTA · OLLAMA IA</div>
        <h2 class="slide-titulo-grande" style="font-size: 22px;">Conclusiones Detalladas del Clima Laboral</h2>
        <div class="linea-decorativa" style="margin: 6px 0 0 0;"></div>
      </div>

      <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 22px; flex: 1; align-items: center;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 14px;">
            <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin-bottom: 4px;">
              1. Evaluación Integral de Resultados
            </div>
            <p style="font-size: 11.5px; color: #1e293b; margin: 0; line-height: 1.5;">
              ${informeIA.resumenEjecutivo}
            </p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 14px;">
            <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin-bottom: 4px;">
              2. Plan de Intervención Recomendado por IA
            </div>
            <ul style="margin: 0; padding-left: 16px;">
              ${htmlRecomendaciones}
            </ul>
          </div>

          <p style="font-size: 11.5px; color: #0f172a; margin: 0; font-weight: 600; line-height: 1.45;">
            <b>Conclusión Directiva:</b> ${informeIA.conclusionDirectiva}
          </p>
        </div>

        <!-- Bloque de Validación y Firma Ejecutiva -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.8px;">
              Dictamen Ejecutivo
            </div>
            <div style="font-size: 32px; font-weight: 900; color: #ffffff; margin: 6px 0;">
              ${indiceSalud}%
            </div>
            <div style="font-size: 11px; color: #bae6fd; font-weight: 600;">
              Índice Consolidado de Clima Organizacional
            </div>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 12px; margin-top: 16px; font-size: 11.5px;">
            <div style="font-weight: 800; color: #ffffff;">${presentador}</div>
            <div style="color: #cbd5e1; font-size: 10.5px;">${cargo}</div>
            <div style="color: #38bdf8; font-weight: 700; font-size: 10.5px; margin-top: 2px;">${empresa}</div>
          </div>
        </div>
      </div>

      <div class="slide-footer-pregunta" style="margin-top: 12px;">
        <div style="font-size: 10.5px; color: #64748b; font-weight: 600;">
          ${fecha} · Informe Analítico Generado con Asistencia de Ollama IA
        </div>
        <div class="slide-logo-caja">
          <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>
  `
}
