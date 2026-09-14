/**
 * ============================================================================
 * ALMACÉN DE GRÁFICOS ANCLADOS & ANÁLISIS EN TIEMPO REAL (useGraficosAnclados.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Permite a los administradores y analistas anclar cualquier pregunta de una encuesta
 * a un gráfico específico del Dashboard para eliminar la carga operativa manual.
 * 
 * Modos de análisis soportados:
 * 1. `sentimiento_ia`: Encasilla respuestas abiertas o cerradas en Buena (verde), Mala (rojo) y Neutra (amarillo).
 * 2. `distribucion_opciones`: Frecuencias y porcentajes de cada alternativa de respuesta.
 * 3. `promedio_satisfaccion`: Puntuación media sobre 5.0 y escala de cumplimiento.
 * 4. `alertas`: Tasa de respuestas que dispararon alertas psicosociales o de acoso.
 * 
 * Tipos de gráficos soportados:
 * - `dona`: Gráfico circular/dona con segmentos SVG dinámicos y hover.
 * - `barras`: Barras horizontales proporcionales con badges y porcentajes.
 * - `gauge`: Medidor semafórico de aguja / arco.
 * - `metrica`: Tarjeta ejecutiva con valor clave e indicador de tendencia.
 */

import { ref, computed } from 'vue'
import { clasificarRespuestaAbiertaConIA, type PreguntaEncuesta } from '@/Servicios/iaEncuestasService'

export type CategoriaInfografiaGrafico =
  | 'Desviación'
  | 'Correlación'
  | 'Clasificación'
  | 'Distribución'
  | 'Cambios en el tiempo'
  | 'Magnitud'
  | 'Parte de un todo'
  | 'Espacial'
  | 'Métricas Ejecutivas'

export type TipoAnalisis = 'sentimiento_ia' | 'distribucion_opciones' | 'promedio_satisfaccion' | 'alertas'
export type TipoGrafico =
  | 'dona'
  | 'barras'
  | 'gauge'
  | 'metrica'
  | 'barra_divergente'
  | 'tabla_columna'
  | 'dispersion'
  | 'linea_tiempo'
  | 'tira_puntos'
  | 'histograma'
  | 'boxplot'
  | 'linea'
  | 'mapa_calor'
  | 'columnas'
  | 'marimekko'
  | 'venn'
  | 'mapa_coropletico'
  | 'mapa_flujo'

export interface InfoTipoGrafico {
  id: TipoGrafico
  titulo: string
  categoria: CategoriaInfografiaGrafico
  descripcion: string
  iconoNombre: string
}

