<!--
  ============================================================================
  COMPONENTE BARRA DE BÚSQUEDA Y FILTROS DE CUENTAS (AdminBarraFiltros.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Search, Filter, Sparkles, UserPlus } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

defineProps<{
  terminoBusqueda: string
  filtroRol: string
  filtroDepartamento: string
  filtroEstado: string
  departamentosUnicos: string[]
}>()

defineEmits<{
  (e: 'update:terminoBusqueda', valor: string): void
  (e: 'update:filtroRol', valor: string): void
  (e: 'update:filtroDepartamento', valor: string): void
  (e: 'update:filtroEstado', valor: string): void
  (e: 'abrirModalCrear'): void
  (e: 'reiniciarDatosDemo'): void
}>()
</script>

<template>
  <div class="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl space-y-4 shadow-xl text-left">
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <!-- Buscador por texto -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          :value="terminoBusqueda"
          @input="$emit('update:terminoBusqueda', ($event.target as HTMLInputElement).value)"
          type="text" 
          placeholder="Buscar por nombre, correo o departamento..."
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-all"
        />
      </div>

      <!-- Botones de Acción usando BotonBase -->
      <div class="flex items-center gap-2.5 shrink-0">
        <BotonBase
          variante="secundario"
          tamano="pequeno"
          @click="$emit('reiniciarDatosDemo')"
        >
          <template #iconoIzquierdo>
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
          </template>
          <span class="hidden sm:inline">Restaurar Demo</span>
        </BotonBase>

        <BotonBase
          variante="gradiente"
          tamano="pequeno"
          @click="$emit('abrirModalCrear')"
        >
          <template #iconoIzquierdo>
            <UserPlus class="w-4 h-4" />
          </template>
          <span>Nueva Cuenta</span>
        </BotonBase>
      </div>
    </div>

    <!-- Filtros secundarios -->
    <div class="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
      <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium mr-1">
        <Filter class="w-3.5 h-3.5 text-sky-500" />
        Filtros:
      </span>

      <select 
        :value="filtroRol"
        @change="$emit('update:filtroRol', ($event.target as HTMLSelectElement).value)"
        class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
      >
        <option value="todos">Todos los Roles</option>
        <option value="Super Administrador">Super Administrador</option>
        <option value="Administrador">Administrador</option>
        <option value="Supervisor">Supervisor</option>
        <option value="Analista RRHH">Analista RRHH</option>
      </select>

      <select 
        :value="filtroDepartamento"
        @change="$emit('update:filtroDepartamento', ($event.target as HTMLSelectElement).value)"
        class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
      >
        <option value="todos">Todos los Departamentos</option>
        <option v-for="dep in departamentosUnicos" :key="dep" :value="dep">
          {{ dep }}
        </option>
      </select>

      <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 ml-auto">
        <button
          v-for="estado in ['todos', 'Activo', 'Inactivo', 'Pendiente']"
          :key="estado"
          type="button"
          @click="$emit('update:filtroEstado', estado)"
          :class="[
            'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize cursor-pointer',
            filtroEstado === estado 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          {{ estado }}
        </button>
      </div>
    </div>
  </div>
</template>
