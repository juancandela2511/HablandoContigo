/**
 * ============================================================================
 * PUNTO DE ENTRADA PRINCIPAL DE LA APLICACIÓN (main.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Es el archivo de arranque de la aplicación web Vue 3. Instancia la app,
 * inyecta el enrutador Vue Router, carga los estilos globales de Tailwind CSS 
 * (`main.css`), inicializa el tema visual y monta el DOM en el contenedor `#app`.
 * 
 * ¿PARA QUÉ SIRVE?
 * - Inicializar todos los plugins y dependencias globales del frontend.
 * 
 * ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
 * - App.vue: Componente raíz montado.
 * - router/index.ts: Enrutador de la SPA.
 * - main.css: Estilos base, gradientes y animaciones.
 * - useTheme.ts: Sincronización del tema oscuro/claro en el DOM.
 */

import { createApp } from 'vue'
import App from './App.vue'
import enrutador from './router'
import { useTheme } from './Almacenes/useTheme'
import './main.css'

// Inicializar el modo oscuro/claro inmediatamente antes de montar
const { esOscuro } = useTheme()
if (esOscuro.value) {
  document.documentElement.classList.add('dark')
  document.documentElement.classList.remove('light')
} else {
  document.documentElement.classList.add('light')
  document.documentElement.classList.remove('dark')
}

const aplicacionVue = createApp(App)
aplicacionVue.use(enrutador)
aplicacionVue.mount('#app')
