<script setup lang="ts">
import { computed } from 'vue'
import { Shield, Check } from 'lucide-vue-next'
import { PERMISOS_POR_ROL } from '@/Almacenes/useCuentas'
import type { RolCuenta } from '@/shared/types/common.types'

const props = defineProps<{
  rol: RolCuenta
}>()

const permisos = computed(() => PERMISOS_POR_ROL[props.rol] || PERMISOS_POR_ROL['Administrador'])
</script>


