<!--
  ============================================================================
  MODALIDAD 1: EDITOR DE ENCUESTA TRONCAL DE CLIMA LABORAL (ProyectosModoClimaFijo.vue)
  ============================================================================
  Encuesta Oficial Contigo Call Center:
    • Estructura dividida visualmente en 8 Bloques Oficiales.
    • Tarjetas de pregunta con Mini-Estadísticas de respuestas individuales.
    • Control de acceso por Roles (Super Admin / Admin General / Admin pueden editar).
    • Integración con subcomponentes modulares de cabecera y editor.
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  Plus,
  Users,
  Heart,
  Handshake,
  Star,
  TrendingUp,
  GraduationCap,
  Telescope,
  MessageSquareText,
  HelpCircle,
  X
} from 'lucide-vue-next'
import type { PreguntaEncuesta, AccionJarvis } from '@/Servicios/iaEncuestasService'
import { obtenerEscalaEstandarDetallada } from '@/Servicios/iaEncuestasService'
import {
  PLANTILLA_CLIMA_INTEGRAL_DETALLADA,
  TITULO_ENCUESTA_CLIMA_INTEGRAL,
  DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL,
  BLOQUES_ENCUESTA_CLIMA
} from '@/Config/preguntasCuestionario'
import { useAuth } from '@/Almacenes/useAuth'
import { useAsistenteVoz, registrarContextoEncuesta, desregistrarContextoEncuesta } from '@/Almacenes/useAsistenteVoz'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useGraficosAnclados } from '@/Almacenes/useGraficosAnclados'
import { useToast } from '@/Almacenes/useToast'
import ModalEditorPregunta from '@/componentes/Proyectos/ModalEditorPregunta.vue'
import TarjetaPreguntaClima from '@/componentes/Proyectos/TarjetaPreguntaClima.vue'
import PerfilAjustesVozAsistente from '@/componentes/Configuracion/PerfilAjustesVozAsistente.vue'
import ProyectosClimaHeaderFiltros from './EditorSubcomponentes/ProyectosClimaHeaderFiltros.vue'

const props = defineProps<{
  encuestaInicial?: any
}>()

const emit = defineEmits<{
  (e: 'guardar', datos: any): void
  (e: 'volver'): void
  (e: 'abrirAjustesVoz'): void
}>()

const { usuarioActual, permisosUsuario } = useAuth()
const { analizarYGenerarSugerencia, ajustes } = useAsistenteVoz()
const { editarEncuesta } = useEncuestas()
const { generarEnlazarGraficosPredeterminadosIA, autoAnclarEstadisticaParaNuevaPregunta } = useGraficosAnclados()
const { mostrarExito } = useToast()

const autoEnlazarEstadisticasConIA = () => {
  const creados = generarEnlazarGraficosPredeterminadosIA(preguntas.value, props.encuestaInicial?.id || 'enc-001')
  if (creados > 0) {
    mostrarExito('IA Auto-Enlace Completado', `Se generaron automáticamente ${creados} estadísticas predeterminadas para tus preguntas. Puedes revisarlas y editarlas libremente en el Dashboard.`)
  } else {
    mostrarExito('Estadísticas al Día', 'Ya tienes creadas las estadísticas recomendadas por IA para estas preguntas o se alcanzó el límite de 1 gráfico por tipo.')
  }
}

const modalAjustesVozAbierto = ref(false)

const puedeEditar = computed(() => {
  if (!usuarioActual.value) return true
  return permisosUsuario.value?.editarEncuestaClima ?? true
})

const titulo = ref(props.encuestaInicial?.titulo || TITULO_ENCUESTA_CLIMA_INTEGRAL)
const descripcion = ref(props.encuestaInicial?.descripcion || DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL)
const departamento = ref(props.encuestaInicial?.departamento || 'General')
const preguntaDestacadaId = ref<string | null>(null)

const preguntas = ref<PreguntaEncuesta[]>(
  props.encuestaInicial?.preguntas && props.encuestaInicial.preguntas.length > 0
    ? JSON.parse(JSON.stringify(props.encuestaInicial.preguntas))
    : JSON.parse(JSON.stringify(PLANTILLA_CLIMA_INTEGRAL_DETALLADA))
)

