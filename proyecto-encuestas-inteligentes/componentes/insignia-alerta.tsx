/**
 * ============================================================================
 * ARCHIVO: /componentes/insignia-alerta.tsx
 * CAPA: Componentes Visuales Atómicos
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Este componente renderiza de forma estricta el objeto de alerta generado por Gemini.
 * - Es utilizado en:
 *   1. `/vistas/panel-encuestas.tsx` (al visualizar el resultado de la auditoría analítica).
 * - Cumple con la estructura obligatoria de 4 campos exigida por la arquitectura:
 *   a) Estado de la Alerta (Activada/Inactiva) con indicador visual pulsante.
 *   b) Mensaje Capturado (el texto literal o selección exacta del usuario).
 *   c) Clasificación Asignada (Buena / Mala).
 *   d) Motivo Detallado de la Alerta (explicación analítica redactada por Gemini).
 * ============================================================================
 */

import React from 'react';
import { ObjetoAlertaGemini } from '../servicios/gemini-api';

export interface PropiedadesInsigniaAlerta {
  alerta: ObjetoAlertaGemini;
  indice?: number;
}

export const InsigniaAlerta: React.FC<PropiedadesInsigniaAlerta> = ({ alerta, indice }) => {
  const esAlertaMala = alerta.clasificacionAsignada === 'Mala';

  return (
    <div className="rounded-2xl p-5 bg-black/60 border border-white/10 space-y-4 text-left transition-all hover:border-white/20 shadow-lg">
      
      {/* 1. Encabezado con Estado de la Alerta y Prioridad */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            {indice !== undefined ? `Alerta #${indice + 1} · Área:` : 'Área:'}
          </span>
          <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
            {alerta.areaAfectada || 'General'}
          </span>
        </div>

        {/* Campo Obligatorio 1: Estado de la Alerta */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Estado:</span>
          <span
            className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm
              ${
                alerta.estadoAlerta === 'Activada'
                  ? 'bg-red-500/15 border-red-500/40 text-red-400'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              }
            `}
          >
            {alerta.estadoAlerta === 'Activada' && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            )}
            {alerta.estadoAlerta} ({alerta.prioridad})
          </span>
        </div>
      </div>

      {/* 2. Cuadrícula de Métricas y Clasificación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Campo Obligatorio 2: Clasificación Asignada */}
        <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 block">
            Clasificación Asignada:
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`
                px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border inline-block
                ${
                  esAlertaMala
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                }
              `}
            >
              ● {alerta.clasificacionAsignada}
            </span>
            <span className="text-[11px] text-neutral-400">
              {esAlertaMala ? 'Riesgo Psicosocial Crítico' : 'Respuesta Constructiva'}
            </span>
          </div>
        </div>

        {/* Prioridad de Atención */}
        <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 block">
            Nivel de Intervención:
          </span>
          <div className="text-xs font-bold text-neutral-200">
            {alerta.prioridad === 'Crítica' ? '🚨 Inmediata (24-48 horas)' : '⚠️ Seguimiento Preventivo'}
          </div>
        </div>

      </div>

      {/* Campo Obligatorio 3: Mensaje Capturado (Texto literal o selección exacta) */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 block">
          Mensaje Capturado (Literal o Selección del Empleado):
        </span>
        <blockquote className="text-xs font-mono text-amber-300 bg-neutral-950 p-3 rounded-xl border-l-2 border-amber-400 italic">
          "{alerta.mensajeCapturado}"
        </blockquote>
      </div>

      {/* Campo Obligatorio 4: Motivo Detallado de la Alerta (Redactado por Gemini) */}
      <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-sky-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
          </svg>
          <span>Motivo Detallado de la Alerta (Análisis Gemini AI):</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed font-normal">
          {alerta.motivoDetallado}
        </p>
      </div>

    </div>
  );
};

export default InsigniaAlerta;
