<!--
  ============================================================================
  MODAL DE GESTIÓN DE TOKENS Y PINS TEMPORALES DE ACCESO
  (ModalGestionTokensAcceso.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  KeyRound,
  X,
  Sparkles,
  Clock,
  Shield,
  Copy,
  Check,
  Trash2,
  Ban,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Eye,
  BarChart3,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-vue-next'
import {
  useTokensAcceso,
  PRESETS_TOKENS,
  type PresetRolToken,
  type PermisosTokenAcceso,
  type TokenAccesoTemporal
} from '@/Almacenes/useTokensAcceso'
import { BotonBase } from '@/componentes/ElementosBase'

const props = defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const {
  tokens,
  tokensActivos,
  tokensExpiradosORevocados,
  cargandoTokens,
  generarTokenAcceso,
  revocarToken,
  eliminarToken,
  calcularTiempoRestante
} = useTokensAcceso()

const tabActiva = ref<'generar' | 'listado'>('generar')
const tokenRecienGenerado = ref<TokenAccesoTemporal | null>(null)
const copiadoId = ref<string | null>(null)

// Formulario de nuevo Token
const nombreDestinatario = ref('')
const presetSeleccionado = ref<PresetRolToken>('solo_encuestas_rapidas')
const duracionMinutos = ref(480) // 8 horas por defecto
const rutaInicial = ref('/proyectos')
const usosMaximos = ref(0) // 0 = ilimitado durante el tiempo

// Permisos manuales cuando es personalizado
const permisosManuales = ref<PermisosTokenAcceso>({
  proyectos: true,
  crearEncuestasRapidas: true,
  editarEncuestaClima: false,
  dashboard: false,
  alertas: false,
  cuentas: false,
  auditoriaErrores: false,
  configuracion: false
})

// Opciones de duración predefinidas
const opcionesDuracion = [
  { minutos: 15, etiqueta: '15 Minutos', descripcion: 'Acceso express ultracorto' },
  { minutos: 60, etiqueta: '1 Hora', descripcion: 'Revisión rápida' },
  { minutos: 240, etiqueta: '4 Horas', descripcion: 'Media jornada' },
  { minutos: 480, etiqueta: '8 Horas', descripcion: 'Jornada laboral completa' },
  { minutos: 1440, etiqueta: '24 Horas', descripcion: '1 Día completo' },
  { minutos: 10080, etiqueta: '7 Días', descripcion: '1 Semana de auditoría' }
]

// Lista de Presets informativos
const listaPresets: Array<{ id: PresetRolToken; nombre: string; descripcion: string; icono: any; color: string }> = [
  {
    id: 'solo_encuestas_rapidas',
    nombre: 'Solo Crear Encuestas Rápidas (IA)',
    descripcion: 'Diseñar y publicar cuestionarios con IA sin ver resultados ni métricas.',
    icono: Zap,
    color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: 'solo_supervisar',
    nombre: 'Solo Supervisar & Alertas',
    descripcion: 'Lectura de encuestas y monitoreo de alertas de clima en tiempo real.',
    icono: Eye,
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'solo_dashboard',
    nombre: 'Solo Dashboard & Métricas',
    descripcion: 'Análisis de gráficos, estadísticas consolidadas y exportación de informes.',
    icono: BarChart3,
    color: 'from-blue-500/20 to-indigo-500/10 text-sky-400 border-sky-500/30'
  },
  {
    id: 'auditor_completo',
    nombre: 'Auditor Completo Temporal',
    descripcion: 'Acceso a Proyectos, Dashboard, Alertas y Auditoría con tiempo límite.',
    icono: Shield,
    color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30'
  },
  {
    id: 'personalizado',
    nombre: 'Personalizado a Medida',
    descripcion: 'Configuración granular y detallada permiso por permiso.',
    icono: SlidersHorizontal,
    color: 'from-slate-500/20 to-slate-600/10 text-slate-300 border-slate-600/40'
  }
]

// Actualizar permisos manuales al cambiar preset
const alCambiarPreset = (nuevoPreset: PresetRolToken) => {
  presetSeleccionado.value = nuevoPreset
  if (nuevoPreset !== 'personalizado') {
    permisosManuales.value = { ...PRESETS_TOKENS[nuevoPreset].permisos }
    rutaInicial.value = PRESETS_TOKENS[nuevoPreset].rutaInicial
  }
}

// Timer para refrescar tiempos restantes cada 30 segundos
let intervaloTiempo: any = null
const ahoraTick = ref(Date.now())

onMounted(() => {
  intervaloTiempo = setInterval(() => {
    ahoraTick.value = Date.now()
  }, 30000)
})

onUnmounted(() => {
  if (intervaloTiempo) clearInterval(intervaloTiempo)
})

const manejarCrearToken = async () => {
  const res = await generarTokenAcceso({
    nombreDestinatario: nombreDestinatario.value,
    preset: presetSeleccionado.value,
    permisos: presetSeleccionado.value === 'personalizado' ? permisosManuales.value : undefined,
    duracionMinutos: duracionMinutos.value,
    rutaInicial: rutaInicial.value,
    usosMaximos: usosMaximos.value,
    creadoPor: 'Administrador'
  })

  if (res.ok && res.token) {
    tokenRecienGenerado.value = res.token
    nombreDestinatario.value = ''
    tabActiva.value = 'listado'
  }
}

const copiarCodigo = async (codigo: string, id: string) => {
  try {
    await navigator.clipboard.writeText(codigo)
    copiadoId.value = id
    setTimeout(() => {
      if (copiadoId.value === id) copiadoId.value = null
    }, 2500)
  } catch {}
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="abierto"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-['Poppins',sans-serif]"
        @click.self="$emit('cerrar')"
      >
        <div class="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
          
          <!-- Header del Modal -->
          <div class="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <KeyRound class="w-6 h-6" />
              </div>
              <div class="text-left">
                <div class="flex items-center gap-2">
                  <h2 class="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Tokens y PINs de Acceso Temporal
                  </h2>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {{ tokensActivos.length }} Activos
                  </span>
                </div>
                <p class="text-xs text-slate-400">
                  Emite claves de ingreso directo con permisos restringidos y tiempo de expiración automático.
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="$emit('cerrar')"
              class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Pestañas de navegación -->
          <div class="flex items-center border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-2">
            <button
              type="button"
              @click="tabActiva = 'generar'"
              :class="[
                'px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2',
                tabActiva === 'generar'
                  ? 'bg-slate-900 text-amber-400 border-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              ]"
            >
              <Sparkles class="w-4 h-4" />
              <span>Generar Nuevo Token</span>
            </button>

            <button
              type="button"
              @click="tabActiva = 'listado'"
              :class="[
                'px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2',
                tabActiva === 'listado'
                  ? 'bg-slate-900 text-sky-400 border-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              ]"
            >
              <KeyRound class="w-4 h-4" />
              <span>Tokens Emitidos ({{ tokens.length }})</span>
            </button>
          </div>

          <!-- Cuerpo deslizable -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 text-left">
            
            <!-- VISTA 1: GENERAR NUEVO TOKEN -->
            <div v-if="tabActiva === 'generar'" class="space-y-6">
              
              <!-- Campo: Nombre o Destinatario -->
              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Nombre o Destinatario del Acceso *
                </label>
                <div class="relative">
                  <input
                    v-model="nombreDestinatario"
                    type="text"
                    placeholder="Ej. Auditor Bogotá, Supervisor de Clima, Practicante Encuestas..."
                    class="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  />
                </div>
                <p class="text-[11px] text-slate-400">
                  Identifica quién utilizará este código para ingresar sin correo corporativo ni contraseña fija.
                </p>
              </div>

              <!-- Selector de Presets de Permisos -->
              <div class="space-y-2.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Nivel de Acceso y Permisos Concedidos
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    v-for="p in listaPresets"
                    :key="p.id"
                    @click="alCambiarPreset(p.id)"
                    :class="[
                      'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2',
                      presetSeleccionado === p.id
                        ? `bg-gradient-to-br ${p.color} ring-2 ring-amber-400/30 border-amber-400/80 shadow-lg`
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    ]"
                  >
                    <div class="flex items-center gap-2.5">
                      <component :is="p.icono" class="w-5 h-5 shrink-0" />
                      <span class="text-xs font-bold text-white">{{ p.nombre }}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 leading-relaxed">
                      {{ p.descripcion }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Checkboxes personalizados (Solo si elige Personalizado) -->
              <div v-if="presetSeleccionado === 'personalizado'" class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Configuración Granular de Permisos
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                  <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <input type="checkbox" v-model="permisosManuales.proyectos" class="rounded accent-amber-500 w-4 h-4" />
                    <span>Ver y Acceder a Proyectos</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <input type="checkbox" v-model="permisosManuales.crearEncuestasRapidas" class="rounded accent-amber-500 w-4 h-4" />
                    <span>Crear Encuestas Rápidas (IA)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <input type="checkbox" v-model="permisosManuales.editarEncuestaClima" class="rounded accent-amber-500 w-4 h-4" />
                    <span>Editar Encuesta Fija de Clima</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <input type="checkbox" v-model="permisosManuales.dashboard" class="rounded accent-amber-500 w-4 h-4" />
                    <span>Ver Dashboard y Estadísticas</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <input type="checkbox" v-model="permisosManuales.alertas" class="rounded accent-amber-500 w-4 h-4" />
                    <span>Monitorear Alertas de Clima</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <input type="checkbox" v-model="permisosManuales.auditoriaErrores" class="rounded accent-amber-500 w-4 h-4" />
                    <span>Auditoría del Sistema</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <input type="checkbox" v-model="permisosManuales.cuentas" class="rounded accent-amber-500 w-4 h-4" />
                    <span>Administrar Cuentas</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <input type="checkbox" v-model="permisosManuales.configuracion" class="rounded accent-amber-500 w-4 h-4" />
                    <span>Acceder a Configuración</span>
                  </label>
                </div>
              </div>

              <!-- Selector de Tiempo de Expiración -->
              <div class="space-y-2.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Tiempo de Expiración del Acceso
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    v-for="op in opcionesDuracion"
                    :key="op.minutos"
                    type="button"
                    @click="duracionMinutos = op.minutos"
                    :class="[
                      'p-3 rounded-2xl border text-left transition-all cursor-pointer',
                      duracionMinutos === op.minutos
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
                    ]"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-bold text-white">{{ op.etiqueta }}</span>
                      <Clock class="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p class="text-[10px] text-slate-400">{{ op.descripcion }}</p>
                  </button>
                </div>
              </div>

              <!-- Botón Generar Token -->
              <div class="pt-2">
                <BotonBase
                  variante="gradiente"
                  tamano="grande"
                  :bloqueCompleto="true"
                  :deshabilitado="!nombreDestinatario.trim()"
                  @click="manejarCrearToken"
                >
                  <template #iconoIzquierdo>
                    <Zap class="w-4 h-4" />
                  </template>
                  <span>⚡ Generar Token de Acceso Temporal</span>
                </BotonBase>
              </div>
            </div>

            <!-- VISTA 2: LISTADO DE TOKENS EMITIDOS -->
            <div v-else class="space-y-4">
              
              <!-- Banner de Token recién creado si existe -->
              <div
                v-if="tokenRecienGenerado"
                class="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-white space-y-3 animate-fade-in"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 class="w-4 h-4" />
                    ¡Token Generado y Listo para Usar!
                  </span>
                  <button
                    @click="tokenRecienGenerado = null"
                    class="text-xs text-slate-400 hover:text-white"
                  >
                    Ocultar
                  </button>
                </div>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-950/80 rounded-xl border border-emerald-500/30">
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Código / PIN de Ingreso</span>
                    <p class="text-2xl font-black text-amber-400 font-mono tracking-widest">{{ tokenRecienGenerado.codigoToken }}</p>
                    <p class="text-xs text-slate-300">Para: <strong>{{ tokenRecienGenerado.nombreDestinatario }}</strong></p>
                  </div>
                  <button
                    type="button"
                    @click="copiarCodigo(tokenRecienGenerado.codigoToken, tokenRecienGenerado.id)"
                    class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Check v-if="copiadoId === tokenRecienGenerado.id" class="w-4 h-4" />
                    <Copy v-else class="w-4 h-4" />
                    <span>{{ copiadoId === tokenRecienGenerado.id ? '¡Copiado!' : 'Copiar Token' }}</span>
                  </button>
                </div>
              </div>

              <!-- Lista de Tokens -->
              <div v-if="tokens.length === 0" class="text-center py-12 space-y-3">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                  <KeyRound class="w-7 h-7" />
                </div>
                <h3 class="text-sm font-bold text-white">No hay tokens emitidos</h3>
                <p class="text-xs text-slate-400 max-w-sm mx-auto">
                  Genera tu primer token temporal desde la pestaña anterior para otorgar accesos restringidos.
                </p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="t in tokens"
                  :key="t.id"
                  class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 font-mono font-bold text-xs">
                        <KeyRound class="w-5 h-5" />
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold text-white">{{ t.nombreDestinatario }}</span>
                          <span
                            :class="[
                              'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                              t.estado === 'Activo' && !calcularTiempoRestante(t.expiraEn).expirado
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : t.estado === 'Revocado'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            ]"
                          >
                            {{ t.estado === 'Activo' ? calcularTiempoRestante(t.expiraEn).texto : t.estado }}
                          </span>
                        </div>
                        <p class="text-[11px] text-slate-400">
                          Preset: <strong class="text-slate-300">{{ PRESETS_TOKENS[t.preset]?.nombre || t.preset }}</strong>
                        </p>
                      </div>
                    </div>

                    <!-- Código destacado y botón de copiar -->
                    <div class="flex items-center gap-2">
                      <div class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center gap-2">
                        <span class="text-xs font-black font-mono tracking-wider text-amber-400">{{ t.codigoToken }}</span>
                        <button
                          type="button"
                          @click="copiarCodigo(t.codigoToken, t.id)"
                          title="Copiar Código"
                          class="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Check v-if="copiadoId === t.id" class="w-3.5 h-3.5 text-emerald-400" />
                          <Copy v-else class="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        v-if="t.estado === 'Activo' && !calcularTiempoRestante(t.expiraEn).expirado"
                        type="button"
                        @click="revocarToken(t.id)"
                        title="Revocar acceso de inmediato"
                        class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Ban class="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        @click="eliminarToken(t.id)"
                        title="Eliminar registro"
                        class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Permisos concedidos badges -->
                  <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[10px]">
                    <span class="text-slate-500 font-semibold mr-1">Permisos:</span>
                    <span v-if="t.permisos.proyectos" class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">Proyectos</span>
                    <span v-if="t.permisos.crearEncuestasRapidas" class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Encuestas Rápidas (IA)</span>
                    <span v-if="t.permisos.editarEncuestaClima" class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Editar Clima</span>
                    <span v-if="t.permisos.dashboard" class="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">Dashboard</span>
                    <span v-if="t.permisos.alertas" class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Alertas</span>
                    <span v-if="t.permisos.auditoriaErrores" class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Auditoría</span>
                    <span v-if="t.permisos.cuentas" class="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">Cuentas</span>
                    <span v-if="t.permisos.configuracion" class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Ajustes</span>
                    <span class="ml-auto text-slate-500 font-mono">Usos: {{ t.usosActuales }}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- Footer del Modal -->
          <div class="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <p class="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-amber-400" />
              <span>Los tokens caducan automáticamente al terminar su tiempo de vigencia.</span>
            </p>
            <button
              type="button"
              @click="$emit('cerrar')"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>
