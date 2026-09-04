<!--
  ============================================================================
  MODAL DE GESTIÓN Y CALIBRACIÓN DE ALERTAS CON IA (ModalGestionTiposAlertas.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Centro de configuración y calibración de alertas psicosociales para el Super Administrador.
  Construido con arquitectura modular:
  - ModalBase: Envoltorio modal estandarizado.
  - FormularioCrearAlerta: Formulario desacoplado con selectores de modo y nivel.
  - ListaTiposAlertas: Visualización y filtrado de alertas con TarjetaTipoAlertaItem.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useTiposAlertas,
  type NivelAlerta
} from '@/Almacenes/useTiposAlertas'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { BrainCircuit, RotateCcw } from 'lucide-vue-next'
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
  actualizarTipoAlerta,
  toggleActiva,
  restablecerValoresPorDefecto,
  obtenerClaseColorNivel
} = useTiposAlertas()

const tiposFiltrados = computed(() => tiposAlertas.value.slice(0, 3))

const procesarEdicionAlerta = (datos: { id: string; nombre: string; descripcion: string; palabrasClave: string[] }) => {
  actualizarTipoAlerta(datos.id, {
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    palabrasClave: datos.palabrasClave
  })
}
</script>

<template>
  <ModalBase
    :abierto="abierto"
    titulo="Calibración de las 3 Alertas de IA"
    subtitulo="Configura el nombre, de qué trata y las palabras clave de cada alerta para que la IA las detecte con precisión."
    anchoMaximo="3xl"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
        <BrainCircuit class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="info" tamano="sm">
        3 ALERTAS IA
      </InsigniaPill>
    </template>

    <div class="space-y-4 text-left">
      <!-- Lista de las 3 Alertas -->
      <ListaTiposAlertas
        :tiposAlertas="tiposAlertas"
        :tiposFiltrados="tiposFiltrados"
        :obtenerClaseColorNivel="obtenerClaseColorNivel"
        @guardarEdicion="procesarEdicionAlerta"
        @toggleActiva="toggleActiva"
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
