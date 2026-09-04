<!--
  ============================================================================
  INDICADOR DE FORTALEZA Y REQUISITOS DE CONTRASEÑA (RequisitosSeguridadClave.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Muestra la barra interactiva de fortaleza y la lista de verificación de requisitos
  de seguridad (longitud mínima, mayúsculas, números y concordancia).
  
  ¿CON QUÉ SE CONECTA?
  - PerfilCambioContrasena.vue (Componente contenedor)
-->

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'

defineProps<{
  porcentajeFortaleza: number
  colorFortaleza: string
  etiquetaFortaleza: string
  tieneLongitudMinima: boolean
  tieneMayuscula: boolean
  tieneNumero: boolean
  contrasenasCoinciden: boolean
  nuevaContrasena: string
  confirmarContrasena: string
}>()
</script>

<template>
  <div class="space-y-2.5 text-left text-xs">
    <!-- Barra de Fortaleza -->
    <div v-if="nuevaContrasena" class="space-y-1.5 animate-fade-in">
      <div class="flex items-center justify-between text-[11px]">
        <span class="text-slate-500">Nivel de Fortaleza:</span>
        <span :class="['font-bold font-mono', colorFortaleza.split(' ')[1]]">
          {{ etiquetaFortaleza }} ({{ porcentajeFortaleza }}%)
        </span>
      </div>
      <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          :class="['h-full transition-all duration-300 rounded-full', colorFortaleza.split(' ')[0]]"
          :style="{ width: `${porcentajeFortaleza}%` }"
        ></div>
      </div>
    </div>

    <!-- Lista de Requisitos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-1.5" :class="tieneLongitudMinima ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
        <Check v-if="tieneLongitudMinima" class="w-3.5 h-3.5" />
        <X v-else class="w-3.5 h-3.5" />
        <span>Mínimo 6 caracteres</span>
      </div>

      <div class="flex items-center gap-1.5" :class="tieneMayuscula ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
        <Check v-if="tieneMayuscula" class="w-3.5 h-3.5" />
        <X v-else class="w-3.5 h-3.5" />
        <span>Al menos una mayúscula</span>
      </div>

      <div class="flex items-center gap-1.5" :class="tieneNumero ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
        <Check v-if="tieneNumero" class="w-3.5 h-3.5" />
        <X v-else class="w-3.5 h-3.5" />
        <span>Al menos un número</span>
      </div>

      <div 
        v-if="confirmarContrasena"
        class="flex items-center gap-1.5" 
        :class="contrasenasCoinciden ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'"
      >
        <Check v-if="contrasenasCoinciden" class="w-3.5 h-3.5" />
        <X v-else class="w-3.5 h-3.5" />
        <span>Las contraseñas coinciden</span>
      </div>
    </div>
  </div>
</template>
