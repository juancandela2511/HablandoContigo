<!--
  ============================================================================
  COMPONENTE TARJETA DE ESTADO DE PERMISOS (PerfilPermisosCard.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Muestra el nivel de permisos del rol asignado y un resumen de las facultades
  administrativas del usuario (gestión con IA, cuentas, alertas de acoso).
  
  ¿PARA QUÉ SIRVE?
  - Proveer transparencia y contexto de seguridad sobre las capacidades del rol activo.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - ConfiguracionView.vue: Componente que lo renderiza pasándole el rol actual.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { PERMISOS_POR_ROL, type RolCuenta } from '@/Almacenes/useCuentas'
import { Shield, Check, X, FolderOpen, PieChart, ShieldAlert, Users, KeyRound } from 'lucide-vue-next'

const props = defineProps<{
  rol: string
}>()

const permisos = computed(() => {
  const rolTyped = props.rol as RolCuenta
  return PERMISOS_POR_ROL[rolTyped] || {
    proyectos: false,
    dashboard: false,
    alertas: false,
    cuentas: false,
    cambiarContrasenasOtros: false,
    configuracion: true
  }
})

const descripcionRol = computed(() => {
  switch (props.rol) {
    case 'Super Administrador':
      return 'Acceso total a todos los módulos del sistema, creación de encuestas, alertas y facultad exclusiva de gestión y cambio de contraseñas de cuentas.'
    case 'Administrador':
      return 'Acceso completo a proyectos de encuestas, dashboard analítico y alertas de convivencia. Sin gestión de cuentas.'
    case 'Supervisor':
      return 'Acceso exclusivo a proyectos y encuestas asignadas. Restringido para dashboard global, alertas y administración de cuentas.'
    case 'Analista RRHH':
      return 'Acceso a métricas y reportes del dashboard analítico. Restringido para proyectos, alertas críticas y cuentas.'
    default:
      return 'Nivel de permisos estándar para colaboradores de la organización.'
  }
})
</script>

<template>
  <div class="p-5 sm:p-6 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-xs space-y-4 shadow-md text-left">
    
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
      <span class="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
        <Shield class="w-4 h-4 text-sky-500" />
        Nivel de Permisos (RBAC)
      </span>
      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-400 border border-blue-200 dark:border-blue-800">
        {{ rol }}
      </span>
    </div>

    <p class="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
      {{ descripcionRol }}
    </p>

    <!-- Lista de Capacidades -->
    <div class="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
      
      <!-- Proyectos -->
      <div class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <FolderOpen class="w-3.5 h-3.5 text-indigo-500" />
          <span>Proyectos & Generador de Encuestas IA</span>
        </span>
        <span :class="permisos.proyectos ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'">
          <Check v-if="permisos.proyectos" class="w-4 h-4" />
          <X v-else class="w-4 h-4" />
        </span>
      </div>

      <!-- Dashboard -->
      <div class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <PieChart class="w-3.5 h-3.5 text-blue-500" />
          <span>Dashboard & Métricas de Clima</span>
        </span>
        <span :class="permisos.dashboard ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'">
          <Check v-if="permisos.dashboard" class="w-4 h-4" />
          <X v-else class="w-4 h-4" />
        </span>
      </div>

      <!-- Alertas de Convivencia -->
      <div class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <ShieldAlert class="w-3.5 h-3.5 text-amber-500" />
          <span>Alertas de Acoso y Convivencia</span>
        </span>
        <span :class="permisos.alertas ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'">
          <Check v-if="permisos.alertas" class="w-4 h-4" />
          <X v-else class="w-4 h-4" />
        </span>
      </div>

      <!-- Cuentas -->
      <div class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <Users class="w-3.5 h-3.5 text-purple-500" />
          <span>Administración de Cuentas & Roles</span>
        </span>
        <span :class="permisos.cuentas ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'">
          <Check v-if="permisos.cuentas" class="w-4 h-4" />
          <X v-else class="w-4 h-4" />
        </span>
      </div>

      <!-- Cambio de Claves de Otros -->
      <div class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <KeyRound class="w-3.5 h-3.5 text-purple-400" />
          <span>Cambiar Contraseñas de Otros Usuarios</span>
        </span>
        <span :class="permisos.cambiarContrasenasOtros ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'">
          <Check v-if="permisos.cambiarContrasenasOtros" class="w-4 h-4" />
          <X v-else class="w-4 h-4" />
        </span>
      </div>

    </div>

  </div>
</template>
