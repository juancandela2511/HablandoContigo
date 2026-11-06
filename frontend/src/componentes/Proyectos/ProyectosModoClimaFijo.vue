<!--
  ============================================================================
  MODALIDAD 1: EDITOR DE ENCUESTA TRONCAL DE CLIMA LABORAL (ProyectosModoClimaFijo.vue)
  ============================================================================
  Encuesta Oficial Contigo Call Center:
    • Estructura dividida visualmente en Bloques/Módulos Configurables.
    • Creación, Reordenamiento y Edición por 2 Clics de Bloques.
    • Ocultamiento / Despliegue de preguntas con 1 Clic en la cabecera.
    • Tarjetas de pregunta con Mini-Estadísticas de respuestas individuales.
    • Control de acceso por Roles (Super Admin / Admin General / Admin pueden editar).
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
  X,
  Eye,
  EyeOff,
  GripVertical,
  Edit3,
  Layers,
  Sparkles,
  Shield,
  Zap,
  Link
} from 'lucide-vue-next'
import type { PreguntaEncuesta, AccionJarvis } from '@/ia'
import { obtenerEscalaEstandarDetallada } from '@/ia'
import {
  TITULO_ENCUESTA_CLIMA_INTEGRAL,
  DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL,
  BLOQUES_ENCUESTA_CLIMA, PLANTILLA_CLIMA_INTEGRAL_DETALLADA,
  type MetadataBloque
} from '@/Config/preguntasCuestionario.ts'
import { useAutenticacion } from '@/Almacenes/useAutenticacion'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useAnclajeGraficos as useGraficosAnclados } from '@/Almacenes/useAnclajeGraficos'
import { useToast } from '@/Almacenes/useToast'
import ModalEditorPregunta from '@/componentes/Proyectos/ModalEditorPregunta.vue'
import ModalEditarBloque from '@/componentes/Proyectos/ModalEditarBloque.vue'
import TarjetaPreguntaClima from '@/componentes/Proyectos/TarjetaPreguntaClima.vue'
import ProyectosClimaHeaderFiltros from './EditorSubcomponentes/ProyectosClimaHeaderFiltros.vue'

const props = defineProps<{
  encuestaInicial?: any
}>()

const emit = defineEmits<{
  (e: 'guardar', datos: any): void
  (e: 'volver'): void
  (e: 'abrirAjustesVoz'): void
}>()

const { usuarioActual, permisosUsuario } = useAutenticacion()
const { editarEncuesta } = useEncuestas()
const {
  generarEnlazarGraficosPredeterminadosIA,
  eliminarEstadisticasDePregunta
} = useGraficosAnclados()
const { mostrarExito } = useToast()

const registrarContextoEncuesta = (..._args: any[]) => {}
const desregistrarContextoEncuesta = () => {}
const analizarYGenerarSugerencia = (..._args: any[]) => {}
const ajustes = ref({ nombreAsistente: 'Asistente' })

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
  if (props.encuestaInicial?.estado === 'Finalizada') return false
  if (!usuarioActual.value) return true
  return permisosUsuario.value?.editarEncuestaClima ?? true
})

const titulo = ref(props.encuestaInicial?.titulo || TITULO_ENCUESTA_CLIMA_INTEGRAL)
const descripcion = ref(props.encuestaInicial?.descripcion || DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL)
const departamento = ref(props.encuestaInicial?.departamento || 'General')
const preguntaDestacadaId = ref<string | null>(null)

// Bloques reactivos dinámicos
const bloques = ref<MetadataBloque[]>(
  props.encuestaInicial?.bloques && props.encuestaInicial.bloques.length > 0
    ? JSON.parse(JSON.stringify(props.encuestaInicial.bloques))
    : JSON.parse(JSON.stringify(BLOQUES_ENCUESTA_CLIMA))
)

// Estado de colapso de cada bloque (true = colapsado/oculto, false = desplegado)
const bloquesColapsados = ref<Record<string, boolean>>({})

const toggleColapsarBloque = (idBloque: string) => {
  bloquesColapsados.value[idBloque] = !bloquesColapsados.value[idBloque]
}

// Modal Editar / Crear Bloque
const modalEditarBloqueAbierto = ref(false)
const bloqueEditando = ref<MetadataBloque | null>(null)
const esNuevoBloque = ref(false)

