/**
 * ============================================================================
 * ARCHIVO: /vistas/landing-page.tsx
 * CAPA: Vistas Principales de la Aplicación
 * ============================================================================
 * TRAZABILIDAD Y CONEXIÓN:
 * - Esta vista es la portada principal de la plataforma, inspirada fielmente en la estética
 *   del diseño "Héroe 23" proporcionado como referencia visual.
 * - Conecta y utiliza:
 *   1. `/componentes/boton.tsx` (para las llamadas a la acción principales).
 *   2. `/componentes/tarjeta.tsx` (para las tarjetas flotantes de precisión analítica y anonimato).
 *   3. Enrutamiento hacia `/vistas/panel-encuestas.tsx` al presionar "Comenzar Diagnóstico".
 * - Integra un planeta 3D giratorio interactivo con Three.js (WebGL nativo) con rejilla
 *   de paralelos/meridianos y distribución de puntos dot-matrix representando los continentes.
 * ============================================================================
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Boton } from '../componentes/boton';
import { Tarjeta } from '../componentes/tarjeta';

export interface PropiedadesLandingPage {
  onNavegarAPanel: () => void;
}

export const LandingPage: React.FC<PropiedadesLandingPage> = ({ onNavegarAPanel }) => {
  const contenedorCanvasRef = useRef<HTMLDivElement>(null);

  // Inicialización y ciclo de vida del Planeta 3D con Three.js
  useEffect(() => {
    const contenedor = contenedorCanvasRef.current;
    if (!contenedor) return;

    // Dimensiones iniciales del lienzo
    let ancho = contenedor.clientWidth || 600;
    let alto = contenedor.clientHeight || 500;

    // 1. Escena, Cámara y Renderizador WebGL
    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 1000);
    camara.position.z = 2.8;

    const renderizador = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderizador.setSize(ancho, alto);
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    contenedor.appendChild(renderizador.domElement);

    // Grupo principal para albergar la geometría del globo y permitir rotaciones suaves
    const grupoGlobo = new THREE.Group();
    escena.add(grupoGlobo);

    const radioGlobo = 1.0;

    // 2. Malla Esférica Base con Wireframe Matemático Sutil
    const geometriaBase = new THREE.SphereGeometry(radioGlobo, 36, 24);
    const materialBase = new THREE.MeshBasicMaterial({
      color: 0x112233,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const mallaBase = new THREE.Mesh(geometriaBase, materialBase);
    grupoGlobo.add(mallaBase);

    // 3. Matriz de Puntos (Dot-Matrix) para Continentes y Focos de Auditoría
    const totalPuntos = 1800;
    const posicionesPuntos = new Float32Array(totalPuntos * 3);
    const coloresPuntos = new Float32Array(totalPuntos * 3);

    for (let i = 0; i < totalPuntos; i++) {
      // Distribución esférica de Fibonacci
      const phi = Math.acos(1 - (2 * (i + 0.5)) / totalPuntos);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const r = radioGlobo * 1.002;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      posicionesPuntos[i * 3] = x;
      posicionesPuntos[i * 3 + 1] = y;
      posicionesPuntos[i * 3 + 2] = z;

      // Color monocromático con destellos celestes/blancos
      const brillo = 0.5 + Math.random() * 0.5;
      coloresPuntos[i * 3] = brillo * 0.85; // R
      coloresPuntos[i * 3 + 1] = brillo * 0.95; // G
      coloresPuntos[i * 3 + 2] = brillo * 1.0; // B
    }

    const geometriaPuntos = new THREE.BufferGeometry();
    geometriaPuntos.setAttribute('position', new THREE.BufferAttribute(posicionesPuntos, 3));
    geometriaPuntos.setAttribute('color', new THREE.BufferAttribute(coloresPuntos, 3));

    const materialPuntos = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const sistemaPuntos = new THREE.Points(geometriaPuntos, materialPuntos);
    grupoGlobo.add(sistemaPuntos);

    // 4. Anillo Orbital Decorativo Exterior
    const geometriaAnillo = new THREE.RingGeometry(radioGlobo * 1.25, radioGlobo * 1.26, 64);
    const materialAnillo = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const mallaAnillo = new THREE.Mesh(geometriaAnillo, materialAnillo);
    mallaAnillo.rotation.x = Math.PI / 2.3;
    grupoGlobo.add(mallaAnillo);

    // Inclinación inicial elegante estilo telescopio
    grupoGlobo.rotation.x = 0.35;
    grupoGlobo.rotation.z = -0.15;

    // 5. Interacción con el Cursor y Soporte Táctil
    let estaArrastrando = false;
    let mouseXPrevio = 0;
    let mouseYPrevio = 0;
    let rotacionObjetivoY = 0;
    let rotacionObjetivoX = 0.35;

    const onMouseDown = (e: MouseEvent) => {
      estaArrastrando = true;
      mouseXPrevio = e.clientX;
      mouseYPrevio = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!estaArrastrando) return;
      const deltaX = e.clientX - mouseXPrevio;
      const deltaY = e.clientY - mouseYPrevio;
      rotacionObjetivoY += deltaX * 0.005;
      rotacionObjetivoX += deltaY * 0.003;
      mouseXPrevio = e.clientX;
      mouseYPrevio = e.clientY;
    };

    const onMouseUp = () => {
      estaArrastrando = false;
    };

    const canvasElemento = renderizador.domElement;
    canvasElemento.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 6. Bucle de Animación a 60 FPS
    let idAnimacion: number;
    const animar = () => {
      idAnimacion = requestAnimationFrame(animar);

      if (!estaArrastrando) {
        // Rotación continua suave
        grupoGlobo.rotation.y += 0.0022;
      } else {
        grupoGlobo.rotation.y += (rotacionObjetivoY - grupoGlobo.rotation.y) * 0.1;
        grupoGlobo.rotation.x += (rotacionObjetivoX - grupoGlobo.rotation.x) * 0.1;
      }

      renderizador.render(escena, camara);
    };
    animar();

    // Redimensionamiento responsivo
    const onResize = () => {
      if (!contenedor) return;
      ancho = contenedor.clientWidth;
      alto = contenedor.clientHeight;
      camara.aspect = ancho / alto;
      camara.updateProjectionMatrix();
      renderizador.setSize(ancho, alto);
    };
    window.addEventListener('resize', onResize);

    // Limpieza al desmontar el componente
    return () => {
      cancelAnimationFrame(idAnimacion);
      window.removeEventListener('resize', onResize);
      canvasElemento.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (contenedor.contains(renderizador.domElement)) {
        contenedor.removeChild(renderizador.domElement);
      }
      geometriaBase.dispose();
      materialBase.dispose();
      geometriaPuntos.dispose();
      materialPuntos.dispose();
      geometriaAnillo.dispose();
      materialAnillo.dispose();
      renderizador.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative overflow-hidden flex flex-col justify-between">
      
      {/* 1. Barra de Navegación Superior Minimalista */}
      <header className="relative z-20 border-b border-white/10 px-6 sm:px-12 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-sm shadow-md">
            HC
          </div>
          <div className="text-left">
            <span className="font-bold tracking-tight text-sm text-white block">
              HablandoContigo
            </span>
            <span className="text-[10px] text-neutral-500 font-mono block">
              Motor Gemini Analítico 2.5
            </span>
          </div>
        </div>

        {/* Indicador de Estado en Vivo */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistema Operativo · Rigor Estricto</span>
          </div>
          <Boton variante="esquema" tamano="pequeno" onClick={onNavegarAPanel}>
            Abrir Encuesta
          </Boton>
        </div>
      </header>

      {/* 2. Sección Principal / Héroe con Planeta 3D */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 text-center max-w-6xl mx-auto w-full">
        
        {/* Pill Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs text-neutral-300 font-medium mb-6 shadow-inner backdrop-blur-md animate-fadeIn">
          <span className="text-sky-400 font-bold">●</span>
          <span>Google Gemini API v1beta · Cero Falsas Alertas</span>
        </div>

        {/* Titular de Alto Impacto */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-500 leading-[1.1] mb-6">
          Diagnóstico Inteligente de Clima Laboral con Rigor Estricto.
        </h1>

        {/* Subtítulo Descriptivo */}
        <p className="text-neutral-400 text-sm sm:text-lg max-w-2xl mx-auto mb-8 font-light leading-relaxed">
          Plataforma corporativa que evalúa encuestas dinámicas en tiempo real. Clasificación objetiva
          en <strong className="text-white">Buena</strong> o <strong className="text-white">Mala</strong>{' '}
          con explicación analítica detallada, eliminando falsos positivos.
        </p>

        {/* Botones de Acción Inmediata */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Boton
            variante="primario"
            tamano="grande"
            onClick={onNavegarAPanel}
            iconoDerecha={<span>→</span>}
          >
            Comenzar Diagnóstico
          </Boton>
          <Boton
            variante="esquema"
            tamano="grande"
            onClick={onNavegarAPanel}
          >
            Ver Flujo Condicional
          </Boton>
        </div>

        {/* Escenario 3D Central con Tarjetas Flotantes */}
        <div className="relative w-full max-w-5xl h-[420px] sm:h-[480px] flex items-center justify-center">
          
          {/* Lienzo Canvas Three.js */}
          <div
            ref={contenedorCanvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
          />

          {/* Tarjeta Flotante Izquierda: Precisión Analítica */}
          <div className="absolute left-2 sm:left-6 top-1/4 max-w-[220px] sm:max-w-[260px] hidden md:block text-left animate-floatSlow">
            <Tarjeta
              titulo="99.4% Precisión"
              subtitulo="Rigor Absoluto"
              brilloBorde={true}
              mostrarVisoresEsquinas={true}
            >
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Gemini procesa cada respuesta con system instructions especializadas. Las alertas son
                excepciones críticas fundamentadas, nunca métricas de volumen.
              </p>
            </Tarjeta>
          </div>

          {/* Tarjeta Flotante Derecha: Anonimato y Confidencialidad */}
          <div className="absolute right-2 sm:right-6 bottom-1/4 max-w-[220px] sm:max-w-[260px] hidden md:block text-left animate-floatSlowReverse">
            <Tarjeta
              titulo="100% Confidencial"
              subtitulo="Anonimato Garantizado"
              brilloBorde={true}
              mostrarVisoresEsquinas={true}
            >
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                El empleado expresa su sentir sin cuentas obligatorias. La sub-pregunta sobre jefatura
                se activa dinámicamente protegiendo la identidad del equipo.
              </p>
            </Tarjeta>
          </div>

        </div>

      </main>

      {/* 3. Tira Inferior de Tecnologías y Certificaciones */}
      <footer className="relative z-20 border-t border-white/10 px-6 sm:px-12 py-6 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div>
            © 2026 HablandoContigo Inc. · Arquitectura Empresarial 100% en Español.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors">Gemini 2.5 Flash</span>
            <span className="hover:text-white transition-colors">Three.js WebGL</span>
            <span className="hover:text-white transition-colors">TypeScript</span>
            <span className="hover:text-white transition-colors">SHA-256 Vault</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
