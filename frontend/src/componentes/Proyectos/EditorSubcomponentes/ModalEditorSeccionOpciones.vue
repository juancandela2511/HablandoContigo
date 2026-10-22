<!--
  ============================================================================
  SUBCOMPONENTE OPCIONES DE RESPUESTA (ModalEditorSeccionOpciones.vue)
  ============================================================================
  Gestiona la lista de alternativas de respuesta, asignación rápida de puntajes
  netos (1-5 pts) y activación de alertas psicosociales por opción.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Trash2, Bell, Sparkles, AlertTriangle, Zap, Palette, GitBranch, Image as ImageIcon, Upload, X } from 'lucide-vue-next'
import { resolverColorExactoOpcion, obtenerColorDegradadoOpcion, comprimirImagenCliente, type PreguntaEncuesta, type OpcionPregunta } from '@/ia'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'

const props = defineProps<{
  copia: PreguntaEncuesta
  todasLasPreguntas?: PreguntaEncuesta[]
}>()

const emit = defineEmits<{
  (e: 'agregarOpcion'): void
  (e: 'eliminarOpcion', index: number): void
  (e: 'asignarPuntaje', payload: { opc: OpcionPregunta; val: number }): void
  (e: 'toggleAlerta', opc: OpcionPregunta): void
  (e: 'cambiarSelectAlerta', opc: OpcionPregunta): void
}>()

const { tiposAlertas } = useTiposAlertas()

const isDraggingOverOpcionId = ref<string | null>(null)

const procesarArchivoImagenOpcion = async (file: File, opc: OpcionPregunta) => {
  if (!file.type.startsWith('image/')) return
  const dataUrl = await comprimirImagenCliente(file)
  if (dataUrl) {
    opc.imagen = dataUrl
    opc.imagenRompecabezas = dataUrl
  }
}

const handleUploadImagenOpcion = (event: Event, opc: OpcionPregunta) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    procesarArchivoImagenOpcion(target.files[0], opc)
  }
}

const handleDragOverOpcion = (e: DragEvent, opc: OpcionPregunta) => {
  e.preventDefault()
  isDraggingOverOpcionId.value = opc.id
}

const handleDragLeaveOpcion = (e: DragEvent) => {
  e.preventDefault()
  isDraggingOverOpcionId.value = null
}

const handleDropImagenOpcion = (e: DragEvent, opc: OpcionPregunta) => {
  e.preventDefault()
  isDraggingOverOpcionId.value = null
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    procesarArchivoImagenOpcion(e.dataTransfer.files[0], opc)
  }
}

const removerImagenOpcion = (opc: OpcionPregunta) => {
  opc.imagen = undefined
  opc.imagenRompecabezas = undefined
}

/**
 * Activa o desactiva el salto condicional (Encendido / Apagado) para una opción específica
 */
const toggleSaltoOpcion = (opc: OpcionPregunta) => {
  if (opc.saltarHastaId !== undefined) {
    opc.saltarHastaId = undefined
  } else {
    const primeraPreg = props.todasLasPreguntas?.find(p => p.id !== props.copia.id)
    opc.saltarHastaId = primeraPreg ? primeraPreg.id : 'FINALIZAR'
  }
}

/**
 * Escala automáticamente los puntos de 5 a 1 de forma proporcional
 * según el número total de opciones de respuesta y asigna un degradado de color (Verde → Azul/Ámbar → Rojo).
 */
const autoDistribuirPuntajesYColores = () => {
  if (!props.copia.opciones || props.copia.opciones.length === 0) return
  const total = props.copia.opciones.length
  props.copia.opciones.forEach((opc, idx) => {
    let valorCalculado = 5
    if (total > 1) {
      const calculo = 5 - (idx * (4 / (total - 1)))
      valorCalculado = Math.max(1, Math.min(5, Math.round(calculo)))
    }
    opc.valor = valorCalculado
    opc.color = resolverColorExactoOpcion(opc, idx, total)
  })
}

const opcionesConAlerta = computed(() =>
  props.copia.opciones?.filter((o) => o.esAlerta) ?? []
)
</script>

