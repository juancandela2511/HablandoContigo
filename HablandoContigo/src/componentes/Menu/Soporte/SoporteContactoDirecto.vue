<!--
  ============================================================================
  FORMULARIO DE CONTACTO Y TICKET DIRECTO (SoporteContactoDirecto.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Permite al usuario registrar una solicitud o ticket de soporte técnico,
  visualizando los canales oficiales de contacto y horarios de atención.
  
  ¿CON QUÉ SE CONECTA?
  - ModalSoporte.vue (Componente modal contenedor)
  - BotonBase.vue (Componente atómico de interfaz)
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Mail, MessageSquare, ShieldCheck, CheckCircle2, Send } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

const mensajeEnviado = ref(false)
const mensajeSoporte = ref('')
const correoContacto = ref('')

const enviarMensaje = () => {
  if (!mensajeSoporte.value.trim()) return
  mensajeEnviado.value = true
  setTimeout(() => {
    mensajeEnviado.value = false
    mensajeSoporte.value = ''
    correoContacto.value = ''
  }, 4000)
}
</script>

<template>
  <div class="space-y-3 flex-1 overflow-y-auto p-4 text-xs text-left">
    <!-- Alerta de Envío Exitoso -->
    <div
      v-if="mensajeEnviado"
      class="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in"
    >
      <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>¡Tu ticket ha sido registrado! Un asesor de soporte se comunicará contigo pronto.</span>
    </div>

    <!-- Canales Rápidos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
        <span class="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1.5">
          <Mail class="w-3.5 h-3.5" />
          <span>Correo de Atención</span>
        </span>
        <p class="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
          soporte@hablandocontigo.com
        </p>
      </div>

      <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
        <span class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
          <MessageSquare class="w-3.5 h-3.5" />
          <span>Horario de Atención</span>
        </span>
        <p class="text-slate-700 dark:text-slate-300 text-[11px]">
          Lunes a Viernes (8:00 AM - 6:00 PM)
        </p>
      </div>
    </div>

    <!-- Formulario de Ticket -->
    <form @submit.prevent="enviarMensaje" class="space-y-2.5 pt-1">
      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Correo de Respuesta
        </label>
        <input
          v-model="correoContacto"
          type="email"
          required
          placeholder="tu_correo@empresa.com"
          class="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500 font-medium"
        />
      </div>

      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Descripción del Requerimiento
        </label>
        <textarea
          v-model="mensajeSoporte"
          rows="3"
          required
          placeholder="Describe detalladamente lo que necesitas..."
          class="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500 resize-none font-medium"
        ></textarea>
      </div>

      <div class="flex items-center justify-between pt-1">
        <span class="text-[10px] text-slate-500 flex items-center gap-1">
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
          <span>Privacidad garantizada</span>
        </span>

        <BotonBase
          tipo="submit"
          variante="primario"
          tamano="pequeno"
        >
          <template #iconoIzquierdo>
            <Send class="w-3 h-3" />
          </template>
          <span>Enviar Ticket</span>
        </BotonBase>
      </div>
    </form>
  </div>
</template>
