/**
 * ============================================================================
 * PUNTO DE ENTRADA PRINCIPAL DE LA APLICACIÓN (main.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Es el archivo de arranque de la aplicación web Vue 3. Instancia la app,
 * inyecta el enrutador Vue Router, carga los estilos globales de Tailwind CSS 
 * (`main.css`), inicializa el tema visual y monta el DOM en el contenedor `#app`.
 * Incorpora un escudo global de privacidad y silenciamiento de errores técnicos
 * para herramientas de desarrollador (F12).
 */

import { createApp } from 'vue'
import App from './App.vue'
import enrutador from './router'
import { useTheme } from './Almacenes/useTheme'
import './main.css'

// ============================================================================
// GESTIÓN DE ERRORES Y ESTADO DE APLICACIÓN
// ============================================================================
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

aplicacionVue.config.errorHandler = (err, instance, info) => {
  console.error('[Vue ErrorHandler]:', err, info)
}

aplicacionVue.use(enrutador)
aplicacionVue.mount('#app')
