<!--
  ============================================================================
  MODAL DE TÉRMINOS Y CONDICIONES DE SERVICIO (ModalTerminosCondiciones.vue)
  ============================================================================
-->

<script setup lang="ts">
import { X, FileText, ShieldCheck, Check, Scale } from 'lucide-vue-next'
import { useLegal } from '@/Almacenes/useLegal'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const { modalTerminosAbierto, versionTerminos, cerrarModales } = useLegal()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="modalTerminosAbierto"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-['Poppins',sans-serif]"
        role="dialog"
        aria-modal="true"
      >
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" @click="cerrarModales" />

        <div class="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 flex flex-col max-h-[85vh]">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                <Scale class="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-black text-slate-900 dark:text-white">
                    Términos y Condiciones de Uso
                  </h3>
                  <span class="text-[10px] font-mono px-2 py-0.2 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-extrabold">
                    {{ versionTerminos }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Ecosistema Corporativo de Clima Laboral y Salud Psicosocial HablandoContigo
                </p>
              </div>
            </div>

            <button
              @click="cerrarModales"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Contenido del Documento Legal con Scroll -->
          <div class="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-left">
            
            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span class="text-sky-500 font-mono">1.</span> Objeto y Ámbito de Aplicación
              </h4>
              <p>
                El presente contrato regula el acceso y uso de la plataforma <strong>HablandoContigo</strong>, software especializado en la evaluación confidencial de clima laboral, prevención de riesgos psicosociales y gestión de bienestar corporativo. El uso de esta plataforma implica la aceptación plena de estos términos por parte de colaboradores y administradores.
              </p>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span class="text-sky-500 font-mono">2.</span> Garantía de Anonimato y Confidencialidad
              </h4>
              <p>
                Las respuestas emitidas en las encuestas son <strong>100% anónimas</strong> mediante un identificador criptográfico único de dispositivo (UUID). Ningún administrador tiene la capacidad técnica de asociar una respuesta confidencial con la identidad directa del colaborador, salvo que este decida voluntariamente identificarse en campos abiertos de soporte o denuncia.
              </p>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span class="text-sky-500 font-mono">3.</span> Obligaciones del Administrador y Ética Profesional
              </h4>
              <p>
                Los usuarios con roles administrativos (Super Administrador, Administrador, Supervisor, Analista RRHH) se comprometen formalmente a utilizar los datos exclusivamente con fines de mejora organizacional, respetando el deber de reserva, secreto profesional y las directrices de no represalia conforme a la legislación laboral vigente.
              </p>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span class="text-sky-500 font-mono">4.</span> Tratamiento de Datos Personales (RGPD / Habeas Data)
              </h4>
              <p>
                El tratamiento de datos se rige por las directrices del Reglamento General de Protección de Datos (RGPD) y la Ley de Protección de Datos Personales. Los usuarios pueden ejercer en cualquier momento sus derechos de acceso, rectificación, cancelación y oposición (ARCO).
              </p>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span class="text-sky-500 font-mono">5.</span> Protocolos de Seguridad y Cifrado
              </h4>
              <p>
                La plataforma implementa mecanismos de cifrado SSL/TLS en tránsito y algoritmos seguros de almacenamiento en Supabase. El sistema incluye auditoría forense inmutable de incidentes y control de acceso basado en roles (RBAC).
              </p>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span class="text-sky-500 font-mono">6.</span> Propiedad Intelectual
              </h4>
              <p>
                El diseño visual, componentes interactivos, algoritmos de análisis psicosocial y marcas son propiedad exclusiva de HablandoContigo y están protegidos por las leyes internacionales de propiedad intelectual.
              </p>
            </section>

            <section class="space-y-2">
              <h4 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span class="text-sky-500 font-mono">7.</span> Jurisdicción y Ley Aplicable
              </h4>
              <p>
                Para cualquier controversia que pudiera derivarse del uso de la plataforma, las partes se someten a la legislación y tribunales competentes en materia laboral y de protección de datos de la sede corporativa de la organización.
              </p>
            </section>

          </div>

          <!-- Footer Modal -->
          <div class="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
            <div class="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Documento legal vinculante &bull; Actualizado 2026</span>
            </div>

            <BotonBase
              variante="primario"
              tamano="pequeno"
              @click="cerrarModales"
            >
              <template #iconoIzquierdo>
                <Check class="w-4 h-4" />
              </template>
              Entendido y Aceptado
            </BotonBase>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>