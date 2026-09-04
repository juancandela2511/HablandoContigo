<!--
  ============================================================================
  CASILLAS DE ENTRADA DEL PIN DE 6 DÍGITOS (VerificacionCasillasPin.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Gestiona las 6 casillas numéricas individuales de validación de PIN con soporte
  para avance automático al escribir, retroceso con Backspace y evento Pegar (Paste).
  
  ¿CON QUÉ SE CONECTA?
  - ModalVerificacionCorreo.vue (Componente contenedor)
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  digitos: string[]
  deshabilitado?: boolean
}>()

const emit = defineEmits<{
  (e: 'updateDigitos', digitos: string[]): void
  (e: 'completado'): void
}>()

const inputsRefs = ref<(HTMLInputElement | null)[]>([])

const manejarEntrada = (index: number, evento: Event) => {
  const target = evento.target as HTMLInputElement
  const valor = target.value.replace(/\D/g, '')

  if (valor.length > 1) {
    const nuevos = valor.split('').slice(0, 6)
    const copia = [...props.digitos]
    nuevos.forEach((d, i) => {
      copia[i] = d
    })
    emit('updateDigitos', copia)
    const siguiente = Math.min(nuevos.length, 5)
    inputsRefs.value[siguiente]?.focus()
    if (copia.every(d => d !== '')) {
      emit('completado')
    }
    return
  }

  const copia = [...props.digitos]
  copia[index] = valor
  emit('updateDigitos', copia)

  if (valor && index < 5) {
    inputsRefs.value[index + 1]?.focus()
  }

  if (copia.every(d => d !== '')) {
    emit('completado')
  }
}

const manejarBackspace = (index: number, evento: KeyboardEvent) => {
  if (evento.key === 'Backspace' && !props.digitos[index] && index > 0) {
    inputsRefs.value[index - 1]?.focus()
  }
}

const manejarPegado = (evento: ClipboardEvent) => {
  evento.preventDefault()
  const texto = (evento.clipboardData?.getData('text') || '').trim().replace(/\D/g, '')
  if (!texto) return

  const nuevos = texto.slice(0, 6).split('')
  const copia = [...props.digitos]
  nuevos.forEach((d, i) => {
    copia[i] = d
  })
  emit('updateDigitos', copia)

  const siguiente = Math.min(nuevos.length, 5)
  inputsRefs.value[siguiente]?.focus()

  if (copia.every(d => d !== '')) {
    emit('completado')
  }
}

onMounted(() => {
  inputsRefs.value[0]?.focus()
})

defineExpose({
  enfocarPrimero: () => inputsRefs.value[0]?.focus()
})
</script>

<template>
  <div class="flex items-center justify-center gap-2 sm:gap-3 py-2">
    <input
      v-for="(digito, index) in digitos"
      :key="index"
      :ref="el => inputsRefs[index] = el as HTMLInputElement"
      :value="digito"
      type="text"
      inputmode="numeric"
      maxlength="1"
      pattern="[0-9]*"
      :disabled="deshabilitado"
      @input="manejarEntrada(index, $event)"
      @keydown="manejarBackspace(index, $event)"
      @paste="manejarPegado"
      class="w-11 h-13 sm:w-13 sm:h-15 rounded-2xl bg-black/60 border text-center text-xl sm:text-2xl font-black font-mono text-white focus:outline-none transition-all shadow-inner"
      :class="digito ? 'border-sky-500 bg-sky-950/40 text-sky-400 scale-105' : 'border-white/20 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20'"
    />
  </div>
</template>
