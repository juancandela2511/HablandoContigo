<script setup lang="ts">
import { ShieldCheck, Cpu, Database, EyeOff } from 'lucide-vue-next'
</script>

<template>
  <div class="border-y border-slate-200/80 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.01] py-8">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-around gap-6 text-slate-500 dark:text-neutral-400 text-xs font-mono">
      <div class="flex items-center gap-2">
        <Cpu class="w-4 h-4 text-sky-500" />
        <span>Gemini 2.5 Flash / Pro (Cero Falsas Alarmas)</span>
      </div>
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-4 h-4 text-emerald-500" />
        <span>Cifrado UUID de Dispositivo</span>
      </div>
      <div class="flex items-center gap-2">
        <Database class="w-4 h-4 text-purple-500" />
        <span>Supabase PostgreSQL + RLS Seguro</span>
      </div>
      <div class="flex items-center gap-2">
        <EyeOff class="w-4 h-4 text-amber-500" />
        <span>Confidencialidad Auditada 100%</span>
      </div>
    </div>
  </div>
</template>
