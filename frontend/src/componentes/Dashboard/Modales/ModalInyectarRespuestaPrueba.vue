<!--
  ============================================================================
  MODAL DE INYECCIÓN DE PRUEBAS POR MÓDULO Y PREGUNTA (ModalInyectarRespuestaPrueba.vue)
  ============================================================================
  Permite al administrador seleccionar el módulo específico (Bloque de Estudio,
  Antigüedad, Clima Laboral o Alerta de Convivencia), elegir la pregunta y opción
  deseada, e inyectar el dato real de prueba directamente en Supabase.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  X, 
  Sparkles, 
  GraduationCap, 
  Clock, 
  Heart, 
  AlertTriangle, 
  Building2, 
  Send,
  CheckCircle2
} from 'lucide-vue-next'
import { PROGRAMAS_ESTUDIO_DISPONIBLES } from '@/Almacenes/useCuentas'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useToast } from '@/Almacenes/useToast'

const props = defineProps<{
  abierto: boolean
  departamentosDisponibles: string[]
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'inyectado'): void
}>()

const { inyectarRespuestaPersonalizada, encuestas } = useEncuestas()
const { mostrarExito, mostrarError } = useToast()

const moduloSeleccionado = ref<'antiguedad' | 'clima' | 'alertas'>('antiguedad')
const departamentoFiltro = ref('Tecnología & Soporte TI')

// Formulario reactivo según módulo
const programaEstudioSeleccionado = ref<string>(PROGRAMAS_ESTUDIO_DISPONIBLES[0] || 'Ingeniería de Software / Sistemas')
const antiguedadSeleccionada = ref<string>('De 1 a 3 años')
const puntajeClima = ref<number>(5)
const mensajeAlerta = ref<string>('Reporte de prueba sobre ambiente laboral.')
const categoriaAlerta = ref<string>('Convivencia Laboral')
const guardando = ref(false)

const opcionesAntiguedad = [
  'Menos de 6 meses',
  'De 6 meses a 1 año',
  'De 1 a 3 años',
  'Más de 3 años'
]

