<!--
  ============================================================================
  FICHA TÉCNICA Y DE TRAZABILIDAD LEGAL DEL INCIDENTE (TarjetaDetalleLegalError.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref } from 'vue'
import { ShieldCheck, Copy, Check, Download, Lock, FileText } from 'lucide-vue-next'
import type { DetalleIncidenteLegal } from '@/Almacenes/useManejadorErrores'
import { useManejadorErrores } from '@/Almacenes/useManejadorErrores'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const props = defineProps<{
  incidente: DetalleIncidenteLegal
  mostrarDescarga?: boolean
}>()

const copiado = ref(false)
const { exportarReporteForense } = useManejadorErrores()

const copiarCodigoIncidente = async () => {
  try {
    const textoACopiar = `[TICKET AUDITORÍA LEGAL]
ID Incidente: ${props.incidente.idIncidente}
Código Error: ${props.incidente.codigo}
Timestamp ISO: ${props.incidente.timestampISO}
Hash Integridad: ${props.incidente.hashIntegridad}
Ruta Origen: ${props.incidente.rutaOrigen || '/'}
Descripción: ${props.incidente.mensaje}`
    await navigator.clipboard.writeText(textoACopiar)
    copiado.value = true
    setTimeout(() => {
      copiado.value = false
    }, 2500)
  } catch (e) {
    console.warn('No se pudo copiar al portapapeles:', e)
  }
}
</script>

<template>
  <div class="p-4 sm:p-5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 text-left font-['Poppins',sans-serif]">
    <!-- Encabezado -->
    <div class="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
      <div class="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
        <ShieldCheck class="w-4 h-4 text-sky-500 shrink-0" />
        <span>Ficha de Auditoría y Trazabilidad Legal</span>
      </div>
      <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold border border-sky-500/20">
        Auditoría Activa
      </span>
    </div>

    <!-- Grilla de Trazabilidad -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
      <div class="p-2.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
        <span class="text-[10px] text-slate-400 font-sans block">ID Incidente Legal:</span>
        <span class="font-bold text-slate-900 dark:text-white select-all">{{ incidente.idIncidente }}</span>
      </div>

      <div class="p-2.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
        <span class="text-[10px] text-slate-400 font-sans block">Hash de Integridad:</span>
        <span class="font-bold text-sky-600 dark:text-sky-400 select-all">{{ incidente.hashIntegridad }}</span>
      </div>

      <div class="p-2.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
        <span class="text-[10px] text-slate-400 font-sans block">Timestamp Certificado:</span>
        <span class="text-slate-700 dark:text-slate-300 text-[10px]">{{ incidente.timestampISO }}</span>
      </div>

      <div class="p-2.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
        <span class="text-[10px] text-slate-400 font-sans block">Módulo / Ruta:</span>
        <span class="text-slate-700 dark:text-slate-300 truncate block">{{ incidente.rutaOrigen || '/' }}</span>
      </div>
    </div>

    <!-- Diagnóstico Técnico Sanitizado -->
    <div v-if="incidente.detalleTecnico" class="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-950/50 border border-slate-300/50 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
      <div class="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 text-[10px]">
        <FileText class="w-3 h-3 text-amber-500" />
        <span>Diagnóstico Técnico Sanitizado:</span>
      </div>
      <p class="font-mono text-[10px] break-all">{{ incidente.detalleTecnico }}</p>
    </div>

    <!-- Garantía de Confidencialidad -->
    <div class="flex items-start gap-2 pt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
      <Lock class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
      <span>
        <strong>Garantía de Confidencialidad:</strong> Este incidente se ha registrado sin exponer información de colaboradores ni credenciales conforme a las leyes de protección de datos personales (RGPD / Habeas Data).
      </span>
    </div>

    <!-- Botones Forenses -->
    <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
      <BotonBase
        variante="secundario"
        tamano="xs"
        @click="copiarCodigoIncidente"
      >
        <template #iconoIzquierdo>
          <Check v-if="copiado" class="w-3.5 h-3.5 text-emerald-500" />
          <Copy v-else class="w-3.5 h-3.5" />
        </template>
        <span>{{ copiado ? '¡Ticket Copiado!' : 'Copiar Ticket' }}</span>
      </BotonBase>

      <BotonBase
        v-if="mostrarDescarga !== false"
        variante="esquema"
        tamano="xs"
        @click="exportarReporteForense(incidente)"
      >
        <template #iconoIzquierdo>
          <Download class="w-3.5 h-3.5 text-sky-500" />
        </template>
        <span>Descargar Informe (.json)</span>
      </BotonBase>
    </div>
  </div>
</template>