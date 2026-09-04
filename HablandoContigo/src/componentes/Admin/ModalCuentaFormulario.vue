<!--
  ============================================================================
  MODAL FORMULARIO DE CUENTA (ModalCuentaFormulario.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { validarDominioCorporativo, type RolCuenta, type EstadoCuenta } from '@/Almacenes/useCuentas'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { User, Mail, Building, KeyRound, AlertCircle, Eye, EyeOff, ShieldCheck, UserPlus, Check } from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
  modoEdicion: boolean
  datosIniciales: {
    nombre: string
    email: string
    rol: RolCuenta
    departamento: string
    estado: EstadoCuenta
  }
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', formulario: {
    nombre: string
    email: string
    rol: RolCuenta
    departamento: string
    estado: EstadoCuenta
    nuevaContrasena?: string
  }): void
}>()

const formulario = ref({ ...props.datosIniciales })
const contrasenaCreacion = ref('')
const cambiarClave = ref(false)
const nuevaContrasena = ref('')
const mostrarContrasena = ref(false)
const errorValidacion = ref<string | null>(null)

watch(() => props.datosIniciales, (nuevosDatos) => {
  formulario.value = { ...nuevosDatos }
  contrasenaCreacion.value = ''
  cambiarClave.value = false
  nuevaContrasena.value = ''
  errorValidacion.value = null
}, { deep: true, immediate: true })

const emailEsValido = computed(() => {
  if (!formulario.value.email) return true
  return validarDominioCorporativo(formulario.value.email)
})

const aplicarDominioRapido = (dominio: string) => {
  const prefijo = formulario.value.email.split('@')[0] || ''
  formulario.value.email = `${prefijo}@${dominio}`
}

const manejarSubmit = () => {
  errorValidacion.value = null

  if (!validarDominioCorporativo(formulario.value.email)) {
    errorValidacion.value = 'Solo se permiten correos corporativos autorizados de la empresa (@siticore o @ontime).'
    return
  }

  // Validación de contraseña obligatoria al crear cuenta nueva
  if (!props.modoEdicion) {
    if (!contrasenaCreacion.value || contrasenaCreacion.value.length < 6) {
      errorValidacion.value = 'Por favor asigna una contraseña de al menos 6 caracteres para esta cuenta.'
      return
    }
  }

  // Validación de contraseña opcional al editar
  if (props.modoEdicion && cambiarClave.value && nuevaContrasena.value && nuevaContrasena.value.length < 6) {
    errorValidacion.value = 'La nueva contraseña debe tener al menos 6 caracteres.'
    return
  }

  const claveFinal = !props.modoEdicion 
    ? contrasenaCreacion.value 
    : (cambiarClave.value && nuevaContrasena.value ? nuevaContrasena.value : undefined)

  emit('guardar', {
    ...formulario.value,
    nuevaContrasena: claveFinal
  })
}
</script>

