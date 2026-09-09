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
import { useNotificaciones } from '@/Almacenes/useNotificaciones'
import {
  CheckCircle2,
  AlertCircle,
  User,
  KeyRound,
  ShieldAlert,
  Database,
  Volume2,
  BookOpen,
  FileText,
  Download,
  Sparkles,
  RefreshCw,
  Megaphone,
  Send,
  Calendar,
  Layers,
  ArrowDownToLine
} from 'lucide-vue-next'

import PerfilFotoUploader from '@/componentes/Configuracion/PerfilFotoUploader.vue'
import PerfilPermisosCard from '@/componentes/Configuracion/PerfilPermisosCard.vue'
import PerfilFormularioDatos from '@/componentes/Configuracion/PerfilFormularioDatos.vue'
import PerfilCambioContrasena from '@/componentes/Configuracion/PerfilCambioContrasena.vue'
import PerfilDesactivarCuenta from '@/componentes/Configuracion/PerfilDesactivarCuenta.vue'
import PerfilAjustesVozAsistente from '@/componentes/Configuracion/PerfilAjustesVozAsistente.vue'

const { usuarioActual, actualizarPerfil, subirFotoPerfil } = useAuth()
const { elementoResaltadoId } = useHighlight()
const { publicarAnuncioActualizacion, notificarActualizacionManual } = useNotificaciones()

// Pestaña activa ('perfil' | 'seguridad' | 'asistente' | 'manuales' | 'riesgo')
const pestanaActiva = ref<'perfil' | 'seguridad' | 'asistente' | 'manuales' | 'riesgo'>('perfil')

// Estados de Manual de Usuario y Anuncios de Actualización
const versionManual = ref('v2.6 Oficial')
const fechaManual = ref(new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }))
const actualizandoManual = ref(false)

const tituloAnuncio = ref('')
const tipoAnuncio = ref<'actualizacion' | 'anuncio'>('actualizacion')
const fechaProgramadaAnuncio = ref('')
const mensajeAnuncio = ref('')
const departamentoAnuncio = ref('Toda la Empresa (General)')
const publicandoAnuncio = ref(false)

// Campos del formulario
const nombre = ref(usuarioActual.value?.nombre || '')
const email = ref(usuarioActual.value?.email || '')
const departamento = ref(usuarioActual.value?.departamento || 'General')
const rol = ref(usuarioActual.value?.rol || 'Administrador')
const genero = ref(usuarioActual.value?.genero || 'Masculino')
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
    genero: genero.value as any,
    biografia: biografia.value,
    avatar: avatarUrl.value,
    fotoUrl: avatarUrl.value
  })

  guardando.value = false

  if (exito) {
    mostrarAlerta('exito', '¡Datos de perfil, trato del asistente y foto sincronizados con éxito!')
  } else {
    mostrarAlerta('error', 'Hubo un error al actualizar los datos del perfil.')
  }
}

/**
 * Regenera/Actualiza la versión y fecha del Manual de Usuario y emite notificación global
 */
const actualizarManualDeUsuario = async () => {
  actualizandoManual.value = true
  
  // Simulación de empaquetado y cálculo de versión
  await new Promise(resolve => setTimeout(resolve, 800))
  fechaManual.value = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  versionManual.value = 'v2.6 Actualizada'

  await notificarActualizacionManual(versionManual.value)
  actualizandoManual.value = false
  mostrarAlerta('exito', '¡Manual de Usuario oficial regenerado y sincronizado exitosamente con notificación en el sistema!')
}

/**
 * Publica un anuncio o alerta de actualización del administrador para toda la empresa
 */
