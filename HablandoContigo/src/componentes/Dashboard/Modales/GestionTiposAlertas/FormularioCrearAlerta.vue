<!--
  ============================================================================
  FORMULARIO DE CONFIGURACIÓN DE NUEVA ALERTA (FormularioCrearAlerta.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Target, Globe2, Check } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'
import type { NivelAlerta, ModoEnfoqueAlerta } from '@/Almacenes/useTiposAlertas'

const emit = defineEmits<{
  (e: 'guardar', datos: {
    nombre: string
    descripcion: string
    nivel: NivelAlerta
    modoEnfoque: ModoEnfoqueAlerta
    enfoqueDetalle: string
    palabrasClave?: string[]
    protocoloAccion: string
  }): void
  (e: 'cancelar'): void
}>()

const nuevoNombre = ref('')
const nuevoNivel = ref<NivelAlerta>(1)
const nuevoModoEnfoque = ref<ModoEnfoqueAlerta>('especifico')
const nuevoEnfoqueDetalle = ref('')
const nuevaDescripcion = ref('')
const nuevasPalabrasClave = ref('')
const nuevoProtocolo = ref('')

const guardar = () => {
  if (!nuevoNombre.value.trim()) {
    alert('Por favor ingresa el nombre de la alerta.')
    return
  }
  if (!nuevaDescripcion.value.trim()) {
    alert('Por favor agrega una breve descripción de qué trata la alerta.')
    return
  }

  const keywords = nuevasPalabrasClave.value
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(Boolean)

  emit('guardar', {
    nombre: nuevoNombre.value.trim(),
    descripcion: nuevaDescripcion.value.trim(),
    nivel: nuevoNivel.value,
    modoEnfoque: nuevoModoEnfoque.value,
    enfoqueDetalle: nuevoModoEnfoque.value === 'especifico'
      ? (nuevoEnfoqueDetalle.value.trim() || nuevaDescripcion.value.trim())
      : 'Vas a estar pendiente de todo el entorno y señales del clima.',
    palabrasClave: keywords.length > 0 ? keywords : undefined,
    protocoloAccion: nuevoProtocolo.value.trim() || 'Atención prioritaria y activación de protocolo de Talento Humano.'
  })
}
</script>

<template>
  <div class="p-5 sm:p-6 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border-2 border-dashed border-sky-400 dark:border-sky-700/60 space-y-4 animate-fade-in">
    <div class="flex items-center justify-between border-b border-sky-200 dark:border-sky-900/60 pb-3">
      <span class="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles class="w-4 h-4 text-sky-500" />
        <span>Configurar Nueva Alerta para Encasillamiento de IA</span>
      </span>
      <button 
        type="button"
        @click="emit('cancelar')" 
        class="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline cursor-pointer"
      >
        Cancelar
      </button>
    </div>

    <!-- Nombre y Nivel de la Alerta -->
    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
      <div class="sm:col-span-7 space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <span>Nombre de la Alerta</span>
          <span class="text-rose-500">*</span>
        </label>
        <input
          v-model="nuevoNombre"
          type="text"
          placeholder="Ej. Mala gestión de los jefes"
          class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-semibold shadow-sm"
        />
      </div>

      <div class="sm:col-span-5 space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <span>Nivel de la Alerta</span>
          <span class="text-rose-500">*</span>
        </label>
        <select
          v-model="nuevoNivel"
          class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-semibold shadow-sm cursor-pointer"
        >
          <option :value="1">🔴 Nivel 1 (Crítico / Inmediato)</option>
          <option :value="2">🟠 Nivel 2 (Alto / Riesgo Severo)</option>
          <option :value="3">🟡 Nivel 3 (Moderado / Atención)</option>
          <option :value="4">🟢 Nivel 4 (Bajo / Preventivo)</option>
        </select>
      </div>
    </div>

    <!-- Modo de Enfoque -->
    <div class="space-y-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
        Instrucción de Enfoque para la IA:
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          @click="nuevoModoEnfoque = 'especifico'"
          class="p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5"
          :class="nuevoModoEnfoque === 'especifico'
            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-900 dark:text-sky-200 ring-2 ring-sky-400/40 font-semibold'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'"
        >
          <Target class="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-xs font-bold">🎯 Enfócate en un aspecto específico</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              La IA vigilará conductas, patrones y palabras puntuales.
            </p>
          </div>
        </button>

        <button
          type="button"
          @click="nuevoModoEnfoque = 'general'"
          class="p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5"
          :class="nuevoModoEnfoque === 'general'
            ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-900 dark:text-purple-200 ring-2 ring-purple-400/40 font-semibold'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'"
        >
          <Globe2 class="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-xs font-bold">🌐 Vas a estar pendiente de todo</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Monitoreo omnicanal preventivo del clima general.
            </p>
          </div>
        </button>
      </div>

      <div v-if="nuevoModoEnfoque === 'especifico'" class="pt-2 animate-fade-in">
        <label class="text-[11px] font-semibold text-sky-800 dark:text-sky-300">
          ¿En qué se enfocará exactamente la alerta?
        </label>
        <input
          v-model="nuevoEnfoqueDetalle"
          type="text"
          placeholder="Ej. Enfócate en abusos de supervisores, órdenes contradictorias o favoritismo..."
          class="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
        />
      </div>
    </div>

    <!-- Descripción breve -->
    <div class="space-y-1">
      <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
        <span>Descripción breve (Criterio para la IA)</span>
        <span class="text-rose-500">*</span>
      </label>
      <textarea
        v-model="nuevaDescripcion"
        rows="2"
        placeholder="Ej. Se activa cuando los colaboradores reporten mala gestión de líderes..."
        class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 resize-none shadow-sm"
      ></textarea>
    </div>

    <!-- Palabras clave y Protocolo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="space-y-1">
        <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Palabras clave asociadas (separadas por comas)
        </label>
        <input
          v-model="nuevasPalabrasClave"
          type="text"
          placeholder="Ej. jefe, supervisores, mala gestión, gritos"
          class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
        />
      </div>

      <div class="space-y-1">
        <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Protocolo o Acción Recomendada
        </label>
        <input
          v-model="nuevoProtocolo"
          type="text"
          placeholder="Ej. Citación a revisión 360° y acompañamiento."
          class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
        />
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="flex items-center justify-end gap-2 pt-2 border-t border-sky-200 dark:border-sky-900/60">
      <BotonBase
        variante="secundario"
        tamano="pequeno"
        @click="emit('cancelar')"
      >
        Cancelar
      </BotonBase>

      <BotonBase
        variante="exito"
        tamano="pequeno"
        @click="guardar"
      >
        <template #iconoIzquierdo>
          <Check class="w-4 h-4" />
        </template>
        <span>Guardar & Encasillar con IA</span>
      </BotonBase>
    </div>
  </div>
</template>
