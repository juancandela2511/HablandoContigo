/**
 * ============================================================================
 * ARCHIVO: /componentes/boton.tsx
 * CAPA: Componentes Visuales Atómicos
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Este componente es un botón interactivo reutilizable consumido por:
 *   1. `/vistas/landing-page.tsx` (para los botones de llamada a la acción "Comenzar" y "Explorar").
 *   2. `/vistas/panel-encuestas.tsx` (para avanzar preguntas, retroceder y enviar la encuesta).
 *   3. `/componentes/pregunta-interactiva.tsx` (para seleccionar opciones de respuesta).
 * - Ofrece variantes estilísticas modernas y animación de carga nativa sin librerías pesadas.
 * ============================================================================
 */

import React from 'react';

export type VarianteBoton = 
  | 'primario'    // Blanco sólido con texto oscuro (estilo minimalista de alta gama)
  | 'secundario'  // Oscuro con borde translúcido
  | 'esquema'     // Contorno fino elegante
  | 'peligro'     // Rojo/carmesí para alertas o descartes
  | 'fantasma';   // Sin fondo, solo efecto hover sutil

export interface PropiedadesBoton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  cargando?: boolean;
  textoCarga?: string;
  iconoIzquierda?: React.ReactNode;
  iconoDerecha?: React.ReactNode;
  tamano?: 'pequeno' | 'mediano' | 'grande';
  anchoCompleto?: boolean;
  children?: React.ReactNode;
}

export const Boton: React.FC<PropiedadesBoton> = ({
  variante = 'primario',
  cargando = false,
  textoCarga = 'Procesando...',
  iconoIzquierda,
  iconoDerecha,
  tamano = 'mediano',
  anchoCompleto = false,
  disabled,
  children,
  className = '',
  ...otrasPropiedades
}) => {
  // Configuración de clases según el tamaño seleccionado
  const clasesTamano = {
    pequeno: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    mediano: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
    grande: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 font-bold',
  }[tamano];

  // Configuración de clases según la variante estética
  const clasesVariante = {
    primario: 'bg-white text-black hover:bg-slate-200 active:scale-95 shadow-lg shadow-white/10 font-bold',
    secundario: 'bg-slate-900 text-white border border-slate-700/70 hover:bg-slate-800 hover:border-slate-500 active:scale-95',
    esquema: 'bg-transparent text-white border border-white/25 hover:border-white hover:bg-white/5 active:scale-95',
    peligro: 'bg-red-600/90 text-white hover:bg-red-500 active:scale-95 shadow-lg shadow-red-600/20',
    fantasma: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/60 active:scale-95',
  }[variante];

  return (
    <button
      disabled={disabled || cargando}
      className={`
        inline-flex items-center justify-center transition-all duration-200 cursor-pointer
        disabled:opacity-45 disabled:cursor-not-allowed disabled:transform-none select-none
        ${anchoCompleto ? 'w-full' : ''}
        ${clasesTamano}
        ${clasesVariante}
        ${className}
      `}
      {...otrasPropiedades}
    >
      {cargando ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{textoCarga}</span>
        </>
      ) : (
        <>
          {iconoIzquierda && <span className="shrink-0">{iconoIzquierda}</span>}
          <span>{children}</span>
          {iconoDerecha && <span className="shrink-0">{iconoDerecha}</span>}
        </>
      )}
    </button>
  );
};

export default Boton;
