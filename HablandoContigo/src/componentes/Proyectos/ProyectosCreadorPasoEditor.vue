<!--
  ============================================================================
  COMPONENTE GENERADOR PASO 2: EDITOR COMPLETO DE PREGUNTAS Y OPCIONES
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Controla la personalización y edición profunda del cuestionario:
  - Edición del título y mensaje de propósito.
  - Edición de enunciados, tipos (escala, opción múltiple, texto libre) y categorías.
  - Edición granular de cada opción de respuesta (texto, valor ponderado, marca de alerta).
  - Adición y eliminación de opciones y preguntas completas.
  - Soporte de Guardar Cambios para encuestas existentes o Publicar para nuevas.
-->

<script setup lang="ts">
import type { PreguntaEncuesta, OpcionPregunta } from '@/Servicios/iaEncuestasService'
import { Plus, Trash2, ShieldAlert, Send, Check, MessageSquare, ListChecks, Sliders } from 'lucide-vue-next'

const props = defineProps<{
  tituloEncuesta: string
  descripcionEncuesta: string
  preguntasGeneradas: PreguntaEncuesta[]
  preguntasSeguimiento: PreguntaEncuesta[]
  esModoEdicion?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:tituloEncuesta', valor: string): void
  (e: 'update:descripcionEncuesta', valor: string): void
  (e: 'volverAlPrompt'): void
  (e: 'agregarPregunta'): void
  (e: 'eliminarPregunta', id: string): void
  (e: 'publicarEncuesta'): void
}>()

const agregarOpcionAPregunta = (preg: PreguntaEncuesta) => {
  const nuevoId = `opt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 4)}`
  preg.opciones.push({
    id: nuevoId,
    texto: `Nueva Opción ${preg.opciones.length + 1}`,
    valor: 3,
    esAlerta: false
  })
}

