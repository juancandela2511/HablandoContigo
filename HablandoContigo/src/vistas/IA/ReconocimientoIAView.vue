<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-['Poppins',sans-serif] transition-colors duration-300">
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- ── ENCABEZADO PRINCIPAL ── -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden text-left">
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
              Calibra y entrena a la Inteligencia Artificial para clasificar respuestas abiertas (Buenas, Regulares o Malas), detectar patrones/menciones recurrentes y aplicar estudios psicosociales normativos.
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

        <button
          type="button"
          @click="pestanaActiva = 'estudios'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            pestanaActiva === 'estudios'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <GraduationCap class="w-4 h-4" />
          <span>Estudios &amp; Marcos Psicosociales (5)</span>
        </button>
      </nav>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- PESTAÑA 1: SIMULADOR Y LABORATORIO EN VIVO -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <section v-if="pestanaActiva === 'simulador'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
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
                    @click="cargarFraseRapida('Daniel me tocó sin mi consentimiento en la oficina y fue inapropiado.')"
                    class="px-2.5 py-1 rounded-xl text-[11px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-900 hover:bg-red-200 transition-colors cursor-pointer font-bold flex items-center gap-1"
                  >
                    <AlertTriangle class="w-3 h-3 text-red-600" />
                    <span>🚨 Acoso Físico (Daniel)</span>
                  </button>
                  <button
                    type="button"
                    @click="cargarFraseRapida('Varias personas en el equipo opinamos que Omar nos trata mal y nos descalifica en público.')"
                    class="px-2.5 py-1 rounded-xl text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors cursor-pointer font-medium flex items-center gap-1"
                  >
                    <Users class="w-3 h-3 text-rose-500" />
                    <span>🚨 Conflicto / Mención (Omar)</span>
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
                    @click="cargarFraseRapida('Sugiero pausas activas obligatorias y talleres de comunicación.')"
                    class="px-2.5 py-1 rounded-xl text-[11px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/50 hover:bg-sky-100 transition-colors cursor-pointer font-medium"
                  >
                    💡 Sugerencia de Mejora
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
                  <span v-if="resultadoPrueba" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Confianza: {{ resultadoPrueba.confianza }}%
                  </span>
                </div>

                <div v-if="resultadoPrueba" class="space-y-4 pt-4">
                  <!-- Badge de Clasificación -->
                  <div class="flex items-center justify-between">
                    <span 
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5',
                        resultadoPrueba.clasificacion === 'Mala'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          : resultadoPrueba.clasificacion === 'Buena'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      ]"
                    >
                      <AlertTriangle v-if="resultadoPrueba.clasificacion === 'Mala'" class="w-3.5 h-3.5" />
                      <CheckCircle2 v-else-if="resultadoPrueba.clasificacion === 'Buena'" class="w-3.5 h-3.5" />
                      <HelpCircle v-else class="w-3.5 h-3.5" />
                      <span>Respuesta {{ resultadoPrueba.clasificacion }}</span>
                    </span>

                    <span class="text-xs font-bold font-mono text-slate-600 dark:text-slate-300">
                      Puntaje Estimado: {{ resultadoPrueba.puntajeEstimado }} / 5.0
                    </span>
                  </div>

                  <!-- Alerta Asignada -->
                  <div v-if="resultadoPrueba.alertaAsignada" class="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
                    <span class="text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400 block">
                      🚨 Alerta Psicosocial Encasillada (Nivel {{ resultadoPrueba.alertaAsignada.nivel }})
                    </span>
                    <h4 class="text-xs font-extrabold text-slate-900 dark:text-white">
                      {{ resultadoPrueba.alertaAsignada.nombre }}
                    </h4>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300">
                      {{ resultadoPrueba.sugerenciaAccion }}
                    </p>
                  </div>

                  <!-- Razonamiento -->
                  <div class="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] font-bold text-slate-400 uppercase block">Razonamiento de la IA:</span>
                    <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{{ resultadoPrueba.razonamiento }}"
                    </p>
                  </div>

                  <!-- Palabras Clave Detectadas -->
                  <div v-if="resultadoPrueba.palabrasDetectadas.length > 0" class="space-y-1">
                    <span class="text-[10px] font-bold text-slate-400 uppercase block">Términos Clave Coincidentes:</span>
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="p in resultadoPrueba.palabrasDetectadas" 
                        :key="p" 
                        class="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono font-bold"
                      >
                        {{ p }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-else class="py-16 text-center text-slate-400 space-y-2">
                  <BrainCircuit class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
                  <p class="text-xs font-medium">Esperando texto para analizar...</p>
                  <p class="text-[11px] text-slate-400">Escribe una frase o selecciona un ejemplo rápido para ver la clasificación en vivo.</p>
                </div>
              </div>

              <div v-if="resultadoPrueba" class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  @click="guardarPruebaComoEjemplo"
                  class="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus class="w-3.5 h-3.5 text-indigo-500" />
                  <span>Guardar como Ejemplo de Entrenamiento</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── SECCIÓN DE PATRONES Y MENCIONES RECURRENTES ── -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Extracción de Menciones por la IA
              </span>
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users class="w-4 h-4 text-indigo-500" />
                <span>Patrones y Menciones Recurrentes de Personas o Problemas</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                La IA agrupa automáticamente respuestas cuando varias personas hacen referencia al mismo sujeto, líder o temática crítica.
              </p>
            </div>
          </div>

          <div v-if="patronesDetectadosReales.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="patron in patronesDetectadosReales"
              :key="patron.sujetoOTema"
              class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5"
            >
              <div class="flex items-center justify-between">
                <span 
                  :class="[
                    'text-[10px] font-extrabold px-2 py-0.5 rounded-full border',
                    patron.categoria === 'Acoso / Vulneración'
                      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300'
                      : patron.categoria === 'Liderazgo & Trato'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                      : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300'
                  ]"
                >
                  {{ patron.categoria }}
                </span>
                <span class="text-xs font-black font-mono text-slate-700 dark:text-slate-300">
                  {{ patron.conteo }} reportes reales
                </span>
              </div>

              <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                {{ patron.sujetoOTema }}
              </h4>

              <div class="space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Frases reales de muestra:</span>
                <div v-for="(frase, fIdx) in patron.frasesMencionadas" :key="fIdx" class="text-[11px] text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{{ frase }}"
                </div>
              </div>
            </div>
          </div>
          <div v-else class="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No se han detectado patrones o menciones recurrentes en las respuestas reales registradas. El motor de IA procesará y agrupará automáticamente las respuestas a medida que ingresen en el sistema.
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- PESTAÑA 2: CRITERIOS & EJEMPLOS DE ENTRENAMIENTO -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <section v-else-if="pestanaActiva === 'criterios'" class="space-y-6 text-left">
        <!-- Tarjetas de Directivas Generales -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold flex items-center gap-2">
              <Sliders class="w-4 h-4 text-indigo-500" />
              <span>Directrices de Calibración General</span>
            </h3>
            <button
              type="button"
              @click="guardarCalibracionForm"
              class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Guardar Cambios de Calibración
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="space-y-1.5 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
              <label class="font-bold text-emerald-800 dark:text-emerald-300 block">Criterio para Respuestas BUENAS:</label>
              <textarea
                v-model="configuracionForm.criteriosBuenas"
                rows="3"
                class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 text-xs outline-none"
              ></textarea>
            </div>

            <div class="space-y-1.5 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <label class="font-bold text-amber-800 dark:text-amber-300 block">Criterio para Respuestas REGULARES / MEJORAS:</label>
              <textarea
                v-model="configuracionForm.criteriosRegulares"
                rows="3"
                class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 text-xs outline-none"
              ></textarea>
            </div>

            <div class="space-y-1.5 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
              <label class="font-bold text-rose-800 dark:text-rose-300 block">Criterio para Respuestas MALAS / ALERTAS:</label>
              <textarea
                v-model="configuracionForm.criteriosMalas"
                rows="3"
                class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-xs outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Lista de Casos de Entrenamiento -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-bold flex items-center gap-2">
                <BrainCircuit class="w-4 h-4 text-indigo-500" />
                <span>Casos Semilla de Aprendizaje ({{ ejemplosFiltrados.length }})</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Ejemplos de entrenamiento que la IA consulta en tiempo real mediante aprendizaje guiado (Few-shot learning).
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                @click="restablecerEjemplosPorDefecto"
                class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Restablecer Fábrica
              </button>

              <button
                type="button"
                @click="modalNuevoEjemplo = true"
                class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Plus class="w-4 h-4" />
                <span>Nuevo Caso de Entrenamiento</span>
              </button>
            </div>
          </div>

          <!-- Filtros de Ejemplos -->
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400 font-semibold">Filtrar:</span>
            <button
              v-for="f in (['Todas', 'Mala', 'Regular', 'Buena'] as const)"
              :key="f"
              type="button"
              @click="filtroEjemplos = f"
              :class="[
                'px-3 py-1 rounded-xl font-bold transition-all cursor-pointer',
                filtroEjemplos === f ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              ]"
            >
              {{ f }}
            </button>
          </div>

          <!-- Grid de Ejemplos -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="ej in ejemplosFiltrados"
              :key="ej.id"
              class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 relative group flex flex-col justify-between"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span 
                    :class="[
                      'text-[10px] font-extrabold px-2 py-0.5 rounded-full border',
                      ej.clasificacion === 'Mala'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                        : ej.clasificacion === 'Buena'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                    ]"
                  >
                    Respuesta {{ ej.clasificacion }}
                  </span>

                  <button
                    type="button"
                    @click="eliminarEjemplo(ej.id)"
                    class="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Eliminar caso"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  "{{ ej.textoEjemplo }}"
                </p>

                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  <strong>Criterio:</strong> {{ ej.explicacionCriterio }}
                </p>
              </div>

              <div v-if="ej.nombreAlerta" class="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ShieldAlert class="w-3 h-3 shrink-0" />
                <span class="truncate">Encasilla en: {{ ej.nombreAlerta }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- PESTAÑA 3: CATÁLOGO DE ALERTAS Y PALABRAS CLAVE -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <section v-else-if="pestanaActiva === 'alertas'" class="space-y-6 text-left">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold flex items-center gap-2">
                <ShieldAlert class="w-4 h-4 text-indigo-500" />
                <span>Tipos de Alerta Configurados en la IA</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Configura los niveles (1 al 4), íconos, colores y palabras clave que activan cada protocolo.
              </p>
            </div>

            <button
              type="button"
              @click="abrirModalCrearAlerta"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Plus class="w-4 h-4" />
              <span>Crear Nuevo Tipo de Alerta</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="tipo in tiposAlertas"
              :key="tipo.id"
              class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between text-left"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span 
                    class="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border"
                    :class="obtenerClaseColorNivel(tipo.nivel).badge"
                  >
                    Nivel {{ tipo.nivel }} — {{ tipo.severidad }}
                  </span>

                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      @click="abrirModalEditarAlerta(tipo)"
                      class="p-1 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                      title="Editar alerta"
                    >
                      <Edit3 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="confirmarEliminarAlerta(tipo.id, tipo.nombre)"
                      class="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Eliminar alerta"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 class="text-sm font-black text-slate-900 dark:text-white">
                  {{ tipo.nombre }}
                </h4>

                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {{ tipo.descripcion }}
                </p>

                <!-- Palabras Clave -->
                <div class="space-y-1 pt-1">
                  <span class="text-[10px] font-bold text-slate-400 uppercase block">Palabras Clave Desencadenantes:</span>
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-for="kw in tipo.palabrasClave" 
                      :key="kw" 
                      class="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300"
                    >
                      {{ kw }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <strong>Protocolo de Acción:</strong>
                <p class="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {{ tipo.protocoloAccion }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- PESTAÑA 4: VINCULACIÓN CON ENCUESTAS -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <section v-else-if="pestanaActiva === 'matriz'" class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
        <div class="space-y-1">
          <h3 class="text-base font-bold flex items-center gap-2">
            <FolderOpen class="w-4 h-4 text-indigo-500" />
            <span>Vinculación con Preguntas Abiertas de las Encuestas</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            El motor analiza automáticamente las respuestas abiertas de texto libre al ser enviadas por los colaboradores.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-xs space-y-2">
          <div class="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
            <CheckCircle2 class="w-4 h-4 text-indigo-500" />
            <span>Integración Activa con el Módulo de Encuestas</span>
          </div>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
            Cada respuesta enviada en encuestas de Clima Laboral es procesada por <strong class="text-indigo-600 dark:text-indigo-400">useReconocimientoIA</strong>. Si la respuesta contiene expresiones críticas, hostigamiento o acoso, se genera automáticamente una notificación de Alerta Psicosocial en el Dashboard.
          </p>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- PESTAÑA 5: ESTUDIOS Y MARCOS PSICOSOCIALES APLICABLES -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <section v-else-if="pestanaActiva === 'estudios'" class="space-y-6 text-left">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="space-y-1">
            <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Marcos Normativos &amp; Psicométricos
            </span>
            <h3 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap class="w-5 h-5 text-indigo-500" />
              <span>Estudios &amp; Diagnósticos Psicosociales Aplicables</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Estudios científicos y regulaciones que la plataforma integra para evaluar salud mental, agotamiento laboral, acoso y clima organizacional.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              v-for="estudio in listaEstudiosPsicosociales"
              :key="estudio.id"
              class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 flex flex-col justify-between text-left hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
            >
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      :style="{ backgroundColor: estudio.color }"
                    >
                      <component :is="estudio.icono" class="w-5 h-5" />
                    </div>

                    <div>
                      <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {{ estudio.codigo }}
                      </span>
                      <h4 class="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {{ estudio.titulo }}
                      </h4>
                    </div>
                  </div>

                  <span class="text-[10px] font-mono text-slate-400 shrink-0">
                    {{ estudio.ano }}
                  </span>
                </div>

                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {{ estudio.resumen }}
                </p>

                <div class="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                  <span class="text-[10px] font-bold text-slate-400 uppercase block">¿Qué mide exactamente?</span>
                  <ul class="space-y-1">
                    <li v-for="(m, mIdx) in estudio.queMide" :key="mIdx" class="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                      <span class="text-indigo-500 font-bold">•</span>
                      <span>{{ m }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-400">Entidad / Autor:</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ estudio.entidad }}</span>
                </div>
                <div class="p-2.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40 text-[11px] text-sky-900 dark:text-sky-300">
                  <strong>Utilidad Práctica:</strong> {{ estudio.utilidadPractica }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useReconocimientoIA,
  type CalificacionRespuesta,
  type ResultadoAnalisisIA
} from '@/Almacenes/useReconocimientoIA'
import {
  useTiposAlertas,
  type TipoAlertaPersonalizada,
  type NivelAlerta,
  type ModoEnfoqueAlerta,
  type SeveridadAlerta
} from '@/Almacenes/useTiposAlertas'
import { useToast } from '@/Almacenes/useToast'
import { useNotificaciones } from '@/Almacenes/useNotificaciones'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import {
  BrainCircuit,
  Sparkles,
  Zap,
  ShieldAlert,
  FolderOpen,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Plus,
  Sliders,
  Trash2,
  Edit3,
  Users,
  GraduationCap,
  ShieldCheck,
  Flame,
  Lock,
  HeartHandshake,
  BarChart3
} from 'lucide-vue-next'

const pestanaActiva = ref<'simulador' | 'criterios' | 'alertas' | 'matriz' | 'estudios'>('simulador')

const {
  configuracion,
  ejemplosEntrenamiento,
  estadisticasEntrenamiento,
  actualizarConfiguracion,
  agregarEjemplo,
  eliminarEjemplo,
  restablecerEjemplosPorDefecto,
  analizarTextoConIA,
  extraerPatronesYMenciones
} = useReconocimientoIA()

const {
  tiposAlertas,
  crearTipoAlerta,
  editarTipoAlerta,
  eliminarTipoAlerta,
  obtenerClaseColorNivel
} = useTiposAlertas()

const { mostrarExito, mostrarAviso } = useToast()

// ─── ESTADO: SIMULADOR ───────────────────────────────────────────────────────
const textoPrueba = ref('')
const analizando = ref(false)
const resultadoPrueba = ref<ResultadoAnalisisIA | null>(null)

const ejecutarAnalisisPrueba = () => {
  if (!textoPrueba.value.trim()) {
    resultadoPrueba.value = null
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

const { alertasConvivencia } = useNotificaciones()
const { respuestasAnonimas } = useEncuestas()

const respuestasRealesAbiertas = computed(() => {
  const lista: string[] = []
  
  alertasConvivencia.value.forEach((a: any) => {
    if (a.detalleRespuesta && a.detalleRespuesta.trim()) {
      lista.push(a.detalleRespuesta.trim())
    } else if (a.mensaje && a.mensaje.trim()) {
      lista.push(a.mensaje.trim())
    }
  })

  respuestasAnonimas.value.forEach((r: any) => {
    r.respuestas?.forEach((item: any) => {
      if (typeof item.valor === 'string' && item.valor.trim().length > 3) {
        lista.push(item.valor.trim())
      }
    })
  })

  return lista
})

const patronesDetectadosReales = computed(() => {
  return extraerPatronesYMenciones(respuestasRealesAbiertas.value)
})

// ─── ESTADO: CRITERIOS & CONFIGURACIÓN ───────────────────────────────────────
const configuracionForm = ref({ ...configuracion.value })
const filtroEjemplos = ref<'Todas' | 'Buena' | 'Regular' | 'Mala'>('Todas')
const modalNuevoEjemplo = ref(false)

const ejemplosFiltrados = computed(() => {
  if (filtroEjemplos.value === 'Todas') return ejemplosEntrenamiento.value
  return ejemplosEntrenamiento.value.filter(e => e.clasificacion === filtroEjemplos.value)
})

const guardarCalibracionForm = async () => {
  await actualizarConfiguracion(configuracionForm.value)
}

// ─── ESTADO: ESTUDIOS PSICOSOCIALES ──────────────────────────────────────────
interface EstudioPsicosocial {
  id: string
  titulo: string
  codigo: string
  entidad: string
  ano: string
  categoria: string
  resumen: string
  queMide: string[]
  utilidadPractica: string
  icono: any
  color: string
}

const listaEstudiosPsicosociales: EstudioPsicosocial[] = [
  {
    id: 'estudio-001',
    titulo: 'Batería de Evaluación de Riesgo Psicosocial',
    codigo: 'Res. 2646 / NOM-035',
    entidad: 'Ministerio de Trabajo & Secretarías de Salud',
    ano: 'Normativa Oficial',
    categoria: 'Riesgo Intralaboral & Estrés',
    resumen: 'Herramienta psicométrica oficial para identificar, evaluar y prevenir los factores de riesgo psicosocial en el trabajo (demandas cualitativas/cuantitativas, control, liderazgo y jornada laboral).',
    queMide: [
      'Demandas de carga de trabajo y exigencias emocionales',
      'Control y autonomía sobre la jornada laboral',
      'Liderazgo, relaciones sociales y trato en el trabajo',
      'Recompensa y reconocimiento del desempeño'
    ],
    utilidadPractica: 'Permite clasificar a las áreas en nivel de riesgo Bajo, Medio, Alto o Muy Alto y generar los informes legales requeridos por entes reguladores.',
    icono: ShieldCheck,
    color: '#059669'
  },
  {
    id: 'estudio-002',
    titulo: 'Inventario de Burnout de Maslach (MBI)',
    codigo: 'MBI-GS / Human Services',
    entidad: 'Dra. Christina Maslach (Univ. de California, Berkeley)',
    ano: 'Estudio Estandarizado',
    categoria: 'Agotamiento Emocional & Salud Mental',
    resumen: 'Instrumento científico líder mundial para evaluar la prevalencia del síndrome de desgaste profesional (Burnout) en colaboradores.',
    queMide: [
      'Agotamiento Emocional (sensación de vaciamiento de recursos emocionales)',
      'Despersonalización / Cinismo (actitudes distantes o frías hacia el trabajo)',
      'Realización Personal (sentimiento de competencia y logro profesional)'
    ],
    utilidadPractica: 'Diagnostica si el malestar de un equipo es estrés pasajero o un estado avanzado de despersonalización y colapso anímico.',
    icono: Flame,
    color: '#ef4444'
  },
  {
    id: 'estudio-003',
    titulo: 'Escala de Seguridad Psicológica',
    codigo: 'Harvard Psychological Safety Survey',
    entidad: 'Dra. Amy Edmondson (Harvard Business School)',
    ano: 'Investigación Harvard',
    categoria: 'Seguridad Psicológica & Apertura',
    resumen: 'Estudio que mide la creencia compartida por un equipo de que el entorno es seguro para asumir riesgos interpersonales sin temor a represalias, gritos o humillación.',
    queMide: [
      'Libertad para admitir errores sin ser castigado',
      'Aceptación de la diversidad de opiniones y sugerencias',
      'Nivel de respeto e inclusión genuina entre pares y líderes'
    ],
    utilidadPractica: 'Indica si los colaboradores se sienten con la confianza de reportar abusos, quejas u observaciones sin miedo a ser despedidos o señalados.',
    icono: Lock,
    color: '#0284c7'
  },
  {
    id: 'estudio-004',
    titulo: 'Protocolo de Primeros Auxilios Psicológicos (PAP)',
    codigo: 'PAP - OMS & OPS',
    entidad: 'Organización Mundial de la Salud',
    ano: 'Guía Internacional',
    categoria: 'Intervención en Crisis & Acoso',
    resumen: 'Protocolo de contención e intervención inmediata ante reportes de violencia, acoso físico/sexual, tocamientos indebidos o colapsos emocionales.',
    queMide: [
      'Evaluación rápida del estado de vulnerabilidad y seguridad del afectado',
      'Detección de necesidades de protección inmediata y confidencialidad',
      'Canalización hacia el Comité de Convivencia y apoyo profesional'
    ],
    utilidadPractica: 'Asegura que ante una alerta crítica (ej: tocamiento o acoso), el sistema aplique pasos inmediatos de protección.',
    icono: HeartHandshake,
    color: '#7c3aed'
  },
  {
    id: 'estudio-005',
    titulo: 'Cuestionario de Clima Organizacional',
    codigo: 'Litwin & Stringer Climate Model',
    entidad: 'Harvard University Press',
    ano: 'Modelo de Clima',
    categoria: 'Dimensiones del Entorno Laboral',
    resumen: 'Evalúa la percepción de los empleados respecto a 6 factores determinantes de la cultura organizacional.',
    queMide: [
      'Estructura (reglas, trámites y burocracia percibida)',
      'Responsabilidad (autonomía en la toma de decisiones)',
      'Recompensa (sensación de justicia en el reconocimiento)',
      'Riesgo & Desafío (estímulo a la innovación y superación)',
      'Calidez & Apoyo (compañerismo y respaldo de la empresa)'
    ],
    utilidadPractica: 'Brinda el mapa completo para correlacionar la percepción del clima con los resultados de productividad y retención de talento.',
    icono: BarChart3,
    color: '#d97706'
  }
]

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
