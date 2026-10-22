<script setup lang="ts">
import {
  ModalTerminosCondiciones,
  ModalPoliticaPrivacidad,
  ModalConsentimientoInformado
} from '@/componentes/Legal'
</script>

<template>
  <div>
    <footer class="max-w-3xl mx-auto w-full text-center py-3 text-[11px] text-neutral-500 font-mono relative z-10 border-t border-white/5">
      <p>© 2026 HablandoContigo · Auditoría de Clima y Gestión Humana con Cero Falsas Alarmas</p>
    </footer>

    <!-- Modales de Marco Legal y Regulatorio -->
    <ModalTerminosCondiciones />
    <ModalPoliticaPrivacidad />
    <ModalConsentimientoInformado />
  </div>
</template>
