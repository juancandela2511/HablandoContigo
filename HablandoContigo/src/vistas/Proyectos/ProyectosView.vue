<!--
  ============================================================================
  VISTA ESTUDIO DE PROYECTOS Y MODALIDADES EXCLUSIVAS (ProyectosView.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Orquesta las 2 modalidades exclusivas de gestión de encuestas:
  1. Modalidad Troncal de Clima Laboral:
     - Encuesta fija y editable con Asistente Virtual IA con voz hablada (TTS) y burbuja de opiniones.
  2. Modalidad de Encuestas Rápidas / Pulso del Día:
     - Lanzamiento exprés de 1 clic para chequear el estado diario del equipo ("¿Cómo están hoy?").
  3. Galería y Centro de Distribución:
     - Listado de encuestas, copiado de enlace anónimo, visualización y estadísticas.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useHighlight } from '@/Almacenes/useHighlight'
import { 
  Sparkles, 
  ArrowLeft, 
  Building2, 
  Zap, 
  LayoutGrid, 
  Volume2,
  Sliders
} from 'lucide-vue-next'

import ProyectosGaleria from '@/componentes/Proyectos/ProyectosGaleria.vue'
import ProyectosSelectorModalidades from '@/componentes/Proyectos/ProyectosSelectorModalidades.vue'
import ProyectosModoClimaFijo from '@/componentes/Proyectos/ProyectosModoClimaFijo.vue'
import ProyectosModoEncuestaRapida from '@/componentes/Proyectos/ProyectosModoEncuestaRapida.vue'
import ModalEnlacePublicado from '@/componentes/Proyectos/ModalEnlacePublicado.vue'

const router = useRouter()
const { usuarioActual } = useAuth()
const { elementoResaltadoId } = useHighlight()
const { 
  encuestas, 
  crearEncuesta, 
  editarEncuesta, 
  eliminarEncuesta, 
  vaciarEstadisticasEncuesta 
} = useEncuestas()

// Modos de vista: 'galeria' | 'selector' | 'clima_fijo' | 'encuesta_rapida'
const vistaActual = ref<'galeria' | 'selector' | 'clima_fijo' | 'encuesta_rapida'>('galeria')

// Encuesta específica en edición (si aplica)
const encuestaEditando = ref<any>(null)

// Modal de distribución y enlace publicado
const modalEnlaceAbierto = ref(false)
const encuestaPublicadaId = ref('')

// Encuesta troncal de clima laboral principal (la fija del sistema)
const encuestaClimaPrincipal = computed(() => {
  return encuestas.value.find(e => 
    e.id === 'enc-001' || 
    (e as any).tipo === 'clima' || 
    e.titulo.toLowerCase().includes('clima') ||
    e.titulo.toLowerCase().includes('diagnóstico')
  ) || encuestas.value[0] || null
})

/**
 * Abre el selector o entra directo a una modalidad
 */
const abrirSelector = () => {
  encuestaEditando.value = null
  vistaActual.value = 'selector'
}

/**
 * Maneja la elección entre las 2 modalidades exclusivas
 */
const manejarSeleccionModalidad = (modalidad: 'clima_fijo' | 'encuesta_rapida') => {
  if (modalidad === 'clima_fijo') {
    encuestaEditando.value = encuestaClimaPrincipal.value
    vistaActual.value = 'clima_fijo'
  } else {
    vistaActual.value = 'encuesta_rapida'
  }
}

/**
 * Guarda o actualiza la encuesta troncal de clima laboral
 */
const manejarGuardarClima = async (datos: any) => {
  const idExistente = encuestaEditando.value?.id || encuestaClimaPrincipal.value?.id

  if (idExistente) {
    const ok = await editarEncuesta(idExistente, {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      departamento: datos.departamento,
      preguntas: datos.preguntas,
      preguntasSeguimiento: datos.preguntasSeguimiento || []
    })

    if (ok) {
      encuestaPublicadaId.value = idExistente
      modalEnlaceAbierto.value = true
      vistaActual.value = 'galeria'
      encuestaEditando.value = null
    }
  } else {
    const creada = await crearEncuesta({
      titulo: datos.titulo || 'Diagnóstico Oficial de Clima Laboral',
      descripcion: datos.descripcion || 'Encuesta troncal fija y continua.',
      departamento: datos.departamento || 'General',
      creadoPor: usuarioActual.value?.nombre || 'Administrador',
      estado: 'Activa',
      preguntas: datos.preguntas,
      preguntasSeguimiento: datos.preguntasSeguimiento || []
    })

    if (creada) {
      encuestaPublicadaId.value = creada.id
      modalEnlaceAbierto.value = true
      vistaActual.value = 'galeria'
      encuestaEditando.value = null
    }
  }
}

/**
 * Lanza una encuesta rápida / pulso del día instantáneo
 */
const manejarLanzarRapida = async (datos: any) => {
  const creada = await crearEncuesta({
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    departamento: datos.departamento || 'General',
    creadoPor: usuarioActual.value?.nombre || 'Administrador',
    estado: 'Activa',
    preguntas: datos.preguntas,
    preguntasSeguimiento: []
  })

  if (creada) {
    encuestaPublicadaId.value = creada.id
    modalEnlaceAbierto.value = true
    vistaActual.value = 'galeria'
  }
}

