<!--
  ============================================================================
  COMPONENTE FLOTANTE INDEPENDIENTE DE NOTIFICACIONES (NotificacionesFlotante.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Ventana flotante independiente y arrastrable de notificaciones y alertas:
  - NotificacionesBarraHeader: Barra de título con drag & drop y controles.
  - NotificacionesListaItems: Listado con pestañas de filtro (todas, alertas, sistema)
    y redirección directa (deep linking) hacia la alerta en el sistema.
  
  ¿CON QUÉ SE CONECTA?
  - useNotificaciones.ts: Estado reactivo de notificaciones.
  - useHighlight.ts: Navegación y efecto spotlight en la interfaz.
  - App.vue: Montado a nivel raíz.
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificaciones, type NotificacionItem } from '@/Almacenes/useNotificaciones'
import { useHighlight } from '@/Almacenes/useHighlight'
import NotificacionesBarraHeader from './NotificacionesBarraHeader.vue'
import NotificacionesListaItems from './NotificacionesListaItems.vue'

const {
  notificaciones,
  panelAbierto,
  noLeidas,
  cerrarPanel,
  marcarLeida,
  marcarTodasLeidas
} = useNotificaciones()

const { navegarYResaltar } = useHighlight()

const posX = ref(Math.max(20, window.innerWidth - 420))
const posY = ref(80)
const estaArrastrando = ref(false)
const estaMinimizado = ref(false)

const inicioArrastre = { x: 0, y: 0, inicialX: 0, inicialY: 0 }
const filtroNotificaciones = ref<'todas' | 'alertas' | 'sistema'>('todas')

const notificacionesFiltradas = computed(() => {
  if (filtroNotificaciones.value === 'alertas') {
    return notificaciones.value.filter(
      n => n.tipo === 'alerta_clima' || n.tipo === 'acoso' || n.tipo === 'burnout' || n.tipo === 'alerta'
    )
  }
  if (filtroNotificaciones.value === 'sistema') {
    return notificaciones.value.filter(
      n => n.tipo === 'sistema' || n.tipo === 'seguridad_perfil' || n.tipo === 'encuesta' || n.tipo === 'cuenta'
    )
  }
  return notificaciones.value
})

const iniciarArrastre = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('button')) return

  estaArrastrando.value = true
  inicioArrastre.x = e.clientX
  inicioArrastre.y = e.clientY
  inicioArrastre.inicialX = posX.value
  inicioArrastre.inicialY = posY.value

  window.addEventListener('mousemove', moverVentana)
  window.addEventListener('mouseup', detenerArrastre)
}

const moverVentana = (e: MouseEvent) => {
  if (!estaArrastrando.value) return

  const deltaX = e.clientX - inicioArrastre.x
  const deltaY = e.clientY - inicioArrastre.y

  const anchoVentana = 380
  const maxAncho = window.innerWidth - anchoVentana - 10
  const maxAlto = window.innerHeight - 100

  posX.value = Math.max(10, Math.min(inicioArrastre.inicialX + deltaX, maxAncho))
  posY.value = Math.max(10, Math.min(inicioArrastre.inicialY + deltaY, maxAlto))
}

const detenerArrastre = () => {
  estaArrastrando.value = false
  window.removeEventListener('mousemove', moverVentana)
  window.removeEventListener('mouseup', detenerArrastre)
}

const clickNotificacion = (notif: NotificacionItem) => {
  marcarLeida(notif.id)
  if (notif.rutaDestino) {
    navegarYResaltar(notif.rutaDestino, notif.idElemento)
  }
}

const ajustarDimensiones = () => {
  if (posX.value > window.innerWidth - 390) {
    posX.value = Math.max(20, window.innerWidth - 400)
  }
}

onMounted(() => {
  window.addEventListener('resize', ajustarDimensiones)
})

onUnmounted(() => {
  window.removeEventListener('resize', ajustarDimensiones)
  detenerArrastre()
})
</script>

<template>
  <div
    v-if="panelAbierto"
    class="fixed z-[9990] select-none transition-shadow font-['Poppins',sans-serif]"
    :style="{
      left: `${posX}px`,
      top: `${posY}px`,
      width: '380px'
    }"
  >
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden backdrop-blur-2xl">
      <!-- Encabezado Arrastrable -->
      <NotificacionesBarraHeader
        :noLeidas="noLeidas"
        :estaMinimizado="estaMinimizado"
        @iniciarArrastre="iniciarArrastre"
        @toggleMinimizado="estaMinimizado = !estaMinimizado"
        @cerrar="cerrarPanel"
      />

      <!-- Lista de Notificaciones (colapsable) -->
      <NotificacionesListaItems
        v-show="!estaMinimizado"
        :notificaciones="notificacionesFiltradas"
        :filtroActual="filtroNotificaciones"
        :noLeidas="noLeidas"
        @cambiarFiltro="filtroNotificaciones = $event"
        @marcarTodasLeidas="marcarTodasLeidas"
        @clickNotificacion="clickNotificacion"
      />
    </div>
  </div>
</template>
