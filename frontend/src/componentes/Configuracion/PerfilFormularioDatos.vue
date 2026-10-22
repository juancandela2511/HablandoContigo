<script setup lang="ts">
import { User, Mail, Building, Briefcase, Save } from 'lucide-vue-next'
import type { RolCuenta, GeneroUsuario } from '@/shared/types/common.types'
import { PROGRAMAS_ESTUDIO_DISPONIBLES } from '@/Almacenes/useCuentas'

const nombre = defineModel<string>('nombre', { required: true })
const email = defineModel<string>('email', { required: true })
const departamento = defineModel<string>('departamento', { required: true })
const rol = defineModel<RolCuenta>('rol', { required: true })
const bloqueEstudio = defineModel<string>('bloqueEstudio', { required: true })
const genero = defineModel<GeneroUsuario>('genero', { required: true })
const biografia = defineModel<string>('biografia', { required: true })

defineProps<{
  guardando: boolean
}>()

const emit = defineEmits<{
  (e: 'guardar'): void
}>()
</script>

<template>
  <form @submit.prevent="emit('guardar')" class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-left">
    <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
      <h3 class="text-base font-bold text-slate-900 dark:text-white">Información Personal & Organizacional</h3>
      <p class="text-xs text-slate-500">Actualiza tus nombres, departamento y datos de perfil.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre Completo</label>
        <input v-model="nombre" type="text" required class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" />
      </div>

      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
        <input v-model="email" type="email" required class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" />
      </div>

      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Departamento / Área</label>
        <input v-model="departamento" type="text" required class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" />
      </div>

      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Programa / Bloque de Estudio</label>
        <select v-model="bloqueEstudio" class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500">
          <option v-for="prog in PROGRAMAS_ESTUDIO_DISPONIBLES" :key="prog" :value="prog">{{ prog }}</option>
        </select>
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Biografía / Presentación</label>
      <textarea v-model="biografia" rows="3" placeholder="Escribe una breve presentación..." class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500 resize-none"></textarea>
    </div>

    <div class="flex justify-end pt-2">
      <button type="submit" :disabled="guardando" class="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-sky-600/20 active:scale-95">
        <Save class="w-4 h-4" />
        <span>{{ guardando ? 'Guardando...' : 'Guardar Cambios' }}</span>
      </button>
    </div>
  </form>
</template>
