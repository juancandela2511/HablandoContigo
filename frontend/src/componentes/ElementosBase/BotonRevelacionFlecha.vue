<!--
  ============================================================================
  COMPONENTE BOTÓN DE REVELACIÓN DE FLECHA ORIGINKIT (BotonRevelacionFlecha.vue)
  ============================================================================
  Implementación nativa Vue 3 del componente Arrow Reveal Button con física fluida,
  cálculo adaptativo anti-fallos en renders dinámicos y sacudida al estar deshabilitado.
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Loader2, Lock } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    etiqueta?: string
    colorFondo?: string
    colorTexto?: string
    colorInsignia?: string
    colorIcono?: string
    deshabilitado?: boolean
    cargando?: boolean
    enlace?: string
    nuevaPestana?: boolean
    anguloReposo?: number
    anguloHover?: number
    clase?: string
    resaltarActivo?: boolean
  }>(),
  {
    etiqueta: 'SIGUIENTE',
    colorFondo: '#FFFFFF',
    colorTexto: '#000000',
    colorInsignia: '#3600FF',
    colorIcono: '#FFFFFF',
    deshabilitado: false,
    cargando: false,
    nuevaPestana: true,
    anguloReposo: 0,
    anguloHover: 0,
    clase: '',
    resaltarActivo: true
  }
)

const emit = defineEmits<{
  (e: 'click', evento: MouseEvent): void
  (e: 'clickDeshabilitado', evento: MouseEvent): void
}>()

const buttonRef = ref<HTMLElement | null>(null)
const slotRef = ref<HTMLElement | null>(null)

const isHovered = ref(false)
const sacudiendo = ref(false)
const hoverScale = ref(12)
const hoverX = ref(60)
const badgeLeft = ref(27)
const badgeTop = ref(27)
const badgeSizePx = ref(42)
const arrowSizePx = ref(20)

const medirYCalcular = () => {
  const btn = buttonRef.value
  const slot = slotRef.value
  if (!btn) return

  // Acotar ancho y alto máximos para evitar bucles de crecimiento infinito
  const w = Math.min(Math.max(btn.offsetWidth || 190, 120), 320)
  const h = Math.min(Math.max(btn.offsetHeight || 54, 40), 60)

  const inset = 6
  const badgeSize = Math.min(Math.max(32, h - inset * 2), 48)
  badgeSizePx.value = badgeSize
  arrowSizePx.value = Math.round(badgeSize * 0.45)

  const rb = badgeSize / 2
  const slotLeft = slot ? slot.offsetLeft : inset
  const slotWidth = slot ? slot.offsetWidth : badgeSize
  const slotTop = slot ? slot.offsetTop : inset
  const slotHeight = slot ? slot.offsetHeight : badgeSize

  const rawCx = slotLeft + slotWidth / 2
  const cy = slotTop + slotHeight / 2

  const cx = Math.min(Math.max(rawCx, inset + rb), w - (inset + rb))
  const far = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy))
  const coverD = Math.ceil(2 * far * 1.15)

  // Cargar escala acotada (máximo 12x)
  hoverScale.value = Math.min(badgeSize > 0 ? coverD / badgeSize : 10, 12)
  hoverX.value = w / 2 - cx

  badgeLeft.value = cx > 0 ? cx : inset + rb
  badgeTop.value = cy > 0 ? cy : h / 2
}

let ro: ResizeObserver | null = null

onMounted(() => {
  medirYCalcular()
  requestAnimationFrame(medirYCalcular)

  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    ro = new ResizeObserver(() => {
      // Evitar la recalculación de dimensiones durante el estado hover/animación
      if (!isHovered.value) {
        medirYCalcular()
      }
    })
    if (buttonRef.value) ro.observe(buttonRef.value)
  }
})

onUnmounted(() => {
  if (ro) ro.disconnect()
})

const onMouseEnter = () => {
  medirYCalcular()
  if (props.deshabilitado || props.cargando) return
  isHovered.value = true
}

const onMouseLeave = () => {
  isHovered.value = false
}

const triggerShake = () => {
  sacudiendo.value = true
  setTimeout(() => {
    sacudiendo.value = false
  }, 450)
}