export const LISTA_TIPOS_GRAFICOS_INFOGRAFIA: InfoTipoGrafico[] = [
  // 1. Desviación
  { id: 'barra_divergente', titulo: 'Barra Divergente', categoria: 'Desviación', descripcion: 'Compara desviaciones positivas y negativas respecto a un centro neutro.', iconoNombre: 'BarChart2' },
  { id: 'tabla_columna', titulo: 'Tabla de Columna', categoria: 'Desviación', descripcion: 'Muestra desviaciones ordenadas por departamento o variable.', iconoNombre: 'Table' },
  // 2. Correlación
  { id: 'dispersion', titulo: 'Gráfico de Dispersión (Scatter)', categoria: 'Correlación', descripcion: 'Relación entre dos variables (ej. Antigüedad vs Satisfacción).', iconoNombre: 'Scatter' },
  { id: 'linea_tiempo', titulo: 'Línea de Tiempo (Columnas + Línea)', categoria: 'Correlación', descripcion: 'Superpone tendencia lineal sobre barras de frecuencia.', iconoNombre: 'TrendingUp' },
  // 3. Clasificación
  { id: 'barras', titulo: 'Gráfico de Barras Horizontales', categoria: 'Clasificación', descripcion: 'Ranking y comparación de alternativas ordenadas.', iconoNombre: 'BarChart3' },
  { id: 'tira_puntos', titulo: 'Diagrama de Tira de Puntos', categoria: 'Clasificación', descripcion: 'Muestra distribución individual de respuestas por punto.', iconoNombre: 'CircleDot' },
  // 4. Distribución
  { id: 'histograma', titulo: 'Histograma de Frecuencia', categoria: 'Distribución', descripcion: 'Agrupa respuestas continuas en rangos o intervalos.', iconoNombre: 'BarChart' },
  { id: 'boxplot', titulo: 'Gráfico de Velas / Cajas (Boxplot)', categoria: 'Distribución', descripcion: 'Mediana, cuartiles y valores atípicos en la muestra.', iconoNombre: 'Box' },
  // 5. Cambios en el tiempo
  { id: 'linea', titulo: 'Gráfico de Línea Temporal', categoria: 'Cambios en el tiempo', descripcion: 'Evolución cronológica de puntajes o respuestas.', iconoNombre: 'LineChart' },
  { id: 'mapa_calor', titulo: 'Mapa de Calor Calendario', categoria: 'Cambios en el tiempo', descripcion: 'Intensidad de respuestas según días o turnos.', iconoNombre: 'Grid' },
  // 6. Magnitud
  { id: 'columnas', titulo: 'Columnas Verticales', categoria: 'Magnitud', descripcion: 'Comparación directa de magnitudes numéricas.', iconoNombre: 'Columns' },
  { id: 'marimekko', titulo: 'Gráfico de Marimekko', categoria: 'Magnitud', descripcion: 'Ancho y alto proporcional para dos dimensiones.', iconoNombre: 'LayoutGrid' },
  // 7. Parte de un todo
  { id: 'dona', titulo: 'Gráfico de Dona / Circular', categoria: 'Parte de un todo', descripcion: 'Proporciones relativas sobre el 100% total.', iconoNombre: 'PieChart' },
  { id: 'venn', titulo: 'Diagrama de Venn / Solapamiento', categoria: 'Parte de un todo', descripcion: 'Intersección y coincidencias entre categorías.', iconoNombre: 'Layers' },
  // 8. Espacial
  { id: 'mapa_coropletico', titulo: 'Mapa Coroplético (Zonas / Sedes)', categoria: 'Espacial', descripcion: 'Mapas de calor por ubicación geográfica o sede.', iconoNombre: 'MapPin' },
  { id: 'mapa_flujo', titulo: 'Mapa de Flujo / Movilidad', categoria: 'Espacial', descripcion: 'Rutas o desplazamientos interdepartamentales.', iconoNombre: 'Navigation' },
  // Métricas Ejecutivas Extra
  { id: 'gauge', titulo: 'Medidor Semafórico (Gauge)', categoria: 'Métricas Ejecutivas', descripcion: 'Promedio global sobre 5.0 con semáforo de aguja.', iconoNombre: 'Gauge' },
  { id: 'metrica', titulo: 'Tarjeta de Métrica KPI', categoria: 'Métricas Ejecutivas', descripcion: 'Métrica ejecutiva destacada con indicador porcentual.', iconoNombre: 'Sliders' }
]

export interface GraficoAnclado {
  id: string
  idEncuesta?: string
  titulo: string
  idPregunta: string
  textoPregunta: string
  tipoAnalisis: TipoAnalisis
  tipoGrafico: TipoGrafico
  descripcion?: string
  colorTema?: string
  fechaCreacion: string
}

export interface DatoSegmentoGrafico {
  etiqueta: string
  valor: number
  porcentaje: number
  color: string
  subtexto?: string
}

export interface ResultadoCalculoGrafico {
  idGrafico: string
  titulo: string
  tipoAnalisis: TipoAnalisis
  tipoGrafico: TipoGrafico
  totalMuestras: number
  segmentos: DatoSegmentoGrafico[]
  promedioGlobal?: number
  porcentajeSalud?: number
  conclusiones?: string
}

const STORAGE_KEY = 'hablandocontigo_graficos_anclados_v2'

