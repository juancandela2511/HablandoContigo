<!--
  ============================================================================
  FORMULARIO DE ACCESO Y CREDENCIALES (FormularioLogin.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

defineProps<{
  cargando: boolean
}>()

const emit = defineEmits<{
  (e: 'enviar', credenciales: { email: string; pass: string; recordar: boolean }): void
  (e: 'accesoRapido'): void
}>()

const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const recordar = ref(true)

const procesarEnvio = () => {
  emit('enviar', {
    email: email.value.trim(),
    pass: password.value,
    recordar: recordar.value
  })
}

defineExpose({
  establecerCredenciales: (correo: string, pass: string) => {
    email.value = correo
    password.value = pass
  }
})
</script>

<template>
  <div class="space-y-4 text-left">
    <form @submit.prevent="procesarEnvio" class="space-y-4">
      <!-- Correo Corporativo -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="login-email" class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Correo Corporativo
          </label>
          <span class="text-[10px] text-slate-400 font-mono">@siticore o @ontime</span>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail class="w-4 h-4" />
          </div>
          <input
            id="login-email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="usuario@siticore.com"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
          />
        </div>
      </div>

      <!-- Contraseña -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="login-password" class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Contraseña
          </label>
          <span class="text-[11px] text-sky-400 font-mono">Admin123*</span>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock class="w-4 h-4" />
          </div>
          <input
            id="login-password"
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••••••"
            class="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
          />
          <button
            type="button"
            @click="mostrarPassword = !mostrarPassword"
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            tabindex="-1"
          >
            <EyeOff v-if="mostrarPassword" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Recordar sesión -->
      <div class="flex items-center justify-between pt-1">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="recordar"
            type="checkbox"
            class="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500/20 accent-sky-500"
          />
          <span class="text-xs text-slate-400">Recordar sesión</span>
        </label>
      </div>

      <!-- Botón Iniciar Sesión -->
      <BotonBase
        tipo="submit"
        variante="primario"
        tamano="grande"
        :bloqueCompleto="true"
        :cargando="cargando"
        textoCarga="Validando credenciales..."
      >
        <template #iconoIzquierdo>
          <LogIn class="w-4 h-4" />
        </template>
        <span>Iniciar Sesión</span>
      </BotonBase>
    </form>

    <!-- Botón Demo de 1-Click Super Administrador -->
    <div class="pt-2">
      <BotonBase
        variante="secundario"
        tamano="mediano"
        :bloqueCompleto="true"
        :deshabilitado="cargando"
        @click="emit('accesoRapido')"
      >
        <template #iconoIzquierdo>
          <Sparkles class="w-4 h-4 text-amber-400" />
        </template>
        <span>Ingreso Rápido Super Administrador</span>
      </BotonBase>
    </div>
  </div>
</template>