const handleClick = (e: MouseEvent) => {
  if (props.deshabilitado || props.cargando) {
    e.preventDefault()
    triggerShake()
    emit('clickDeshabilitado', e)
    return
  }
  emit('click', e)
}

watch(() => props.deshabilitado, () => {
  medirYCalcular()
})
</script>

<template>
  <component
    :is="enlace ? 'a' : 'button'"
    ref="buttonRef"
    :href="enlace || undefined"
    :target="enlace && nuevaPestana ? '_blank' : undefined"
    :rel="enlace && nuevaPestana ? 'noopener noreferrer' : undefined"
    :disabled="deshabilitado || cargando"
    :type="enlace ? undefined : 'button'"
    class="group relative inline-flex items-center justify-between overflow-hidden select-none outline-none transition-all duration-300 active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg font-['Poppins',sans-serif]"
    :class="[
      clase,
      sacudiendo ? 'animate-shake' : '',
      !deshabilitado && resaltarActivo ? 'ring-2 ring-indigo-500/40 shadow-[0_4px_25px_rgba(54,0,255,0.35)] hover:shadow-[0_6px_35px_rgba(54,0,255,0.5)]' : ''
    ]"
    :style="{
      backgroundColor: colorFondo,
      borderRadius: '9999px',
      padding: '8px 36px 8px 8px',
      minHeight: '54px'
    }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focus="onMouseEnter"
    @blur="onMouseLeave"
    @click="handleClick"
  >
    <!-- Slot de Posicionamiento de Insignia en Reposo -->
    <span
      ref="slotRef"
      class="inline-flex items-center justify-center shrink-0"
      :style="{
        width: `${badgeSizePx}px`,
        height: `${badgeSizePx}px`
      }"
    />

    <!-- Texto de Etiqueta (Se oculta suavemente en Hover bajo el Badge expansivo) -->
    <span
      class="relative z-10 font-extrabold uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none pl-4 pr-2 whitespace-nowrap"
      :style="{
        color: isHovered ? colorIcono : colorTexto,
        transform: isHovered ? 'translateX(12px)' : 'translateX(0px)',
        opacity: isHovered ? 0 : 1
      }"
    >
      {{ etiqueta }}
    </span>

    <!-- Insignia Circular Expansiva (Escala en Hover a Z-20) -->
    <div
      class="absolute z-20 rounded-full pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-md"
      :style="{
        left: `${badgeLeft}px`,
        top: `${badgeTop}px`,
        width: `${badgeSizePx}px`,
        height: `${badgeSizePx}px`,
        marginLeft: `-${badgeSizePx / 2}px`,
        marginTop: `-${badgeSizePx / 2}px`,
        backgroundColor: colorInsignia,
        transform: isHovered && !deshabilitado ? `scale(${hoverScale})` : 'scale(1)'
      }"
    />

    <!-- Icono / Vector de Flecha → (Z-index 30, Se desplaza cinéticamente al centro w/2) -->
    <div
      class="absolute z-30 flex items-center justify-center pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      :style="{
        left: `${badgeLeft}px`,
        top: `${badgeTop}px`,
        width: `${arrowSizePx}px`,
        height: `${arrowSizePx}px`,
        marginLeft: `-${arrowSizePx / 2}px`,
        marginTop: `-${arrowSizePx / 2}px`,
        color: colorIcono,
        transform: isHovered && !deshabilitado
          ? `translateX(${hoverX}px) rotate(${anguloHover}deg) scale(1.15)`
          : `translateX(0px) rotate(${anguloReposo}deg) scale(1)`
      }"
    >
      <Loader2 v-if="cargando" class="w-5 h-5 animate-spin text-white" />
      <Lock v-else-if="deshabilitado" class="w-4 h-4 opacity-70" />
      <slot v-else name="icono">
        <svg
          class="w-full h-full stroke-current transition-transform duration-300 group-hover:translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </slot>
    </div>

    <!-- Stroke Overlay Exterior (Borde protector) -->
    <div
      class="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 pointer-events-none transition-all duration-300"
    />
  </component>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .group * {
    transition-duration: 0s !important;
  }
}
</style>

