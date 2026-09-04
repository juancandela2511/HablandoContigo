/**
 * ============================================================================
 * ARCHIVO: /vistas/panel-encuestas.tsx
 * CAPA: Vistas Principales de la Aplicación
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Esta vista es el núcleo operativo de la plataforma. Permite responder la encuesta
 *   interactiva y visualizar el análisis estricto emitido por Gemini en tiempo real.
 * - Conecta y utiliza:
 *   1. `/componentes/pregunta-interactiva.tsx` (para el flujo condicional reactivo).
 *   2. `/componentes/boton.tsx` (para navegación, retroceso y envío).
 *   3. `/componentes/tarjeta.tsx` (para los contenedores del cuestionario y resultados).
 *   4. `/componentes/insignia-alerta.tsx` (para renderizar las alertas con sus 4 campos).
 *   5. `/servicios/gemini-api.ts` (para el análisis psicométrico estricto con System Instructions).
 * - Cumple con la regla de rama condicional obligatoria:
 *   "¿Qué tal te la llevas con tu jefe?" -> "Bien": omite seguimiento negativo;
 *   "Mal" o "Regular": despliega de inmediato la sub-pregunta abierta obligatoria.
 * ============================================================================
 */

import React, { useState } from 'react';
import { Boton } from '../componentes/boton';
import { Tarjeta } from '../componentes/tarjeta';
import { InsigniaAlerta } from '../componentes/insignia-alerta';
import {
  PreguntaInteractiva,
  DefinicionPregunta,
  OpcionRespuesta,
} from '../componentes/pregunta-interactiva';
import {
  evaluarRespuestasConGemini,
  RespuestaEmpleado,
  ResultadoEvaluacionClima,
} from '../servicios/gemini-api';

export interface PropiedadesPanelEncuestas {
  onVolverALanding?: () => void;
}

// Cuestionario base con regla condicional de jefatura integrada
const PREGUNTAS_BASE_INICIALES: DefinicionPregunta[] = [
  {
    id: 'preg-jefe-relacion',
    categoria: 'Liderazgo y Supervisión Directa',
    texto: '¿Qué tal te la llevas con tu jefe?',
    tipo: 'seleccion',
    opciones: [
      { id: 'opc-bien', texto: 'Bien', valorNumerico: 5, esCritica: false },
      { id: 'opc-regular', texto: 'Regular', valorNumerico: 3, esCritica: false },
      { id: 'opc-mal', texto: 'Mal', valorNumerico: 1, esCritica: true },
    ],
  },
  {
    id: 'preg-herramientas',
    categoria: 'Condiciones de Trabajo',
    texto: '¿Cuentas con las herramientas y el equipo adecuado para realizar tus labores?',
    tipo: 'seleccion',
    opciones: [
      { id: 'opc-h-si', texto: 'Completamente adecuadas', valorNumerico: 5 },
      { id: 'opc-h-parcial', texto: 'Parcialmente adecuadas', valorNumerico: 3 },
      { id: 'opc-h-no', texto: 'Insuficientes / Obsoletas', valorNumerico: 1 },
    ],
  },
  {
    id: 'preg-convivencia',
    categoria: 'Ambiente y Convivencia',
    texto: '¿Cómo percibes el respeto y compañerismo en tu área de trabajo?',
    tipo: 'seleccion',
    opciones: [
      { id: 'opc-c-alto', texto: 'Excelente ambiente y colaboración', valorNumerico: 5 },
      { id: 'opc-c-regular', texto: 'Ambiente neutro con tensiones esporádicas', valorNumerico: 3 },
      { id: 'opc-c-malo', texto: 'Hostil o con falta de respeto frecuente', valorNumerico: 1, esCritica: true },
    ],
  },
];

// Definición de la sub-pregunta condicional obligatoria
const SUBPREGUNTA_JEFE_FALENCIAS: DefinicionPregunta = {
  id: 'subpreg-jefe-falencias',
  categoria: 'Profundización de Gestión del Liderazgo',
  texto: '¿Qué inconvenientes, recomendaciones o falencias tienes respecto a la gestión de tu jefe?',
  tipo: 'texto_abierto',
  esSubpreguntaCondicional: true,
  marcadorRequerido: true,
};

