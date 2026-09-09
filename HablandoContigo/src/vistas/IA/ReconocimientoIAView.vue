<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-['Poppins',sans-serif] transition-colors duration-300">
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- ── ENCABEZADO PRINCIPAL ── -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex items-center gap-4 relative z-10">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <BrainCircuit class="w-8 h-8" />
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-xl sm:text-2xl font-black tracking-tight">Reconocimiento &amp; Entrenamiento de IA</h1>
              <span class="text-[10px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <Sparkles class="w-3 h-3 text-indigo-500" />
                Motor Activo
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Calibra y entrena a la Inteligencia Artificial para clasificar respuestas abiertas (Buenas, Regulares o Malas) y encasillar alertas con íconos, colores y niveles personalizados.
            </p>
          </div>
        </div>

        <!-- Métricas Rápidas -->
        <div class="flex flex-wrap items-center gap-2 relative z-10">
          <div class="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Ejemplos Aprendidos</span>
            <span class="text-sm font-black text-indigo-600 dark:text-indigo-400">{{ estadisticasEntrenamiento.total }}</span>
          </div>
          <div class="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Alertas Calibradas</span>
            <span class="text-sm font-black text-rose-600 dark:text-rose-400">{{ estadisticasEntrenamiento.alertasActivas }}</span>
          </div>
          <div class="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Sensibilidad</span>
            <span class="text-sm font-black text-sky-600 dark:text-sky-400">{{ configuracion.sensibilidad }}</span>
          </div>
        </div>
      </header>

      <!-- ── BARRA DE PESTAÑAS ── -->
      <nav class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          @click="pestanaActiva = 'simulador'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'simulador'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <Zap class="w-4 h-4" />
          <span>Simulador &amp; Laboratorio en Vivo</span>
        </button>

        <button
          type="button"
          @click="pestanaActiva = 'criterios'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'criterios'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <BrainCircuit class="w-4 h-4" />
          <span>Criterios &amp; Ejemplos de IA ({{ estadisticasEntrenamiento.total }})</span>
        </button>

        <button
          type="button"
          @click="pestanaActiva = 'alertas'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'alertas'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <ShieldAlert class="w-4 h-4" />
          <span>Catálogo de Alertas &amp; Palabras Clave ({{ tiposAlertas.length }})</span>
        </button>

        <button
          type="button"
          @click="pestanaActiva = 'matriz'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'matriz'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <FolderOpen class="w-4 h-4" />
          <span>Vinculación con Encuestas</span>
        </button>
      </nav>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- PESTAÑA 1: SIMULADOR Y LABORATORIO EN VIVO -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <section v-if="pestanaActiva === 'simulador'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Panel Izquierdo: Entrada de Prueba -->
        <div class="lg:col-span-7 space-y-4">
          <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-black flex items-center gap-2">
                <Zap class="w-4 h-4 text-indigo-500" />
                Probar Respuesta Abierta en Tiempo Real
              </h2>
              <span class="text-[11px] text-slate-400">Simulador con motor activo</span>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                Escribe cualquier respuesta o comentario del colaborador:
              </label>
              <textarea
                v-model="textoPrueba"
                rows="4"
                placeholder="Ejemplo: 'Mi supervisor no me escucha cuando tengo dudas y solo me grita delante de todos cuando algo sale mal...'"
                class="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
                @keydown.enter.ctrl="ejecutarAnalisisPrueba"
              ></textarea>
              <span class="text-[10px] text-slate-400 mt-1 block">Presiona Ctrl + Enter o el botón para analizar.</span>
            </div>

            <div class="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                @click="textoPrueba = ''; resultadoPrueba = null"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Limpiar
              </button>

              <button
                type="button"
                @click="ejecutarAnalisisPrueba"
                :disabled="analizando"
                class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw v-if="analizando" class="w-4 h-4 animate-spin" />
                <Sparkles v-else class="w-4 h-4" />
                <span>{{ analizando ? 'Analizando...' : 'Analizar y Encasillar con IA' }}</span>
              </button>
            </div>

            <!-- Ejemplos Rápidos de Prueba -->
            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Cargar frases de prueba rápidas:
              </span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  @click="cargarFraseRapida('Mi supervisor hace favoritismo y descalifica mi trabajo sin motivo.')"
                  class="px-2.5 py-1 rounded-xl text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors cursor-pointer font-medium"
                >
                  🚨 Queja de Liderazgo
                </button>
                <button
                  type="button"
                  @click="cargarFraseRapida('Llego a mi casa con ansiedad y colapso emocional por la presión diaria.')"
                  class="px-2.5 py-1 rounded-xl text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors cursor-pointer font-medium"
                >
                  🚨 Crisis Anímica
                </button>
                <button
                  type="button"
                  @click="cargarFraseRapida('El ambiente es cordial y me siento muy respaldado por todo el equipo.')"
                  class="px-2.5 py-1 rounded-xl text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 transition-colors cursor-pointer font-medium"
                >
                  ✅ Percepción Positiva
                </button>
                <button
                  type="button"
                  @click="cargarFraseRapida('Recomiendo mejorar la velocidad del internet y el aire acondicionado.')"
                  class="px-2.5 py-1 rounded-xl text-[11px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/50 hover:bg-sky-100 transition-colors cursor-pointer font-medium"
                >
                  💡 Sugerencia Neutra
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Derecho: Veredicto de la IA -->
        <div class="lg:col-span-5 space-y-4">
          <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-h-[350px] flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 class="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                  <Activity class="w-3.5 h-3.5 text-indigo-500" />
                  Diagnóstico y Encasillamiento
                </h3>
                <span v-if="resultadoPrueba" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                  Confianza: {{ resultadoPrueba.confianza }}%
                </span>
              </div>

              <!-- Estado Inicial Sin Análisis -->
              <div v-if="!resultadoPrueba" class="py-12 text-center space-y-2">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-500 mx-auto">
                  <Cpu class="w-6 h-6" />
                </div>
                <p class="text-xs font-bold text-slate-700 dark:text-slate-300">Esperando texto para analizar</p>
                <p class="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Escribe una frase en el panel izquierdo o selecciona un ejemplo rápido para ver la clasificación en vivo.
                </p>
              </div>

              <!-- Resultados del Análisis -->
              <div v-else class="space-y-4 pt-3">
                <div
                  :class="[
                    'p-3.5 rounded-2xl border flex items-center justify-between gap-3',
                    resultadoPrueba.clasificacion === 'Buena'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : resultadoPrueba.clasificacion === 'Mala'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                  ]"
                >
                  <div class="flex items-center gap-2.5">
                    <CheckCircle2 v-if="resultadoPrueba.clasificacion === 'Buena'" class="w-6 h-6 text-emerald-500 shrink-0" />
                    <ShieldAlert v-else-if="resultadoPrueba.clasificacion === 'Mala'" class="w-6 h-6 text-rose-500 shrink-0" />
                    <AlertTriangle v-else class="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                      <span class="text-[10px] uppercase font-mono font-bold opacity-80 block">Clasificación IA:</span>
                      <strong class="text-sm font-black">
                        {{ resultadoPrueba.clasificacion === 'Buena' ? 'Respuesta Favorable (Buena)' : resultadoPrueba.clasificacion === 'Mala' ? 'Respuesta Crítica (Alerta Activa)' : 'Respuesta Regular / Neutra' }}
                      </strong>
                    </div>
                  </div>
                  <span class="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
                    {{ resultadoPrueba.puntajeEstimado }}/5.0
                  </span>
                </div>

                <div v-if="resultadoPrueba.alertaAsignada" class="p-3.5 rounded-2xl bg-rose-100/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                      <component :is="obtenerIconoComponente(resultadoPrueba.alertaAsignada.icono)" class="w-3.5 h-3.5 text-rose-600" />
                      Alerta Encasillada:
                    </span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
                      {{ obtenerEtiquetaNivel(resultadoPrueba.alertaAsignada.nivel) }}
                    </span>
                  </div>
                  <p class="text-xs font-black text-rose-900 dark:text-rose-100">
                    {{ resultadoPrueba.alertaAsignada.nombre }}
                  </p>
                  <p class="text-[11px] text-rose-700 dark:text-rose-300">
                    Protocolo sugerido: {{ resultadoPrueba.alertaAsignada.protocoloAccion }}
                  </p>
                </div>

                <div v-if="resultadoPrueba.palabrasDetectadas.length > 0" class="space-y-1">
                  <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">Términos gatillo detectados:</span>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="pal in resultadoPrueba.palabrasDetectadas"
                      :key="pal"
                      class="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      #{{ pal }}
                    </span>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span class="text-[10px] font-bold uppercase text-slate-400 block">Explicación del Razonamiento:</span>
                  <p class="leading-relaxed">{{ resultadoPrueba.razonamiento }}</p>
                </div>
              </div>
            </div>

            <div v-if="resultadoPrueba" class="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                @click="guardarPruebaComoEjemplo"
                class="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Save class="w-4 h-4" />
                <span>Guardar este caso como Ejemplo de Entrenamiento</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- PESTAÑA 2: CRITERIOS DE ENTRENAMIENTO & REGLAS DE LA IA -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <section v-if="pestanaActiva === 'criterios'" class="space-y-6">
        <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 class="text-sm font-black flex items-center gap-2">
                <BrainCircuit class="w-4 h-4 text-indigo-500" />
                Directrices Generales &amp; Criterios de Calificación
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Define cómo la Inteligencia Artificial debe interpretar las respuestas del personal.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-600 dark:text-slate-300">Sensibilidad:</span>
              <select
                v-model="configuracion.sensibilidad"
                @change="actualizarConfiguracion({ sensibilidad: configuracion.sensibilidad })"
                class="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Estricta">Estricta (Cero Falsas Alarmas)</option>
                <option value="Equilibrada">Equilibrada (Recomendada)</option>
                <option value="Sensible">Sensible (Detección Temprana)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                <span>¿Cuándo es "Buena" (Favorable)?</span>
              </div>
              <textarea
                v-model="configuracion.criteriosBuenas"
                rows="3"
                class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800/80 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <div class="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle class="w-4 h-4 text-amber-500" />
                <span>¿Cuándo es "Regular" (Neutra)?</span>
              </div>
              <textarea
                v-model="configuracion.criteriosRegulares"
                rows="3"
                class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800/80 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
            </div>

            <div class="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <div class="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                <ShieldAlert class="w-4 h-4 text-rose-500" />
                <span>¿Cuándo es "Mala" (Alerta Crítica)?</span>
              </div>
              <textarea
                v-model="configuracion.criteriosMalas"
                rows="3"
                class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-rose-300 dark:border-rose-800/80 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end">
            <button
              type="button"
              @click="actualizarConfiguracion(configuracion)"
              class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save class="w-4 h-4" />
              <span>Guardar Criterios de IA</span>
            </button>
          </div>
        </div>

        <!-- Casos de Entrenamiento -->
        <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-black flex items-center gap-2">
                <BookOpen class="w-4 h-4 text-indigo-500" />
                Casos y Ejemplos de Entrenamiento ({{ ejemplosEntrenamiento.length }})
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                La IA aprende directamente de estos ejemplos prácticos para mejorar su precisión.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  @click="filtroEjemplos = 'Todas'"
                  :class="['px-2.5 py-1 rounded-lg transition-all', filtroEjemplos === 'Todas' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500']"
                >Todas</button>
                <button
                  type="button"
                  @click="filtroEjemplos = 'Buena'"
                  :class="['px-2.5 py-1 rounded-lg transition-all', filtroEjemplos === 'Buena' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500']"
                >Buenas</button>
                <button
                  type="button"
                  @click="filtroEjemplos = 'Regular'"
                  :class="['px-2.5 py-1 rounded-lg transition-all', filtroEjemplos === 'Regular' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-500']"
                >Regulares</button>
                <button
                  type="button"
                  @click="filtroEjemplos = 'Mala'"
                  :class="['px-2.5 py-1 rounded-lg transition-all', filtroEjemplos === 'Mala' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500']"
                >Malas</button>
              </div>

              <button
                type="button"
                @click="modalNuevoEjemplo = true"
                class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus class="w-4 h-4" />
                <span>Añadir Caso</span>
              </button>
            </div>
          </div>

          <!-- Lista de Ejemplos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div
              v-for="ej in ejemplosFiltrados"
              :key="ej.id"
              class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span
                    :class="[
                      'text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border',
                      ej.clasificacion === 'Buena'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                        : ej.clasificacion === 'Mala'
                        ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 text-rose-800 dark:text-rose-200'
                        : 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 text-amber-800 dark:text-amber-200'
                    ]"
                  >
                    {{ ej.clasificacion }}
                  </span>

                  <button
                    type="button"
                    @click="eliminarEjemplo(ej.id)"
                    class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="Eliminar este ejemplo"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <p class="text-xs font-medium text-slate-900 dark:text-slate-100 italic leading-relaxed">
                  "{{ ej.textoEjemplo }}"
                </p>

                <div v-if="ej.nombreAlerta" class="flex items-center gap-1.5 text-[11px] text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/50 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50">
                  <ShieldAlert class="w-3.5 h-3.5 text-rose-500" />
                  <span>Alerta: {{ ej.nombreAlerta }}</span>
                </div>
              </div>

              <div class="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <strong class="text-slate-700 dark:text-slate-300">Criterio:</strong> {{ ej.explicacionCriterio }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- PESTAÑA 3: CATÁLOGO DE ALERTAS & PALABRAS ASOCIADAS -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <section v-if="pestanaActiva === 'alertas'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-black flex items-center gap-2">
              <ShieldAlert class="w-5 h-5 text-rose-500" />
              Tipos de Alertas, Íconos, Colores &amp; Niveles
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Crea o personaliza alertas con íconos identificativos, colores distintivos, niveles de severidad y palabras asociadas.
            </p>
          </div>

          <button
            type="button"
            @click="abrirModalCrearAlerta"
            class="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus class="w-4 h-4" />
            <span>Crear Nueva Alerta</span>
          </button>
        </div>

        <!-- Tarjetas de Alertas con Ícono y Color Personalizado -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="alerta in tiposAlertas"
            :key="alerta.id"
            class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4 transition-all relative overflow-hidden"
            :style="{ borderTop: `4px solid ${alerta.color || '#ef4444'}` }"
          >
            <div class="space-y-3">
              <!-- Header de la Alerta -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                    :style="{ backgroundColor: alerta.color || '#ef4444' }"
                  >
                    <component :is="obtenerIconoComponente(alerta.icono)" class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="text-xs font-black leading-tight text-slate-900 dark:text-white">
                      {{ alerta.nombre }}
                    </h3>
                    <span class="text-[10px] font-mono font-bold" :style="{ color: alerta.color || '#ef4444' }">
                      {{ obtenerEtiquetaNivel(alerta.nivel) }} · {{ alerta.severidad }}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  @click="toggleActiva(alerta.id)"
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer',
                    alerta.activa
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300'
                  ]"
                >
                  {{ alerta.activa ? 'Activa' : 'Inactiva' }}
                </button>
              </div>

              <!-- Descripción -->
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {{ alerta.descripcion }}
              </p>

              <!-- Palabras Clave Asociadas -->
              <div class="space-y-1.5 pt-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Palabras Clave Asociadas ({{ alerta.palabrasClave.length }}):
                </span>
                <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  <span
                    v-for="pal in alerta.palabrasClave"
                    :key="pal"
                    class="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {{ pal }}
                  </span>
                </div>
              </div>

              <!-- Protocolo -->
              <div v-if="alerta.protocoloAccion" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400">
                <strong class="text-slate-800 dark:text-slate-200">Protocolo:</strong> {{ alerta.protocoloAccion }}
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                @click="abrirModalEditarAlerta(alerta)"
                class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit class="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                @click="confirmarEliminarAlerta(alerta.id, alerta.nombre)"
                class="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- PESTAÑA 4: MATRIZ DE VINCULACIÓN CON ENCUESTAS -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <section v-if="pestanaActiva === 'matriz'" class="space-y-4">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 shrink-0">
              <FolderOpen class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-sm font-black">Vinculación de Alertas en Preguntas y Opciones</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Las alertas creadas en este módulo están sincronizadas en tiempo real con todas las encuestas y editores de la plataforma.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <Tag class="w-4 h-4" />
                <span>1. En Respuestas de Opción Múltiple</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                En el <strong>Editor de Preguntas</strong>, puedes activar el ícono 🔔 en cualquier opción de respuesta específica (ej. *"Más de 6 meses"*, *"No recibo feedback"*) y elegir del selector la alerta correspondiente. Cuando un colaborador marque esa opción, se generará la alerta instantáneamente con su ícono y color.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <BrainCircuit class="w-4 h-4" />
                <span>2. En Respuestas Abiertas y Texto Libre</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cuando un colaborador escribe en una caja de texto libre (preguntas abiertas de diagnóstico, conflictos o sugerencias), el motor de <strong>Reconocimiento de IA</strong> analiza semánticamente el texto según tus criterios y palabras clave, y si detecta un caso crítico, lo encasilla y notifica en el Dashboard de Alertas.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>

    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: CREAR / EDITAR ALERTA CON SELECTOR DE ÍCONO Y COLOR -->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <div
      v-if="modalCrearAlerta"
      class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="modalCrearAlerta = false"
    >
      <div class="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              :style="{ backgroundColor: formularioAlerta.color || '#ef4444' }"
            >
              <component :is="obtenerIconoComponente(formularioAlerta.icono)" class="w-4 h-4" />
            </div>
            <h3 class="text-sm font-black">
              {{ editandoAlertaId ? 'Editar Tipo de Alerta' : 'Crear Nuevo Tipo de Alerta' }}
            </h3>
          </div>
          <button
            type="button"
            @click="modalCrearAlerta = false"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Nombre -->
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nombre de la Alerta:</label>
            <input
              v-model="formularioAlerta.nombre"
              type="text"
              placeholder="Ej. Mala Gestión de los Jefes &amp; Liderazgo Tóxico"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <!-- Selector de Ícono y Color -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <!-- Selector de Íconos -->
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Ícono Identificativo:</label>
              <div class="grid grid-cols-5 gap-1.5">
                <button
                  v-for="ico in listaIconosDisponibles"
                  :key="ico.nombre"
                  type="button"
                  @click="formularioAlerta.icono = ico.nombre"
                  :class="[
                    'p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer',
                    formularioAlerta.icono === ico.nombre
                      ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-400/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-rose-300'
                  ]"
                  :title="ico.etiqueta"
                >
                  <component :is="ico.componente" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Selector de Color -->
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Color Personalizado:</label>
              <div class="grid grid-cols-5 gap-1.5">
                <button
                  v-for="col in listaColoresDisponibles"
                  :key="col.hex"
                  type="button"
                  @click="formularioAlerta.color = col.hex"
                  :class="[
                    'w-7 h-7 rounded-xl border transition-all cursor-pointer mx-auto flex items-center justify-center text-white',
                    formularioAlerta.color === col.hex ? 'ring-2 ring-slate-900 dark:ring-white scale-110 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
                  ]"
                  :style="{ backgroundColor: col.hex }"
                  :title="col.nombre"
                >
                  <Check v-if="formularioAlerta.color === col.hex" class="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          </div>

          <!-- Nivel y Severidad -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nivel de Alerta:</label>
              <select
                v-model="formularioAlerta.nivel"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option :value="1">Nivel 1 (Crítico / Inmediato)</option>
                <option :value="2">Nivel 2 (Alto)</option>
                <option :value="3">Nivel 3 (Moderado)</option>
                <option :value="4">Nivel 4 (Preventivo / Bajo)</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Severidad:</label>
              <select
                v-model="formularioAlerta.severidad"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Crítica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Moderada">Moderada</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Descripción para la IA:</label>
            <textarea
              v-model="formularioAlerta.descripcion"
              rows="2"
              placeholder="Explica qué conductas o hechos constituyen esta alerta para que la IA los reconozca..."
              class="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
            ></textarea>
          </div>

          <!-- Palabras Clave Asociadas (Chips) -->
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Palabras Clave Asociadas (Escribe y presiona Enter):
            </label>
            <div class="flex items-center gap-2 mb-2">
              <input
                v-model="palabraInput"
                type="text"
                placeholder="Ej. favoritismo, gritos, autoritario..."
                class="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                @keydown.enter.prevent="agregarPalabraClave"
              />
              <button
                type="button"
                @click="agregarPalabraClave"
                class="px-3.5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Añadir
              </button>
            </div>

            <div class="flex flex-wrap gap-1.5 min-h-[35px] p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span
                v-for="p in formularioAlerta.palabrasClave"
                :key="p"
                class="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800"
              >
                {{ p }}
                <button type="button" @click="removerPalabraClave(p)" class="hover:text-rose-900 font-bold ml-0.5">&times;</button>
              </span>
              <span v-if="formularioAlerta.palabrasClave.length === 0" class="text-[11px] text-slate-400 italic">
                Sin palabras clave asociadas aún.
              </span>
            </div>
          </div>

          <!-- Protocolo de Acción -->
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Protocolo de Acción:</label>
            <input
              v-model="formularioAlerta.protocoloAccion"
              type="text"
              placeholder="Ej. Citación inmediata a Comité de Convivencia..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            @click="modalCrearAlerta = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="guardarAlertaFormulario"
            class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
          >
            {{ editandoAlertaId ? 'Guardar Cambios' : 'Crear Alerta' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: AÑADIR CASO DE ENTRENAMIENTO -->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <div
      v-if="modalNuevoEjemplo"
      class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="modalNuevoEjemplo = false"
    >
      <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-sm font-black flex items-center gap-2">
            <Plus class="w-4 h-4 text-indigo-500" />
            Añadir Ejemplo de Entrenamiento para la IA
          </h3>
          <button
            type="button"
            @click="modalNuevoEjemplo = false"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Frase o Respuesta de Muestra:</label>
            <textarea
              v-model="nuevoEjemploForm.texto"
              rows="3"
              placeholder="Escribe la frase que un empleado podría responder..."
              class="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Calificación Esperada:</label>
              <select
                v-model="nuevoEjemploForm.clasificacion"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Mala">Mala (Alerta Crítica)</option>
                <option value="Regular">Regular (Neutra / Sugerencia)</option>
                <option value="Buena">Buena (Favorable)</option>
              </select>
            </div>

            <div v-if="nuevoEjemploForm.clasificacion === 'Mala'">
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Alerta a Encasillar:</label>
              <select
                v-model="nuevoEjemploForm.tipoAlertaId"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Seleccionar Alerta --</option>
                <option
                  v-for="al in tiposAlertas"
                  :key="al.id"
                  :value="al.id"
                >
                  {{ al.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Explicación del Criterio para la IA:</label>
            <input
              v-model="nuevoEjemploForm.explicacion"
              type="text"
              placeholder="Ej. Manifiesta trato despectivo y favoritismo injustificado..."
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            @click="modalNuevoEjemplo = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="guardarNuevoEjemploManual"
            class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
          >
            Guardar Caso
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import {
  BrainCircuit,
  Sparkles,
  Sliders,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  RotateCcw,
  BookOpen,
  Activity,
  Tag,
  Zap,
  HelpCircle,
  TrendingUp,
  Save,
  MessageSquare,
  Flame,
  Check,
  X,
  Cpu,
  RefreshCw,
  FolderOpen,
  HeartCrack,
  Skull,
  UserX,
  Clock,
  Coins,
  Scale,
  Smile,
  Frown,
  Meh
} from 'lucide-vue-next'

export default {
  name: 'ReconocimientoIAView'
}
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTiposAlertas, type TipoAlertaPersonalizada, type NivelAlerta, type SeveridadAlerta, type ModoEnfoqueAlerta } from '@/Almacenes/useTiposAlertas'
import { useReconocimientoIA, type CalificacionRespuesta, type NivelSensibilidad, type ResultadoAnalisisIA } from '@/Almacenes/useReconocimientoIA'
import { useToast } from '@/Almacenes/useToast'

const { mostrarExito, mostrarAviso, mostrarError } = useToast()
const {
  tiposAlertas,
  tiposActivos,
  crearTipoAlerta,
  editarTipoAlerta,
  actualizarTipoAlerta,
  eliminarTipoAlerta,
  toggleActiva,
  obtenerEtiquetaNivel,
  obtenerClaseColorNivel
} = useTiposAlertas()

const {
  configuracion,
  ejemplosEntrenamiento,
  estadisticasEntrenamiento,
  actualizarConfiguracion,
  agregarEjemplo,
  eliminarEjemplo,
  restablecerEjemplosPorDefecto,
  analizarTextoConIA
} = useReconocimientoIA()

// Mapa de íconos disponibles
const listaIconosDisponibles = [
  { nombre: 'ShieldAlert', etiqueta: 'Escudo Alerta', componente: ShieldAlert },
  { nombre: 'Flame', etiqueta: 'Fuego / Urgencia', componente: Flame },
  { nombre: 'HeartCrack', etiqueta: 'Corazón Roto / Salud', componente: HeartCrack },
  { nombre: 'AlertTriangle', etiqueta: 'Triángulo Alerta', componente: AlertTriangle },
  { nombre: 'UserX', etiqueta: 'Usuario / Conflicto', componente: UserX },
  { nombre: 'Skull', etiqueta: 'Riesgo Crítico', componente: Skull },
  { nombre: 'Clock', etiqueta: 'Tiempo / Horario', componente: Clock },
  { nombre: 'Coins', etiqueta: 'Salario / Finanzas', componente: Coins },
  { nombre: 'Scale', etiqueta: 'Justicia / Equidad', componente: Scale },
  { nombre: 'Zap', etiqueta: 'Rayo / Impacto', componente: Zap }
]

// Mapa de colores disponibles
const listaColoresDisponibles = [
  { nombre: 'Rojo Carmesí', hex: '#ef4444' },
  { nombre: 'Rosa Intenso', hex: '#f43f5e' },
  { nombre: 'Naranja Fuego', hex: '#f97316' },
  { nombre: 'Ámbar Alerta', hex: '#f59e0b' },
  { nombre: 'Púrpura Profundo', hex: '#8b5cf6' },
  { nombre: 'Azul Eléctrico', hex: '#3b82f6' },
  { nombre: 'Cian Claro', hex: '#06b6d4' },
  { nombre: 'Esmeralda', hex: '#10b981' },
  { nombre: 'Índigo Real', hex: '#6366f1' },
  { nombre: 'Pizarra Oscura', hex: '#64748b' }
]

const obtenerIconoComponente = (nombre?: string) => {
  const encontrado = listaIconosDisponibles.find(i => i.nombre === nombre)
  return encontrado ? encontrado.componente : ShieldAlert
}

// Pestañas de la vista
type PestanaActiva = 'simulador' | 'criterios' | 'alertas' | 'matriz'
const pestanaActiva = ref<PestanaActiva>('simulador')

// ─── ESTADO: SIMULADOR EN VIVO (PLAYGROUND) ──────────────────────────────────
const textoPrueba = ref('')
const resultadoPrueba = ref<ResultadoAnalisisIA | null>(null)
const analizando = ref(false)

const ejecutarAnalisisPrueba = () => {
  if (!textoPrueba.value.trim()) {
    mostrarAviso('Texto requerido', 'Escribe o selecciona una respuesta de prueba.')
    return
  }
  analizando.value = true
  setTimeout(() => {
    resultadoPrueba.value = analizarTextoConIA(textoPrueba.value)
    analizando.value = false
  }, 250)
}

const cargarFraseRapida = (frase: string) => {
  textoPrueba.value = frase
  ejecutarAnalisisPrueba()
}

const guardarPruebaComoEjemplo = async () => {
  if (!resultadoPrueba.value || !textoPrueba.value.trim()) return

  await agregarEjemplo({
    textoEjemplo: textoPrueba.value.trim(),
    clasificacion: resultadoPrueba.value.clasificacion,
    tipoAlertaId: resultadoPrueba.value.alertaAsignada?.id,
    nombreAlerta: resultadoPrueba.value.alertaAsignada?.nombre,
    explicacionCriterio: resultadoPrueba.value.razonamiento
  })
}

// ─── ESTADO: CRITERIOS & EJEMPLOS ────────────────────────────────────────────
const filtroEjemplos = ref<'Todas' | 'Buena' | 'Regular' | 'Mala'>('Todas')
const modalNuevoEjemplo = ref(false)

const nuevoEjemploForm = ref<{
  texto: string
  clasificacion: CalificacionRespuesta
  tipoAlertaId?: string
  explicacion: string
}>({
  texto: '',
  clasificacion: 'Mala',
  tipoAlertaId: '',
  explicacion: ''
})

const ejemplosFiltrados = computed(() => {
  if (filtroEjemplos.value === 'Todas') return ejemplosEntrenamiento.value
  return ejemplosEntrenamiento.value.filter(e => e.clasificacion === filtroEjemplos.value)
})

const guardarNuevoEjemploManual = async () => {
  if (!nuevoEjemploForm.value.texto.trim()) {
    mostrarAviso('Campo requerido', 'Ingresa el texto del ejemplo de respuesta.')
    return
  }

  const alertaAsoc = nuevoEjemploForm.value.tipoAlertaId
    ? tiposAlertas.value.find(t => t.id === nuevoEjemploForm.value.tipoAlertaId)
    : undefined

  await agregarEjemplo({
    textoEjemplo: nuevoEjemploForm.value.texto.trim(),
    clasificacion: nuevoEjemploForm.value.clasificacion,
    tipoAlertaId: alertaAsoc?.id,
    nombreAlerta: alertaAsoc?.nombre,
    explicacionCriterio: nuevoEjemploForm.value.explicacion.trim() || `Clasificado como ${nuevoEjemploForm.value.clasificacion} por el administrador.`
  })

  nuevoEjemploForm.value = {
    texto: '',
    clasificacion: 'Mala',
    tipoAlertaId: '',
    explicacion: ''
  }
  modalNuevoEjemplo.value = false
}

// ─── ESTADO: GESTOR DE ALERTAS & PALABRAS CLAVE ──────────────────────────────
const modalCrearAlerta = ref(false)
const editandoAlertaId = ref<string | null>(null)
const palabraInput = ref('')

const formularioAlerta = ref<{
  nombre: string
  descripcion: string
  nivel: NivelAlerta
  severidad: SeveridadAlerta
  modoEnfoque: ModoEnfoqueAlerta
  enfoqueDetalle: string
  palabrasClave: string[]
  protocoloAccion: string
  icono: string
  color: string
}>({
  nombre: '',
  descripcion: '',
  nivel: 1,
  severidad: 'Crítica',
  modoEnfoque: 'especifico',
  enfoqueDetalle: '',
  palabrasClave: [],
  protocoloAccion: '',
  icono: 'ShieldAlert',
  color: '#ef4444'
})

const abrirModalCrearAlerta = () => {
  editandoAlertaId.value = null
  formularioAlerta.value = {
    nombre: '',
    descripcion: '',
    nivel: 1,
    severidad: 'Crítica',
    modoEnfoque: 'especifico',
    enfoqueDetalle: '',
    palabrasClave: [],
    protocoloAccion: 'Notificación inmediata a Gestión Humana y activación de protocolo preventivo.',
    icono: 'ShieldAlert',
    color: '#ef4444'
  }
  palabraInput.value = ''
  modalCrearAlerta.value = true
}

const abrirModalEditarAlerta = (alerta: TipoAlertaPersonalizada) => {
  editandoAlertaId.value = alerta.id
  formularioAlerta.value = {
    nombre: alerta.nombre,
    descripcion: alerta.descripcion,
    nivel: alerta.nivel,
    severidad: alerta.severidad,
    modoEnfoque: alerta.modoEnfoque,
    enfoqueDetalle: alerta.enfoqueDetalle || alerta.descripcion,
    palabrasClave: [...alerta.palabrasClave],
    protocoloAccion: alerta.protocoloAccion,
    icono: alerta.icono || 'ShieldAlert',
    color: alerta.color || (alerta.nivel === 1 ? '#ef4444' : alerta.nivel === 2 ? '#f43f5e' : alerta.nivel === 3 ? '#f59e0b' : '#0ea5e9')
  }
  palabraInput.value = ''
  modalCrearAlerta.value = true
}

const agregarPalabraClave = () => {
  const p = palabraInput.value.trim().toLowerCase()
  if (p && !formularioAlerta.value.palabrasClave.includes(p)) {
    formularioAlerta.value.palabrasClave.push(p)
  }
  palabraInput.value = ''
}

const removerPalabraClave = (palabra: string) => {
  formularioAlerta.value.palabrasClave = formularioAlerta.value.palabrasClave.filter(p => p !== palabra)
}

const guardarAlertaFormulario = async () => {
  if (!formularioAlerta.value.nombre.trim()) {
    mostrarAviso('Nombre requerido', 'Ingresa el nombre del tipo de alerta.')
    return
  }

  if (formularioAlerta.value.palabrasClave.length === 0 && palabraInput.value.trim()) {
    agregarPalabraClave()
  }

  if (editandoAlertaId.value) {
    await editarTipoAlerta(editandoAlertaId.value, {
      nombre: formularioAlerta.value.nombre.trim(),
      descripcion: formularioAlerta.value.descripcion.trim(),
      nivel: formularioAlerta.value.nivel,
      severidad: formularioAlerta.value.severidad,
      modoEnfoque: formularioAlerta.value.modoEnfoque,
      enfoqueDetalle: formularioAlerta.value.enfoqueDetalle.trim(),
      palabrasClave: formularioAlerta.value.palabrasClave,
      protocoloAccion: formularioAlerta.value.protocoloAccion.trim(),
      icono: formularioAlerta.value.icono,
      color: formularioAlerta.value.color
    })
    mostrarExito('Alerta Actualizada', 'Los cambios en la alerta, color e ícono han sido guardados.')
  } else {
    await crearTipoAlerta({
      nombre: formularioAlerta.value.nombre.trim(),
      descripcion: formularioAlerta.value.descripcion.trim(),
      nivel: formularioAlerta.value.nivel,
      severidad: formularioAlerta.value.severidad,
      modoEnfoque: formularioAlerta.value.modoEnfoque,
      enfoqueDetalle: formularioAlerta.value.enfoqueDetalle.trim(),
      palabrasClave: formularioAlerta.value.palabrasClave,
      protocoloAccion: formularioAlerta.value.protocoloAccion.trim(),
      icono: formularioAlerta.value.icono,
      color: formularioAlerta.value.color
    })
    mostrarExito('Alerta Creada', 'El nuevo tipo de alerta ha sido registrado e integrado a la IA.')
  }

  modalCrearAlerta.value = false
}

const confirmarEliminarAlerta = async (id: string, nombre: string) => {
  if (confirm(`¿Estás seguro de eliminar el tipo de alerta "${nombre}"?`)) {
    await eliminarTipoAlerta(id)
  }
}
</script>
