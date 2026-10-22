<!--
  ============================================================================
  VISTA DE PROYECTOS (ProyectosView.vue)
  ============================================================================
  1. Apartado inicial donde aparecen los proyectos (el primero es Proyecto Clima Laboral).
  2. Permite finalizar un proyecto o visualizar la comparativa de años anteriores
     con el de este momento, solicitando la contraseña de inicio de sesión.
  3. Cuando el proyecto está finalizado, al dar clic en el botón de comparativa o
     sobre el estado finalizado solicita la contraseña de inicio de sesión y abre
     la comparativa de años anteriores con el momento actual.
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAutenticacion } from '@/Almacenes/useAutenticacion'
import { useEncuestas, type Encuesta } from '@/Almacenes/useEncuestas'
import { useHistoricoPeriodos } from '@/Almacenes/useHistoricoPeriodos'
import { useToast } from '@/Almacenes/useToast'
import { 
  Building2, 
  Share2, 
  FlaskConical, 
  Trash2, 
  CheckCircle2, 
  X, 
  Lock,
  PlusCircle, 
  BarChart3, 
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Users,
  ShieldCheck
} from 'lucide-vue-next'

import ProyectosModoClimaFijo from '@/componentes/Proyectos/ProyectosModoClimaFijo.vue'
import ModalEnlacePublicado from '@/componentes/Proyectos/ModalEnlacePublicado.vue'
import ModalCrearProyecto from '@/componentes/Proyectos/ModalCrearProyecto.vue'
import ModalHistoricoBurbuja from '@/componentes/Proyectos/ModalHistoricoBurbuja.vue'
import BannerSugerenciasAdmin from '@/componentes/AsistenteOllama/BannerSugerenciasAdmin.vue'
import GraficosAncladosVisualizador from '@/componentes/Dashboard/Graficos/GraficosAncladosVisualizador.vue'
import { adaptarRespuestasAGrafico } from '@/services/adaptadorRespuestasGraficos'
import { Eye } from 'lucide-vue-next'

const router = useRouter()
const { usuarioActual, verificarContrasenaSesion } = useAutenticacion()
const { mostrarError, mostrarExito } = useToast()
const { 
  encuestas, 
  editarEncuesta, 
  vaciarTodasLasEstadisticas, 
  finalizarYArchivarProyecto,
  respuestasAnonimas
} = useEncuestas()

const { 
  cargarHistoricoDesdeSupabase,
  cerrarYGuardarPeriodoAnual
} = useHistoricoPeriodos()

onMounted(async () => {
  await cargarHistoricoDesdeSupabase()
})

// Control de navegación dentro de Proyectos: null = Apartado Inicial, string = Proyecto activo
const idProyectoSeleccionado = ref<string | null>(null)

// Estados de modales
const modalCrearProyectoAbierto = ref(false)
const modalEnlaceAbierto = ref(false)
const modalBurbujaAbierto = ref(false)
const cargandoBorrado = ref(false)

// Modal de Contraseña de Inicio de Sesión para Finalizar Proyecto / Ver Comparativa
const modalPasswordAbierto = ref(false)
const passwordInput = ref('')
const errorPassword = ref('')
const accionPendientePassword = ref<'finalizar_y_comparar' | 'solo_comparar' | 'reabrir'>('finalizar_y_comparar')
const proyectoObjetivoPassword = ref<Encuesta | null>(null)

// Encuesta máster principal de clima laboral
const encuestaMaster = computed(() => {
  return encuestas.value.find(e => e.id === 'enc-001') || encuestas.value[0] || null
})

// Encuesta activa seleccionada
const encuestaSeleccionada = computed(() => {
  if (!idProyectoSeleccionado.value) return encuestaMaster.value
  return encuestas.value.find(e => e.id === idProyectoSeleccionado.value) || encuestaMaster.value
})

// Lista organizada de proyectos
const listaProyectosOrganizada = computed(() => {
  const master = encuestas.value.find(e => e.id === 'enc-001') || {
    id: 'enc-001',
    titulo: 'Proyecto Clima Laboral — Diagnóstico Organizacional',
    descripcion: 'Evaluación troncal de bienestar, liderazgo, respeto y desarrollo en el equipo.',
    departamento: 'Operaciones & Clima Laboral',
    creadoPor: 'Super Administrador',
    fechaCreacion: '15 Sep 2026',
    estado: 'Activa' as const,
    preguntas: []
  }
  const otros = encuestas.value.filter(e => e.id !== 'enc-001')
  return [master, ...otros]
})

