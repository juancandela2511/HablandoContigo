<!--
  ============================================================================
  COMPONENTE MODAL DE UBICACIÓN Y MAPA DE AUDITORÍA (ModalMapaUbicacionAuditoria.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Ventana modal modular de auditoría territorial y técnica:
  - ModalBase: Contenedor con HUD táctico y backdrop blur.
  - MapaVisorSatelital: Visor OpenStreetMap con coordenadas GPS.
  - MapaDetallesDispositivo: Hostname del equipo (revelación condicional) y metadatos.
  
  ¿CON QUÉ SE CONECTA?
  - useEncuestas.ts (Tipo RegistroRespuesta)
  - ElementosBase (ModalBase, BotonBase, InsigniaPill)
  - DashboardPestanaAuditoria.vue (Disparador)
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { MapPin } from 'lucide-vue-next'
import MapaVisorSatelital from './Modales/MapaAuditoria/MapaVisorSatelital.vue'
import MapaDetallesDispositivo from './Modales/MapaAuditoria/MapaDetallesDispositivo.vue'

const props = defineProps<{
  abierto: boolean
  registro: RegistroRespuesta | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const tieneAlertas = computed(() => {
  return Boolean(props.registro && props.registro.alertasDetectadas && props.registro.alertasDetectadas.length > 0)
})

const coordenadasSeguras = computed(() => {
  return {
    lat: props.registro?.ubicacion?.lat ?? 4.6534,
    lng: props.registro?.ubicacion?.lng ?? -74.0836
  }
})

const enlaceGoogleMaps = computed(() => {
  const { lat, lng } = coordenadasSeguras.value
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
})

const enlaceOpenStreetMap = computed(() => {
  const { lat, lng } = coordenadasSeguras.value
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
})
</script>

<template>
  <ModalBase
    :abierto="abierto && !!registro"
    titulo="Ubicación Geográfica de la Encuesta"
    :subtitulo="`Registro de auditoría capturado para la sesión ${registro?.dispositivoUUID || ''}`"
    anchoMaximo="2xl"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
        <MapPin class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill :variante="tieneAlertas ? 'alerta' : 'exito'" tamano="sm">
        {{ tieneAlertas ? 'REVELADO POR ALERTA' : 'ANONIMATO ACTIVO' }}
      </InsigniaPill>
    </template>

    <div v-if="registro" class="space-y-4">
      <!-- Mapa Embebido -->
      <MapaVisorSatelital
        :lat="coordenadasSeguras.lat"
        :lng="coordenadasSeguras.lng"
        :enlaceGoogleMaps="enlaceGoogleMaps"
        :enlaceOpenStreetMap="enlaceOpenStreetMap"
      />

      <!-- Detalles Técnicos y Revelación Condicional -->
      <MapaDetallesDispositivo
        :registro="registro"
        :tieneAlertas="tieneAlertas"
      />
    </div>

    <template #pie>
      <BotonBase
        variante="primario"
        tamano="pequeno"
        @click="emit('cerrar')"
      >
        Cerrar Mapa
      </BotonBase>
    </template>
  </ModalBase>
</template>