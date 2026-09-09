<!--
  ============================================================================
  FORMULARIO DE ACCESO Y CREDENCIALES / TOKENS (FormularioLogin.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Lock, Eye, EyeOff, LogIn, KeyRound, Zap, ShieldCheck } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

defineProps<{
  cargando: boolean
}>()

const emit = defineEmits<{
  (e: 'enviar', credenciales: { email: string; pass: string; recordar: boolean }): void
  (e: 'enviarToken', codigoToken: string): void
}>()

const modoLogin = ref<'credenciales' | 'token'>('credenciales')
const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const recordar = ref(true)
const codigoToken = ref('')

const procesarEnvioCredenciales = () => {
  emit('enviar', {
    email: email.value.trim(),
    pass: password.value,
    recordar: recordar.value
  })
}

const procesarEnvioToken = () => {
  emit('enviarToken', codigoToken.value.trim())
}

const usarTokenDemo = () => {
  codigoToken.value = 'TOK-84920'
}

defineExpose({
  establecerCredenciales: (correo: string, pass: string) => {
    modoLogin.value = 'credenciales'
    email.value = correo
    password.value = pass
  },
  establecerToken: (token: string) => {
    modoLogin.value = 'token'
    codigoToken.value = token
  }
})
</script>

<template>
  <div class="space-y-4 text-left">
    <!-- Selector de Modo de Ingreso -->
    <div class="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
      <button
        type="button"
        @click="modoLogin = 'credenciales'"
        :class="[
          'py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
          modoLogin === 'credenciales'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-400 hover:text-white'
        ]"
      >
        <Mail class="w-3.5 h-3.5" />
        <span>Correo Corporativo</span>
      </button>

      <button
        type="button"
        @click="modoLogin = 'token'"
        :class="[
          'py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
          modoLogin === 'token'
            ? 'bg-amber-500 text-slate-950 shadow-md'
            : 'text-slate-400 hover:text-white'
        ]"
      >
        <KeyRound class="w-3.5 h-3.5" />
        <span>PIN / Token Temporal</span>
      </button>
    </div>

    <!-- MODO 1: CORREO Y CONTRASEÑA -->
    <form v-if="modoLogin === 'credenciales'" @submit.prevent="procesarEnvioCredenciales" class="space-y-4 animate-fade-in">
      <!-- Correo Corporativo -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="login-email" class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Correo Corporativo
          </label>
          <span class="text-[10px] text-slate-400 font-mono">@ontime.es</span>
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
            placeholder="usuario@ontime.es"
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

    <!-- MODO 2: PIN / TOKEN DE ACCESO TEMPORAL -->
    <form v-else @submit.prevent="procesarEnvioToken" class="space-y-4 animate-fade-in">
      <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
        <div class="flex items-center gap-1.5 font-bold text-amber-400">
          <Zap class="w-4 h-4" />
          <span>Acceso Instantáneo sin Contraseña</span>
        </div>
        <p class="text-[11px] text-slate-300 leading-relaxed">
          Ingresa el Token (ej. <strong class="text-amber-400 font-mono">TOK-84920</strong>) o PIN generado por el Administrador para acceder con permisos restringidos y tiempo controlado.
        </p>
      </div>

      <!-- Código Token / PIN -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="login-token" class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Código Token o PIN de Acceso
          </label>
          <button
            type="button"
            @click="usarTokenDemo"
            class="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            Usar Token Demo (TOK-84920)
          </button>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
            <KeyRound class="w-4 h-4" />
          </div>
          <input
            id="login-token"
            v-model="codigoToken"
            type="text"
            required
            autocomplete="off"
            placeholder="TOK-84920"
            class="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/80 text-amber-400 font-mono font-bold tracking-wider placeholder-slate-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 uppercase transition-all duration-200"
          />
        </div>
      </div>

      <!-- Botón Ingresar con Token -->
      <button
        type="submit"
        :disabled="cargando || !codigoToken.trim()"
        class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
      >
        <KeyRound class="w-4 h-4" />
        <span>{{ cargando ? 'Validando Token...' : 'Validar y Entrar con Token' }}</span>
      </button>
    </form>
  </div>
</template>

