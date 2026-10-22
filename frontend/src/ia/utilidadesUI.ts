/**
 * Utilidades de Escalas Psicométricas, Colores y Compresión de Imágenes
 */

import type { OpcionPregunta } from './tiposIA'

export function obtenerEscalaEstandarDetallada(
  tipo: 'satisfaccion' | 'calidad' | 'acuerdo' | 'frecuencia' = 'satisfaccion'
): OpcionPregunta[] {
  if (tipo === 'calidad') {
    return [
      { id: 'esc-5', texto: '5 - Excelente (Óptimo, sin fallas)', valor: 5, esAlerta: false },
      { id: 'esc-4', texto: '4 - Bien (Favorable)', valor: 4, esAlerta: false },
      { id: 'esc-3', texto: '3 - Regular (Aceptable)', valor: 3, esAlerta: false },
      { id: 'esc-2', texto: '2 - Mal (Deficiente)', valor: 2, esAlerta: false },
      { id: 'esc-1', texto: '1 - Muy Mal (Crítico)', valor: 1, esAlerta: true }
    ]
  }
  if (tipo === 'acuerdo') {
    return [
      { id: 'esc-5', texto: '5 - Totalmente de acuerdo', valor: 5, esAlerta: false },
      { id: 'esc-4', texto: '4 - De acuerdo', valor: 4, esAlerta: false },
      { id: 'esc-3', texto: '3 - Neutral / En parte', valor: 3, esAlerta: false },
      { id: 'esc-2', texto: '2 - En desacuerdo', valor: 2, esAlerta: false },
      { id: 'esc-1', texto: '1 - Totalmente en desacuerdo', valor: 1, esAlerta: true }
    ]
  }
  if (tipo === 'frecuencia') {
    return [
      { id: 'esc-5', texto: '5 - Siempre / Constante', valor: 5, esAlerta: false },
      { id: 'esc-4', texto: '4 - Frecuentemente', valor: 4, esAlerta: false },
      { id: 'esc-3', texto: '3 - Ocasionalmente', valor: 3, esAlerta: false },
      { id: 'esc-2', texto: '2 - Rara vez', valor: 2, esAlerta: false },
      { id: 'esc-1', texto: '1 - Nunca / Prácticamente nulo', valor: 1, esAlerta: true }
    ]
  }
  return [
    { id: 'esc-5', texto: '5 - Excelente (Satisfecho/a)', valor: 5, esAlerta: false },
    { id: 'esc-4', texto: '4 - Bien (Favorable)', valor: 4, esAlerta: false },
    { id: 'esc-3', texto: '3 - Regular (Neutral)', valor: 3, esAlerta: false },
    { id: 'esc-2', texto: '2 - Mal (Insatisfecho/a)', valor: 2, esAlerta: false },
    { id: 'esc-1', texto: '1 - Muy Mal (Crítico)', valor: 1, esAlerta: true }
  ]
}

export function obtenerColorDegradadoOpcion(index: number, total: number, valor?: number): string {
  // Orden progresivo de menor a mayor puntaje: Rojo -> Naranja -> Ámbar/Amarillo -> Verde Claro -> Verde Esmeralda
  if (typeof valor === 'number') {
    if (valor <= 1) return '#ef4444' // Rojo (Menor puntaje)
    if (valor === 2) return '#f97316' // Naranja
    if (valor === 3) return '#f59e0b' // Ámbar / Amarillo
    if (valor === 4) return '#22c55e' // Verde claro
    if (valor >= 5) return '#10b981' // Verde mayor
  }
  const ratio = index / Math.max(1, total - 1)
  if (ratio <= 0.2) return '#ef4444'
  if (ratio <= 0.4) return '#f97316'
  if (ratio <= 0.6) return '#f59e0b'
  if (ratio <= 0.8) return '#22c55e'
  return '#10b981'
}

export function resolverColorExactoOpcion(opc: any, index: number, totalOpciones: number): string {
  // Colores heredados antiguos (azules/grises aleatorios) que deben reemplazarse por la progresión Rojo -> Verde
  const COLORES_ANTIGUOS_IGNORAR = new Set([
    '#0284c7', '#00c8ff', '#0066ff', '#3b82f6', '#2563eb', '#6366f1', '#0ea5e9', '#64748b'
  ])
  const colorRaw = opc?.color && typeof opc.color === 'string' ? opc.color.trim().toLowerCase() : ''
  if (colorRaw.length > 0 && !COLORES_ANTIGUOS_IGNORAR.has(colorRaw)) {
    return opc.color
  }
  const val = typeof opc?.valor === 'number' ? opc.valor : undefined
  if (opc?.esAlerta || val === 1) return '#ef4444' // Rojo (menor puntaje)
  if (val === 2) return '#f97316' // Naranja
  if (val === 3) return '#f59e0b' // Ámbar
  if (val === 4) return '#22c55e' // Verde claro
  if (val === 5) return '#10b981' // Verde mayor
  return obtenerColorDegradadoOpcion(index, totalOpciones, val)
}

export function comprimirImagenCliente(file: File, maxDimension = 900, calidad = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(e.target?.result as string)
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', calidad))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
