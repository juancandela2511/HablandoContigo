<!--
  ============================================================================
  VISTA ESTUDIO DE PROYECTOS Y GENERADOR CON IA (ProyectosView.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Orquestador de campañas de encuestas y estudio de IA:
  - Top Bar con navegación y botón de creación de proyecto.
  - Galería de encuestas creadas (`ProyectosGaleria.vue`).
  - Paso 1 del creador asistido con IA (`ProyectosCreadorPasoPrompt.vue`).
  - Paso 2 del editor y balanceo de preguntas (`ProyectosCreadorPasoEditor.vue`).
  - Modal de distribución y enlace anónimo copiable (`ModalEnlacePublicado.vue`).
  
  ¿PARA QUÉ SIRVE?
  - Ofrecer una interfaz ágil, modular y libre de código monolítico para crear diagnósticos de clima.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useAuth.ts, useEncuestas.ts, useHighlight.ts, iaEncuestasService.ts.
  - Subcomponentes en `src/componentes/Proyectos/`.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useHighlight } from '@/Almacenes/useHighlight'
import { 
  generarEncuestaConIA, 
  optimizarEncuestaBaseConIA, 
  type PreguntaEncuesta 
} from '@/Servicios/iaEncuestasService'
import { Sparkles } from 'lucide-vue-next'

import ProyectosGaleria from '@/componentes/Proyectos/ProyectosGaleria.vue'
import ProyectosCreadorPasoPrompt from '@/componentes/Proyectos/ProyectosCreadorPasoPrompt.vue'
import ProyectosCreadorPasoEditor from '@/componentes/Proyectos/ProyectosCreadorPasoEditor.vue'
import ModalEnlacePublicado from '@/componentes/Proyectos/ModalEnlacePublicado.vue'

const router = useRouter()
const { usuarioActual } = useAuth()
const { elementoResaltadoId } = useHighlight()
const { encuestas, crearEncuesta, editarEncuesta, eliminarEncuesta, vaciarEstadisticasEncuesta } = useEncuestas()

// Modos de vista: 'lista' | 'crear'
const vistaActual = ref<'lista' | 'crear'>('lista')

// Modo edición de encuesta existente
const modoEdicion = ref(false)
const idEncuestaEditando = ref('')

// Modo de creación: 'prompt' (nueva con IA) | 'refinar_base' (optimizar borrador del usuario)
const modoCreacion = ref<'prompt' | 'refinar_base'>('prompt')

// Estado del Generador con IA
const promptContexto = ref('')
const departamentoSeleccionado = ref('Operaciones y Contact Center')
const extensionSeleccionada = ref<'rapida' | 'estandar' | 'extensa'>('estandar')
const generacionEnProgreso = ref(false)
const pasoCreacion = ref<1 | 2>(1)

// Datos de la encuesta en edición
const tituloEncuesta = ref('')
const descripcionEncuesta = ref('')
const preguntasGeneradas = ref<PreguntaEncuesta[]>([])
const preguntasSeguimiento = ref<PreguntaEncuesta[]>([])

// Modal de éxito
const modalEnlaceAbierto = ref(false)
const encuestaPublicadaId = ref('')

const sugerenciasPrompt = computed(() => {
  if (modoCreacion.value === 'refinar_base') {
    return [
      '1. ¿Cómo te la llevas con tu jefe? 2. ¿Sientes que tus líderes te escuchan? 3. ¿Existe acoso en tu equipo? 4. ¿La carga de trabajo es excesiva?',
      '1. ¿Qué tal es la comunicación con la gerencia? 2. ¿Has presenciado tratos humillantes o favoritismo? 3. ¿Recomendarías trabajar aquí?',
      '1. ¿Tu jefe directo te trata con respeto? 2. ¿Cuentas con las herramientas de trabajo necesarias? 3. ¿Qué sugerencias tienes para la operación?'
    ]
  }
  return [
    'Evaluar convivencia, liderazgo de supervisores y detectar posibles situaciones de acoso laboral.',
    'Diagnóstico de sobrecarga de tareas, estrés operativo y ambiente de compañerismo en turno tarde.',
    'Medir seguridad psicológica para proponer ideas y calidad de retroalimentación de directivos.'
  ]
})

