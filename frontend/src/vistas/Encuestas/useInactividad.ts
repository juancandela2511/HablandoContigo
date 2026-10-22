import { ref, onUnmounted } from 'vue'

export function useInactividad(limiteSegundos = 15) {
  const segundosSinActividad = ref(0)
  const inactividadModalAbierto = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const reproducirSonido = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
    if (navigator?.vibrate) navigator.vibrate([200, 100, 200, 100, 300])
  }

  const registrarActividad = () => {
    if (!inactividadModalAbierto.value) segundosSinActividad.value = 0
  }

  const reiniciarTimer = (activo = true) => {
    if (timer) clearInterval(timer)
    segundosSinActividad.value = 0
    if (!activo) return
    timer = setInterval(() => {
      segundosSinActividad.value++
      if (segundosSinActividad.value >= limiteSegundos && !inactividadModalAbierto.value) {
        inactividadModalAbierto.value = true
        reproducirSonido()
      }
    }, 1000)
  }

  const reanudar = () => {
    inactividadModalAbierto.value = false
    segundosSinActividad.value = 0
    reproducirSonido()
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    segundosSinActividad,
    inactividadModalAbierto,
    registrarActividad,
    reiniciarTimer,
    reanudar
  }
}
