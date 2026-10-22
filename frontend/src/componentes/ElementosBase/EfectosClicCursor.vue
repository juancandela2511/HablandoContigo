<!--
  ============================================================================
  COMPONENTE DE EFECTOS DE CLIC CANVAS (EfectosClicCursor.vue)
  ============================================================================
  Motor de animación de lienzo Canvas en 60fps con 7 modos de interacción
  seleccionables al hacer clic en cualquier parte de la pantalla:
  1. anillos (Rings): Anillos concéntricos expansivos.
  2. rafaga (Burst): Destellos y rayos radiales cinéticos.
  3. particulas / punticos: Destellos y trazos radiales redondeados.
  4. mira (Crosshair): Retícula HUD de precisión con rotación.
  5. ondulado (Wavy Ripple): Olas de choque con distorsión senoidal.
  6. francotirador (Sniper): Scope de francotirador con mira telescópica y pulso.
  
  CARACTERÍSTICA DE COLOR OPUESTO REFLEJADO (High Contrast Inversion):
  - Aplica `mix-blend-mode: difference` y cálculo de color RGB invertido 
    según el elemento y fondo sobre el que se hace clic (`document.elementFromPoint`),
    garantizando que las líneas y chispitas SIEMPRE tengan el color totalmente 
    contrario al fondo cliqueado para un contraste y resalte deslumbrante.
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export type ModoInteraccionClic =
  | 'anillos'
  | 'rafaga'
  | 'particulas'
  | 'mira'
  | 'ondulado'
  | 'francotirador'
  | 'punticos'

const props = withDefaults(
  defineProps<{
    modoInteraccion?: ModoInteraccionClic
    anchoTrazo?: number
    tamanoEfecto?: number
    color?: string
    duracion?: number
    rotacion?: number
    mostrarEtiqueta?: boolean
    textoEtiqueta?: string
    colorEtiqueta?: string
  }>(),
  {
    modoInteraccion: 'punticos',
    anchoTrazo: 2.5,
    tamanoEfecto: 45,
    color: '#FFFFFF',
    duracion: 0.35,
    rotacion: 0,
    mostrarEtiqueta: false,
    textoEtiqueta: 'Haz clic en cualquier lugar',
    colorEtiqueta: '#FFFFFF'
  }
)

interface EfectoInstancia {
  id: number
  x: number
  y: number
  inicioMs: number
  duracionMs: number
  colorInverso: string
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const efectosActivos = ref<EfectoInstancia[]>([])
let animFrameId: number | null = null

const ajustarTamanoCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
}

/**
 * Obtiene el color exacto opuesto (RGB Invertido) del fondo sobre el que se hace clic
 */
const obtenerColorInversoFondo = (x: number, y: number): string => {
  try {
    let el = document.elementFromPoint(x, y)
    while (el && el !== document.body && el !== document.documentElement) {
      const bg = window.getComputedStyle(el).backgroundColor
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        const match = bg.match(/\d+/g)
        if (match && match[0] && match[1] && match[2]) {
          const r = parseInt(match[0], 10)
          const g = parseInt(match[1], 10)
          const b = parseInt(match[2], 10)
          // Invertir RGB para asegurar el máximo contraste opuesto
          return `rgb(${255 - r}, ${255 - g}, ${255 - b})`
        }
      }
      el = el.parentElement
    }
  } catch {
    // Si no se logra determinar el fondo exacto, retornar blanco (que en mix-blend-difference invierte perfectamente)
  }
  return '#FFFFFF'
}

