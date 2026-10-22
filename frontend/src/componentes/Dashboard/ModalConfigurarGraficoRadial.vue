<!--
  ============================================================================
  MODAL PERSONALIZAR COLOR DE GRÁFICA DE ESTABILIDAD (ModalConfigurarGraficoRadial.vue)
  - Permite seleccionar el tema de color para la gráfica 3D de Estabilidad.
  ============================================================================
-->

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ModalBase, BotonBase } from '@/componentes/ElementosBase'
import { Palette, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'colorSeleccionado', color: string): void
}>()

const paletasDisponibles = [
  { nombre: 'Azul Eléctrico', hex: '#2563eb', desc: 'Tono corporativo clásico' },
  { nombre: 'Verde Esmeralda', hex: '#059669', desc: 'Tono de salud y equilibrio' },
  { nombre: 'Ámbar Dorado', hex: '#d97706', desc: 'Tono cálido de alta visibilidad' },
  { nombre: 'Púrpura Violeta', hex: '#7c3aed', desc: 'Tono moderno premium' },
  { nombre: 'Cian Ocean', hex: '#0284c7', desc: 'Tono fresco y despejado' }
]

const colorSeleccionadoLocal = ref('#2563eb')
const mensajeExito = ref<string | null>(null)

watch(() => props.abierto, (estaAbierto) => {
  if (estaAbierto) {
    mensajeExito.value = null
  }
})

const seleccionarColor = (hex: string) => {
  colorSeleccionadoLocal.value = hex
}

const guardarConfiguracion = () => {
  emit('colorSeleccionado', colorSeleccionadoLocal.value)
  mensajeExito.value = '¡Color de la gráfica actualizado!'
  setTimeout(() => {
    emit('cerrar')
  }, 400)
}
</script>

<template>
  <ModalBase
    :abierto="abierto"
    titulo="Personalizar Color de Gráfica 3D"
    subtitulo="Selecciona el tema cromático para la sección de Estabilidad de Clima Laboral."
    anchoMaximo="md"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
        <Palette class="w-4 h-4" />
      </div>
    </template>

    <div class="space-y-4 text-left">
      <div v-if="mensajeExito" class="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{{ mensajeExito }}</span>
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400">
        Selecciona el color principal que identificará el sector de <strong>Estabilidad (Sí)</strong> en el pastel 3D:
      </p>

      <!-- Selector de paleta cromática -->
      <div class="space-y-2">
        <button
          v-for="paleta in paletasDisponibles"
          :key="paleta.hex"
          type="button"
          @click="seleccionarColor(paleta.hex)"
          :class="[
            'w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3',
            colorSeleccionadoLocal === paleta.hex
              ? 'bg-slate-100 dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="w-5 h-5 rounded-full shrink-0 shadow-xs" :style="{ backgroundColor: paleta.hex }" />
            <div>
              <span class="text-xs font-bold text-slate-900 dark:text-white block">{{ paleta.nombre }}</span>
              <span class="text-[10px] text-slate-400 font-medium">{{ paleta.desc }}</span>
            </div>
          </div>

          <CheckCircle2 v-if="colorSeleccionadoLocal === paleta.hex" class="w-4 h-4 text-blue-500 shrink-0" />
        </button>
      </div>
    </div>

    <template #pie>
      <div class="w-full flex items-center justify-end gap-2 text-xs">
        <BotonBase variante="secundario" tamano="pequeno" @click="emit('cerrar')">
          Cancelar
        </BotonBase>
        <BotonBase variante="primario" tamano="pequeno" @click="guardarConfiguracion">
          Aplicar Color
        </BotonBase>
      </div>
    </template>
  </ModalBase>
</template>