const abrirModalCrearBloque = () => {
  if (!puedeEditar.value) return
  bloqueEditando.value = {
    id: `bloque-${Date.now()}`,
    numero: bloques.value.length + 1,
    titulo: 'Nuevo Bloque Personalizado',
    descripcion: 'Descripción del nuevo bloque...',
    icono: 'Layers',
    colorClase: 'from-cyan-600 to-blue-700',
    textColorClase: 'text-white'
  }
  esNuevoBloque.value = true
  modalEditarBloqueAbierto.value = true
}

const abrirModalEditarBloque = (bloque: MetadataBloque) => {
  if (!puedeEditar.value) return
  bloqueEditando.value = JSON.parse(JSON.stringify(bloque))
  esNuevoBloque.value = false
  modalEditarBloqueAbierto.value = true
}

const guardarEdicionBloque = (bloqueGuardado: MetadataBloque) => {
  if (esNuevoBloque.value) {
    bloques.value.push(bloqueGuardado)

    // Crear obligatoriamente la primera pregunta y su estadística para este nuevo bloque
    const prefijo = `Bloque ${bloqueGuardado.numero}:`
    const preguntasDelBloque = preguntas.value.filter(p => p.categoria?.startsWith(prefijo) || p.categoria?.toLowerCase().includes(bloqueGuardado.titulo.toLowerCase()))
    if (preguntasDelBloque.length === 0) {
      const primeraPreguntaBloque: PreguntaEncuesta = {
        id: `b${bloqueGuardado.numero}-p1-${Date.now()}`,
        categoria: `Bloque ${bloqueGuardado.numero}: ${bloqueGuardado.titulo}`,
        texto: `¿Cómo evalúas ${bloqueGuardado.titulo.toLowerCase()} en tu equipo?`,
        tipo: 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      }
      preguntas.value.push(primeraPreguntaBloque)
    }

    mostrarExito('Bloque Creado', `Se agregó el bloque "${bloqueGuardado.titulo}". Puedes configurar sus preguntas y gráficas libremente.`)
  } else {
    const idx = bloques.value.findIndex(b => b.id === bloqueGuardado.id)
    if (idx !== -1) {
      bloques.value[idx] = bloqueGuardado
      mostrarExito('Bloque Actualizado', `Se actualizó el bloque "${bloqueGuardado.titulo}"`)
    }
  }
  reordenarNumerosBloques()
}

const eliminarBloque = (idBloque: string) => {
  const idx = bloques.value.findIndex(b => b.id === idBloque)
  if (idx !== -1) {
    const el = bloques.value.splice(idx, 1)[0]
    if (el) {
      // Eliminar también preguntas y estadísticas asociadas a este bloque
      const prefijo = `Bloque ${el.numero}:`
      const indicesAEliminar: number[] = []
      preguntas.value.forEach((p, pIdx) => {
        if (p.categoria?.startsWith(prefijo) || p.categoria?.toLowerCase().includes(el.titulo.toLowerCase())) {
          indicesAEliminar.push(pIdx)
          eliminarEstadisticasDePregunta(p.id)
        }
      })
      for (let i = indicesAEliminar.length - 1; i >= 0; i--) {
        const target = indicesAEliminar[i]
        if (target !== undefined) preguntas.value.splice(target, 1)
      }

      reordenarNumerosBloques()
      mostrarExito('Bloque Eliminado', `Se eliminó el bloque "${el.titulo}" y sus estadísticas vinculadas.`)
    }
  }
}

const reordenarNumerosBloques = () => {
  bloques.value.forEach((b, index) => {
    b.numero = index + 1
  })
}

const moverBloqueArriba = (idx: number) => {
  if (idx > 0) {
    const item = bloques.value.splice(idx, 1)[0]
    if (item) {
      bloques.value.splice(idx - 1, 0, item)
      reordenarNumerosBloques()
      mostrarExito('Orden de Bloque', `El bloque "${item.titulo}" subió al puesto #${idx}`)
    }
  }
}

const moverBloqueAbajo = (idx: number) => {
  if (idx < bloques.value.length - 1) {
    const item = bloques.value.splice(idx, 1)[0]
    if (item) {
      bloques.value.splice(idx + 1, 0, item)
      reordenarNumerosBloques()
      mostrarExito('Orden de Bloque', `El bloque "${item.titulo}" bajó al puesto #${idx + 2}`)
    }
  }
}