const publicarAnuncio = async () => {
  if (!tituloAnuncio.value.trim() || !mensajeAnuncio.value.trim()) {
    mostrarAlerta('error', 'Por favor ingresa el título y el mensaje del anuncio antes de publicar.')
    return
  }

  publicandoAnuncio.value = true

  await publicarAnuncioActualizacion({
    titulo: tituloAnuncio.value.trim(),
    mensaje: mensajeAnuncio.value.trim(),
    tipo: tipoAnuncio.value,
    departamento: departamentoAnuncio.value,
    fechaProgramada: fechaProgramadaAnuncio.value.trim() || 'Hoy',
    rutaDestino: '/configuracion'
  })

  // Limpiar campos
  tituloAnuncio.value = ''
  mensajeAnuncio.value = ''
  fechaProgramadaAnuncio.value = ''
  publicandoAnuncio.value = false

  mostrarAlerta('exito', '¡Anuncio de actualización publicado y visible en el panel de notificaciones!')
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

        <div class="flex flex-wrap items-center gap-2">
          <a
            href="/MANUAL_DE_USUARIO_HABLANDOCONTIGO.docx"
            download="MANUAL_DE_USUARIO_HABLANDOCONTIGO.docx"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition-all cursor-pointer"
            title="Descargar Manual de Usuario Oficial en Word"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Descargar Manual (.docx)</span>
          </a>

          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Database class="w-3.5 h-3.5 text-emerald-500" />
            <span>Sincronizado con Supabase</span>
          </div>
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
          @click="pestanaActiva = 'asistente'"
          :class="[
            'px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'asistente'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          ]"
        >
          <Volume2 class="w-4 h-4" />
          <span>Voz & Asistente IA</span>
        </button>

        <button
          @click="pestanaActiva = 'manuales'"
          :class="[
            'px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'manuales'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          ]"
        >
          <BookOpen class="w-4 h-4" />
          <span>Manuales & Documentos</span>
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
            v-model:genero="genero"
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

      <!-- CONTENIDO PESTAÑA 3: AJUSTES DE VOZ Y ASISTENTE IA -->
      <div v-else-if="pestanaActiva === 'asistente'" class="max-w-2xl mx-auto animate-fade-in">
        <PerfilAjustesVozAsistente />
      </div>

      <!-- CONTENIDO PESTAÑA 4: MANUALES & DOCUMENTOS OFICIALES -->
      <div v-else-if="pestanaActiva === 'manuales'" class="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
        
        <!-- Tarjeta 1: Manual de Usuario Oficial con Actualización Interactiva -->
        <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div class="flex items-start gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <BookOpen class="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Manual de Usuario Oficial &amp; Guía Operativa
                  </h3>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Word (.docx)
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {{ versionManual }} ({{ fechaManual }})
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Guía integral de 8 capítulos con explicaciones sencillas para niños, roles, alertas, comandos de voz en toda la app y cuestionarios.
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2.5 shrink-0">
              <!-- Botón Actualizar / Regenerar Manual -->
              <button
                type="button"
                @click="actualizarManualDeUsuario"
                :disabled="actualizandoManual"
                class="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                title="Actualizar versión del manual y notificar al sistema"
              >
                <RefreshCw class="w-4 h-4" :class="actualizandoManual ? 'animate-spin text-blue-500' : ''" />
                <span>{{ actualizandoManual ? 'Actualizando...' : '🔄 Actualizar Manual' }}</span>
              </button>

              <!-- Botón Descargar Word -->
              <a
                href="/MANUAL_DE_USUARIO_HABLANDOCONTIGO.docx"
                download="MANUAL_DE_USUARIO_HABLANDOCONTIGO.docx"
                class="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Download class="w-4 h-4" />
                <span>Descargar Manual (.docx)</span>
              </a>
            </div>
          </div>

          <!-- Puntos Clave del Manual -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>📘</span> Capítulo 1 a 3: Filosofía, Roles &amp; 8 Bloques
              </span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Detalla la misión en Contigo Call Center, la matriz de permisos de los 5 roles y la estructura oficial de preguntas por bloques.
              </p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🚨</span> Capítulo 4: Alertas Psicosociales &amp; Anonimato
              </span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Protocolos de prevención de burnout/acoso y cifrado de identidad por identificador UUID.
              </p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🎙️</span> Capítulo 5: Asistente de Voz Sofía / Daniel
              </span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Configuración Hombre/Mujer ("Estoy listo/a"), catálogo de múltiples voces y comandos directos en toda la app.
              </p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🎈</span> Metáforas &amp; Cajas para Niños
              </span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Explicaciones pedagógicas con ejemplos visuales y analogías para máxima comprensión en capacitaciones.
              </p>
            </div>
          </div>
        </div>

        <!-- Tarjeta 2: Panel de Administración para Publicar Anuncios & Notificaciones de Actualización -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/20 via-sky-950/20 to-blue-950/20 border border-cyan-500/30 shadow-sm space-y-5">
          <div class="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/30">
                <Megaphone class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Publicar Anuncio / Notificación de Actualización</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400">
                    Administrador
                  </span>
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Crea comunicados oficiales o alertas de mantenimiento programado que aparecerán en la campanita de notificaciones de todo el equipo.
                </p>
              </div>
            </div>
          </div>

          <!-- Formulario de Publicación de Anuncio -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Título -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Título del Anuncio / Actualización</label>
                <input
                  type="text"
                  v-model="tituloAnuncio"
                  placeholder="Ej: Actualización programada para el viernes a las 18:00 hrs"
                  class="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <!-- Tipo de Anuncio -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Notificación</label>
                <select
                  v-model="tipoAnuncio"
                  class="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="actualizacion">🚀 Actualización de Sistema / Nueva Versión</option>
                  <option value="anuncio">📢 Anuncio Programado / Mantenimiento</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Fecha / Programación -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-cyan-500" />
                  <span>Fecha o Momento Programado (Opcional)</span>
                </label>
                <input
                  type="text"
                  v-model="fechaProgramadaAnuncio"
                  placeholder="Ej: Este Viernes a las 18:00 hrs"
                  class="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <!-- Destinatarios -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers class="w-3.5 h-3.5 text-cyan-500" />
                  <span>Audiencia Destino</span>
                </label>
                <input
                  type="text"
                  v-model="departamentoAnuncio"
                  placeholder="Ej: Toda la Empresa (General) o Tecnología"
                  class="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <!-- Mensaje / Changelog -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Mensaje Detallado / Registro de Cambios</label>
              <textarea
                v-model="mensajeAnuncio"
                rows="3"
                placeholder="Describe los cambios, nuevas funciones o detalles de la ventana de mantenimiento..."
                class="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 resize-none leading-relaxed"
              ></textarea>
            </div>

            <!-- Botón Publicar -->
            <div class="flex items-center justify-end pt-2">
              <button
                type="button"
                @click="publicarAnuncio"
                :disabled="publicandoAnuncio || !tituloAnuncio.trim() || !mensajeAnuncio.trim()"
                class="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send class="w-4 h-4" />
                <span>{{ publicandoAnuncio ? 'Publicando...' : '📢 Publicar Anuncio a Todos' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tarjeta 3: Informe de Requerimientos del Sistema -->
        <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div class="flex items-start gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <FileText class="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Informe de Requerimientos Funcionales &amp; No Funcionales
                  </h3>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Word (.docx)
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  15 Requerimientos Funcionales (RF) y 7 No Funcionales (RNF) con especificación de ingeniería de software.
                </p>
              </div>
            </div>

            <a
              href="/INFORME_REQUERIMIENTOS_HABLANDOCONTIGO.docx"
              download="INFORME_REQUERIMIENTOS_HABLANDOCONTIGO.docx"
              class="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer shrink-0"
            >
              <Download class="w-4 h-4" />
              <span>Descargar Informe RF &amp; RNF (.docx)</span>
            </a>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="inline-flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-emerald-500" />
              <span>Incluye especificación técnica detallada, tablas de cumplimiento y cajas pedagógicas.</span>
            </span>
          </div>
        </div>

      </div>

      <!-- CONTENIDO PESTAÑA 5: DESACTIVAR CUENTA -->
      <div v-else-if="pestanaActiva === 'riesgo'" class="max-w-2xl mx-auto animate-fade-in">
        <PerfilDesactivarCuenta @mostrarAlerta="mostrarAlerta" />
      </div>

    </div>

  </div>
</template>
