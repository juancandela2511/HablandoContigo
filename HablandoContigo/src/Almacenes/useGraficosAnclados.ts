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

export type TipoAnalisis = 'sentimiento_ia' | 'distribucion_opciones' | 'promedio_satisfaccion' | 'alertas'
export type TipoGrafico = 'dona' | 'barras' | 'gauge' | 'metrica'

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

const STORAGE_KEY = 'hablandocontigo_graficos_anclados_v1'

// Gráficos predeterminados de alta utilidad para inicializar si no hay ninguno
const GRAFICOS_PREDETERMINADOS: GraficoAnclado[] = [
  {
    id: 'graf-anclado-ia-1',
    titulo: 'Análisis IA: Sentimiento en Propuestas y Sugerencias',
    idPregunta: 'b8-p41-comentarios-libres',
    textoPregunta: 'Pregunta 41 — Escribe cualquier otro comentario, sugerencia o inquietud adicional...',
    tipoAnalisis: 'sentimiento_ia',
    tipoGrafico: 'dona',
    descripcion: 'Clasificación automática por Inteligencia Artificial de las opiniones libres en Favorable (Buena), Crítica (Mala) o Neutra.',
    colorTema: '#0284c7',
    fechaCreacion: new Date().toISOString()
  },
  {
    id: 'graf-anclado-estres-2',
    titulo: 'Distribución: Nivel de Estrés y Sobrecarga Diaria',
    idPregunta: 'b2-p4-estres',
    textoPregunta: 'Pregunta 4 — ¿Sientes niveles de estrés elevados en tus labores diarias?',
    tipoAnalisis: 'distribucion_opciones',
    tipoGrafico: 'barras',
    descripcion: 'Conteo y porcentaje de colaboradores que manifiestan estrés en la operación diaria.',
    colorTema: '#f59e0b',
    fechaCreacion: new Date().toISOString()
  },
  {
    id: 'graf-anclado-liderazgo-3',
    titulo: 'Índice Promedio: Claridad en Instrucciones del Jefe',
    idPregunta: 'b4-p13-instrucciones-claras',
    textoPregunta: 'Pregunta 13 — ¿Recibes instrucciones claras por parte de tu jefe inmediato?',
    tipoAnalisis: 'promedio_satisfaccion',
    tipoGrafico: 'gauge',
    descripcion: 'Puntuación promedio de evaluación de la jefatura directa sobre 5.0.',
    colorTema: '#10b981',
    fechaCreacion: new Date().toISOString()
  }
]

function cargarGraficosDesdeStorage(): GraficoAnclado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {}
  return [...GRAFICOS_PREDETERMINADOS]
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
            { etiqueta: 'Favorable (Buena)', valor: 0, porcentaje: 0, color: '#10b981', subtexto: '0 respuestas' },
            { etiqueta: 'Neutral / Moderada', valor: 0, porcentaje: 0, color: '#f59e0b', subtexto: '0 respuestas' },
            { etiqueta: 'Alerta / Riesgo (Mala)', valor: 0, porcentaje: 0, color: '#ef4444', subtexto: '0 respuestas' }
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
          { etiqueta: 'Favorable (Buena)', valor: buenas, porcentaje: pBuenas, color: '#10b981', subtexto: `${buenas} menciones positivas` },
          { etiqueta: 'Neutral / Moderada', valor: neutras, porcentaje: pNeutras, color: '#f59e0b', subtexto: `${neutras} constructivas` },
          { etiqueta: 'Alerta / Riesgo (Mala)', valor: malas, porcentaje: pMalas, color: '#ef4444', subtexto: `${malas} reclamos o riesgos` }
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
      const coloresPaleta = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4']

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

      const segmentos: DatoSegmentoGrafico[] = Object.entries(mapaOpciones).map(([opcTexto, count], idx) => {
        const porc = totalMuestras > 0 ? Math.round((count / totalMuestras) * 100) : 0
        return {
          etiqueta: opcTexto,
          valor: count,
          porcentaje: porc,
          color: coloresPaleta[idx % coloresPaleta.length] || '#0284c7',
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
          { etiqueta: 'Puntaje Obtenido', valor: promedio, porcentaje: porcentajeSalud, color: porcentajeSalud >= 80 ? '#10b981' : porcentajeSalud >= 60 ? '#f59e0b' : '#ef4444' }
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
        { etiqueta: 'Normal / Sin Riesgo', valor: sinAlerta, porcentaje: pSeguro, color: '#10b981', subtexto: `${sinAlerta} conformes` },
        { etiqueta: 'Alerta Psicosocial', valor: conAlerta, porcentaje: pAlerta, color: '#ef4444', subtexto: `${conAlerta} alertas activadas` }
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
    calcularDatosGrafico
  }
}
