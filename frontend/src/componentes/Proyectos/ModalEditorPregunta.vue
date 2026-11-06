<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Save, List, BarChart3, GitBranch, Image as ImageIcon, Upload, Trash2, Clock } from 'lucide-vue-next'
import { resolverColorExactoOpcion, obtenerColorDegradadoOpcion, comprimirImagenCliente, type PreguntaEncuesta, type OpcionPregunta } from '@/ia'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import { useAnclajeGraficos, type TipoGraficoAnclado } from '@/Almacenes/useAnclajeGraficos'
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
const { graficosAnclados, actualizarOCrearGraficoParaPregunta } = useAnclajeGraficos()

const copia = ref<PreguntaEncuesta | null>(null)
const tipoGraficoSeleccionado = ref<TipoGraficoAnclado>('barras')

const isDraggingImagen = ref<boolean>(false)

const procesarArchivoImagen = async (file: File) => {
  if (!copia.value || !file.type.startsWith('image/')) return
  const dataUrl = await comprimirImagenCliente(file)
  if (copia.value && dataUrl) {
    copia.value.imagen = dataUrl
    copia.value.imagenRompecabezas = dataUrl
  }
}

const handleUploadImagen = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    procesarArchivoImagen(target.files[0])
  }
}

const handleDragOverImagen = (e: DragEvent) => {
  e.preventDefault()
  isDraggingImagen.value = true
}

const handleDragLeaveImagen = (e: DragEvent) => {
  e.preventDefault()
  isDraggingImagen.value = false
}

const handleDropImagen = (e: DragEvent) => {
  e.preventDefault()
  isDraggingImagen.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    procesarArchivoImagen(e.dataTransfer.files[0])
  }
}

const removerImagen = () => {
  if (copia.value) {
    copia.value.imagen = undefined
    copia.value.imagenRompecabezas = undefined
  }
}

const tiposGraficosDisponibles: Array<{ valor: TipoGraficoAnclado; etiqueta: string }> = [
  { valor: 'barras', etiqueta: 'Gráfico de Barras' },
  { valor: 'pastel', etiqueta: 'Gráfico de Pastel' }
]

watch(
  () => props.pregunta,
  (nueva) => {
    if (nueva) {
      copia.value = JSON.parse(JSON.stringify(nueva))
      if (copia.value) {
        if (copia.value.esCondicional === undefined) copia.value.esCondicional = false
        const comActivo = (copia.value as any).comentariosHabilitados === false || copia.value.deteccionQuejas === false || copia.value.solicitarPorQueSiNegativo === false ? false : ((copia.value as any).comentariosHabilitados !== undefined ? Boolean((copia.value as any).comentariosHabilitados) : Boolean(copia.value.deteccionQuejas ?? copia.value.solicitarPorQueSiNegativo ?? true))
        copia.value.deteccionQuejas = comActivo
        copia.value.solicitarPorQueSiNegativo = comActivo
        ;(copia.value as any).comentariosHabilitados = comActivo
        if (copia.value.activarSaltoCondicional === undefined) {
          copia.value.activarSaltoCondicional = Boolean(copia.value.saltarHastaId || copia.value.opciones?.some(o => o.saltarHastaId))
        }

        // Cargar parámetros del gráfico anclado si ya existe
        const grafico = graficosAnclados.value.find(g => g.idPregunta === nueva.id || (g.textoPregunta && g.textoPregunta.trim().toLowerCase() === nueva.texto.trim().toLowerCase()))
        if (grafico) {
          tipoGraficoSeleccionado.value = (copia.value.tipoGrafico === 'pastel' || grafico.tipoGrafico === 'pastel') ? 'pastel' : 'barras'
        } else if (copia.value.tipoGrafico) {
          tipoGraficoSeleccionado.value = copia.value.tipoGrafico === 'pastel' ? 'pastel' : 'barras'
        } else {
          tipoGraficoSeleccionado.value = 'barras'
        }
      }
    } else {
      copia.value = null
    }
  },
  { immediate: true }
)

