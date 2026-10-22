/**
 * Propósito: centraliza las dimensiones base del radar y las utilidades de normalización
 * para mantener coherencia entre todas las pantallas de dashboard.
 * Conexiones: se consume desde `useEstadisticas.ts` y en componentes de visualización radial.
 */

import type { DimensionRadial } from './types'
import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'



export const RANGOS_ANTIGUEDAD = [
  { rango: 'menos-6m', etiqueta: 'Menos de 6 meses' },
  { rango: '6m-1a', etiqueta: 'De 6 meses a 1 año' },
  { rango: '1a-3a', etiqueta: 'De 1 a 3 años' },
  { rango: 'mas-3a', etiqueta: 'Más de 3 años' }
]

export function normalizarAntiguedadTexto(texto: string): string {
  const txt = String(texto || '').toLowerCase()
  if (txt.includes('menos de 6') || txt.includes('0-6')) return 'menos-6m'
  if (txt.includes('6 meses') || txt.includes('6m-1a')) return '6m-1a'
  if (txt.includes('1 a 3') || txt.includes('1-3')) return '1a-3a'
  if (txt.includes('más de 3') || txt.includes('mas de 3') || txt.includes('+3')) return 'mas-3a'
  return '1a-3a'
}

export function calcularDimensionesProporcionales(
  dimensionesDef: DimensionRadial[],
  respuestas: RegistroRespuesta[],
  metaGlobal: number = 85
): DimensionRadial[] {
  const mapaCategorias: Record<string, { suma: number; count: number }> = {}

  respuestas.forEach(r => {
    r.respuestas?.forEach(item => {
      if (typeof item.valor === 'number' && item.valor >= 1 && item.valor <= 5 && item.categoria?.trim()) {
        const catNorm = item.categoria.trim().toLowerCase()
        if (!mapaCategorias[catNorm]) mapaCategorias[catNorm] = { suma: 0, count: 0 }
        mapaCategorias[catNorm]!.suma += item.valor
        mapaCategorias[catNorm]!.count++
      }
    })
  })

  return dimensionesDef.map(dim => {
    const ejeNorm = dim.eje.trim().toLowerCase()
    const catMapeada = dim.categoriaMapeada?.trim().toLowerCase()
    let suma = 0
    let count = 0

    if (catMapeada && mapaCategorias[catMapeada]) {
      suma += mapaCategorias[catMapeada].suma
      count += mapaCategorias[catMapeada].count
    } else if (mapaCategorias[ejeNorm]) {
      suma += mapaCategorias[ejeNorm].suma
      count += mapaCategorias[ejeNorm].count
    } else {
      const palabras = ejeNorm.split(/\s+/).filter(w => w.length >= 4 && !['para', 'sobre', 'equipo'].includes(w))
      for (const [cat, data] of Object.entries(mapaCategorias)) {
        if (cat.includes(ejeNorm) || ejeNorm.includes(cat) || palabras.some(p => cat.includes(p))) {
          suma += data.suma
          count += data.count
        }
      }
    }

    const valorCalculado = count > 0 ? Math.min(100, Math.max(0, Math.round(((suma / count) / 5) * 100))) : 0
    const estado: DimensionRadial['estado'] = valorCalculado >= 80 ? 'Óptimo' : valorCalculado >= 70 ? 'Riesgo Moderado' : valorCalculado >= 50 ? 'Atención' : 'Crítico'

    return {
      ...dim,
      valor: valorCalculado,
      meta: dim.meta || metaGlobal,
      estado,
      inclinacion: typeof dim.inclinacion === 'number' ? dim.inclinacion : 0,
      totalRespuestas: count
    }
  })
}
