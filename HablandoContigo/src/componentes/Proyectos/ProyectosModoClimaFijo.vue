<!--
  ============================================================================
  MODALIDAD 1: EDITOR DE ENCUESTA TRONCAL DE CLIMA LABORAL (ProyectosModoClimaFijo.vue)
  ============================================================================
  Encuesta Oficial Contigo Call Center:
    • Estructura dividida visualmente en 8 Bloques Oficiales.
    • Tarjetas de pregunta con Mini-Estadísticas de respuestas individuales.
    • Control de acceso por Roles (Super Admin / Admin General / Admin pueden editar; Supervisor / Analista RRHH en solo lectura).
    • Asistente de voz flotante arrastrable (Drag & Drop) y modal de edición avanzada con doble clic.
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  Save,
  ArrowLeft,
  Plus,
  RotateCcw,
  MousePointerClick,
  Lock,
  Sparkles,
  ShieldCheck,
  Users,
  Heart,
  Handshake,
  Star,
  TrendingUp,
  GraduationCap,
  Telescope,
  MessageSquareText,
  HelpCircle,
  Settings,
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
import { PERMISOS_POR_ROL } from '@/Almacenes/useCuentas'
import { useAsistenteVoz, registrarContextoEncuesta, desregistrarContextoEncuesta } from '@/Almacenes/useAsistenteVoz'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useToast } from '@/Almacenes/useToast'
import ModalEditorPregunta from '@/componentes/Proyectos/ModalEditorPregunta.vue'
import TarjetaPreguntaClima from '@/componentes/Proyectos/TarjetaPreguntaClima.vue'
import PerfilAjustesVozAsistente from '@/componentes/Configuracion/PerfilAjustesVozAsistente.vue'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

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
const { mostrarExito } = useToast()

const modalAjustesVozAbierto = ref(false)

// ─── Control de Acceso por Rol ───────────────────────────────────────────────
const puedeEditar = computed(() => {
  if (!usuarioActual.value) return true
  return permisosUsuario.value?.editarEncuestaClima ?? true
})

// ─── Datos de la Encuesta ───────────────────────────────────────────────────
const titulo = ref(props.encuestaInicial?.titulo || TITULO_ENCUESTA_CLIMA_INTEGRAL)
const descripcion = ref(props.encuestaInicial?.descripcion || DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL)
const departamento = ref(props.encuestaInicial?.departamento || 'General')
const preguntaDestacadaId = ref<string | null>(null)

const preguntas = ref<PreguntaEncuesta[]>(
  props.encuestaInicial?.preguntas && props.encuestaInicial.preguntas.length > 0
    ? JSON.parse(JSON.stringify(props.encuestaInicial.preguntas))
    : JSON.parse(JSON.stringify(PLANTILLA_CLIMA_INTEGRAL_DETALLADA))
)

