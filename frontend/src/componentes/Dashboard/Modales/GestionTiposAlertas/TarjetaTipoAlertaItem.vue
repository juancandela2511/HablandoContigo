<!--
  ============================================================================
  TARJETA DE ALERTA CON EDICIÓN COMPLETA (TarjetaTipoAlertaItem.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Edit2,
  Check,
  X,
  ShieldAlert,
  Flame,
  HeartCrack,
  AlertTriangle,
  UserX,
  Skull,
  Clock,
  Coins,
  Scale,
  Zap,
  Sliders,
  Trash2,
  KeyRound,
  FileText,
  Palette
} from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'
import type { TipoAlertaPersonalizada, NivelAlerta } from '@/Almacenes/useTiposAlertas'

const props = defineProps<{
  tipo: TipoAlertaPersonalizada
  claseColorNivel: { badge: string; border: string; bg?: string; text?: string; glow?: string }
}>()

const emit = defineEmits<{
  (e: 'guardarEdicion', datos: { id: string; nombre: string; descripcion: string; palabrasClave: string[]; icono?: string; color?: string; nivel?: NivelAlerta }): void
  (e: 'toggleActiva', id: string): void
  (e: 'eliminar', id: string): void
}>()

const ICONOS_DISPONIBLES = [
  { id: 'ShieldAlert', label: 'Escudo', componente: ShieldAlert },
  { id: 'Flame', label: 'Fuego', componente: Flame },
  { id: 'HeartCrack', label: 'Corazón Roto', componente: HeartCrack },
  { id: 'AlertTriangle', label: 'Peligro', componente: AlertTriangle },
  { id: 'UserX', label: 'Usuario X', componente: UserX },
  { id: 'Skull', label: 'Crítico', componente: Skull },
  { id: 'Clock', label: 'Tiempo', componente: Clock },
  { id: 'Coins', label: 'Monedas', componente: Coins },
  { id: 'Scale', label: 'Justicia', componente: Scale },
  { id: 'Zap', label: 'Rayo', componente: Zap }
]

const PALETA_COLORES = [
  { hex: '#ef4444', nombre: 'Rojo Carmesí' },
  { hex: '#f43f5e', nombre: 'Rosa Intenso' },
  { hex: '#f59e0b', nombre: 'Ámbar Cálido' },
  { hex: '#eab308', nombre: 'Amarillo Dorado' },
  { hex: '#10b981', nombre: 'Esmeralda' },
  { hex: '#0ea5e9', nombre: 'Azul Cielo' },
  { hex: '#6366f1', nombre: 'Índigo' },
  { hex: '#8b5cf6', nombre: 'Violeta' },
  { hex: '#ec4899', nombre: 'Fucsia' },
  { hex: '#64748b', nombre: 'Pizarra' }
]

const editando = ref(false)
const confirmandoEliminar = ref(false)

const nombreEditado = ref(props.tipo.nombre)
const descripcionEditada = ref(props.tipo.descripcion)
const palabrasClaveTexto = ref(props.tipo.palabrasClave.join(', '))
const iconoSeleccionado = ref(props.tipo.icono || 'ShieldAlert')
const colorSeleccionado = ref(props.tipo.color || '#ef4444')
const nivelSeleccionado = ref<NivelAlerta>(props.tipo.nivel)

const iconoComponenteActual = computed(() => {
  const enc = ICONOS_DISPONIBLES.find(i => i.id === (props.tipo.icono || 'ShieldAlert'))
  return enc ? enc.componente : ShieldAlert
})

const iniciarEdicion = () => {
  nombreEditado.value = props.tipo.nombre
  descripcionEditada.value = props.tipo.descripcion
  palabrasClaveTexto.value = props.tipo.palabrasClave.join(', ')
  iconoSeleccionado.value = props.tipo.icono || 'ShieldAlert'
  colorSeleccionado.value = props.tipo.color || '#ef4444'
  nivelSeleccionado.value = props.tipo.nivel
  editando.value = true
  confirmandoEliminar.value = false
}

const cancelarEdicion = () => {
  editando.value = false
}

const guardarCambios = () => {
  const listaPalabras = palabrasClaveTexto.value
    .split(',')
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length > 0)

  emit('guardarEdicion', {
    id: props.tipo.id,
    nombre: nombreEditado.value.trim(),
    descripcion: descripcionEditada.value.trim(),
    palabrasClave: listaPalabras,
    icono: iconoSeleccionado.value,
    color: colorSeleccionado.value,
    nivel: nivelSeleccionado.value
  })
  editando.value = false
}
</script>

