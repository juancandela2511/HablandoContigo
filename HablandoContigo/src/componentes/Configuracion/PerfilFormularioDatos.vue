<!--
  ============================================================================
  COMPONENTE FORMULARIO DE DATOS DE PERFIL (PerfilFormularioDatos.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Formulario de edición de datos personales del administrador:
  - Nombre completo
  - Correo corporativo
  - Área o Departamento
  - Rol asignado
  - Biografía / Especialidad
  - Botón de guardado con indicador de carga
  
  ¿PARA QUÉ SIRVE?
  - Permitir la edición y validación de los datos profesionales del administrador.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - ConfiguracionView.vue: Emite el evento `guardar` para persistir con `useAuth.ts`.
-->

<script setup lang="ts">
import { User, Mail, Building, Shield, Save } from 'lucide-vue-next'

defineProps<{
  nombre: string
  email: string
  departamento: string
  rol: string
  biografia: string
  guardando: boolean
}>()

defineEmits<{
  (e: 'update:nombre', valor: string): void
  (e: 'update:email', valor: string): void
  (e: 'update:departamento', valor: string): void
  (e: 'update:rol', valor: string): void
  (e: 'update:biografia', valor: string): void
  (e: 'guardar'): void
}>()
</script>

<template>
  <form @submit.prevent="$emit('guardar')" class="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xl space-y-5">
    
    <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
      Información del Administrador
    </h3>

    <!-- Nombre Completo -->
    <div class="space-y-1.5 text-left">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre Completo</label>
      <div class="relative">
        <User class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          :value="nombre"
          @input="$emit('update:nombre', ($event.target as HTMLInputElement).value)"
          type="text"
          required
          placeholder="Ej. Nombre y Apellidos"
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-all"
        />
      </div>
    </div>

    <!-- Correo Electrónico -->
    <div class="space-y-1.5 text-left">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
      <div class="relative">
        <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          :value="email"
          @input="$emit('update:email', ($event.target as HTMLInputElement).value)"
          type="email"
          required
          placeholder="admin@hablandocontigo.com"
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-all"
        />
      </div>
    </div>

    <!-- Departamento y Rol en Grid de 2 Columnas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      <div class="space-y-1.5 text-left">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Área / Departamento</label>
        <div class="relative">
          <Building class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            :value="departamento"
            @input="$emit('update:departamento', ($event.target as HTMLInputElement).value)"
            type="text"
            required
            placeholder="Recursos Humanos"
            class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      <div class="space-y-1.5 text-left">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Rol en la App</label>
        <div class="relative">
          <Shield class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            :value="rol"
            @change="$emit('update:rol', ($event.target as HTMLSelectElement).value)"
            class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-all"
          >
            <option value="Super Administrador">Super Administrador</option>
            <option value="Administrador">Administrador</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Analista RRHH">Analista RRHH</option>
          </select>
        </div>
      </div>

    </div>

    <!-- Biografía / Rol institucional -->
    <div class="space-y-1.5 text-left">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Descripción / Especialidad</label>
      <textarea
        :value="biografia"
        @input="$emit('update:biografia', ($event.target as HTMLTextAreaElement).value)"
        rows="3"
        placeholder="Breve reseña sobre tus responsabilidades en la gestión de encuestas..."
        class="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-all resize-none"
      ></textarea>
    </div>

    <!-- Botón de Guardar -->
    <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
      <button
        type="submit"
        :disabled="guardando"
        class="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
      >
        <Save v-if="!guardando" class="w-4 h-4" />
        <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span>{{ guardando ? 'Guardando...' : 'Guardar Cambios de Perfil' }}</span>
      </button>
    </div>

  </form>
</template>
