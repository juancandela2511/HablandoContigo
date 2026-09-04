<!--
  ============================================================================
  COMPONENTE PILARES CLAVE DEL SISTEMA (HeroPilaresClave.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Muestra las 4 tarjetas de pilares diferenciales de la plataforma:
  1. 100% Anónimo y Confidencial (UUID sin cookies ni logins).
  2. Motor Adaptativo con IA (preguntas dinámicas según respuesta).
  3. Prevención y Detección de Acoso (intervención temprana de RRHH).
  4. Analítica Ejecutiva 360° (6 dimensiones, matriz de calor y simulación).
  
  ¿PARA QUÉ SIRVE?
  - Respaldar los beneficios clave del producto para la toma de decisión gerencial.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - HeroPrincipal.vue: Componente padre que lo renderiza.
-->

<script setup lang="ts">
import { Lock, Sparkles, ShieldAlert, BarChart3 } from 'lucide-vue-next'

const pilares = [
  {
    icono: Lock,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    titulo: '100% Anónimo & Seguro',
    descripcion: 'Respuestas sin registro ni correo electrónico. Identificación única de hardware para auditoría sin rastreo personal.'
  },
  {
    icono: Sparkles,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    titulo: 'Encuestas Adaptativas con IA',
    descripcion: 'Omite preguntas irrelevantes ante alta satisfacción e inserta profundización confidencial ante alertas de clima.'
  },
  {
    icono: ShieldAlert,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    titulo: 'Detección Temprana de Acoso',
    descripcion: 'Alertas automáticas en tiempo real que permiten a RRHH proteger la convivencia laboral de forma inmediata.'
  },
  {
    icono: BarChart3,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    titulo: 'Diagnóstico 360° & Simulación',
    descripcion: 'Matriz de calor departamental, 6 ejes radiales y simulador What-If para proyectar retención y salud laboral.'
  }
]
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
    <div
      v-for="(pilar, index) in pilares"
      :key="index"
      class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl hover:border-sky-500/40 transition-all space-y-3 group shadow-xl"
    >
      <div class="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110" :class="pilar.color">
        <component :is="pilar.icono" class="w-5 h-5" />
      </div>
      <h4 class="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
        {{ pilar.titulo }}
      </h4>
      <p class="text-xs text-slate-400 leading-relaxed">
        {{ pilar.descripcion }}
      </p>
    </div>
  </div>
</template>