// Sin gráficos predeterminados: Únicamente existirán los gráficos creados por el usuario
const GRAFICOS_PREDETERMINADOS: GraficoAnclado[] = []

function cargarGraficosDesdeStorage(): GraficoAnclado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Excluir cualquier gráfico por defecto legado del almacenamiento local
        return parsed.filter((g: GraficoAnclado) => 
          !g.id.startsWith('graf-anclado-ia-') && 
          !g.id.startsWith('graf-anclado-estres-') && 
          !g.id.startsWith('graf-anclado-liderazgo-')
        )
      }
    }
  } catch {}
  return []
}

const graficosAnclados = ref<GraficoAnclado[]>(cargarGraficosDesdeStorage())

function guardarEnStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graficosAnclados.value))
  } catch {}
}

export function useGraficosAnclados() {
  const totalGraficos = computed(() => graficosAnclados.value.length)

  const anclarNuevoGrafico = (nuevo: Omit<GraficoAnclado, 'id' | 'fechaCreacion'>) => {
    const id = `graf-anclado-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const graficoCreado: GraficoAnclado = {
      ...nuevo,
      id,
      fechaCreacion: new Date().toISOString()
    }
    graficosAnclados.value.unshift(graficoCreado)
    guardarEnStorage()
    return graficoCreado
  }

  const eliminarGraficoAnclado = (id: string) => {
    graficosAnclados.value = graficosAnclados.value.filter(g => g.id !== id)
    guardarEnStorage()
  }

  const restaurarGraficosPredeterminados = () => {
    graficosAnclados.value = [...GRAFICOS_PREDETERMINADOS]
    guardarEnStorage()
  }

  /**
   * Auto-genera 1 gráfico global por encuesta y 1 gráfico representativo por cada uno de los 8 bloques oficiales.
   */
  const generarEnlazarGraficosPredeterminadosIA = (preguntas: PreguntaEncuesta[], idEncuesta?: string): number => {
    if (!preguntas || preguntas.length === 0) return 0

    let contadorNuevos = 0
    const preguntasAncladasExistentes = new Set(graficosAnclados.value.map(g => g.idPregunta))
    const tiposGraficosExistentes = new Set(graficosAnclados.value.map(g => g.tipoGrafico))

    // 1. GRÁFICO GLOBAL POR ENCUESTA (1 por Encuesta)
    const yaExisteGlobal = graficosAnclados.value.some(g => g.idEncuesta === idEncuesta && g.titulo.includes('Índice Global'))
    if (!yaExisteGlobal && preguntas.length > 0) {
      const pregPrimera = preguntas[0]
      if (pregPrimera) {
        anclarNuevoGrafico({
          idEncuesta,
          titulo: `Índice Global de Clima y Salud (Encuesta Completa)`,
          idPregunta: pregPrimera.id,
          textoPregunta: pregPrimera.texto,
          tipoAnalisis: 'promedio_satisfaccion',
          tipoGrafico: !tiposGraficosExistentes.has('gauge') ? 'gauge' : 'dona',
          descripcion: 'Gráfico global predeterminado que resume la puntuación media y salud laboral de toda la encuesta.',
          colorTema: '#0066ff'
        })
        preguntasAncladasExistentes.add(pregPrimera.id)
        tiposGraficosExistentes.add('gauge')
        contadorNuevos++
      }
    }

    // 2. UN GRÁFICO DEDICADO POR CADA UNO DE LOS 8 BLOQUES (1 por Bloque)
    const tiposPorBloque: TipoGrafico[] = ['dona', 'barras', 'gauge', 'metrica', 'barra_divergente', 'histograma', 'boxplot', 'linea']
    const analisisPorBloque: TipoAnalisis[] = [
      'promedio_satisfaccion',
      'distribucion_opciones',
      'promedio_satisfaccion',
      'alertas',
      'distribucion_opciones',
      'distribucion_opciones',
      'sentimiento_ia',
      'sentimiento_ia'
    ]

    for (let numBloque = 1; numBloque <= 8; numBloque++) {
      const prefijo = `Bloque ${numBloque}:`
      const preguntasDelBloque = preguntas.filter(p => p.categoria?.startsWith(prefijo))

      // Si hay preguntas en este bloque y aún no hemos generado un gráfico para este bloque
      const yaExisteGraficoBloque = graficosAnclados.value.some(g => 
        g.idEncuesta === idEncuesta && g.titulo.startsWith(`Bloque ${numBloque}:`)
      )

      if (!yaExisteGraficoBloque && preguntasDelBloque.length > 0) {
        // Seleccionar la pregunta más representativa del bloque
        const pregRepresentativa = preguntasDelBloque.find(p => !preguntasAncladasExistentes.has(p.id)) || preguntasDelBloque[0]
        if (pregRepresentativa) {
          const tipoGraficoSugerido = tiposPorBloque[numBloque - 1] || 'dona'
          const tipoAnalisisSugerido = analisisPorBloque[numBloque - 1] || 'distribucion_opciones'

          // Seleccionar un tipo de gráfico no repetido si es posible
          let tipoGraficoFinal = tipoGraficoSugerido
          if (tiposGraficosExistentes.has(tipoGraficoFinal)) {
            const alternativa = tiposPorBloque.find(t => !tiposGraficosExistentes.has(t))
            if (alternativa) tipoGraficoFinal = alternativa
          }

          const catLimpia = pregRepresentativa.categoria ? pregRepresentativa.categoria.split(':')[1]?.trim() || pregRepresentativa.categoria : `Bloque ${numBloque}`

          anclarNuevoGrafico({
            idEncuesta,
            titulo: `Bloque ${numBloque}: ${catLimpia}`,
            idPregunta: pregRepresentativa.id,
            textoPregunta: pregRepresentativa.texto,
            tipoAnalisis: pregRepresentativa.tipo === 'texto' ? 'sentimiento_ia' : tipoAnalisisSugerido,
            tipoGrafico: tipoGraficoFinal,
            descripcion: `Gráfico predeterminado enlazado para el Bloque ${numBloque}. Puedes editar libremente su tipo de gráfico, colores o cálculo.`,
            colorTema: tipoAnalisisSugerido === 'sentimiento_ia' ? '#0066ff' : tipoAnalisisSugerido === 'alertas' ? '#ff2a2a' : '#00c853'
          })

          preguntasAncladasExistentes.add(pregRepresentativa.id)
          tiposGraficosExistentes.add(tipoGraficoFinal)
          contadorNuevos++
        }
      }
    }

    return contadorNuevos
  }

  /**
   * Auto-crea una estadística/gráfico anclado inmediatamente al crear una nueva pregunta en una encuesta.
   */
  const autoAnclarEstadisticaParaNuevaPregunta = (pregunta: PreguntaEncuesta, idEncuesta?: string): GraficoAnclado | null => {
    if (!pregunta || !pregunta.id) return null

    // Verificar si esta pregunta ya tiene un gráfico anclado registrado
    const yaExiste = graficosAnclados.value.some(g => 
      g.idPregunta === pregunta.id || 
      (g.textoPregunta && pregunta.texto && g.textoPregunta.trim().toLowerCase() === pregunta.texto.trim().toLowerCase())
    )
    if (yaExiste) return null

    // Determinar el tipo de gráfico por defecto respetando unicidad si es posible
    const tiposEnUso = new Set(graficosAnclados.value.map(g => g.tipoGrafico))
    
    let tipoGraficoDefecto: TipoGrafico = 'dona'
    let tipoAnalisisDefecto: TipoAnalisis = 'distribucion_opciones'

    if (pregunta.tipo === 'escala') {
      tipoAnalisisDefecto = 'promedio_satisfaccion'
      tipoGraficoDefecto = !tiposEnUso.has('gauge') ? 'gauge' : (!tiposEnUso.has('dona') ? 'dona' : 'barras')
    } else if (pregunta.tipo === 'texto') {
      tipoAnalisisDefecto = 'sentimiento_ia'
      tipoGraficoDefecto = !tiposEnUso.has('barra_divergente') ? 'barra_divergente' : (!tiposEnUso.has('barras') ? 'barras' : 'metrica')
    } else if (pregunta.esSensibleAcoso) {
      tipoAnalisisDefecto = 'alertas'
      tipoGraficoDefecto = !tiposEnUso.has('metrica') ? 'metrica' : 'barras'
    } else {
      tipoAnalisisDefecto = 'distribucion_opciones'
      tipoGraficoDefecto = !tiposEnUso.has('dona') ? 'dona' : (!tiposEnUso.has('barras') ? 'barras' : 'histograma')
    }

    const tituloGenerado = `Estadística: ${pregunta.texto.substring(0, 45)}${pregunta.texto.length > 45 ? '...' : ''}`

    const nuevoGrafico = anclarNuevoGrafico({
      idEncuesta,
      titulo: tituloGenerado,
      idPregunta: pregunta.id,
      textoPregunta: pregunta.texto,
      tipoAnalisis: tipoAnalisisDefecto,
      tipoGrafico: tipoGraficoDefecto,
      descripcion: `Estadística auto-creada al agregar la pregunta "${pregunta.texto.substring(0, 40)}...". Puedes cambiar el tipo de gráfico, colores o modo de cálculo en cualquier momento.`,
      colorTema: tipoAnalisisDefecto === 'sentimiento_ia' ? '#0066ff' : tipoAnalisisDefecto === 'alertas' ? '#ff2a2a' : '#00c853'
    })

    return nuevoGrafico
  }

  /**
   * Procesa en tiempo real los datos para un gráfico anclado específico
   */
  const calcularDatosGrafico = async (
    grafico: GraficoAnclado,
    respuestasTotales: any[],
    preguntasDisponibles?: PreguntaEncuesta[]
  ): Promise<ResultadoCalculoGrafico> => {
    // 1. Filtrar respuestas que correspondan a la pregunta anclada
    const respuestasDeEstaPregunta: Array<{
      textoRespuesta: string
      valorNumerico?: number
      esAlerta?: boolean
      comentario?: string
    }> = []

    respuestasTotales.forEach(respSesion => {
      const items = respSesion.respuestas || []
      items.forEach((item: any) => {
        const coincideId = item.idPregunta === grafico.idPregunta
        const coincideTexto = item.textoPregunta && grafico.textoPregunta && 
          item.textoPregunta.trim().toLowerCase() === grafico.textoPregunta.trim().toLowerCase()

        if (coincideId || coincideTexto) {
          respuestasDeEstaPregunta.push({
            textoRespuesta: String(item.respuesta || ''),
            valorNumerico: typeof item.valor === 'number' ? item.valor : undefined,
            esAlerta: Boolean(item.esAlerta),
            comentario: item.comentario ? String(item.comentario) : undefined
          })
        }
      })
    })

    const totalMuestras = respuestasDeEstaPregunta.length

    // CASO 1: ANÁLISIS DE SENTIMIENTO IA (BUENA / MALA / NEUTRA)
    if (grafico.tipoAnalisis === 'sentimiento_ia') {
      let buenas = 0
      let malas = 0
      let neutras = 0

      // Si no hay respuestas reales, devolver estructura limpia
      if (totalMuestras === 0) {
        return {
          idGrafico: grafico.id,
          titulo: grafico.titulo,
          tipoAnalisis: grafico.tipoAnalisis,
          tipoGrafico: grafico.tipoGrafico,
          totalMuestras: 0,
          segmentos: [
            { etiqueta: 'Favorable (Buena)', valor: 0, porcentaje: 0, color: '#0066ff', subtexto: '0 respuestas' },
            { etiqueta: 'Neutral / Moderada', valor: 0, porcentaje: 0, color: '#ffcc00', subtexto: '0 respuestas' },
            { etiqueta: 'Alerta / Riesgo (Mala)', valor: 0, porcentaje: 0, color: '#ff2a2a', subtexto: '0 respuestas' }
          ],
          conclusiones: 'A la espera de respuestas para procesar con IA.'
        }
      }

      for (const r of respuestasDeEstaPregunta) {
        const textoAAnalizar = r.comentario 
          ? `${r.textoRespuesta}. Detalle: ${r.comentario}`
          : r.textoRespuesta

        const clasif = await clasificarRespuestaAbiertaConIA(grafico.textoPregunta, textoAAnalizar)
        if (clasif.clasificacion === 'Buena') buenas++
        else if (clasif.clasificacion === 'Mala') malas++
        else neutras++
      }

      const pBuenas = Math.round((buenas / totalMuestras) * 100)
      const pMalas = Math.round((malas / totalMuestras) * 100)
      const pNeutras = Math.max(0, 100 - pBuenas - pMalas)

      const porcentajeSalud = Math.round(((buenas + (neutras * 0.5)) / totalMuestras) * 100)

      return {
        idGrafico: grafico.id,
        titulo: grafico.titulo,
        tipoAnalisis: grafico.tipoAnalisis,
        tipoGrafico: grafico.tipoGrafico,
        totalMuestras,
        porcentajeSalud,
        segmentos: [
          { etiqueta: 'Favorable (Buena)', valor: buenas, porcentaje: pBuenas, color: '#0066ff', subtexto: `${buenas} menciones positivas` },
          { etiqueta: 'Neutral / Moderada', valor: neutras, porcentaje: pNeutras, color: '#ffcc00', subtexto: `${neutras} constructivas` },
          { etiqueta: 'Alerta / Riesgo (Mala)', valor: malas, porcentaje: pMalas, color: '#ff2a2a', subtexto: `${malas} reclamos o riesgos` }
        ],
        conclusiones: pBuenas >= 70 
          ? 'Predominio de comentarios favorables hacia este ítem.'
          : pMalas >= 35 
          ? 'Foco de atención prioritaria detectado por IA.'
          : 'Percepción mixta con oportunidades de ajuste operativo.'
      }
    }

    // CASO 2: DISTRIBUCIÓN DE OPCIONES / FRECUENCIAS
    if (grafico.tipoAnalisis === 'distribucion_opciones') {
      const mapaOpciones: Record<string, number> = {}
      const coloresPaleta = ['#ff2a2a', '#0066ff', '#ffcc00', '#ff7700', '#00c8ff', '#9333ea']

      // Si la pregunta tiene opciones definidas en su metadata
      const preguntaDef = preguntasDisponibles?.find(p => p.id === grafico.idPregunta)
      if (preguntaDef?.opciones) {
        preguntaDef.opciones.forEach(opc => {
          mapaOpciones[opc.texto] = 0
        })
      }

      respuestasDeEstaPregunta.forEach(r => {
        const texto = r.textoRespuesta.trim() || 'Sin respuesta'
        mapaOpciones[texto] = (mapaOpciones[texto] || 0) + 1
      })

      const entradas = Object.entries(mapaOpciones)
      const totalEntradas = entradas.length

      const segmentos: DatoSegmentoGrafico[] = entradas.map(([opcTexto, count], idx) => {
        const porc = totalMuestras > 0 ? Math.round((count / totalMuestras) * 100) : 0
        const txtNorm = opcTexto.toLowerCase()

        let colorFinal = ''
        if (txtNorm.includes('sí') || txtNorm.includes('si') || txtNorm.includes('bueno') || txtNorm.includes('excelente') || txtNorm.includes('favorable')) {
          colorFinal = '#0066ff' // Azul Vivo para Sí / Positivo
        } else if (txtNorm.includes('no') || txtNorm.includes('malo') || txtNorm.includes('desfavorable') || txtNorm.includes('alerta')) {
          colorFinal = '#ff2a2a' // Rojo Vivo para No / Negativo
        } else if (totalEntradas === 2) {
          // Si son 2 opciones de opción múltiple, primera es Rojo y segunda es Azul
          colorFinal = idx === 0 ? '#ff2a2a' : '#0066ff'
        } else {
          colorFinal = coloresPaleta[idx % coloresPaleta.length] || '#0066ff'
        }

        return {
          etiqueta: opcTexto,
          valor: count,
          porcentaje: porc,
          color: colorFinal,
          subtexto: `${count} votos`
        }
      })

      return {
        idGrafico: grafico.id,
        titulo: grafico.titulo,
        tipoAnalisis: grafico.tipoAnalisis,
        tipoGrafico: grafico.tipoGrafico,
        totalMuestras,
        segmentos,
        conclusiones: `Distribución registrada sobre ${totalMuestras} participaciones.`
      }
    }

    // CASO 3: PROMEDIO DE SATISFACCIÓN (1 A 5)
    if (grafico.tipoAnalisis === 'promedio_satisfaccion') {
      let suma = 0
      let validos = 0

      respuestasDeEstaPregunta.forEach(r => {
        if (typeof r.valorNumerico === 'number' && r.valorNumerico > 0) {
          suma += r.valorNumerico
          validos++
        }
      })

      const promedio = validos > 0 ? +(suma / validos).toFixed(2) : 0
      const porcentajeSalud = Math.round((promedio / 5) * 100)

      return {
        idGrafico: grafico.id,
        titulo: grafico.titulo,
        tipoAnalisis: grafico.tipoAnalisis,
        tipoGrafico: grafico.tipoGrafico,
        totalMuestras: validos,
        promedioGlobal: promedio,
        porcentajeSalud,
        segmentos: [
          { etiqueta: 'Puntaje Obtenido', valor: promedio, porcentaje: porcentajeSalud, color: porcentajeSalud >= 75 ? '#0066ff' : porcentajeSalud >= 55 ? '#ffcc00' : '#ff2a2a' }
        ],
        conclusiones: promedio >= 4.0 
          ? 'Rango excelente de satisfacción.' 
          : promedio >= 3.0 
          ? 'Nivel medio aceptable con puntos a optimizar.' 
          : 'Puntuación deficiente en zona de alerta operativa.'
      }
    }

    // CASO 4: TASA DE ALERTAS
    const conAlerta = respuestasDeEstaPregunta.filter(r => r.esAlerta).length
    const sinAlerta = totalMuestras - conAlerta
    const pAlerta = totalMuestras > 0 ? Math.round((conAlerta / totalMuestras) * 100) : 0
    const pSeguro = Math.max(0, 100 - pAlerta)

    return {
      idGrafico: grafico.id,
      titulo: grafico.titulo,
      tipoAnalisis: grafico.tipoAnalisis,
      tipoGrafico: grafico.tipoGrafico,
      totalMuestras,
      porcentajeSalud: pSeguro,
      segmentos: [
        { etiqueta: 'Normal / Sin Riesgo', valor: sinAlerta, porcentaje: pSeguro, color: '#0066ff', subtexto: `${sinAlerta} conformes` },
        { etiqueta: 'Alerta Psicosocial', valor: conAlerta, porcentaje: pAlerta, color: '#ff2a2a', subtexto: `${conAlerta} alertas activadas` }
      ],
      conclusiones: conAlerta > 0 
        ? `${conAlerta} colaborador(es) reportaron situaciones críticas en este aspecto.`
        : 'Cero alertas reportadas para este parámetro.'
    }
  }

  return {
    graficosAnclados,
    totalGraficos,
    anclarNuevoGrafico,
    eliminarGraficoAnclado,
    restaurarGraficosPredeterminados,
    generarEnlazarGraficosPredeterminadosIA,
    autoAnclarEstadisticaParaNuevaPregunta,
    calcularDatosGrafico
  }
}
