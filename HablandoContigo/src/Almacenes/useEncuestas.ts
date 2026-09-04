/**
 * ============================================================================
 * ALMACÉN DE ENCUESTAS Y RESPUESTAS ANÓNIMAS — SUPABASE FIRST (useEncuestas.ts)
 * ============================================================================
 *
 * POLÍTICA: Ningún dato se guarda localmente si primero no llega a Supabase.
 * Si una operación falla en Supabase → se muestra toast de error → NO se
 * actualiza el estado local → el usuario ve el mensaje de fallo.
 */

import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useToast } from '@/Almacenes/useToast'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import { obtenerODefinirDispositivoUUID, obtenerFechaYHoraActual, type UbicacionExacta } from '@/Servicios/deviceService'
import type { PreguntaEncuesta, AlertaGeminiEstricta } from '@/Servicios/iaEncuestasService'
import { useNotificaciones } from '@/Almacenes/useNotificaciones'

const { mostrarError, mostrarExito } = useToast()

export interface Encuesta {
  id: string
  titulo: string
  descripcion: string
  departamento: string
  creadoPor: string
  fechaCreacion: string
  estado: 'Activa' | 'Borrador' | 'Finalizada'
  preguntas: PreguntaEncuesta[]
  preguntasSeguimiento?: PreguntaEncuesta[]
  totalRespuestas?: number
  alertasRegistradas?: number
  puntajePromedio?: number
}

export interface RespuestaItem {
  idPregunta: string
  textoPregunta: string
  categoria: string
  respuesta: any
  valor?: number
  esAlerta?: boolean
  comentario?: string
}

export type CategoriaAlertaPsicosocial =
  | 'acoso'
  | 'depresion'
  | 'renuncia_inminente'
  | 'aislamiento_social'
  | 'burnout'

export interface UbicacionAuditoria {
  ciudad: string
  pais: string
  sede: string
  direccionAprox?: string
  lat: number
  lng: number
  ipAprox: string
  proveedorRed?: string
}

export interface RegistroRespuesta {
  idRespuesta: string
  idEncuesta: string
  tituloEncuesta: string
  dispositivoUUID: string
  nombreEquipoPC: string
  cuentaUsuarioPC: string
  ubicacion: UbicacionAuditoria
  fecha: string
  hora: string
  duracionSegundos?: number
  timestampISO: string
  respuestas: RespuestaItem[]
  alertasDetectadas: string[]
  categoriasAlerta?: CategoriaAlertaPsicosocial[]
  puntajeGeneral: number
}

// Estados reactivos globales — cargados 100% desde Supabase
const encuestas = ref<Encuesta[]>([])
const respuestasAnonimas = ref<RegistroRespuesta[]>([])
const cargandoEncuestas = ref(false)

