<!--
  ============================================================================
  FORMULARIO DE PORTADA E IDENTIDAD DEL INFORME (FormularioPortadaInforme.vue)
  ============================================================================
  Subcomponente de ModalExportarInforme para personalizar empresa, fecha,
  evaluador, cargo y logo institucional.
-->

<script setup lang="ts">
import { ref } from 'vue'
import {
  Sparkles,
  Building,
  Calendar,
  User,
  Briefcase,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-vue-next'

defineProps<{
  nombreEmpresa: string
  fechaInforme: string
  nombrePresentador: string
  cargoPresentador: string
  logoPersonalizado: string | null
}>()

const emit = defineEmits<{
  (e: 'update:nombreEmpresa', v: string): void
  (e: 'update:fechaInforme', v: string): void
  (e: 'update:nombrePresentador', v: string): void
  (e: 'update:cargoPresentador', v: string): void
  (e: 'update:logoPersonalizado', v: string | null): void
}>()

const inputLogoRef = ref<HTMLInputElement | null>(null)

const manejarSubirLogo = (evento: Event) => {
  const input = evento.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      emit('update:logoPersonalizado', (e.target?.result as string) || null)
    }
    reader.readAsDataURL(input.files[0])
  }
}

const eliminarLogo = () => {
  emit('update:logoPersonalizado', null)
  if (inputLogoRef.value) inputLogoRef.value.value = ''
}
</script>

<template>
  <div class="p-5 rounded-2xl bg-sky-50/60 dark:bg-slate-950 border border-sky-200 dark:border-sky-900/60 space-y-4 text-left">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-sky-950 dark:text-sky-300 flex items-center gap-1.5">
        <Sparkles class="w-4 h-4 text-sky-500" />
        <span>Datos de la Portada & Logo Institucional</span>
      </span>
      <span class="text-[10px] font-mono text-sky-700 dark:text-sky-400 font-semibold bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 rounded-md">
        Personalización de Portada
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <div class="space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Building class="w-3.5 h-3.5 text-sky-500" />
          <span>Empresa / Título Superior:</span>
        </label>
        <input
          :value="nombreEmpresa"
          @input="emit('update:nombreEmpresa', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Ej. Contigo call center 2025"
          class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div class="space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Calendar class="w-3.5 h-3.5 text-amber-500" />
          <span>Fecha del Informe (Día Actual):</span>
        </label>
        <input
          :value="fechaInforme"
          @input="emit('update:fechaInforme', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Ej. Septiembre 2026"
          class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div class="space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <User class="w-3.5 h-3.5 text-emerald-500" />
          <span>Nombre de quien Presenta (Evaluador):</span>
        </label>
        <input
          :value="nombrePresentador"
          @input="emit('update:nombrePresentador', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Ej. Patricia Londoño Martinez."
          class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div class="space-y-1">
        <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Briefcase class="w-3.5 h-3.5 text-indigo-500" />
          <span>Cargo / Rol del Presentador:</span>
        </label>
        <input
          :value="cargoPresentador"
          @input="emit('update:cargoPresentador', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Ej. Coordinadora TH"
          class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
    </div>

    <div class="pt-2 border-t border-sky-200/80 dark:border-sky-900/40 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <input
          ref="inputLogoRef"
          type="file"
          accept="image/png, image/jpeg, image/svg+xml, image/webp"
          class="hidden"
          @change="manejarSubirLogo"
        />
        <button
          type="button"
          @click="inputLogoRef?.click()"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-sky-500 hover:text-sky-600 transition-all cursor-pointer shadow-sm"
        >
          <Upload class="w-3.5 h-3.5 text-sky-500" />
          <span>{{ logoPersonalizado ? 'Cambiar Logo Subido' : 'Subir Logo de la Empresa' }}</span>
        </button>

        <div v-if="logoPersonalizado" class="flex items-center gap-2">
          <div class="p-1 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center">
            <img :src="logoPersonalizado" alt="Logo Previo" class="h-7 max-w-[100px] object-contain" />
          </div>
          <button
            type="button"
            @click="eliminarLogo"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
            title="Quitar logo personalizado"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
        <span v-else class="text-[11px] text-slate-500 flex items-center gap-1">
          <ImageIcon class="w-3 h-3 text-slate-400" />
          <span>Usando logo institucional por defecto</span>
        </span>
      </div>
      <div class="text-[10px] text-slate-400 font-mono">PNG, JPG o SVG (esquina inferior derecha)</div>
    </div>
  </div>
</template>
