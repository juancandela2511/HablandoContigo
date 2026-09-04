/**
 * ============================================================================
 * ARCHIVO: /componentes/pregunta-interactiva.tsx
 * CAPA: Componentes Visuales Atómicos
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Administra la experiencia de respuesta y la ramificación condicional en tiempo real.
 * - Es consumido por `/vistas/panel-encuestas.tsx`.
 * - Estética de alta gama ("Héroe 23"):
 *   1. Tarjeta oscura con marcas de visor en las cuatro esquinas (viewfinder brackets).
 *   2. Escala horizontal segmentada para preguntas Likert de 1 a 5.
 *   3. Opciones de selección múltiple con indicador de color de sentimiento y atajo numérico.
 *   4. Banner estilizado para la bifurcación obligatoria de jefatura.
 *   5. Campo de texto libre con chips de sugerencias rápidas.
 * ============================================================================
 */

import React, { useState } from 'react';
import { Boton } from './boton';

export interface OpcionRespuesta {
  id: string;
  texto: string;
  valorNumerico?: number;
  esCritica?: boolean;
}

export interface DefinicionPregunta {
  id: string;
  categoria: string;
  texto: string;
  tipo: 'seleccion' | 'escala' | 'texto_abierto';
  opciones?: OpcionRespuesta[];
  esSubpreguntaCondicional?: boolean;
  marcadorRequerido?: boolean;
}

export interface PropiedadesPreguntaInteractiva {
  pregunta: DefinicionPregunta;
  respuestaSeleccionada?: string;
  comentarioAbierto?: string;
  onSeleccionarOpcion: (opcion: OpcionRespuesta) => void;
  onCambiarComentario: (texto: string) => void;
}

