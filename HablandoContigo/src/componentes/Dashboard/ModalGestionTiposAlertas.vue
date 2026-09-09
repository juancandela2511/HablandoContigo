<!--
  ============================================================================
  MODAL DE GESTIÓN Y CALIBRACIÓN DE ALERTAS CON IA (ModalGestionTiposAlertas.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useTiposAlertas,
  type NivelAlerta,
  type ModoEnfoqueAlerta,
  type SeveridadAlerta
} from '@/Almacenes/useTiposAlertas'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { AlertTriangle, RotateCcw, Plus, ShieldAlert } from 'lucide-vue-next'
import FormularioCrearAlerta from './Modales/GestionTiposAlertas/FormularioCrearAlerta.vue'
import ListaTiposAlertas from './Modales/GestionTiposAlertas/ListaTiposAlertas.vue'

defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const {
  tiposAlertas,
  crearTipoAlerta,
  editarTipoAlerta,
  eliminarTipoAlerta,
  toggleActiva,
  restablecerValoresPorDefecto,
  obtenerClaseColorNivel
} = useTiposAlertas()

const mostrandoFormularioCrear = ref(false)

const procesarCrearAlerta = (datos: {
  nombre: string
  descripcion: string
  nivel: NivelAlerta
  modoEnfoque: ModoEnfoqueAlerta
  enfoqueDetalle: string
  palabrasClave?: string[]
  protocoloAccion: string
  icono?: string
  color?: string
}) => {
  crearTipoAlerta(datos)
  mostrandoFormularioCrear.value = false
}

const procesarEdicionAlerta = (datos: {
  id: string
  nombre: string
  descripcion: string
  palabrasClave: string[]
  icono?: string
  color?: string
  nivel?: NivelAlerta
}) => {
  editarTipoAlerta(datos.id, datos)
}

const procesarEliminarAlerta = (id: string) => {
  eliminarTipoAlerta(id)
}
</script>

<template>
  <ModalBase
    :abierto="abierto"
    titulo="Calibración y Catálogo de Alertas de IA"
    subtitulo="Crea, edita o elimina alertas personalizadas, asigna íconos, colores y palabras clave para que la IA encasille las respuestas."
    anchoMaximo="4xl"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
        <AlertTriangle class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="alerta" tamano="sm">
        {{ tiposAlertas.length }} ALERTAS CONFIGURADAS
      </InsigniaPill>
    </template>

    <div class="space-y-4 text-left">
      <!-- Botón para mostrar Formulario de Creación -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ShieldAlert class="w-4 h-4 text-rose-500" />
          <span>Gestión de Criterios y Alertas</span>
        </span>
        <button
          type="button"
          @click="mostrandoFormularioCrear = !mostrandoFormularioCrear"
          class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>{{ mostrandoFormularioCrear ? 'Ocultar Formulario' : '+ Crear Nueva Alerta' }}</span>
        </button>
      </div>

      <!-- Formulario de Creación de Alerta -->
      <FormularioCrearAlerta
        v-if="mostrandoFormularioCrear"
        @guardar="procesarCrearAlerta"
        @cancelar="mostrandoFormularioCrear = false"
      />

      <!-- Lista de Alertas -->
      <ListaTiposAlertas
        :tiposAlertas="tiposAlertas"
        :tiposFiltrados="tiposAlertas"
        :obtenerClaseColorNivel="obtenerClaseColorNivel"
        @guardarEdicion="procesarEdicionAlerta"
        @toggleActiva="toggleActiva"
        @eliminar="procesarEliminarAlerta"
      />
    </div>

    <!-- Pie de Acciones del Modal -->
    <template #pie>
      <div class="w-full flex items-center justify-between text-xs">
        <button
          type="button"
          @click="restablecerValoresPorDefecto"
          class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restablecer alertas y niveles predeterminados</span>
        </button>

        <BotonBase
          variante="primario"
          tamano="pequeno"
          @click="emit('cerrar')"
        >
          Listo
        </BotonBase>
      </div>
    </template>
  </ModalBase>
</template>

