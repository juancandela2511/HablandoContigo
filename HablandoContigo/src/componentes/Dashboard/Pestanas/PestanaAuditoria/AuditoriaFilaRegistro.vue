<!--
  ============================================================================
  FILA INDIVIDUAL DE AUDITORÍA (AuditoriaFilaRegistro.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Laptop, Clock, CheckCircle2, ShieldCheck, MapPin, Trash2, ZapOff } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'
import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'

defineProps<{
  registro: RegistroRespuesta
}>()

const emit = defineEmits<{
  (e: 'abrirMapa', registro: RegistroRespuesta): void
  (e: 'eliminar', idRespuesta: string): void
}>()
</script>

<template>
  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs text-left">
    <!-- 1. Dispositivo y Cuenta -->
    <td class="py-3.5 px-4 space-y-1">
      <div class="flex items-center gap-2 font-mono font-semibold text-sky-600 dark:text-sky-400">
        <Laptop class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{{ registro.dispositivoUUID }}</span>
      </div>

      <div v-if="!registro.esDescartadaPorVelocidad && registro.alertasDetectadas && registro.alertasDetectadas.length > 0" class="flex items-center gap-1.5 text-[11px]">
        <span class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono font-bold border border-amber-300 dark:border-amber-800">
          💻 {{ registro.nombreEquipoPC || 'PC-CORP' }} ({{ registro.cuentaUsuarioPC || 'usr' }})
        </span>
      </div>

      <div v-else-if="registro.esDescartadaPorVelocidad" class="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
        <ZapOff class="w-3 h-3 text-slate-400" />
        <span>Ignorada (Respuesta en {{ registro.duracionSegundos || 2 }}s)</span>
      </div>

      <div v-else class="flex items-center gap-1 text-[10px] text-slate-400">
        <ShieldCheck class="w-3 h-3 text-emerald-500" />
        <span>Protegido por Privacidad</span>
      </div>
    </td>

    <!-- 2. Ubicación y Sede -->
    <td class="py-3.5 px-4">
      <div class="space-y-0.5">
        <p class="font-bold text-slate-800 dark:text-slate-200">
          {{ registro.ubicacion?.ciudad || 'Bogotá' }}, {{ registro.ubicacion?.pais || 'Colombia' }}
        </p>
        <p class="text-[11px] text-slate-500 truncate max-w-[160px]">
          {{ registro.ubicacion?.sede || 'Sede Principal' }}
        </p>
      </div>
    </td>

    <!-- 3. Encuesta -->
    <td class="py-3.5 px-4 font-sans text-slate-700 dark:text-slate-300 max-w-[180px] truncate">
      {{ registro.tituloEncuesta || 'Encuesta de Clima Laboral' }}
    </td>

    <!-- 4. Fecha y Hora -->
    <td class="py-3.5 px-4 text-slate-500">
      <div class="flex items-center gap-1">
        <Clock class="w-3 h-3 text-slate-400" />
        <span>{{ registro.fecha }} - {{ registro.hora }}</span>
      </div>
    </td>

    <!-- 5. Estado y Alertas -->
    <td class="py-3.5 px-4">
      <div v-if="registro.alertasDetectadas && registro.alertasDetectadas.length > 0" class="flex flex-wrap gap-1">
        <span
          v-for="(al, i) in registro.alertasDetectadas"
          :key="i"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-block"
        >
          {{ al }}
        </span>
      </div>

      <span v-else class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
        <CheckCircle2 class="w-3.5 h-3.5" />
        <span>Válida (Sin Alertas)</span>
      </span>
    </td>

    <!-- 6. Acciones -->
    <td class="py-3.5 px-4 text-center">
      <div class="flex items-center justify-center gap-1.5">
        <BotonBase
          variante="secundario"
          tamano="xs"
          @click="emit('abrirMapa', registro)"
        >
          <template #iconoIzquierdo>
            <MapPin class="w-3 h-3 text-sky-500" />
          </template>
          <span>Mapa</span>
        </BotonBase>

        <button
          type="button"
          @click="emit('eliminar', registro.idRespuesta)"
          class="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
          title="Eliminar esta respuesta de Supabase"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
</template>
