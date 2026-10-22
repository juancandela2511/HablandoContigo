import { ref, computed, onUnmounted } from 'vue'
import type { PreguntaEncuesta } from '@/ia'

export function useCronometroPregunta() {
  const TIEMPO_MINIMO_CERRADA = 4
  const TIEMPO_MINIMO_ABIERTA = 8

  const tiempoInicioGlobal = ref(Date.now())
  const tiempoInicioPregunta = ref(Date.now())
  const segundosTranscurridos = ref(0)
  const tiemposPorPregunta = ref<Record<string, number>>({})
  const preguntasApresuradasCount = ref(0)

  let timer: ReturnType<typeof setInterval> | null = null

  const reiniciarCronometro = () => {
    if (timer) clearInterval(timer)
    tiempoInicioPregunta.value = Date.now()
    segundosTranscurridos.value = 0
    timer = setInterval(() => { segundosTranscurridos.value++ }, 1000)
  }

  const calcularTiempoMinimoRequerido = (pregunta?: PreguntaEncuesta) => {
    return pregunta?.tipo === 'texto' ? TIEMPO_MINIMO_ABIERTA : TIEMPO_MINIMO_CERRADA
  }

  const registrarDuracion = (idPregunta: string, tiempoMinimo: number) => {
    const duracion = Math.round((Date.now() - tiempoInicioPregunta.value) / 1000)
    tiemposPorPregunta.value[idPregunta] = duracion
    if (duracion < tiempoMinimo) preguntasApresuradasCount.value++
    return duracion
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    tiempoInicioGlobal,
    tiempoInicioPregunta,
    segundosTranscurridos,
    tiemposPorPregunta,
    preguntasApresuradasCount,
    reiniciarCronometro,
    calcularTiempoMinimoRequerido,
    registrarDuracion
  }
}
