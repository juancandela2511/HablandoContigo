<!--
  ============================================================================
  FORMULARIO DE ENTRADA PARA CAMBIO DE CONTRASEÑA (FormularioCambioClave.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Campos de entrada para la contraseña actual, nueva contraseña y confirmación,
  con botones de visualización segura (ojito) y botón de envío atómico BotonBase.
  
  ¿CON QUÉ SE CONECTA?
  - PerfilCambioContrasena.vue (Componente contenedor)
  - BotonBase.vue (Componente de botón reutilizable)
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

defineProps<{
  contrasenaActual: string
  nuevaContrasena: string
  confirmarContrasena: string
  procesando: boolean
  deshabilitado: boolean
}>()

const emit = defineEmits<{
  (e: 'update:contrasenaActual', valor: string): void
  (e: 'update:nuevaContrasena', valor: string): void
  (e: 'update:confirmarContrasena', valor: string): void
  (e: 'submit'): void
}>()

const mostrarActual = ref(false)
const mostrarNueva = ref(false)
const mostrarConfirmar = ref(false)
</script>

<template>
  <form @submit.prevent="emit('submit')" class="space-y-4 text-left">
    <!-- Contraseña Actual -->
    <div class="space-y-1.5">
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        Contraseña Actual
      </label>
      <div class="relative">
        <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          :value="contrasenaActual"
          @input="emit('update:contrasenaActual', ($event.target as HTMLInputElement).value)"
          :type="mostrarActual ? 'text' : 'password'"
          placeholder="Introduce tu contraseña actual"
          class="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-all font-mono placeholder:font-sans"
        />
        <button
          type="button"
          @click="mostrarActual = !mostrarActual"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
          tabindex="-1"
        >
          <EyeOff v-if="mostrarActual" class="w-4 h-4" />
          <Eye v-else class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Grid: Nueva y Confirmar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Nueva Contraseña -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Nueva Contraseña
        </label>
        <div class="relative">
          <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            :value="nuevaContrasena"
            @input="emit('update:nuevaContrasena', ($event.target as HTMLInputElement).value)"
            :type="mostrarNueva ? 'text' : 'password'"
            required
            minlength="6"
            placeholder="Mínimo 6 caracteres"
            class="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-all font-mono placeholder:font-sans"
          />
          <button
            type="button"
            @click="mostrarNueva = !mostrarNueva"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
            tabindex="-1"
          >
            <EyeOff v-if="mostrarNueva" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Confirmar Contraseña -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Confirmar Nueva Contraseña
        </label>
        <div class="relative">
          <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            :value="confirmarContrasena"
            @input="emit('update:confirmarContrasena', ($event.target as HTMLInputElement).value)"
            :type="mostrarConfirmar ? 'text' : 'password'"
            required
            placeholder="Repite la nueva contraseña"
            class="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 transition-all font-mono placeholder:font-sans"
          />
          <button
            type="button"
            @click="mostrarConfirmar = !mostrarConfirmar"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
            tabindex="-1"
          >
            <EyeOff v-if="mostrarConfirmar" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Botón de Envío -->
    <div class="flex justify-end pt-2">
      <BotonBase
        tipo="submit"
        variante="primario"
        tamano="mediano"
        :cargando="procesando"
        textoCarga="Actualizando en Supabase..."
        :deshabilitado="deshabilitado"
      >
        <template #iconoIzquierdo>
          <KeyRound class="w-4 h-4" />
        </template>
        <span>Actualizar Contraseña</span>
      </BotonBase>
    </div>
  </form>
</template>
