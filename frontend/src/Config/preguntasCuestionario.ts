/**
 * ============================================================================
 * ENCUESTA OFICIAL — CONTIGO CALL CENTER
 * CLIMA LABORAL Y DESARROLLO ORGANIZACIONAL (preguntasCuestionario.ts)
 * ============================================================================
 *
 * Estructura oficial dividida en 8 bloques temáticos.
 * Las preguntas se cargan 100% dinámicamente desde el archivo JSON:
 *   src/database/preguntas.json (y src/Config/preguntas.json)
 * Cualquier modificación en las preguntas debe realizarse en ese archivo JSON.
 */

import type { PreguntaEncuesta } from '@/ia'
import preguntasJson from '@/database/preguntas.json'

// ─────────────────────────────────────────────────────────────────────────────
// Metadatos globales de la encuesta
// ─────────────────────────────────────────────────────────────────────────────
export const TITULO_ENCUESTA_CLIMA_INTEGRAL =
  'Contigo Te Escucha: Construyendo Juntos Nuestro Entorno'

export const DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL =
  'Espacio 100% confidencial y seguro. Tu opinión sincera es fundamental para identificar oportunidades de bienestar, apoyo y desarrollo continuo en nuestro equipo.'

// ─────────────────────────────────────────────────────────────────────────────
// Metadatos de cada bloque (para separación visual en el editor y dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export interface MetadataBloque {
  id: string
  numero: number
  titulo: string
  descripcion: string
  icono: string          // nombre de ícono Lucide
  colorClase: string     // clases de Tailwind para el gradiente del encabezado
  textColorClase: string
  idEncuestaVinculada?: string
  colorPersonalizado?: string
}

import bloquesJson from '@/database/bloques.json'

export const BLOQUES_ENCUESTA_CLIMA: MetadataBloque[] = bloquesJson as unknown as MetadataBloque[]
export { bloquesJson }

// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA OFICIAL DINÁMICA CARGADA DIRECTAMENTE DESDE preguntas.json
// Todas las preguntas se leen y modifican a través del archivo JSON.
// ─────────────────────────────────────────────────────────────────────────────
export const PLANTILLA_CLIMA_INTEGRAL_DETALLADA: PreguntaEncuesta[] = preguntasJson as unknown as PreguntaEncuesta[]

export { preguntasJson }
