<!--
  ============================================================================
  MODAL DE EDICIÓN DE BLOQUE / MÓDULO (ModalEditarBloque.vue)
  ============================================================================
  Permite editar el nombre, descripción, color/gradiente, ícono y encuesta
  vinculada de un bloque en el editor de clima laboral.
-->

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  Palette,
  Layers,
  Link,
  Users,
  Heart,
  Handshake,
  Star,
  TrendingUp,
  GraduationCap,
  Telescope,
  MessageSquareText,
  Sparkles,
  Shield,
  Zap,
  Check
} from 'lucide-vue-next'
import type { MetadataBloque } from '@/Config/preguntasCuestionario'
import { useEncuestas } from '@/Almacenes/useEncuestas'

const props = defineProps<{
  abierto: boolean
  bloque: MetadataBloque | null
  esNuevo?: boolean
}>()

const emit = defineEmits<{
  (e: 'guardar', bloque: MetadataBloque): void
  (e: 'cerrar'): void
  (e: 'eliminar', idBloque: string): void
}>()

const { encuestas } = useEncuestas()

// Campos del formulario
const titulo = ref('')
const descripcion = ref('')
const icono = ref('Users')
const colorClase = ref('from-violet-600 to-purple-700')
const colorPersonalizado = ref('')
const idEncuestaVinculada = ref('')

const opcionesIconos = [
  { nombre: 'Users', componente: Users, label: 'Usuarios' },
  { nombre: 'Heart', componente: Heart, label: 'Bienestar' },
  { nombre: 'Handshake', componente: Handshake, label: 'Equipo' },
  { nombre: 'Star', componente: Star, label: 'Liderazgo' },
  { nombre: 'TrendingUp', componente: TrendingUp, label: 'Desarrollo' },
  { nombre: 'GraduationCap', componente: GraduationCap, label: 'Académico' },
  { nombre: 'Telescope', componente: Telescope, label: 'Visión' },
  { nombre: 'MessageSquareText', componente: MessageSquareText, label: 'Feedback' },
  { nombre: 'Sparkles', componente: Sparkles, label: 'Innovación' },
  { nombre: 'Shield', componente: Shield, label: 'Seguridad' },
  { nombre: 'Zap', componente: Zap, label: 'Agilidad' }
]

const presetsColores = [
  { nombre: 'Slate Pizarra', clase: 'from-slate-600 to-slate-800' },
  { nombre: 'Violeta / Púrpura', clase: 'from-violet-600 to-purple-700' },
  { nombre: 'Azul Celeste', clase: 'from-sky-600 to-blue-700' },
  { nombre: 'Naranja Cárnico', clase: 'from-amber-500 to-orange-600' },
  { nombre: 'Esmeralda Menta', clase: 'from-emerald-600 to-teal-700' },
  { nombre: 'Índigo Profundo', clase: 'from-indigo-600 to-violet-700' },
  { nombre: 'Rosa Neón', clase: 'from-rose-600 to-pink-700' },
  { nombre: 'Cian Turquesa', clase: 'from-cyan-600 to-teal-800' }
]

watch(
  () => props.bloque,
  (nuevoBloque) => {
    if (nuevoBloque) {
      titulo.value = nuevoBloque.titulo || ''
      descripcion.value = nuevoBloque.descripcion || ''
      icono.value = nuevoBloque.icono || 'Users'
      colorClase.value = nuevoBloque.colorClase || 'from-violet-600 to-purple-700'
      colorPersonalizado.value = nuevoBloque.colorPersonalizado || ''
      idEncuestaVinculada.value = nuevoBloque.idEncuestaVinculada || ''
    } else {
      titulo.value = ''
      descripcion.value = ''
      icono.value = 'Users'
      colorClase.value = 'from-violet-600 to-purple-700'
      colorPersonalizado.value = ''
      idEncuestaVinculada.value = ''
    }
  },
  { immediate: true }
)

const aplicarCambios = () => {
  if (!titulo.value.trim()) return

  const bloqueGuardado: MetadataBloque = {
    id: props.bloque?.id || `bloque-${Date.now()}`,
    numero: props.bloque?.numero || 1,
    titulo: titulo.value.trim(),
    descripcion: descripcion.value.trim(),
    icono: icono.value,
    colorClase: colorClase.value,
    textColorClase: 'text-white',
    colorPersonalizado: colorPersonalizado.value.trim() || undefined,
    idEncuestaVinculada: idEncuestaVinculada.value || undefined
  }

  emit('guardar', bloqueGuardado)
  emit('cerrar')
}