const ejecutarInyeccion = async () => {
  guardando.value = true
  try {
    let idPregunta = ''
    let textoPregunta = ''
    let respuestaTexto = ''
    let valorNumerico = 4
    let esAlerta = false
    let categoria = 'General'

    if (moduloSeleccionado.value === 'antiguedad') {
      idPregunta = 'b1-p1-antiguedad'
      textoPregunta = '¿Cuál es tu antigüedad laborando en la empresa?'
      respuestaTexto = antiguedadSeleccionada.value
      valorNumerico = antiguedadSeleccionada.value === 'Más de 3 años' ? 5 : 4
      categoria = 'Antigüedad y Permanencia'
    } else if (moduloSeleccionado.value === 'clima') {
      idPregunta = 'clima-p1-general'
      textoPregunta = '¿Cómo evalúas el clima y ambiente laboral en tu área?'
      respuestaTexto = puntajeClima.value >= 4 ? 'Excelente ambiente' : puntajeClima.value === 3 ? 'Neutral' : 'Requiere mejoras'
      valorNumerico = puntajeClima.value
      categoria = 'Clima Laboral'
    } else if (moduloSeleccionado.value === 'alertas') {
      idPregunta = 'alerta-p1-convivencia'
      textoPregunta = '¿Has presenciado o experimentado situaciones de acoso o mala convivencia?'
      respuestaTexto = mensajeAlerta.value || 'Situación de riesgo reportada'
      valorNumerico = 1
      esAlerta = true
      categoria = categoriaAlerta.value
    }

    const exito = await inyectarRespuestaPersonalizada({
      idEncuesta: encuestas.value[0]?.id || 'enc-001',
      idPregunta,
      textoPregunta,
      categoria,
      respuestaTexto,
      valorNumerico,
      esAlerta,
      comentario: respuestaTexto
    })

    if (exito) {
      emit('inyectado')
      emit('cerrar')
    }
  } catch (err: any) {
    mostrarError('Error de inyección', err?.message || 'No se pudo guardar la prueba.')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="abierto"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-fade-in font-['Poppins',sans-serif]"
      @click.self="emit('cerrar')"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 text-left">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white">
                Inyección de Pruebas por Módulo
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Selecciona la sección y la pregunta exacta para inyectar un dato real en Supabase.
              </p>
            </div>
          </div>
          <button 
            @click="emit('cerrar')"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Selector de Módulo -->
        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Selecciona el Módulo a Probar
          </label>
          <div class="grid grid-cols-3 gap-2">

            <button
              type="button"
              @click="moduloSeleccionado = 'antiguedad'"
              :class="[
                'p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-left',
                moduloSeleccionado === 'antiguedad'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              <Clock class="w-4 h-4 shrink-0 text-indigo-500" />
              <span>Antigüedad & Retención</span>
            </button>

            <button
              type="button"
              @click="moduloSeleccionado = 'clima'"
              :class="[
                'p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-left',
                moduloSeleccionado === 'clima'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              <Heart class="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Clima Laboral</span>
            </button>

            <button
              type="button"
              @click="moduloSeleccionado = 'alertas'"
              :class="[
                'p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-left',
                moduloSeleccionado === 'alertas'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              <AlertTriangle class="w-4 h-4 shrink-0 text-rose-500" />
              <span>Alerta Convivencia</span>
            </button>
          </div>
        </div>

        <!-- Formulario Dinámico de Pregunta y Valor -->
        <div class="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          <!-- Departamento -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 class="w-3.5 h-3.5 text-slate-400" />
              <span>Departamento Asignado:</span>
            </label>
            <select
              v-model="departamentoFiltro"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option v-for="dep in departamentosDisponibles" :key="dep" :value="dep">
                {{ dep }}
              </option>
            </select>
          </div>

          <!-- MÓDULO ANTIGÜEDAD -->
          <div v-if="moduloSeleccionado === 'antiguedad'" class="space-y-2">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rango de Antigüedad a Inyectar:
            </label>
            <select
              v-model="antiguedadSeleccionada"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option v-for="opt in opcionesAntiguedad" :key="opt" :value="opt">
                ⏳ {{ opt }}
              </option>
            </select>
          </div>

          <!-- MÓDULO CLIMA -->
          <div v-else-if="moduloSeleccionado === 'clima'" class="space-y-2">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Puntaje de Clima Laboral (1 al 5):
            </label>
            <div class="flex items-center gap-2">
              <button
                v-for="pts in [1, 2, 3, 4, 5]"
                :key="pts"
                type="button"
                @click="puntajeClima = pts"
                :class="[
                  'flex-1 py-2.5 rounded-xl border font-mono font-bold text-sm transition-all',
                  puntajeClima === pts
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                ]"
              >
                {{ pts }} ★
              </button>
            </div>
          </div>

          <!-- MÓDULO ALERTAS -->
          <div v-else-if="moduloSeleccionado === 'alertas'" class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Categoría de la Alerta:
              </label>
              <select
                v-model="categoriaAlerta"
                class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="Convivencia Laboral">Convivencia Laboral</option>
                <option value="Acoso Laboral / Hostigamiento">Acoso Laboral / Hostigamiento</option>
                <option value="Sobrecarga / Burnout">Sobrecarga / Burnout</option>
                <option value="Falta de Recursos">Falta de Recursos</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mensaje de la Alerta:
              </label>
              <textarea
                v-model="mensajeAlerta"
                rows="2"
                class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Describe la situación de prueba..."
              />
            </div>
          </div>

        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="emit('cerrar')"
            class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            @click="ejecutarInyeccion"
            :disabled="guardando"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Send v-if="!guardando" class="w-4 h-4" />
            <span>{{ guardando ? 'Guardando en Supabase...' : 'Inyectar Registro Real' }}</span>
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>