const toggleDeteccionQuejas = () => {
  if (!copia.value) return
  copia.value.tipoGrafico = tipoGraficoSeleccionado.value; const estadoCom = (copia.value as any).comentariosHabilitados === false || copia.value.deteccionQuejas === false || copia.value.solicitarPorQueSiNegativo === false ? false : Boolean((copia.value as any).comentariosHabilitados ?? copia.value.deteccionQuejas ?? true); ;(copia.value as any).comentariosHabilitados = estadoCom; copia.value.deteccionQuejas = estadoCom; copia.value.solicitarPorQueSiNegativo = estadoCom
  const estadoActual = Boolean(
    copia.value.deteccionQuejas ||
    copia.value.solicitarPorQueSiNegativo ||
    (copia.value as any).comentariosHabilitados
  )
  const nuevoEstado = !estadoActual
  copia.value.deteccionQuejas = nuevoEstado
  copia.value.solicitarPorQueSiNegativo = nuevoEstado
  ;(copia.value as any).comentariosHabilitados = nuevoEstado
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
  copia.value.tipoGrafico = tipoGraficoSeleccionado.value; const estadoCom = (copia.value as any).comentariosHabilitados === false || copia.value.deteccionQuejas === false || copia.value.solicitarPorQueSiNegativo === false ? false : Boolean((copia.value as any).comentariosHabilitados ?? copia.value.deteccionQuejas ?? true); ;(copia.value as any).comentariosHabilitados = estadoCom; copia.value.deteccionQuejas = estadoCom; copia.value.solicitarPorQueSiNegativo = estadoCom
  const nuevoId = `opc-custom-${Date.now()}`
  const total = copia.value.opciones.length + 1

  copia.value.opciones.push({
    id: nuevoId,
    texto: `Nueva opción ${total}`,
    valor: 1,
    color: '#ef4444',
    esAlerta: false
  })

  // Recalibración dinámica de puntajes (5 a 1) y degradado de color (Verde → Azul/Ámbar → Rojo)
  copia.value.opciones.forEach((opc, idx) => {
    let valorCalculado = 5
    if (total > 1) {
      const calculo = 5 - (idx * (4 / (total - 1)))
      valorCalculado = Math.max(1, Math.min(5, Math.round(calculo)))
    }
    opc.valor = valorCalculado
    opc.color = resolverColorExactoOpcion(opc, idx, total)
  })
}

const eliminarOpcion = (index: number) => {
  if (!copia.value || copia.value.opciones.length <= 1) return
  copia.value.opciones.splice(index, 1)
}

