/**
 * ============================================================================
 * SERVICIO DISPOSITIVO (deviceService.ts) - RE-EXPORTADOR UNIFICADO
 * ============================================================================
 * Módulos específicos en la misma carpeta:
 * - uuidService.ts: Generación y persistencia de UUID anónimo y fecha/hora.
 * - ubicacionService.ts: Sensores GPS, geocodificación inversa y respaldo IP.
 */

export * from './uuidService'
export * from './ubicacionService'