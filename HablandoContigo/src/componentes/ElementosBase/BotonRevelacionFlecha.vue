<!--
  ============================================================================
  COMPONENTE BOTÓN DE REVELACIÓN DE FLECHA ORIGINKIT (BotonRevelacionFlecha.vue)
  ============================================================================
  Implementación oficial nativa Vue 3 del componente Originkit Arrow Reveal Button.
  
  MECÁNICA E INTERACCIÓN:
  - En reposo: Píldora blanca/oscura con etiqueta en mayúsculas y distintivo
    circular a la izquierda con el vector de flecha `→`.
  - Al pasar el cursor (Hover):
    1. El distintivo circular (`colorInsignia`, e.g. #3600FF / #0066FF) se amplía
       escalando exponencialmente desde su centro hasta cubrir la pastilla completa.
    2. El vector de flecha `→` se desplaza horizontalmente desde el distintivo
       reposado hasta posicionarse en el centro exacto del botón (`W/2`).
    3. La etiqueta de texto se desplaza 8px a la derecha y queda oculta bajo el
       distintivo en ascenso.
    4. Capa externa de trazo (stroke overlay) para proteger el borde contra deshilachado.
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Loader2 } from 'lucide-vue-next'

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
    clase: ''
  }
)

const emit = defineEmits<{
  (e: 'click', evento: MouseEvent): void
}>()

const buttonRef = ref<HTMLElement | null>(null)
const slotRef = ref<HTMLElement | null>(null)
const badgeRef = ref<HTMLElement | null>(null)
const arrowRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)

const isHovered = ref(false)
const hoverScale = ref(1)
const hoverX = ref(0)
const badgeLeft = ref(24)
const badgeTop = ref(24)
const badgeSizePx = ref(44)
const arrowSizePx = ref(20)

const medirYCalcular = () => {
  const btn = buttonRef.value
  const slot = slotRef.value
  if (!btn || !slot) return

  const w = btn.offsetWidth
  const h = btn.offsetHeight
  if (!w || !h) return

  const inset = 6
  const badgeSize = Math.max(32, h - inset * 2)
  badgeSizePx.value = badgeSize
  arrowSizePx.value = Math.round(badgeSize * 0.45)

  const rb = badgeSize / 2
  const rawCx = slot.offsetLeft + slot.offsetWidth / 2
  const cy = slot.offsetTop + slot.offsetHeight / 2

  const cx = Math.min(Math.max(rawCx, inset + rb), w - (inset + rb))
  const far = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy))
  const coverD = Math.ceil(2 * far * 1.08)

  hoverScale.value = badgeSize > 0 ? coverD / badgeSize : 1
  hoverX.value = w / 2 - cx

  badgeLeft.value = cx
  badgeTop.value = cy
}

let ro: ResizeObserver | null = null

onMounted(() => {
  medirYCalcular()
  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    ro = new ResizeObserver(medirYCalcular)
    if (buttonRef.value) ro.observe(buttonRef.value)
    if (slotRef.value) ro.observe(slotRef.value)
  }
})

onUnmounted(() => {
  if (ro) ro.disconnect()
})

const onMouseEnter = () => {
  if (props.deshabilitado || props.cargando) return
  isHovered.value = true
}

const onMouseLeave = () => {
  isHovered.value = false
}

const handleClick = (e: MouseEvent) => {
  if (props.deshabilitado || props.cargando) {
    e.preventDefault()
    return
  }
  emit('click', e)
}
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
    class="group relative inline-flex items-center justify-between overflow-hidden select-none outline-none transition-transform duration-300 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg font-['Poppins',sans-serif]"
    :class="[clase]"
    :style="{
      backgroundColor: colorFondo,
      borderRadius: '9999px',
      padding: '10px 40px 10px 10px',
      minHeight: '56px'
    }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
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

    <!-- Texto de Etiqueta (Z-index 5, se oculta bajo el badge que escala a Z-10) -->
    <span
      ref="textRef"
      class="relative z-5 font-black uppercase tracking-wider text-sm sm:text-base transition-all duration-400 ease-[cubic-bezier(0.44,0,0.56,1)] pointer-events-none pl-4 pr-2"
      :style="{
        color: colorTexto,
        transform: isHovered ? 'translateX(8px)' : 'translateX(0px)',
        opacity: isHovered ? 0 : 1
      }"
    >
      {{ etiqueta }}
    </span>

    <!-- Insignia Circular Expansiva (Escala en Hover a Z-10) -->
    <div
      ref="badgeRef"
      class="absolute z-10 rounded-full pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] shadow-md"
      :style="{
        left: `${badgeLeft}px`,
        top: `${badgeTop}px`,
        width: `${badgeSizePx}px`,
        height: `${badgeSizePx}px`,
        marginLeft: `-${badgeSizePx / 2}px`,
        marginTop: `-${badgeSizePx / 2}px`,
        backgroundColor: colorInsignia,
        transform: isHovered ? `scale(${hoverScale})` : 'scale(1)'
      }"
    />

    <!-- Icono / Vector de Flecha → (Z-index 20, Se desplaza al centro exacto w/2) -->
    <div
      ref="arrowRef"
      class="absolute z-20 flex items-center justify-center pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.44,0,0.56,1)]"
      :style="{
        left: `${badgeLeft}px`,
        top: `${badgeTop}px`,
        width: `${arrowSizePx}px`,
        height: `${arrowSizePx}px`,
        marginLeft: `-${arrowSizePx / 2}px`,
        marginTop: `-${arrowSizePx / 2}px`,
        color: colorIcono,
        transform: isHovered
          ? `translateX(${hoverX}px) rotate(${anguloHover}deg)`
          : `translateX(0px) rotate(${anguloReposo}deg)`
      }"
    >
      <Loader2 v-if="cargando" class="w-5 h-5 animate-spin text-white" />
      <slot v-else name="icono">
        <svg
          class="w-full h-full stroke-current"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </slot>
    </div>

    <!-- Stroke Overlay Exterior (Protección del borde) -->
    <div
      class="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 pointer-events-none transition-all duration-300"
    />
  </component>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .group * {
    transition-duration: 0s !important;
  }
}
</style>
