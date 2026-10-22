import { ref, computed } from 'vue'
import type { PreguntaEncuesta, OpcionPregunta } from '@/ia'
import type { Encuesta } from '@/Almacenes/useEncuestas'

export function useBifurcacionesCola() {
  const colaPreguntas = ref<PreguntaEncuesta[]>([])
  const indicePreguntaActual = ref(0)
  const respuestasUsuario = ref<Record<string, any>>({})
  const respuestasAncladas = ref<Record<string, string>>({})
  const alertaDetectadaEnSesion = ref(false)
  const listaAlertas = ref<string[]>([])

  const preguntaActual = computed(() => colaPreguntas.value[indicePreguntaActual.value])
  const totalPreguntasCola = computed(() => colaPreguntas.value.length)
  const porcentajeProgreso = computed(() => totalPreguntasCola.value === 0 ? 0 : Math.round((indicePreguntaActual.value / totalPreguntasCola.value) * 100))

  const normalizar = (txt: string) => (txt || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

  const removerHijas = (idPadre: string, todas: PreguntaEncuesta[]) => {
    colaPreguntas.value = colaPreguntas.value.filter(p => p.id !== idPadre)
    delete respuestasUsuario.value[idPadre]
    delete respuestasAncladas.value[idPadre]
    todas.filter(h => h.esCondicional && h.disparadorPor === idPadre).forEach(h => removerHijas(h.id, todas))
  }

  const evaluarCondicionales = (idActual: string, textoResp: string, todas: PreguntaEncuesta[]) => {
    const respNorm = normalizar(textoResp)
    todas.filter(sub => sub.esCondicional && sub.disparadorPor === idActual).forEach(sub => {
      const valores = sub.valoresDisparo?.length ? sub.valoresDisparo : ['Sí', 'si']
      const coincide = valores.some(v => respNorm === normalizar(v) || respNorm.startsWith(normalizar(v)))
      const debeMostrar = sub.accionCondicion === 'omitir_si' ? !coincide : coincide

      if (debeMostrar) {
        if (!colaPreguntas.value.some(p => p.id === sub.id)) {
          const idxPadre = colaPreguntas.value.findIndex(p => p.id === idActual)
          colaPreguntas.value.splice(idxPadre !== -1 ? idxPadre + 1 : indicePreguntaActual.value + 1, 0, sub)
        }
      } else {
        removerHijas(sub.id, todas)
      }
    })
  }

  const procesarSeleccionOpcion = (opcion: OpcionPregunta, encuesta: Encuesta | null) => {
    if (!preguntaActual.value) return
    const id = preguntaActual.value.id
    respuestasUsuario.value[id] = {
      texto: opcion.texto,
      valor: opcion.valor,
      esAlerta: opcion.esAlerta,
      tipoAlertaId: opcion.tipoAlertaId,
      nombreAlerta: opcion.nombreAlerta,
      severidadAlerta: opcion.severidadAlerta
    }

    const todas = encuesta?.preguntas || []
    evaluarCondicionales(id, opcion.texto || '', todas)

    const targetId = opcion.saltarHastaId || preguntaActual.value.saltarHastaId
    if (targetId === 'FINALIZAR' || targetId === 'FIN') {
      colaPreguntas.value = colaPreguntas.value.slice(0, indicePreguntaActual.value + 1)
    }

    // Alertas y profundización
    if (opcion.esAlerta || (typeof opcion.valor === 'number' && opcion.valor <= 2)) {
      if (!alertaDetectadaEnSesion.value) {
        alertaDetectadaEnSesion.value = true
        listaAlertas.value.push(`Alerta en: ${preguntaActual.value.categoria || 'General'}`)
      }
      if (encuesta?.preguntasSeguimiento?.length) {
        encuesta.preguntasSeguimiento.forEach(seg => {
          if (!colaPreguntas.value.some(p => p.id === seg.id)) {
            colaPreguntas.value.splice(indicePreguntaActual.value + 1, 0, seg)
          }
        })
      }
    }
  }

  return {
    colaPreguntas,
    indicePreguntaActual,
    respuestasUsuario,
    respuestasAncladas,
    alertaDetectadaEnSesion,
    listaAlertas,
    preguntaActual,
    totalPreguntasCola,
    porcentajeProgreso,
    evaluarCondicionales,
    procesarSeleccionOpcion
  }
}
