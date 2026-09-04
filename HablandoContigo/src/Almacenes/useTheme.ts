/**
 * ============================================================================
 * ALMACÉN DE GESTIÓN DE TEMA VISUAL DÍA / NOCHE (useTheme)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Este módulo controla la alternancia reactiva entre el Modo Oscuro (`dark`) y el 
 * Modo Claro (`light`), sincronizando las clases CSS en la raíz del documento HTML 
 * (`document.documentElement`), manipulando la propiedad `color-scheme` y persistiendo 
 * la preferencia del usuario en el almacenamiento local.
 * 
 * ¿PARA QUÉ SIRVE?
 * - Ofrecer comodidad visual adaptada al entorno lumínico del usuario.
 * - Soportar el estilo futurista 'Dark Glassmorphism' y el estilo corporativo limpio 'Light'.
 * 
 * ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
 * - Menu.vue: Botón de alternancia en la barra lateral con icono animado de sol/luna.
 * - HeroPrincipal.vue: Botón de alternancia rápida en la cabecera superior.
 * - main.css / Tailwind CSS: Aplica las variantes `dark:` en toda la aplicación.
 */

import { ref, computed } from 'vue'

/** Modos de tema visual soportados */
export type TemaModo = 'dark' | 'light'

/** Clave de persistencia en localStorage */
const CLAVE_ALMACENAMIENTO_TEMA = 'hablandocontigo_theme'

/**
 * Obtiene el tema guardado previamente o establece el modo oscuro por defecto
 */
function obtenerTemaInicial(): TemaModo {
  const temaGuardado = localStorage.getItem(CLAVE_ALMACENAMIENTO_TEMA)
  if (temaGuardado === 'dark' || temaGuardado === 'light') {
    return temaGuardado
  }
  // Por defecto se establece en modo oscuro para la estética inmersiva 3D
  return 'dark'
}

// Estado reactivo global del tema
const temaActual = ref<TemaModo>(obtenerTemaInicial())

/**
 * Composable `useTheme` para manipulación del tema en la aplicación
 */
export function useTheme() {
  /** Indica si el tema activo es el modo oscuro */
  const esOscuro = computed(() => temaActual.value === 'dark')

  /**
   * Aplica las clases y propiedades CSS directamente en el elemento <html>
   * 
   * @param {TemaModo} modo - 'dark' o 'light'
   */
  const aplicarTemaDOM = (modo: TemaModo) => {
    const elementoRaiz = document.documentElement
    if (modo === 'dark') {
      elementoRaiz.classList.add('dark')
      elementoRaiz.classList.remove('light')
      elementoRaiz.style.colorScheme = 'dark'
    } else {
      elementoRaiz.classList.add('light')
      elementoRaiz.classList.remove('dark')
      elementoRaiz.style.colorScheme = 'light'
    }
  }

  // Inicializar en el DOM al cargar el composable
  aplicarTemaDOM(temaActual.value)

  /**
   * Alterna entre modo claro y modo oscuro
   */
  const alternarTema = () => {
    const nuevoTema = temaActual.value === 'dark' ? 'light' : 'dark'
    temaActual.value = nuevoTema
    localStorage.setItem(CLAVE_ALMACENAMIENTO_TEMA, nuevoTema)
    aplicarTemaDOM(nuevoTema)
  }

  /**
   * Fija explícitamente un modo de tema
   * 
   * @param {TemaModo} modo - Modo a fijar
   */
  const fijarTema = (modo: TemaModo) => {
    temaActual.value = modo
    localStorage.setItem(CLAVE_ALMACENAMIENTO_TEMA, modo)
    aplicarTemaDOM(modo)
  }

  return {
    temaActual,
    esOscuro,
    alternarTema,
    fijarTema
  }
}
