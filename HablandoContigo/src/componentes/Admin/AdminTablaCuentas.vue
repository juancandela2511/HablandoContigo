<!--
  ============================================================================
  COMPONENTE TABLA DE CUENTAS DE ADMINISTRACIÓN (AdminTablaCuentas.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Renderiza la tabla de datos de usuarios administradores:
  - Iniciales / Avatar generado dinámicamente con gradiente.
  - Insignia de rol coloreada (`Super Administrador`, `Administrador`, `Supervisor`, `Analista`).
  - Departamento asignado.
  - Botón interactivo para cambiar estado (Activo / Inactivo / Pendiente).
  - Fecha y hora del último acceso.
  - Botones de acción para editar y eliminar cuenta.
  - Estado vacío amigable cuando no hay resultados de búsqueda.
  
  ¿PARA QUÉ SIRVE?
  - Visualizar con claridad la estructura de accesos corporativos y permitir la gestión rápida de cada cuenta.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useCuentas.ts: Tipos `CuentaAdmin`.
  - AdminCuentasView.vue: Componente padre que gestiona los eventos de edición y eliminación.
-->

<script setup lang="ts">
import type { CuentaAdmin } from '@/Almacenes/useCuentas'
import { Shield, Clock, Edit2, Trash2, Users, MailCheck } from 'lucide-vue-next'

defineProps<{
  cuentas: CuentaAdmin[]
  elementoResaltadoId: string | null
}>()

const emit = defineEmits<{
  (e: 'manejarToggle', cuenta: CuentaAdmin): void
  (e: 'abrirModalEditar', cuenta: CuentaAdmin): void
  (e: 'abrirVerificacion', cuenta: CuentaAdmin): void
  (e: 'confirmarEliminacion', cuenta: CuentaAdmin): void
  (e: 'restablecerFiltros'): void
}>()
</script>

<template>
  <div 
    id="seccion-tabla-cuentas"
    class="rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-500"
    :class="elementoResaltadoId === 'seccion-tabla-cuentas' ? 'ring-4 ring-sky-400 scale-[1.01] animate-pulse' : ''"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs sm:text-sm">
        <thead class="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
          <tr>
            <th class="py-3.5 px-4 font-semibold">Administrador / Usuario</th>
            <th class="py-3.5 px-4 font-semibold">Rol Asignado</th>
            <th class="py-3.5 px-4 font-semibold">Departamento</th>
            <th class="py-3.5 px-4 font-semibold">Estado & Verificación</th>
            <th class="py-3.5 px-4 font-semibold">Último Acceso</th>
            <th class="py-3.5 px-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/80">
          <tr 
            v-for="cuenta in cuentas" 
            :key="cuenta.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
          >
            <!-- Avatar e Identidad -->
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                  {{ cuenta.nombre.split(' ').map(n => n[0]).slice(0, 2).join('') }}
                </div>
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                    {{ cuenta.nombre }}
                  </p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{{ cuenta.email }}</p>
                </div>
              </div>
            </td>

            <!-- Rol -->
            <td class="py-3.5 px-4">
              <span 
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border',
                  (cuenta.rol === 'Super Administrador' || (cuenta.rol as string) === 'Adminsitrador General') ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' :
                  cuenta.rol === 'Administrador' ? 'bg-blue-100 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' :
                  cuenta.rol === 'Supervisor' ? 'bg-sky-100 dark:bg-sky-950/70 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300' :
                  'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                ]"
              >
                <Shield class="w-3 h-3" />
                {{ cuenta.rol }}
              </span>
            </td>

            <!-- Departamento -->
            <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
              {{ cuenta.departamento }}
            </td>

            <!-- Estado con Switch Rápido y Botón de Verificación -->
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2">
                <button
                  @click="$emit('manejarToggle', cuenta)"
                  title="Clic para cambiar estado"
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border transition-all hover:scale-105 active:scale-95',
                    cuenta.estado === 'Activo' ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400' :
                    cuenta.estado === 'Inactivo' ? 'bg-red-100 dark:bg-red-950/70 border-red-300 dark:border-red-800 text-red-800 dark:text-red-400' :
                    'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400'
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="cuenta.estado === 'Activo' ? 'bg-emerald-500 animate-pulse' : cuenta.estado === 'Inactivo' ? 'bg-red-500' : 'bg-amber-500'"></span>
                  {{ cuenta.estado }}
                </button>

                <!-- Botón para ver y simular correo de verificación si está pendiente -->
                <button
                  v-if="cuenta.estado === 'Pendiente' || !cuenta.verificado"
                  @click="$emit('abrirVerificacion', cuenta)"
                  title="Ver y confirmar correo de verificación de la empresa"
                  class="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer"
                >
                  <MailCheck class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>

            <!-- Último Acceso -->
            <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
              <div class="flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ cuenta.ultimoAcceso }}</span>
              </div>
            </td>

            <!-- Botones de Acción -->
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                
                <button
                  @click="$emit('abrirModalEditar', cuenta)"
                  title="Editar Cuenta y Restablecer Contraseña (Super Admin)"
                  class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Edit2 class="w-4 h-4" />
                </button>

                <button
                  @click="$emit('confirmarEliminacion', cuenta)"
                  title="Eliminar Cuenta"
                  class="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 class="w-4 h-4" />
                </button>

              </div>
            </td>

          </tr>

          <!-- Estado Vacío -->
          <tr v-if="cuentas.length === 0">
            <td colspan="6" class="py-12 text-center text-slate-500 space-y-2">
              <Users class="w-10 h-10 mx-auto opacity-30" />
              <p class="text-sm font-medium">No se encontraron cuentas con los filtros seleccionados</p>
              <button 
                @click="$emit('restablecerFiltros')"
                class="text-xs text-sky-600 dark:text-sky-400 hover:underline cursor-pointer font-medium"
              >
                Restablecer filtros de búsqueda
              </button>
            </td>
          </tr>

        </tbody>
      </table>
    </div>

  </div>
</template>