const iniciarEdicionEncuesta = (encuesta: any) => {
  modoEdicion.value = true
  idEncuestaEditando.value = encuesta.id
  tituloEncuesta.value = encuesta.titulo || ''
  descripcionEncuesta.value = encuesta.descripcion || ''
  departamentoSeleccionado.value = encuesta.departamento || 'General'
  preguntasGeneradas.value = JSON.parse(JSON.stringify(encuesta.preguntas || []))
  preguntasSeguimiento.value = JSON.parse(JSON.stringify(encuesta.preguntasSeguimiento || []))
  
  vistaActual.value = 'crear'
  pasoCreacion.value = 2
}

const iniciarGeneracionIA = async () => {
  modoEdicion.value = false
  idEncuestaEditando.value = ''
  if (!promptContexto.value.trim()) {
    alert(modoCreacion.value === 'refinar_base' 
      ? 'Por favor escribe o pega el borrador de preguntas de tu encuesta base.' 
      : 'Por favor escribe una breve descripción de la encuesta que deseas crear.')
    return
  }

  generacionEnProgreso.value = true
  try {
    let resultado
    if (modoCreacion.value === 'refinar_base') {
      resultado = await optimizarEncuestaBaseConIA(
        promptContexto.value,
        departamentoSeleccionado.value
      )
    } else {
      resultado = await generarEncuestaConIA(
        promptContexto.value, 
        departamentoSeleccionado.value,
        extensionSeleccionada.value
      )
    }
    tituloEncuesta.value = resultado.titulo
    descripcionEncuesta.value = resultado.descripcion
    preguntasGeneradas.value = resultado.preguntas
    preguntasSeguimiento.value = resultado.preguntasSeguimiento
    pasoCreacion.value = 2
  } catch (error) {
    console.error('Error procesando encuesta:', error)
  } finally {
    generacionEnProgreso.value = false
  }
}

const iniciarCreacionManual = () => {
  modoEdicion.value = false
  idEncuestaEditando.value = ''
  tituloEncuesta.value = 'Nueva Encuesta de Diagnóstico Laboral'
  descripcionEncuesta.value = 'Cuestionario estructurado manualmente para evaluar la convivencia, bienestar y condiciones laborales.'
  departamentoSeleccionado.value = 'General'
  preguntasGeneradas.value = [
    {
      id: `p-man-${Date.now().toString().slice(-4)}-1`,
      categoria: 'Liderazgo & Convivencia',
      texto: '¿Sientes que existe un trato respetuoso, constructivo y libre de favoritismos en tu equipo?',
      tipo: 'escala',
      esRelleno: false,
      esSensibleAcoso: false,
      opciones: [
        { id: 'opt-1', texto: '1 - Total desacuerdo (Ambiente tenso)', valor: 1, esAlerta: true },
        { id: 'opt-2', texto: '2 - En desacuerdo', valor: 2, esAlerta: false },
        { id: 'opt-3', texto: '3 - Regular / Neutral', valor: 3, esAlerta: false },
        { id: 'opt-4', texto: '4 - De acuerdo (Buen trato)', valor: 4, esAlerta: false },
        { id: 'opt-5', texto: '5 - Totalmente de acuerdo (Excelente respeto)', valor: 5, esAlerta: false }
      ]
    },
    {
      id: `p-man-${Date.now().toString().slice(-4)}-2`,
      categoria: 'Carga de Trabajo & Bienestar',
      texto: '¿Consideras equilibrada tu carga diaria de tareas para prevenir el agotamiento extremo?',
      tipo: 'escala',
      esRelleno: false,
      esSensibleAcoso: false,
      opciones: [
        { id: 'opt-21', texto: '1 - Sobrecarga extrema', valor: 1, esAlerta: true },
        { id: 'opt-22', texto: '2 - Carga pesada', valor: 2, esAlerta: false },
        { id: 'opt-23', texto: '3 - Manejable', valor: 3, esAlerta: false },
        { id: 'opt-24', texto: '4 - Adecuada', valor: 4, esAlerta: false },
        { id: 'opt-25', texto: '5 - Óptima', valor: 5, esAlerta: false }
      ]
    }
  ]
  preguntasSeguimiento.value = [
    {
      id: `deep-${Date.now().toString().slice(-4)}`,
      categoria: 'Espacio Abierto Confidencial',
      texto: '¿Qué sugerencia o aspecto concreto propondrías para mejorar tu bienestar en el trabajo?',
      tipo: 'texto',
      opciones: []
    }
  ]
  vistaActual.value = 'crear'
  pasoCreacion.value = 2
}