// ─── Drag & Drop Reordering de Bloques completos ─────────────────────────────
const arrastrandoBloqueIdx = ref<number | null>(null)
const sobrevolandoBloqueIdx = ref<number | null>(null)

const alIniciarArrastreBloque = (e: DragEvent, idx: number) => {
  if (!puedeEditar.value) return
  arrastrandoBloqueIdx.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('type/bloque-idx', String(idx))
  }
}

const alSobrevolarArrastreBloque = (e: DragEvent, idx: number) => {
  if (!puedeEditar.value) return
  e.preventDefault()
  sobrevolandoBloqueIdx.value = idx
}

const alSoltarArrastreBloque = (e: DragEvent, targetIdx: number) => {
  if (!puedeEditar.value) return
  e.preventDefault()
  const fromIdx = arrastrandoBloqueIdx.value
  if (fromIdx === null || fromIdx === targetIdx) {
    limpiarArrastreBloque()
    return
  }

  const item = bloques.value[fromIdx]
  if (item) {
    bloques.value.splice(fromIdx, 1)
    bloques.value.splice(targetIdx, 0, item)
    reordenarNumerosBloques()
    mostrarExito('Bloque Reordenado', `El bloque "${item.titulo}" se movió a la posición #${targetIdx + 1}`)
  }
  limpiarArrastreBloque()
}

const limpiarArrastreBloque = () => {
  arrastrandoBloqueIdx.value = null
  sobrevolandoBloqueIdx.value = null
}

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

watch(
  () => props.encuestaInicial,
  (nuevaEnc) => {
    if (nuevaEnc) {
      if (nuevaEnc.titulo) titulo.value = nuevaEnc.titulo
      if (nuevaEnc.descripcion) descripcion.value = nuevaEnc.descripcion
      if (nuevaEnc.departamento) departamento.value = nuevaEnc.departamento
      if (nuevaEnc.bloques && nuevaEnc.bloques.length > 0) {
        bloques.value = JSON.parse(JSON.stringify(nuevaEnc.bloques))
      }
      if (nuevaEnc.preguntas && nuevaEnc.preguntas.length > 0) {
        preguntas.value = JSON.parse(JSON.stringify(nuevaEnc.preguntas))
      }
    }
  },
  { deep: true }
)

const preguntasPorBloque = computed(() => {
  return bloques.value.map(bloque => {
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
    return !bloques.value.some(b => 
      p.categoria?.startsWith(`Bloque ${b.numero}:`) ||
      p.categoria?.toLowerCase().includes(b.titulo.toLowerCase())
    )
  })
})

const iconosBloque: Record<string, any> = {
  Users, Heart, Handshake, Star, TrendingUp, GraduationCap, Telescope, MessageSquareText, Sparkles, Layers, Shield, Zap
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
    guardarEncuesta(true)
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
  if (confirm('¿Deseas restaurar la plantilla oficial de Contigo Call Center con sus 8 bloques predeterminados?')) {
    titulo.value = TITULO_ENCUESTA_CLIMA_INTEGRAL
    descripcion.value = DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL
    bloques.value = JSON.parse(JSON.stringify(BLOQUES_ENCUESTA_CLIMA))
    preguntas.value = JSON.parse(JSON.stringify(PLANTILLA_CLIMA_INTEGRAL_DETALLADA))
    bloquesColapsados.value = {}
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
    const meta = bloques.value.find(b => b.numero === bloqueNumero)
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
  const meta = bloques.value.find(b => b.numero === bloqueNumero)
  const cat = meta ? `Bloque ${meta.numero}: ${meta.titulo}` : 'Bloque Personalizado'
  
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

  // Desplegar el bloque si estaba colapsado
  if (meta && bloquesColapsados.value[meta.id]) {
    bloquesColapsados.value[meta.id] = false
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
  
  mostrarExito(
    'Pregunta Creada',
    `Se agregó la pregunta. Haz clic en editar para configurar su gráfica en el Dashboard.`
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
        categoria: accion.categoria || 'Bloque Personalizado',
        texto: accion.textoPregunta || 'Nueva métrica de clima laboral',
        tipo: accion.tipoPregunta || 'escala',
        opciones: obtenerEscalaEstandarDetallada('satisfaccion')
      }
      preguntas.value.push(nueva)
      destacarPregunta(nueva.id)
      mostrarExito(`🤖 ${nombreAsis}`, `Pregunta creada en "${nueva.categoria}"`)
    }
  })
  analizarYGenerarSugerencia(preguntas.value, false)
}

