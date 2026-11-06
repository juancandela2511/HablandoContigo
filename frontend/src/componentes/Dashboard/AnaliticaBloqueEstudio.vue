<!--
  ============================================================================
  ORQUESTADOR DE ESTADÍSTICA DE ESTUDIOS Y TALENTO (AnaliticaBloqueEstudio.vue)
  ============================================================================
  PROPÓSITO:
  Orquesta la vista principal de la Estadística de Estudios y Talento Interno.
  Encasilla dinámicamente las respuestas abiertas (ej. "sistemas" -> Sistemas,
  "software" -> Software, "data" -> Data, "abogado" -> Abogado / Derecho, o
  crea nuevas categorías para cualquier otra profesión escrita) y destaca el
  punto fuerte de profesionales de la empresa.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Award } from 'lucide-vue-next'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import {
  NOMBRES_CATEGORIAS_ESTUDIO,
  clasificarEstudioAbierto,
  clasificarRespuestaAbiertaParaGrafico,
  obtenerMetadatosCategoriaEstudio
} from './Estudios/clasificadorEstudiosIA'

import EstudiosEncabezadoMetricas from './Estudios/EstudiosEncabezadoMetricas.vue'
import EstudiosGraficoBarras, { type ItemEstudioPrograma } from './Estudios/EstudiosGraficoBarras.vue'
import ModalConfiguracionEstudios, { type PreguntaDisponibleOption } from './Estudios/ModalConfiguracionEstudios.vue'

const props = defineProps<{
  departamentoSeleccionado: string
  periodoSeleccionado?: string
}>()

const { encuestas, respuestasAnonimas, inyectarDatosDePrueba } = useEncuestas()

const mostrarModalConfiguracion = ref(false)
const preguntaVinculadaId = ref<string>(localStorage.getItem('preguntaEstudiosVinculadaId') || '')
const cargandoInyeccion = ref(false)

const manejarInyectarDatos = async () => {
  cargandoInyeccion.value = true
  try {
    await inyectarDatosDePrueba(15)
  } finally {
    cargandoInyeccion.value = false
  }
}

/**
 * Lista consolidada de TODAS las preguntas disponibles (tanto abiertas como cerradas)
 */
const todasLasPreguntasDisponibles = computed<PreguntaDisponibleOption[]>(() => {
  const lista: PreguntaDisponibleOption[] = []

  encuestas.value.forEach(enc => {
    ;(enc.preguntas || []).forEach(p => {
      if (p.tipo === 'texto' || !p.opciones || p.opciones.length === 0) {
        lista.push({
          id: p.id,
          idEncuesta: enc.id,
          tituloEncuesta: enc.titulo || 'Encuesta de Clima',
          texto: `${p.texto} (Respuesta Abierta - Agrupación IA)`,
          opciones: [...NOMBRES_CATEGORIAS_ESTUDIO]
        })
      } else {
        const opcionesTexto = (p.opciones || [])
          .map(o => typeof o === 'string' ? o : (o.texto || ''))
          .filter(Boolean)

        if (opcionesTexto.length > 0) {
          lista.push({
            id: p.id,
            idEncuesta: enc.id,
            tituloEncuesta: enc.titulo || 'Encuesta de Clima',
            texto: p.texto,
            opciones: opcionesTexto
          })
        }
      }
    })
  })

  return lista
})

const preguntaVinculada = computed(() => {
  if (!preguntaVinculadaId.value) return null
  return todasLasPreguntasDisponibles.value.find(p => p.id === preguntaVinculadaId.value) || null
})

const vincularPregunta = (id: string) => {
  preguntaVinculadaId.value = id
  if (id) {
    localStorage.setItem('preguntaEstudiosVinculadaId', id)
  } else {
    localStorage.removeItem('preguntaEstudiosVinculadaId')
  }
}

/**
 * Encasillamiento dinámico de respuestas abiertas de estudio/profesión
 * (creando puntos nuevos si alguien escribe "abogado", "arquitecto", etc.)
 */
