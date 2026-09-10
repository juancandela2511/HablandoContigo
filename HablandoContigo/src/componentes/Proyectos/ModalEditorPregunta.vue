<!--
  ============================================================================
  MODAL EDITOR AVANZADO DE PREGUNTA (ModalEditorPregunta.vue)
  ============================================================================
  Se abre al hacer doble clic sobre una tarjeta de pregunta en el editor de
  clima laboral. Permite:
    • Editar texto, categoría y tipo de pregunta.
    • Activar/desactivar ALERTA por cada opción de respuesta.
    • Añadir opciones personalizadas.
    • Eliminar opciones existentes.
-->

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  Save,
  Plus,
  Trash2,
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  List,
  AlignLeft,
  Sparkles,
  GitBranch,
  Split,
  Eye,
  EyeOff,
  CornerDownRight,
  Check
} from 'lucide-vue-next'
import type { PreguntaEncuesta, OpcionPregunta } from '@/Servicios/iaEncuestasService'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────
const props = defineProps<{
  abierto: boolean
  pregunta: PreguntaEncuesta | null
  todasLasPreguntas?: PreguntaEncuesta[]
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', pregunta: PreguntaEncuesta): void
}>()

const { tiposAlertas, tiposActivos, obtenerEtiquetaNivel } = useTiposAlertas()

// ─── Estado local del editor ──────────────────────────────────────────────────
const copia = ref<PreguntaEncuesta | null>(null)
const valorManualInput = ref('')

