<!--
  ============================================================================
  ANÁLISIS DE PUNTOS DE LA EMPRESA & SUGERENCIAS (SugerenciasOrganizacionales.vue)
  ============================================================================
  Muestra los puntos clave de la empresa (Económico, Tecnología, Infraestructura,
  Cultura) con diseño limpio y directo sin exceso de texto.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Lightbulb, Link2, Cpu, Building2, DollarSign, Smile } from 'lucide-vue-next'
import { useSugerenciasOrganizacionales } from '@/Almacenes/useSugerenciasOrganizacionales'
import ModalVincularPreguntasSugerencias from './ModalVincularPreguntasSugerencias.vue'

const { sugerenciasConMetricas } = useSugerenciasOrganizacionales()
const modalVinculacionAbierto = ref(false)

const mapaIconosSugerencias: Record<string, any> = {
  Cpu,
  Building2,
  DollarSign,
  Smile,
  Lightbulb
}
</script>