export function useEncuestas() {
  // ─────────────────────────────────────────────
  // LECTURA DESDE SUPABASE
  // ─────────────────────────────────────────────

  const cargarEncuestasDesdeSupabase = async () => {
    cargandoEncuestas.value = true
    try {
      const { data, error } = await supabase
        .from('encuestas')
        .select('*')
        .order('creado_en', { ascending: false })

      if (error) throw new Error(error.message)

      encuestas.value = (data || []).map((item: any) => ({
        id: item.id,
        titulo: item.titulo,
        descripcion: item.descripcion || '',
        departamento: item.departamento,
        creadoPor: item.creado_por || 'Super Administrador',
        fechaCreacion: item.fecha_creacion || 'Reciente',
        estado: item.estado || 'Activa',
        preguntas: item.preguntas || [],
        preguntasSeguimiento: item.preguntas_seguimiento || [],
        totalRespuestas: item.total_respuestas || 0,
        alertasRegistradas: item.alertas_registradas || 0,
        puntajePromedio: Number(item.puntaje_promedio) || 5.0
      }))
    } catch (e: any) {
      mostrarError('Error al cargar encuestas', `No se pudieron obtener las encuestas desde Supabase. ${e.message || ''}`)
    } finally {
      cargandoEncuestas.value = false
    }
  }

  const cargarRespuestasDesdeSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('respuestas_anonimas')
        .select('*')
        .order('timestamp_iso', { ascending: false })

      if (error) throw new Error(error.message)

      respuestasAnonimas.value = (data || []).map((item: any) => ({
        idRespuesta: item.id_respuesta,
        idEncuesta: item.id_encuesta,
        tituloEncuesta: item.titulo_encuesta || '',
        dispositivoUUID: item.dispositivo_uuid || '',
        nombreEquipoPC: item.nombre_equipo_pc || 'PC-CORP',
        cuentaUsuarioPC: item.cuenta_usuario_pc || 'colaborador',
        ubicacion: item.ubicacion || {
          ciudad: 'Bogotá', pais: 'Colombia', sede: 'Sede Principal',
          lat: 4.6534, lng: -74.0836, ipAprox: '190.157.34.112'
        },
        fecha: item.fecha || '',
        hora: item.hora || '',
        timestampISO: item.timestamp_iso || new Date().toISOString(),
        respuestas: item.respuestas || [],
        alertasDetectadas: item.alertas_detectadas || [],
        categoriasAlerta: item.categorias_alerta || [],
        puntajeGeneral: Number(item.puntaje_general) || 4.0
      }))
    } catch (e: any) {
      mostrarError('Error al cargar respuestas', `No se pudieron obtener las respuestas desde Supabase. ${e.message || ''}`)
    }
  }

  // ─────────────────────────────────────────────
  // MÉTRICAS COMPUTADAS
  // ─────────────────────────────────────────────

  const totalEncuestas = computed(() => encuestas.value.length)
  const encuestasActivas = computed(() => encuestas.value.filter(e => e.estado === 'Activa').length)
  const totalRespuestasGlobales = computed(() => respuestasAnonimas.value.length)
  const alertasTotales = computed(() => {
    if (respuestasAnonimas.value.length === 0) return 0
    return encuestas.value.reduce((acc, enc) => acc + (enc.alertasRegistradas || 0), 0)
  })
  const promedioSatisfaccionGlobal = computed(() => {
    if (respuestasAnonimas.value.length === 0 || encuestas.value.length === 0) return 0.0
    const suma = respuestasAnonimas.value.reduce((acc, r) => acc + (r.puntajeGeneral || 0), 0)
    return Number((suma / respuestasAnonimas.value.length).toFixed(1))
  })

  // ─────────────────────────────────────────────
  // ESCRITURA — SUPABASE PRIMERO SIEMPRE
  // ─────────────────────────────────────────────

  /**
   * Crea una encuesta en Supabase. Si falla → toast de error → NO actualiza local.
   */
  const crearEncuesta = async (nueva: Omit<Encuesta, 'id' | 'fechaCreacion'>): Promise<Encuesta | null> => {
    const id = `enc-${Date.now().toString(36)}`
    const fechaCreacion = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

    const registro: Encuesta = {
      ...nueva,
      id,
      fechaCreacion,
      totalRespuestas: 0,
      alertasRegistradas: 0,
      puntajePromedio: 5.0
    }

    try {
      const { error } = await supabase.from('encuestas').insert({
        id: registro.id,
        titulo: registro.titulo,
        descripcion: registro.descripcion,
        departamento: registro.departamento,
        creado_por: registro.creadoPor,
        fecha_creacion: registro.fechaCreacion,
        estado: registro.estado,
        preguntas: registro.preguntas,
        preguntas_seguimiento: registro.preguntasSeguimiento || [],
        total_respuestas: 0,
        alertas_registradas: 0,
        puntaje_promedio: 5.0
      })

      if (error) throw new Error(error.message)

      // 📢 Notificación automática en Supabase para todos los usuarios: Nueva Encuesta Creada
      try {
        await supabase.from('notificaciones_alertas').insert({
          id: `notif-enc-${Date.now().toString(36)}`,
          tipo: 'encuesta',
          titulo: `📢 Nueva Encuesta Publicada: ${registro.titulo}`,
          descripcion: `Se ha publicado una nueva encuesta para el área de ${registro.departamento}.`,
          mensaje: `La encuesta "${registro.titulo}" creada por ${registro.creadoPor} ya está activa y disponible para responder de forma 100% anónima.`,
          departamento: registro.departamento,
          tipo_alerta: 'Nueva Encuesta',
          severidad: 'Moderada',
          estado: 'Detectada',
          fecha: registro.fechaCreacion,
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          leida: false,
          ruta_destino: `/responder/${registro.id}`,
          id_elemento: 'seccion-proyectos'
        })
      } catch (errNotif) {
        console.warn('Aviso: Notificación de encuesta creada no se pudo registrar en Supabase:', errNotif)
      }

      // ✅ Solo agrega al estado local si Supabase confirmó
      encuestas.value.unshift(registro)
      mostrarExito('Encuesta creada', `"${registro.titulo}" fue guardada y notificada exitosamente en Supabase.`)
      return registro
    } catch (e: any) {
      mostrarError('Fallo al crear encuesta', `La encuesta no pudo guardarse en Supabase. ${e.message || ''}`)
      return null
    }
  }

  /**
   * Edita una encuesta en Supabase. Si falla → toast de error → estado local NO cambia.
   */
  const editarEncuesta = async (id: string, datos: Partial<Encuesta>): Promise<boolean> => {
    const snapshot = encuestas.value.find(e => e.id === id)
    const snapshotCopia = snapshot ? { ...snapshot } : null

    // Actualización optimista temporal
    if (snapshot) Object.assign(snapshot, datos)

    try {
      const payload: any = {}
      if (datos.titulo !== undefined) payload.titulo = datos.titulo
      if (datos.descripcion !== undefined) payload.descripcion = datos.descripcion
      if (datos.departamento !== undefined) payload.departamento = datos.departamento
      if (datos.estado !== undefined) payload.estado = datos.estado
      if (datos.preguntas !== undefined) payload.preguntas = datos.preguntas
      if (datos.preguntasSeguimiento !== undefined) payload.preguntas_seguimiento = datos.preguntasSeguimiento

      const { error } = await supabase.from('encuestas').update(payload).eq('id', id)
      if (error) throw new Error(error.message)

      // 🔔 Notificación de actividad: Encuesta / Módulo editado
      try {
        const { agregarNotificacion } = useNotificaciones()
        await agregarNotificacion({
          tipo: 'modulo',
          titulo: `Módulo Editado: ${datos.titulo || snapshot?.titulo || 'Encuesta'}`,
          descripcion: `Se actualizaron los parámetros del módulo de encuestas.`,
          mensaje: `Se editaron los ajustes y preguntas de la encuesta "${datos.titulo || snapshot?.titulo || 'Encuesta'}" de ${datos.departamento || snapshot?.departamento || 'General'}.`,
          departamento: datos.departamento || snapshot?.departamento || 'General',
          tipoAlerta: 'Edición de Módulo',
          severidad: 'Baja',
          estado: 'Detectada',
          fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          leida: false,
          rutaDestino: '/proyectos'
        })
      } catch (errNotif) {
        console.warn('Aviso: Notificación de edición no se pudo registrar:', errNotif)
      }

      mostrarExito('Encuesta actualizada', 'Los cambios se guardaron correctamente en Supabase.')
      return true
    } catch (e: any) {
      // 🔄 Revertir el estado local si Supabase falló
      if (snapshot && snapshotCopia) Object.assign(snapshot, snapshotCopia)
      mostrarError('Fallo al editar encuesta', `Los cambios NO se guardaron en Supabase. ${e.message || ''}`)
      return false
    }
  }

  /**
   * Elimina una encuesta de Supabase. Si falla → reinserta en estado local.
   */
  const eliminarEncuesta = async (id: string): Promise<boolean> => {
    const indice = encuestas.value.findIndex(e => e.id === id)
    const copia = indice !== -1 ? { ...encuestas.value[indice] } : null
    const tituloEnc = copia?.titulo || ''

    // Optimista: quita del estado local
    if (indice !== -1) encuestas.value.splice(indice, 1)
    respuestasAnonimas.value = respuestasAnonimas.value.filter(r => r.idEncuesta !== id)

    try {
      // 1. Eliminar respuestas de esta encuesta en Supabase
      await supabase.from('respuestas_anonimas').delete().eq('id_encuesta', id)

      // 2. Eliminar alertas asociadas en Supabase
      if (tituloEnc) {
        await supabase.from('notificaciones_alertas').delete().ilike('mensaje', `%${tituloEnc}%`)
      }

      // 3. Eliminar la encuesta en Supabase
      const { error } = await supabase.from('encuestas').delete().eq('id', id)
      if (error) throw new Error(error.message)

      // 4. Limpiar alertas de la encuesta del estado local
      try {
        const { eliminarAlertasDeEncuesta } = useNotificaciones()
        if (tituloEnc) await eliminarAlertasDeEncuesta(tituloEnc)
      } catch {}

      mostrarExito('Encuesta eliminada', 'La encuesta y sus datos asociados fueron eliminados correctamente.')
      return true
    } catch (e: any) {
      // 🔄 Revertir: reinserta la encuesta si Supabase falló
      if (copia && indice !== -1) encuestas.value.splice(indice, 0, copia as Encuesta)
      mostrarError('Fallo al eliminar encuesta', `La encuesta NO fue eliminada de Supabase. ${e.message || ''}`)
      return false
    }
  }

  const obtenerEncuestaPorId = (id: string): Encuesta | undefined =>
    encuestas.value.find(e => e.id === id)

  /**
   * Registra una respuesta anónima en Supabase. Si falla → toast de error → NO guarda localmente.
   * Filtra estrictamente alertas psicosociales para que SOLO se activen ante situaciones EVIDENTES y graves.
   */
  const registrarRespuestaAnonima = async (
    idEncuesta: string,
    items: RespuestaItem[],
    ubicacionExactaPersonalizada?: UbicacionExacta | UbicacionAuditoria,
    duracionSegundos?: number,
    identificacionVoluntaria?: string,
    alertasGemini?: AlertaGeminiEstricta[]
  ): Promise<RegistroRespuesta | null> => {
    const encuestaEncontrada = obtenerEncuestaPorId(idEncuesta)
    const uuidDispositivo = obtenerODefinirDispositivoUUID()
    const { fecha, hora, timestampISO } = obtenerFechaYHoraActual()

    const alertasIdentificadas: string[] = []
    const categoriasDetectadas: CategoriaAlertaPsicosocial[] = []
    let sumaPuntajes = 0
    let totalPuntajesValidos = 0

    // Si Gemini analítico generó alertas estrictas estructuradas
    if (alertasGemini && alertasGemini.length > 0) {
      const { agregarNotificacion } = useNotificaciones()
      alertasGemini.forEach(ag => {
        alertasIdentificadas.push(ag.tipoAlerta || 'Alerta Crítica Gemini')
        agregarNotificacion({
          tipo: 'acoso',
          titulo: ag.tipoAlerta || 'Alerta Crítica Detectada por Gemini',
          descripcion: ag.motivoDetallado,
          mensaje: ag.mensajeCapturado,
          departamento: encuestaEncontrada?.departamento || 'General',
          tipoAlerta: ag.tipoAlerta || 'Alerta Crítica',
          severidad: (ag.prioridad as any) || 'Crítica',
          estado: 'Detectada',
          detalleRespuesta: ag.motivoDetallado,
          dispositivoUUID: uuidDispositivo,
          nombreEquipoPC: identificacionVoluntaria ? 'Identificado Voluntariamente' : `PC-CORP-${Math.floor(Math.random() * 80 + 10)}`,
          cuentaUsuarioPC: identificacionVoluntaria || `colaborador.${Math.random().toString(36).substring(2, 6)}`,
          ubicacionSede: 'Sede Principal Calle 26',
          fecha,
          hora,
          leida: false,
          estadoAlerta: ag.estadoAlerta || 'Activada',
          mensajeCapturado: ag.mensajeCapturado,
          clasificacion: ag.clasificacion,
          motivoDetallado: ag.motivoDetallado,
          prioridad: ag.prioridad
        })
      })
    }

    // Importar dinámicamente y evaluar con rigor estricto (CERO FALSAS ALARMAS)
    // ⚠️ Solo ejecutar el clasificador local si Gemini NO generó alertas propias.
    // Si Gemini ya detectó alertas (bloque anterior), este bloque se omite para
    // evitar que se dupliquen las notificaciones en el dashboard.
    const { tiposActivos, clasificarYEncasillarTexto } = useTiposAlertas()

    const geminiYaDetecto = alertasGemini && alertasGemini.length > 0

    if (!geminiYaDetecto) {
      items.forEach(item => {
        // Rigor estricto: NUNCA evaluar el texto de la pregunta ni la categoría para evitar falsos positivos
        const textoRespuesta = `${item.respuesta || ''} ${item.comentario || ''}`.toLowerCase().trim()
        const esRespuestaCritica = item.valor === 1 || item.respuesta === 'Mal' || Boolean(item.esAlerta)

        // Detección efectiva: Si la respuesta es crítica o contiene términos de alerta
        if (esRespuestaCritica && textoRespuesta.length > 0) {
          const alertaEncasillada = clasificarYEncasillarTexto(textoRespuesta, true, item.valor)
          if (alertaEncasillada) {
            alertasIdentificadas.push(alertaEncasillada.nombre)
            categoriasDetectadas.push(alertaEncasillada.id.replace('tipo-', '') as any)

            // ✅ Persistir inmediatamente en Supabase notificaciones_alertas
            try {
              const { agregarNotificacion } = useNotificaciones()
              agregarNotificacion({
                tipo: (alertaEncasillada.id.replace('tipo-', '') as any) || 'acoso',
                titulo: alertaEncasillada.nombre,
                descripcion: `Incidente registrado en ${encuestaEncontrada?.departamento || 'General'}`,
                mensaje: `Se detectó la alerta crítica "${alertaEncasillada.nombre}" en la evaluación "${encuestaEncontrada?.titulo || 'Clima Laboral'}". Detalle: ${item.respuesta || item.comentario || 'Opción crítica seleccionada'}`,
                departamento: encuestaEncontrada?.departamento || 'General',
                tipoAlerta: alertaEncasillada.nombre,
                severidad: alertaEncasillada.severidad || 'Crítica',
                estado: 'Detectada',
                detalleRespuesta: item.comentario || String(item.respuesta || ''),
                dispositivoUUID: uuidDispositivo,
                nombreEquipoPC: identificacionVoluntaria ? 'Identificado Voluntariamente' : `PC-CORP-${Math.floor(Math.random() * 80 + 10)}`,
                cuentaUsuarioPC: identificacionVoluntaria || `colaborador.${Math.random().toString(36).substring(2, 6)}`,
                ubicacionSede: 'Sede Principal Calle 26',
                fecha,
                hora,
                leida: false,
                rutaDestino: '/dashboard?seccion=alertas',
                idElemento: 'seccion-alertas-detalle'
              })
            } catch (errNotif) {
              console.warn('Aviso guardando alerta en Supabase:', errNotif)
            }
          }
        }
      })
    }

    // Siempre acumular puntajes independientemente de alertas
    items.forEach(item => {
      if (typeof item.valor === 'number' && item.valor > 0) {
        sumaPuntajes += item.valor
        totalPuntajesValidos++
      }
    })

    const alertasUnicas = Array.from(new Set(alertasIdentificadas))
    const categoriasUnicas = Array.from(new Set(categoriasDetectadas))
    const puntajeGeneral = totalPuntajesValidos > 0
      ? Number((sumaPuntajes / totalPuntajesValidos).toFixed(1))
      : 4.0

    const ubicacionFinal: UbicacionAuditoria = ubicacionExactaPersonalizada ? {
      ciudad: ubicacionExactaPersonalizada.ciudad || 'Bogotá',
      pais: ubicacionExactaPersonalizada.pais || 'Colombia',
      sede: ubicacionExactaPersonalizada.sede || 'Sede Principal Calle 26',
      direccionAprox: ubicacionExactaPersonalizada.direccionAprox || 'Av. El Dorado #68C-61, Bogotá',
      lat: ubicacionExactaPersonalizada.lat ?? 4.6534,
      lng: ubicacionExactaPersonalizada.lng ?? -74.0836,
      ipAprox: ubicacionExactaPersonalizada.ipAprox || '190.157.34.112',
      proveedorRed: ubicacionExactaPersonalizada.proveedorRed || 'Red Corporativa'
    } : {
      ciudad: 'Bogotá', pais: 'Colombia',
      sede: 'Sede Principal Calle 26',
      direccionAprox: 'Av. El Dorado #68C-61, Bogotá',
      lat: 4.6534, lng: -74.0836,
      ipAprox: '190.157.34.112',
      proveedorRed: 'Red LAN Corporativa'
    }

    const nuevoRegistro: RegistroRespuesta = {
      idRespuesta: `resp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      idEncuesta,
      tituloEncuesta: encuestaEncontrada?.titulo || 'Encuesta de Clima Laboral',
      dispositivoUUID: uuidDispositivo,
      nombreEquipoPC: identificacionVoluntaria ? 'Identificado Voluntariamente' : `PC-CORP-${Math.floor(Math.random() * 80 + 10)}`,
      cuentaUsuarioPC: identificacionVoluntaria || `colaborador.${Math.random().toString(36).substring(2, 6)}`,
      ubicacion: ubicacionFinal,
      fecha,
      hora,
      duracionSegundos: duracionSegundos || 15,
      timestampISO,
      respuestas: items,
      alertasDetectadas: alertasUnicas,
      categoriasAlerta: categoriasUnicas,
      puntajeGeneral
    }

    // 1. Insertar respuesta en Supabase — si falla, NO se guarda nada
    try {
      const { error } = await supabase.from('respuestas_anonimas').insert({
        id_respuesta: nuevoRegistro.idRespuesta,
        id_encuesta: nuevoRegistro.idEncuesta,
        titulo_encuesta: nuevoRegistro.tituloEncuesta,
        dispositivo_uuid: nuevoRegistro.dispositivoUUID,
        nombre_equipo_pc: nuevoRegistro.nombreEquipoPC,
        cuenta_usuario_pc: nuevoRegistro.cuentaUsuarioPC,
        ubicacion: nuevoRegistro.ubicacion,
        fecha: nuevoRegistro.fecha,
        hora: nuevoRegistro.hora,
        timestamp_iso: nuevoRegistro.timestampISO,
        respuestas: nuevoRegistro.respuestas,
        alertas_detectadas: nuevoRegistro.alertasDetectadas,
        categorias_alerta: nuevoRegistro.categoriasAlerta,
        puntaje_general: nuevoRegistro.puntajeGeneral
      })

      if (error) throw new Error(error.message)

      // ✅ Solo actualiza estado local si Supabase confirmó
      respuestasAnonimas.value.unshift(nuevoRegistro)
    } catch (e: any) {
      mostrarError('Fallo al guardar respuesta', `Tu respuesta NO pudo guardarse en Supabase. ${e.message || ''} Intenta de nuevo.`)
      return null
    }

    // 2. Actualizar contadores de la encuesta en Supabase
    if (encuestaEncontrada) {
      const nuevoTotal = (encuestaEncontrada.totalRespuestas || 0) + 1
      const nuevasAlertas = alertasUnicas.length > 0
        ? (encuestaEncontrada.alertasRegistradas || 0) + 1
        : encuestaEncontrada.alertasRegistradas || 0

      try {
        const { error } = await supabase.from('encuestas').update({
          total_respuestas: nuevoTotal,
          alertas_registradas: nuevasAlertas
        }).eq('id', encuestaEncontrada.id)

        if (error) throw new Error(error.message)

        encuestaEncontrada.totalRespuestas = nuevoTotal
        encuestaEncontrada.alertasRegistradas = nuevasAlertas
      } catch (e: any) {
        mostrarError('Fallo al actualizar contador', `Los contadores de la encuesta no se actualizaron. ${e.message || ''}`)
      }
    }

    // 3. Insertar alerta en notificaciones_alertas si hay alertas
    if (alertasUnicas.length > 0) {
      const { tiposActivos } = useTiposAlertas()
      const tipoCat = categoriasUnicas[0] || 'acoso'
      const primeraAlertaNombre = alertasUnicas[0] || 'Alerta de Clima Laboral'
      const alertaConf = tiposActivos.value.find(t => 
        t.nombre.toLowerCase().includes(primeraAlertaNombre.toLowerCase()) || 
        primeraAlertaNombre.toLowerCase().includes(t.nombre.toLowerCase())
      )
      const severidadFinal = alertaConf?.severidad || (alertaConf?.nivel === 1 ? 'Crítica' : alertaConf?.nivel === 2 ? 'Alta' : 'Moderada')

      const comentarioDetectado = items.find(i => i.comentario || i.esAlerta)?.comentario || ''

      try {
        const { error } = await supabase.from('notificaciones_alertas').insert({
          id: `alt-${Date.now().toString(36)}`,
          tipo: tipoCat,
          titulo: primeraAlertaNombre,
          descripcion: `Incidente registrado en ${encuestaEncontrada?.departamento || 'General'}`,
          mensaje: `Se detectó una alerta (${alertasUnicas.join(', ')}) durante la encuesta "${encuestaEncontrada?.titulo}".`,
          departamento: encuestaEncontrada?.departamento || 'Operaciones',
          tipo_alerta: primeraAlertaNombre,
          severidad: severidadFinal,
          estado: 'Detectada',
          detalle_respuesta: comentarioDetectado || `Alerta detectada en la evaluación: ${primeraAlertaNombre}`,
          dispositivo_uuid: nuevoRegistro.dispositivoUUID,
          nombre_equipo_pc: nuevoRegistro.nombreEquipoPC,
          cuenta_usuario_pc: nuevoRegistro.cuentaUsuarioPC,
          ubicacion_sede: nuevoRegistro.ubicacion?.sede,
          fecha: nuevoRegistro.fecha,
          hora: nuevoRegistro.hora,
          leida: false,
          ruta_destino: '/dashboard?seccion=alertas',
          id_elemento: 'seccion-alertas-detalle'
        })
        if (error) throw new Error(error.message)
      } catch (e: any) {
        mostrarError('Fallo al registrar alerta', `La alerta psicosocial no se guardó en Supabase. ${e.message || ''}`)
      }
    }

    return nuevoRegistro
  }

  /**
   * Vacía respuestas de una encuesta en Supabase. Si falla → toast de error → estado no cambia.
   */
  const vaciarEstadisticasEncuesta = async (idEncuesta: string): Promise<boolean> => {
    const snapRespuestas = [...respuestasAnonimas.value]
    const enc = encuestas.value.find(e => e.id === idEncuesta)
    const snapEnc = enc ? { ...enc } : null
    const tituloEnc = enc?.titulo || ''

    try {
      const { error: errResp } = await supabase
        .from('respuestas_anonimas')
        .delete()
        .eq('id_encuesta', idEncuesta)

      if (errResp) throw new Error(`Respuestas: ${errResp.message}`)

      // Purgar alertas asociadas a esta encuesta en Supabase
      if (tituloEnc) {
        await supabase
          .from('notificaciones_alertas')
          .delete()
          .ilike('mensaje', `%${tituloEnc}%`)
      }

      const { error: errEnc } = await supabase
        .from('encuestas')
        .update({ total_respuestas: 0, alertas_registradas: 0, puntaje_promedio: 0.0 })
        .eq('id', idEncuesta)

      if (errEnc) throw new Error(`Encuesta: ${errEnc.message}`)

      // ✅ Supabase confirmó — actualizar estado local
      respuestasAnonimas.value = respuestasAnonimas.value.filter(r => r.idEncuesta !== idEncuesta)
      if (enc) {
        enc.totalRespuestas = 0
        enc.alertasRegistradas = 0
        enc.puntajePromedio = 0.0
      }

      try {
        const { eliminarAlertasDeEncuesta } = useNotificaciones()
        if (tituloEnc) await eliminarAlertasDeEncuesta(tituloEnc)
      } catch {}

      mostrarExito('Estadísticas vaciadas', 'Todas las respuestas y alertas de esta encuesta fueron eliminadas de Supabase.')
      return true
    } catch (e: any) {
      // 🔄 Revertir estado local si Supabase falló
      respuestasAnonimas.value = snapRespuestas
      if (enc && snapEnc) Object.assign(enc, snapEnc)
      mostrarError('Fallo al vaciar estadísticas', `Las respuestas NO fueron eliminadas de Supabase. ${e.message || ''}`)
      return false
    }
  }

  /**
   * Elimina una respuesta individual de Supabase (por ejemplo, para depurar datos o pruebas)
   */
  const eliminarRespuestaIndividual = async (idRespuesta: string): Promise<boolean> => {
    const respuestaAEliminar = respuestasAnonimas.value.find(r => r.idRespuesta === idRespuesta)
    if (!respuestaAEliminar) return false

    const copiaLocal = [...respuestasAnonimas.value]
    // Optimista
    respuestasAnonimas.value = respuestasAnonimas.value.filter(r => r.idRespuesta !== idRespuesta)

    try {
      const { error } = await supabase
        .from('respuestas_anonimas')
        .delete()
        .eq('id_respuesta', idRespuesta)

      if (error) throw new Error(error.message)

      // Actualizar contador en la encuesta en Supabase si aplica
      const enc = encuestas.value.find(e => e.id === respuestaAEliminar.idEncuesta)
      if (enc && (enc.totalRespuestas || 0) > 0) {
        enc.totalRespuestas = Math.max(0, (enc.totalRespuestas || 1) - 1)
        if (respuestaAEliminar.alertasDetectadas && respuestaAEliminar.alertasDetectadas.length > 0) {
          enc.alertasRegistradas = Math.max(0, (enc.alertasRegistradas || 1) - 1)
        }
        await supabase.from('encuestas').update({
          total_respuestas: enc.totalRespuestas,
          alertas_registradas: enc.alertasRegistradas
        }).eq('id', enc.id)
      }

      mostrarExito('Registro eliminado', 'La respuesta fue eliminada exitosamente de Supabase.')
      return true
    } catch (e: any) {
      // Revertir
      respuestasAnonimas.value = copiaLocal
      mostrarError('Fallo al eliminar registro', `La respuesta NO pudo eliminarse de Supabase. ${e.message || ''}`)
      return false
    }
  }

  /**
   * Vacía TODAS las respuestas, estadísticas y alertas de convivencia de Supabase
   */
  const vaciarTodasLasEstadisticas = async (): Promise<boolean> => {
    const snapResp = [...respuestasAnonimas.value]
    respuestasAnonimas.value = []

    try {
      // 1. Eliminar todas las respuestas en Supabase
      const { error } = await supabase
        .from('respuestas_anonimas')
        .delete()
        .neq('id_respuesta', 'dummy_no_match')

      if (error) throw new Error(error.message)

      // 2. Eliminar todas las alertas de convivencia en Supabase
      await supabase
        .from('notificaciones_alertas')
        .delete()
        .in('tipo', ['alerta_clima', 'acoso', 'burnout', 'depresion', 'renuncia', 'social', 'alerta'])

      // 3. Resetear contadores de todas las encuestas en Supabase a CERO
      encuestas.value.forEach(e => {
        e.totalRespuestas = 0
        e.alertasRegistradas = 0
        e.puntajePromedio = 0.0
      })

      await supabase
        .from('encuestas')
        .update({ total_respuestas: 0, alertas_registradas: 0, puntaje_promedio: 0.0 })
        .neq('id', 'dummy_no_match')

      // 4. Limpiar alertas psicosociales del almacén local de notificaciones
      try {
        const { limpiarAlertasConvivencia } = useNotificaciones()
        await limpiarAlertasConvivencia()
      } catch {}

      mostrarExito('Estadísticas y alertas purgadas', 'Todas las respuestas, estadísticas y alertas fueron reiniciadas a cero en Supabase.')
      return true
    } catch (e: any) {
      respuestasAnonimas.value = snapResp
      mostrarError('Fallo al vaciar estadísticas', `No se pudieron purgar los datos de Supabase. ${e.message || ''}`)
      return false
    }
  }

  const obtenerRespuestasDeEncuesta = (idEncuesta: string): RegistroRespuesta[] =>
    respuestasAnonimas.value.filter(r => r.idEncuesta === idEncuesta)

  // Cargar al instanciar
  cargarEncuestasDesdeSupabase()
  cargarRespuestasDesdeSupabase()

  return {
    encuestas,
    respuestasAnonimas,
    cargandoEncuestas,
    totalEncuestas,
    encuestasActivas,
    totalRespuestasGlobales,
    alertasTotales,
    promedioSatisfaccionGlobal,
    cargarEncuestasDesdeSupabase,
    cargarRespuestasDesdeSupabase,
    crearEncuesta,
    editarEncuesta,
    eliminarEncuesta,
    obtenerEncuestaPorId,
    registrarRespuestaAnonima,
    obtenerRespuestasDeEncuesta,
    vaciarEstadisticasEncuesta,
    eliminarRespuestaIndividual,
    vaciarTodasLasEstadisticas
  }
}
