<!--
  ============================================================================
  MODAL INSPECCIÓN Y RESOLUCIÓN DE ALERTAS (ModalDetalleAlerta.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Ventana modal modular para examinar a fondo alertas:
  - ModalBase: Contenedor con HUD y backdrop difuso.
  - DetalleAlertaEncabezado: Metadatos del dispositivo, área y severidad.
  - DetalleAlertaCriterioIA: Testimonio, criterio analítico y protocolo.
  - DetalleAlertaAccionesEstado: Transiciones de estado (Atendida, En Revisión, Descartada).
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import { useTiposAlertas, type NivelAlerta } from '@/Almacenes/useTiposAlertas'
import { ModalBase, BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import { ShieldAlert } from 'lucide-vue-next'
import DetalleAlertaEncabezado from './Modales/DetalleAlerta/DetalleAlertaEncabezado.vue'
import DetalleAlertaCriterioIA from './Modales/DetalleAlerta/DetalleAlertaCriterioIA.vue'
import DetalleAlertaAccionesEstado from './Modales/DetalleAlerta/DetalleAlertaAccionesEstado.vue'

const props = defineProps<{
  abierto: boolean
  alerta: NotificacionItem | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'marcarAtendida', id: string): void
  (e: 'descartarAlerta', id: string): void
  (e: 'cambiarEstado', id: string, nuevoEstado: 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'): void
}>()

const { tiposAlertas, obtenerClaseColorNivel } = useTiposAlertas()

const tipoConfigurado = computed(() => {
  if (!props.alerta) return undefined
  const nombreAlerta = (props.alerta.tipoAlerta || props.alerta.titulo || '').toLowerCase()
  const slug = (props.alerta.tipo || '').toLowerCase()

  return tiposAlertas.value.find(t => {
    const tNombre = t.nombre.toLowerCase()
    const tSlug = t.id.replace('tipo-', '').toLowerCase()
    return tNombre.includes(nombreAlerta) || nombreAlerta.includes(tNombre) || tSlug === slug
  })
})

const nivelAlerta = computed<NivelAlerta>(() => {
  if (tipoConfigurado.value?.nivel) return tipoConfigurado.value.nivel
  const sev = (props.alerta?.severidad || 'Moderada').toLowerCase()
  if (sev.includes('crít') || sev.includes('crit')) return 1
  if (sev.includes('alt')) return 2
  if (sev.includes('mod')) return 3
  return 4
})

const protocoloRecomendado = computed(() => {
  if (!props.alerta) return null
  switch (props.alerta.tipo) {
    case 'depresion':
      return {
        titulo: 'Protocolo de Primeros Auxilios Psicológicos y Salud Mental',
        pasos: [
          'Contactar al colaborador de forma confidencial y empática a través de Bienestar.',
          'Ofrecer sesión de contención emocional y activación de línea de apoyo psicológico.',
          'Evaluar ajuste temporal de carga laboral y seguimiento periódico.'
        ],
        color: 'border-purple-300 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300'
      }
    case 'acoso':
      return {
        titulo: 'Protocolo del Comité de Convivencia y Prevención de Hostigamiento',
        pasos: [
          'Garantizar medidas de protección inmediata para evitar represalias.',
          'Convocar sesión extraordinaria confidencial del Comité de Convivencia.',
          'Entrevistar a las partes por separado y aplicar correctivos correspondientes.'
        ],
        color: 'border-red-300 dark:border-red-800 bg-red-50/70 dark:bg-red-950/30 text-red-900 dark:text-red-300'
      }
    default:
      return {
        titulo: 'Protocolo de Mitigación de Sobrecarga y Clima Laboral',
        pasos: [
          'Auditar volumen de tareas y redistribuir carga operativa equitativamente.',
          'Implementar pausas activas obligatorias y derecho a la desconexión.',
          'Establecer compromisos de mejora en el liderazgo directo.'
        ],
        color: 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300'
      }
  }
})
</script>

<template>
  <ModalBase
    :abierto="abierto && !!alerta"
    :titulo="alerta?.tipoAlerta || alerta?.titulo || 'Detalle de Alerta'"
    subtitulo="Auditoría de IA, motivo detectado y protocolo recomendado de Talento Humano."
    anchoMaximo="2xl"
    @cerrar="emit('cerrar')"
  >
    <template #icono>
      <div class="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
        <ShieldAlert class="w-4 h-4" />
      </div>
    </template>

    <template #insignia>
      <InsigniaPill variante="critico" tamano="sm" :conPulso="alerta?.estado !== 'Atendida'">
        {{ alerta?.estado || 'Detectada' }}
      </InsigniaPill>
    </template>

    <div v-if="alerta" class="space-y-4">
      <!-- Encabezado con datos del equipo -->
      <DetalleAlertaEncabezado
        :alerta="alerta"
        :nivel="nivelAlerta"
        :claseColorNivel="obtenerClaseColorNivel(nivelAlerta)"
      />

      <!-- Criterio y Protocolo -->
      <DetalleAlertaCriterioIA
        :alerta="alerta"
        :tipoConfigurado="tipoConfigurado"
        :protocoloRecomendado="protocoloRecomendado"
      />

      <!-- Gestión de Estado -->
      <DetalleAlertaAccionesEstado
        :alertaId="alerta.id"
        :estadoActual="alerta.estado || 'Detectada'"
        @cambiarEstado="(id, est) => emit('cambiarEstado', id, est)"
      />
    </div>

    <template #pie>
      <BotonBase
        variante="primario"
        tamano="pequeno"
        @click="emit('cerrar')"
      >
        Cerrar Detalle
      </BotonBase>
    </template>
  </ModalBase>
</template>
