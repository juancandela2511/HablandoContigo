<!--
  ============================================================================
  MODAL DE VINCULACIÓN DE PREGUNTA AL BLOQUE DE ESTUDIO (ModalConfiguracionEstudios.vue)
  ============================================================================
  PROPÓSITO:
  Permite vincular cualquier pregunta de opción múltiple de las encuestas activas
  para evaluar sus respuestas reales en el módulo de estadísticas.
-->

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Settings, Check, Link2, HelpCircle } from 'lucide-vue-next'

export interface PreguntaDisponibleOption {
  id: string
  idEncuesta: string
  tituloEncuesta: string
  texto: string
  opciones: string[]
}

const props = defineProps<{
  abierto: boolean
  preguntaIdSeleccionada: string
  preguntasDisponibles: PreguntaDisponibleOption[]
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'vincularPregunta', id: string): void
}>()

const idTemporal = ref<string>(props.preguntaIdSeleccionada || '')

watch(() => props.preguntaIdSeleccionada, (val) => {
  idTemporal.value = val || ''
})

const guardarVinculacion = () => {
  emit('vincularPregunta', idTemporal.value)
  emit('cerrar')
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="abierto"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-['Poppins',sans-serif]"
      @click.self="emit('cerrar')"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-5 text-left">
        
        <!-- Header Modal -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold">
              <Link2 class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 dark:text-white">
                Vincular Pregunta de Opción Múltiple
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Selecciona cualquier pregunta de las encuestas para evaluar sus respuestas reales en este bloque.
              </p>
            </div>
          </div>
          <button 
            @click="emit('cerrar')"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Selector de Preguntas -->
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <HelpCircle class="w-3.5 h-3.5 text-sky-500" />
              <span>Seleccionar Pregunta de Encuestas</span>
            </label>
            <select
              v-model="idTemporal"
              class="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">
                🔹 Por Defecto: Bloque de Estudios & Talento Interno ("¿Qué estudias actualmente?")
              </option>
              <option 
                v-for="p in preguntasDisponibles" 
                :key="p.id" 
                :value="p.id"
              >
                {{ p.tituloEncuesta }} ➔ {{ p.texto }} ({{ p.opciones.length }} opciones)
              </option>
            </select>
          </div>

          <!-- Vista Previa de Opciones Evaludadas -->
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Opciones de Respuesta que se Evaluarán
            </label>

            <div v-if="!idTemporal" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <p class="text-xs font-bold text-sky-600 dark:text-sky-400">
                Pregunta por Defecto: Nivel Académico y Área de Estudio
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Evalúa automáticamente las respuestas de la opción múltiple del bloque de estudio de los colaboradores.
              </p>
            </div>

            <div v-else class="space-y-2">
              <div 
                v-for="(pItem, pIdx) in preguntasDisponibles.filter(p => p.id === idTemporal)"
                :key="pIdx"
                class="space-y-2"
              >
                <div class="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs font-bold text-sky-700 dark:text-sky-300">
                  📋 Encuesta: {{ pItem.tituloEncuesta }}<br />
                  ❓ Pregunta: "{{ pItem.texto }}"
                </div>
                <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  <div 
                    v-for="(op, idx) in pItem.opciones" 
                    :key="idx"
                    class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
                  >
                    <span class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold flex items-center justify-center">{{ idx + 1 }}</span>
                      {{ op }}
                    </span>
                    <Check class="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="emit('cerrar')"
            class="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="guardarVinculacion"
            class="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Check class="w-4 h-4" />
            <span>Vincular y Evaluar Respuestas</span>
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>
