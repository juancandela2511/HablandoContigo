<!--
  ============================================================================
  COMPONENTE DE FONDO 3D CON PARTÍCULAS, ÓRBITAS Y GLOBO THREE.JS (Fondo.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Este componente orquesta el fondo tridimensional envolvente de la aplicación.
  Combina 5 capas tecnológicas:
  1. Luces volumétricas ambientales de profundidad.
  2. Malla cibernética en perspectiva (`radial-gradient`).
  3. Anillos orbitales giratorios en CSS 3D.
  4. Red neuronal de partículas interconectadas en Canvas 2D interactivo.
  5. Globo terráqueo 3D interactivo en Three.js con geolocalización de puntos de datos.
  
  ¿PARA QUÉ SIRVE?
  - Proveer la atmósfera espacial y futurista de HablandoContigo en la página de inicio.
  - Ofrecer una experiencia táctil donde las partículas y el globo responden fluidamente.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - HeroPrincipal.vue: Renderiza este fondo debajo de todos los elementos interactivos.
  - Globe.vue: Componente Three.js que renderiza la esfera terrestre en puntos.
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GloboComponente from '@/vistas/Inicio/Globe.vue'

/** Referencia al elemento canvas de partículas */
const canvasRef = ref<HTMLCanvasElement | null>(null)
let idAnimacion: number | null = null

/**
 * Estructura de una partícula 3D en el espacio
 */
interface Particula3D {
  x: number
  y: number
  z: number
  velocidadX: number
  velocidadY: number
  radio: number
  color: string
  alfa: number
}

const particulas: Particula3D[] = []
const CANTIDAD_PARTICULAS = 45

/**
 * Inicializa el conjunto de partículas con posiciones y velocidades aleatorias
 */
const inicializarParticulas = (ancho: number, alto: number) => {
  particulas.length = 0
  const paletaColores = ['#38bdf8', '#818cf8', '#34d399', '#60a5fa', '#a78bfa']
  
  for (let i = 0; i < CANTIDAD_PARTICULAS; i++) {
    particulas.push({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      z: Math.random() * 2 + 0.5,
      velocidadX: (Math.random() - 0.5) * 0.4,
      velocidadY: (Math.random() - 0.5) * 0.4,
      radio: Math.random() * 2 + 1,
      color: paletaColores[Math.floor(Math.random() * paletaColores.length)] || '#38bdf8',
      alfa: Math.random() * 0.6 + 0.2
    })
  }
}

/**
 * Bucle de renderizado del canvas con conexiones de red neuronal
 */
const renderizarLienzo = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const contexto = canvas.getContext('2d')
  if (!contexto) return

  contexto.clearRect(0, 0, canvas.width, canvas.height)

  // Actualizar posiciones y trazar líneas entre partículas cercanas
  for (let i = 0; i < particulas.length; i++) {
    const p1 = particulas[i]
    if (!p1) continue

    // Movimiento con factor de profundidad Z
    p1.x += p1.velocidadX * p1.z
    p1.y += p1.velocidadY * p1.z

    // Rebote toroidal en los bordes de la pantalla
    if (p1.x < 0) p1.x = canvas.width
    if (p1.x > canvas.width) p1.x = 0
    if (p1.y < 0) p1.y = canvas.height
    if (p1.y > canvas.height) p1.y = 0

    // Conectar nodos cercanos con efecto de red neuronal
    for (let j = i + 1; j < particulas.length; j++) {
      const p2 = particulas[j]
      if (!p2) continue
      const distanciaX = p1.x - p2.x
      const distanciaY = p1.y - p2.y
      const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY)

      if (distancia < 130) {
        contexto.beginPath()
        contexto.strokeStyle = `rgba(56, 189, 248, ${0.18 * (1 - distancia / 130)})`
        contexto.lineWidth = 0.8
        contexto.moveTo(p1.x, p1.y)
        contexto.lineTo(p2.x, p2.y)
        contexto.stroke()
      }
    }

    // Dibujar nodo con aura de resplandor 3D
    contexto.beginPath()
    contexto.arc(p1.x, p1.y, p1.radio * p1.z, 0, Math.PI * 2)
    contexto.fillStyle = p1.color
    contexto.globalAlpha = p1.alfa
    contexto.shadowBlur = 8
    contexto.shadowColor = p1.color
    contexto.fill()
    contexto.shadowBlur = 0
    contexto.globalAlpha = 1
  }

  idAnimacion = requestAnimationFrame(renderizarLienzo)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    inicializarParticulas(canvas.width, canvas.height)
    renderizarLienzo()

    const manejarRedimension = () => {
      if (canvasRef.value) {
        canvasRef.value.width = window.innerWidth
        canvasRef.value.height = window.innerHeight
        inicializarParticulas(canvasRef.value.width, canvasRef.value.height)
      }
    }
    window.addEventListener('resize', manejarRedimension)
  }
})

onUnmounted(() => {
  if (idAnimacion !== null) {
    cancelAnimationFrame(idAnimacion)
  }
})
</script>

<template>
  <!-- Contenedor general 3D con atmósfera espacial profunda -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center z-0 bg-[#0523c9] dark:bg-[#214bad]">
    
    <!-- Capa 1: Luces Ambientales Volumétricas 3D -->
    <div class="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 via-sky-500/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
    <div class="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-600/20 via-teal-500/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[140px] pointer-events-none"></div>

    <!-- Capa 2: Grid 3D en perspectiva de suelo cibernético -->
    <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none"></div>

    <!-- Capa 3: Anillos Orbitales Holográficos 3D -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-sky-500/20 pointer-events-none animate-spin-orbit opacity-40">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_12px_#38bdf8]"></div>
    </div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-indigo-500/15 pointer-events-none animate-spin-reverse opacity-30">
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]"></div>
    </div>

    <!-- Capa 4: Canvas de Partículas 3D con Conexiones Neuronales -->
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70"></canvas>

    <!-- Capa 5: Contenedor del Globo 3D Interactivo de Three.js -->
    <div class="relative w-full max-w-6xl h-[620px] sm:h-[780px] opacity-85 pointer-events-auto flex items-center justify-center z-10">
      <GloboComponente 
        :direction="'left'"
        :scale="8.5"
        :fill="'dots'"
        :ocean-color="'#030712'"
        :outline-color="'#38bdf8'"
        :graticule-color="'#1e293b'"
        :dot-color="'#94a3b8'"
        :marker-color="'#38bdf8'"
        :speed="2.2"
        :smoothing="8.5"
        class="w-full h-full drop-shadow-[0_0_40px_rgba(56,189,248,0.25)]"
      />
      
      <!-- Degradado radial suave para fundir los bordes -->
      <div class="absolute inset-0 bg-radial from-transparent via-transparent to-[#070b14]/90 pointer-events-none"></div>
    </div>

  </div>
</template>

<style scoped>
@keyframes spin-orbit {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes spin-reverse {
  from {
    transform: translate(-50%, -50%) rotate(360deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(0deg);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.35;
    transform: scale(1.08);
  }
}

.animate-spin-orbit {
  animation: spin-orbit 35s linear infinite;
}

.animate-spin-reverse {
  animation: spin-reverse 50s linear infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}
</style>