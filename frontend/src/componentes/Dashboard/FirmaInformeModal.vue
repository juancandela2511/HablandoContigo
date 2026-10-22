<!--
  Propósito: capturar una firma manuscrita antes de autorizar una exportación.
  Conexiones: `ModalExportarInforme.vue` abre el modal y recibe la imagen PNG
  mediante el evento `confirmar`; no realiza llamadas remotas.
-->
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Check, Eraser, X } from 'lucide-vue-next'

const props = defineProps<{ abierto: boolean }>()
const emit = defineEmits<{
  (evento: 'cerrar'): void
  (evento: 'confirmar', firmaDataUrl: string): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const dibujando = ref(false)
const tieneTrazo = ref(false)

function prepararCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  canvas.width = rect.width * ratio
  canvas.height = rect.height * ratio
  const contexto = canvas.getContext('2d')
  if (!contexto) return
  contexto.scale(ratio, ratio)
  contexto.lineWidth = 2
  contexto.lineCap = 'round'
  contexto.strokeStyle = '#0f172a'
  contexto.fillStyle = '#ffffff'
  contexto.fillRect(0, 0, rect.width, rect.height)
}

function punto(evento: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  return { x: evento.clientX - rect.left, y: evento.clientY - rect.top }
}

function comenzar(evento: PointerEvent) {
  const canvas = canvasRef.value
  const contexto = canvas?.getContext('2d')
  const posicion = punto(evento)
  if (!contexto || !posicion) return
  canvas?.setPointerCapture(evento.pointerId)
  contexto.beginPath()
  contexto.moveTo(posicion.x, posicion.y)
  dibujando.value = true
  tieneTrazo.value = true
}

function dibujar(evento: PointerEvent) {
  if (!dibujando.value) return
  const contexto = canvasRef.value?.getContext('2d')
  const posicion = punto(evento)
  if (!contexto || !posicion) return
  contexto.lineTo(posicion.x, posicion.y)
  contexto.stroke()
}

function terminar() {
  dibujando.value = false
}

function limpiar() {
  prepararCanvas()
  tieneTrazo.value = false
}

function confirmar() {
  try {
    const canvas = canvasRef.value
    if (!canvas || !tieneTrazo.value) return
    emit('confirmar', canvas.toDataURL('image/png'))
  } catch (error) {
    console.warn('[FirmaInformeModal] No se pudo serializar la firma:', error)
  }
}

watch(() => props.abierto, async abierto => {
  if (!abierto) return
  await nextTick()
  prepararCanvas()
  tieneTrazo.value = false
})
</script>

<template>
  <div v-if="abierto" class="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/70 p-4" @click.self="emit('cerrar')">
    <section class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
      <header class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Firma del informe</h2>
          <p class="mt-1 text-xs text-slate-500">Dibuja tu firma para incorporarla al documento exportado.</p>
        </div>
        <button type="button" title="Cerrar" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" @click="emit('cerrar')"><X class="h-4 w-4" /></button>
      </header>
      <canvas ref="canvasRef" class="h-40 w-full touch-none rounded-xl border border-dashed border-slate-300 bg-white" @pointerdown="comenzar" @pointermove="dibujar" @pointerup="terminar" @pointerleave="terminar" />
      <footer class="mt-4 flex justify-end gap-2">
        <button type="button" class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm" @click="limpiar"><Eraser class="h-4 w-4" />Limpiar</button>
        <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40" :disabled="!tieneTrazo" @click="confirmar"><Check class="h-4 w-4" />Continuar</button>
      </footer>
    </section>
  </div>
</template>
