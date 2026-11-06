<!--
  ============================================================================
  MODAL DE VERIFICACIÓN DE CONTRASEÑA DE PROYECTO (ModalVerificarPasswordProyecto.vue)
  ============================================================================
  Solicita la contraseña de inicio de sesión para finalizar, reabrir o comparar proyectos.
-->

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ShieldCheck, X, Lock } from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
  emailUsuario: string
  accionPendiente: 'finalizar_y_comparar' | 'solo_comparar' | 'reabrir'
  errorPassword: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'confirmar', password: string): void
}>()

const passwordLocal = ref('')

watch(
  () => props.abierto,
  (val) => {
    if (val) passwordLocal.value = ''
  }
)

const enviarFormulario = () => {
  emit('confirmar', passwordLocal.value)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="abierto"
      class="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-['Poppins',sans-serif]"
    >
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="emit('cerrar')" />

      <div class="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 text-left">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 dark:text-white">
                Verificación de Contraseña
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{
                  accionPendiente === 'finalizar_y_comparar'
                    ? 'Confirma tu contraseña para finalizar el proyecto (dispondrás de 3 días hábiles para revertirlo)'
                    : accionPendiente === 'reabrir'
                      ? 'Confirma tu contraseña para revertir la finalización y volver al proyecto activo'
                      : 'Confirma tu contraseña de inicio de sesión para visualizar la comparativa'
                }}
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="emit('cerrar')"
            class="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="enviarFormulario" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Contraseña de Inicio de Sesión ({{ emailUsuario || 'Administrador' }})
            </label>
            <input
              v-model="passwordLocal"
              type="password"
              autofocus
              placeholder="Ingresa tu contraseña de inicio de sesión..."
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            <p v-if="errorPassword" class="text-xs font-bold text-rose-500 pt-1">
              {{ errorPassword }}
            </p>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              @click="emit('cerrar')"
              class="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Lock class="w-3.5 h-3.5" />
              <span>{{ accionPendiente === 'reabrir' ? 'Confirmar y Revertir' : 'Confirmar y Continuar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
