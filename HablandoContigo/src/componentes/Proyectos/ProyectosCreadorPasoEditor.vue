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
import { Plus, Trash2, ShieldAlert, Send, Check, MessageSquare, ListChecks, Sliders, Bell, BellOff, AlertTriangle, GitBranch, Eye, EyeOff, Sparkles } from 'lucide-vue-next'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'

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

const { tiposAlertas, tiposActivos, obtenerEtiquetaNivel } = useTiposAlertas()

const toggleAlertaOpcion = (opt: OpcionPregunta) => {
  opt.esAlerta = !opt.esAlerta
  if (opt.esAlerta && !opt.tipoAlertaId) {
    const primera = tiposActivos.value[0] || tiposAlertas.value[0]
    if (primera) {
      opt.tipoAlertaId = primera.id
      opt.nombreAlerta = primera.nombre
      opt.severidadAlerta = primera.severidad
    }
  }
}

const alCambiarSelectAlerta = (opt: OpcionPregunta) => {
  if (!opt.tipoAlertaId) {
    opt.esAlerta = false
    opt.nombreAlerta = undefined
    opt.severidadAlerta = undefined
    return
  }
  const tipo = tiposAlertas.value.find(t => t.id === opt.tipoAlertaId)
  if (tipo) {
    opt.esAlerta = true
    opt.nombreAlerta = tipo.nombre
    opt.severidadAlerta = tipo.severidad
  }
}

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

const toggleCondicionalPregunta = (preg: PreguntaEncuesta) => {
  preg.esCondicional = !preg.esCondicional
  if (preg.esCondicional) {
    if (!preg.disparadorPor) {
      const padre = props.preguntasGeneradas.find(p => p.id !== preg.id)
      if (padre) preg.disparadorPor = padre.id
    }
    if (!preg.accionCondicion) preg.accionCondicion = 'mostrar_si'
    if (!preg.valoresDisparo || preg.valoresDisparo.length === 0) preg.valoresDisparo = ['Sí']
  }
}

const toggleValorDisparoPregunta = (preg: PreguntaEncuesta, val: string) => {
  if (!preg.valoresDisparo) preg.valoresDisparo = []
  const idx = preg.valoresDisparo.findIndex(v => v.trim().toLowerCase() === val.trim().toLowerCase())
  if (idx >= 0) {
    preg.valoresDisparo.splice(idx, 1)
  } else {
    preg.valoresDisparo.push(val)
  }
}

