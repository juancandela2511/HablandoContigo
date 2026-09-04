/**
 * ============================================================================
 * ALMACÉN DE SISTEMA DE RESALTADO SPOTLIGHT Y GUÍA VISUAL (useHighlight)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Este composable gestiona el estado global de resaltado reactivo ('spotlight') 
 * y navegación asistida dentro de la aplicación HablandoContigo.
 * Permite que cualquier componente o notificación indique qué elemento visual
 * debe palpitar en pantalla (mediante un anillo pulsante con clase `ring-4 animate-pulse`)
 * y realizar un desplazamiento suave ('smooth scroll') hacia él.
 * 
 * ¿PARA QUÉ SIRVE?
 * - Guiar intuitivamente al usuario desde las notificaciones hasta la sección exacta del incidente.
 * - Soportar el buscador global Spotlight interactivo (activado con atajo `Ctrl+K` o `⌘K`).
 * 
 * ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
 * - App.vue: Renderiza la ventana modal flotante `SpotlightModal.vue`.
 * - Menu.vue: Atajo de teclado y clic en notificaciones para navegar y enfocar.
 * - AdminCuentasView, ProyectosView, DashboardView, ConfiguracionView:
 *   Leen `elementoResaltadoId` para agregar las clases de resplandor.
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'

/** ID del elemento HTML que actualmente está siendo enfocado/resaltado */
const elementoResaltadoId = ref<string | null>(null)

/** Estado de visibilidad de la ventana modal Spotlight */
const spotlightAbierto = ref(false)

/**
 * Composable `useHighlight` para orquestar la navegación asistida
 */
export function useHighlight() {
  const enrutador = useRouter()

  /**
   * Abre la ventana modal de búsqueda Spotlight
   */
  const abrirSpotlight = () => {
    spotlightAbierto.value = true
  }

  /**
   * Cierra la ventana modal de búsqueda Spotlight
   */
  const cerrarSpotlight = () => {
    spotlightAbierto.value = false
  }

  /**
   * Navega a la ruta indicada, espera el renderizado del DOM y enfoca el elemento con palpitación
   * 
   * @param {string} rutaDestino - Ruta de Vue Router (ej. '/dashboard')
   * @param {string} [idElementoDom] - ID del elemento en el DOM (ej. 'seccion-alertas-feed')
   */
  const navegarYResaltar = async (rutaDestino: string, idElementoDom?: string) => {
    cerrarSpotlight()
    
    // Si no estamos en la ruta destino, navegar primero mediante Vue Router
    if (enrutador.currentRoute.value.path !== rutaDestino) {
      await enrutador.push(rutaDestino)
    }

    if (idElementoDom) {
      // Esperar a que los componentes del DOM terminen su ciclo de montaje
      setTimeout(() => {
        elementoResaltadoId.value = idElementoDom
        
        const elementoHtml = document.getElementById(idElementoDom)
        if (elementoHtml) {
          elementoHtml.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }

        // Remover automáticamente el efecto visual de palpitación después de 4 segundos
        setTimeout(() => {
          if (elementoResaltadoId.value === idElementoDom) {
            elementoResaltadoId.value = null
          }
        }, 4000)
      }, 200)
    }
  }

  return {
    elementoResaltadoId,
    spotlightAbierto,
    abrirSpotlight,
    cerrarSpotlight,
    navegarYResaltar
  }
}