const abrirPreguntasProyecto = (id: string) => {
  idProyectoSeleccionado.value = id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const volverAApartadoInicial = () => {
  idProyectoSeleccionado.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Cálculo dinámico del porcentaje de satisfacción actual de clima laboral
const satisfaccionActualCalculada = computed(() => {
  if (encuestaSeleccionada.value?.estado === 'Finalizada' && typeof encuestaSeleccionada.value.porcentajeClimaFinal === 'number') {
    return encuestaSeleccionada.value.porcentajeClimaFinal
  }
  if (!respuestasAnonimas.value || respuestasAnonimas.value.length === 0) return 0
  let suma = 0
  let count = 0
  respuestasAnonimas.value.forEach(r => {
    if (r.puntajeGeneral) {
      suma += r.puntajeGeneral
      count++
    }
  })
  if (count === 0) return 0
  const prom = suma / count
  return Math.round((prom / 5) * 100)
})

const totalRespuestasDeTarjeta = (proyecto: Encuesta) => {
  if (proyecto.estado === 'Finalizada') {
    return proyecto.respuestasArchivadas?.length ?? proyecto.totalRespuestas ?? 0
  }
  return respuestasAnonimas.value.filter(r =>
    r.idEncuesta === proyecto.id || (proyecto.id === 'enc-001' && (!r.idEncuesta || r.idEncuesta === 'enc-001'))
  ).length
}

const analisisAlmacenadoProyecto = computed(() => {
  const enc = encuestaSeleccionada.value
  if (!enc || enc.estado !== 'Finalizada') return null

  const respuestasGuardadas = enc.respuestasArchivadas || []
  const preguntas = enc.preguntas || []

  const graficasPorPregunta = preguntas.map((preg, idx) => {
    const adaptacion = adaptarRespuestasAGrafico(preg.id, preg.texto, respuestasGuardadas, preguntas)
    return {
      indice: idx + 1,
      id: preg.id,
      texto: preg.texto,
      categoria: preg.categoria || 'General',
      tipoGrafico: (idx % 2 === 0 ? 'barras' : 'pastel') as 'barras' | 'pastel',
      totalMuestras: adaptacion.totalMuestras,
      segmentos: adaptacion.segmentos
    }
  })

  return {
    totalRespuestas: respuestasGuardadas.length,
    porcentajeSatisfaccion: enc.porcentajeClimaFinal ?? 0,
    puntajePromedio: enc.puntajePromedio ?? 0,
    alertasDetectadas: enc.alertasRegistradas ?? 0,
    fechaCierre: enc.fechaFinalizacion || enc.fechaCreacion,
    anioCierre: enc.anioCierre || new Date().getFullYear(),
    graficasPorPregunta
  }
})

const solicitarPasswordParaProyecto = (
  proyecto: Encuesta | null | undefined,
  accion: 'finalizar_y_comparar' | 'solo_comparar' | 'reabrir'
) => {
  proyectoObjetivoPassword.value = proyecto || encuestaSeleccionada.value || encuestaMaster.value
  accionPendientePassword.value = accion
  passwordInput.value = ''
  errorPassword.value = ''
  modalPasswordAbierto.value = true
}

const confirmarPasswordProyecto = async () => {
  if (!passwordInput.value.trim()) {
    errorPassword.value = 'Por favor ingresa tu contraseña de inicio de sesión.'
    return
  }

  const esValida = await verificarContrasenaSesion(passwordInput.value)
  if (!esValida) {
    errorPassword.value = 'Contraseña incorrecta. Ingresa la contraseña de tu cuenta de inicio de sesión.'
    mostrarError('Contraseña Incorrecta', 'La contraseña ingresada no coincide con la de inicio de sesión.')
    return
  }

  const proy = proyectoObjetivoPassword.value
  modalPasswordAbierto.value = false
  passwordInput.value = ''
  errorPassword.value = ''

  if (accionPendientePassword.value === 'finalizar_y_comparar' && proy) {
    const archivada = await finalizarYArchivarProyecto(proy.id)
    if (archivada) {
      await cerrarYGuardarPeriodoAnual({
        idEncuesta: archivada.id,
        tituloPeriodo: archivada.titulo,
        anio: archivada.anioCierre || new Date().getFullYear(),
        fechaCierre: new Date().toISOString(),
        totalRespuestas: archivada.totalRespuestas || 0,
        alertasRegistradas: archivada.alertasRegistradas || 0,
        puntajePromedio: archivada.puntajePromedio || 0,
        porcentajeSatisfaccion: archivada.porcentajeClimaFinal || 0,
        desgloseBloques: [],
        cerradoPor: usuarioActual.value?.nombre || 'Super Administrador',
        notas: `Cierre oficial almacenado (${archivada.totalRespuestas || 0} respuestas)`
      })
      idProyectoSeleccionado.value = archivada.id
    }
    modalBurbujaAbierto.value = true
  } else if (accionPendientePassword.value === 'reabrir' && proy) {
    await editarEncuesta(proy.id, { estado: 'Activa' })
    mostrarExito('Proyecto Reabierto', 'El proyecto vuelve a estar Activo.')
  } else {
    modalBurbujaAbierto.value = true
  }
}

const manejarProyectoCreado = (nuevo: Encuesta) => {
  if (nuevo?.id) {
    idProyectoSeleccionado.value = nuevo.id
  }
}

const manejarBorrarDatos = async () => {
  if (confirm('¿Estás seguro de restablecer todas las respuestas de la base de datos a cero?')) {
    cargandoBorrado.value = true
    await vaciarTodasLasEstadisticas()
    cargandoBorrado.value = false
  }
}

const manejarGuardarMaster = async (datos: any) => {
  const idExistente = encuestaSeleccionada.value?.id || 'enc-001'
  const ok = await editarEncuesta(idExistente, {
    titulo: datos.titulo || 'Proyecto Clima Laboral',
    descripcion: datos.descripcion || 'Encuesta fija a la que se dirigen las respuestas.',
    departamento: datos.departamento || 'General',
    bloques: datos.bloques,
    preguntas: datos.preguntas,
    preguntasSeguimiento: datos.preguntasSeguimiento || []
  })
  if (ok && !datos.silencioso) {
    modalEnlaceAbierto.value = true
  }
}

const irAResponder = () => {
  if (!encuestaSeleccionada.value) return
  router.push(`/responder/${encuestaSeleccionada.value.id}?modoPrueba=true`)
}

const irAAjustesVoz = () => {
  router.push('/configuracion')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 px-3 sm:px-6 md:pl-20 md:pr-8 py-6 md:py-8 relative font-['Poppins',sans-serif] transition-colors duration-300">
    
    <!-- Luces sutiles de fondo -->
    <div class="fixed top-10 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-10 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-[1500px] mx-auto space-y-6 relative z-10 text-left">
      
      <!-- ================================================================= -->
      <!-- CASO 1: APARTADO INICIAL DE PROYECTOS                             -->
      <!-- ================================================================= -->
      <div v-if="!idProyectoSeleccionado" class="space-y-6">
        
        <!-- Encabezado Limpio de Proyectos -->
        <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 class="w-5 h-5" />
            </div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Proyectos Organizacionales
            </h1>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <!-- Botón Crear Nuevo Proyecto -->
            <button
              type="button"
              @click="modalCrearProyectoAbierto = true"
              class="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all shrink-0"
            >
              <PlusCircle class="w-4 h-4" />
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="(proyecto, idx) in listaProyectosOrganizada"
              :key="proyecto.id"
              @click="abrirPreguntasProyecto(proyecto.id)"
              :class="[
                'p-6 rounded-3xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl group relative overflow-hidden flex flex-col justify-between space-y-4',
                idx === 0
                  ? 'bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-blue-400/60 dark:border-blue-500/40 hover:border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <!-- Insignia de Estado del Proyecto -->
              <div class="flex items-center justify-between gap-2">
                <span
                  v-if="idx === 0"
                  class="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                >
                  <span>Proyecto Principal — Clima Laboral</span>
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold"
                >
                  Proyecto {{ idx + 1 }}
                </span>

                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1',
                    proyecto.estado === 'Finalizada'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="proyecto.estado === 'Finalizada' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'"></span>
                  <span>{{ proyecto.estado === 'Finalizada' ? 'Finalizado' : 'Activo' }}</span>
                </span>
              </div>

              <!-- Título y Descripción -->
              <div class="space-y-1.5">
                <h3 class="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {{ idx === 0 ? 'Proyecto Clima Laboral' : proyecto.titulo }}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {{ proyecto.descripcion || 'Encuesta de diagnóstico y evaluación organizacional.' }}
                </p>
              </div>

              <!-- Metadatos del Proyecto -->
              <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <div class="flex items-center gap-1.5">
                  <ClipboardList class="w-3.5 h-3.5 text-blue-500" />
                  <span>{{ proyecto.preguntas?.length || 30 }} preguntas</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Users class="w-3.5 h-3.5 text-emerald-500" />
                  <span>{{ totalRespuestasDeTarjeta(proyecto) }} respuestas</span>
                </div>
              </div>

              <!-- Botones de Acción en la Tarjeta de Proyecto -->
              <div class="pt-2 space-y-2">
                <div class="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 text-slate-700 dark:text-slate-300 group-hover:text-white font-bold text-xs flex items-center justify-between transition-all">
                  <span>{{ proyecto.estado === 'Finalizada' ? 'Solo Lectura — Ver Preguntas y Análisis Abajo' : 'Ver y Editar Preguntas' }}</span>
                  <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

                <div class="grid grid-cols-2 gap-2" @click.stop>
                  <!-- Botón para Finalizar Proyecto (pide contraseña de inicio de sesión) -->
                  <button
                    v-if="proyecto.estado !== 'Finalizada'"
                    type="button"
                    @click.stop="solicitarPasswordParaProyecto(proyecto, 'finalizar_y_comparar')"
                    class="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white border border-amber-500/30 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Lock class="w-3.5 h-3.5" />
                    <span>Finalizar Proyecto</span>
                  </button>
                  <button
                    v-else
                    type="button"
                    @click.stop="abrirPreguntasProyecto(proyecto.id)"
                    class="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white border border-amber-500/30 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Solo Ver Análisis</span>
                  </button>

                  <!-- Botón para Ver Comparativa de Años Anteriores con el Momento Actual -->
                  <button
                    type="button"
                    @click.stop="solicitarPasswordParaProyecto(proyecto, 'solo_comparar')"
                    class="py-2 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-500/30 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <BarChart3 class="w-3.5 h-3.5" />
                    <span>Ver Comparativa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ================================================================= -->
      <!-- CASO 2: VISTA DETALLADA DEL PROYECTO                              -->
      <!-- ================================================================= -->
      <div v-else class="space-y-4">
        
        <!-- Barra Superior Unificada -->
        <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              @click="volverAApartadoInicial"
              class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
            </button>

            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {{ idProyectoSeleccionado === 'enc-001' ? 'Proyecto Clima Laboral' : encuestaSeleccionada?.titulo }}
                </h1>
                <span class="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
                  {{ encuestaSeleccionada?.preguntas?.length || 30 }} preguntas
                </span>
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase',
                    encuestaSeleccionada?.estado === 'Finalizada'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  ]"
                >
                  {{ encuestaSeleccionada?.estado === 'Finalizada' ? 'Proyecto Finalizado' : 'Proyecto Activo' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Acciones Unificadas -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Botón Finalizar Proyecto con contraseña -->
            <button
              v-if="encuestaSeleccionada?.estado !== 'Finalizada'"
              type="button"
              @click="solicitarPasswordParaProyecto(encuestaSeleccionada, 'finalizar_y_comparar')"
              class="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer border border-amber-500/30 transition-all"
            >
              <Lock class="w-3.5 h-3.5" />
              <span>Finalizar Proyecto</span>
            </button>

            <!-- Botón Comparativa Años Anteriores vs Actual -->
            <button
              type="button"
              @click="solicitarPasswordParaProyecto(encuestaSeleccionada, 'solo_comparar')"
              class="px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer border border-indigo-500/30 transition-all"
              title="Ver comparativa de años anteriores con el momento actual"
            >
              <BarChart3 class="w-3.5 h-3.5" />
              <span>Comparativa Años Anteriores ({{ satisfaccionActualCalculada }}%)</span>
            </button>

            <button
              v-if="encuestaSeleccionada?.estado !== 'Finalizada'"
              type="button"
              @click="irAResponder"
              class="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              title="Probar encuesta"
            >
              <FlaskConical class="w-3.5 h-3.5" />
            </button>

            <button
              v-if="encuestaSeleccionada?.estado !== 'Finalizada'"
              type="button"
              @click="modalEnlaceAbierto = true"
              class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              title="Compartir enlace"
            >
              <Share2 class="w-3.5 h-3.5" />
            </button>

            <button
              v-if="encuestaSeleccionada?.estado !== 'Finalizada'"
              type="button"
              @click="manejarBorrarDatos"
              :disabled="cargandoBorrado"
              class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
              title="Restablecer respuestas a cero"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <BannerSugerenciasAdmin v-if="encuestaSeleccionada?.estado !== 'Finalizada'" />

        <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <ProyectosModoClimaFijo
            :encuestaInicial="encuestaSeleccionada"
            @guardar="manejarGuardarMaster"
            @abrirAjustesVoz="irAAjustesVoz"
          />
        </div>

        <!-- ================================================================= -->
        <!-- SECCIÓN DE ANÁLISIS ALMACENADO ABAJO DE LAS PREGUNTAS             -->
        <!-- (Solo se muestra cuando la tarjeta del proyecto está Finalizada)  -->
        <!-- ================================================================= -->
        <div
          v-if="encuestaSeleccionada?.estado === 'Finalizada' && analisisAlmacenadoProyecto"
          class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/30 shadow-lg space-y-6"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                  Proyecto Finalizado — Solo Lectura
                </span>
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Cierre: {{ analisisAlmacenadoProyecto.fechaCierre }}
                </span>
              </div>
              <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Análisis Almacenado del Periodo ({{ analisisAlmacenadoProyecto.anioCierre }})
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Resultados históricos almacenados al finalizar el proyecto. Las gráficas siguen exactamente el orden de las preguntas superiores.
              </p>
            </div>

            <!-- Tarjetas KPI del Cierre -->
            <div class="flex items-center gap-3 flex-wrap">
              <div class="px-4 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <div class="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {{ analisisAlmacenadoProyecto.porcentajeSatisfaccion }}%
                </div>
                <div class="text-[10px] font-bold uppercase text-slate-500">Clima Final</div>
              </div>
              <div class="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div class="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {{ analisisAlmacenadoProyecto.totalRespuestas }}
                </div>
                <div class="text-[10px] font-bold uppercase text-slate-500">Respuestas Guardadas</div>
              </div>
            </div>
          </div>

          <!-- Gráficos almacenados organizados según el orden de cada pregunta -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              v-for="itemGraf in analisisAlmacenadoProyecto.graficasPorPregunta"
              :key="itemGraf.id"
              class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div class="space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black font-mono">
                    Pregunta #{{ itemGraf.indice }}
                  </span>
                  <span class="text-[10px] font-mono font-bold text-slate-500">
                    {{ itemGraf.totalMuestras }} resp.
                  </span>
                </div>
                <p class="text-xs font-bold text-sky-600 dark:text-sky-400">
                  {{ itemGraf.categoria }}
                </p>
                <h4 class="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {{ itemGraf.texto }}
                </h4>
              </div>

              <GraficosAncladosVisualizador
                :tipoGrafico="itemGraf.tipoGrafico"
                :segmentos="itemGraf.segmentos"
                :totalMuestras="itemGraf.totalMuestras"
              />
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- MODAL DE CONTRASEÑA DE INICIO DE SESIÓN (PARA FINALIZAR PROYECTO O VER COMPARATIVA) -->
    <Teleport to="body">
      <div
        v-if="modalPasswordAbierto"
        class="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-['Poppins',sans-serif]"
      >
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="modalPasswordAbierto = false" />

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
                  {{ accionPendientePassword === 'finalizar_y_comparar' ? 'Confirma tu contraseña para finalizar el proyecto y ver la comparativa' : 'Confirma tu contraseña de inicio de sesión para visualizar la comparativa' }}
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="modalPasswordAbierto = false"
              class="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="confirmarPasswordProyecto" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Contraseña de Inicio de Sesión ({{ usuarioActual?.email || 'Administrador' }})
              </label>
              <input
                v-model="passwordInput"
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
                @click="modalPasswordAbierto = false"
                class="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Lock class="w-3.5 h-3.5" />
                <span>Confirmar y Continuar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modales de Proyectos -->
    <ModalEnlacePublicado
      :abierto="modalEnlaceAbierto"
      :encuestaId="encuestaSeleccionada?.id || 'enc-001'"
      @cerrar="modalEnlaceAbierto = false"
      @irAResponder="irAResponder"
    />

    <ModalCrearProyecto
      :abierto="modalCrearProyectoAbierto"
      @cerrar="modalCrearProyectoAbierto = false"
      @proyectoCreado="manejarProyectoCreado"
    />

    <!-- MODAL COMPARATIVA DE AÑOS ANTERIORES CON EL MOMENTO ACTUAL -->
    <ModalHistoricoBurbuja
      :abierto="modalBurbujaAbierto"
      :porcentajeClimaActual="satisfaccionActualCalculada"
      :totalRespuestas="respuestasAnonimas.length"
      @cerrar="modalBurbujaAbierto = false"
    />

  </div>
</template>
