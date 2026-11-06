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
  // Orden progresivo de menor a mayor puntaje:
  // A menor puntaje más rojo y a mayor puntaje más azul
  if (typeof valor === 'number') {
    // Escala de 1 a 5
    if (valor <= 5) {
      if (valor <= 1) return '#ef4444' // Rojo (Menor puntaje)
      if (valor === 2) return '#f97316' // Naranja
      if (valor === 3) return '#f59e0b' // Ámbar / Amarillo
      if (valor === 4) return '#38bdf8' // Azul cielo
      return '#2563eb'                 // Azul intenso (Mayor puntaje)
    }
    // Escala de 0 a 100
    if (valor <= 20) return '#ef4444' // Rojo
    if (valor <= 40) return '#f97316' // Naranja
    if (valor <= 65) return '#f59e0b' // Ámbar / Amarillo
    if (valor <= 85) return '#38bdf8' // Azul cielo
    return '#2563eb'                 // Azul intenso
  }
  const ratio = total > 1 ? index / (total - 1) : 1
  if (ratio <= 0.2) return '#ef4444'
  if (ratio <= 0.4) return '#f97316'
  if (ratio <= 0.6) return '#f59e0b'
  if (ratio <= 0.8) return '#38bdf8'
  return '#2563eb'
}

export function resolverColorExactoOpcion(opc: any, index: number, totalOpciones: number): string {
  let val = typeof opc?.valor === 'number' ? opc.valor : undefined

  // Si no viene valor numérico, intentar extraerlo del prefijo textual (ej: "5 - Excelente")
  if (val === undefined && typeof opc?.texto === 'string') {
    const match = opc.texto.trim().match(/^(\d+)\b/)
    if (match && match[1]) {
      val = parseInt(match[1], 10)
    }
  }

  const esAlerta = Boolean(opc?.esAlerta)

  // Si es alerta crítica o de riesgo (menor puntaje), priorizar rojo/naranja
  if (esAlerta && (val === undefined || val <= 35 || val <= 2)) {
    return (val !== undefined && (val > 20 || val === 2)) ? '#f97316' : '#ef4444'
  }

  // Colores verdes antiguos que deben sustituirse por azul
  const COLORES_VERDES_ANTIGUOS = new Set([
    '#10b981', '#22c55e', '#16a34a', '#059669', '#15803d', '#4ade80', '#86efac', '#34d399', '#047857', '#14b8a6'
  ])

  const colorRaw = opc?.color && typeof opc.color === 'string' ? opc.color.trim().toLowerCase() : ''

  // Si tiene puntaje numérico y el color es un verde antiguo o no tiene color, aplicar escala rojo->azul
  if (typeof val === 'number') {
    if (!colorRaw || COLORES_VERDES_ANTIGUOS.has(colorRaw)) {
      return obtenerColorDegradadoOpcion(index, totalOpciones, val)
    }
  }

  // Si tiene un color personalizado explícito no verde antiguo, respetarlo
  if (colorRaw.length > 0 && !COLORES_VERDES_ANTIGUOS.has(colorRaw)) {
    return opc.color
  }

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