onMounted(() => {
  registrarContextoEncuesta(preguntas.value, aplicarAccionesJarvis, agregarPreguntaSugerida)
  setTimeout(() => {
    analizarYGenerarSugerencia(preguntas.value, false)
  }, 600)
})

onUnmounted(() => {
  desregistrarContextoEncuesta()
})

watch(
  preguntas,
  (nuevas) => {
    registrarContextoEncuesta(nuevas, aplicarAccionesJarvis, agregarPreguntaSugerida)
  },
  { deep: true }
)

const preguntasPorBloque = computed(() => {
  return BLOQUES_ENCUESTA_CLIMA.map(bloque => {
    const prefijo = `Bloque ${bloque.numero}:`
    const preguntasBloque = preguntas.value.filter(p => 
      p.categoria?.startsWith(prefijo) || 
      p.categoria?.toLowerCase().includes(bloque.titulo.toLowerCase())
    )
    return { bloque, preguntas: preguntasBloque }
  })
})

const preguntasOtras = computed(() => {
  return preguntas.value.filter(p => {
    return !BLOQUES_ENCUESTA_CLIMA.some(b => 
      p.categoria?.startsWith(`Bloque ${b.numero}:`) ||
      p.categoria?.toLowerCase().includes(b.titulo.toLowerCase())
    )
  })
})

const iconosBloque: Record<string, any> = {
  Users, Heart, Handshake, Star, TrendingUp, GraduationCap, Telescope, MessageSquareText
}

const modalAbierto = ref(false)
const preguntaEditando = ref<PreguntaEncuesta | null>(null)
const idxEditando = ref<number>(-1)

const abrirEditorPorId = (idPregunta: string) => {
  if (!puedeEditar.value) return
  const idx = preguntas.value.findIndex(p => p?.id === idPregunta)
  if (idx !== -1) {
    idxEditando.value = idx
    preguntaEditando.value = JSON.parse(JSON.stringify(preguntas.value[idx]))
    modalAbierto.value = true
  }
}

const guardarEdicionPregunta = (preguntaEditada: PreguntaEncuesta) => {
  if (idxEditando.value >= 0 && idxEditando.value < preguntas.value.length && preguntas.value[idxEditando.value]) {
    preguntas.value[idxEditando.value] = preguntaEditada
    analizarYGenerarSugerencia(preguntas.value, false)
  }
  cerrarModal()
}

const cerrarModal = () => {
  modalAbierto.value = false
  preguntaEditando.value = null
  idxEditando.value = -1
}

const restaurarPlantillaOficial = () => {
  if (!puedeEditar.value) return
  if (confirm('¿Deseas restaurar la plantilla oficial de Contigo Call Center con sus preguntas atómicas estructuradas en 8 bloques?')) {
    titulo.value = TITULO_ENCUESTA_CLIMA_INTEGRAL
    descripcion.value = DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL
    preguntas.value = JSON.parse(JSON.stringify(PLANTILLA_CLIMA_INTEGRAL_DETALLADA))
    analizarYGenerarSugerencia(preguntas.value, false)
  }
}

// ─── Lógica de Arrastrar y Soltar (Drag & Drop Reordering) ───────────────────
const arrastrandoIdx = ref<number | null>(null)
const sobrevolandoIdx = ref<number | null>(null)

const alIniciarArrastre = (e: DragEvent, idx: number) => {
  if (!puedeEditar.value) return
  arrastrandoIdx.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }
}

const alSobrevolarArrastre = (e: DragEvent, idx: number) => {
  if (!puedeEditar.value) return
  e.preventDefault()
  sobrevolandoIdx.value = idx
}

const alSoltarArrastre = (e: DragEvent, targetIdx: number) => {
  if (!puedeEditar.value) return
  e.preventDefault()
  const fromIdx = arrastrandoIdx.value
  if (fromIdx === null || fromIdx === targetIdx) {
    limpiarArrastre()
    return
  }

  const item = preguntas.value[fromIdx]
  if (item) {
    preguntas.value.splice(fromIdx, 1)
    const pregTarget = preguntas.value[targetIdx < fromIdx ? targetIdx : targetIdx - 1] || preguntas.value[targetIdx]
    if (pregTarget?.categoria) {
      item.categoria = pregTarget.categoria
    }
    preguntas.value.splice(targetIdx, 0, item)
    destacarPregunta(item.id)
    mostrarExito('Pregunta Reordenada', `Pregunta movida al orden #${targetIdx + 1}`)
    analizarYGenerarSugerencia(preguntas.value, false)
  }
  limpiarArrastre()
}