<template>
  <div
    class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950 border space-y-3 relative shadow-sm hover:shadow-md transition-all text-left"
    :style="{ borderColor: (tipo.color || '#ef4444') + '40' }"
  >
    <!-- MODO VISTA NORMAL -->
    <div v-if="!editando" class="space-y-3">
      <!-- Encabezado de la Alerta -->
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-bold shadow-sm"
              :style="{ backgroundColor: tipo.color || '#ef4444' }"
            >
              <component :is="iconoComponenteActual" class="w-4 h-4" />
            </div>

            <span class="text-sm font-black text-slate-900 dark:text-white">
              {{ tipo.nombre }}
            </span>

            <span
              class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white shadow-xs"
              :style="{ backgroundColor: tipo.color || '#ef4444' }"
            >
              Nivel {{ tipo.nivel }} · {{ tipo.severidad }}
            </span>

            <button
              type="button"
              @click="emit('toggleActiva', tipo.id)"
              :class="[
                'text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors',
                tipo.activa ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              ]"
            >
              {{ tipo.activa ? 'Activa' : 'Pausada' }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <BotonBase
            variante="secundario"
            tamano="xs"
            @click="iniciarEdicion"
          >
            <template #iconoIzquierdo>
              <Edit2 class="w-3 h-3" />
            </template>
            <span>Editar</span>
          </BotonBase>

          <button
            v-if="!confirmandoEliminar"
            type="button"
            @click="confirmandoEliminar = true"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Eliminar esta alerta"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
          <div v-else class="flex items-center gap-1">
            <span class="text-[10px] text-rose-500 font-bold">¿Borrar?</span>
            <button
              type="button"
              @click="emit('eliminar', tipo.id)"
              class="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
            >
              Sí
            </button>
            <button
              type="button"
              @click="confirmandoEliminar = false"
              class="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] cursor-pointer"
            >
              No
            </button>
          </div>
        </div>
      </div>

      <!-- ¿De qué trata la Alerta? -->
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
        <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
          ¿De qué trata esta alerta?
        </span>
        <p class="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {{ tipo.descripcion }}
        </p>
      </div>

      <!-- Palabras Clave para Definirla Más Rápido -->
      <div class="space-y-1.5">
        <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
          Palabras clave para activarla rápido:
        </span>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(palabra, pIdx) in tipo.palabrasClave"
            :key="pIdx"
            class="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-mono text-[11px]"
          >
            #{{ palabra }}
          </span>
        </div>
      </div>
    </div>

    <!-- MODO EDICIÓN RÁPIDA -->
    <div v-else class="space-y-3.5 animate-fade-in">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <span class="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
          <Edit2 class="w-3.5 h-3.5" />
          <span>Editar Parámetros e Ícono de Alerta</span>
        </span>
      </div>

      <!-- Selector de Ícono y Color -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <!-- Ícono -->
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Ícono Identificador:</label>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="ico in ICONOS_DISPONIBLES"
              :key="ico.id"
              type="button"
              @click="iconoSeleccionado = ico.id"
              :class="[
                'p-1.5 rounded-lg border transition-all cursor-pointer',
                iconoSeleccionado === ico.id
                  ? 'bg-sky-500 text-white border-sky-600 shadow-sm scale-110'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
              ]"
              :title="ico.label"
            >
              <component :is="ico.componente" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Color -->
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Palette class="w-3 h-3 text-sky-500" />
            <span>Color Personalizado:</span>
          </label>
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              v-for="c in PALETA_COLORES"
              :key="c.hex"
              type="button"
              @click="colorSeleccionado = c.hex"
              class="w-5 h-5 rounded-full border-2 transition-transform cursor-pointer"
              :style="{ backgroundColor: c.hex, borderColor: colorSeleccionado === c.hex ? '#ffffff' : 'transparent' }"
              :class="{ 'scale-125 shadow-md ring-2 ring-sky-500': colorSeleccionado === c.hex }"
              :title="c.nombre"
            ></button>
            <input
              v-model="colorSeleccionado"
              type="color"
              class="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
            />
          </div>
        </div>
      </div>

      <!-- Campo 1: Nombre de la Alerta -->
      <div class="space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <FileText class="w-3 h-3 text-sky-500" />
          <span>1. Nombre de la Alerta</span>
        </label>
        <input
          v-model="nombreEditado"
          type="text"
          required
          class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
        />
      </div>

      <!-- Campo 2: ¿De qué trata la Alerta? -->
      <div class="space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <ShieldAlert class="w-3 h-3 text-rose-500" />
          <span>2. ¿De qué trata la Alerta? (Descripción y Enfoque)</span>
        </label>
        <textarea
          v-model="descripcionEditada"
          rows="2"
          required
          placeholder="Describe claramente la situación o conducta a detectar..."
          class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
        ></textarea>
      </div>

      <!-- Campo 3: Palabras clave -->
      <div class="space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <KeyRound class="w-3 h-3 text-amber-500" />
          <span>3. Palabras clave (separadas por comas)</span>
        </label>
        <input
          v-model="palabrasClaveTexto"
          type="text"
          required
          placeholder="Ej. jefe, gritos, favoritismo, maltrato, humillación"
          class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
        />
      </div>

      <!-- Botones de Guardar / Cancelar -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <BotonBase
          variante="secundario"
          tamano="xs"
          @click="cancelarEdicion"
        >
          <template #iconoIzquierdo>
            <X class="w-3 h-3" />
          </template>
          <span>Cancelar</span>
        </BotonBase>

        <BotonBase
          variante="primario"
          tamano="xs"
          @click="guardarCambios"
        >
          <template #iconoIzquierdo>
            <Check class="w-3 h-3" />
          </template>
          <span>Guardar Cambios</span>
        </BotonBase>
      </div>
    </div>

  </div>
</template>