/**
 * Edita cualquier encuesta existente desde la galería
 */
const manejarEditarEncuesta = (encuesta: any) => {
  encuestaEditando.value = encuesta
  vistaActual.value = 'clima_fijo'
}

/**
 * Copia el enlace anónimo de respuesta
 */
const copiarEnlace = (id: string) => {
  const url = `${window.location.origin}/responder/${id}`
  navigator.clipboard.writeText(url)
}

/**
 * Redirige al formulario interactivo anónimo
 */
const irAResponder = (id: string) => {
  router.push(`/responder/${id}`)
}

/**
 * Abre la vista de configuración en la pestaña de voz
 */
const irAAjustesVoz = () => {
  router.push('/configuracion')
}

/**
 * Vacía las respuestas y reinicia el acumulado
 */
const manejarVaciarEstadisticas = async (id: string) => {
  if (confirm('¿Deseas vaciar y reiniciar todas las respuestas registradas de esta encuesta? Esta acción limpiará la base de datos.')) {
    await vaciarEstadisticasEncuesta(id)
    alert('¡Respuestas y estadísticas de la encuesta vaciadas con éxito!')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 px-4 sm:px-6 md:pl-20 md:pr-8 py-6 md:py-8 relative font-['Poppins',sans-serif] transition-colors duration-300">
    
    <!-- Luces sutiles de fondo -->
    <div class="fixed top-10 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-10 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto space-y-8 relative z-10">
      
      <!-- Top Bar de Navegación -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Gestión Estratégica</span>
            <span class="text-slate-400 dark:text-slate-600">/</span>
            <span class="text-sky-600 dark:text-sky-400 font-semibold">
              {{ 
                vistaActual === 'galeria' ? 'Centro de Encuestas' :
                vistaActual === 'selector' ? 'Seleccionar Modalidad' :
                vistaActual === 'clima_fijo' ? 'Modalidad 1: Clima Laboral Fijo' :
                'Modalidad 2: Encuesta Rápida Diaria'
              }}
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Encuestas y Diagnósticos</span>
           
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gestiona la encuesta troncal de clima laboral con Asistente Asesor IA hablante o lanza encuestas rápidas para chequear el ánimo diario.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Botón cuando está en galería -->
          <button
            v-if="vistaActual === 'galeria'"
            @click="abrirSelector"
            class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles class="w-4 h-4 text-white animate-pulse" />
            <span>Gestionar / Lanzar Encuestas</span>
          </button>
          
          <!-- Botón para volver a la galería -->
          <button
            v-else
            @click="vistaActual = 'galeria'"
            class="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Volver a Mis Encuestas</span>
          </button>
        </div>
      </div>

      <!-- VISTA 1: GALERÍA Y LISTADO DE ENCUESTAS ACTIVAS -->
      <ProyectosGaleria
        v-if="vistaActual === 'galeria'"
        :encuestas="encuestas"
        :elementoResaltadoId="elementoResaltadoId"
        @crearNuevo="abrirSelector"
        @copiarEnlace="copiarEnlace"
        @irAResponder="irAResponder"
        @editarEncuesta="manejarEditarEncuesta"
        @eliminarEncuesta="eliminarEncuesta"
        @vaciarEstadisticas="manejarVaciarEstadisticas"
      />

      <!-- VISTA 2: SELECTOR DE LAS 2 MODALIDADES EXCLUSIVAS -->
      <div v-else-if="vistaActual === 'selector'" class="py-4 animate-fade-in">
        <ProyectosSelectorModalidades
          @seleccionarModalidad="manejarSeleccionModalidad"
        />
      </div>

      <!-- VISTA 3: MODALIDAD 1 - CLIMA LABORAL TRONCAL CON ASISTENTE PARLANTE -->
      <div v-else-if="vistaActual === 'clima_fijo'" class="animate-fade-in">
        <ProyectosModoClimaFijo
          :encuestaInicial="encuestaEditando || encuestaClimaPrincipal"
          @guardar="manejarGuardarClima"
          @volver="vistaActual = 'selector'"
          @abrirAjustesVoz="irAAjustesVoz"
        />
      </div>

      <!-- VISTA 4: MODALIDAD 2 - ENCUESTAS RÁPIDAS / PULSO DEL DÍA -->
      <div v-else-if="vistaActual === 'encuesta_rapida'" class="animate-fade-in">
        <ProyectosModoEncuestaRapida
          @lanzarEncuestaRapida="manejarLanzarRapida"
          @volver="vistaActual = 'selector'"
        />
      </div>

    </div>

    <!-- Modal de Enlace Publicado y Código QR -->
    <ModalEnlacePublicado
      :abierto="modalEnlaceAbierto"
      :encuestaId="encuestaPublicadaId"
      @cerrar="modalEnlaceAbierto = false"
      @irAResponder="irAResponder"
    />

  </div>
</template>
