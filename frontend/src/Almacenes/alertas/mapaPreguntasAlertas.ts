/**
 * ============================================================================
 * MAPA DE ASOCIACIÓN PREGUNTA - ALERTA (mapaPreguntasAlertas.ts)
 * ============================================================================
 * Asocia de forma directa cada ID de pregunta del cuestionario oficial
 * con su alerta troncal correspondiente en español.
 */

export const MAPA_PREGUNTA_A_ALERTA: Record<string, string> = {
  'b2-p3-gusto': 'tipo-riesgo-fuga',
  'b2-p4-estres': 'tipo-sobrecarga-burnout',
  'b2-p5-fatiga': 'tipo-sobrecarga-burnout',
  'b2-p6-herramientas': 'tipo-recursos-condiciones',
  'b2-p7-condiciones-fisicas': 'tipo-recursos-condiciones',
  'b3-p8-colaboracion': 'tipo-molestias-cotidianas',
  'b3-p9-respeto': 'tipo-molestias-cotidianas',
  'b3-p10-comunicacion': 'tipo-molestias-cotidianas',
  'b3-p11-clima-convivencia': 'tipo-molestias-cotidianas',
  'b3-p12-conflictos': 'tipo-molestias-cotidianas',
  'b3-p12b-conflictos-detalle': 'tipo-molestias-cotidianas',
  'b4-p13-instrucciones-claras': 'tipo-claridad-rol',
  'b4-p14-instrucciones-estructuradas': 'tipo-claridad-rol',
  'b4-p15-reconocimiento': 'tipo-reconocimiento-valoracion',
  'b4-p16-valoracion-esfuerzo': 'tipo-reconocimiento-valoracion',
  'b4-p17-accesibilidad-dudas': 'tipo-molestias-cotidianas',
  'b4-p18-escucha-inquietudes': 'tipo-reconocimiento-valoracion',
  'b4-p19-confianza': 'tipo-reconocimiento-valoracion',
  'b4-p20-feedback': 'tipo-claridad-rol',
  'b5-p21-capacitacion': 'tipo-capacitacion-induccion',
  'b5-p22-plan-carrera': 'tipo-crecimiento-subutilizacion',
  'b5-p23-beneficios': 'tipo-retribucion-monetaria',
  'b5-p24-compensaciones': 'tipo-retribucion-monetaria',
  'b5-p25-rrhh-respuesta': 'tipo-reconocimiento-valoracion',
  'b5-p26-procesos-agiles': 'tipo-claridad-rol',
  'b5-p27-procesos-claros': 'tipo-claridad-rol',
  'b5-p28-equidad-tareas': 'tipo-sobrecarga-burnout',
  'b5-p29-equidad-oportunidades': 'tipo-crecimiento-subutilizacion',
  'b5-p30-equilibrio-vida': 'tipo-invasion-vida-personal',
  'b5-p31-comunicacion-interna': 'tipo-claridad-rol',
  'b5-p32-respaldo-organizacion': 'tipo-reconocimiento-valoracion',
  'b6-p34-talento-aprovechado': 'tipo-crecimiento-subutilizacion',
  'b7-p35-vision-2anos': 'tipo-riesgo-fuga',
  'b7-p36-permanencia': 'tipo-riesgo-fuga',
  'b8-p37-mejoras-infraestructura': 'tipo-recursos-condiciones',
  'b8-p38-mejoras-procesos': 'tipo-claridad-rol',
  'b8-p39-sugerencias-direccion': 'tipo-reconocimiento-valoracion',
  'b8-p40-sugerencias-rrhh': 'tipo-retribucion-monetaria',
  'b8-p41-comentarios-libres': 'tipo-molestias-cotidianas'
}