// ─── Sincronizar Contexto de la Encuesta con el Asistente Global ───────────────
onMounted(() => {
  registrarContextoEncuesta(preguntas.value, aplicarAccionesJarvis, agregarPreguntaSugerida)
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

// ─── Agrupación de Preguntas por Bloques ──────────────────────────────────────
const preguntasPorBloque = computed(() => {
  return BLOQUES_ENCUESTA_CLIMA.map(bloque => {
    const prefijo = `Bloque ${bloque.numero}:`
    const preguntasBloque = preguntas.value.filter(p => 
      p.categoria?.startsWith(prefijo) || 
      p.categoria?.toLowerCase().includes(bloque.titulo.toLowerCase())
    )
    return {
      bloque,
      preguntas: preguntasBloque
    }
  })
})

// Preguntas que no caen en ningún bloque estándar
const preguntasOtras = computed(() => {
  return preguntas.value.filter(p => {
    return !BLOQUES_ENCUESTA_CLIMA.some(b => 
      p.categoria?.startsWith(`Bloque ${b.numero}:`) ||
      p.categoria?.toLowerCase().includes(b.titulo.toLowerCase())
    )
  })
})

// Mapa de íconos de bloques
const iconosBloque: Record<string, any> = {
  Users,
  Heart,
  Handshake,
  Star,
  TrendingUp,
  GraduationCap,
  Telescope,
  MessageSquareText
}

// ─── Modal Editor Avanzado de Pregunta (Doble Clic) ───────────────────────────
const modalAbierto = ref(false)
const preguntaEditando = ref<PreguntaEncuesta | null>(null)
const idxEditando = ref<number>(-1)

const abrirEditorPreguntaPorIndiceGlobal = (idx: number) => {
  if (!puedeEditar.value) return
  if (idx >= 0 && idx < preguntas.value.length && preguntas.value[idx]) {
    idxEditando.value = idx
    preguntaEditando.value = JSON.parse(JSON.stringify(preguntas.value[idx]))
    modalAbierto.value = true
  }
}

const abrirEditorPorId = (idPregunta: string) => {
  if (!puedeEditar.value) return
  const idx = preguntas.value.findIndex(p => p?.id === idPregunta)
  if (idx !== -1) {
    abrirEditorPreguntaPorIndiceGlobal(idx)
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

// ─── Acciones de Gestión de Preguntas ─────────────────────────────────────────
onMounted(() => {
  setTimeout(() => {
    analizarYGenerarSugerencia(preguntas.value, false)
  }, 600)
})

const restaurarPlantillaOficial = () => {
  if (!puedeEditar.value) return
  if (confirm('¿Deseas restaurar la plantilla oficial de Contigo Call Center con sus preguntas atómicas estructuradas en 8 bloques?')) {
    titulo.value = TITULO_ENCUESTA_CLIMA_INTEGRAL
    descripcion.value = DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL
    preguntas.value = JSON.parse(JSON.stringify(PLANTILLA_CLIMA_INTEGRAL_DETALLADA))
    analizarYGenerarSugerencia(preguntas.value, false)
  }
}

const agregarPreguntaEnBloque = (bloqueNumero: number) => {
  if (!puedeEditar.value) return
  const meta = BLOQUES_ENCUESTA_CLIMA.find(b => b.numero === bloqueNumero)
  const cat = meta ? `Bloque ${meta.numero}: ${meta.titulo}` : 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto'
  
  preguntas.value.push({
    id: `b${bloqueNumero}-p-usr-${Date.now()}`,
    categoria: cat,
    texto: `Nueva pregunta para ${meta?.titulo || 'este bloque'}...`,
    tipo: 'multiple',
    opciones: [
      { id: `opc-1-${Date.now()}`, texto: 'Sí', valor: 5, esAlerta: false },
      { id: `opc-2-${Date.now()}`, texto: 'Algunas veces', valor: 3, esAlerta: false },
      { id: `opc-3-${Date.now()}`, texto: 'No', valor: 1, esAlerta: true }
    ]
  })
  analizarYGenerarSugerencia(preguntas.value, false)
}

const destacarPregunta = (idPregunta: string) => {
  preguntaDestacadaId.value = idPregunta
  nextTick(() => {
    const el = document.getElementById(`pregunta-${idPregunta}`) || document.getElementById(idPregunta)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
  setTimeout(() => {
    if (preguntaDestacadaId.value === idPregunta) {
      preguntaDestacadaId.value = null
    }
  }, 6000)
}

const autoGuardarEnSilencio = async () => {
  if (!puedeEditar.value) return
  const idEncuesta = props.encuestaInicial?.id || 'enc-001'
  try {
    await editarEncuesta(idEncuesta, {
      titulo: titulo.value,
      descripcion: descripcion.value,
      departamento: departamento.value,
      preguntas: preguntas.value,
      preguntasSeguimiento: [
        {
          id: `seg-${Date.now()}`,
          categoria: 'Propuestas y Bienestar',
          texto: '¿Deseas compartir alguna recomendación confidencial adicional?',
          tipo: 'texto',
          opciones: []
        }
      ]
    })
  } catch (e) {
    console.warn('AutoGuardado en silencio:', e)
  }
}

const aplicarAccionesJarvis = (acciones: AccionJarvis[]) => {
  if (!puedeEditar.value) return
  const nombreAsis = ajustes.value?.nombreAsistente || 'Daniel'

  acciones.forEach(accion => {
    switch (accion.tipo) {
      case 'CREAR_PREGUNTA': {
        const nueva: PreguntaEncuesta = accion.preguntaCompleta || {
          id: accion.idPregunta || `p-asis-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          categoria: accion.categoria || 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto',
          texto: accion.textoPregunta || 'Nueva métrica de clima laboral',
          tipo: accion.tipoPregunta || (accion.opciones && accion.opciones.length > 0 ? 'multiple' : 'escala'),
          opciones: accion.opciones && accion.opciones.length > 0
            ? accion.opciones
            : accion.tipoPregunta === 'texto'
              ? []
              : obtenerEscalaEstandarDetallada('satisfaccion')
        }
        preguntas.value.push(nueva)
        destacarPregunta(nueva.id)
        mostrarExito(`🤖 ${nombreAsis}`, `Pregunta creada en "${nueva.categoria}"`)
        break
      }

      case 'EDITAR_PREGUNTA': {
        let index = -1
        if (typeof accion.numeroPregunta === 'number' && accion.numeroPregunta >= 1 && accion.numeroPregunta <= preguntas.value.length) {
          index = accion.numeroPregunta - 1
        } else if (accion.idPregunta) {
          index = preguntas.value.findIndex(p => p.id === accion.idPregunta)
        }

        const target = index !== -1 ? preguntas.value[index] : undefined
        if (target) {
          if (accion.textoPregunta) target.texto = accion.textoPregunta
          if (accion.categoria) target.categoria = accion.categoria
          if (accion.tipoPregunta) target.tipo = accion.tipoPregunta
          if (accion.opciones && accion.opciones.length > 0) target.opciones = accion.opciones
          destacarPregunta(target.id)
          mostrarExito(`🤖 ${nombreAsis}`, `Pregunta #${index + 1} actualizada`)
        }
        break
      }

      case 'EDITAR_OPCIONES': {
        let index = -1
        if (typeof accion.numeroPregunta === 'number' && accion.numeroPregunta >= 1 && accion.numeroPregunta <= preguntas.value.length) {
          index = accion.numeroPregunta - 1
        } else if (accion.idPregunta) {
          index = preguntas.value.findIndex(p => p.id === accion.idPregunta)
        }

        const target = index !== -1 ? preguntas.value[index] : undefined
        if (target && accion.opciones) {
          target.opciones = accion.opciones
          destacarPregunta(target.id)
          mostrarExito(`🤖 ${nombreAsis}`, `Opciones de la pregunta #${index + 1} actualizadas`)
        }
        break
      }

      case 'ASIGNAR_ALERTA': {
        let index = -1
        if (typeof accion.numeroPregunta === 'number' && accion.numeroPregunta >= 1 && accion.numeroPregunta <= preguntas.value.length) {
          index = accion.numeroPregunta - 1
        } else if (accion.idPregunta) {
          index = preguntas.value.findIndex(p => p.id === accion.idPregunta)
        }

        const target = index !== -1 ? preguntas.value[index] : undefined
        if (target) {
          if (Array.isArray(target.opciones)) {
            if (accion.opcionTexto) {
              const cleanBuscado = accion.opcionTexto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
              const opcMatch = target.opciones.find(o => {
                const cleanOpc = o.texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
                return cleanOpc.includes(cleanBuscado) || cleanBuscado.includes(cleanOpc)
              })
              if (opcMatch) {
                opcMatch.esAlerta = accion.esAlerta !== undefined ? accion.esAlerta : true
              }
            } else if (target.opciones.length > 0) {
              const ultimaOpcion = target.opciones[target.opciones.length - 1]
              if (ultimaOpcion) {
                ultimaOpcion.esAlerta = accion.esAlerta !== undefined ? accion.esAlerta : true
              }
            }
          }
          destacarPregunta(target.id)
          mostrarExito(`🤖 ${nombreAsis}`, `Alerta configurada en la pregunta #${index + 1}`)
        }
        break
      }

      case 'AGREGAR_OPCION': {
        let index = -1
        if (typeof accion.numeroPregunta === 'number' && accion.numeroPregunta >= 1 && accion.numeroPregunta <= preguntas.value.length) {
          index = accion.numeroPregunta - 1
        } else if (accion.idPregunta) {
          index = preguntas.value.findIndex(p => p.id === accion.idPregunta)
        }

        const target = index !== -1 ? preguntas.value[index] : undefined
        if (target && accion.opcionTexto) {
          if (!Array.isArray(target.opciones)) {
            target.opciones = []
          }
          target.opciones.push({
            id: `opc-asis-${Date.now()}`,
            texto: accion.opcionTexto,
            valor: accion.opcionValor !== undefined ? accion.opcionValor : 3,
            esAlerta: Boolean(accion.esAlerta)
          })
          destacarPregunta(target.id)
          mostrarExito(`🤖 ${nombreAsis}`, `Opción agregada a la pregunta #${index + 1}`)
        }
        break
      }

      case 'ELIMINAR_OPCION': {
        let index = -1
        if (typeof accion.numeroPregunta === 'number' && accion.numeroPregunta >= 1 && accion.numeroPregunta <= preguntas.value.length) {
          index = accion.numeroPregunta - 1
        } else if (accion.idPregunta) {
          index = preguntas.value.findIndex(p => p.id === accion.idPregunta)
        }

        if (index !== -1 && accion.opcionTexto && preguntas.value[index]) {
          const target = preguntas.value[index]
          if (Array.isArray(target?.opciones)) {
            const opcIdx = target.opciones.findIndex(o => o.texto.toLowerCase().includes(accion.opcionTexto!.toLowerCase()))
            if (opcIdx !== -1) {
              target.opciones.splice(opcIdx, 1)
              destacarPregunta(target.id)
              mostrarExito(`🤖 ${nombreAsis}`, `Opción eliminada de la pregunta #${index + 1}`)
            }
          }
        }
        break
      }

      case 'ELIMINAR_PREGUNTA': {
        let index = -1
        if (typeof accion.numeroPregunta === 'number' && accion.numeroPregunta >= 1 && accion.numeroPregunta <= preguntas.value.length) {
          index = accion.numeroPregunta - 1
        } else if (accion.idPregunta) {
          index = preguntas.value.findIndex(p => p.id === accion.idPregunta)
        }

        if (index !== -1 && index < preguntas.value.length) {
          preguntas.value.splice(index, 1)
          mostrarExito(`🤖 ${nombreAsis}`, `Pregunta #${index + 1} eliminada`)
        }
        break
      }

      case 'CAMBIAR_TITULO': {
        if (accion.nuevoTitulo) {
          titulo.value = accion.nuevoTitulo
          mostrarExito(`🤖 ${nombreAsis}`, 'Título de la encuesta actualizado')
        }
        break
      }

      case 'CAMBIAR_DESCRIPCION': {
        if (accion.nuevaDescripcion) {
          descripcion.value = accion.nuevaDescripcion
          mostrarExito(`🤖 ${nombreAsis}`, 'Descripción de la encuesta actualizada')
        }
        break
      }

      case 'RESTAURAR_PLANTILLA_OFICIAL': {
        titulo.value = TITULO_ENCUESTA_CLIMA_INTEGRAL
        descripcion.value = DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL
        preguntas.value = JSON.parse(JSON.stringify(PLANTILLA_CLIMA_INTEGRAL_DETALLADA))
        mostrarExito(`🤖 ${nombreAsis}`, 'Plantilla oficial restaurada (8 bloques oficiales)')
        break
      }
    }
  })

  // Auto-guardado en Supabase al ejecutar órdenes por voz (sin salir del editor)
  autoGuardarEnSilencio()
  analizarYGenerarSugerencia(preguntas.value, false)
}

const agregarPreguntaSugerida = (pregunta: PreguntaEncuesta) => {
  if (!puedeEditar.value) return
  preguntas.value.push(JSON.parse(JSON.stringify(pregunta)))
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
    preguntasSeguimiento: [
      {
        id: `seg-${Date.now()}`,
        categoria: 'Propuestas y Bienestar',
        texto: '¿Deseas compartir alguna recomendación confidencial adicional?',
        tipo: 'texto',
        opciones: []
      }
    ]
  })
}
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto text-left font-['Poppins',sans-serif] pb-24">

    <!-- ── BARRA SUPERIOR DE NAVEGACIÓN Y GUARDADO ── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="emit('volver')"
          class="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Encuesta Troncal de Clima Laboral
            </h2>
            <span class="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-bold">
              34 Preguntas · 8 Bloques
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Contigo Call Center · Auditoría multidimensional y analítica en tiempo real.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <BotonBase
          v-if="puedeEditar"
          variante="primario"
          tamano="mediano"
          @click="guardarEncuesta"
        >
          <template #iconoIzquierdo>
            <Save class="w-4 h-4" />
          </template>
          Guardar &amp; Actualizar Encuesta
        </BotonBase>
      </div>
    </div>

    <!-- ── BANNER DE ACCESO POR ROL: SOLO LECTURA (SI NO PUEDE EDITAR) ── -->
    <div
      v-if="!puedeEditar"
      class="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-200"
    >
      <div class="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Lock class="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-wider">
          Modo Solo Lectura (Acceso por Roles)
        </h4>
        <p class="text-[11px] text-amber-700 dark:text-amber-300">
          Tu rol actual (<strong>{{ usuarioActual?.rol || 'Consultor' }}</strong>) tiene permisos de visualización y consulta de estadísticas, pero la edición estructural de la encuesta está restringida a Administradores.
        </p>
      </div>
    </div>

    <!-- ── DATOS GENERALES DE LA ENCUESTA ── -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="sm:col-span-2 space-y-1">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Título de la Encuesta Oficial:</label>
          <input
            v-if="puedeEditar"
            v-model="titulo"
            type="text"
            class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
          />
          <p v-else class="text-xs font-bold text-slate-900 dark:text-white py-2">
            {{ titulo }}
          </p>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Departamento Destino:</label>
          <input
            v-if="puedeEditar"
            v-model="departamento"
            type="text"
            class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
          />
          <p v-else class="text-xs font-semibold text-slate-700 dark:text-slate-300 py-2">
            {{ departamento }}
          </p>
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Nota de Confidencialidad / Descripción:</label>
        <textarea
          v-if="puedeEditar"
          v-model="descripcion"
          rows="2"
          class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        />
        <p v-else class="text-xs text-slate-600 dark:text-slate-400 py-1">
          {{ descripcion }}
        </p>
      </div>
    </div>

    <!-- ── BARRA DE ACCIONES GLOBALES (RESTAURAR) ── -->
    <div v-if="puedeEditar" class="flex flex-wrap items-center justify-between gap-3 px-2">
      <div class="text-xs text-slate-400">
        Total preguntas configuradas: <strong class="text-slate-800 dark:text-slate-200">{{ preguntas.length }}</strong>
      </div>

      <BotonBase
        variante="fantasma"
        tamano="pequeno"
        @click="restaurarPlantillaOficial"
        title="Restablece la plantilla oficial de preguntas de Contigo Call Center"
      >
        <template #iconoIzquierdo>
          <RotateCcw class="w-3.5 h-3.5 text-amber-500" />
        </template>
        Restaurar Plantilla Oficial
      </BotonBase>
    </div>

    <!-- ── LISTA DE PREGUNTAS SEPARADAS POR LOS 8 BLOQUES OFICIALES ── -->
    <div class="space-y-8">
      
      <section
        v-for="itemBloque in preguntasPorBloque"
        :key="itemBloque.bloque.id"
        class="space-y-3"
      >
        <!-- ── Encabezado Visual del Bloque ── -->
        <div
          :class="[
            'p-4 sm:p-5 rounded-3xl bg-gradient-to-r text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3',
            itemBloque.bloque.colorClase
          ]"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <component
                :is="iconosBloque[itemBloque.bloque.icono] || Users"
                class="w-5 h-5 text-white"
              />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/20 font-bold">
                  Bloque {{ itemBloque.bloque.numero }}
                </span>
                <h3 class="text-sm sm:text-base font-black tracking-tight">
                  {{ itemBloque.bloque.titulo }}
                </h3>
              </div>
              <p class="text-[11px] text-white/80 mt-0.5">
                {{ itemBloque.bloque.descripcion }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-auto">
            <span class="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/20 font-bold">
              {{ itemBloque.preguntas.length }} preguntas
            </span>

            <button
              v-if="puedeEditar"
              type="button"
              @click="agregarPreguntaEnBloque(itemBloque.bloque.numero)"
              class="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Añadir una pregunta a este bloque"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
        </div>

        <!-- ── Tarjetas de Pregunta del Bloque ── -->
        <div v-if="itemBloque.preguntas.length > 0" class="space-y-3 pl-1 sm:pl-2">
          <div
            v-for="preg in itemBloque.preguntas"
            :key="preg.id"
            :class="[
              'rounded-3xl transition-all duration-700',
              preguntaDestacadaId === preg.id ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/40 animate-pulse scale-[1.01]' : ''
            ]"
          >
            <TarjetaPreguntaClima
              :pregunta="preg"
              :indice="preguntas.findIndex(p => p.id === preg.id)"
              :puedeEditar="puedeEditar"
              :idEncuesta="props.encuestaInicial?.id || 'enc-001'"
              @abrirEditor="abrirEditorPorId(preg.id)"
              @eliminar="eliminarPreguntaPorId(preg.id)"
            />
          </div>
        </div>

        <!-- Bloque vacío -->
        <div
          v-else
          class="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400"
        >
          No hay preguntas en este bloque. Clic en "Añadir" para crear una.
        </div>
      </section>

      <!-- ── Bloque para Otras Preguntas Personalizadas (si existen) ── -->
      <section v-if="preguntasOtras.length > 0" class="space-y-3">
        <div class="p-4 rounded-3xl bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md flex items-center justify-between">
          <div class="flex items-center gap-2">
            <HelpCircle class="w-5 h-5 text-white/80" />
            <h3 class="text-sm font-black">Otras Preguntas Personalizadas</h3>
          </div>
          <span class="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/20 font-bold">
            {{ preguntasOtras.length }} preguntas
          </span>
        </div>

        <div class="space-y-3 pl-1 sm:pl-2">
          <div
            v-for="preg in preguntasOtras"
            :key="preg.id"
            :class="[
              'rounded-3xl transition-all duration-700',
              preguntaDestacadaId === preg.id ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/40 animate-pulse scale-[1.01]' : ''
            ]"
          >
            <TarjetaPreguntaClima
              :pregunta="preg"
              :indice="preguntas.findIndex(p => p.id === preg.id)"
              :puedeEditar="puedeEditar"
              :idEncuesta="props.encuestaInicial?.id || 'enc-001'"
              @abrirEditor="abrirEditorPorId(preg.id)"
              @eliminar="eliminarPreguntaPorId(preg.id)"
            />
          </div>
        </div>
      </section>

    </div>

    <!-- ── MODAL EDITOR AVANZADO DE PREGUNTA (DOBLE CLIC) ── -->
    <ModalEditorPregunta
      :abierto="modalAbierto"
      :pregunta="preguntaEditando"
      @guardar="guardarEdicionPregunta"
      @cerrar="cerrarModal"
    />

    <!-- ── MODAL DE AJUSTES DE VOZ & NOMBRE DEL ASISTENTE ── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modalAjustesVozAbierto"
        class="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        @click.self="modalAjustesVozAbierto = false"
      >
        <div class="relative w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            @click="modalAjustesVozAbierto = false"
            class="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
          <PerfilAjustesVozAsistente />
        </div>
      </div>
    </Transition>

  </div>
</template>