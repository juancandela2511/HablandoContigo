<!--
  ============================================================================
  COMPONENTE REUTILIZABLE: MODAL BASE (ModalBase.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Contenedor modal estandarizado con diseño de alta fidelidad:
  - Teletransporte a <body> para evitar solapamientos de z-index y overflow.
  - Fondo oscuro translúcido con desenfoque de cristal (backdrop-blur-md).
  - Animación suave de apertura y cierre (fade + scale).
  - Marcadores de visor en esquinas HUD.
  - Encabezado con soporte para icono, título, subtítulo e insignia.
  - Ranura scrolleable para el contenido central y ranura de acciones en el pie.
  
  ¿CON QUÉ OTROS ARCHIVOS SE CONECTA?
  - index.ts en src/componentes/ElementosBase/: Exportado como parte del paquete UI básico.
  - ModalGestionTiposAlertas.vue, ModalDetalleAlerta.vue, ModalConfigurarGraficoRadial.vue,
    ModalMapaUbicacionAuditoria.vue, ModalVerificacionCorreo.vue, ModalEncuestaDemo.vue, etc.
-->

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    abierto: boolean
    titulo?: string
    subtitulo?: string
    anchoMaximo?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
    mostrarBotonCerrar?: boolean
    cerrarAlClickFondo?: boolean
  }>(),
  {
    titulo: '',
    subtitulo: '',
    anchoMaximo: '2xl',
    mostrarBotonCerrar: true,
    cerrarAlClickFondo: true
  }
)

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const clasesAncho = computed(() => {
  switch (props.anchoMaximo) {
    case 'sm': return 'max-w-sm'
    case 'md': return 'max-w-md'
    case 'lg': return 'max-w-lg'
    case 'xl': return 'max-w-xl'
    case '2xl': return 'max-w-2xl'
    case '3xl': return 'max-w-3xl'
    case '4xl': return 'max-w-4xl'
    case '5xl': return 'max-w-5xl'
    default: return 'max-w-2xl'
  }
})

const manejarEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.abierto) {
    emit('cerrar')
  }
}

onMounted(() => {
  window.addEventListener('keydown', manejarEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', manejarEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="abierto"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 dark:bg-black/80 backdrop-blur-md"
        @click.self="cerrarAlClickFondo ? emit('cerrar') : null"
      >
        <div
          :class="[
            'relative w-full rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all',
            clasesAncho
          ]"
        >
          <!-- Marcadores de Visor en las cuatro esquinas (HUD) -->
          <span class="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-slate-400/40 dark:border-white/30 pointer-events-none z-10" />
          <span class="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-slate-400/40 dark:border-white/30 pointer-events-none z-10" />
          <span class="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-slate-400/40 dark:border-white/30 pointer-events-none z-10" />
          <span class="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-slate-400/40 dark:border-white/30 pointer-events-none z-10" />

          <!-- Encabezado del Modal -->
          <div
            v-if="titulo || $slots.encabezado"
            class="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]"
          >
            <slot name="encabezado">
              <div class="flex items-center gap-3 min-w-0 pr-3">
                <div v-if="$slots.icono" class="shrink-0 flex items-center justify-center">
                  <slot name="icono"></slot>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                    {{ titulo }}
                    <slot name="insignia"></slot>
                  </h3>
                  <p v-if="subtitulo" class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                    {{ subtitulo }}
                  </p>
                </div>
              </div>
            </slot>

            <button
              v-if="mostrarBotonCerrar"
              type="button"
              @click="emit('cerrar')"
              class="shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar modal (Esc)"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Cuerpo Scrolleable del Modal -->
          <div class="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
            <slot></slot>
          </div>

          <!-- Pie de Acciones del Modal -->
          <div
            v-if="$slots.pie"
            class="p-4 sm:p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-end gap-3 flex-wrap"
          >
            <slot name="pie"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
