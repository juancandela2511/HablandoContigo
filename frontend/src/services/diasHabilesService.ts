/**
 * ============================================================================
 * SERVICIO DE DÍAS HÁBILES Y CONTROL DE REVERSIÓN (diasHabilesService.ts)
 * ============================================================================
 * Maneja el cálculo exacto de días hábiles (lunes a viernes, excluyendo fines de semana)
 * para la ventana de reversión de 3 días hábiles tras finalizar un proyecto.
 */

export interface DetalleReversionProyecto {
  esRevertible: boolean
  diasHabilesRestantes: number
  horasRestantes: number
  tiempoRestanteTexto: string
  fechaFinalizacionFormateada: string
  fechaLimiteFormateada: string
  expirado: boolean
}

/**
 * Añade N días hábiles a una fecha dada, saltando sábados y domingos.
 */
export function calcularLimiteDiasHabiles(fechaInicio: Date | string | number, diasHabiles: number = 3): Date {
  const fecha = new Date(fechaInicio)

  // Si la fecha cae en fin de semana, normalizar al lunes a la misma hora
  const diaSemana = fecha.getDay()
  if (diaSemana === 6) { // Sábado -> mover al lunes (+2 días)
    fecha.setDate(fecha.getDate() + 2)
  } else if (diaSemana === 0) { // Domingo -> mover al lunes (+1 día)
    fecha.setDate(fecha.getDate() + 1)
  }

  let diasAgregados = 0
  while (diasAgregados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1)
    const dia = fecha.getDay()
    // 0 = Domingo, 6 = Sábado
    if (dia !== 0 && dia !== 6) {
      diasAgregados++
    }
  }

  return fecha
}

/**
 * Cuenta cuántos días hábiles quedan entre dos fechas.
 */
export function contarDiasHabilesEntre(desde: Date, hasta: Date): number {
  if (desde >= hasta) return 0
  const cursor = new Date(desde)
  let conteo = 0
  while (cursor < hasta) {
    cursor.setDate(cursor.getDate() + 1)
    const dia = cursor.getDay()
    if (dia !== 0 && dia !== 6) {
      conteo++
    }
  }
  return conteo
}

/**
 * Determina si el proyecto aún puede ser revertido según la fecha límite ISO.
 */
export function esReversionValida(limiteReversionISO?: string | null): boolean {
  if (!limiteReversionISO) return false
  const limite = new Date(limiteReversionISO)
  if (isNaN(limite.getTime())) return false
  return new Date() <= limite
}

/**
 * Obtiene los detalles formateados para mostrar en la interfaz de usuario.
 */
export function obtenerDetalleReversion(
  fechaFinalizacionISO?: string | null,
  limiteReversionISO?: string | null
): DetalleReversionProyecto {
  if (!fechaFinalizacionISO && !limiteReversionISO) {
    return {
      esRevertible: false,
      diasHabilesRestantes: 0,
      horasRestantes: 0,
      tiempoRestanteTexto: 'No finalizado',
      fechaFinalizacionFormateada: '',
      fechaLimiteFormateada: '',
      expirado: false
    }
  }

  const fechaFin = fechaFinalizacionISO ? new Date(fechaFinalizacionISO) : new Date()
  const fechaLimite = limiteReversionISO
    ? new Date(limiteReversionISO)
    : calcularLimiteDiasHabiles(fechaFin, 3)

  const ahora = new Date()
  const esRevertible = ahora <= fechaLimite

  const msRestantes = fechaLimite.getTime() - ahora.getTime()
  const horasRestantes = Math.max(0, Math.floor(msRestantes / (1000 * 60 * 60)))
  const diasHabilesRestantes = esRevertible ? Math.max(1, contarDiasHabilesEntre(ahora, fechaLimite)) : 0

  let tiempoRestanteTexto = ''
  if (!esRevertible) {
    tiempoRestanteTexto = 'Plazo de 3 días hábiles cumplido'
  } else if (diasHabilesRestantes > 1) {
    tiempoRestanteTexto = `${diasHabilesRestantes} días hábiles para revertir`
  } else if (diasHabilesRestantes === 1) {
    tiempoRestanteTexto = horasRestantes > 12 ? '1 día hábil para revertir' : `Vence hoy (${horasRestantes}h restantes)`
  } else if (horasRestantes > 0) {
    tiempoRestanteTexto = `Vence en ${horasRestantes}h`
  } else {
    tiempoRestanteTexto = 'Vence en menos de 1 hora'
  }

  const opcionesFormato: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }

  return {
    esRevertible,
    diasHabilesRestantes,
    horasRestantes,
    tiempoRestanteTexto,
    fechaFinalizacionFormateada: isNaN(fechaFin.getTime()) ? '' : fechaFin.toLocaleString('es-CO', opcionesFormato),
    fechaLimiteFormateada: isNaN(fechaLimite.getTime()) ? '' : fechaLimite.toLocaleString('es-CO', opcionesFormato),
    expirado: !esRevertible
  }
}
