<!--
  ============================================================================
  RESUMEN DE COMENTARIOS CON IA OLLAMA (ResumenComentariosOllama.vue)
  ============================================================================
  Sintetiza de forma automática con IA Ollama todos los comentarios libres
  dejados por los colaboradores en las preguntas evaluadas.
-->

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Sparkles, MessageSquareQuote, Bot, CheckCircle2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-vue-next'
import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'
import { extraerComentarioLibreValido } from '@/ia/menciones/filtroComentariosReales'

const props = defineProps<{
  respuestas?: RegistroRespuesta[]
}>()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const cargandoResumen = ref(false)
const verComentariosCompletos = ref(false)
const datosResumen = ref<{
  resumen: string
  puntosClave: string[]
  totalComentarios: number
  modeloSintesis: string
} | null>(null)

const comentariosExtraidos = computed(() => {
  const lista: Array<{ texto: string; pregunta?: string; calificacion?: number }> = []
  ;(props.respuestas || []).forEach(r => {
    ;(r.respuestas || []).forEach(item => {
      const rawTxt = extraerComentarioLibreValido(item)
      if (rawTxt.length > 3) {
        lista.push({
          texto: rawTxt,
          pregunta: item.textoPregunta || 'Pregunta Abierta de Evaluación',
          calificacion: item.valor
        })
      }
    })
  })
  return lista
})

const generarResumenConIA = async () => {
  if (comentariosExtraidos.value.length === 0) {
    datosResumen.value = null
    return
  }

  cargandoResumen.value = true
  try {
    const res = await fetch(`${API_URL}/ia/resumen-comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comentarios: comentariosExtraidos.value })
    })

    if (res.ok) {
      datosResumen.value = await res.json()
    }
  } catch (err) {
    console.warn('[ResumenComentariosOllama] Error al consultar IA:', err)
  } finally {
    cargandoResumen.value = false
  }
}

watch(() => comentariosExtraidos.value.length, () => {
  generarResumenConIA()
}, { immediate: true })

onMounted(() => {
  generarResumenConIA()
})
</script>