<template>
  <div v-if="copia.tipo !== 'texto'" class="space-y-4 font-['Poppins',sans-serif]">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div class="flex items-center gap-2">
        <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Opciones de Respuesta & Puntajes Netos
        </h4>
        <span class="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
          {{ opcionesConAlerta.length }} alertas
        </span>
      </div>

      <button
        type="button"
        @click="autoDistribuirPuntajesYColores"
        class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
        title="Escala automáticamente los puntos de 5 a 1 de forma proporcional según el total de opciones"
      >
        <Zap class="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
        <span>Auto-Escala</span>
      </button>
    </div>

    <!-- Lista de opciones -->
    <div class="space-y-2.5">
      <div
        v-for="(opc, idx) in copia.opciones"
        :key="opc.id"
        @dragover.prevent="(e) => copia.modoPresentacion === 'rompecabezas' && handleDragOverOpcion(e, opc)"
        @dragleave.prevent="handleDragLeaveOpcion"
        @drop.prevent="(e) => copia.modoPresentacion === 'rompecabezas' && handleDropImagenOpcion(e, opc)"
        :class="[
          'p-3 rounded-2xl border transition-all space-y-2 max-w-full overflow-hidden relative group',
          isDraggingOverOpcionId === opc.id
            ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-500/10'
            : opc.esAlerta
            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 shadow-sm'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
        ]"
      >
        <!-- AVISO VISUAL AL ARRASTRAR UNA FOTO DIRECTAMENTE SOBRE ESTA OPCIÓN -->
        <div
          v-if="isDraggingOverOpcionId === opc.id && copia.modoPresentacion === 'rompecabezas'"
          class="absolute inset-0 bg-amber-500/90 dark:bg-amber-600/90 text-slate-950 flex items-center justify-center gap-2 z-30 font-black text-xs uppercase tracking-wider backdrop-blur-xs animate-in zoom-in-95 duration-200"
        >
          <Upload class="w-4 h-4 animate-bounce" />
          <span>Suelta aquí la foto para esta respuesta</span>
        </div>

        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap max-w-full relative z-10">
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

          <!-- Selector de Color del Punto de esta Opción (Círculo Perfecto) -->
          <label
            class="relative flex items-center justify-center cursor-pointer shrink-0"
            title="Seleccionar color del punto para esta opción"
          >
            <span
              class="w-6 h-6 rounded-full border border-black/20 dark:border-white/20 shadow-xs transition-transform hover:scale-110 shrink-0 block"
              :style="{ backgroundColor: opc.color || resolverColorExactoOpcion(opc, idx, copia.opciones.length) }"
            ></span>
            <input
              type="color"
              :value="opc.color || resolverColorExactoOpcion(opc, idx, copia.opciones.length)"
              @input="opc.color = ($event.target as HTMLInputElement).value"
              class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </label>

          <!-- Selector / Vista Previa de Imagen de la Opción (Solo en Modo Rompecabezas) -->
          <div
            v-if="copia.modoPresentacion === 'rompecabezas'"
            class="relative shrink-0 flex items-center gap-1"
          >
            <label
              class="relative flex items-center justify-center cursor-pointer shrink-0 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-400 text-slate-400 hover:text-amber-500 transition-all shadow-xs"
              title="Haz clic o arrastra una imagen directamente aquí para asignar la foto de esta respuesta"
            >
              <ImageIcon v-if="!opc.imagen" class="w-4 h-4" />
              <img v-else :src="opc.imagen" class="w-6 h-6 rounded-lg object-cover border border-amber-400 shadow-xs" />
              <input
                type="file"
                accept="image/*"
                @change="(e) => handleUploadImagenOpcion(e, opc)"
                class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>

            <button
              v-if="opc.imagen"
              type="button"
              @click="removerImagenOpcion(opc)"
              class="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
              title="Quitar foto de esta opción"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            v-model="opc.texto"
            type="text"
            :class="[
              'flex-1 min-w-0 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs outline-none focus:ring-2 transition-all',
              opc.esAlerta
                ? 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold focus:ring-rose-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-sky-400'
            ]"
            :placeholder="'Opción ' + (idx + 1)"
          />

          <!-- Presets dinámicos de puntaje (5p, 4p, 3p, 2p, 1p) -->
          <div class="flex items-center gap-1 shrink-0 select-none">
            <button
              v-for="p in [5, 4, 3, 2, 1]"
              :key="p"
              type="button"
              @click="emit('asignarPuntaje', { opc, val: p })"
              :class="[
                'px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer',
                opc.valor === p
                  ? 'bg-sky-600 text-white border-sky-700'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              ]"
            >
              {{ p }}p
            </button>
          </div>

          <!-- Toggle Alerta -->
          <button
            type="button"
            @click="emit('toggleAlerta', opc)"
            :class="[
              'p-2 rounded-xl border transition-all cursor-pointer shrink-0',
              opc.esAlerta ? 'bg-rose-600 text-white border-rose-700' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-rose-500'
            ]"
            title="Activar o desactivar alerta en esta opción"
          >
            <Bell class="w-3.5 h-3.5" />
          </button>

          <!-- Botón Encendido/Apagado de Salto / Omisión para esta Opción -->
          <button
            type="button"
            @click="toggleSaltoOpcion(opc)"
            :class="[
              'px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs',
              opc.saltarHastaId !== undefined
                ? 'bg-purple-600 text-white border-purple-700 shadow-purple-500/20 active:scale-95'
                : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300'
            ]"
            :title="opc.saltarHastaId !== undefined ? 'Salto condicional ENCENDIDO' : 'Encender salto condicional para esta opción'"
          >
            <GitBranch class="w-3.5 h-3.5" />
            <span class="text-[10px] uppercase font-mono tracking-tight">{{ opc.saltarHastaId !== undefined ? 'Salto ON' : 'Salto' }}</span>
          </button>

          <!-- Borrar Opcion -->
          <button
            type="button"
            @click="emit('eliminarOpcion', idx)"
            class="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
            title="Eliminar opción"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Selector de Salto / Omisión hasta otra pregunta (ÚNICAMENTE VISIBLE SI EL BOTÓN SALTO ESTÁ ENCENDIDO) -->
        <div
          v-if="opc.saltarHastaId !== undefined"
          class="pt-2 border-t border-purple-200/80 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-purple-100/70 dark:bg-purple-950/40 p-2.5 rounded-xl max-w-full overflow-hidden transition-all"
        >
          <div class="flex items-center gap-1.5 text-[11px] text-purple-800 dark:text-purple-300 font-bold shrink-0">
            <GitBranch class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Al elegir esta opción → Omitir y saltar a:</span>
          </div>
          <select
            v-model="opc.saltarHastaId"
            class="w-full min-w-0 flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 text-xs font-semibold text-purple-900 dark:text-purple-200 outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer truncate max-w-full"
          >
            <option value="FINALIZAR">🏁 Finalizar encuesta inmediatamente</option>
            <option
              v-for="(p, pIdx) in (todasLasPreguntas || []).filter(item => item.id !== copia.id)"
              :key="p.id"
              :value="p.id"
            >
              [Pregunta {{ pIdx + 1 }}] {{ p.texto ? p.texto.slice(0, 50) + '...' : p.id }}
            </option>
          </select>
        </div>

        <!-- Selector de Tipo de Alerta Asignada (Strict Overflow Control) -->
        <div
          v-if="opc.esAlerta"
          class="pt-2 border-t border-rose-200/80 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-rose-100/60 dark:bg-rose-950/40 p-2.5 rounded-xl max-w-full overflow-hidden"
        >
          <div class="flex items-center gap-1.5 text-[11px] text-rose-700 dark:text-rose-300 font-bold shrink-0">
            <AlertTriangle class="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span class="whitespace-nowrap">Asignar Tipo de Alerta:</span>
          </div>
          <select
            v-model="opc.tipoAlertaId"
            @change="emit('cambiarSelectAlerta', opc)"
            class="w-full min-w-0 flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200 outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer truncate max-w-full"
          >
            <option
              v-for="tipo in tiposAlertas"
              :key="tipo.id"
              :value="tipo.id"
            >
              [{{ tipo.severidad }} - Nivel {{ tipo.nivel }}] {{ tipo.nombre }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Agregar Opción -->
    <button
      type="button"
      @click="emit('agregarOpcion')"
      class="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
    >
      <Plus class="w-4 h-4 text-sky-500" />
      <span>Añadir Opción Personalizada</span>
    </button>
  </div>
</template>