<template>
  <ModalBase
    :abierto="abierto"
    :titulo="modoEdicion ? 'Editar Cuenta de Colaborador' : 'Crear Nueva Cuenta Corporativa'"
    subtitulo="Solo se admiten correos autorizados (@siticore o @ontime). Se enviará verificación de correo."
    anchoMaximo="lg"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500">
        <UserPlus class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="info" tamano="sm">
        SUPER ADMIN
      </InsigniaPill>
    </template>

    <!-- Alerta de Validación -->
    <div 
      v-if="errorValidacion" 
      class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in text-left"
    >
      <AlertCircle class="w-4 h-4 shrink-0 text-rose-500" />
      <span>{{ errorValidacion }}</span>
    </div>

    <form id="form-cuenta" @submit.prevent="manejarSubmit" class="space-y-4 text-left">
      <!-- Nombre Completo -->
      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre Completo</label>
        <div class="relative">
          <User class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="formulario.nombre"
            type="text" 
            required 
            placeholder="Ej. Laura Gómez Martínez"
            class="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      <!-- Correo Electrónico -->
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico Corporativo</label>
          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="aplicarDominioRapido('siticore.com')"
              class="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-[10px] font-mono hover:bg-sky-100 cursor-pointer"
            >
              +@siticore.com
            </button>
            <button
              type="button"
              @click="aplicarDominioRapido('ontime.com')"
              class="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono hover:bg-indigo-100 cursor-pointer"
            >
              +@ontime.com
            </button>
          </div>
        </div>
        <div class="relative">
          <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="formulario.email"
            type="email" 
            required 
            placeholder="colaborador@siticore.com"
            class="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      <!-- Rol y Estado -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Rol de Acceso</label>
          <select 
            v-model="formulario.rol"
            class="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
          >
            <option value="Super Administrador">Super Administrador</option>
            <option value="Administrador">Administrador</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Analista RRHH">Analista RRHH</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Estado de Cuenta</label>
          <select 
            v-model="formulario.estado"
            class="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>
      </div>

      <!-- Departamento -->
      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Departamento / Área</label>
        <div class="relative">
          <Building class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="formulario.departamento"
            type="text" 
            required 
            placeholder="Ej. Tecnología, Operaciones, etc."
            class="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      <!-- Asignar Contraseña al Crear Cuenta (Administrada en Supabase) -->
      <div v-if="!modoEdicion" class="space-y-1.5 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-sky-950 dark:text-sky-300 flex items-center gap-1.5">
            <KeyRound class="w-3.5 h-3.5 text-sky-500" />
            <span>Contraseña Inicial Temporal (Asignada por ti)</span>
          </label>
          <span class="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-semibold">
            Supabase Auth (Cifrada)
          </span>
        </div>

        <div class="relative">
          <input 
            v-model="contrasenaCreacion"
            :type="mostrarContrasena ? 'text' : 'password'" 
            required
            minlength="6"
            placeholder="Asigna la contraseña inicial temporal (mínimo 6 caracteres)"
            class="w-full pl-3 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-sky-300 dark:border-sky-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:font-sans"
          />
          <button
            type="button"
            @click="mostrarContrasena = !mostrarContrasena"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
            title="Mostrar / Ocultar Contraseña"
          >
            <EyeOff v-if="mostrarContrasena" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          La contraseña será gestionada exclusivamente por Supabase Auth (sin guardarse en texto plano). Por seguridad, al usuario se le exigirá cambiarla obligatoriamente en su primer inicio de sesión.
        </p>
      </div>

      <!-- Super Admin: Cambio de clave en edición -->
      <div v-if="modoEdicion" class="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-3">
        <label class="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-purple-900 dark:text-purple-300">
          <input
            v-model="cambiarClave"
            type="checkbox"
            class="w-4 h-4 rounded border-purple-400 text-purple-600 focus:ring-purple-500/20 accent-purple-600 cursor-pointer"
          />
          <span class="flex items-center gap-1.5">
            <KeyRound class="w-3.5 h-3.5" />
            <span>Restablecer / Cambiar Contraseña de este Usuario</span>
          </span>
        </label>

        <div v-if="cambiarClave" class="space-y-1 pt-1 animate-fade-in">
          <label class="text-[11px] font-semibold text-purple-800 dark:text-purple-300">
            Nueva Contraseña Asignada por Super Admin
          </label>
          <div class="relative">
            <input 
              v-model="nuevaContrasena"
              :type="mostrarContrasena ? 'text' : 'password'" 
              placeholder="Mínimo 6 caracteres"
              class="w-full pl-3 pr-9 py-2 rounded-xl bg-white dark:bg-slate-950 border border-purple-300 dark:border-purple-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              @click="mostrarContrasena = !mostrarContrasena"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              <EyeOff v-if="mostrarContrasena" class="w-3.5 h-3.5" />
              <Eye v-else class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </form>

    <template #pie>
      <div class="flex items-center justify-end gap-2 w-full">
        <BotonBase
          variante="secundario"
          tamano="pequeno"
          @click="emit('cerrar')"
        >
          Cancelar
        </BotonBase>

        <BotonBase
          tipo="submit"
          variante="primario"
          tamano="pequeno"
          :deshabilitado="!emailEsValido"
          form="form-cuenta"
          @click="manejarSubmit"
        >
          <template #iconoIzquierdo>
            <Check class="w-4 h-4" />
          </template>
          <span>{{ modoEdicion ? 'Guardar Cambios' : 'Crear Cuenta y Enviar Verificación' }}</span>
        </BotonBase>
      </div>
    </template>
  </ModalBase>
</template>
