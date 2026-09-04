<!--
  ============================================================================
  COMPONENTE BUSCADOR GLOBAL SPOTLIGHT (BuscadorSpotlight.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Ventana modal de búsqueda global rápida estilo macOS / iOS Spotlight:
  - Filtra en tiempo real el catálogo estructurado de rutas y herramientas.
  - Redirecciona y resalta el elemento en pantalla mediante `navegarYResaltar()`.
  - Soporta atajo global Ctrl+K / Cmd+K y navegación con flechas de teclado.
  
  ¿CON QUÉ SE CONECTA?
  - catalogoSpotlight.ts: Colección de accesos indexados.
  - SpotlightInput.vue: Campo de búsqueda y tecla ESC.
  - SpotlightResultadosLista.vue: Renderizado de coincidencias y estados.
  - useHighlight.ts: Control de visibilidad y navegación reactiva.
  - useAuth.ts: Filtrado según rol o sesión activa.
  - App.vue: Montado a nivel raíz de la aplicación.
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useHighlight } from '@/Almacenes/useHighlight'
import { useAuth } from '@/Almacenes/useAuth'
import { CATALOGO_SPOTLIGHT, type ElementoSpotlight } from './Spotlight/catalogoSpotlight'
import SpotlightInput from './Spotlight/SpotlightInput.vue'
import SpotlightResultadosLista from './Spotlight/SpotlightResultadosLista.vue'

const { spotlightAbierto, cerrarSpotlight, navegarYResaltar } = useHighlight()
const { estaAutenticado } = useAuth()

const terminoBusqueda = ref('')
const inputRef = ref<InstanceType<typeof SpotlightInput> | null>(null)
const indiceSeleccionado = ref(0)

const resultadosFiltrados = computed(() => {
  const elementosDisponibles = CATALOGO_SPOTLIGHT.filter(item => {
    if (item.requiereAuth && !estaAutenticado.value) return false
    return true
  })

  if (!terminoBusqueda.value.trim()) return elementosDisponibles
  const consulta = terminoBusqueda.value.toLowerCase().trim()

  return elementosDisponibles.filter(item => {
    return (
      item.titulo.toLowerCase().includes(consulta) ||
      item.subtitulo.toLowerCase().includes(consulta) ||
      item.categoria.toLowerCase().includes(consulta) ||
      item.palabrasClave.some(kw => kw.toLowerCase().includes(consulta))
    )
  })
})

watch(resultadosFiltrados, () => {
  indiceSeleccionado.value = 0
})

watch(spotlightAbierto, (abierto) => {
  if (abierto) {
    terminoBusqueda.value = ''
    indiceSeleccionado.value = 0
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

const ejecutarRedireccion = (item: ElementoSpotlight) => {
  cerrarSpotlight()
  navegarYResaltar(item.ruta, item.idElemento)
}

const manejarEnter = () => {
  const lista = resultadosFiltrados.value
  if (lista.length > 0) {
    const item = lista[indiceSeleccionado.value] || lista[0]
    if (item) {
      ejecutarRedireccion(item)
    }
  }
}

const manejarTeclado = (evento: KeyboardEvent) => {
  if ((evento.metaKey || evento.ctrlKey) && evento.key.toLowerCase() === 'k') {
    evento.preventDefault()
    spotlightAbierto.value = !spotlightAbierto.value
    return
  }

  if (!spotlightAbierto.value) return

  if (evento.key === 'Escape') {
    cerrarSpotlight()
    return
  }

  if (evento.key === 'ArrowDown') {
    evento.preventDefault()
    if (indiceSeleccionado.value < resultadosFiltrados.value.length - 1) {
      indiceSeleccionado.value++
    } else {
      indiceSeleccionado.value = 0
    }
  }

  if (evento.key === 'ArrowUp') {
    evento.preventDefault()
    if (indiceSeleccionado.value > 0) {
      indiceSeleccionado.value--
    } else {
      indiceSeleccionado.value = resultadosFiltrados.value.length - 1
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', manejarTeclado)
})

onUnmounted(() => {
  window.removeEventListener('keydown', manejarTeclado)
})
</script>

<template>
  <div
    v-if="spotlightAbierto"
    @click.self="cerrarSpotlight"
    class="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xl flex items-start justify-center pt-[10vh] sm:pt-[15vh] p-4 animate-fade-in font-['Poppins',sans-serif] select-none"
  >
    <div class="w-full max-w-2xl bg-slate-900/95 border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden backdrop-blur-2xl">
      <!-- Input de búsqueda -->
      <SpotlightInput
        ref="inputRef"
        v-model="terminoBusqueda"
        @enter="manejarEnter"
      />

      <!-- Lista interactiva de resultados -->
      <SpotlightResultadosLista
        :resultados="resultadosFiltrados"
        :indiceSeleccionado="indiceSeleccionado"
        :terminoBusqueda="terminoBusqueda"
        @seleccionar="ejecutarRedireccion"
        @cambiarIndice="indiceSeleccionado = $event"
      />

      <!-- Pie del buscador -->
      <div class="p-3 bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">↵</kbd>
            <span>para redirigir</span>
          </span>
          <span class="flex items-center gap-1 hidden sm:inline-flex">
            <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">↑↓</kbd>
            <span>para navegar</span>
          </span>
        </div>
        <button
          type="button"
          @click="cerrarSpotlight"
          class="text-sky-400 hover:underline font-semibold cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