const guardar = () => {
  if (!copia.value) return
  copia.value.tipoGrafico = tipoGraficoSeleccionado.value; const estadoCom = (copia.value as any).comentariosHabilitados === false || copia.value.deteccionQuejas === false || copia.value.solicitarPorQueSiNegativo === false ? false : Boolean((copia.value as any).comentariosHabilitados ?? copia.value.deteccionQuejas ?? true); ;(copia.value as any).comentariosHabilitados = estadoCom; copia.value.deteccionQuejas = estadoCom; copia.value.solicitarPorQueSiNegativo = estadoCom
  // Sincronizar / guardar la configuración de la gráfica de la pregunta
  actualizarOCrearGraficoParaPregunta(
    copia.value,
    tipoGraficoSeleccionado.value
  )
  emit('guardar', JSON.parse(JSON.stringify(copia.value)))
  emit('cerrar')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="abierto && copia"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 font-['Poppins',sans-serif]"
      >
        <div class="absolute inset-0 bg-black/65 backdrop-blur-md" @click="emit('cerrar')" />

        <div class="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left">
          
          <!-- Encabezado del Editor -->
          <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 text-white shrink-0 shadow-md">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <List class="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 class="text-sm sm:text-base font-black tracking-tight">Editor Avanzado de Pregunta</h3>
               
              </div>
            </div>
            <button
              type="button"
              @click="emit('cerrar')"
              class="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer active:scale-95"
              title="Cerrar modal"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Cuerpo Principal: Grilla Responsiva de 2 Columnas -->
          <div class="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 bg-slate-50/50 dark:bg-slate-950/40">
            
            <!-- COLUMNA IZQUIERDA (7/12): PREGUNTA Y OPCIONES DE RESPUESTA (Toda la pantalla principal) -->
            <div class="lg:col-span-7 space-y-5">
              
              <!-- Texto Enunciado de la Pregunta -->
              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Texto de la Pregunta
                  </label>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                    Visualización Encuestado
                  </span>
                </div>
                <textarea
                  v-model="copia.texto"
                  rows="3"
                  class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
                  placeholder="Escribe la pregunta completa aquí..."
                />
              </div>

              <!-- Subcomponente: Opciones de Respuesta & Puntajes Netos -->
              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <ModalEditorSeccionOpciones
                  :copia="copia"
                  :todas-las-preguntas="todasLasPreguntas"
                  @agregarOpcion="agregarOpcion"
                  @eliminarOpcion="eliminarOpcion"
                  @asignarPuntaje="asignarPuntajePreseteado"
                  @toggleAlerta="toggleAlerta"
                  @cambiarSelectAlerta="alCambiarSelectAlerta"
                />
              </div>
            </div>

            <!-- COLUMNA DERECHA (5/12): CONFIGURACIÓN GENERAL, PROFUNDIZACIÓN Y GRÁFICA DE LA PREGUNTA -->
            <div class="lg:col-span-5 space-y-5">
              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                  Configuración General
                </h4>

                <!-- Categoría / Módulo -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Categoría / Módulo</label>
                  <input
                    v-model="copia.categoria"
                    type="text"
                    class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-sky-600 dark:text-sky-400 font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    placeholder="Ej: Módulo 2: Bienestar..."
                  />
                </div>

                <!-- Tipo de Pregunta -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Pregunta</label>
                  <select
                    v-model="copia.tipo"
                    class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-semibold outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer transition-all"
                  >
                    <option v-for="t in tiposDisponibles" :key="t.valor" :value="t.valor">
                      {{ t.etiqueta }}
                    </option>
                  </select>
                </div>

                <!-- Modo de Presentación de la Respuesta -->
                <div v-if="copia.tipo !== 'texto'" class="space-y-2">
                  <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Modo de Presentación de la Respuesta</label>
                  <select
                    v-model="copia.modoPresentacion"
                    class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-indigo-600 dark:text-indigo-400 font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                  >
                    <option :value="undefined"> Dar clic</option>
                    <option value="rompecabezas"> Rompecabezas </option>
                    <option value="deslizador_emocional"> Deslizador de Emoción </option>
                    <option value="deslizador_tiempo"> Deslizador de Tiempo </option>
                    <option value="juego_gusanito"> Juego del Gusanito</option>
                    <option value="semaforo"> Semáforo Interactivo</option>
                    <option value="termometro"> Termómetro Interactivo </option>
                    <option value="palanca_sino">  Palanca </option>
                  </select>

                  <!-- CONFIGURACIÓN DE LÍMITE MÁXIMO DE EDAD / TIEMPO DEL GRADUADOR (EN MESES O AÑOS) -->
                  <div v-if="copia.modoPresentacion === 'deslizador_tiempo'" class="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <Clock class="w-4 h-4 text-indigo-500" />
                        Máximo de Edad / Tiempo del Graduador
                      </label>
                      <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Límite del deslizador</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-600 dark:text-slate-400">Máximo en Años</label>
                        <div class="flex items-center gap-1.5">
                          <input
                            :value="copia.maxAnos ?? (copia.maxMeses ? Math.round(copia.maxMeses / 12) : 5)"
                            @input="(e) => {
                              const v = Math.max(1, Number((e.target as HTMLInputElement).value) || 1);
                              copia!.maxAnos = v;
                              copia!.maxMeses = v * 12;
                            }"
                            type="number"
                            min="1"
                            max="50"
                            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ej: 5"
                          />
                          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">años</span>
                        </div>
                      </div>

                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-600 dark:text-slate-400">Máximo en Meses</label>
                        <div class="flex items-center gap-1.5">
                          <input
                            :value="copia.maxMeses ?? ((copia.maxAnos || 5) * 12)"
                            @input="(e) => {
                              const m = Math.max(1, Number((e.target as HTMLInputElement).value) || 12);
                              copia!.maxMeses = m;
                              copia!.maxAnos = Math.max(1, Math.ceil(m / 12));
                            }"
                            type="number"
                            min="1"
                            max="600"
                            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ej: 60"
                          />
                          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">meses</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- SECCIÓN DE CARGA / ARRASTRE DE IMAGEN (SOLO DISPONIBLE CUANDO SE ELIGE MODO ROMPECABEZAS) -->
                  <div v-if="copia.modoPresentacion === 'rompecabezas'" class="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <ImageIcon class="w-4 h-4 text-indigo-500" />
                        Imagen Revelada al Encajar Rompecabezas
                      </label>
                      <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Opcional (Arrastra o haz clic)</span>
                    </div>

                    <!-- Imagen previsualizada si ya tiene una -->
                    <div
                      v-if="copia.imagen || copia.imagenRompecabezas"
                      class="relative group rounded-xl overflow-hidden border border-indigo-300 dark:border-indigo-700 max-h-48 bg-slate-950 flex items-center justify-center p-2"
                    >
                      <img :src="copia.imagen || copia.imagenRompecabezas" alt="Imagen Rompecabezas" class="max-h-44 w-auto object-contain rounded-lg shadow-md" />
                      <button
                        type="button"
                        @click="removerImagen"
                        class="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-700 transition-all cursor-pointer"
                        title="Eliminar imagen"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>

                    <!-- Dropzone con soporte para Arrastrar y Soltar (Drag & Drop) y Clic -->
                    <div v-else class="relative">
                      <input
                        type="file"
                        accept="image/*"
                        @change="handleUploadImagen"
                        class="hidden"
                        id="input-imagen-pregunta-general"
                      />
                      <label
                        for="input-imagen-pregunta-general"
                        @dragover="handleDragOverImagen"
                        @dragleave="handleDragLeaveImagen"
                        @drop="handleDropImagen"
                        :class="[
                          'flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center group select-none',
                          isDraggingImagen
                            ? 'border-emerald-400 bg-emerald-500/20 scale-[1.02] ring-4 ring-emerald-400/30'
                            : 'border-indigo-300 dark:border-indigo-700/80 bg-white dark:bg-slate-900 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/30'
                        ]"
                      >
                        <Upload class="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform mb-1.5" />
                        <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {{ isDraggingImagen ? '¡Suelta la imagen aquí!' : 'Haz clic o arrastra la imagen del rompecabezas aquí' }}
                        </span>
                        <span class="text-[9.5px] text-slate-400 mt-0.5">
                          PNG, JPG, SVG o WEBP que se revelará al encajar la pieza
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Subcomponente Compacto: Profundización / Comentarios -->
                <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <label class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Comentarios
                  </label>
                  <ModalEditorSeccionProfundizacion
                    :copia="copia"
                    @toggle="toggleDeteccionQuejas"
                  />
                </div>

                <!-- SECCIÓN: CONFIGURACIÓN DE LA GRÁFICA DE LA PREGUNTA (Crear o Editar Gráfico) -->
                <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <BarChart3 class="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Gráfica 
                      </h5>
                      
                    </div>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-cyan-50/80 dark:from-emerald-950/30 dark:via-slate-900/80 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3 shadow-xs">
                    
                    <!-- Selector de Tipo de Gráfico -->
                    <div class="space-y-1">
                      <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Tipo de Gráfico
                      </label>
                      <select
                        v-model="tipoGraficoSeleccionado"
                        class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                      >
                        <option v-for="g in tiposGraficosDisponibles" :key="g.valor" :value="g.valor">
                          {{ g.etiqueta }}
                        </option>
                      </select>
                    </div>


                    <!-- Indicador informativo -->
                    <div class="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-900/40 text-[10px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span class="font-bold">Dashboard en vivo:</span>
                      <span class="font-black uppercase text-sky-600 dark:text-sky-400">Reflejo 100% Automático</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Pie del Modal (Acciones Principales) -->
          <div class="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 rounded-b-3xl shrink-0">
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