export const PanelEncuestas: React.FC<PropiedadesPanelEncuestas> = ({ onVolverALanding }) => {
  // Estado del departamento y cola dinámica de preguntas
  const [departamento, setDepartamento] = useState<string>('Operaciones y Soporte');
  const [colaPreguntas, setColaPreguntas] = useState<DefinicionPregunta[]>([...PREGUNTAS_BASE_INICIALES]);
  const [indicePreguntaActual, setIndicePreguntaActual] = useState<number>(0);

  // Estado de respuestas del usuario
  const [respuestasUsuario, setRespuestasUsuario] = useState<Record<string, { seleccion: string; valor?: number }>>({});
  const [comentariosAbiertos, setComentariosAbiertos] = useState<Record<string, string>>({});

  // Estado del análisis y evaluación con Gemini
  const [enviando, setEnviando] = useState<boolean>(false);
  const [evaluacionFinalizada, setEvaluacionFinalizada] = useState<boolean>(false);
  const [resultadoGemini, setResultadoGemini] = useState<ResultadoEvaluacionClima | null>(null);

  const preguntaActual = colaPreguntas[indicePreguntaActual];
  const totalPreguntas = colaPreguntas.length;
  const porcentajeProgreso = Math.round(((indicePreguntaActual + 1) / totalPreguntas) * 100);

  /**
   * =========================================================================
   * REGLA DE RAMA CONDICIONAL EN TIEMPO REAL (MÓDULO OBLIGATORIO)
   * =========================================================================
   */
  const manejarSeleccionOpcion = (opcion: OpcionRespuesta) => {
    if (!preguntaActual) return;

    // Registrar la respuesta seleccionada
    setRespuestasUsuario((previas) => ({
      ...previas,
      [preguntaActual.id]: {
        seleccion: opcion.texto,
        valor: opcion.valorNumerico,
      },
    }));

    // REGLA: Si es la pregunta sobre el jefe
    if (preguntaActual.id === 'preg-jefe-relacion') {
      const seleccion = opcion.texto.toLowerCase();

      if (seleccion === 'bien') {
        // Omite y oculta automáticamente las preguntas de seguimiento negativo
        setColaPreguntas((previas) => previas.filter((p) => p.id !== SUBPREGUNTA_JEFE_FALENCIAS.id));
        setComentariosAbiertos((previos) => {
          const copia = { ...previos };
          delete copia[SUBPREGUNTA_JEFE_FALENCIAS.id];
          return copia;
        });
      } else if (seleccion === 'mal' || seleccion === 'regular') {
        // Despliega de forma dinámica e inmediata la sub-pregunta obligatoria de profundización
        setColaPreguntas((previas) => {
          const yaExiste = previas.some((p) => p.id === SUBPREGUNTA_JEFE_FALENCIAS.id);
          if (yaExiste) return previas;

          // Insertarla justo después de la pregunta actual
          const nuevaCola = [...previas];
          nuevaCola.splice(indicePreguntaActual + 1, 0, SUBPREGUNTA_JEFE_FALENCIAS);
          return nuevaCola;
        });
      }
    }
  };

  const manejarCambioComentario = (texto: string) => {
    if (!preguntaActual) return;
    setComentariosAbiertos((previos) => ({
      ...previos,
      [preguntaActual.id]: texto,
    }));
  };

  const puedeAvanzar = (): boolean => {
    if (!preguntaActual) return false;
    if (preguntaActual.tipo === 'texto_abierto') {
      const texto = comentariosAbiertos[preguntaActual.id] || '';
      return texto.trim().length > 0; // Obligatorio
    }
    return Boolean(respuestasUsuario[preguntaActual.id]);
  };

  const avanzarPregunta = () => {
    if (!puedeAvanzar()) {
      alert('Por favor responde el campo requerido para poder continuar.');
      return;
    }

    if (indicePreguntaActual < totalPreguntas - 1) {
      setIndicePreguntaActual((previo) => previo + 1);
    } else {
      enviarYEvaluarEncuesta();
    }
  };

  const retrocederPregunta = () => {
    if (indicePreguntaActual > 0) {
      setIndicePreguntaActual((previo) => previo - 1);
    }
  };

  /**
   * =========================================================================
   * ENVÍO Y EVALUACIÓN CON LA API DE GEMINI (CERO FALSAS ALARMAS)
   * =========================================================================
   */
  const enviarYEvaluarEncuesta = async () => {
    setEnviando(true);

    // Preparar el paquete de respuestas estructurado
    const paqueteRespuestas: RespuestaEmpleado[] = colaPreguntas.map((pregunta) => {
      const respObj = respuestasUsuario[pregunta.id];
      const comentario = comentariosAbiertos[pregunta.id];

      return {
        idPregunta: pregunta.id,
        textoPregunta: pregunta.texto,
        categoria: pregunta.categoria,
        respuestaSeleccionada: respObj ? respObj.seleccion : (comentario || 'Comentario registrado'),
        valorNumerico: respObj ? respObj.valor : undefined,
        comentarioAbierto: comentario,
      };
    });

    try {
      // Invocación al servicio centralizado de Gemini
      const resultado = await evaluarRespuestasConGemini(departamento, paqueteRespuestas);
      setResultadoGemini(resultado);
      setEvaluacionFinalizada(true);
    } catch (error) {
      console.error('Error al evaluar la encuesta con Gemini:', error);
      alert('Ocurrió un error al procesar la encuesta con Gemini.');
    } finally {
      setEnviando(false);
    }
  };

  const reiniciarEncuesta = () => {
    setColaPreguntas([...PREGUNTAS_BASE_INICIALES]);
    setIndicePreguntaActual(0);
    setRespuestasUsuario({});
    setComentariosAbiertos({});
    setResultadoGemini(null);
    setEvaluacionFinalizada(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black py-8 px-4 sm:px-8">
      
      {/* Barra Superior con Botón de Regreso */}
      <div className="max-w-3xl mx-auto flex items-center justify-between border-b border-white/10 pb-4 mb-8">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-xs">
            HC
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Panel de Encuestas Dinámicas</h2>
            <p className="text-[10px] text-neutral-400 font-mono">
              Flujo Condicional & Gemini API Analyzer
            </p>
          </div>
        </div>

        {onVolverALanding && (
          <Boton variante="fantasma" tamano="pequeno" onClick={onVolverALanding}>
            ← Volver al Inicio 3D
          </Boton>
        )}
      </div>

      <div className="max-w-3xl mx-auto">
        
        {/* =================================================================== */}
        {/* CASO A: ENCUESTA EN CURSO (DILIGENCIAMIENTO INTERACTIVO) */}
        {/* =================================================================== */}
        {!evaluacionFinalizada && (
          <Tarjeta
            mostrarVisoresEsquinas={true}
            brilloBorde={true}
            className="space-y-6"
          >
            {/* Barra de Progreso y Departamento */}
            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono">
                  Pregunta {indicePreguntaActual + 1} de {totalPreguntas}
                </span>
                <span className="font-mono font-bold text-white">{porcentajeProgreso}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-white transition-all duration-300"
                  style={{ width: `${porcentajeProgreso}%` }}
                />
              </div>

              {/* Selector de Departamento */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Área Evaluada:</span>
                <input
                  type="text"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className="bg-neutral-900 border border-white/15 px-3 py-1 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-white"
                  title="Puedes cambiar el departamento para simular distintas áreas"
                />
              </div>
            </div>

            {/* Componente Pregunta Interactiva */}
            {preguntaActual && (
              <PreguntaInteractiva
                pregunta={preguntaActual}
                respuestaSeleccionada={respuestasUsuario[preguntaActual.id]?.seleccion}
                comentarioAbierto={comentariosAbiertos[preguntaActual.id] || ''}
                onSeleccionarOpcion={manejarSeleccionOpcion}
                onCambiarComentario={manejarCambioComentario}
              />
            )}

            {/* Botones de Navegación del Cuestionario */}
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <Boton
                variante="secundario"
                disabled={indicePreguntaActual === 0}
                onClick={retrocederPregunta}
              >
                Anterior
              </Boton>

              <Boton
                variante="primario"
                cargando={enviando}
                textoCarga="Analizando con Gemini..."
                disabled={!puedeAvanzar()}
                onClick={avanzarPregunta}
              >
                {indicePreguntaActual === totalPreguntas - 1 ? 'Finalizar y Evaluar' : 'Siguiente'}
              </Boton>
            </div>
          </Tarjeta>
        )}

        {/* =================================================================== */}
        {/* CASO B: RESULTADO DE LA EVALUACIÓN DE GEMINI (CERO FALSAS ALARMAS) */}
        {/* =================================================================== */}
        {evaluacionFinalizada && resultadoGemini && (
          <div className="space-y-6 animate-fadeIn">
            
            <Tarjeta
              titulo="Resultado de la Evaluación Analítica (Gemini API)"
              subtitulo={`Departamento: ${departamento} · Política de Rigor Estricto`}
              mostrarVisoresEsquinas={true}
              brilloBorde={true}
            >
              {/* Tarjeta de Resumen Global */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-3 mb-6 text-left">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Clasificación Global del Clima:
                  </span>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm
                      ${
                        resultadoGemini.clasificacionGlobal === 'Buena'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-red-500/20 border-red-500 text-red-300'
                      }
                    `}
                  >
                    ● {resultadoGemini.clasificacionGlobal}
                  </span>
                </div>

                <p className="text-sm text-neutral-200 leading-relaxed font-normal">
                  {resultadoGemini.resumenEjecutivo}
                </p>

                <div className="flex items-center gap-2 pt-2 text-xs text-neutral-400 font-mono">
                  <span>Total Alertas Activadas:</span>
                  <strong className="text-white bg-black px-2 py-0.5 rounded border border-white/10">
                    {resultadoGemini.totalAlertas}
                  </strong>
                  <span className="text-[11px] text-neutral-500">
                    ({resultadoGemini.hayAlertas ? 'Excepciones Críticas Fundamentadas' : 'Cero Falsas Alarmas'})
                  </span>
                </div>
              </div>

              {/* Listado de Alertas Estructuradas (Objeto Obligatorio de 4 Campos) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-left">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                    Objetos de Alerta Estructurados ({resultadoGemini.alertas.length}):
                  </h4>
                  {resultadoGemini.alertas.length === 0 && (
                    <span className="text-xs text-emerald-400 font-medium">
                      ✓ No se emitieron alertas innecesarias
                    </span>
                  )}
                </div>

                {resultadoGemini.alertas.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-black/40 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
                    <span className="text-2xl block">🎉</span>
                    <p className="font-bold">
                      Criterio de Cero Falsas Alarmas Cumplido con Éxito.
                    </p>
                    <p className="text-neutral-400 text-[11px]">
                      Las respuestas del empleado fueron satisfactorias o constructivas. El sistema
                      mantuvo las alertas inactivas evitando spam o falsos positivos.
                    </p>
                  </div>
                ) : (
                  resultadoGemini.alertas.map((alerta, idx) => (
                    <InsigniaAlerta key={idx} alerta={alerta} indice={idx} />
                  ))
                )}
              </div>

              {/* Botón para volver a probar */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <Boton variante="secundario" onClick={reiniciarEncuesta}>
                  ↻ Probar Otra Respuesta
                </Boton>
                {onVolverALanding && (
                  <Boton variante="primario" onClick={onVolverALanding}>
                    Ir a Portada 3D
                  </Boton>
                )}
              </div>
            </Tarjeta>

          </div>
        )}

      </div>
    </div>
  );
};

export default PanelEncuestas;
