/**
 * ============================================================================
 * AUTO-VINCULADOR DE PREGUNTAS CON IA (autoVinculadorIA.ts)
 * ============================================================================
 * Clasifica automáticamente las preguntas en las 4 dimensiones organizacionales.
 */

import type { PreguntaEncuesta } from '@/ia'
import type { CategoriaSugerenciaConfig } from '@/Almacenes/useSugerenciasOrganizacionales'

export const CATEGORIAS_SUGERENCIAS_DEFAULT: CategoriaSugerenciaConfig[] = [
  {
    id: 'cat-procesos-tecnologia',
    nombre: 'Procesos & Tecnología',
    icono: 'Cpu',
    color: '#0ea5e9',
    accionSugerida: 'Inversión en renovación tecnológica y optimización de software.',
    preguntasIds: [],
    palabrasClave: ['tecnología', 'software', 'sistema', 'internet', 'herramientas', 'computador', 'diadema', 'procesos', 'trámites', 'plataforma']
  },
  {
    id: 'cat-infraestructura-espacios',
    nombre: 'Infraestructura & Espacios',
    icono: 'Building2',
    color: '#f59e0b',
    accionSugerida: 'Mantenimiento físico y ergonomía en puestos de trabajo.',
    preguntasIds: [],
    palabrasClave: ['aire', 'silla', 'baño', 'piso', 'espacio', 'iluminación', 'ergonomía', 'puesto', 'cafetería', 'instalaciones', 'ruido']
  },
  {
    id: 'cat-salario-beneficios',
    nombre: 'Salario & Beneficios',
    icono: 'DollarSign',
    color: '#10b981',
    accionSugerida: 'Revisión de escala de incentivos y vales de bienestar.',
    preguntasIds: [],
    palabrasClave: ['salario', 'pago', 'bono', 'sueldo', 'beneficio', 'incentivo', 'compensación', 'prima', 'aumento', 'comisión']
  },
  {
    id: 'cat-clima-reconocimiento',
    nombre: 'Clima & Reconocimiento',
    icono: 'Smile',
    color: '#8b5cf6',
    accionSugerida: 'Talleres de liderazgo empático y eventos de integración.',
    preguntasIds: [],
    palabrasClave: ['clima', 'jefe', 'trato', 'reconocimiento', 'apoyo', 'compañeros', 'liderazgo', 'motivación', 'respeto', 'feedback', 'comunicación']
  }
]

export function clasificarPreguntasEnCategorias(
  preguntas: PreguntaEncuesta[],
  categorias: CategoriaSugerenciaConfig[]
): number {
  let totalAsignadas = 0

  categorias.forEach(cat => {
    if (!cat.preguntasIds) cat.preguntasIds = []
  })

  const vincularSiCoincide = (idCat: string, idPreg: string) => {
    const cat = categorias.find(c => c.id === idCat)
    if (cat && !cat.preguntasIds.includes(idPreg)) {
      cat.preguntasIds.push(idPreg)
      totalAsignadas++
    }
  }

  preguntas.forEach(preg => {
    const txt = `${preg.texto} ${preg.categoria || ''}`.toLowerCase()

    if (/tecnolog|software|sistema|proceso|equipo|internet|herramienta|trámite/.test(txt)) {
      vincularSiCoincide('cat-procesos-tecnologia', preg.id)
    }
    if (/infraestructura|espacio|silla|ergonom|aire|entorno|iluminac|puesto de trabajo/.test(txt)) {
      vincularSiCoincide('cat-infraestructura-espacios', preg.id)
    }
    if (/salario|sueldo|beneficio|compensaci|económic|incentivo|pago/.test(txt)) {
      vincularSiCoincide('cat-salario-beneficios', preg.id)
    }
    if (/clima|liderazgo|jefe|compañer|reconocimiento|convivencia|feedback|comunicación|equilibrio/.test(txt)) {
      vincularSiCoincide('cat-clima-reconocimiento', preg.id)
    }
  })

  return totalAsignadas
}
