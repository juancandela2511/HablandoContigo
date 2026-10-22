<!--
  ============================================================================
  DETECCIÓN DE PERSONAS MENCIONADAS CON TARJETAS Y OJO (DeteccionPersonasProblema.vue)
  ============================================================================
  Muestra tarjetas de personas mencionadas en los comentarios con el resumen de IA
  (diferenciando Acoso Sexual de Hostigamiento/Molestias Cotidianas) y un botón
  de Ojo (👁️) para inspeccionar todos los comentarios sin crear alertas nuevas en el catálogo.
-->

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UserX, CheckCircle2, Eye } from 'lucide-vue-next'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useNotificaciones } from '@/Almacenes/useNotificaciones'
import { generarTarjetasPersonasMencionadasIA } from '@/ia/analizadorAlertasPorPersona'
import TarjetaPersonaMencionadaItem from './Pestanas/PestanaAlertas/TarjetaPersonaMencionadaItem.vue'
import type { BloqueAlertaItem } from './Pestanas/PestanaAlertas/TarjetaBloqueAlertaItem.vue'
import ModalDetalleBloqueAlerta from './Modales/ModalDetalleBloqueAlerta.vue'

const { respuestasAnonimas } = useEncuestas()
const { estadosCasos, actualizarEstadoAlerta } = useNotificaciones()

const tarjetasPersonas = ref<BloqueAlertaItem[]>([])
const modalPersonaAbierto = ref(false)
const tarjetaSeleccionada = ref<BloqueAlertaItem | null>(null)
let solicitudIA = 0

const actualizarDeteccion = async () => {
  const actual = ++solicitudIA
  try {
    const res = await generarTarjetasPersonasMencionadasIA(respuestasAnonimas.value, estadosCasos.value)
    if (actual === solicitudIA) {
      tarjetasPersonas.value = res
    }
  } catch {
    if (actual === solicitudIA) {
      tarjetasPersonas.value = []
    }
  }
}

watch(() => [respuestasAnonimas.value.length, estadosCasos.value], actualizarDeteccion, { immediate: true, deep: true })

const abrirComentariosPersona = (tarjeta: BloqueAlertaItem) => {
  tarjetaSeleccionada.value = tarjeta
  modalPersonaAbierto.value = true
}

const manejarCambioEstado = async (id: string, nuevoEstado: 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada') => {
  await actualizarEstadoAlerta(id, nuevoEstado)
  if (tarjetaSeleccionada.value) {
    const item = tarjetaSeleccionada.value.alertas.find(a => a.id === id)
    if (item) item.estado = nuevoEstado
  }
}
</script>

<template>
  <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-left font-['Poppins',sans-serif]">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 flex-wrap gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
          <UserX class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <span>Tarjetas de Personas Mencionadas (IA)</span>
            <span v-if="tarjetasPersonas.length > 0" class="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase">
              {{ tarjetasPersonas.length }} Detectada(s)
            </span>
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">
            Resumen IA por persona señalada. Haz clic en el ojo para ver los comentarios.
          </p>
        </div>
      </div>

      <span v-if="tarjetasPersonas.length > 0" class="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
        <Eye class="w-3.5 h-3.5" />
        <span>Ver comentarios con el ojo</span>
      </span>
    </div>

    <!-- Resumen de nombres mencionados arriba de las tarjetas -->
    <div v-if="tarjetasPersonas.length > 0" class="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-black text-rose-700 dark:text-rose-300">Nombres mencionados en problemas:</span>
        <button
          v-for="t in tarjetasPersonas"
          :key="'pill-' + t.id"
          type="button"
          @click="abrirComentariosPersona(t)"
          class="px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <span>{{ t.nombrePersonaMencionada || t.titulo }}</span>
          <span class="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">{{ t.conComentariosCount }} com.</span>
          <Eye class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Tarjetas de Personas Mencionadas -->
    <div v-if="tarjetasPersonas.length > 0" class="grid grid-cols-1 gap-3.5">
      <TarjetaPersonaMencionadaItem
        v-for="tarjeta in tarjetasPersonas"
        :key="tarjeta.id"
        :tarjeta="tarjeta"
        @abrirCasosPersona="abrirComentariosPersona"
      />
    </div>

    <!-- Estado limpio sin menciones -->
    <div v-else class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
      <CheckCircle2 class="w-5 h-5 text-emerald-500 shrink-0" />
      <span class="font-semibold">Sin menciones de nombres en los comentarios actuales.</span>
    </div>

    <!-- Modal del Ojo (👁️) para inspeccionar comentarios de la persona mencionada -->
    <ModalDetalleBloqueAlerta
      :abierto="modalPersonaAbierto"
      :bloque="tarjetaSeleccionada"
      @cerrar="modalPersonaAbierto = false"
      @cambiarEstado="manejarCambioEstado"
    />
  </div>
</template>
