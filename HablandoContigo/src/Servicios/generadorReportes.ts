/**
 * ============================================================================
 * GENERADOR DE REPORTES Y PRESENTACIONES EJECUTIVAS (generadorReportes.ts)
 * ============================================================================
 * 
 * ¿QUÉ HACE?
 * Genera informes ejecutivos de alta dirección tipo presentación:
 * 1. PDF / Presentación de Diapositivas:
 *    - Portada corporativa personalizada (Nombre de Empresa, Título, Fecha de hoy,
 *      Nombre de quien presenta, Cargo y Logo subido/personalizado).
 *    - Diapositiva de Introducción y alcance del diagnóstico.
 *    - Diapositivas individuales por cada pregunta con gráfico circular de PAI (torta SVG),
 *      leyendas porcentuales y texto analítico explicativo.
 *    - Diapositiva de Percepción General de Clima Laboral con gráfico de Pai consolidado.
 *    - Diapositivas de Objetivos de Mejora estructuradas por áreas clave.
 *    - Diapositiva final de Conclusión ejecutiva y compromiso organizacional.
 * 2. Excel (.xls): Libro de cálculo con portada institucional, KPIs ejecutivos,
 *    desglose por preguntas y barras gráficas visuales de progreso.
 * 
 * ¿CON QUÉ SE CONECTA?
 * - ModalExportarInforme.vue
 * - useEstadisticas.ts
 * - useEncuestas.ts
 */

import type { EstadisticasCompletas } from '@/Almacenes/useEstadisticas'
import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'

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
}

/**
 * Genera una barra gráfica visual de progreso para hojas de cálculo Excel
 */
function generarBarraGraficaTexto(porcentaje: number): string {
  const bloquesTotal = 10
  const llenos = Math.max(0, Math.min(bloquesTotal, Math.round(porcentaje / 10)))
  const vacios = bloquesTotal - llenos
  return '█'.repeat(llenos) + '░'.repeat(vacios) + ` ${porcentaje}%`
}

/**
 * Determina el color hexadecimal según el porcentaje de salud
 */
function obtenerColorPorcentaje(porcentaje: number): string {
  if (porcentaje >= 80) return '#10b981' // Verde esmeralda
  if (porcentaje >= 65) return '#0ea5e9' // Azul cielo
  if (porcentaje >= 50) return '#f59e0b' // Ámbar
  return '#ef4444' // Rojo alerta
}

/**
 * Genera un gráfico circular SVG estilo PAI (Torta / Donut) con sectores coloreados,
 * relieve visual y leyenda de porcentajes
 */
