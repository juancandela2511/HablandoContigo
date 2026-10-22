<!--
  ============================================================================
  COMPONENTE PESTAÑA AUDITORÍA ANÓNIMA POR UUID (DashboardPestanaAuditoria.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Orquestador de trazabilidad y auditoría criptográfica de participaciones:
  - AuditoriaMetricasHeader: Resumen métrico de participaciones y descartes.
  - AuditoriaTablaRegistros: Barra de búsqueda, filtros por criterio y tabla con AuditoriaFilaRegistro.
  - ModalMapaUbicacionAuditoria: Modal interactivo con mapa de dispersión satelital.
  - ModalGestionTiposAlertas: Modal de calibración de alertas.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'
import { useTiposAlertas, type TipoAlertaPersonalizada } from '@/Almacenes/useTiposAlertas'
import ModalMapaUbicacionAuditoria from './ModalMapaUbicacionAuditoria.vue'
import ModalGestionTiposAlertas from './ModalGestionTiposAlertas.vue'
import AuditoriaMetricasHeader from './Pestanas/PestanaAuditoria/AuditoriaMetricasHeader.vue'
import AuditoriaTablaRegistros from './Pestanas/PestanaAuditoria/AuditoriaTablaRegistros.vue'

const props = defineProps<{
  respuestas: RegistroRespuesta[]
}>()

const emit = defineEmits<{
  (e: 'eliminarRespuesta', idRespuesta: string): void
}>()

const { tiposAlertas, eliminarTipoAlerta, coincideTextoConTipoAlerta } = useTiposAlertas()

const modalMapaAbierto = ref(false)
const modalGestionAlertasAbierto = ref(false)
const registroSeleccionado = ref<RegistroRespuesta | null>(null)
const filtroTexto = ref('')
const filtroTipo = ref<string>('todos')

const abrirMapa = (registro: RegistroRespuesta) => {
  registroSeleccionado.value = registro
  modalMapaAbierto.value = true
}

const manejarEliminarRegistro = (idRespuesta: string) => {
  if (confirm('¿Estás seguro de eliminar este registro de respuesta de la base de datos de Supabase? Esta acción es irreversible.')) {
    emit('eliminarRespuesta', idRespuesta)
  }
}

const manejarEliminarTipoAlerta = (e: Event, idTipo: string, nombre: string) => {
  e.stopPropagation()
  if (confirm(`¿Deseas quitar la alerta "${nombre}" de los filtros y del sistema?`)) {
    eliminarTipoAlerta(idTipo)
    if (filtroTipo.value === idTipo) {
      filtroTipo.value = 'todos'
    }
  }
}

const totalConAlertas = computed(() => {
  return props.respuestas.filter(r => r.alertasDetectadas && r.alertasDetectadas.length > 0).length
})

const contarRespuestasPorTipo = (tipo: TipoAlertaPersonalizada) => {
  const slugId = tipo.id.replace('tipo-', '').toLowerCase()
  return props.respuestas.filter(r => {
    if (r.categoriasAlerta && r.categoriasAlerta.some(c => c.toLowerCase() === slugId)) return true
    if (r.alertasDetectadas && r.alertasDetectadas.some(a => coincideTextoConTipoAlerta(a, tipo))) return true
    if (r.respuestas && r.respuestas.some(item => {
      // Rigor estricto: Solo evaluar si el colaborador manifestó malestar o puntaje crítico
      const esCritico = item.valor === 1 || item.respuesta === 'Mal' || Boolean(item.esAlerta)
      if (!esCritico) return false
      const texto = `${item.respuesta || ''} ${item.comentario || ''}`.trim()
      return coincideTextoConTipoAlerta(texto, tipo)
    })) return true
    return false
  }).length
}

const respuestasFiltradas = computed(() => {
  return props.respuestas.filter(r => {
    const coincideTexto = 
      !filtroTexto.value.trim() ||
      r.dispositivoUUID.toLowerCase().includes(filtroTexto.value.toLowerCase()) ||
      r.tituloEncuesta.toLowerCase().includes(filtroTexto.value.toLowerCase()) ||
      (r.ubicacion?.ciudad || '').toLowerCase().includes(filtroTexto.value.toLowerCase()) ||
      (r.nombreEquipoPC || '').toLowerCase().includes(filtroTexto.value.toLowerCase())

    if (!coincideTexto) return false

    if (filtroTipo.value === 'todos') return true
    if (filtroTipo.value === 'con_alertas') return r.alertasDetectadas && r.alertasDetectadas.length > 0
    if (filtroTipo.value === 'sin_alertas') return !r.alertasDetectadas || r.alertasDetectadas.length === 0
    
    const tipoSeleccionado = tiposAlertas.value.find(t => t.id === filtroTipo.value)
    if (tipoSeleccionado) {
      const slugId = tipoSeleccionado.id.replace('tipo-', '').toLowerCase()
      const coincideCategoria = r.categoriasAlerta && r.categoriasAlerta.some(c => c.toLowerCase() === slugId)
      const coincideAlerta = r.alertasDetectadas && r.alertasDetectadas.some(a => coincideTextoConTipoAlerta(a, tipoSeleccionado))
      const coincideContenido = r.respuestas && r.respuestas.some(item => {
        const esCritico = item.valor === 1 || item.respuesta === 'Mal' || Boolean(item.esAlerta)
        if (!esCritico) return false
        const texto = `${item.respuesta || ''} ${item.comentario || ''}`.trim()
        return coincideTextoConTipoAlerta(texto, tipoSeleccionado)
      })
      if (!coincideCategoria && !coincideAlerta && !coincideContenido) return false
    }

    return true
  })
})
</script>

<template>
  <div class="space-y-5 text-left font-['Poppins',sans-serif]">
    <!-- 1. Encabezado Métrico de Auditoría -->
    <AuditoriaMetricasHeader
      :totalRespuestas="respuestas.length"
      :totalAlertas="totalConAlertas"
      @abrirGestionAlertas="modalGestionAlertasAbierto = true"
    />

    <!-- 2. Tabla Principal y Filtros -->
    <AuditoriaTablaRegistros
      :respuestas="respuestasFiltradas"
      :filtroTexto="filtroTexto"
      :filtroTipo="filtroTipo"
      :tiposAlertas="tiposAlertas"
      :totalConAlertas="totalConAlertas"
      :contarRespuestasPorTipo="contarRespuestasPorTipo"
      @update:filtroTexto="filtroTexto = $event"
      @update:filtroTipo="filtroTipo = $event"
      @abrirGestionAlertas="modalGestionAlertasAbierto = true"
      @eliminarTipoAlerta="manejarEliminarTipoAlerta"
      @abrirMapa="abrirMapa"
      @eliminarRespuesta="manejarEliminarRegistro"
    />

    <!-- Modal de Mapa de Ubicación -->
    <ModalMapaUbicacionAuditoria
      :abierto="modalMapaAbierto"
      :registro="registroSeleccionado"
      @cerrar="modalMapaAbierto = false"
    />

    <!-- Modal de Gestión de Alertas -->
    <ModalGestionTiposAlertas
      :abierto="modalGestionAlertasAbierto"
      @cerrar="modalGestionAlertasAbierto = false"
    />
  </div>
</template>
