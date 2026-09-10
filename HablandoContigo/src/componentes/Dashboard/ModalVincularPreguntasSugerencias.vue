<!--
  ============================================================================
  COMPONENTE MODAL VINCULADOR DE PREGUNTAS A SUGERENCIAS (ModalVincularPreguntasSugerencias.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Permite al administrador asociar preguntas de las encuestas a las 4 dimensiones
  estratégicas de Sugerencias Organizacionales (Procesos & Tecnología, Infraestructura,
  Salario & Beneficios, Clima & Reconocimiento).
  
  Incluye el botón '✨ Auto-Vincular Preguntas con IA' para clasificar automáticamente
  todas las preguntas y eliminar por completo la carga operativa manual.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  useSugerenciasOrganizacionales,
  type CategoriaSugerenciaConfig 
} from '@/Almacenes/useSugerenciasOrganizacionales'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { 
  Sparkles, 
  Search, 
  Check, 
  RotateCcw, 
  Link2, 
  Unlink, 
  Cpu, 
  Building2, 
  DollarSign, 
  Smile, 
  Info,
  CheckCircle2,
  ListFilter
} from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const {
  categoriasConfig,
  todasLasPreguntasDisponibles,
  totalPreguntasVinculadas,
  toggleVinculacion,
  actualizarCategoria,
  autoVincularPreguntasIA,
  restablecerValoresPorDefecto
} = useSugerenciasOrganizacionales()

// Estado local
const idCategoriaActiva = ref<string>('cat-procesos-tecnologia')
const textoBusqueda = ref('')
const filtroEstado = ref<'todas' | 'vinculadas' | 'no_vinculadas'>('todas')
const editandoPlan = ref(false)
const planTemporal = ref('')

// Categoría seleccionada actualmente
const categoriaActual = computed<CategoriaSugerenciaConfig | undefined>(() => {
  return categoriasConfig.value.find(c => c.id === idCategoriaActiva.value) || categoriasConfig.value[0]
})

// Mapeo de iconos
const mapaIconos: Record<string, any> = {
  Cpu,
  Building2,
  DollarSign,
  Smile
}

// Iniciar edición del plan de acción
const iniciarEdicionPlan = () => {
  if (categoriaActual.value) {
    planTemporal.value = categoriaActual.value.accionSugerida || ''
    editandoPlan.value = true
  }
}

// Guardar edición del plan de acción
const guardarPlan = () => {
  if (categoriaActual.value) {
    actualizarCategoria(categoriaActual.value.id, {
      accionSugerida: planTemporal.value.trim()
    })
    editandoPlan.value = false
  }
}

// Lista filtrada de preguntas para la categoría actual
const preguntasFiltradas = computed(() => {
  const q = textoBusqueda.value.toLowerCase().trim()
  const cat = categoriaActual.value
  const idsVinculados = cat?.preguntasIds || []

  return todasLasPreguntasDisponibles.value.filter(preg => {
    // Filtro de texto
    const coincideTexto = !q || 
      preg.texto.toLowerCase().includes(q) || 
      (preg.categoria && preg.categoria.toLowerCase().includes(q)) ||
      (preg.tipo && preg.tipo.toLowerCase().includes(q))

    if (!coincideTexto) return false

    const estaVinculada = idsVinculados.includes(preg.id)

    if (filtroEstado.value === 'vinculadas') {
      return estaVinculada
    }
    if (filtroEstado.value === 'no_vinculadas') {
      return !estaVinculada
    }

    return true
  })
})

// Saber a qué otras categorías está vinculada una pregunta
const obtenerOtrasCategorias = (idPregunta: string, idCatExcluida: string) => {
  return categoriasConfig.value.filter(c => c.id !== idCatExcluida && c.preguntasIds?.includes(idPregunta))
}

// Ejecutar auto-vinculación con IA
const ejecutarAutoVinculacion = () => {
  autoVincularPreguntasIA()
}
</script>

