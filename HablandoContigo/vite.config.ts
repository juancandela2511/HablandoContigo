import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: './', // Rutas relativas correctas en Vercel
  plugins: [
    vue(),
    // DevTools solo en desarrollo — NO en el bundle de producción
    ...(mode !== 'production' ? [vueDevTools()] : []),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Reducir el umbral de aviso de chunks (por defecto 500 KB)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Separar librerías pesadas en chunks individuales para caché de largo plazo.
        // Rolldown (Vite 8) requiere manualChunks como función, no como objeto.
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'vendor-three'
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase'
          if (id.includes('node_modules/lucide-vue-next')) return 'vendor-lucide'
          if (id.includes('node_modules/d3-geo')) return 'vendor-d3'
          if (id.includes('node_modules/vue-router')) return 'vendor-vue-router'
          if (id.includes('node_modules/vue/')) return 'vendor-vue'
        }
      }
    }
  }
}))