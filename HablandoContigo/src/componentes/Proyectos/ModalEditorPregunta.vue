<!--
  ============================================================================
  MODAL EDITOR AVANZADO DE PREGUNTA (ModalEditorPregunta.vue)
  ============================================================================
  Se abre al editar una tarjeta de pregunta. Orquesta subcomponentes modulares
  para metadatos, profundización inteligente, opciones de respuesta y alertas.
-->

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Save, List } from 'lucide-vue-next'
import type { PreguntaEncuesta, OpcionPregunta } from '@/Servicios/iaEncuestasService'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import ModalEditorSeccionProfundizacion from './EditorSubcomponentes/ModalEditorSeccionProfundizacion.vue'
import ModalEditorSeccionOpciones from './EditorSubcomponentes/ModalEditorSeccionOpciones.vue'

const props = defineProps<{
  abierto: boolean
  pregunta: PreguntaEncuesta | null
  todasLasPreguntas?: PreguntaEncuesta[]
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', pregunta: PreguntaEncuesta): void
}>()

const { tiposAlertas, tiposActivos } = useTiposAlertas()

const copia = ref<PreguntaEncuesta | null>(null)

watch(
  () => props.pregunta,
  (nueva) => {
    if (nueva) {
      copia.value = JSON.parse(JSON.stringify(nueva))
      if (copia.value) {
        if (copia.value.esCondicional === undefined) copia.value.esCondicional = false
        if (copia.value.deteccionQuejas === undefined) copia.value.deteccionQuejas = Boolean(copia.value.solicitarPorQueSiNegativo)
      }
    } else {
      copia.value = null
    }
  },
  { immediate: true }
)

const toggleDeteccionQuejas = () => {
  if (!copia.value) return
  const estadoActual = Boolean(copia.value.deteccionQuejas || copia.value.solicitarPorQueSiNegativo)
  const nuevoEstado = !estadoActual
  copia.value.deteccionQuejas = nuevoEstado
  copia.value.solicitarPorQueSiNegativo = nuevoEstado
}

const tiposDisponibles: Array<{ valor: PreguntaEncuesta['tipo']; etiqueta: string }> = [
  { valor: 'escala', etiqueta: 'Escala (Excelente → Muy Mal)' },
  { valor: 'multiple', etiqueta: 'Selección múltiple' },
  { valor: 'si_no', etiqueta: 'Sí / No' },
  { valor: 'texto', etiqueta: 'Respuesta abierta (texto libre)' }
]

const toggleAlerta = (opc: OpcionPregunta) => {
  opc.esAlerta = !opc.esAlerta
  if (opc.esAlerta && !opc.tipoAlertaId) {
    const primera = tiposActivos.value[0] || tiposAlertas.value[0]
    if (primera) {
      opc.tipoAlertaId = primera.id
      opc.nombreAlerta = primera.nombre
      opc.severidadAlerta = primera.severidad
    }
  }
}

const alCambiarSelectAlerta = (opc: OpcionPregunta) => {
  if (!opc.tipoAlertaId) {
    opc.esAlerta = false
    opc.nombreAlerta = undefined
    opc.severidadAlerta = undefined
    return
  }
  const tipo = tiposAlertas.value.find(t => t.id === opc.tipoAlertaId)
  if (tipo) {
    opc.esAlerta = true
    opc.nombreAlerta = tipo.nombre
    opc.severidadAlerta = tipo.severidad
  }
}

const asignarPuntajePreseteado = (payload: { opc: OpcionPregunta; val: number }) => {
  payload.opc.valor = payload.val
}

const agregarOpcion = () => {
  if (!copia.value) return
  const nuevoId = `opc-custom-${Date.now()}`
  copia.value.opciones.push({
    id: nuevoId,
    texto: 'Nueva opción',
    valor: 5,
    esAlerta: false
  })
}

const eliminarOpcion = (index: number) => {
  if (!copia.value || copia.value.opciones.length <= 1) return
  copia.value.opciones.splice(index, 1)
}

const guardar = () => {
  if (!copia.value) return
  emit('guardar', JSON.parse(JSON.stringify(copia.value)))
  emit('cerrar')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="abierto && copia"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-['Poppins',sans-serif]"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('cerrar')" />

        <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
          
          <!-- Header -->
          <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-t-3xl text-white">
            <div class="flex items-center gap-2">
              <List class="w-4 h-4" />
              <h3 class="text-sm font-black">Editor Avanzado de Pregunta</h3>
            </div>
            <button type="button" @click="emit('cerrar')" class="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Cuerpo del Editor -->
          <div class="p-6 space-y-6 text-left">
            <!-- Metadata de la Pregunta -->
            <div class="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-400">Configuración General</h4>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Texto de la Pregunta</label>
                <textarea
                  v-model="copia.texto"
                  rows="3"
                  class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  placeholder="Escribe la pregunta..."
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Categoría / Módulo</label>
                  <input
                    v-model="copia.categoria"
                    type="text"
                    class="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-sky-600 dark:text-sky-400 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Ej: Módulo 2..."
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Pregunta</label>
                  <select
                    v-model="copia.tipo"
                    class="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option v-for="t in tiposDisponibles" :key="t.valor" :value="t.valor">
                      {{ t.etiqueta }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Subcomponente: Profundizar en el Tema -->
              <ModalEditorSeccionProfundizacion
                :copia="copia"
                @toggle="toggleDeteccionQuejas"
              />
            </div>

            <!-- Subcomponente: Opciones de Respuesta & Puntajes -->
            <ModalEditorSeccionOpciones
              :copia="copia"
              @agregarOpcion="agregarOpcion"
              @eliminarOpcion="eliminarOpcion"
              @asignarPuntaje="asignarPuntajePreseteado"
              @toggleAlerta="toggleAlerta"
              @cambiarSelectAlerta="alCambiarSelectAlerta"
            />
          </div>

          <!-- Footer Modal -->
          <div class="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 rounded-b-3xl">
            <BotonBase variante="secundario" @click="emit('cerrar')">
              Cancelar
            </BotonBase>
            <BotonBase variante="primario" @click="guardar">
              <template #iconoIzquierda>
                <Save class="w-4 h-4" />
              </template>
              Guardar Cambios
            </BotonBase>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
