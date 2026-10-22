<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAutenticacion } from '@/Almacenes/useAutenticacion'
import LoginForm from '@/componentes/Autenticacion/LoginForm.vue'
import { ShieldCheck, X, AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const { iniciarSesion, cargando, errorAutenticacion } = useAutenticacion()

const loginFormRef = ref<InstanceType<typeof LoginForm> | null>(null)
const loginExitoso = ref(false)

const handleLoginCredenciales = async (email: string, contrasena: string) => {
  const ok = await iniciarSesion(email, contrasena)
  if (ok) {
    loginExitoso.value = true
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }
}

const cerrarModal = () => {
  router.push('/')
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-slate-950">
    <!-- 1. Fondo ligero de luces y partículas (sin 3D pesado) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]"></div>
      <div class="absolute bottom-10 right-10 w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-[120px]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25"></div>
    </div>

    <!-- 2. Capa Overlay Oscura y Cristalina -->
    <div 
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      @click.self="cerrarModal"
    >
      <!-- 3. Sub-Ventana Modal Flotante -->
      <div class="w-full max-w-md relative my-auto py-4 animate-scale-up">
        <div class="absolute -top-10 -left-10 w-44 h-44 bg-blue-500/25 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -right-10 w-44 h-44 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-7 sm:p-9 overflow-hidden transition-all duration-300">
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500"></div>

          <button 
            @click="cerrarModal"
            class="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-2 rounded-xl border border-slate-700/60 backdrop-blur-md transition-all cursor-pointer shadow-md"
            title="Volver al Inicio"
          >
            <X class="w-4.5 h-4.5" />
          </button>

          <div class="text-center space-y-2 mb-6">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-sky-500/10 border border-blue-500/30 text-sky-400 shadow-inner mb-1">
              <ShieldCheck class="w-8 h-8 text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]" />
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Acceso Corporativo
            </h1>
            <p class="text-xs sm:text-sm text-slate-400">
              Ingreso exclusivo para colaboradores <span class="text-sky-400 font-medium">@ontime.es</span>
            </p>
          </div>

          <div v-if="loginExitoso" class="mb-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs flex items-center gap-2.5 text-left">
            <CheckCircle2 class="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span>¡Acceso concedido! Redirigiendo al panel de control...</span>
          </div>

          <div v-if="errorAutenticacion" class="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5 text-left">
            <AlertCircle class="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{{ errorAutenticacion }}</span>
          </div>

          <LoginForm 
            ref="loginFormRef"
            :cargando="cargando"
            @login-credenciales="handleLoginCredenciales"
          />

          <p class="text-center text-[11px] text-slate-500 mt-5 flex items-center justify-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
            <span>Políticas de dominio corporativo @ontime.es activas</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
