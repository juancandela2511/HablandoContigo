<!--
  ============================================================================
  COMPONENTE CARGA Y GESTIÓN DE FOTO DE PERFIL (PerfilFotoUploader.vue)
  ============================================================================
  Gestiona la imagen de perfil con arrastrar y soltar, previsualización
  inmediata y persistencia directa en la base de datos y sesión.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Camera, Upload, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  avatarUrl: string
  avataresPredefinidos: string[]
  subiendo?: boolean
}>()

const emit = defineEmits<{
  (e: 'actualizarAvatar', url: string): void
  (e: 'subirArchivo', archivo: File): void
  (e: 'mostrarAlerta', tipo: 'exito' | 'error', mensaje: string): void
}>()

const inputArchivoRef = ref<HTMLInputElement | null>(null)
const arrastrandoSobre = ref(false)

const esImagenValida = (url?: string) => {
  if (!url) return false
  return url.startsWith('data:image') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
}

const abrirSelectorArchivo = () => {
  if (props.subiendo) return
  inputArchivoRef.value?.click()
}

const validarYSubirArchivo = (archivo: File) => {
  if (!archivo.type.startsWith('image/')) {
    emit('mostrarAlerta', 'error', 'Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG, WEBP).')
    return
  }
  if (archivo.size > 5 * 1024 * 1024) {
    emit('mostrarAlerta', 'error', 'La imagen excede el tamaño máximo permitido de 5MB.')
    return
  }
  emit('subirArchivo', archivo)
}

const manejarCargaFoto = (evento: Event) => {
  const elementoInput = evento.target as HTMLInputElement
  const archivos = elementoInput.files
  if (!archivos || archivos.length === 0) return
  validarYSubirArchivo(archivos[0])
  elementoInput.value = ''
}

const manejarSoltarFoto = (evento: DragEvent) => {
  arrastrandoSobre.value = false
  if (props.subiendo) return
  const archivos = evento.dataTransfer?.files
  if (archivos && archivos.length > 0) {
    validarYSubirArchivo(archivos[0])
  }
}
</script>

<template>
  <div 
    @dragover.prevent="arrastrandoSobre = true"
    @dragenter.prevent="arrastrandoSobre = true"
    @dragleave.prevent="arrastrandoSobre = false"
    @drop.prevent="manejarSoltarFoto"
    :class="[
      'p-6 rounded-3xl border text-center space-y-5 backdrop-blur-xl shadow-xl transition-all duration-300 relative',
      arrastrandoSobre 
        ? 'bg-sky-50/90 dark:bg-sky-950/80 border-2 border-dashed border-sky-500 scale-[1.02] ring-4 ring-sky-500/20' 
        : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-white/10'
    ]"
  >
    <div 
      v-if="arrastrandoSobre" 
      class="absolute inset-0 bg-sky-600/10 dark:bg-sky-500/10 rounded-3xl flex flex-col items-center justify-center pointer-events-none z-20 backdrop-blur-[2px]"
    >
      <div class="p-4 rounded-2xl bg-sky-500 text-white shadow-2xl animate-bounce">
        <Upload class="w-8 h-8" />
      </div>
      <p class="text-sm font-bold text-sky-600 dark:text-sky-400 mt-2">¡Suelta tu foto aquí para guardarla!</p>
    </div>
    
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <span>Foto de Perfil</span>
      </h3>
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
        <span>Arrastra y Suelta</span>
      </span>
    </div>

    <div class="relative w-36 h-36 mx-auto group">
      <div 
        :class="[
          'w-full h-full rounded-full overflow-hidden border-2 shadow-2xl relative flex items-center justify-center transition-all duration-300',
          arrastrandoSobre 
            ? 'border-sky-400 ring-4 ring-sky-400/40 bg-sky-100 dark:bg-sky-900' 
            : 'border-sky-500/60 bg-slate-100 dark:bg-slate-800'
        ]"
      >
        <img 
          v-if="esImagenValida(avatarUrl)"
          :src="avatarUrl" 
          alt="Foto de perfil" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div v-else class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
          <Camera class="w-10 h-10 mb-1" />
          <span class="text-[10px] font-medium">Sin fotografía</span>
        </div>

        <div 
          v-if="subiendo" 
          class="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white gap-2 backdrop-blur-sm z-10"
        >
          <Loader2 class="w-7 h-7 text-sky-400 animate-spin" />
          <span class="text-[10px] font-bold">Guardando fotografía...</span>
        </div>
      </div>

      <button
        v-if="!subiendo"
        type="button"
        @click="abrirSelectorArchivo"
        class="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 cursor-pointer"
        title="Hacer clic para cambiar fotografía o arrastra una imagen aquí"
      >
        <Camera class="w-6 h-6 text-sky-400" />
        <span class="text-[10px] font-semibold">Cambiar foto</span>
      </button>

      <input 
        ref="inputArchivoRef"
        type="file" 
        accept="image/png,image/jpeg,image/jpg,image/webp" 
        class="hidden" 
        @change="manejarCargaFoto"
      />
    </div>

    <div class="space-y-1.5 pt-1">
      <p class="text-xs text-slate-500 dark:text-slate-400">
        JPG, PNG o WEBP. Redimensión y persistencia automática en base de datos.
      </p>
    </div>
  </div>
</template>