const alSoltarEnEncabezadoBloque = (e: DragEvent, bloqueNumero: number) => {
  if (!puedeEditar.value) return
  e.preventDefault()
  const fromIdx = arrastrandoIdx.value
  if (fromIdx === null) return

  const item = preguntas.value[fromIdx]
  if (item) {
    const meta = BLOQUES_ENCUESTA_CLIMA.find(b => b.numero === bloqueNumero)
    if (meta) {
      item.categoria = `Bloque ${meta.numero}: ${meta.titulo}`
    }
    preguntas.value.splice(fromIdx, 1)

    // Buscar la última posición de ese bloque
    const prefijo = `Bloque ${bloqueNumero}:`
    let lastIdx = -1
    for (let i = preguntas.value.length - 1; i >= 0; i--) {
      const p = preguntas.value[i]
      if (p && (p.categoria?.startsWith(prefijo) || (meta && p.categoria?.toLowerCase().includes(meta.titulo.toLowerCase())))) {
        lastIdx = i
        break
      }
    }
    const insertIdx = lastIdx !== -1 ? lastIdx + 1 : preguntas.value.length
    preguntas.value.splice(insertIdx, 0, item)
    destacarPregunta(item.id)
    mostrarExito('Bloque Actualizado', `Pregunta movida al Bloque ${bloqueNumero} (Orden #${insertIdx + 1})`)
    analizarYGenerarSugerencia(preguntas.value, false)
  }
  limpiarArrastre()
}

const limpiarArrastre = () => {
  arrastrandoIdx.value = null
  sobrevolandoIdx.value = null
}

const agregarPreguntaEnBloque = (bloqueNumero: number) => {
  if (!puedeEditar.value) return
  const meta = BLOQUES_ENCUESTA_CLIMA.find(b => b.numero === bloqueNumero)
  const cat = meta ? `Bloque ${meta.numero}: ${meta.titulo}` : 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto'
  
  const nuevaPregunta: PreguntaEncuesta = {
    id: `b${bloqueNumero}-p-usr-${Date.now()}`,
    categoria: cat,
    texto: `Nueva pregunta para ${meta?.titulo || 'este bloque'}...`,
    tipo: 'multiple',
    opciones: [
      { id: `opc-1-${Date.now()}`, texto: 'Sí', valor: 5, esAlerta: false },
      { id: `opc-2-${Date.now()}`, texto: 'Algunas veces', valor: 3, esAlerta: false },
      { id: `opc-3-${Date.now()}`, texto: 'No', valor: 1, esAlerta: true }
    ]
  }

  // Insertar consecutivamente al final de este bloque
  const prefijo = `Bloque ${bloqueNumero}:`
  let ultimoIndiceEnBloque = -1
  for (let i = preguntas.value.length - 1; i >= 0; i--) {
    const p = preguntas.value[i]
    if (p && (p.categoria?.startsWith(prefijo) || (meta && p.categoria?.toLowerCase().includes(meta.titulo.toLowerCase())))) {
      ultimoIndiceEnBloque = i
      break
    }
  }

  if (ultimoIndiceEnBloque !== -1) {
    preguntas.value.splice(ultimoIndiceEnBloque + 1, 0, nuevaPregunta)
  } else {
    preguntas.value.push(nuevaPregunta)
  }

  destacarPregunta(nuevaPregunta.id)
  
  // Auto-crear la estadística/gráfico anclado inmediatamente para esta nueva pregunta
  autoAnclarEstadisticaParaNuevaPregunta(nuevaPregunta, props.encuestaInicial?.id || 'enc-001')

  mostrarExito(
    'Pregunta y Estadística Creadas',
    `Se agregó la pregunta y se vinculó automáticamente su estadística en el Dashboard. Puedes cambiar su tipo de gráfico o colores cuando quieras.`
  )
  analizarYGenerarSugerencia(preguntas.value, false)
}

