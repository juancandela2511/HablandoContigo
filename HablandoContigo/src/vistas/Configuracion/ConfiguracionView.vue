<!--
  ============================================================================
  VISTA CONFIGURACIÓN DE PERFIL Y FOTO DE ADMINISTRADOR (ConfiguracionView.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Orquesta la configuración de la cuenta y perfil del administrador:
  - Encabezado y alertas reactivas de retroalimentación.
  - Subida y previsualización de foto/avatar (`PerfilFotoUploader.vue`).
  - Tarjeta de permisos del rol (`PerfilPermisosCard.vue`).
  - Formulario de datos personales y biografía (`PerfilFormularioDatos.vue`).
  
  ¿PARA QUÉ SIRVE?
  - Proveer una pantalla modular, limpia y desacoplada para la identidad del administrador.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useAuth.ts, useHighlight.ts.
  - Subcomponentes en `src/componentes/Configuracion/`.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/Almacenes/useAuth'
import { useHighlight } from '@/Almacenes/useHighlight'
import {
  CheckCircle2,
  AlertCircle,
  User,
  KeyRound,
  ShieldAlert,
  Database
} from 'lucide-vue-next'

import PerfilFotoUploader from '@/componentes/Configuracion/PerfilFotoUploader.vue'
import PerfilPermisosCard from '@/componentes/Configuracion/PerfilPermisosCard.vue'
import PerfilFormularioDatos from '@/componentes/Configuracion/PerfilFormularioDatos.vue'
import PerfilCambioContrasena from '@/componentes/Configuracion/PerfilCambioContrasena.vue'
import PerfilDesactivarCuenta from '@/componentes/Configuracion/PerfilDesactivarCuenta.vue'

const { usuarioActual, actualizarPerfil, subirFotoPerfil } = useAuth()
const { elementoResaltadoId } = useHighlight()

// Pestaña activa ('perfil' | 'seguridad' | 'riesgo')
const pestanaActiva = ref<'perfil' | 'seguridad' | 'riesgo'>('perfil')

// Campos del formulario
const nombre = ref(usuarioActual.value?.nombre || '')
const email = ref(usuarioActual.value?.email || '')
const departamento = ref(usuarioActual.value?.departamento || 'General')
const rol = ref(usuarioActual.value?.rol || 'Administrador')
const biografia = ref(usuarioActual.value?.biografia || '')
const avatarUrl = ref(usuarioActual.value?.fotoUrl || usuarioActual.value?.avatar || '')

const mensajeExito = ref<string | null>(null)
const mensajeError = ref<string | null>(null)
const guardando = ref(false)
const subiendoFoto = ref(false)

const avataresPredefinidos: string[] = []

const mostrarAlerta = (tipo: 'exito' | 'error', mensaje: string) => {
  if (tipo === 'exito') {
    mensajeExito.value = mensaje
    setTimeout(() => { mensajeExito.value = null }, 4500)
  } else {
    mensajeError.value = mensaje
    setTimeout(() => { mensajeError.value = null }, 4500)
  }
}

/**
 * Maneja la subida física de fotografía y persistencia directa en Supabase / Base de datos
 */
const manejarSubidaArchivo = async (archivo: File) => {
  subiendoFoto.value = true
  const res = await subirFotoPerfil(archivo)
  subiendoFoto.value = false

  if (res.ok) {
    avatarUrl.value = res.url
    mostrarAlerta('exito', '¡Fotografía guardada y persistida exitosamente en la base de datos!')
  } else {
    mostrarAlerta('error', res.mensaje || 'Error al subir la fotografía a Supabase.')
  }
}

/**
 * Maneja la selección de un avatar predefinido
 */
const manejarSeleccionPreset = async (urlPreset: string) => {
  avatarUrl.value = urlPreset
  subiendoFoto.value = true
  const res = await subirFotoPerfil(urlPreset)
  subiendoFoto.value = false

  if (res.ok) {
    mostrarAlerta('exito', 'Avatar seleccionado y actualizado en la base de datos.')
  }
}

const guardarPerfil = async () => {
  guardando.value = true
  mensajeError.value = null
  mensajeExito.value = null

  const exito = await actualizarPerfil({
    nombre: nombre.value,
    email: email.value,
    departamento: departamento.value,
    rol: rol.value as any,
    biografia: biografia.value,
    avatar: avatarUrl.value,
    fotoUrl: avatarUrl.value
  })

  guardando.value = false

  if (exito) {
    mostrarAlerta('exito', '¡Datos de perfil y foto sincronizados exitosamente con la base de datos!')
  } else {
    mostrarAlerta('error', 'Hubo un error al actualizar los datos del perfil.')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 px-4 sm:px-6 md:pl-20 md:pr-8 py-6 md:py-8 relative font-['Poppins',sans-serif] transition-colors duration-300">
    
    <!-- Luces sutiles de fondo -->
    <div class="fixed top-1/4 right-10 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-10 left-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-5xl mx-auto space-y-7 relative z-10">
      
      <!-- Encabezado -->
      <div class="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Configuración de Cuenta</span>
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-sky-950/80 border border-blue-200 dark:border-sky-800 text-blue-700 dark:text-sky-400">
              {{ rol }}
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Administra tu identidad, fotografía en base de datos, credenciales de seguridad y estado de cuenta.
          </p>
        </div>

        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          <Database class="w-3.5 h-3.5 text-emerald-500" />
          <span>Sincronizado con Supabase</span>
        </div>
      </div>

      <!-- Barra de Pestañas de Configuración -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          @click="pestanaActiva = 'perfil'"
          :class="[
            'px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'perfil'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          ]"
        >
          <User class="w-4 h-4" />
          <span>Perfil & Fotografía</span>
        </button>

        <button
          @click="pestanaActiva = 'seguridad'"
          :class="[
            'px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'seguridad'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          ]"
        >
          <KeyRound class="w-4 h-4" />
          <span>Cambio de Contraseña</span>
        </button>

        <button
          @click="pestanaActiva = 'riesgo'"
          :class="[
            'px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'riesgo'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/25 font-bold'
              : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
          ]"
        >
          <ShieldAlert class="w-4 h-4" />
          <span>Desactivar Cuenta</span>
        </button>
      </div>

      <!-- Alertas Globales de Feedback -->
      <div 
        v-if="mensajeExito" 
        class="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-fade-in text-left"
      >
        <CheckCircle2 class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{{ mensajeExito }}</span>
      </div>

      <div 
        v-if="mensajeError" 
        class="p-4 rounded-2xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-fade-in text-left"
      >
        <AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
        <span>{{ mensajeError }}</span>
      </div>

      <!-- CONTENIDO PESTAÑA 1: PERFIL & FOTO EN BASE DE DATOS -->
      <div v-if="pestanaActiva === 'perfil'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
        
        <!-- Columna Izquierda: Foto & Permisos (5 columnas) -->
        <div 
          id="seccion-perfil-foto"
          class="lg:col-span-5 space-y-6 transition-all duration-500"
          :class="elementoResaltadoId === 'seccion-perfil-foto' ? 'ring-4 ring-sky-400 scale-[1.01] animate-pulse p-1 rounded-3xl' : ''"
        >
          <PerfilFotoUploader
            :avatarUrl="avatarUrl"
            :avataresPredefinidos="avataresPredefinidos"
            :subiendo="subiendoFoto"
            @actualizarAvatar="manejarSeleccionPreset"
            @subirArchivo="manejarSubidaArchivo"
            @mostrarAlerta="mostrarAlerta"
          />

          <PerfilPermisosCard :rol="rol" />
        </div>

        <!-- Columna Derecha: Formulario de Datos Personales (7 columnas) -->
        <div class="lg:col-span-7">
          <PerfilFormularioDatos
            v-model:nombre="nombre"
            v-model:email="email"
            v-model:departamento="departamento"
            v-model:rol="rol"
            v-model:biografia="biografia"
            :guardando="guardando"
            @guardar="guardarPerfil"
          />
        </div>

      </div>

      <!-- CONTENIDO PESTAÑA 2: CAMBIO DE CONTRASEÑA -->
      <div v-else-if="pestanaActiva === 'seguridad'" class="max-w-2xl mx-auto animate-fade-in">
        <PerfilCambioContrasena @mostrarAlerta="mostrarAlerta" />
      </div>

      <!-- CONTENIDO PESTAÑA 3: DESACTIVAR CUENTA -->
      <div v-else-if="pestanaActiva === 'riesgo'" class="max-w-2xl mx-auto animate-fade-in">
        <PerfilDesactivarCuenta @mostrarAlerta="mostrarAlerta" />
      </div>

    </div>

  </div>
</template>
