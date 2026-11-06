<!--
  ============================================================================
  VISTA DE PROYECTOS ORGANIZACIONALES (ProyectosView.vue)
  ============================================================================
  Orquesta el listado de proyectos, el editor de preguntas, la ventana de
  reversión de 3 días hábiles y la comparativa histórica anual.
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
  Lock,
  PlusCircle,
  BarChart3,
  ArrowLeft,
  RotateCcw,
  Clock
} from 'lucide-vue-next'

import ProyectosModoClimaFijo from '@/componentes/Proyectos/ProyectosModoClimaFijo.vue'
import ModalEnlacePublicado from '@/componentes/Proyectos/ModalEnlacePublicado.vue'
import ModalCrearProyecto from '@/componentes/Proyectos/ModalCrearProyecto.vue'
import ModalHistoricoBurbuja from '@/componentes/Proyectos/ModalHistoricoBurbuja.vue'
import BannerSugerenciasAdmin from '@/componentes/AsistenteOllama/BannerSugerenciasAdmin.vue'
import TarjetaProyectoItem from '@/componentes/Proyectos/TarjetaProyectoItem.vue'
import SeccionAnalisisAlmacenado, { type DatosAnalisisAlmacenado } from '@/componentes/Proyectos/SeccionAnalisisAlmacenado.vue'
import ModalVerificarPasswordProyecto from '@/componentes/Proyectos/ModalVerificarPasswordProyecto.vue'
import { adaptarRespuestasAGrafico } from '@/services/adaptadorRespuestasGraficos'
import { obtenerDetalleReversion } from '@/services/diasHabilesService'
import { calcularClimaGlobalDeRespuestas } from '@/services/calculadorClimaService'

const router = useRouter()
const { usuarioActual, verificarContrasenaSesion } = useAutenticacion()
const { mostrarError } = useToast()
const {
  encuestas,
  editarEncuesta,
  vaciarTodasLasEstadisticas,
  finalizarYArchivarProyecto,
  revertirFinalizacionProyecto,
  respuestasAnonimas
} = useEncuestas()
const { cargarHistoricoDesdeSupabase, cerrarYGuardarPeriodoAnual, revertirCierrePeriodo } = useHistoricoPeriodos()

onMounted(async () => {
  await cargarHistoricoDesdeSupabase()
})

const idProyectoSeleccionado = ref<string | null>(null)
const modalCrearProyectoAbierto = ref(false)
const modalEnlaceAbierto = ref(false)
const modalBurbujaAbierto = ref(false)
const cargandoBorrado = ref(false)

const modalPasswordAbierto = ref(false)
const errorPassword = ref('')
const accionPendientePassword = ref<'finalizar_y_comparar' | 'solo_comparar' | 'reabrir'>('finalizar_y_comparar')
const proyectoObjetivoPassword = ref<Encuesta | null>(null)

const encuestaMaster = computed(() => encuestas.value.find(e => e.id === 'enc-001') || encuestas.value[0] || null)
const encuestaSeleccionada = computed(() =>
  !idProyectoSeleccionado.value ? encuestaMaster.value : encuestas.value.find(e => e.id === idProyectoSeleccionado.value) || encuestaMaster.value
)

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
  return [master, ...encuestas.value.filter(e => e.id !== 'enc-001')]
})

