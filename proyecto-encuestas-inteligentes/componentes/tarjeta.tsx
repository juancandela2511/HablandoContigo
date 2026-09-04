/**
 * ============================================================================
 * ARCHIVO: /componentes/tarjeta.tsx
 * CAPA: Componentes Visuales Atómicos
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Este componente es un contenedor oscuro de alta gama consumido por:
 *   1. `/vistas/landing-page.tsx` (para mostrar las métricas flotantes de precisión analítica y anonimato).
 *   2. `/vistas/panel-encuestas.tsx` (como contenedor principal del cuestionario interactivo y panel de resultados).
 *   3. `/componentes/insignia-alerta.tsx` (para estructurar la ficha del objeto de alerta).
 * - Incorpora detalles estéticos premium: bordes sutiles con iluminación difusa, efecto vidrio (glassmorphism)
 *   y marcadores de visor tecnológico (viewfinder brackets) inspirados en el diseño de referencia.
 * ============================================================================
 */

import React from 'react';

export interface PropiedadesTarjeta {
  titulo?: string;
  subtitulo?: string;
  icono?: React.ReactNode;
  mostrarVisoresEsquinas?: boolean;
  brilloBorde?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Tarjeta: React.FC<PropiedadesTarjeta> = ({
  titulo,
  subtitulo,
  icono,
  mostrarVisoresEsquinas = true,
  brilloBorde = false,
  className = '',
  children,
}) => {
  return (
    <div
      className={`
        relative rounded-3xl p-6 sm:p-8
        bg-gradient-to-b from-neutral-950/90 via-black/95 to-neutral-950/90
        border border-white/10
        backdrop-blur-2xl shadow-2xl
        transition-all duration-300
        ${brilloBorde ? 'ring-1 ring-white/20 hover:border-white/30' : 'hover:border-white/20'}
        ${className}
      `}
    >
      {/* 1. Marcadores de visor en las cuatro esquinas (Viewfinder brackets) */}
      {mostrarVisoresEsquinas && (
        <>
          {/* Esquina Superior Izquierda */}
          <span className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-white/40 pointer-events-none" />
          {/* Esquina Superior Derecha */}
          <span className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-white/40 pointer-events-none" />
          {/* Esquina Inferior Izquierda */}
          <span className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-white/40 pointer-events-none" />
          {/* Esquina Inferior Derecha */}
          <span className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-white/40 pointer-events-none" />
        </>
      )}

      {/* 2. Cabecera opcional de la tarjeta */}
      {(titulo || subtitulo || icono) && (
        <div className="flex items-start gap-3.5 mb-5 border-b border-white/10 pb-4 text-left">
          {icono && (
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center shrink-0 text-white">
              {icono}
            </div>
          )}
          <div className="space-y-0.5">
            {titulo && (
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {titulo}
              </h3>
            )}
            {subtitulo && (
              <p className="text-xs text-neutral-400 font-normal leading-relaxed">
                {subtitulo}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. Contenido libre de la tarjeta */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Tarjeta;
