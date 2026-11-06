/**
 * ============================================================================
 * TIPOS Y AYUDANTES DE ALERTAS PERSONALIZADAS (tiposAlertasPersonalizadas.ts)
 * ============================================================================
 * Define interfaces, niveles y funciones de mapeo de severidad en español.
 */

export type NivelAlerta = 1 | 2 | 3 | 4
export type ModoEnfoqueAlerta = 'especifico' | 'general'
export type SeveridadAlerta = 'Crítica' | 'Alta' | 'Moderada' | 'Baja'

export interface TipoAlertaPersonalizada {
  id: string
  nombre: string
  descripcion: string
  nivel: NivelAlerta
  severidad: SeveridadAlerta
  modoEnfoque: ModoEnfoqueAlerta
  enfoqueDetalle?: string
  palabrasClave: string[]
  protocoloAccion: string
  icono?: string
  color?: string
  activa: boolean
  creadoEn?: string
}

export function mapearNivelPorSeveridad(severidad?: SeveridadAlerta): NivelAlerta {
  if (severidad === 'Crítica') return 1
  if (severidad === 'Alta') return 2
  if (severidad === 'Moderada') return 3
  return 4
}

export function mapearSeveridadPorNivel(nivel: NivelAlerta): SeveridadAlerta {
  if (nivel === 1) return 'Crítica'
  if (nivel === 2) return 'Alta'
  if (nivel === 3) return 'Moderada'
  return 'Baja'
}

export function esTextoAcosoSexual(texto: string): boolean {
  const t = texto.toLowerCase()
  return /acoso sexual|insinuaci[oó]n|propuesta[s]? indebida|tocamiento|contacto f[íi]sico|miradas lascivas|comentarios sexuales|sobrepas[oó]|propasar|indecente|beso a la fuerza|intimidaci[oó]n sexual/i.test(t)
}