const abrirPreguntasProyecto = (id: string) => {
  idProyectoSeleccionado.value = id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const satisfaccionActualCalculada = computed(() => {
  const enc = encuestaSeleccionada.value
  if (enc?.estado === 'Finalizada') {
    if (Array.isArray(enc.respuestasArchivadas) && enc.respuestasArchivadas.length > 0) {
      return calcularClimaGlobalDeRespuestas(enc.respuestasArchivadas).porcentajeClima
    }
    if (typeof enc.porcentajeClimaFinal === 'number') return enc.porcentajeClimaFinal
  }
  const idTarget = enc?.id || 'enc-001'
  const resps = respuestasAnonimas.value.filter(r => r.idEncuesta === idTarget || (idTarget === 'enc-001' && (!r.idEncuesta || r.idEncuesta === 'enc-001')))
  return calcularClimaGlobalDeRespuestas(resps).porcentajeClima
})

const totalRespuestasDeTarjeta = (proyecto: Encuesta) => {
  if (proyecto.estado === 'Finalizada') return proyecto.respuestasArchivadas?.length ?? proyecto.totalRespuestas ?? 0
  return respuestasAnonimas.value.filter(r => r.idEncuesta === proyecto.id || (proyecto.id === 'enc-001' && (!r.idEncuesta || r.idEncuesta === 'enc-001'))).length
}

const analisisAlmacenadoProyecto = computed<DatosAnalisisAlmacenado | null>(() => {
  const enc = encuestaSeleccionada.value
  if (!enc || enc.estado !== 'Finalizada') return null
  const respuestasGuardadas = enc.respuestasArchivadas || []
  const preguntas = enc.preguntas || []
  return {
    totalRespuestas: respuestasGuardadas.length,
    porcentajeSatisfaccion: enc.porcentajeClimaFinal ?? 0,
    puntajePromedio: enc.puntajePromedio ?? 0,
    alertasDetectadas: enc.alertasRegistradas ?? 0,
    fechaCierre: enc.fechaFinalizacion || enc.fechaCreacion,
    anioCierre: enc.anioCierre || new Date().getFullYear(),
    graficasPorPregunta: preguntas.map((preg, idx) => {
      const adaptacion = adaptarRespuestasAGrafico(preg.id, preg.texto, respuestasGuardadas, preguntas)
      return {
        indice: idx + 1,
        id: preg.id,
        texto: preg.texto,
        categoria: preg.categoria || 'General',
        tipoGrafico: (preg.tipoGrafico || (idx % 2 === 0 ? 'barras' : 'pastel')) as 'barras' | 'pastel',
        totalMuestras: adaptacion.totalMuestras,
        segmentos: adaptacion.segmentos
      }
    })
  }
})

const detalleReversion = (proyecto?: Encuesta | null) =>
  !proyecto ? obtenerDetalleReversion(null, null) : obtenerDetalleReversion(proyecto.fechaFinalizacionISO, proyecto.limiteReversionISO)

const solicitarPasswordParaProyecto = (proyecto: Encuesta | null | undefined, accion: 'finalizar_y_comparar' | 'solo_comparar' | 'reabrir') => {
  proyectoObjetivoPassword.value = proyecto || encuestaSeleccionada.value || encuestaMaster.value
  accionPendientePassword.value = accion
  errorPassword.value = ''
  modalPasswordAbierto.value = true
}

const confirmarPasswordProyecto = async (passwordIngresada: string) => {
  if (!passwordIngresada.trim()) {
    errorPassword.value = 'Por favor ingresa tu contraseña de inicio de sesión.'
    return
  }
  const esValida = await verificarContrasenaSesion(passwordIngresada)
  if (!esValida) {
    errorPassword.value = 'Contraseña incorrecta. Ingresa la contraseña de tu cuenta de inicio de sesión.'
    mostrarError('Contraseña Incorrecta', 'La contraseña ingresada no coincide con la de inicio de sesión.')
    return
  }

  const proy = proyectoObjetivoPassword.value
  modalPasswordAbierto.value = false
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
    const ok = await revertirFinalizacionProyecto(proy.id)
    if (ok) {
      revertirCierrePeriodo(proy.id)
      idProyectoSeleccionado.value = proy.idProyectoOrigen || proy.id
    }
  } else {
    modalBurbujaAbierto.value = true
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
  if (ok && !datos.silencioso) modalEnlaceAbierto.value = true
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 px-3 sm:px-6 md:pl-20 md:pr-8 py-6 md:py-8 relative font-['Poppins',sans-serif] transition-colors duration-300">
    <div class="fixed top-10 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
    <div class="fixed bottom-10 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

    <div class="max-w-[1500px] mx-auto space-y-6 relative z-10 text-left">
      <div v-if="!idProyectoSeleccionado" class="space-y-6">
        <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 class="w-5 h-5" />
            </div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Proyectos Organizacionales</h1>
          </div>
          <button
            type="button"
            @click="modalCrearProyectoAbierto = true"
            class="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all shrink-0"
          >
            <PlusCircle class="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <TarjetaProyectoItem
            v-for="(proyecto, idx) in listaProyectosOrganizada"
            :key="proyecto.id"
            :proyecto="proyecto"
            :indice="idx"
            :totalRespuestas="totalRespuestasDeTarjeta(proyecto)"
            :esRevertible="detalleReversion(proyecto).esRevertible"
            :tiempoRestanteTexto="detalleReversion(proyecto).tiempoRestanteTexto"
            @abrir="abrirPreguntasProyecto"
            @solicitarPassword="solicitarPasswordParaProyecto"
          />
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              @click="idProyectoSeleccionado = null"
              class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
            </button>
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
                {{ encuestaSeleccionada?.estado === 'Finalizada' ? (detalleReversion(encuestaSeleccionada).esRevertible ? `Finalizado · ${detalleReversion(encuestaSeleccionada).tiempoRestanteTexto}` : 'Proyecto Finalizado') : 'Proyecto Activo' }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button
              v-if="encuestaSeleccionada?.estado === 'Finalizada' && detalleReversion(encuestaSeleccionada).esRevertible"
              type="button"
              @click="solicitarPasswordParaProyecto(encuestaSeleccionada, 'reabrir')"
              class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Revertir Finalización</span>
            </button>
            <button
              v-if="encuestaSeleccionada?.estado !== 'Finalizada'"
              type="button"
              @click="solicitarPasswordParaProyecto(encuestaSeleccionada, 'finalizar_y_comparar')"
              class="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer border border-amber-500/30 transition-all"
            >
              <Lock class="w-3.5 h-3.5" />
              <span>Finalizar Proyecto</span>
            </button>
            <button
              type="button"
              @click="solicitarPasswordParaProyecto(encuestaSeleccionada, 'solo_comparar')"
              class="px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer border border-indigo-500/30 transition-all"
            >
              <BarChart3 class="w-3.5 h-3.5" />
              <span>Comparativa Años Anteriores ({{ satisfaccionActualCalculada }}%)</span>
            </button>
            <button
              v-if="encuestaSeleccionada?.estado !== 'Finalizada'"
              type="button"
              @click="encuestaSeleccionada && router.push(`/responder/${encuestaSeleccionada.id}?modoPrueba=true`)"
              class="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Probar encuesta"
            >
              <FlaskConical class="w-3.5 h-3.5" />
            </button>
            <button
              v-if="encuestaSeleccionada?.estado !== 'Finalizada'"
              type="button"
              @click="modalEnlaceAbierto = true"
              class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Compartir enlace"
            >
              <Share2 class="w-3.5 h-3.5" />
            </button>
            <button
              v-if="encuestaSeleccionada?.estado !== 'Finalizada'"
              type="button"
              @click="manejarBorrarDatos"
              :disabled="cargandoBorrado"
              class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Restablecer respuestas a cero"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          v-if="encuestaSeleccionada?.estado === 'Finalizada' && detalleReversion(encuestaSeleccionada).esRevertible"
          class="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/40 dark:border-amber-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
        >
          <div class="flex items-start gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock class="w-6 h-6 animate-pulse" />
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  Ventana de Reversión Activa (3 Días Hábiles)
                </span>
                <span class="text-xs font-black text-amber-700 dark:text-amber-300">
                  {{ detalleReversion(encuestaSeleccionada).tiempoRestanteTexto }}
                </span>
              </div>
              <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Finalizado el <strong>{{ detalleReversion(encuestaSeleccionada).fechaFinalizacionFormateada }}</strong>. Plazo límite: <strong>{{ detalleReversion(encuestaSeleccionada).fechaLimiteFormateada }}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="solicitarPasswordParaProyecto(encuestaSeleccionada, 'reabrir')"
            class="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0"
          >
            <RotateCcw class="w-4 h-4" />
            <span>Revertir Finalización y Volver al Proyecto</span>
          </button>
        </div>

        <BannerSugerenciasAdmin v-if="encuestaSeleccionada?.estado !== 'Finalizada'" />

        <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <ProyectosModoClimaFijo
            :encuestaInicial="encuestaSeleccionada"
            @guardar="manejarGuardarMaster"
            @abrirAjustesVoz="router.push('/configuracion')"
          />
        </div>

        <SeccionAnalisisAlmacenado
          v-if="encuestaSeleccionada?.estado === 'Finalizada' && analisisAlmacenadoProyecto"
          :analisis="analisisAlmacenadoProyecto"
        />
      </div>
    </div>

    <ModalVerificarPasswordProyecto
      :abierto="modalPasswordAbierto"
      :emailUsuario="usuarioActual?.email || 'Administrador'"
      :accionPendiente="accionPendientePassword"
      :errorPassword="errorPassword"
      @cerrar="modalPasswordAbierto = false"
      @confirmar="confirmarPasswordProyecto"
    />

    <ModalEnlacePublicado
      :abierto="modalEnlaceAbierto"
      :encuestaId="encuestaSeleccionada?.id || 'enc-001'"
      @cerrar="modalEnlaceAbierto = false"
      @irAResponder="encuestaSeleccionada && router.push(`/responder/${encuestaSeleccionada.id}?modoPrueba=true`)"
    />

    <ModalCrearProyecto
      :abierto="modalCrearProyectoAbierto"
      @cerrar="modalCrearProyectoAbierto = false"
      @proyectoCreado="idProyectoSeleccionado = null"
    />

    <ModalHistoricoBurbuja
      :abierto="modalBurbujaAbierto"
      :porcentajeClimaActual="satisfaccionActualCalculada"
      :totalRespuestas="respuestasAnonimas.length"
      @cerrar="modalBurbujaAbierto = false"
    />
  </div>
</template>