const solicitarEliminar = () => {
  if (props.bloque?.id && confirm(`¿Estás seguro de eliminar el bloque "${props.bloque.titulo}"?`)) {
    emit('eliminar', props.bloque.id)
    emit('cerrar')
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="abierto"
      class="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-['Poppins',sans-serif]"
      @click.self="emit('cerrar')"
    >
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left my-8">
        <!-- Encabezado del Modal con Previsualización -->
        <div
          class="p-6 text-white relative transition-all duration-300"
          :class="colorPersonalizado ? '' : ['bg-gradient-to-r', colorClase]"
          :style="colorPersonalizado ? { backgroundColor: colorPersonalizado } : {}"
        >
          <button
            type="button"
            @click="emit('cerrar')"
            class="absolute top-4 right-4 p-2 rounded-2xl bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>

          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <component :is="opcionesIconos.find(i => i.nombre === icono)?.componente || Layers" class="w-6 h-6 text-white" />
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/20 font-bold">
                {{ esNuevo ? 'Crear Nuevo Bloque' : `Editar Bloque #${bloque?.numero || 1}` }}
              </span>
              <h2 class="text-lg font-black tracking-tight mt-1 leading-tight">
                {{ titulo || 'Nombre del Bloque' }}
              </h2>
            </div>
          </div>
        </div>

        <!-- Formulario de Configuración -->
        <div class="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <!-- Título del Bloque -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers class="w-3.5 h-3.5 text-cyan-500" />
              Título del Bloque
            </label>
            <input
              v-model="titulo"
              type="text"
              placeholder="Ej: Compromiso y Lealtad Organizacional"
              class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            />
          </div>

          <!-- Descripción -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Descripción Corta
            </label>
            <textarea
              v-model="descripcion"
              rows="2"
              placeholder="Breve explicación de los temas que evalúa este bloque..."
              class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <!-- Selección de Ícono -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ícono Distintivo
            </label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="opc in opcionesIconos"
                :key="opc.nombre"
                type="button"
                @click="icono = opc.nombre"
                :title="opc.label"
                :class="[
                  'p-2.5 rounded-2xl flex items-center justify-center border transition-all cursor-pointer',
                  icono === opc.nombre
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                ]"
              >
                <component :is="opc.componente" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Color y Gradiente -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <Palette class="w-3.5 h-3.5 text-cyan-500" />
                Estilo de Color y Gradiente
              </span>
              <span v-if="colorPersonalizado" class="text-[10px] text-cyan-500 font-normal">Color Personalizado Activo</span>
            </label>

            <!-- Grid de Presets -->
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="preset in presetsColores"
                :key="preset.clase"
                type="button"
                @click="colorClase = preset.clase; colorPersonalizado = ''"
                :class="[
                  'h-9 rounded-xl bg-gradient-to-r flex items-center justify-center transition-all cursor-pointer border-2',
                  preset.clase,
                  colorClase === preset.clase && !colorPersonalizado ? 'border-white ring-2 ring-cyan-500 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                ]"
              >
                <Check v-if="colorClase === preset.clase && !colorPersonalizado" class="w-4 h-4 text-white drop-shadow" />
              </button>
            </div>

            <!-- Selector Hexadecimal Libre -->
            <div class="flex items-center gap-3 pt-1">
              <div class="flex items-center gap-2">
                <input
                  type="color"
                  v-model="colorPersonalizado"
                  class="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                />
                <span class="text-[11px] font-mono text-slate-600 dark:text-slate-400">Color Hex Personalizado</span>
              </div>
              <button
                v-if="colorPersonalizado"
                type="button"
                @click="colorPersonalizado = ''"
                class="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
              >
                Usar gradiente preset
              </button>
            </div>
          </div>

          <!-- Encuesta Vinculada -->
          <div class="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Link class="w-3.5 h-3.5 text-cyan-500" />
              Encuesta Vinculada (Opcional)
            </label>
            <select
              v-model="idEncuestaVinculada"
              class="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            >
              <option value="">-- Sin Vinculación (Pertenece a la encuesta actual) --</option>
              <option v-for="enc in encuestas" :key="enc.id" :value="enc.id">
                {{ enc.titulo }} ({{ enc.departamento }})
              </option>
            </select>
            <p class="text-[10px] text-slate-400">
              Permite vincular este bloque con otra encuesta o módulo del sistema.
            </p>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            v-if="!esNuevo"
            type="button"
            @click="solicitarEliminar"
            class="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            Eliminar Bloque
          </button>
          <div v-else></div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="emit('cerrar')"
              class="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="aplicarCambios"
              :disabled="!titulo.trim()"
              class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {{ esNuevo ? 'Crear Bloque' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
