<!--
  ============================================================================
  VISOR DE MAPA GEOGRÁFICO (MapaVisorSatelital.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Renderiza el visor satelital interactivo embebido de OpenStreetMap con marcador,
  coordenadas geográficas y enlaces directos a Google Maps y OSM.
  
  ¿CON QUÉ SE CONECTA?
  - ModalMapaUbicacionAuditoria.vue (Componente contenedor)
-->

<script setup lang="ts">
import { ExternalLink, Navigation } from 'lucide-vue-next'

defineProps<{
  lat: number
  lng: number
  enlaceGoogleMaps: string
  enlaceOpenStreetMap: string
}>()
</script>

<template>
  <div class="space-y-2 text-left">
    <div class="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-inner group">
      <iframe
        :src="`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`"
        class="w-full h-full border-0 filter dark:invert dark:hue-rotate-180 dark:contrast-125"
        loading="lazy"
        title="Mapa de Auditoría OpenStreetMap"
      ></iframe>

      <!-- Badge Flotante con Coordenadas -->
      <div class="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white font-mono text-[11px] border border-white/20 flex items-center gap-1.5 shadow-lg">
        <Navigation class="w-3 h-3 text-sky-400" />
        <span>GPS: {{ lat.toFixed(4) }}, {{ lng.toFixed(4) }}</span>
      </div>
    </div>

    <!-- Enlaces Externos -->
    <div class="flex items-center justify-end gap-2 text-xs">
      <a
        :href="enlaceGoogleMaps"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
      >
        <span>Abrir en Google Maps</span>
        <ExternalLink class="w-3 h-3" />
      </a>
      <a
        :href="enlaceOpenStreetMap"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
      >
        <span>OpenStreetMap</span>
        <ExternalLink class="w-3 h-3" />
      </a>
    </div>
  </div>
</template>