const manejarClicGlobal = (e: MouseEvent) => {
  const durMs = Math.max(100, Math.round(props.duracion * 1000))
  const colorInverso = obtenerColorInversoFondo(e.clientX, e.clientY)

  const nuevoEfecto: EfectoInstancia = {
    id: Date.now() + Math.random(),
    x: e.clientX,
    y: e.clientY,
    inicioMs: performance.now(),
    duracionMs: durMs,
    colorInverso
  }
  efectosActivos.value.push(nuevoEfecto)
  if (!animFrameId) {
    animFrameId = requestAnimationFrame(bucleRenderizado)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR DE RENDERIZADO DE LOS MODOS DE CLIC CON COLOR INVERTIDO DE ALTO CONTRASTE
// ─────────────────────────────────────────────────────────────────────────────
const bucleRenderizado = (timestampMs: number) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  const vigentes: EfectoInstancia[] = []

  for (const ef of efectosActivos.value) {
    const transcurrido = timestampMs - ef.inicioMs
    const t = Math.min(1, Math.max(0, transcurrido / ef.duracionMs))

    dibujarModo(ctx, ef.x, ef.y, t, ef.colorInverso)

    if (t < 1) {
      vigentes.push(ef)
    }
  }

  efectosActivos.value = vigentes

  if (vigentes.length > 0) {
    animFrameId = requestAnimationFrame(bucleRenderizado)
  } else {
    animFrameId = null
  }
}

const dibujarModo = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  t: number,
  colorInverso: string
) => {
  const radioMax = props.tamanoEfecto
  const strokeW = props.anchoTrazo
  // Si el usuario especificó un color fijo distinto de blanco, usar ese; si no, usar el color opuesto detectado
  const col = props.color && props.color !== '#FFFFFF' ? props.color : colorInverso
  const rotRad = (props.rotacion * Math.PI) / 180
  const alfa = Math.max(0, 1 - t)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotRad)
  ctx.lineWidth = strokeW
  ctx.strokeStyle = col
  ctx.fillStyle = col

  // 1. MODO ANILLOS
  if (props.modoInteraccion === 'anillos') {
    const r1 = t * radioMax
    ctx.globalAlpha = alfa
    ctx.beginPath()
    ctx.arc(0, 0, r1, 0, Math.PI * 2)
    ctx.stroke()

    if (t > 0.2) {
      const t2 = (t - 0.2) / 0.8
      const r2 = t2 * radioMax
      ctx.globalAlpha = Math.max(0, 1 - t2)
      ctx.beginPath()
      ctx.arc(0, 0, r2, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // 2. MODO RÁFAGA / EXPLOSIÓN
  else if (props.modoInteraccion === 'rafaga') {
    const numRayos = 10
    const d1 = t * radioMax * 0.25
    const d2 = t * radioMax
    ctx.globalAlpha = alfa

    for (let i = 0; i < numRayos; i++) {
      const ang = (i * Math.PI * 2) / numRayos
      const x1 = Math.cos(ang) * d1
      const y1 = Math.sin(ang) * d1
      const x2 = Math.cos(ang) * d2
      const y2 = Math.sin(ang) * d2

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }

  // 3. MODO PARTICULAS / PUNTICOS (Destellos y trazos radiales redondeados)
  else if (props.modoInteraccion === 'particulas' || props.modoInteraccion === 'punticos') {
    const numPuntos = 8
    const distBase = 6 + t * radioMax * 0.45
    const largoDash = (1 - t * 0.4) * 6 + 2
    const grosor = Math.max(1.8, strokeW * (1 - t * 0.25))

    ctx.globalAlpha = alfa
    ctx.lineCap = 'round'
    ctx.lineWidth = grosor

    for (let i = 0; i < numPuntos; i++) {
      const ang = (i * Math.PI * 2) / numPuntos - Math.PI / 2
      const x1 = Math.cos(ang) * distBase
      const y1 = Math.sin(ang) * distBase
      const x2 = Math.cos(ang) * (distBase + largoDash)
      const y2 = Math.sin(ang) * (distBase + largoDash)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // Pequeño pulso central reluciente de inicio
    if (t < 0.25) {
      const alphaCentro = (1 - t / 0.25) * alfa * 0.7
      ctx.globalAlpha = alphaCentro
      ctx.beginPath()
      ctx.arc(0, 0, 2.5 * (1 - t / 0.25), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 4. MODO MIRA (HUD CROSSHAIR)
  else if (props.modoInteraccion === 'mira') {
    const angRot = t * (Math.PI / 2)
    ctx.rotate(angRot)
    ctx.globalAlpha = alfa

    const rMira = radioMax * 0.5 * (0.5 + 0.5 * Math.sin(t * Math.PI))
    ctx.beginPath()
    ctx.arc(0, 0, rMira, 0, Math.PI * 2)
    ctx.stroke()

    // 4 Líneas de mira en cruz
    const largo = 12
    const distM = rMira + 4
    ctx.beginPath()
    ctx.moveTo(0, -distM); ctx.lineTo(0, -distM - largo)
    ctx.moveTo(0, distM); ctx.lineTo(0, distM + largo)
    ctx.moveTo(-distM, 0); ctx.lineTo(-distM - largo, 0)
    ctx.moveTo(distM, 0); ctx.lineTo(distM + largo, 0)
    ctx.stroke()
  }

  // 5. MODO ONDULADO (WAVY RIPPLE)
  else if (props.modoInteraccion === 'ondulado') {
    const rBase = t * radioMax
    const numPuntos = 36
    ctx.globalAlpha = alfa

    ctx.beginPath()
    for (let i = 0; i <= numPuntos; i++) {
      const ang = (i * Math.PI * 2) / numPuntos
      const dist = rBase + Math.sin(ang * 6 + t * 12) * 5
      const px = Math.cos(ang) * dist
      const py = Math.sin(ang) * dist
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // 6. MODO FRANCOTIRADOR (SNIPER SCOPE)
  else if (props.modoInteraccion === 'francotirador') {
    ctx.globalAlpha = alfa
    const rScope = radioMax * 0.55

    // Circulo principal del scope
    ctx.beginPath()
    ctx.arc(0, 0, rScope, 0, Math.PI * 2)
    ctx.stroke()

    // Círculo secundario interno
    ctx.beginPath()
    ctx.arc(0, 0, rScope * 0.4, 0, Math.PI * 2)
    ctx.stroke()

    // Pulso central de impacto
    const rPulso = t * radioMax
    ctx.globalAlpha = alfa * 0.6
    ctx.beginPath()
    ctx.arc(0, 0, rPulso, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = alfa

    // Líneas cruzadas de francotirador (convergentes)
    const gapC = 8 * (1 - t)
    const largoF = rScope * 1.3

    ctx.beginPath()
    // Arriba
    ctx.moveTo(0, -gapC); ctx.lineTo(0, -largoF)
    // Abajo
    ctx.moveTo(0, gapC); ctx.lineTo(0, largoF)
    // Izquierda
    ctx.moveTo(-gapC, 0); ctx.lineTo(-largoF, 0)
    // Derecha
    ctx.moveTo(gapC, 0); ctx.lineTo(largoF, 0)
    ctx.stroke()

    // Punto central de disparo
    ctx.beginPath()
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    ajustarTamanoCanvas()
    window.addEventListener('resize', ajustarTamanoCanvas, { passive: true })
    window.addEventListener('click', manejarClicGlobal, { passive: true })
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', ajustarTamanoCanvas)
    window.removeEventListener('click', manejarClicGlobal)
    if (animFrameId) cancelAnimationFrame(animFrameId)
  }
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
    <!-- El lienzo Canvas usa mix-blend-mode: difference para lograr inversión de color respecto al fondo -->
    <canvas
      ref="canvasRef"
      class="w-full h-full block pointer-events-none mix-blend-difference"
    />

    <!-- Etiqueta opcional de llamada a la acción ("Haz clic en cualquier lugar") -->
    <div
      v-if="mostrarEtiqueta"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold font-mono uppercase tracking-widest shadow-xl animate-pulse"
      :style="{ color: colorEtiqueta }"
    >
      {{ textoEtiqueta }}
    </div>
  </div>
</template>

