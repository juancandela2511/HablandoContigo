<!--
  ============================================================================
  MODAL ENLACE DE ENCUESTA PUBLICADA (ModalEnlacePublicado.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Ventana modal que se muestra tras publicar una encuesta con éxito:
  - Muestra la URL pública anónima generada (`/responder/:id`).
  - Botón interactivo de 1-clic para copiar la URL al portapapeles.
  - Botón directo para ingresar a probar el cuestionario en modo encuestado.
  
  ¿PARA QUÉ SIRVE?
  - Facilitar la distribución inmediata del link a los canales de comunicación de la empresa (Slack, Teams, Email).
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - ProyectosView.vue: Componente padre que controla la visibilidad del modal.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { FileCheck2, Copy, Check, ArrowRight } from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
  encuestaId: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'irAResponder', id: string): void
}>()

const enlaceCopiado = ref(false)

const copiarEnlace = () => {
  const url = `${window.location.origin}/responder/${props.encuestaId}`
  navigator.clipboard.writeText(url)
  enlaceCopiado.value = true
  setTimeout(() => {
    enlaceCopiado.value = false
  }, 3000)
}
</script>

<template>
  <div 
    v-if="abierto" 
    class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
  >
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
      
      <div class="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
        <FileCheck2 class="w-7 h-7" />
      </div>

      <div class="space-y-1">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">¡Encuesta Publicada!</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Comparte este enlace con tu equipo. Las respuestas serán 100% anónimas y no requieren registro ni inicio de sesión.
        </p>
      </div>

      <!-- Caja de Enlace para Copiar -->
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <span class="text-xs text-sky-600 dark:text-sky-400 truncate font-mono select-all">
          {{ `/responder/${encuestaId}` }}
        </span>
        <button
          @click="copiarEnlace"
          class="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-all cursor-pointer"
        >
          <Check v-if="enlaceCopiado" class="w-3.5 h-3.5" />
          <Copy v-else class="w-3.5 h-3.5" />
          <span>{{ enlaceCopiado ? '¡Copiado!' : 'Copiar' }}</span>
        </button>
      </div>

      <div class="flex items-center justify-center gap-3 pt-2">
        <button
          @click="$emit('cerrar')"
          class="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
        >
          Cerrar
        </button>

        <button
          @click="$emit('irAResponder', encuestaId)"
          class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20"
        >
          <span>Probar como Encuestado</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  </div>
</template>