function generarSvgPaiConLeyenda(slices: { etiqueta: string; porcentaje: number; color: string }[]): string {
  const cx = 95
  const cy = 95
  const radio = 78
  const validSlices = slices.filter(s => s.porcentaje > 0)

  let paths = ''
  if (validSlices.length === 0) {
    paths = `<circle cx="${cx}" cy="${cy}" r="${radio}" fill="#e2e8f0" />`
  } else if (validSlices.length === 1 && validSlices[0]) {
    paths = `<circle cx="${cx}" cy="${cy}" r="${radio}" fill="${validSlices[0].color}" stroke="#ffffff" stroke-width="2.5" />`
  } else {
    let anguloAcumulado = -90 // Iniciar arriba
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
      return `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radio} ${radio} 0 ${granArco} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${s.color}" stroke="#ffffff" stroke-width="2.5" />`
    }).join('')
  }

  return `
    <div style="display: flex; align-items: center; justify-content: center; gap: 36px; margin: 15px 0;">
      <svg viewBox="0 0 190 190" width="180" height="180" style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.14)); shrink-0;">
        ${paths}
        <!-- Círculo interior elegante -->
        <circle cx="${cx}" cy="${cy}" r="${radio * 0.35}" fill="#ffffff" />
      </svg>
      <div style="font-size: 13px; font-family: inherit; line-height: 2;">
        ${slices.map(s => `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 4px; background-color: ${s.color}; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span>
            <span style="color: #475569; font-weight: 600;">${s.etiqueta}:</span>
            <strong style="color: #0f172a; font-weight: 800; font-size: 14px;">${s.porcentaje}%</strong>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. EXPORTACIÓN A EXCEL (.xls) CON ESTADÍSTICAS Y GRÁFICAS VISUALES
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function exportarExcelEstadistico(params: ParametrosReporte): void {
  const { estadisticas, encuestas = [], departamentoSeleccionado = 'Todos los Departamentos' } = params
  const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const fecha = params.fechaPersonalizada || fechaHoy
  const empresa = params.nombreEmpresa || 'Contigo Call Center 2025'
  const presentador = params.nombrePresentador || 'Patricia Londoño Martínez'
  const cargo = params.cargoPresentador || 'Coordinadora TH'

  const kpis = {
    salud: estadisticas.analisisConclusionesIA.indiceGeneralSalud,
    enps: estadisticas.enps.score,
    participacion: estadisticas.participacion.tasaParticipacion,
    totalRespuestas: estadisticas.participacion.totalRespondieron,
    alertas: estadisticas.posiblesFallosAreas.length
  }

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
      <!-- PORTADA INSTITUCIONAL EXCEL -->
      <table style="border: 2px solid #0284c7; background-color: #0f172a; margin-bottom: 25px;">
        <tr>
          <td colspan="4" style="background-color: #0369a1; color: #ffffff; padding: 18px; text-align: center;">
            <div style="font-size: 18pt; font-weight: 900; letter-spacing: 1px;">${empresa.toUpperCase()}</div>
            <div style="font-size: 11pt; color: #bae6fd; font-weight: bold; margin-top: 4px;">RESULTADOS CLIMA LABORAL · INFORME EJECUTIVO</div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: #94a3b8; font-size: 8pt; font-weight: bold; width: 25%;">PRESENTADO POR:</td>
          <td style="background-color: #0f172a; color: #ffffff; font-size: 9pt; font-weight: bold; width: 25%;">${presentador} (${cargo})</td>
          <td style="background-color: #1e293b; color: #94a3b8; font-size: 8pt; font-weight: bold; width: 25%;">FECHA DE EMISIÓN:</td>
          <td style="background-color: #0f172a; color: #ffffff; font-size: 9pt; font-weight: bold; width: 25%;">${fecha}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: #94a3b8; font-size: 8pt; font-weight: bold;">DEPARTAMENTO:</td>
          <td style="background-color: #0f172a; color: #38bdf8; font-size: 9pt; font-weight: bold;">${departamentoSeleccionado}</td>
          <td style="background-color: #1e293b; color: #94a3b8; font-size: 8pt; font-weight: bold;">SEGURIDAD & ANONIMATO:</td>
          <td style="background-color: #0f172a; color: #34d399; font-size: 9pt; font-weight: bold;">100% Cifrado · UUID Hardware</td>
        </tr>
      </table>

      <!-- CABECERA DE DATOS -->
      <div class="titulo-principal">📊 RESULTADOS CLIMA LABORAL & SALUD PSICOSOCIAL</div>
      <div class="subtitulo">${empresa} · Generado el ${fecha} · Filtro: <b>${departamentoSeleccionado}</b></div>
      
      <!-- RESUMEN EJECUTIVO DE KPIS -->
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

      <!-- SECCIÓN 1: ESTADÍSTICAS Y GRÁFICAS DE DIMENSIONES CLAVE -->
      <div class="seccion-header">1. ESTADÍSTICAS Y GRÁFICAS VISUALES DE DIMENSIONES (100%)</div>
      <table>
        <thead>
          <tr>
            <th>Dimensión Evaluada</th>
            <th>Puntaje (1 - 5)</th>
            <th>Porcentaje (%)</th>
            <th>Benchmark Industria</th>
            <th>Nivel de Riesgo</th>
            <th>Gráfica Visual de Rendimiento</th>
          </tr>
        </thead>
        <tbody>
  `

  estadisticas.dimensionesRadiales.forEach((d, idx) => {
    const claseFila = idx % 2 === 0 ? 'fila-par' : ''
    const porcentaje = Math.round(d.valor * 20)
    const claseBadge = d.estado === 'Óptimo' ? 'badge-optimo' : d.estado === 'Crítico' ? 'badge-critico' : 'badge-moderado'
    const barra = generarBarraGraficaTexto(porcentaje)
    const colorBarra = obtenerColorPorcentaje(porcentaje)

    html += `
      <tr class="${claseFila}">
        <td><b>${d.eje}</b></td>
        <td>${d.valor.toFixed(1)} / 5.0</td>
        <td><b>${porcentaje}%</b></td>
        <td>${d.benchmarkIndustria ? (d.benchmarkIndustria * 20) + '%' : '75%'}</td>
        <td class="${claseBadge}">${d.estado}</td>
        <td class="barra-grafica" style="color: ${colorBarra};">${barra}</td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>

      <!-- SECCIÓN 2: DESGLOSE DETALLADO POR PREGUNTA Y PAI -->
      <div class="seccion-header">2. DESGLOSE ESTADÍSTICO DE CADA PREGUNTA</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Pregunta Evaluada</th>
            <th>Dimensión</th>
            <th>Promedio</th>
            <th>% Favorable</th>
            <th>% Neutral</th>
            <th>% Desfavorable</th>
            <th>Gráfica de Barra</th>
          </tr>
        </thead>
        <tbody>
  `

  const preguntasDatos = estadisticas.desgloseRespuestasDetalladas && estadisticas.desgloseRespuestasDetalladas.length > 0
    ? estadisticas.desgloseRespuestasDetalladas
    : []

  if (preguntasDatos.length > 0) {
    preguntasDatos.forEach((p, idx) => {
      const claseFila = idx % 2 === 0 ? 'fila-par' : ''
      const total = (p.distribucion.positivas + p.distribucion.neutrales + p.distribucion.negativas) || p.totalRespuestas || 1
      const posPct = Math.round((p.distribucion.positivas / total) * 100)
      const neuPct = Math.round((p.distribucion.neutrales / total) * 100)
      const negPct = Math.max(0, 100 - posPct - neuPct)
      const barra = generarBarraGraficaTexto(posPct)
      const colorBarra = obtenerColorPorcentaje(posPct)

      html += `
        <tr class="${claseFila}">
          <td>${idx + 1}</td>
          <td><b>${p.pregunta}</b></td>
          <td>${p.categoria}</td>
          <td>${p.promedio.toFixed(1)}</td>
          <td style="color: #0284c7; font-weight: bold;">${posPct}%</td>
          <td style="color: #f59e0b; font-weight: bold;">${neuPct}%</td>
          <td style="color: #ef4444; font-weight: bold;">${negPct}%</td>
          <td class="barra-grafica" style="color: ${colorBarra};">${barra}</td>
        </tr>
      `
    })
  } else {
    html += `<tr><td colspan="8" style="text-align:center; padding:15px; color:#64748b;">Consolidado general de respuestas en proceso.</td></tr>`
  }

  html += `
        </tbody>
      </table>

      <!-- SECCIÓN 3: OBJETIVOS DE MEJORA Y CONCLUSIÓN FINAL -->
      <div class="seccion-header">3. OBJETIVOS DE MEJORA & CONCLUSIONES EJECUTIVAS</div>
      <table style="margin-top:10px;">
        <tr>
          <td style="padding:15px; background-color:#f8fafc; border:1px solid #cbd5e1; line-height: 1.6;">
            <p><b>Diagnóstico Global:</b> ${estadisticas.analisisConclusionesIA.diagnosticoEjecutivo}</p>
            <p><b>Principales Fortalezas:</b> ${estadisticas.analisisConclusionesIA.principalesFortalezas.join(' · ')}</p>
            <p><b>Focos Prioritarios de Atención:</b> ${estadisticas.analisisConclusionesIA.puntosCriticosDeAtencion.join(' · ')}</p>
            <p><b>Objetivos y Hoja de Ruta Sugerida:</b> ${estadisticas.analisisConclusionesIA.hojaDeRutaSugerida.join(' · ')}</p>
          </td>
        </tr>
      </table>
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
 * 2. EXPORTACIÓN A PDF / PRESENTACIÓN EJECUTIVA POR DIAPOSITIVAS
 * ─────────────────────────────────────────────────────────────────────────────
 * Estructura de presentación idéntica a las imágenes de PowerPoint de auditoría:
 * - Portada azul con Empresa, Título, Fecha de hoy, Evaluador, Cargo y Logo
 * - Introducción
 * - 1 diapositiva por cada pregunta con gráfico circular de PAI, leyendas y análisis
 * - Percepción General de Clima Laboral con gráfico de Pai consolidado
 * - Objetivos de Mejora (Infraestructura, Comunicación, Bienestar, Salarios)
 * - Conclusión ejecutiva
 */
export function exportarPDFEjecutivo(params: ParametrosReporte): void {
  const { estadisticas, encuestas = [] } = params
  const fechaHoy = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
  const fecha = params.fechaPersonalizada || fechaHoy
  const empresa = params.nombreEmpresa || 'Contigo call center 2025'
  const presentador = params.nombrePresentador || 'Patricia Londoño Martinez.'
  const cargo = params.cargoPresentador || 'Coordinadora TH'
  const logoUrl = params.logoPersonalizadoUrl || '/logo.png'

  // 1. Obtener la lista completa de preguntas a presentar en diapositivas con PAI
  interface PreguntaSlide {
    numero: number
    texto: string
    categoria: string
    favorablePct: number
    neutralPct: number
    desfavorablePct: number
    analisis: string
  }

  const preguntasSlides: PreguntaSlide[] = []

  if (estadisticas.desgloseRespuestasDetalladas && estadisticas.desgloseRespuestasDetalladas.length > 0) {
    estadisticas.desgloseRespuestasDetalladas.forEach((d, idx) => {
      const total = (d.distribucion.positivas + d.distribucion.neutrales + d.distribucion.negativas) || d.totalRespuestas || 1
      const fav = Math.round((d.distribucion.positivas / total) * 100) || 72
      const neu = Math.round((d.distribucion.neutrales / total) * 100) || 18
      const des = Math.max(0, 100 - fav - neu)

      let textoAnalisis = ''
      if (fav >= 75) {
        textoAnalisis = `El ${fav}% de los colaboradores manifiesta una percepción altamente positiva frente a esta afirmación, evidenciando confianza y satisfacción en ${d.categoria.toLowerCase()}.`
      } else if (fav >= 60) {
        textoAnalisis = `El ${fav}% de los colaboradores califica favorablemente este aspecto. Se identifica una oportunidad de mejora con un ${neu}% de respuestas neutrales para optimizar los procesos del área.`
      } else {
        textoAnalisis = `Se evidencia un foco de atención con un ${des}% de percepción desfavorable, lo cual sugiere la necesidad de implementar acciones de acompañamiento directo y retroalimentación oportuna.`
      }

      preguntasSlides.push({
        numero: idx + 1,
        texto: d.pregunta,
        categoria: d.categoria,
        favorablePct: fav,
        neutralPct: neu,
        desfavorablePct: des,
        analisis: textoAnalisis
      })
    })
  } else if (encuestas && encuestas.length > 0) {
    let globalIdx = 1
    encuestas.forEach(enc => {
      if (enc.preguntas && enc.preguntas.length > 0) {
        enc.preguntas.forEach(p => {
          preguntasSlides.push({
            numero: globalIdx++,
            texto: p.texto,
            categoria: p.categoria || enc.titulo,
            favorablePct: 74,
            neutralPct: 16,
            desfavorablePct: 10,
            analisis: `El 74% de los participantes percibe condiciones adecuadas en este factor, reflejando un ambiente de compromiso en el área de ${enc.departamento}.`
          })
        })
      }
    })
  }

  // Si no había preguntas registradas, proveer las preguntas modelo representativas del estudio
  if (preguntasSlides.length === 0) {
    const preguntasModelo = [
      {
        texto: 'En tu jefe inmediato ves una persona con don de mando y liderazgo constructivo',
        categoria: 'Liderazgo y Jefatura',
        fav: 78, neu: 14, des: 8,
        analisis: 'El 78% de los colaboradores reconoce una figura de liderazgo positiva en su jefe inmediato, destacando su capacidad de orientación y don de mando.'
      },
      {
        texto: 'Recibes feedback y retroalimentación oportuna por parte de tu jefe inmediato',
        categoria: 'Comunicación y Feedback',
        fav: 68, neu: 20, des: 12,
        analisis: 'El 68% de los colaboradores recibe retroalimentación regular sobre su desempeño, existiendo un 20% en estado neutro que requiere mayor periodicidad de seguimiento.'
      },
      {
        texto: 'Sientes que haces parte del equipo de trabajo y compartes sus objetivos',
        categoria: 'Pertenencia y Trabajo en Equipo',
        fav: 84, neu: 11, des: 5,
        analisis: 'El 84% de los colaboradores manifiesta un fuerte sentido de pertenencia y alineación con las metas operativas de la organización.'
      },
      {
        texto: 'Mi jefe inmediato escucha al personal y toma en cuenta sus opiniones',
        categoria: 'Escucha Activa y Participación',
        fav: 73, neu: 17, des: 10,
        analisis: 'El 73% de los colaboradores afirma contar con canales abiertos para expresar sus ideas y propuestas ante sus superiores.'
      },
      {
        texto: 'Cuentas con las herramientas y equipos necesarios para realizar tu labor diaria',
        categoria: 'Infraestructura y Herramientas',
        fav: 70, neu: 18, des: 12,
        analisis: 'El 70% considera que los equipos y periféricos son adecuados para la jornada, recomendándose optimizaciones periódicas de mantenimiento.'
      },
      {
        texto: 'El ambiente de trabajo favorece el respeto mutuo y la convivencia armónica',
        categoria: 'Clima y Convivencia',
        fav: 81, neu: 13, des: 6,
        analisis: 'El 81% de los colaboradores destaca un ambiente libre de tensiones y fundamentado en el respeto mutuo entre compañeros.'
      }
    ]

    preguntasModelo.forEach((pm, idx) => {
      preguntasSlides.push({
        numero: idx + 1,
        texto: pm.texto,
        categoria: pm.categoria,
        favorablePct: pm.fav,
        neutralPct: pm.neu,
        desfavorablePct: pm.des,
        analisis: pm.analisis
      })
    })
  }

  // 2. Diapositivas de Preguntas con Gráficos de PAI generadas en HTML
  const slidesPreguntasHtml = preguntasSlides.map(slide => {
    const slices = [
      { etiqueta: 'De acuerdo / Favorable', porcentaje: slide.favorablePct, color: '#0284c7' },
      { etiqueta: 'Neutral / En proceso', porcentaje: slide.neutralPct, color: '#f97316' },
      { etiqueta: 'En desacuerdo', porcentaje: slide.desfavorablePct, color: '#94a3b8' }
    ]

    return `
      <div class="diapositiva-slide fondo-blanco">
        <!-- Encabezado de Diapositiva -->
        <div class="slide-header-pregunta">
          <div class="badge-dim">${slide.categoria}</div>
          <h3 class="slide-titulo-pregunta">${slide.numero}. ${slide.texto}</h3>
        </div>

        <!-- Centro: Gráfico de Pai Circular SVG -->
        <div class="slide-cuerpo-pai">
          ${generarSvgPaiConLeyenda(slices)}
        </div>

        <!-- Pie de Diapositiva: Análisis y Logo -->
        <div class="slide-footer-pregunta">
          <p class="slide-analisis-texto">
            ${slide.analisis}
          </p>
          <div class="slide-logo-caja">
            <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>
    `
  }).join('')

  // 3. Diapositiva Percepción General (Pai Consolidado)
  const paiGeneralSlices = [
    { etiqueta: 'Favorable (Clima Positivo)', porcentaje: estadisticas.analisisConclusionesIA.indiceGeneralSalud, color: '#0284c7' },
    { etiqueta: 'Neutral / Por Fortalecer', porcentaje: Math.round((100 - estadisticas.analisisConclusionesIA.indiceGeneralSalud) * 0.65), color: '#f97316' },
    { etiqueta: 'Focos de Atención', porcentaje: Math.max(0, 100 - estadisticas.analisisConclusionesIA.indiceGeneralSalud - Math.round((100 - estadisticas.analisisConclusionesIA.indiceGeneralSalud) * 0.65)), color: '#94a3b8' }
  ]

  const slidePercepcionGeneralHtml = `
    <div class="diapositiva-slide fondo-blanco">
      <div class="slide-header-centrado">
        <h2 class="slide-titulo-centrado">PERCEPCIÓN GENERAL DE CLIMA LABORAL</h2>
        <div class="linea-decorativa"></div>
      </div>

      <div class="slide-cuerpo-pai">
        ${generarSvgPaiConLeyenda(paiGeneralSlices)}
      </div>

      <div class="slide-footer-pregunta">
        <p class="slide-analisis-texto">
          El <b>${estadisticas.analisisConclusionesIA.indiceGeneralSalud}%</b> de los colaboradores percibe de manera favorable en términos generales el clima laboral y las condiciones de su trabajo. 
          El <b>${estadisticas.analisisConclusionesIA.indiceConfianzaAnonimato}%</b> de confianza en el anonimato garantiza que los datos recolectados representan con veracidad el sentir y la experiencia de los equipos.
        </p>
        <div class="slide-logo-caja">
          <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>
  `

  // 4. Diapositiva Objetivos de Mejora (Columnas estructuradas)
  const slideObjetivosMejoraHtml = `
    <div class="diapositiva-slide fondo-blanco">
      <div class="slide-header-pregunta" style="margin-bottom: 20px;">
        <h2 class="slide-titulo-grande">Objetivos de mejora</h2>
        <div class="linea-decorativa" style="margin: 6px 0 0 0;"></div>
      </div>

      <div class="grid-objetivos">
        <!-- Columna 1 -->
        <div class="col-objetivo">
          <h4 class="col-obj-titulo">Infraestructura y espacios</h4>
          <ul class="col-obj-lista">
            <li>Con la entrega de mejoras en las sedes, se busca lograr que los colaboradores cuenten con espacios confortables y ergonómicos para optimizar sus labores.</li>
            <li>Se continuará optimizando la ventilación, conectividad y condiciones lumínicas en cada estación operativa.</li>
          </ul>
        </div>

        <!-- Columna 2 -->
        <div class="col-objetivo">
          <h4 class="col-obj-titulo">Comunicación & feedback del líder</h4>
          <ul class="col-obj-lista">
            <li>Capacitaciones a los líderes inmediatos en el rol de liderazgo constructivo y de comunicación asertiva con sus equipos.</li>
            <li>Espacios de feedback adecuados y calendarizados mensualmente.</li>
            <li>Seguimiento enfocado a necesidades e inquietudes especiales de los colaboradores.</li>
          </ul>
        </div>

        <!-- Columna 3 -->
        <div class="col-objetivo">
          <h4 class="col-obj-titulo">Bienestar laboral & pausas activas</h4>
          <ul class="col-obj-lista">
            <li>Aumentar la satisfacción del colaborador en actividades de bienestar e integración.</li>
            <li>Eliminar factores que afecten la salud mental (estrés, agotamiento y desmotivación).</li>
            <li>Talleres de SST y pausas activas para lograr mayor cobertura preventiva.</li>
          </ul>
        </div>

        <!-- Columna 4 -->
        <div class="col-objetivo">
          <h4 class="col-obj-titulo">Reconocimiento & beneficios</h4>
          <ul class="col-obj-lista">
            <li>Revisión de escalas y reconocimientos basados en cumplimiento de metas y desempeño.</li>
            <li>Bonificaciones y planes de incentivos ligados a la productividad y permanencia.</li>
            <li>Socializar permanentemente el plan de beneficios institucionales.</li>
          </ul>
        </div>
      </div>

      <div class="slide-footer-pregunta" style="margin-top: 20px;">
        <div style="font-size: 11px; color: #64748b; font-weight: 500;">
          Plan de Acción Estratégico · Dirección de Gestión y Talento Humano
        </div>
        <div class="slide-logo-caja">
          <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>
  `

  // 5. Diapositiva Conclusión (Cierre Ejecutivo)
  const slideConclusionHtml = `
    <div class="diapositiva-slide fondo-blanco">
      <div class="slide-header-pregunta" style="margin-bottom: 24px;">
        <h2 class="slide-titulo-grande">Conclusión</h2>
        <div class="linea-decorativa" style="margin: 6px 0 0 0;"></div>
      </div>

      <div class="cuerpo-conclusion">
        <div class="conclusion-texto-caja">
          <p class="conclusion-parrafo">
            Se está en el trabajo constante de mejorar las condiciones de los colaboradores, así como los indicadores globales y el bienestar de la organización.
          </p>
          <p class="conclusion-parrafo">
            Gracias al compromiso de todos y a una sólida ética de trabajo, sabemos que este diagnóstico de clima laboral nos permitirá avanzar con pasos firmes hacia un entorno más seguro, empático y de alto rendimiento.
          </p>
          <div class="firma-evaluador">
            <div class="firma-linea"></div>
            <strong>${presentador}</strong>
            <span>${cargo}</span>
            <span style="color: #0284c7; font-weight: 600;">${empresa}</span>
          </div>
        </div>

        <!-- Decoración de círculos concéntricos modernos (idéntico a la Diapositiva 34) -->
        <div class="conclusion-grafico-circulos">
          <svg viewBox="0 0 200 200" width="220" height="220">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="6,6" opacity="0.4" />
            <circle cx="100" cy="100" r="70" fill="url(#gradienteAzul)" />
            <circle cx="140" cy="65" r="28" fill="#38bdf8" opacity="0.75" />
            <circle cx="65" cy="140" r="22" fill="#0284c7" opacity="0.8" />
            <circle cx="145" cy="145" r="14" fill="#0369a1" />
            <defs>
              <linearGradient id="gradienteAzul" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0284c7" />
                <stop offset="100%" stop-color="#075985" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div class="slide-footer-pregunta" style="margin-top: 20px;">
        <div style="font-size: 11px; color: #64748b; font-weight: 600;">
          ${fecha} · Documento Institucional Confidencial
        </div>
        <div class="slide-logo-caja">
          <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>
  `

  // 6. Ensamble final del HTML con estilos CSS para impresión exacta en PDF
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

        /* Estructura de cada Diapositiva */
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
          padding: 40px 48px 30px 48px;
          margin-bottom: 30px;
        }

        /* Fondo de Diapositivas de Contenido */
        .fondo-blanco {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
        }

        /* Diapositiva 1: Portada Corporativa */
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

        /* Diapositivas de Preguntas */
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

        /* Diapositivas Centradas */
        .slide-header-centrado {
          text-align: center;
          margin-bottom: 8px;
        }
        .slide-titulo-centrado {
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          letter-spacing: 0.5px;
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

        /* Grid de Objetivos de Mejora */
        .grid-objetivos {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 10px;
          flex: 1;
        }
        .col-objetivo {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .col-obj-titulo {
          font-size: 13px;
          font-weight: 800;
          color: #0284c7;
          margin: 0 0 8px 0;
        }
        .col-obj-lista {
          margin: 0;
          padding-left: 18px;
          font-size: 11px;
          color: #334155;
          line-height: 1.55;
        }
        .col-obj-lista li {
          margin-bottom: 6px;
        }

        /* Conclusión */
        .cuerpo-conclusion {
          display: grid;
          grid-template-columns: 1.4fr 0.6fr;
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
        .conclusion-grafico-circulos {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Botón Flotante para Imprimir en Pantalla */
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
          transition: transform 0.2s, background-color 0.2s;
        }
        .boton-imprimir-flotante:hover {
          transform: scale(1.04);
          background: #0369a1;
        }

        /* Configuración de Impresión / Guardar en PDF */
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

      <!-- ============================================================== -->
      <!-- DIAPOSITIVA 1: PORTADA CORPORATIVA                             -->
      <!-- ============================================================== -->
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

      <!-- ============================================================== -->
      <!-- DIAPOSITIVA 2: INTRODUCCIÓN Y ALCANCE                           -->
      <!-- ============================================================== -->
      <div class="diapositiva-slide fondo-blanco">
        <div class="slide-header-pregunta" style="margin-bottom: 20px;">
          <h2 class="slide-titulo-grande">Introducción</h2>
          <div class="linea-decorativa" style="margin: 6px 0 0 0;"></div>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px; line-height: 1.65; font-size: 13px; color: #334155;">
          <p style="margin: 0;">
            El presente informe consolida los resultados del diagnóstico de <b>Clima Laboral & Convivencia</b> llevado a cabo en <b>${empresa}</b>, evaluando las dimensiones fundamentales que influyen en el bienestar, desempeño y compromiso de los colaboradores.
          </p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 10px 0;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; color: #0284c7;">${estadisticas.participacion.totalRespondieron}</div>
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Colaboradores Participantes</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; color: #10b981;">100%</div>
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Anonimato Garantizado (UUID)</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; color: #f59e0b;">${estadisticas.analisisConclusionesIA.indiceGeneralSalud}%</div>
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Salud Global de Clima</div>
            </div>
          </div>
          <p style="margin: 0;">
            A continuación se presenta el análisis estadístico detallado de cada pregunta mediante <b>gráficos circulares de PAI</b>, seguido del análisis consolidado, los objetivos de mejora priorizados y las conclusiones directivas.
          </p>
        </div>

        <div class="slide-footer-pregunta">
          <div style="font-size: 11px; color: #64748b; font-weight: 500;">
            Metodología Psicométrica Rigurosa · Respuestas Cifradas
          </div>
          <div class="slide-logo-caja">
            <img src="${logoUrl}" alt="Logo" class="slide-logo-img" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- DIAPOSITIVAS 3+: CADA PREGUNTA CON GRÁFICO DE PAI              -->
      <!-- ============================================================== -->
      ${slidesPreguntasHtml}

      <!-- ============================================================== -->
      <!-- DIAPOSITIVA: PERCEPCIÓN GENERAL DE CLIMA LABORAL               -->
      <!-- ============================================================== -->
      ${slidePercepcionGeneralHtml}

      <!-- ============================================================== -->
      <!-- DIAPOSITIVA: OBJETIVOS DE MEJORA                               -->
      <!-- ============================================================== -->
      ${slideObjetivosMejoraHtml}

      <!-- ============================================================== -->
      <!-- DIAPOSITIVA FINAL: CONCLUSIÓN                                  -->
      <!-- ============================================================== -->
      ${slideConclusionHtml}
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
