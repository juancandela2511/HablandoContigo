<!--
  ============================================================================
  SUBCOMPONENTE ENCABEZADO Y DATOS CLIMA (ProyectosClimaHeaderFiltros.vue)
  ============================================================================
  Maneja la barra de navegación superior, aviso de acceso por roles (solo lectura),
  campos de título/departamento/descripción y el Botón Flotante Arrastrable de Lápiz
  (Draggable FAB) disponible en cualquier lugar de la pantalla.
-->

<script setup lang="ts">
import { ArrowLeft, Save, Lock, Sparkles, Plus } from 'lucide-vue-next'

defineProps<{
  titulo: string
  descripcion: string
  departamento: string
  totalPreguntas: number
  puedeEditar: boolean
  rolUsuario?: string
}>()

const emit = defineEmits<{
  (e: 'volver'): void
  (e: 'guardar'): void
  (e: 'crearBloque'): void
  (e: 'autoEnlazarIA'): void
  (e: 'update:titulo', val: string): void
  (e: 'update:descripcion', val: string): void
  (e: 'update:departamento', val: string): void
}>()

// No floating FAB dragging code needed for fixed header positioning
</script>

<template>
  <div class="space-y-6 font-['Poppins',sans-serif]">
    <!-- Barra Superior de Navegación con Botones Fijos de Acción -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left overflow-hidden">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          @click="emit('volver')"
          class="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shrink-0"
          title="Volver"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              Encuesta Troncal de Clima
            </h2>
            <span class="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-bold shrink-0">
              {{ totalPreguntas }} Preg.
            </span>
          </div>
        </div>
      </div>

      <!-- Botones de Acción Optimizados y Compactos -->
      <div v-if="puedeEditar" class="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
        <button
          type="button"
          @click="emit('crearBloque')"
          class="px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border border-emerald-400/30"
          title="Crear Nuevo Bloque"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span class="hidden lg:inline"></span>
          <span class="lg:hidden">Bloque</span>
        </button>

        <button
          type="button"
          @click="emit('autoEnlazarIA')"
          class="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          title="Auto-Enlazar IA"
        >
         
          <span class="hidden lg:inline">Auto-Enlazar</span>
          <span class="lg:hidden">Auto</span>
        </button>

        <button
          type="button"
          @click="emit('guardar')"
          class="px-3 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 border border-cyan-400/30"
          title="Guardar Encuesta"
        >
          <Save class="w-4 h-4" />
          <span class="hidden lg:inline"></span>
          <span class="lg:hidden">Guardar</span>
        </button>
      </div>
    </div>

    <!-- Banner de Permiso Solo Lectura -->
    <div
      v-if="!puedeEditar"
      class="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-left"
    >
      <div class="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Lock class="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-wider">
          Modo Solo Lectura (Acceso por Roles)
        </h4>
        <p class="text-[11px] text-amber-700 dark:text-amber-300">
          Tu rol (<strong>{{ rolUsuario || 'Consultor' }}</strong>) tiene permisos de visualización de estadísticas, pero la edición está restringida a Administradores.
        </p>
      </div>
    </div>

    <!-- Datos Generales de la Encuesta -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="sm:col-span-2 space-y-1">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Título de la Encuesta Oficial:</label>
          <input
            v-if="puedeEditar"
            :value="titulo"
            @input="emit('update:titulo', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
          />
          <p v-else class="text-xs font-bold text-slate-900 dark:text-white py-2">
            {{ titulo }}
          </p>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Departamento Destino:</label>
          <input
            v-if="puedeEditar"
            :value="departamento"
            @input="emit('update:departamento', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
          />
          <p v-else class="text-xs font-semibold text-slate-700 dark:text-slate-300 py-2">
            {{ departamento }}
          </p>
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Nota de Confidencialidad / Descripción:</label>
        <textarea
          v-if="puedeEditar"
          :value="descripcion"
          @input="emit('update:descripcion', ($event.target as HTMLTextAreaElement).value)"
          rows="2"
          class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        />
        <p v-else class="text-xs text-slate-600 dark:text-slate-400 py-1">
          {{ descripcion }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.desplegar-acciones-enter-active,
.desplegar-acciones-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.desplegar-acciones-enter-from,
.desplegar-acciones-leave-to {
  opacity: 0;
  transform: translateX(12px) scale(0.85);
}
</style>