<template>
  <ModalBase
    :abierto="abierto"
    anchoMaximo="4xl"
    titulo="Vincular Preguntas a Sugerencias (IA)"
    subtitulo="Conecta preguntas de tus encuestas a los 4 focos de sugerencias organizacionales para automatizar métricas y planes."
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
        <Sparkles class="w-5 h-5" />
      </div>
    </template>

    <div class="space-y-5">
      <!-- 1. BANNER ACCIÓN RÁPIDA IA -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-purple-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
              Automatización IA
            </span>
            <span class="text-xs font-bold text-slate-800 dark:text-white">
              Cero Carga Operativa
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300">
            El motor semántico analiza el contenido de tus encuestas y vincula las preguntas a las 4 dimensiones en 1 clic.
          </p>
        </div>

        <button
          type="button"
          @click="ejecutarAutoVinculacion"
          class="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Sparkles class="w-4 h-4" />
          <span>✨ Auto-Vincular con IA</span>
        </button>
      </div>

      <!-- 2. PESTAÑAS DE CATEGORÍAS -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          v-for="cat in categoriasConfig"
          :key="cat.id"
          type="button"
          @click="idCategoriaActiva = cat.id"
          :class="[
            'p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between',
            idCategoriaActiva === cat.id
              ? 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-500 shadow-md ring-2 ring-offset-1 ring-slate-400/40 dark:ring-slate-500/40'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400'
          ]"
        >
          <!-- Barra indicadora lateral -->
          <div 
            class="absolute top-0 left-0 bottom-0 w-1.5"
            :style="{ backgroundColor: cat.color }"
          ></div>

          <div class="flex items-center justify-between mb-2">
            <component 
              :is="mapaIconos[cat.icono] || Cpu" 
              class="w-4 h-4"
              :style="{ color: cat.color }"
            />
            <span 
              class="text-[11px] font-black px-2 py-0.5 rounded-full"
              :style="{ 
                backgroundColor: `${cat.color}20`, 
                color: cat.color 
              }"
            >
              {{ cat.preguntasIds?.length || 0 }} vinculadas
            </span>
          </div>

          <span class="text-xs font-bold text-slate-900 dark:text-white truncate">
            {{ cat.nombre }}
          </span>
        </button>
      </div>

      <!-- 3. CONFIGURACIÓN DEL PLAN DE ACCIÓN DE LA CATEGORÍA -->
      <div 
        v-if="categoriaActual"
        class="p-4 rounded-2xl border bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 space-y-2.5"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div 
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: categoriaActual.color }"
            ></div>
            <span class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Plan Estratégico Sugerido para: <span class="text-slate-900 dark:text-white font-bold">{{ categoriaActual.nombre }}</span>
            </span>
          </div>

          <button
            v-if="!editandoPlan"
            type="button"
            @click="iniciarEdicionPlan"
            class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
          >
            Editar Plan
          </button>
        </div>

        <div v-if="editandoPlan" class="space-y-2">
          <textarea
            v-model="planTemporal"
            rows="2"
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            placeholder="Escribe la recomendación de acción organizacional que sugerirá la IA..."
          ></textarea>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="editandoPlan = false"
              class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="guardarPlan"
              class="px-3 py-1 text-xs rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </div>

        <div v-else class="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <span class="font-bold shrink-0">💡 Recomendación:</span>
          <span>{{ categoriaActual.accionSugerida }}</span>
        </div>
      </div>

      <!-- 4. BARRA DE BÚSQUEDA Y FILTROS -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="relative w-full sm:w-80">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="textoBusqueda"
            type="text"
            placeholder="Buscar por enunciado, tipo o categoría..."
            class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div class="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            @click="filtroEstado = 'todas'"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
              filtroEstado === 'todas'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            Todas ({{ todasLasPreguntasDisponibles.length }})
          </button>
          <button
            type="button"
            @click="filtroEstado = 'vinculadas'"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
              filtroEstado === 'vinculadas'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            Vinculadas ({{ categoriaActual?.preguntasIds?.length || 0 }})
          </button>
          <button
            type="button"
            @click="filtroEstado = 'no_vinculadas'"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
              filtroEstado === 'no_vinculadas'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            No vinculadas
          </button>
        </div>
      </div>

      <!-- 5. LISTADO DE PREGUNTAS -->
      <div class="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        <div 
          v-if="preguntasFiltradas.length === 0"
          class="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2 text-slate-400"
        >
          <Info class="w-8 h-8 mx-auto opacity-40" />
          <p class="text-xs">No se encontraron preguntas que coincidan con los filtros.</p>
        </div>

        <div
          v-for="preg in preguntasFiltradas"
          :key="preg.id"
          @click="categoriaActual && toggleVinculacion(categoriaActual.id, preg.id)"
          :class="[
            'p-3 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 group',
            categoriaActual?.preguntasIds?.includes(preg.id)
              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
              : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
        >
          <div class="flex items-start gap-3 min-w-0">
            <!-- Casilla de verificación animada -->
            <div 
              :class="[
                'w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center shrink-0 transition-colors',
                categoriaActual?.preguntasIds?.includes(preg.id)
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'border-slate-300 dark:border-slate-700 group-hover:border-slate-400'
              ]"
            >
              <Check 
                v-if="categoriaActual?.preguntasIds?.includes(preg.id)"
                class="w-3.5 h-3.5 stroke-[3]"
              />
            </div>

            <!-- Datos de la pregunta -->
            <div class="min-w-0 space-y-1">
              <p class="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                {{ preg.texto }}
              </p>
              <div class="flex items-center gap-2 flex-wrap">
                <span 
                  v-if="preg.categoria"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  {{ preg.categoria }}
                </span>
                <span 
                  class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize"
                >
                  Tipo: {{ preg.tipo }}
                </span>

                <!-- Muestra si está vinculada a otras categorías también -->
                <span 
                  v-for="otra in obtenerOtrasCategorias(preg.id, categoriaActual?.id || '')" 
                  :key="otra.id"
                  class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  :style="{ backgroundColor: `${otra.color}15`, color: otra.color }"
                >
                  🔗 También en {{ otra.nombre }}
                </span>
              </div>
            </div>
          </div>

          <!-- Botón de estado -->
          <div class="shrink-0 flex items-center gap-2">
            <span 
              v-if="categoriaActual?.preguntasIds?.includes(preg.id)"
              class="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>Vinculada</span>
            </span>
            <span 
              v-else
              class="text-[11px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Clic para vincular
            </span>
          </div>
        </div>
      </div>
    </div>

    <template #pie>
      <div class="w-full flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          @click="restablecerValoresPorDefecto"
          class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restablecer por Defecto</span>
        </button>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 dark:text-slate-400 mr-2">
            <strong class="text-slate-800 dark:text-slate-200">{{ totalPreguntasVinculadas }}</strong> preguntas vinculadas
          </span>
          <button
            type="button"
            @click="emit('cerrar')"
            class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Listo / Aplicar
          </button>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