const eliminarOpcionDePregunta = (preg: PreguntaEncuesta, index: number) => {
  if (preg.opciones.length <= 1) {
    alert('La pregunta debe conservar al menos una opción o cámbiala a tipo texto abierto.')
    return
  }
  preg.opciones.splice(index, 1)
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Encabezado del Formulario -->
    <div class="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-6 shadow-xl space-y-4 backdrop-blur-xl">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase text-sky-600 dark:text-sky-400 tracking-wider">
          {{ esModoEdicion ? 'MODO EDICIÓN: EDITAR PREGUNTAS Y RESPUESTAS EN SUPABASE' : 'PASO 2: REVISIÓN Y PERSONALIZACIÓN DE PREGUNTAS' }}
        </span>
        <button
          v-if="!esModoEdicion"
          @click="$emit('volverAlPrompt')"
          class="text-xs text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
        >
          Volver a editar prompt
        </button>
      </div>

      <!-- Título Editable -->
      <div class="space-y-1 text-left">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Título de la Encuesta</label>
        <input
          :value="tituloEncuesta"
          @input="$emit('update:tituloEncuesta', ($event.target as HTMLInputElement).value)"
          type="text"
          class="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:border-sky-500"
        />
      </div>

      <!-- Descripción Editable -->
      <div class="space-y-1 text-left">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Mensaje de Confidencialidad y Propósito</label>
        <textarea
          :value="descripcionEncuesta"
          @input="$emit('update:descripcionEncuesta', ($event.target as HTMLTextAreaElement).value)"
          rows="2"
          class="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 resize-none"
        ></textarea>
      </div>
    </div>

    <!-- Lista de Preguntas Generadas -->
    <div class="space-y-4">
      
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Preguntas del Cuestionario ({{ preguntasGeneradas.length }})</span>
          <span class="text-[11px] text-slate-500 font-normal">Edita textos, opciones de respuesta o agrega nuevas</span>
        </h3>

        <button
          @click="$emit('agregarPregunta')"
          class="text-xs px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Agregar Pregunta</span>
        </button>
      </div>

      <!-- Tarjeta de cada Pregunta con editor profundo -->
      <div
        v-for="(preg, index) in preguntasGeneradas"
        :key="preg.id"
        class="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 space-y-4 relative group hover:border-sky-500/40 transition-all shadow-md text-left"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          
          <div class="flex flex-wrap items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center">
              {{ index + 1 }}
            </span>

            <!-- Categoría Editable -->
            <input
              v-model="preg.categoria"
              type="text"
              placeholder="Categoría"
              class="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500 w-44"
            />

            <!-- Selector de Tipo de Pregunta -->
            <select
              v-model="preg.tipo"
              class="text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500"
            >
              <option value="escala">Escala Ponderada</option>
              <option value="multiple">Opción Múltiple</option>
              <option value="texto">Pregunta Abierta (Texto)</option>
            </select>
            
            <span 
              v-if="preg.esSensibleAcoso"
              class="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-1"
            >
              <ShieldAlert class="w-3 h-3" />
              Sensible
            </span>
          </div>

          <button
            @click="$emit('eliminarPregunta', preg.id)"
            title="Eliminar pregunta"
            class="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 class="w-4 h-4" />
          </button>

        </div>

        <!-- Input para editar enunciado de la pregunta -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Enunciado de la Pregunta</label>
          <input
            v-model="preg.texto"
            type="text"
            placeholder="Escribe el texto de la pregunta..."
            class="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>

        <!-- Editor de Opciones para preguntas tipo Escala o Múltiple -->
        <div v-if="preg.tipo !== 'texto'" class="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <ListChecks class="w-3.5 h-3.5 text-sky-500" />
              <span>Opciones de Respuesta y Calificación</span>
            </span>

            <button
              type="button"
              @click="agregarOpcionAPregunta(preg)"
              class="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Plus class="w-3 h-3" />
              <span>Agregar Opción</span>
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(opt, oIdx) in preg.opciones"
              :key="opt.id"
              class="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800"
            >
              <span class="text-xs text-slate-400 font-mono w-5 text-center">{{ oIdx + 1 }}.</span>
              
              <!-- Texto de la opción editable -->
              <input
                v-model="opt.texto"
                type="text"
                placeholder="Texto de la opción"
                class="flex-1 p-1.5 rounded-xl bg-transparent border-0 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />

              <!-- Valor ponderado (1 a 5) -->
              <div class="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span class="text-[10px] text-slate-400">Pts:</span>
                <select
                  v-model.number="opt.valor"
                  class="text-xs font-bold text-sky-600 dark:text-sky-400 bg-transparent focus:outline-none"
                >
                  <option :value="1">1</option>
                  <option :value="2">2</option>
                  <option :value="3">3</option>
                  <option :value="4">4</option>
                  <option :value="5">5</option>
                </select>
              </div>

              <!-- Eliminar opción -->
              <button
                type="button"
                @click="eliminarOpcionDePregunta(preg, oIdx)"
                class="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                title="Eliminar esta opción"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje informativo para preguntas de tipo texto libre -->
        <div v-else class="p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2">
          <MessageSquare class="w-4 h-4 text-sky-500 shrink-0" />
          <span>El colaborador responderá escribiendo libremente en una caja de texto sin límite de caracteres.</span>
        </div>

      </div>

    </div>

    <!-- Botones de Acción Final -->
    <div class="flex items-center justify-end gap-3 pt-4">
      <button
        @click="$emit('volverAlPrompt')"
        class="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold cursor-pointer"
      >
        Cancelar
      </button>

      <button
        @click="$emit('publicarEncuesta')"
        class="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
      >
        <Check v-if="esModoEdicion" class="w-4 h-4" />
        <Send v-else class="w-4 h-4" />
        <span>{{ esModoEdicion ? 'Guardar Cambios en Supabase' : 'Publicar Encuesta y Generar Enlace' }}</span>
      </button>
    </div>

  </div>
</template>
