<!--
  ============================================================================
  TARJETA DE ALERTA CON EDICIÓN RÁPIDA (TarjetaTipoAlertaItem.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Muestra y permite editar rápidamente los 3 campos esenciales de cada alerta:
  1. Nombre de la alerta.
  2. ¿De qué trata la alerta? (Descripción/Enfoque).
  3. Palabras clave para definirla más rápido (separadas por comas).
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Edit2, Check, X, ShieldAlert, KeyRound, FileText } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'
import type { TipoAlertaPersonalizada } from '@/Almacenes/useTiposAlertas'

const props = defineProps<{
  tipo: TipoAlertaPersonalizada
  claseColorNivel: { badge: string; border: string; bg?: string; text?: string; glow?: string }
}>()

const emit = defineEmits<{
  (e: 'guardarEdicion', datos: { id: string; nombre: string; descripcion: string; palabrasClave: string[] }): void
  (e: 'toggleActiva', id: string): void
}>()

const editando = ref(false)
const nombreEditado = ref(props.tipo.nombre)
const descripcionEditada = ref(props.tipo.descripcion)
const palabrasClaveTexto = ref(props.tipo.palabrasClave.join(', '))

const iniciarEdicion = () => {
  nombreEditado.value = props.tipo.nombre
  descripcionEditada.value = props.tipo.descripcion
  palabrasClaveTexto.value = props.tipo.palabrasClave.join(', ')
  editando.value = true
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
    palabrasClave: listaPalabras
  })
  editando.value = false
}
</script>

<template>
  <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 relative shadow-sm hover:shadow-md transition-all text-left">
    
    <!-- MODO VISTA NORMAL -->
    <div v-if="!editando" class="space-y-3">
      <!-- Encabezado de la Alerta -->
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <ShieldAlert class="w-4 h-4 text-rose-500 shrink-0" />
            <span class="text-sm font-black text-slate-900 dark:text-white">
              {{ tipo.nombre }}
            </span>
            <span :class="['text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border', claseColorNivel.badge]">
              Nivel {{ tipo.nivel }} · {{ tipo.severidad }}
            </span>
            <span 
              :class="[
                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                tipo.activa ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              ]"
            >
              {{ tipo.activa ? 'Activa' : 'Pausada' }}
            </span>
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

    <!-- MODO EDICIÓN RÁPIDA DE LOS 3 CAMPOS -->
    <div v-else class="space-y-3.5 animate-fade-in">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <span class="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
          <Edit2 class="w-3.5 h-3.5" />
          <span>Editar Parámetros de la Alerta</span>
        </span>
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

      <!-- Campo 3: Palabras clave para definirla más rápido -->
      <div class="space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <KeyRound class="w-3 h-3 text-amber-500" />
          <span>3. Palabras clave para definirla más rápido (separadas por comas)</span>
        </label>
        <input
          v-model="palabrasClaveTexto"
          type="text"
          required
          placeholder="Ej. jefe, gritos, favoritismo, maltrato, humillación"
          class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
        />
        <p class="text-[10px] text-slate-400">
          Separa cada palabra o frase con una coma (,). La IA las indexará inmediatamente.
        </p>
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