// Sincronizar copia cuando cambia la pregunta prop
watch(
  () => props.pregunta,
  (nueva) => {
    if (nueva) {
      copia.value = JSON.parse(JSON.stringify(nueva))
      if (copia.value) {
        if (copia.value.esCondicional === undefined) copia.value.esCondicional = false
        if (!copia.value.accionCondicion) copia.value.accionCondicion = 'mostrar_si'
        if (!copia.value.valoresDisparo) copia.value.valoresDisparo = []
      }
    } else {
      copia.value = null
    }
  },
  { immediate: true }
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const tiposDisponibles: Array<{ valor: PreguntaEncuesta['tipo']; etiqueta: string }> = [
  { valor: 'escala', etiqueta: 'Escala (Excelente → Muy Mal)' },
  { valor: 'multiple', etiqueta: 'Selección múltiple' },
  { valor: 'si_no', etiqueta: 'Sí / No' },
  { valor: 'texto', etiqueta: 'Respuesta abierta (texto libre)' }
]

const opcionesConAlerta = computed(() =>
  copia.value?.opciones.filter((o) => o.esAlerta) ?? []
)

// ─── Acciones sobre opciones ──────────────────────────────────────────────────
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

const togglePreguntaAncladaOpcion = (opc: OpcionPregunta) => {
  if (opc.preguntaAnclada) {
    opc.preguntaAnclada = undefined
  } else {
    opc.preguntaAnclada = {
      texto: '¿Por qué? Cuéntanos qué te ocurrió o cuál es el motivo:',
      tipo: 'texto',
      placeholder: 'Escribe aquí tu motivo con sinceridad...',
      obligatoria: true
    }
  }
}

const agregarOpcion = () => {
  if (!copia.value) return
  const nuevoId = `opc-custom-${Date.now()}`
  copia.value.opciones.push({
    id: nuevoId,
    texto: 'Nueva opción',
    valor: copia.value.opciones.length + 1,
    esAlerta: false
  })
}

const eliminarOpcion = (index: number) => {
  if (!copia.value || copia.value.opciones.length <= 1) return
  copia.value.opciones.splice(index, 1)
}

// ─── Lógica Condicional & Bifurcaciones ───────────────────────────────────────
const preguntasPadreDisponibles = computed(() => {
  if (!props.todasLasPreguntas) return []
  return props.todasLasPreguntas.filter(p => p.id !== copia.value?.id)
})

const preguntaPadreSeleccionada = computed(() => {
  if (!copia.value?.disparadorPor) return null
  return preguntasPadreDisponibles.value.find(p => p.id === copia.value?.disparadorPor) || null
})

const opcionesPreguntaPadre = computed(() => {
  if (!preguntaPadreSeleccionada.value) return ['Sí', 'No']
  if (preguntaPadreSeleccionada.value.tipo === 'si_no') {
    return ['Sí', 'No']
  }
  if (preguntaPadreSeleccionada.value.opciones && preguntaPadreSeleccionada.value.opciones.length > 0) {
    return preguntaPadreSeleccionada.value.opciones.map(o => o.texto)
  }
  return ['Sí', 'No']
})

const toggleEsCondicional = () => {
  if (!copia.value) return
  copia.value.esCondicional = !copia.value.esCondicional
  if (copia.value.esCondicional) {
    if (!copia.value.disparadorPor && preguntasPadreDisponibles.value.length > 0) {
      copia.value.disparadorPor = preguntasPadreDisponibles.value[0]?.id || ''
    }
    if (!copia.value.accionCondicion) {
      copia.value.accionCondicion = 'mostrar_si'
    }
    if (!copia.value.valoresDisparo || copia.value.valoresDisparo.length === 0) {
      copia.value.valoresDisparo = ['Sí']
    }
  }
}

const toggleValorDisparo = (val: string) => {
  if (!copia.value) return
  if (!copia.value.valoresDisparo) copia.value.valoresDisparo = []
  const idx = copia.value.valoresDisparo.findIndex(v => v.trim().toLowerCase() === val.trim().toLowerCase())
  if (idx >= 0) {
    copia.value.valoresDisparo.splice(idx, 1)
  } else {
    copia.value.valoresDisparo.push(val)
  }
}

const agregarValorManual = () => {
  if (!copia.value || !valorManualInput.value.trim()) return
  const val = valorManualInput.value.trim()
  if (!copia.value.valoresDisparo) copia.value.valoresDisparo = []
  if (!copia.value.valoresDisparo.some(v => v.trim().toLowerCase() === val.toLowerCase())) {
    copia.value.valoresDisparo.push(val)
  }
  valorManualInput.value = ''
}

const removerValorDisparo = (index: number) => {
  if (!copia.value || !copia.value.valoresDisparo) return
  copia.value.valoresDisparo.splice(index, 1)
}

const guardar = () => {
  if (!copia.value) return
  emit('guardar', JSON.parse(JSON.stringify(copia.value)))
  emit('cerrar')
}
</script>

<template>
  <!-- Teleport al body para overlay global -->
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
        <!-- Fondo oscuro -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="emit('cerrar')"
        />

        <!-- Panel del modal -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="abierto && copia"
            class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800"
          >

            <!-- ── HEADER ── -->
            <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-t-3xl">
              <div class="flex items-center gap-2">
                <List class="w-4 h-4 text-white" />
                <h3 class="text-sm font-black text-white">Editor Avanzado de Pregunta</h3>
              </div>
              <button
                type="button"
                @click="emit('cerrar')"
                class="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- ── CUERPO ── -->
            <div class="p-6 space-y-6">

              <!-- Sección 1: Metadata de la pregunta -->
              <div class="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-400">Configuración de la Pregunta</h4>

                <!-- Texto de la pregunta -->
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
                  <!-- Categoría / módulo -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Categoría / Módulo</label>
                    <input
                      v-model="copia.categoria"
                      type="text"
                      class="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-sky-600 dark:text-sky-400 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Ej: Módulo 2: Bienestar..."
                    />
                  </div>

                  <!-- Tipo de pregunta -->
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
              </div>

              <!-- ── Sección: Lógica Condicional / Salto de Preguntas ── -->
              <div class="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-sky-50/80 dark:from-indigo-950/40 dark:to-slate-900/70 border border-indigo-200/80 dark:border-indigo-900/50 space-y-4 shadow-sm">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-start sm:items-center gap-3">
                    <div class="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                      <GitBranch class="w-5 h-5" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                          Lógica Condicional / Salto de Preguntas
                        </h4>
                        <span
                          :class="[
                            'text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase',
                            copia.esCondicional
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          ]"
                        >
                          {{ copia.esCondicional ? 'Activa' : 'Inactiva' }}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Define si esta pregunta se <strong>muestra</strong> u <strong>omite</strong> según la respuesta previa del colaborador (ej. "si es Sí entonces pon esta, si es No omite").
                      </p>
                    </div>
                  </div>

                  <!-- Botón Switch Toggle -->
                  <button
                    type="button"
                    @click="toggleEsCondicional"
                    :class="[
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner',
                      copia.esCondicional ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    ]"
                    :title="copia.esCondicional ? 'Desactivar condición (mostrar siempre)' : 'Activar condición de visualización'"
                  >
                    <span
                      :class="[
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                        copia.esCondicional ? 'translate-x-5' : 'translate-x-0'
                      ]"
                    />
                  </button>
                </div>

                <!-- Panel de Configuración de la Condición -->
                <div v-if="copia.esCondicional" class="space-y-4 pt-3 border-t border-indigo-200/60 dark:border-indigo-900/40">
                  
                  <!-- 1. Pregunta Disparadora -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">1</span>
                      Pregunta de la que depende (Pregunta Disparadora):
                    </label>
                    <select
                      v-model="copia.disparadorPor"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
                    >
                      <option value="" disabled>Selecciona la pregunta anterior de la que depende...</option>
                      <option
                        v-for="(p, idx) in preguntasPadreDisponibles"
                        :key="p.id"
                        :value="p.id"
                      >
                        [{{ idx + 1 }}] {{ p.categoria ? p.categoria + ' — ' : '' }}{{ p.texto.slice(0, 80) }}{{ p.texto.length > 80 ? '...' : '' }}
                      </option>
                    </select>
                  </div>

                  <!-- 2. Comportamiento: Mostrar Si vs Omitir Si -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">2</span>
                      Regla de Salto / Comportamiento:
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        @click="copia.accionCondicion = 'mostrar_si'"
                        :class="[
                          'p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5',
                          copia.accionCondicion === 'mostrar_si' || !copia.accionCondicion
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/30 font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                        ]"
                      >
                        <Eye class="w-4 h-4 shrink-0" />
                        <div>
                          <div class="text-xs font-bold">MOSTRAR SOLO SI responde:</div>
                          <div class="text-[10px] font-normal opacity-90">Si responde otra opción (ej: No), se omitirá por completo.</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        @click="copia.accionCondicion = 'omitir_si'"
                        :class="[
                          'p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5',
                          copia.accionCondicion === 'omitir_si'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-400/30 font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-400'
                        ]"
                      >
                        <EyeOff class="w-4 h-4 shrink-0" />
                        <div>
                          <div class="text-xs font-bold">OMITIR SI responde:</div>
                          <div class="text-[10px] font-normal opacity-90">Se salta esta pregunta si responde lo seleccionado.</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <!-- 3. Selección de Valores de Respuesta Disparadora -->
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span class="flex items-center gap-1.5">
                        <span class="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">3</span>
                        Opciones que activan la condición:
                      </span>
                      <span class="text-[10px] font-normal text-slate-400">Clic para marcar/desmarcar</span>
                    </label>

                    <!-- Chips de las opciones de la pregunta padre -->
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="opcTexto in opcionesPreguntaPadre"
                        :key="opcTexto"
                        type="button"
                        @click="toggleValorDisparo(opcTexto)"
                        :class="[
                          'px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 select-none',
                          copia.valoresDisparo?.some(v => v.trim().toLowerCase() === opcTexto.trim().toLowerCase())
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/30'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        ]"
                      >
                        <Check v-if="copia.valoresDisparo?.some(v => v.trim().toLowerCase() === opcTexto.trim().toLowerCase())" class="w-3.5 h-3.5" />
                        <span>{{ opcTexto }}</span>
                      </button>
                    </div>

                    <!-- Input para agregar valor manual si no está en la lista -->
                    <div class="flex items-center gap-2 pt-1">
                      <input
                        v-model="valorManualInput"
                        @keydown.enter.prevent="agregarValorManual"
                        type="text"
                        placeholder="Escribir valor manual (ej: Sí, No, Otro)..."
                        class="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        @click="agregarValorManual"
                        class="px-3.5 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        + Agregar
                      </button>
                    </div>

                    <!-- Lista de valores seleccionados -->
                    <div v-if="copia.valoresDisparo && copia.valoresDisparo.length > 0" class="flex flex-wrap items-center gap-1.5 pt-1">
                      <span class="text-[10px] text-slate-400 font-semibold">Valores activos:</span>
                      <span
                        v-for="(val, vIdx) in copia.valoresDisparo"
                        :key="vIdx"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-200 text-xs font-bold"
                      >
                        "{{ val }}"
                        <button
                          type="button"
                          @click="removerValorDisparo(vIdx)"
                          class="hover:text-rose-500 cursor-pointer ml-0.5 text-slate-400"
                          title="Quitar"
                        >
                          <X class="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                  </div>

                  <!-- 4. Resumen en vivo de la Lógica -->
                  <div class="p-3.5 rounded-2xl bg-indigo-100/60 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 text-xs space-y-1">
                    <div class="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Resumen de la Regla en Vivo:</span>
                    </div>
                    <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      <template v-if="copia.accionCondicion === 'omitir_si'">
                        Cuando el colaborador responda la pregunta disparadora: si responde <strong class="text-indigo-900 dark:text-white">"{{ (copia.valoresDisparo || []).join('" o "') || 'No' }}"</strong>, esta pregunta <span class="text-rose-600 dark:text-rose-400 font-black">se OMITIRÁ</span> de la encuesta. En caso contrario, se mostrará.
                      </template>
                      <template v-else>
                        Esta pregunta <span class="text-emerald-600 dark:text-emerald-400 font-black">se MOSTRARÁ únicamente</span> si el colaborador responde <strong class="text-indigo-900 dark:text-white">"{{ (copia.valoresDisparo || []).join('" o "') || 'Sí' }}"</strong> en la pregunta disparadora. Si responde cualquier otra opción (o "No"), <span class="text-rose-600 dark:text-rose-400 font-bold">se omitirá automáticamente</span>.
                      </template>
                    </p>
                  </div>

                </div>
              </div>

              <!-- Sección 2: Opciones de Respuesta -->
              <div
                v-if="copia.tipo !== 'texto'"
                class="space-y-4"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Opciones de Respuesta
                    </h4>
                    <p class="text-[11px] text-slate-400 mt-0.5">
                      Doble clic en la campana <span class="font-bold text-rose-500">🔔</span> para marcar una opción como ALERTA (se notificará al administrador).
                    </p>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                    {{ opcionesConAlerta.length }} alertas activas
                  </span>
                </div>

                <!-- Lista de opciones -->
                <div class="space-y-2.5">
                  <div
                    v-for="(opc, idx) in copia.opciones"
                    :key="opc.id"
                    :class="[
                      'p-3 rounded-2xl border transition-all space-y-2',
                      opc.esAlerta
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                    ]"
                  >
                    <!-- Fila Principal: Texto, Puntos, Toggle Alerta y Borrar -->
                    <div class="flex items-center gap-2.5">
                      <!-- Número de orden -->
                      <span
                        :class="[
                          'w-6 h-6 flex-shrink-0 rounded-full text-[10px] font-mono font-black flex items-center justify-center',
                          opc.esAlerta
                            ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        ]"
                      >
                        {{ idx + 1 }}
                      </span>

                      <!-- Input texto de la opción -->
                      <input
                        v-model="opc.texto"
                        type="text"
                        :class="[
                          'flex-1 min-w-0 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs outline-none focus:ring-2 transition-all',
                          opc.esAlerta
                            ? 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold focus:ring-rose-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-sky-400'
                        ]"
                        :placeholder="'Opción ' + (idx + 1) + ' (Ej. Más de 6 meses, Pésimo, etc.)'"
                      />

                      <!-- Input valor numérico -->
                      <input
                        v-model.number="opc.valor"
                        type="number"
                        min="0"
                        max="10"
                        class="w-14 flex-shrink-0 px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-center text-slate-600 dark:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400"
                        title="Puntaje / Valor numérico de la opción (1 = Crítico / Alerta, 5 = Excelente)"
                      />

                      <!-- Toggle Alerta -->
                      <button
                        type="button"
                        @click="toggleAlerta(opc)"
                        :class="[
                          'flex-shrink-0 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-bold transition-all cursor-pointer shadow-sm',
                          opc.esAlerta
                            ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-400/30'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-500'
                        ]"
                        :title="opc.esAlerta ? 'Desactivar alerta en esta opción' : 'Activar alerta y asociar a un tipo de alerta específico'"
                      >
                        <Bell v-if="opc.esAlerta" class="w-3.5 h-3.5" />
                        <BellOff v-else class="w-3.5 h-3.5" />
                        <span>{{ opc.esAlerta ? 'ALERTA' : '+ Alerta' }}</span>
                      </button>

                      <!-- Toggle Pregunta Anclada de Profundización -->
                      <button
                        type="button"
                        @click="togglePreguntaAncladaOpcion(opc)"
                        :class="[
                          'flex-shrink-0 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-bold transition-all cursor-pointer shadow-sm',
                          opc.preguntaAnclada
                            ? 'bg-sky-500 hover:bg-sky-600 text-white ring-2 ring-sky-400/30'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-950/40 text-slate-500 hover:text-sky-500'
                        ]"
                        :title="opc.preguntaAnclada ? 'Eliminar pregunta anclada de esta opción' : 'Desglosar pregunta interactiva si el usuario elige esta opción'"
                      >
                        <Sparkles class="w-3.5 h-3.5" />
                        <span>{{ opc.preguntaAnclada ? 'ANCLADA' : '+ Anclar' }}</span>
                      </button>

                      <!-- Eliminar opción -->
                      <button
                        type="button"
                        @click="eliminarOpcion(idx)"
                        :disabled="copia.opciones.length <= 1"
                        class="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Eliminar esta opción"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <!-- Fila Secundaria: ASOCIACIÓN DIRECTA CON TIPO DE ALERTA -->
                    <div
                      v-if="opc.esAlerta"
                      class="pt-2 border-t border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-rose-100/50 dark:bg-rose-950/40 p-2.5 rounded-xl"
                    >
                      <div class="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold shrink-0">
                        <AlertTriangle class="w-3.5 h-3.5 text-rose-500" />
                        <span>Asociar con Alerta:</span>
                      </div>

                      <div class="flex-1 min-w-0 flex items-center gap-2">
                        <select
                          v-model="opc.tipoAlertaId"
                          @change="alCambiarSelectAlerta(opc)"
                          class="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
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

                    <!-- Fila Terciaria: CONFIGURACIÓN DE PREGUNTA ANCLADA DE PROFUNDIZACIÓN -->
                    <div
                      v-if="opc.preguntaAnclada"
                      class="pt-2 border-t border-sky-200 dark:border-sky-900/50 flex flex-col gap-2 text-xs bg-sky-50/80 dark:bg-sky-950/40 p-3 rounded-xl"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold">
                          <Sparkles class="w-3.5 h-3.5 text-sky-500" />
                          <span>Desglose de Pregunta Anclada (Interactiva):</span>
                        </div>
                        <label class="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                          <input
                            v-model="opc.preguntaAnclada.obligatoria"
                            type="checkbox"
                            class="rounded text-sky-500 focus:ring-sky-400 cursor-pointer"
                          />
                          <span>Respuesta obligatoria</span>
                        </label>
                      </div>

                      <div class="space-y-1.5">
                        <input
                          v-model="opc.preguntaAnclada.texto"
                          type="text"
                          class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Texto de la pregunta que se desglosa (Ej: ¿Por qué? ¿Qué te pasó?)"
                        />
                        <input
                          v-model="opc.preguntaAnclada.placeholder"
                          type="text"
                          class="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Placeholder orientativo para el colaborador..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botón agregar opción -->
                <button
                  type="button"
                  @click="agregarOpcion"
                  class="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                >
                  <Plus class="w-4 h-4" />
                  Agregar opción de respuesta
                </button>

                <!-- Leyenda de alertas -->
                <div
                  v-if="opcionesConAlerta.length > 0"
                  class="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40"
                >
                  <div class="flex items-start gap-2">
                    <AlertTriangle class="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div class="space-y-1">
                      <p class="text-xs font-bold text-rose-700 dark:text-rose-300">
                        Opciones vinculadas a ALERTAS organizacionales:
                      </p>
                      <ul class="space-y-1">
                        <li
                          v-for="opc in opcionesConAlerta"
                          :key="opc.id"
                          class="text-[11px] text-rose-700 dark:text-rose-300 font-medium flex flex-wrap items-center gap-1.5 bg-rose-100/60 dark:bg-rose-950/50 p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40"
                        >
                          <span class="font-bold text-rose-900 dark:text-white">"{{ opc.texto }}"</span>
                          <span class="text-slate-400 font-mono">➔</span>
                          <span class="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                            {{ opc.nombreAlerta || 'Alerta Asignada' }}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Configuración para tipo texto (sin opciones) -->
              <div
                v-else
                class="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 space-y-4"
              >
                <div class="flex items-start gap-3">
                  <AlignLeft class="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-xs text-sky-700 dark:text-sky-300">
                      Las preguntas de <strong>texto libre</strong> no tienen opciones cerradas predefinidas. 
                      El colaborador podrá redactar su respuesta abierta.
                    </p>
                  </div>
                </div>

                <!-- Toggle de Alerta Psicosocial / Acoso en Texto Abierto -->
                <div class="pt-2 border-t border-sky-200/60 dark:border-sky-800/60 flex items-center justify-between gap-3">
                  <div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Supervisión de Alertas IA en esta Pregunta
                    </div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400">
                      Si se activa, el analizador de IA evaluará el texto libre buscando indicios de acoso, discriminación o riesgo psicosocial.
                    </div>
                  </div>

                  <button
                    type="button"
                    @click="copia.esSensibleAcoso = !copia.esSensibleAcoso"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none shrink-0',
                      copia.esSensibleAcoso
                        ? 'bg-rose-500 text-white shadow-md hover:bg-rose-600 ring-2 ring-rose-400/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50'
                    ]"
                  >
                    <Bell v-if="copia.esSensibleAcoso" class="w-3.5 h-3.5" />
                    <BellOff v-else class="w-3.5 h-3.5" />
                    <span>{{ copia.esSensibleAcoso ? 'Alerta IA Activa' : 'Activar Alerta IA' }}</span>
                  </button>
                </div>
              </div>

            </div>

            <!-- ── FOOTER ACCIONES ── -->
            <div class="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-3xl">
              <button
                type="button"
                @click="emit('cerrar')"
                class="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <BotonBase
                variante="primario"
                tamano="mediano"
                @click="guardar"
              >
                <template #iconoIzquierdo>
                  <Save class="w-4 h-4" />
                </template>
                Guardar Cambios
              </BotonBase>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