export const PreguntaInteractiva: React.FC<PropiedadesPreguntaInteractiva> = ({
  pregunta,
  respuestaSeleccionada,
  comentarioAbierto = '',
  onSeleccionarOpcion,
  onCambiarComentario,
}) => {
  // Sugerencias de apoyo para agilizar la redacción en sub-preguntas abiertas
  const sugerenciasRapidas = [
    'Falta de claridad en metas',
    'Trato poco empático o distante',
    'Sobrecarga en horarios pico',
    'Poco reconocimiento al esfuerzo',
    'Excelente apoyo en el día a día',
  ];

  const agregarSugerencia = (sug: string) => {
    const actual = comentarioAbierto.trim();
    const nuevo = actual ? `${actual}, ${sug.toLowerCase()}` : sug;
    onCambiarComentario(nuevo);
  };

  // Determinar si la pregunta es escala Likert (1 a 5)
  const esEscalaLikert =
    pregunta.tipo === 'escala' ||
    (pregunta.opciones &&
      pregunta.opciones.length === 5 &&
      pregunta.opciones.some((o) => o.valorNumerico === 1) &&
      pregunta.opciones.some((o) => o.valorNumerico === 5));

  // Color de punto según sentimiento
  const obtenerColorSentimiento = (opc: OpcionRespuesta) => {
    const texto = opc.texto.toLowerCase();
    if (texto === 'bien' || opc.valorNumerico === 5 || opc.valorNumerico === 4) {
      return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
    }
    if (texto === 'regular' || opc.valorNumerico === 3) {
      return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]';
    }
    if (texto === 'mal' || opc.valorNumerico === 1 || opc.esCritica) {
      return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
    }
    return 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]';
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* 1. Categoría y Badge de Bifurcación */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            {pregunta.categoria}
          </span>
          {pregunta.esSubpreguntaCondicional && (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/40 flex items-center gap-1">
              <span>⚡</span> Pregunta de Profundización Obligatoria
            </span>
          )}
        </div>

        {/* Enunciado de la Pregunta Principal */}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug tracking-tight">
          {pregunta.texto}
        </h3>
      </div>

      {/* 2. Banner de Información si es Subpregunta Condicional */}
      {pregunta.esSubpreguntaCondicional && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-base">
            ⚠️
          </div>
          <div className="space-y-0.5">
            <strong className="text-white text-xs block">
              Bifurcación Condicional en Tiempo Real:
            </strong>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              Esta pregunta se desplegó dinámicamente tras tu valoración sobre la relación con tu jefatura.
              Tus comentarios son 100% confidenciales y servirán para fundamentar mejoras operativas.
            </p>
          </div>
        </div>
      )}

      {/* 3. CASO A: Escala Horizontal Likert 1 a 5 */}
      {esEscalaLikert && pregunta.opciones && (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {pregunta.opciones.map((opcion) => {
              const estaSeleccionada = respuestaSeleccionada === opcion.texto;

              return (
                <button
                  key={opcion.id}
                  type="button"
                  onClick={() => onSeleccionarOpcion(opcion)}
                  className={`
                    p-3 sm:p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer
                    flex flex-col items-center justify-center gap-1.5 group
                    ${
                      estaSeleccionada
                        ? 'bg-white text-black border-white shadow-xl shadow-white/20 scale-105 font-bold'
                        : 'bg-neutral-900/80 text-neutral-300 border-white/10 hover:border-white/30 hover:bg-neutral-800'
                    }
                  `}
                >
                  <span className="text-lg sm:text-2xl font-black font-mono">
                    {opcion.valorNumerico}
                  </span>
                  <span
                    className={`
                      text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold opacity-80 leading-tight hidden sm:block
                      ${estaSeleccionada ? 'text-black' : 'text-neutral-400'}
                    `}
                  >
                    {opcion.texto.split('-')[1]?.trim() || opcion.texto}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1 font-mono">
            <span>1: Muy bajo / Malestar</span>
            <span>5: Plena satisfacción</span>
          </div>
        </div>
      )}

      {/* 4. CASO B: Selección Múltiple Estándar (ej: Bien, Regular, Mal) */}
      {!esEscalaLikert && pregunta.tipo !== 'texto_abierto' && pregunta.opciones && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {pregunta.opciones.map((opcion, idx) => {
            const estaSeleccionada = respuestaSeleccionada === opcion.texto;

            return (
              <button
                key={opcion.id}
                type="button"
                onClick={() => onSeleccionarOpcion(opcion)}
                className={`
                  p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer
                  flex items-center justify-between group
                  ${
                    estaSeleccionada
                      ? 'bg-white text-black border-white shadow-xl shadow-white/15 scale-[1.02] font-bold'
                      : 'bg-neutral-900/80 text-neutral-300 border-white/10 hover:border-white/30 hover:bg-neutral-800/90'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${obtenerColorSentimiento(opcion)}`} />
                  <span className="text-sm font-semibold">{opcion.texto}</span>
                </div>

                <span
                  className={`
                    w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs ml-2
                    ${
                      estaSeleccionada
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-600 text-neutral-500 font-mono text-[10px]'
                    }
                  `}
                >
                  {estaSeleccionada ? '✓' : idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 5. CASO C: Campo Abierto de Texto / Profundización */}
      {pregunta.tipo === 'texto_abierto' && (
        <div className="space-y-3 pt-2">
          <div className="relative">
            <textarea
              rows={4}
              value={comentarioAbierto}
              onChange={(e) => onCambiarComentario(e.target.value)}
              placeholder="Escribe con total honestidad tus observaciones, situaciones o recomendaciones..."
              className="w-full p-4 rounded-2xl bg-neutral-950/90 border border-white/20 text-white text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/30 transition-all placeholder:text-neutral-600 resize-none font-normal"
            />
            <div className="absolute bottom-3 right-3 text-[11px] text-neutral-500 font-mono">
              {comentarioAbierto.trim().length} caracteres
            </div>
          </div>

          {/* Chips de sugerencias */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block">
              Ideas clave para fundamentar tu respuesta (haz clic para añadir):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sugerenciasRapidas.map((sug, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => agregarSugerencia(sug)}
                  className="text-[11px] px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PreguntaInteractiva;
