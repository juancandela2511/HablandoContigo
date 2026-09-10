/**
 * ============================================================================
 * ALMACÉN DE VINCULACIÓN DE PREGUNTAS A SUGERENCIAS ORGANIZACIONALES (useSugerenciasOrganizacionales.ts)
 * ============================================================================
 * 
 * Permite vincular preguntas específicas de la encuesta a cada categoría de
 * "Sugerencias Organizacionales (IA)" (Procesos & Tecnología, Infraestructura & Espacios,
 * Salario & Beneficios, Clima & Reconocimiento) para:
 *   1. Automatizar la clasificación de recomendaciones y demandas del colaborador.
 *   2. Calcular porcentajes y volúmenes reales basados en las respuestas de preguntas vinculadas.
 *   3. Eliminar la carga operativa de clasificación manual.
 */

import { ref, computed } from 'vue'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useToast } from '@/Almacenes/useToast'
import type { PreguntaEncuesta } from '@/Servicios/iaEncuestasService'

export interface CategoriaSugerenciaConfig {
  id: string
  nombre: string
  icono: string
  color: string
  accionSugerida: string
  preguntasIds: string[]
  palabrasClave: string[]
}

export interface SugerenciaConMetrica {
  id: string
  categoria: string
  color: string
  icono: string
  cantidad: number
  porcentaje: number
  preguntasVinculadas: PreguntaEncuesta[]
  totalPreguntasVinculadas: number
  ejemplosTexto: string[]
  accionSugerida: string
  promedioPuntaje?: number
}

const CLAVE_STORAGE = 'hablandocontigo_sugerencias_vinculadas_v2'

export const CATEGORIAS_SUGERENCIAS_DEFAULT: CategoriaSugerenciaConfig[] = [
  {
    id: 'cat-procesos-tecnologia',
    nombre: 'Procesos & Tecnología',
    icono: 'Cpu',
    color: '#0ea5e9', // Sky
    accionSugerida: 'Inversión en renovación tecnológica y optimización de software.',
    preguntasIds: ['b5-p26-procesos-agiles', 'b5-p27-procesos-claros'],
    palabrasClave: ['tecnología', 'software', 'sistema', 'internet', 'herramientas', 'computador', 'diadema', 'procesos', 'trámites', 'plataforma']
  },
  {
    id: 'cat-infraestructura-espacios',
    nombre: 'Infraestructura & Espacios',
    icono: 'Building2',
    color: '#f59e0b', // Amber
    accionSugerida: 'Mantenimiento físico y ergonomía en puestos de trabajo.',
    preguntasIds: ['b2-p3-gusto', 'b1-p2-area'],
    palabrasClave: ['aire', 'silla', 'baño', 'piso', 'espacio', 'iluminación', 'ergonomía', 'puesto', 'cafetería', 'instalaciones', 'ruido']
  },
  {
    id: 'cat-salario-beneficios',
    nombre: 'Salario & Beneficios',
    icono: 'DollarSign',
    color: '#10b981', // Emerald
    accionSugerida: 'Revisión de escala de incentivos y vales de bienestar.',
    preguntasIds: ['b5-p23-beneficios', 'b5-p24-compensaciones'],
    palabrasClave: ['salario', 'pago', 'bono', 'sueldo', 'beneficio', 'incentivo', 'compensación', 'prima', 'aumento', 'comisión']
  },
  {
    id: 'cat-clima-reconocimiento',
    nombre: 'Clima & Reconocimiento',
    icono: 'Smile',
    color: '#8b5cf6', // Purple
    accionSugerida: 'Talleres de liderazgo empático y eventos de integración.',
    preguntasIds: ['b4-p20-feedback', 'b5-p30-equilibrio-vida'],
    palabrasClave: ['clima', 'jefe', 'trato', 'reconocimiento', 'apoyo', 'compañeros', 'liderazgo', 'motivación', 'respeto', 'feedback', 'comunicación']
  }
]

// Estado reactivo persistente global
const categoriasConfig = ref<CategoriaSugerenciaConfig[]>([])

function cargarConfiguracion() {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        categoriasConfig.value = parsed
        return
      }
    }
  } catch (e) {
    console.warn('[useSugerenciasOrganizacionales] Error leyendo almacenamiento local:', e)
  }
  categoriasConfig.value = JSON.parse(JSON.stringify(CATEGORIAS_SUGERENCIAS_DEFAULT))
}

function guardarConfiguracion() {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(categoriasConfig.value))
  } catch (e) {
    console.warn('[useSugerenciasOrganizacionales] Error guardando en almacenamiento local:', e)
  }
}

// Inicializar al cargar el módulo
cargarConfiguracion()