const agregarPreguntaManual = () => {
  const nueva: PreguntaEncuesta = {
    id: `p-custom-${Date.now().toString().slice(-4)}`,
    categoria: 'Clima General',
    texto: '¿Cómo te sientes en relación con este aspecto en tu día a día laboral?',
    tipo: 'escala',
    esRelleno: false,
    esSensibleAcoso: false,
    opciones: [
      { id: 'opt-1', texto: '1 - Muy bajo / Malestar', valor: 1, esAlerta: false },
      { id: 'opt-2', texto: '2 - Regular / Insuficiente', valor: 2, esAlerta: false },
      { id: 'opt-3', texto: '3 - Aceptable', valor: 3, esAlerta: false },
      { id: 'opt-4', texto: '4 - Bueno y motivador', valor: 4, esAlerta: false },
      { id: 'opt-5', texto: '5 - Excelente / Plena satisfacción', valor: 5, esAlerta: false }
    ]
  }
  preguntasGeneradas.value.push(nueva)
}

const eliminarPregunta = (id: string) => {
  preguntasGeneradas.value = preguntasGeneradas.value.filter(p => p.id !== id)
}

const publicarEncuesta = async () => {
  if (preguntasGeneradas.value.length === 0) {
    alert('La encuesta debe contener al menos una pregunta.')
    return
  }

  if (modoEdicion.value && idEncuestaEditando.value) {
    const ok = await editarEncuesta(idEncuestaEditando.value, {
      titulo: tituloEncuesta.value,
      descripcion: descripcionEncuesta.value,
      departamento: departamentoSeleccionado.value,
      preguntas: preguntasGeneradas.value,
      preguntasSeguimiento: preguntasSeguimiento.value
    })

    if (ok) {
      vistaActual.value = 'lista'
      modoEdicion.value = false
      idEncuestaEditando.value = ''
      pasoCreacion.value = 1
    }
    return
  }

  const creada = await crearEncuesta({
    titulo: tituloEncuesta.value || 'Encuesta de Clima Laboral',
    descripcion: descripcionEncuesta.value || 'Evaluación anónima de clima.',
    departamento: departamentoSeleccionado.value,
    creadoPor: usuarioActual.value?.nombre || 'Administrador',
    estado: 'Activa',
    preguntas: preguntasGeneradas.value,
    preguntasSeguimiento: preguntasSeguimiento.value
  })

  // Si creada es null, Supabase falló y ya se mostró el toast de error
  if (!creada) return

  encuestaPublicadaId.value = creada.id
  modalEnlaceAbierto.value = true
  vistaActual.value = 'lista'
  pasoCreacion.value = 1
  promptContexto.value = ''
}

const copiarEnlace = (id: string) => {
  const url = `${window.location.origin}/responder/${id}`
  navigator.clipboard.writeText(url)
}

const irAResponder = (id: string) => {
  router.push(`/responder/${id}`)
}

