<!--
  ============================================================================
  COMPONENTE RAÍZ DE LA APLICACIÓN (App.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Es el componente raíz contenedor de todo el árbol de vistas de Vue 3:
  - Monta el menú fijo en la esquina superior izquierda `Menu.vue` (ocultándolo en rutas anónimas de encuestas).
  - Monta a nivel global la ventana modal del buscador Spotlight `BuscadorSpotlight.vue`.
  - Monta a nivel global la sub-ventana flotante e interactiva `NotificacionesFlotante.vue` (libre de backdrop y libremente arrastrable).
  - Renderiza el componente de vista activa mediante `<router-view />`.
  - Define las transiciones de fondo para el modo oscuro y claro.
  
  ¿PARA QUÉ SIRVE?
  - Estructurar el cascarón principal ('shell') de la interfaz de usuario.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - Menu.vue, BuscadorSpotlight.vue, NotificacionesFlotante.vue, router/index.ts, main.ts.
-->

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import { useSupabaseStatus } from '@/Almacenes/useSupabaseStatus'
import Menu from './componentes/Comunes/Menu.vue'
import BuscadorSpotlight from './componentes/Comunes/BuscadorSpotlight.vue'
import NotificacionesFlotante from './componentes/Notificaciones/NotificacionesFlotante.vue'
import AlertaConexionSupabase from './componentes/Comunes/AlertaConexionSupabase.vue'
import ToastNotificaciones from './componentes/Comunes/ToastNotificaciones.vue'

const rutaActual = useRoute()
const { estaAutenticado, refrescarSesionDesdeSupabase } = useAuth()
const { verificarConexionSupabase } = useSupabaseStatus()

onMounted(async () => {
  // Solo verificar conectividad y refrescar perfil si el usuario ha iniciado sesión
  if (estaAutenticado.value) {
    verificarConexionSupabase()
    await refrescarSesionDesdeSupabase()
  }
})

/**
 * Oculta el menú lateral en vistas de respuesta anónima para máxima privacidad y concentración
 */
const ocultarMenuLateral = computed(() => {
  return rutaActual.name === 'ResponderEncuesta' || 
         rutaActual.path.startsWith('/responder') || 
         rutaActual.path.startsWith('/encuesta')
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 relative transition-colors duration-300">
    
    <!-- Banner flotante de notificación si falla la conexión (Solo si está autenticado) -->
    <AlertaConexionSupabase v-if="estaAutenticado" />

    <!-- Sistema de Toasts globales -->
    <ToastNotificaciones />

    <!-- Menú posicionado en la esquina superior izquierda (Solo administradores autenticados) -->
    <Menu v-if="estaAutenticado && !ocultarMenuLateral" />

    <!-- Sub-ventana Flotante y Arrastrable de Notificaciones (Solo autenticados) -->
    <NotificacionesFlotante v-if="estaAutenticado" />

    <!-- Buscador Global Spotlight estilo macOS / iPhone (Solo autenticados) -->
    <BuscadorSpotlight v-if="estaAutenticado" />

    <!-- Contenedor principal de vistas dinámicas -->
    <main class="w-full min-h-screen">
      <router-view />
    </main>

  </div>
</template>

<style>
/* Estilos globales y efectos de iluminación */
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}

html.dark {
  background-color: #0b0f19;
  color: #f8fafc;
}

html.light {
  background-color: #f8fafc;
  color: #0f172a;
}
</style>