const obtenerOpcionesPadre = (disparadorId?: string) => {
  if (!disparadorId) return ['Sí', 'No']
  const padre = props.preguntasGeneradas.find(p => p.id === disparadorId)
  if (padre?.opciones && padre.opciones.length > 0) {
    return padre.opciones.map(o => o.texto)
  }
  return ['Sí', 'No']
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

            <span 
              v-if="preg.esCondicional"
              class="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1"
            >
              <GitBranch class="w-3 h-3" />
              Condicional ({{ preg.accionCondicion === 'omitir_si' ? 'Omitir si' : 'Si' }} "{{ (preg.valoresDisparo || []).join(', ') || 'Sí' }}")
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

          <div class="space-y-2.5">
            <div
              v-for="(opt, oIdx) in preg.opciones"
              :key="opt.id"
              :class="[
                'p-2.5 rounded-2xl border space-y-2 transition-all',
                opt.esAlerta
                  ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60'
                  : 'bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800'
              ]"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400 font-mono w-5 text-center">{{ oIdx + 1 }}.</span>
                
                <!-- Texto de la opción editable -->
                <input
                  v-model="opt.texto"
                  type="text"
                  placeholder="Texto de la opción (Ej. Más de 6 meses)"
                  :class="[
                    'flex-1 p-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1',
                    opt.esAlerta
                      ? 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold focus:ring-rose-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-sky-500'
                  ]"
                />

                <!-- Valor ponderado (1 a 5) -->
                <div class="flex items-center gap-1 shrink-0 px-2 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400">Pts:</span>
                  <select
                    v-model.number="opt.valor"
                    class="text-xs font-bold text-sky-600 dark:text-sky-400 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option :value="1">1</option>
                    <option :value="2">2</option>
                    <option :value="3">3</option>
                    <option :value="4">4</option>
                    <option :value="5">5</option>
                  </select>
                </div>

                <!-- Botón Alerta Toggle -->
                <button
                  type="button"
                  @click="toggleAlertaOpcion(opt)"
                  :class="[
                    'px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer select-none shrink-0',
                    opt.esAlerta
                      ? 'bg-rose-500 text-white shadow-sm hover:bg-rose-600 ring-2 ring-rose-400/30'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50'
                  ]"
                  :title="opt.esAlerta ? 'Desactivar alerta en esta opción' : 'Activar alerta y asociar a un tipo de alerta'"
                >
                  <Bell v-if="opt.esAlerta" class="w-3 h-3 text-white" />
                  <BellOff v-else class="w-3 h-3" />
                  <span>{{ opt.esAlerta ? 'ALERTA' : '+ Alerta' }}</span>
                </button>

                <!-- Eliminar opción -->
                <button
                  type="button"
                  @click="eliminarOpcionDePregunta(preg, oIdx)"
                  class="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Eliminar esta opción"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Selector de alerta vinculada si esAlerta está activo -->
              <div
                v-if="opt.esAlerta"
                class="pt-1.5 border-t border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-rose-100/50 dark:bg-rose-950/40 p-2 rounded-xl"
              >
                <div class="flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-300 font-bold shrink-0">
                  <AlertTriangle class="w-3 h-3 text-rose-500" />
                  <span>Vincular con Alerta:</span>
                </div>
                <select
                  v-model="opt.tipoAlertaId"
                  @change="alCambiarSelectAlerta(opt)"
                  class="w-full sm:w-auto flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-[11px] font-semibold text-rose-800 dark:text-rose-200 focus:outline-none cursor-pointer"
                >
                  <option
                    v-for="tipo in tiposAlertas"
                    :key="tipo.id"
                    :value="tipo.id"
                  >
                    [{{ obtenerEtiquetaNivel(tipo.nivel) }}] {{ tipo.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje informativo para preguntas de tipo texto libre -->
        <div v-else class="p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2">
          <MessageSquare class="w-4 h-4 text-sky-500 shrink-0" />
          <span>El colaborador responderá escribiendo libremente en una caja de texto sin límite de caracteres.</span>
        </div>

        <!-- ── LÓGICA CONDICIONAL Y SALTO DE PREGUNTA ── -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div class="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <GitBranch class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lógica Condicional (Salto de Pregunta)
                </span>
              </div>
              <button
                type="button"
                @click="toggleCondicionalPregunta(preg)"
                :class="[
                  'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  preg.esCondicional
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                ]"
              >
                {{ preg.esCondicional ? 'Condición Activa' : '+ Activar Condición' }}
              </button>
            </div>

            <div v-if="preg.esCondicional" class="space-y-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Depende de la pregunta:</label>
                  <select
                    v-model="preg.disparadorPor"
                    class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option
                      v-for="(p, pIdx) in preguntasGeneradas.filter(item => item.id !== preg.id)"
                      :key="p.id"
                      :value="p.id"
                    >
                      [{{ pIdx + 1 }}] {{ p.texto.slice(0, 50) }}...
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Comportamiento:</label>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      @click="preg.accionCondicion = 'mostrar_si'"
                      :class="[
                        'flex-1 p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1',
                        preg.accionCondicion === 'mostrar_si' || !preg.accionCondicion
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'
                      ]"
                    >
                      <Eye class="w-3.5 h-3.5" /> Mostrar si
                    </button>
                    <button
                      type="button"
                      @click="preg.accionCondicion = 'omitir_si'"
                      :class="[
                        'flex-1 p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1',
                        preg.accionCondicion === 'omitir_si'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'
                      ]"
                    >
                      <EyeOff class="w-3.5 h-3.5" /> Omitir si
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Respuestas de la pregunta anterior que activan esta condición:
                </label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="opc in obtenerOpcionesPadre(preg.disparadorPor)"
                    :key="opc"
                    type="button"
                    @click="toggleValorDisparoPregunta(preg, opc)"
                    :class="[
                      'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                      preg.valoresDisparo?.some(v => v.trim().toLowerCase() === opc.trim().toLowerCase())
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    ]"
                  >
                    {{ opc }}
                  </button>
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-indigo-100/70 dark:bg-indigo-950/60 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span>
                  {{ preg.accionCondicion === 'omitir_si'
                    ? `Si responde "${(preg.valoresDisparo || []).join(', ') || 'No'}", esta pregunta se OMITIRÁ.`
                    : `Esta pregunta se MOSTRARÁ solo si responde "${(preg.valoresDisparo || []).join(', ') || 'Sí'}". Si no, se omitirá.` }}
                </span>
              </div>
            </div>
          </div>
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