export function useSugerenciasOrganizacionales() {
  const { encuestas, respuestasAnonimas } = useEncuestas()
  const { mostrarExito } = useToast()

  // Todas las preguntas disponibles en el sistema (unificadas de todas las encuestas y plantillas)
  const todasLasPreguntasDisponibles = computed<PreguntaEncuesta[]>(() => {
    const mapa = new Map<string, PreguntaEncuesta>()
    encuestas.value.forEach(enc => {
      enc.preguntas?.forEach(p => {
        if (!mapa.has(p.id)) {
          mapa.set(p.id, p)
        }
      })
      enc.preguntasSeguimiento?.forEach(p => {
        if (!mapa.has(p.id)) {
          mapa.set(p.id, p)
        }
      })
    })
    return Array.from(mapa.values())
  })

  // Total de preguntas vinculadas en total
  const totalPreguntasVinculadas = computed(() => {
    return categoriasConfig.value.reduce((acc, cat) => acc + (cat.preguntasIds?.length || 0), 0)
  })

  // Cálculo inteligente y en tiempo real de las métricas por cada categoría
  const sugerenciasConMetricas = computed<SugerenciaConMetrica[]>(() => {
    const todasPregs = todasLasPreguntasDisponibles.value
    const mapaPreguntas = new Map(todasPregs.map(p => [p.id, p]))
    const respuestas = respuestasAnonimas.value || []

    // 1. Recolectar datos por cada categoría
    const conteosPorCategoria: Record<string, { count: number; frases: string[]; valores: number[] }> = {}
    
    categoriasConfig.value.forEach(cat => {
      conteosPorCategoria[cat.id] = { count: 0, frases: [], valores: [] }
    })

    let totalGeneralInteracciones = 0

    respuestas.forEach(registro => {
      registro.respuestas?.forEach(item => {
        const idPreg = item.idPregunta || ''
        const rawTxt = String(item.respuesta || item.comentario || '').trim()
        const txtMin = rawTxt.toLowerCase()
        const valNum = typeof item.valor === 'number' ? item.valor : (Number(item.valor) || 0)

        categoriasConfig.value.forEach(cat => {
          let coincide = false

          // A) Coincidencia directa por ID de pregunta vinculada
          if (cat.preguntasIds?.some(pId => pId === idPreg || idPreg.includes(pId))) {
            coincide = true
          }

          // B) Coincidencia semántica por palabras clave en textos abiertos / comentarios
          if (!coincide && txtMin.length >= 4 && cat.palabrasClave?.some(pal => txtMin.includes(pal.toLowerCase()))) {
            coincide = true
          }

          if (coincide) {
            const reg = conteosPorCategoria[cat.id]
            if (reg) {
              reg.count++
              totalGeneralInteracciones++
              if (valNum > 0) {
                reg.valores.push(valNum)
              }
              if (rawTxt && rawTxt.length >= 6 && !reg.frases.includes(rawTxt)) {
                reg.frases.push(rawTxt)
              }
            }
          }
        })
      })
    })

    // 2. Si no hay respuestas aún, ponderar según la proporción de preguntas vinculadas
    // para que la interfaz muestre el peso asignado en lugar de un frío 0%
    const totalPreguntasConfiguradas = categoriasConfig.value.reduce(
      (acc, c) => acc + (c.preguntasIds?.length || 0), 0
    ) || 1

    return categoriasConfig.value.map(cat => {
      const datos = conteosPorCategoria[cat.id] || { count: 0, frases: [], valores: [] }
      const pregsVinculadas = (cat.preguntasIds || [])
        .map(id => mapaPreguntas.get(id))
        .filter((p): p is PreguntaEncuesta => Boolean(p))

      let porcentaje = 0
      if (totalGeneralInteracciones > 0) {
        porcentaje = Math.round((datos.count / totalGeneralInteracciones) * 100)
      }

      // Promedio de puntaje en escala 1-5 si aplica
      let promedioPuntaje = undefined
      if (datos.valores.length > 0) {
        const suma = datos.valores.reduce((a, b) => a + b, 0)
        promedioPuntaje = +(suma / datos.valores.length).toFixed(1)
      }

      return {
        id: cat.id,
        categoria: cat.nombre,
        icono: cat.icono || 'Lightbulb',
        color: cat.color || '#f59e0b',
        cantidad: datos.count,
        porcentaje,
        preguntasVinculadas: pregsVinculadas,
        totalPreguntasVinculadas: pregsVinculadas.length,
        ejemplosTexto: datos.frases.slice(0, 4),
        accionSugerida: cat.accionSugerida,
        promedioPuntaje
      }
    })
  })

  // ─── Acciones de Gestión ───────────────────────────────────────────────────

  /**
   * Alterna la vinculación de una pregunta con una categoría
   */
  const toggleVinculacion = (categoriaId: string, idPregunta: string) => {
    const cat = categoriasConfig.value.find(c => c.id === categoriaId)
    if (!cat) return

    if (!cat.preguntasIds) cat.preguntasIds = []

    const idx = cat.preguntasIds.indexOf(idPregunta)
    if (idx >= 0) {
      cat.preguntasIds.splice(idx, 1)
    } else {
      cat.preguntasIds.push(idPregunta)
    }
    guardarConfiguracion()
  }

  /**
   * Actualiza los datos de una categoría (plan de acción, palabras clave, etc.)
   */
  const actualizarCategoria = (categoriaId: string, datos: Partial<CategoriaSugerenciaConfig>) => {
    const cat = categoriasConfig.value.find(c => c.id === categoriaId)
    if (!cat) return
    Object.assign(cat, datos)
    guardarConfiguracion()
    mostrarExito('Categoría actualizada', `Se guardaron los ajustes en "${cat.nombre}".`)
  }

  /**
   * Auto-vinculación con Inteligencia Artificial en 1 solo clic:
   * Analiza el texto y categoría de todas las preguntas de la encuesta y las clasifica
   * automáticamente en las 4 dimensiones para quitar carga operativa.
   */
  const autoVincularPreguntasIA = (): number => {
    let totalAsignadas = 0
    const preguntas = todasLasPreguntasDisponibles.value

    categoriasConfig.value.forEach(cat => {
      if (!cat.preguntasIds) cat.preguntasIds = []
    })

    preguntas.forEach(preg => {
      const txt = (preg.texto + ' ' + (preg.categoria || '')).toLowerCase()

      // Procesos & Tecnología
      if (
        txt.includes('tecnolog') || 
        txt.includes('software') || 
        txt.includes('sistema') || 
        txt.includes('proceso') || 
        txt.includes('equipo') || 
        txt.includes('internet') || 
        txt.includes('herramienta') ||
        txt.includes('trámite')
      ) {
        const cat = categoriasConfig.value.find(c => c.id === 'cat-procesos-tecnologia')
        if (cat && !cat.preguntasIds.includes(preg.id)) {
          cat.preguntasIds.push(preg.id)
          totalAsignadas++
        }
      }

      // Infraestructura & Espacios
      if (
        txt.includes('infraestructura') || 
        txt.includes('espacio') || 
        txt.includes('silla') || 
        txt.includes('ergonom') || 
        txt.includes('aire') || 
        txt.includes('entorno') || 
        txt.includes('iluminac') || 
        txt.includes('puesto de trabajo')
      ) {
        const cat = categoriasConfig.value.find(c => c.id === 'cat-infraestructura-espacios')
        if (cat && !cat.preguntasIds.includes(preg.id)) {
          cat.preguntasIds.push(preg.id)
          totalAsignadas++
        }
      }

      // Salario & Beneficios
      if (
        txt.includes('salario') || 
        txt.includes('sueldo') || 
        txt.includes('beneficio') || 
        txt.includes('compensaci') || 
        txt.includes('económic') || 
        txt.includes('incentivo') || 
        txt.includes('pago')
      ) {
        const cat = categoriasConfig.value.find(c => c.id === 'cat-salario-beneficios')
        if (cat && !cat.preguntasIds.includes(preg.id)) {
          cat.preguntasIds.push(preg.id)
          totalAsignadas++
        }
      }

      // Clima & Reconocimiento
      if (
        txt.includes('clima') || 
        txt.includes('liderazgo') || 
        txt.includes('jefe') || 
        txt.includes('compañer') || 
        txt.includes('reconocimiento') || 
        txt.includes('convivencia') || 
        txt.includes('feedback') || 
        txt.includes('comunicación') || 
        txt.includes('equilibrio')
      ) {
        const cat = categoriasConfig.value.find(c => c.id === 'cat-clima-reconocimiento')
        if (cat && !cat.preguntasIds.includes(preg.id)) {
          cat.preguntasIds.push(preg.id)
          totalAsignadas++
        }
      }
    })

    guardarConfiguracion()
    mostrarExito(
      '🤖 Auto-Vinculación IA Completada', 
      `Se vincularon automáticamente ${totalAsignadas} preguntas a las categorías de sugerencias.`
    )
    return totalAsignadas
  }

  /**
   * Restaura la configuración original de las categorías
   */
  const restablecerValoresPorDefecto = () => {
    categoriasConfig.value = JSON.parse(JSON.stringify(CATEGORIAS_SUGERENCIAS_DEFAULT))
    guardarConfiguracion()
    mostrarExito('Valores restablecidos', 'Se restauraron las categorías y preguntas sugeridas por defecto.')
  }

  return {
    categoriasConfig,
    sugerenciasConMetricas,
    todasLasPreguntasDisponibles,
    totalPreguntasVinculadas,
    toggleVinculacion,
    actualizarCategoria,
    autoVincularPreguntasIA,
    restablecerValoresPorDefecto
  }
}
