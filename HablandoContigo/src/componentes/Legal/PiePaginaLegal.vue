<!--
  ============================================================================
  PIE DE PÁGINA CORPORATIVO Y MARCO LEGAL (PiePaginaLegal.vue)
  ============================================================================
-->

<script setup lang="ts">
import {
  ShieldCheck,
  Lock,
  Scale,
  FileText,
  Cookie,
  HeartPulse,
  ExternalLink,
  LifeBuoy
} from 'lucide-vue-next'
import { useLegal } from '@/Almacenes/useLegal'

const {
  abrirTerminos,
  abrirPrivacidad,
  abrirConsentimiento,
  abrirCookies,
  versionTerminos
} = useLegal()
</script>

<template>
  <footer class="w-full border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md pt-12 pb-8 px-4 sm:px-8 lg:px-12 font-['Poppins',sans-serif] text-slate-600 dark:text-slate-400 transition-colors">
    <div class="max-w-7xl mx-auto space-y-10">
      
      <!-- Fila Principal de Enlaces y Sellos -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
        
        <!-- Columna 1: Marca y Propósito -->
        <div class="md:col-span-1 space-y-3">
          <div class="flex items-center gap-2 text-slate-900 dark:text-white font-black text-lg">
            <div class="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sky-500/20">
              HC
            </div>
            <span>HablandoContigo</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Plataforma corporativa de diagnóstico confidencial de clima laboral, salud psicosocial y bienestar organizacional.
          </p>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-bold">
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>Certificación RGPD / Habeas Data</span>
          </div>
        </div>

        <!-- Columna 2: Marco Legal y Regulatorio -->
        <div class="space-y-2.5">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Marco Legal & Cumplimiento
          </h4>
          <ul class="space-y-2 text-xs">
            <li>
              <button
                @click="abrirTerminos"
                class="hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Scale class="w-3.5 h-3.5 text-sky-500" />
                <span>Términos y Condiciones ({{ versionTerminos }})</span>
              </button>
            </li>
            <li>
              <button
                @click="abrirPrivacidad"
                class="hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock class="w-3.5 h-3.5 text-emerald-500" />
                <span>Política de Privacidad</span>
              </button>
            </li>
            <li>
              <button
                @click="abrirConsentimiento"
                class="hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText class="w-3.5 h-3.5 text-indigo-500" />
                <span>Consentimiento Informado</span>
              </button>
            </li>
            <li>
              <button
                @click="abrirCookies"
                class="hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Cookie class="w-3.5 h-3.5 text-amber-500" />
                <span>Política de Cookies & Sesión</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Protocolos de Seguridad y Anonimato -->
        <div class="space-y-2.5">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Garantías de Anonimato
          </h4>
          <ul class="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <li class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              <span>Identificador UUID por Dispositivo</span>
            </li>
            <li class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Cero Represalias Garantizado</span>
            </li>
            <li class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>Cifrado SSL/TLS de Extremo a Extremo</span>
            </li>
            <li class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Auditoría Forense Inmutable</span>
            </li>
          </ul>
        </div>

        <!-- Columna 4: Canales de Atención y Soporte -->
        <div class="space-y-2.5">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Atención & Canal Ético
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Línea confidencial de atención para dudas sobre privacidad o reportes éticos.
          </p>
          <router-link
            to="/support"
            class="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <LifeBuoy class="w-4 h-4" />
            <span>Centro de Soporte & Ayuda</span>
          </router-link>
        </div>

      </div>

      <!-- Barra Inferior de Copyright y Datos Institucionales -->
      <div class="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500">
        <div class="flex items-center gap-2">
          <span>&copy; 2026 HablandoContigo Inc. Todos los derechos reservados.</span>
        </div>

        <div class="flex items-center gap-4">
          <span class="font-mono">Versión Legal: {{ versionTerminos }}</span>
          <span>&bull;</span>
          <span>Plataforma Auditada</span>
        </div>
      </div>

    </div>
  </footer>
</template>