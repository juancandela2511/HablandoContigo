<!--
  ============================================================================
  COMPONENTE DESACTIVACIÓN DE CUENTA (PerfilDesactivarCuenta.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Gestiona la desactivación voluntaria o administrativa de la cuenta del usuario:
  - Tarjeta de advertencia visual (Zona de Riesgo / Danger Zone).
  - Modal de confirmación con doble factor de seguridad (escribir "DESACTIVAR").
  - Selección de motivo de salida/desactivación.
  - Ejecución de desactivación en Supabase DB (`public.perfiles`), Auth y `useCuentas`.
  - Cierre inmediato de sesión y redirección segura al portal de acceso.
  
  ¿PARA QUÉ SIRVE?
  - Proteger la privacidad y permitir la revocación controlada de accesos institucionales.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useAuth.ts: Ejecuta `desactivarCuenta()`.
  - useRouter: Redirige a `/login` tras confirmar.
  - ConfiguracionView.vue: Componente que lo renderiza.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import {
  AlertOctagon,
  ShieldAlert,
  X,
  AlertTriangle,
  Loader2,
  Lock,
  UserX
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'mostrarAlerta', tipo: 'exito' | 'error', mensaje: string): void
}>()

const router = useRouter()
const { usuarioActual, desactivarCuenta } = useAuth()

const modalConfirmacionAbierto = ref(false)
const textoConfirmacion = ref('')
const motivoSeleccionado = ref('Transición de responsabilidades')
const detalleMotivo = ref('')
const procesando = ref(false)

const motivosDisponibles = [
  'Transición de responsabilidades',
  'Cambio de departamento o proyecto',
  'Pausa temporal en funciones de clima',
  'Cierre de ciclo institucional',
  'Otro motivo'
]

const abrirModal = () => {
  textoConfirmacion.value = ''
  detalleMotivo.value = ''
  modalConfirmacionAbierto.value = true
}

const cerrarModal = () => {
  if (procesando.value) return
  modalConfirmacionAbierto.value = false
}

const confirmarDesactivacion = async () => {
  if (textoConfirmacion.value.trim().toUpperCase() !== 'DESACTIVAR') {
    emit('mostrarAlerta', 'error', 'Debes escribir exactamente la palabra DESACTIVAR para confirmar.')
    return
  }

  procesando.value = true

  const motivoCompleto = detalleMotivo.value.trim() 
    ? `${motivoSeleccionado.value}: ${detalleMotivo.value.trim()}`
    : motivoSeleccionado.value

  const resultado = await desactivarCuenta(motivoCompleto)
  procesando.value = false

  if (resultado.ok) {
    modalConfirmacionAbierto.value = false
    router.push({ path: '/login', query: { desactivada: '1' } })
  } else {
    emit('mostrarAlerta', 'error', resultado.mensaje)
  }
}
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-red-500/5 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 backdrop-blur-xl shadow-xl space-y-5 text-left">
    
    <!-- Encabezado Danger Zone -->
    <div class="flex items-start justify-between gap-4 border-b border-red-200/60 dark:border-red-900/40 pb-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertOctagon class="w-4 h-4" />
          </div>
          <h3 class="text-sm sm:text-base font-bold text-red-900 dark:text-red-300">
            Zona de Riesgo: Desactivar Cuenta
          </h3>
        </div>
        <p class="text-xs text-red-700/80 dark:text-red-400/80">
          Suspende de forma controlada el acceso administrativo a encuestas, métricas y dashboards corporativos.
        </p>
      </div>

      <span class="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-[10px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 shrink-0">
        Acción Reversible
      </span>
    </div>

    <!-- Puntos de Consecuencias -->
    <div class="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-red-200/50 dark:border-red-900/30 text-xs text-slate-700 dark:text-slate-300 space-y-2">
      <p class="font-semibold text-red-800 dark:text-red-400">Al desactivar tu cuenta ocurrirá lo siguiente:</p>
      <ul class="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
        <li>Tu sesión actual se cerrará inmediatamente en todos los dispositivos.</li>
        <li>Tu estado cambiará a <strong class="text-slate-800 dark:text-slate-200">"Inactivo"</strong> en el directorio de cuentas.</li>
        <li>Tus encuestas creadas y registros históricos se conservarán seguros en la base de datos.</li>
        <li>Para reactivar la cuenta, un Super Administrador podrá habilitarte de nuevo desde el módulo de cuentas.</li>
      </ul>
    </div>

    <!-- Botón Disparador del Modal -->
    <div class="flex items-center justify-between pt-2">
      <span class="text-[11px] text-slate-500">
        Usuario actual: <strong class="text-slate-700 dark:text-slate-300">{{ usuarioActual?.email }}</strong>
      </span>

      <button
        type="button"
        @click="abrirModal"
        class="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-red-600/20 active:scale-[0.98] transition-all cursor-pointer"
      >
        <UserX class="w-4 h-4" />
        <span>Desactivar Mi Cuenta</span>
      </button>
    </div>

    <!-- MODAL DE CONFIRMACIÓN CON DOBLE FACTOR DE SEGURIDAD -->
    <div
      v-if="modalConfirmacionAbierto"
      class="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      @click.self="cerrarModal"
    >
      <div class="bg-white dark:bg-slate-900 border border-red-300 dark:border-red-900/80 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left relative">
        
        <!-- Botón Cerrar Modal -->
        <button
          @click="cerrarModal"
          :disabled="procesando"
          class="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-xl cursor-pointer disabled:opacity-50"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Cabecera del Modal -->
        <div class="flex items-start gap-3">
          <div class="p-3 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <h4 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              ¿Estás seguro de desactivar tu cuenta?
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Esta acción suspenderá tus credenciales y cerrará tu sesión activa de inmediato.
            </p>
          </div>
        </div>

        <!-- Selector de Motivo -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Motivo de desactivación (Opcional):
          </label>
          <select
            v-model="motivoSeleccionado"
            class="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-red-500"
          >
            <option v-for="motivo in motivosDisponibles" :key="motivo" :value="motivo">
              {{ motivo }}
            </option>
          </select>
        </div>

        <!-- Comentario Adicional -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Detalles adicionales (Opcional):
          </label>
          <textarea
            v-model="detalleMotivo"
            rows="2"
            placeholder="Escribe algún comentario o contexto para el área de RRHH..."
            class="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-red-500 resize-none"
          ></textarea>
        </div>

        <!-- Input de Confirmación Obligatorio -->
        <div class="space-y-1.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
          <label class="block text-xs font-bold text-red-900 dark:text-red-300">
            Escribe <span class="underline font-mono">DESACTIVAR</span> para confirmar:
          </label>
          <input
            v-model="textoConfirmacion"
            type="text"
            placeholder="DESACTIVAR"
            class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <!-- Botones de Acción del Modal -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            @click="cerrarModal"
            :disabled="procesando"
            class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            @click="confirmarDesactivacion"
            :disabled="procesando || textoConfirmacion.trim().toUpperCase() !== 'DESACTIVAR'"
            class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="procesando" class="w-4 h-4 animate-spin" />
            <UserX v-else class="w-4 h-4" />
            <span>{{ procesando ? 'Desactivando...' : 'Confirmar Desactivación' }}</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