const agregarPreguntaSugerida = (pregunta: PreguntaEncuesta) => {
  if (!puedeEditar.value) return
  const copia = JSON.parse(JSON.stringify(pregunta))
  preguntas.value.push(copia)
  mostrarExito('Pregunta Creada', 'Se agregó la pregunta sugerida.')
  analizarYGenerarSugerencia(preguntas.value, false)
}

const eliminarPreguntaPorId = (idPregunta: string) => {
  if (!puedeEditar.value) return
  const idx = preguntas.value.findIndex(p => p.id === idPregunta)
  if (idx !== -1) {
    const el = preguntas.value.splice(idx, 1)[0]
    if (el) {
      eliminarEstadisticasDePregunta(el.id)
    }
    analizarYGenerarSugerencia(preguntas.value, false)
    mostrarExito('Pregunta Eliminada', 'Se eliminó la pregunta y su estadística correspondiente.')
  }
}

const guardarEncuesta = (silencioso: boolean = false) => {
  if (!puedeEditar.value) return
  emit('guardar', {
    titulo: titulo.value,
    descripcion: descripcion.value,
    departamento: departamento.value,
    bloques: bloques.value,
    preguntas: preguntas.value,
    silencioso,
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
      @crearBloque="abrirModalCrearBloque"
      @autoEnlazarIA="autoEnlazarEstadisticasConIA"
    />



    <!-- Lista de Preguntas separadas por Bloques Dinámicos -->
    <div class="space-y-8">
      <section v-for="(itemBloque, bIdx) in preguntasPorBloque" :key="itemBloque.bloque.id" class="space-y-3">
        <!-- Encabezado de Bloque (1 Clic: Colapsar | 2 Clics: Editar | Arrastrar para Reordenar) -->
        <div
          :draggable="puedeEditar"
          @dragstart="alIniciarArrastreBloque($event, bIdx)"
          @dragover="alSobrevolarArrastreBloque($event, bIdx)"
          @drop="alSoltarArrastreBloque($event, bIdx)"
          @click="toggleColapsarBloque(itemBloque.bloque.id)"
          @dblclick.stop="abrirModalEditarBloque(itemBloque.bloque)"
          :class="[
            'p-4 sm:p-5 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none transition-all duration-300 hover:brightness-105 group relative',
            itemBloque.bloque.colorPersonalizado ? '' : ['bg-gradient-to-r', itemBloque.bloque.colorClase],
            arrastrandoBloqueIdx === bIdx ? 'opacity-40 scale-95 border-2 border-dashed border-white' : '',
            sobrevolandoBloqueIdx === bIdx ? 'ring-4 ring-cyan-400 scale-[1.01]' : ''
          ]"
          :style="itemBloque.bloque.colorPersonalizado ? { backgroundColor: itemBloque.bloque.colorPersonalizado } : {}"
        >
          <div class="flex items-center gap-3">
            <!-- Asidero para Arrastrar y Reordenar Bloques -->
            <div v-if="puedeEditar" class="opacity-60 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1" title="Arrastra para cambiar la posición de este bloque">
              <GripVertical class="w-5 h-5 text-white/90" />
            </div>

            <!-- Botón de Ojo Abierto / Ojo Cerrado con Animación -->
            <button
              type="button"
              @click.stop="toggleColapsarBloque(itemBloque.bloque.id)"
              class="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 text-white transition-all duration-300 transform active:scale-90 cursor-pointer shadow-inner"
              :title="!bloquesColapsados[itemBloque.bloque.id] ? 'Bloque desplegado (Clic para ocultar)' : 'Bloque colapsado (Clic para mostrar)'"
            >
              <Transition name="ojo-anim" mode="out-in">
                <Eye v-if="!bloquesColapsados[itemBloque.bloque.id]" key="ojo-abierto" class="w-5 h-5 text-emerald-200 transition-all duration-300" />
                <EyeOff v-else key="ojo-cerrado" class="w-5 h-5 text-amber-200/90 transition-all duration-300" />
              </Transition>
            </button>

            <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <component :is="iconosBloque[itemBloque.bloque.icono] || Layers" class="w-5 h-5 text-white" />
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/20 font-bold">
                  Bloque {{ itemBloque.bloque.numero }}
                </span>
                <h3 class="text-sm sm:text-base font-black tracking-tight">{{ itemBloque.bloque.titulo }}</h3>
                <span v-if="itemBloque.bloque.idEncuestaVinculada" class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-900 flex items-center gap-1">
                  <Link class="w-2.5 h-2.5" /> Vinculado
                </span>
              </div>
              <p class="text-[11px] text-white/80 mt-0.5 line-clamp-1">{{ itemBloque.bloque.descripcion }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-auto" @click.stop>
            <!-- Botón Editar Bloque (Solo Ícono) -->
            <button
              v-if="puedeEditar"
              type="button"
              @click.stop="abrirModalEditarBloque(itemBloque.bloque)"
              title="Editar Bloque"
              class="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <Edit3 class="w-4 h-4" />
            </button>

            <span class="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/20 font-bold">
              {{ itemBloque.preguntas.length }} preg.
            </span>

            <!-- Botón Añadir Pregunta (Solo Ícono) -->
            <button
              v-if="puedeEditar"
              type="button"
              @click.stop="agregarPreguntaEnBloque(itemBloque.bloque.numero)"
              title="Añadir Pregunta"
              class="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <Plus class="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <!-- Cuerpo con Preguntas con transición suave (se oculta si el bloque está colapsado) -->
        <Transition name="desplegar-bloque">
          <div v-if="!bloquesColapsados[itemBloque.bloque.id] && itemBloque.preguntas.length > 0" class="space-y-3 pl-1 sm:pl-2">
            <div v-for="preg in itemBloque.preguntas" :key="preg.id" :class="['rounded-3xl transition-all duration-700', preguntaDestacadaId === preg.id ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/40 animate-pulse scale-[1.01]' : '']">
              <TarjetaPreguntaClima
                :pregunta="preg"
                :indice="preguntas.findIndex(p => p.id === preg.id)"
                :puedeEditar="puedeEditar"
                :idEncuesta="props.encuestaInicial?.id || 'enc-001'"
                :respuestasPersonalizadas="props.encuestaInicial?.respuestasArchivadas"
                :esArrastrando="arrastrandoIdx === preguntas.findIndex(p => p.id === preg.id)"
                :esSobrevolando="sobrevolandoIdx === preguntas.findIndex(p => p.id === preg.id)"
                @dragstart="alIniciarArrastre($event, preguntas.findIndex(p => p.id === preg.id))"
                @dragover="alSobrevolarArrastre($event, preguntas.findIndex(p => p.id === preg.id))"
                @drop="alSoltarArrastre($event, preguntas.findIndex(p => p.id === preg.id))"
                @dragend="limpiarArrastre"
                @abrirEditor="abrirEditorPorId(preg.id)"
                @eliminar="eliminarPreguntaPorId(preg.id)" @cambio="guardarEncuesta(true)"
              />
            </div>
          </div>
          <div v-else-if="!bloquesColapsados[itemBloque.bloque.id]" class="p-6 text-center rounded-3xl bg-slate-100 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700/60 text-slate-400 text-xs">
            No hay preguntas en este bloque aún. Haz clic en "Añadir" en el encabezado para crear una.
          </div>
        </Transition>
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
              :respuestasPersonalizadas="props.encuestaInicial?.respuestasArchivadas"
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

    <!-- Modal Editar / Crear Bloque -->
    <ModalEditarBloque
      :abierto="modalEditarBloqueAbierto"
      :bloque="bloqueEditando"
      :esNuevo="esNuevoBloque"
      @guardar="guardarEdicionBloque"
      @eliminar="eliminarBloque"
      @cerrar="modalEditarBloqueAbierto = false"
    />
  </div>
</template>

<style scoped>
.ojo-anim-enter-active,
.ojo-anim-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.ojo-anim-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-30deg);
}
.ojo-anim-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(30deg);
}

.desplegar-bloque-enter-active,
.desplegar-bloque-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.desplegar-bloque-enter-from,
.desplegar-bloque-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>