const datosEstudioDetallados = computed(() => {
  const conteoReal: Record<string, number> = {}
  const usaEncasillamientoEstudios =
    !preguntaVinculada.value ||
    preguntaVinculada.value.id === 'b6-p33b-que-estudia' ||
    preguntaVinculada.value.texto.toLowerCase().includes('estudi') ||
    preguntaVinculada.value.texto.toLowerCase().includes('qué área o programa') ||
    preguntaVinculada.value.texto.toLowerCase().includes('respuesta abierta')

  if (!usaEncasillamientoEstudios && preguntaVinculada.value) {
    ;(preguntaVinculada.value.opciones || []).forEach(cat => { conteoReal[cat] = 0 })
  }

  respuestasAnonimas.value.forEach(resp => {
    if (!resp.respuestas || !Array.isArray(resp.respuestas)) return

    resp.respuestas.forEach(item => {
      const txtP = (item.textoPregunta || '').toLowerCase()
      const idP = item.idPregunta || ''
      const rawValor = String(item.respuesta || item.comentario || '').trim()
      if (!rawValor) return

      if (usaEncasillamientoEstudios) {
        const esItemObjetivo = preguntaVinculada.value && preguntaVinculada.value.id !== 'b6-p33b-que-estudia'
          ? (idP === preguntaVinculada.value.id)
          : (
              idP === 'b6-p33b-que-estudia' ||
              idP === 'b1-p-estudios' ||
              txtP.includes('programa de estudios') ||
              txtP.includes('qué área o programa') ||
              txtP.includes('que estudias') ||
              txtP.includes('qué estudias') ||
              txtP.includes('carrera que estudias') ||
              txtP.includes('cual es tu profesion') ||
              txtP.includes('cuál es tu profesión')
            )

        if (esItemObjetivo) {
          const categoriaEncasillada = (!preguntaVinculada.value || preguntaVinculada.value.id === 'b6-p33b-que-estudia')
            ? clasificarEstudioAbierto(rawValor)
            : clasificarRespuestaAbiertaParaGrafico(item.textoPregunta || '', rawValor)

          if (categoriaEncasillada) {
            conteoReal[categoriaEncasillada] = (conteoReal[categoriaEncasillada] || 0) + 1
          }
        }
      } else if (preguntaVinculada.value) {
        if (idP === preguntaVinculada.value.id || txtP === preguntaVinculada.value.texto.toLowerCase()) {
          const match = Object.keys(conteoReal).find(c => c.toLowerCase() === rawValor.toLowerCase()) || rawValor
          conteoReal[match] = (conteoReal[match] || 0) + 1
        }
      }
    })
  })

  // Si aún no hay respuestas en preguntas abiertas, mostrar las categorías principales en 0
  if (usaEncasillamientoEstudios && Object.keys(conteoReal).length === 0) {
    ;['Sistemas', 'Software', 'Data', 'Abogado / Derecho', 'Administración y Negocios', 'Psicología y Talento Humano'].forEach(cat => {
      conteoReal[cat] = 0
    })
  }

  const totalPersonas = Object.values(conteoReal).reduce((acc, curr) => acc + curr, 0)

  const lista: ItemEstudioPrograma[] = Object.keys(conteoReal).map((programa, idx) => {
    const cantidad = conteoReal[programa] || 0
    const porcentaje = totalPersonas > 0 ? Math.round((cantidad / totalPersonas) * 100) : 0
    const meta = obtenerMetadatosCategoriaEstudio(programa, idx)

    return {
      programa,
      cantidad,
      porcentaje,
      habilidades: meta.habilidades,
      usoRecomendado: meta.usoRecomendado,
      color: meta.color
    }
  }).sort((a, b) => b.cantidad - a.cantidad)

  const programaLider = totalPersonas > 0 && lista[0] && lista[0].cantidad > 0 ? lista[0] : null
  const totalHabilidadesUnicas = lista.filter(i => i.cantidad > 0).length

  return { totalPersonas, programaLider, totalHabilidadesUnicas, lista }
})
</script>

<template>
  <div class="space-y-4 text-left font-['Poppins',sans-serif]">
    <EstudiosEncabezadoMetricas
      :totalPersonas="datosEstudioDetallados.totalPersonas"
      :totalHabilidadesUnicas="datosEstudioDetallados.totalHabilidadesUnicas"
      :cargandoInyeccion="cargandoInyeccion"
      :tituloModulo="preguntaVinculada ? `Estadística de Estudios: ${preguntaVinculada.tituloEncuesta}` : 'Estadística de Estudios & Profesiones (Agrupación Dinámica IA)'"
      :subtituloModulo="preguntaVinculada ? `Analizando y encasillando la pregunta: '${preguntaVinculada.texto}'` : 'Agrupa dinámicamente carreras y profesiones abiertas (Sistemas, Software, Data, Abogado, etc.) para identificar el punto fuerte de la empresa.'"
      @abrirConfiguracion="mostrarModalConfiguracion = true"
      @inyectarDatos="manejarInyectarDatos"
    />

    <!-- Banner de Punto Fuerte Profesional de la Empresa -->
    <div
      v-if="datosEstudioDetallados.programaLider"
      class="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <Award class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Punto Fuerte de Profesionales en la Empresa
          </span>
          <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            {{ datosEstudioDetallados.programaLider.programa }}
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-1">
              ({{ datosEstudioDetallados.programaLider.cantidad }} {{ datosEstudioDetallados.programaLider.cantidad === 1 ? 'profesional' : 'profesionales' }} · {{ datosEstudioDetallados.programaLider.porcentaje }}%)
            </span>
          </h4>
          <p class="text-xs text-slate-600 dark:text-slate-400">
            {{ datosEstudioDetallados.programaLider.usoRecomendado }}
          </p>
        </div>
      </div>
    </div>

    <EstudiosGraficoBarras
      :listaEstudios="datosEstudioDetallados.lista"
      :departamentoSeleccionado="departamentoSeleccionado"
      :totalPersonas="datosEstudioDetallados.totalPersonas"
      :tituloPregunta="preguntaVinculada ? preguntaVinculada.texto : 'Pregunta 33b — ¿Qué área o programa de estudios cursas actualmente?'"
    />

    <ModalConfiguracionEstudios
      :abierto="mostrarModalConfiguracion"
      :preguntaIdSeleccionada="preguntaVinculadaId"
      :preguntasDisponibles="todasLasPreguntasDisponibles"
      @vincularPregunta="vincularPregunta"
      @cerrar="mostrarModalConfiguracion = false"
    />
  </div>
</template>