const manejarVaciarEstadisticas = async (id: string) => {
  if (confirm('¿Deseas vaciar y reiniciar todas las respuestas registradas de esta encuesta? Esta acción limpiará la base de datos.')) {
    await vaciarEstadisticasEncuesta(id)
    alert('¡Respuestas y estadísticas de la encuesta vaciadas con éxito!')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 pl-14 sm:pl-16 pr-4 sm:pr-8 py-8 relative font-['Poppins',sans-serif] transition-colors duration-300">
    
    <!-- Luces sutiles de fondo -->
    <div class="fixed top-10 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-10 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto space-y-8 relative z-10">
      
      <!-- Top Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Gestión Estratégica</span>
            <span class="text-slate-400 dark:text-slate-600">/</span>
            <span class="text-sky-600 dark:text-sky-400 font-semibold">Proyectos de Clima con IA</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Proyectos de Encuestas</span>
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-sky-400">
              Generador IA Inteligente
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Crea campañas de clima laboral con generación automática de preguntas, filtros adaptativos y detección de alertas de acoso.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="vistaActual === 'lista'"
            @click="vistaActual = 'crear'; pasoCreacion = 1"
            class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles class="w-4 h-4 text-white animate-pulse" />
            <span>Crear Proyecto con IA</span>
          </button>
          
          <button
            v-else
            @click="vistaActual = 'lista'"
            class="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Volver a Proyectos
          </button>
        </div>
      </div>

      <!-- VISTA 1: LISTADO DE PROYECTOS (Componente Modular) -->
      <ProyectosGaleria
        v-if="vistaActual === 'lista'"
        :encuestas="encuestas"
        :elementoResaltadoId="elementoResaltadoId"
        @crearNuevo="vistaActual = 'crear'; modoEdicion = false; pasoCreacion = 1"
        @copiarEnlace="copiarEnlace"
        @irAResponder="irAResponder"
        @editarEncuesta="iniciarEdicionEncuesta"
        @eliminarEncuesta="eliminarEncuesta"
        @vaciarEstadisticas="manejarVaciarEstadisticas"
      />

      <!-- VISTA 2: ESTUDIO DE CREACIÓN / EDICIÓN (Componentes Modulares) -->
      <div v-else class="space-y-6 max-w-4xl mx-auto">
        
        <!-- PASO 1: Prompt y Descripción (Solo al crear nueva) -->
        <ProyectosCreadorPasoPrompt
          v-if="pasoCreacion === 1"
          v-model:departamentoSeleccionado="departamentoSeleccionado"
          v-model:promptContexto="promptContexto"
          v-model:extensionSeleccionada="extensionSeleccionada"
          v-model:modoCreacion="modoCreacion"
          :generacionEnProgreso="generacionEnProgreso"
          :sugerenciasPrompt="sugerenciasPrompt"
          @aplicarSugerencia="promptContexto = $event"
          @iniciarGeneracion="iniciarGeneracionIA"
          @crearManual="iniciarCreacionManual"
        />

        <!-- PASO 2: Editor y Ajuste de Preguntas -->
        <ProyectosCreadorPasoEditor
          v-else
          v-model:tituloEncuesta="tituloEncuesta"
          v-model:descripcionEncuesta="descripcionEncuesta"
          :preguntasGeneradas="preguntasGeneradas"
          :preguntasSeguimiento="preguntasSeguimiento"
          :esModoEdicion="modoEdicion"
          @volverAlPrompt="modoEdicion ? vistaActual = 'lista' : pasoCreacion = 1"
          @agregarPregunta="agregarPreguntaManual"
          @eliminarPregunta="eliminarPregunta"
          @publicarEncuesta="publicarEncuesta"
        />

      </div>

    </div>

    <!-- Modal de Enlace Publicado -->
    <ModalEnlacePublicado
      :abierto="modalEnlaceAbierto"
      :encuestaId="encuestaPublicadaId"
      @cerrar="modalEnlaceAbierto = false"
      @irAResponder="irAResponder"
    />

  </div>
</template>