const destacarPregunta = (idPregunta: string) => {
  preguntaDestacadaId.value = idPregunta
  nextTick(() => {
    const el = document.getElementById(`pregunta-${idPregunta}`) || document.getElementById(idPregunta)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
  setTimeout(() => {
    if (preguntaDestacadaId.value === idPregunta) preguntaDestacadaId.value = null
  }, 6000)
}

const aplicarAccionesJarvis = (acciones: AccionJarvis[]) => {
  if (!puedeEditar.value) return
  const nombreAsis = ajustes.value?.nombreAsistente || 'Daniel'
  acciones.forEach(accion => {
    if (accion.tipo === 'CREAR_PREGUNTA') {
      const nueva: PreguntaEncuesta = accion.preguntaCompleta || {
        id: accion.idPregunta || `p-asis-${Date.now()}`,
        categoria: accion.categoria || 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
        texto: accion.textoPregunta || 'Nueva métrica de clima laboral',
        tipo: accion.tipoPregunta || 'escala',
        opciones: accion.opciones || obtenerEscalaEstandarDetallada('satisfaccion')
      }
      preguntas.value.push(nueva)
      destacarPregunta(nueva.id)
      autoAnclarEstadisticaParaNuevaPregunta(nueva, props.encuestaInicial?.id || 'enc-001')
      mostrarExito(`🤖 ${nombreAsis}`, `Pregunta creada en "${nueva.categoria}" con estadística auto-generada`)
    }
  })
  analizarYGenerarSugerencia(preguntas.value, false)
}

const agregarPreguntaSugerida = (pregunta: PreguntaEncuesta) => {
  if (!puedeEditar.value) return
  const copia = JSON.parse(JSON.stringify(pregunta))
  preguntas.value.push(copia)
  autoAnclarEstadisticaParaNuevaPregunta(copia, props.encuestaInicial?.id || 'enc-001')
  mostrarExito('Pregunta Creada', 'Se agregó la pregunta sugerida y su estadística correspondiente.')
  analizarYGenerarSugerencia(preguntas.value, false)
}

const eliminarPreguntaPorId = (idPregunta: string) => {
  if (!puedeEditar.value) return
  const idx = preguntas.value.findIndex(p => p.id === idPregunta)
  if (idx !== -1) {
    preguntas.value.splice(idx, 1)
    analizarYGenerarSugerencia(preguntas.value, false)
  }
}

const guardarEncuesta = () => {
  if (!puedeEditar.value) return
  emit('guardar', {
    titulo: titulo.value,
    descripcion: descripcion.value,
    departamento: departamento.value,
    preguntas: preguntas.value,
    preguntasSeguimiento: [{ id: `seg-${Date.now()}`, categoria: 'Propuestas', texto: '¿Recomendaciones adicionales?', tipo: 'texto', opciones: [] }]
  })
}
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto text-left font-['Poppins',sans-serif] pb-24">
    <!-- Subcomponente Encabezado, Datos y Acciones -->
    <ProyectosClimaHeaderFiltros
      v-model:titulo="titulo"
      v-model:descripcion="descripcion"
      v-model:departamento="departamento"
      :totalPreguntas="preguntas.length"
      :puedeEditar="puedeEditar"
      :rolUsuario="usuarioActual?.rol"
      @volver="emit('volver')"
      @guardar="guardarEncuesta"
      @restaurar="restaurarPlantillaOficial"
      @autoEnlazarIA="autoEnlazarEstadisticasConIA"
    />

    <!-- Lista de Preguntas separadas por Bloques Oficiales -->
    <div class="space-y-8">
      <section v-for="itemBloque in preguntasPorBloque" :key="itemBloque.bloque.id" class="space-y-3">
        <div
          @dragover.prevent
          @drop="alSoltarEnEncabezadoBloque($event, itemBloque.bloque.numero)"
          :class="['p-4 sm:p-5 rounded-3xl bg-gradient-to-r text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3', itemBloque.bloque.colorClase]"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <component :is="iconosBloque[itemBloque.bloque.icono] || Users" class="w-5 h-5 text-white" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/20 font-bold">
                  Bloque {{ itemBloque.bloque.numero }}
                </span>
                <h3 class="text-sm sm:text-base font-black tracking-tight">{{ itemBloque.bloque.titulo }}</h3>
              </div>
              <p class="text-[11px] text-white/80 mt-0.5">{{ itemBloque.bloque.descripcion }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-auto">
            <span class="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/20 font-bold">{{ itemBloque.preguntas.length }} preguntas</span>
            <button v-if="puedeEditar" type="button" @click="agregarPreguntaEnBloque(itemBloque.bloque.numero)" class="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer">
              <Plus class="w-3.5 h-3.5" /> <span>Añadir</span>
            </button>
          </div>
        </div>

        <div v-if="itemBloque.preguntas.length > 0" class="space-y-3 pl-1 sm:pl-2">
          <div v-for="preg in itemBloque.preguntas" :key="preg.id" :class="['rounded-3xl transition-all duration-700', preguntaDestacadaId === preg.id ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/40 animate-pulse scale-[1.01]' : '']">
            <TarjetaPreguntaClima
              :pregunta="preg"
              :indice="preguntas.findIndex(p => p.id === preg.id)"
              :puedeEditar="puedeEditar"
              :idEncuesta="props.encuestaInicial?.id || 'enc-001'"
              :esArrastrando="arrastrandoIdx === preguntas.findIndex(p => p.id === preg.id)"
              :esSobrevolando="sobrevolandoIdx === preguntas.findIndex(p => p.id === preg.id)"
              @dragstart="alIniciarArrastre($event, preguntas.findIndex(p => p.id === preg.id))"
              @dragover="alSobrevolarArrastre($event, preguntas.findIndex(p => p.id === preg.id))"
              @drop="alSoltarArrastre($event, preguntas.findIndex(p => p.id === preg.id))"
              @dragend="limpiarArrastre"
              @abrirEditor="abrirEditorPorId(preg.id)"
              @eliminar="eliminarPreguntaPorId(preg.id)"
            />
          </div>
        </div>
      </section>

      <!-- Bloque Oportuno para Preguntas Adicionales -->
      <section v-if="preguntasOtras.length > 0" class="space-y-3">
        <div class="p-4 rounded-3xl bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md flex items-center justify-between">
          <div class="flex items-center gap-2">
            <HelpCircle class="w-5 h-5 text-white/80" />
            <h3 class="text-sm font-black">Otras Preguntas Personalizadas</h3>
          </div>
          <span class="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/20 font-bold">{{ preguntasOtras.length }} preguntas</span>
        </div>
        <div class="space-y-3 pl-1 sm:pl-2">
          <div v-for="preg in preguntasOtras" :key="preg.id" :class="['rounded-3xl transition-all duration-700', preguntaDestacadaId === preg.id ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/40 animate-pulse scale-[1.01]' : '']">
            <TarjetaPreguntaClima
              :pregunta="preg"
              :indice="preguntas.findIndex(p => p.id === preg.id)"
              :puedeEditar="puedeEditar"
              :idEncuesta="props.encuestaInicial?.id || 'enc-001'"
              :esArrastrando="arrastrandoIdx === preguntas.findIndex(p => p.id === preg.id)"
              :esSobrevolando="sobrevolandoIdx === preguntas.findIndex(p => p.id === preg.id)"
              @dragstart="alIniciarArrastre($event, preguntas.findIndex(p => p.id === preg.id))"
              @dragover="alSobrevolarArrastre($event, preguntas.findIndex(p => p.id === preg.id))"
              @drop="alSoltarArrastre($event, preguntas.findIndex(p => p.id === preg.id))"
              @dragend="limpiarArrastre"
              @abrirEditor="abrirEditorPorId(preg.id)"
              @eliminar="eliminarPreguntaPorId(preg.id)"
            />
          </div>
        </div>
      </section>
    </div>

    <!-- Modal Editor Avanzado de Pregunta -->
    <ModalEditorPregunta
      :abierto="modalAbierto"
      :pregunta="preguntaEditando"
      :todasLasPreguntas="preguntas"
      @guardar="guardarEdicionPregunta"
      @cerrar="cerrarModal"
    />

    <!-- Modal Ajustes de Voz -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modalAjustesVozAbierto" class="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" @click.self="modalAjustesVozAbierto = false">
        <div class="relative w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <button type="button" @click="modalAjustesVozAbierto = false" class="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer">
            <X class="w-4 h-4" />
          </button>
          <PerfilAjustesVozAsistente />
        </div>
      </div>
    </Transition>
  </div>
</template>