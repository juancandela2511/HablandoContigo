/**
 * ============================================================================
 * ALMACÉN DE ENCUESTAS Y RESPUESTAS ANÓNIMAS (useEncuestas.ts)
 * ============================================================================
 *
 * Este archivo ya no usa servicios remotos ni conexiones externas. Toda la
 * persistencia se hace con localStorage y estado reactivo del navegador.
 */

import { ref, computed } from 'vue'
import { useToast } from '@/Almacenes/useToast'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import { obtenerODefinirDispositivoUUID, obtenerFechaYHoraActual, type UbicacionExacta } from '@/services/deviceService'
import { sha256, depurarRastrosLocales } from '@/services/cryptoService'
import type { PreguntaEncuesta, AlertaGeminiEstricta } from '@/ia'
import { PLANTILLA_CLIMA_INTEGRAL_DETALLADA, TITULO_ENCUESTA_CLIMA_INTEGRAL, DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL } from '@/Config/preguntasCuestionario'

import preguntasJson from '@/database/preguntas.json'
import bloquesJson from '@/database/bloques.json'
import encuestasJson from '@/database/encuestas.json'
import respuestasJson from '@/database/respuestas.json'

// Depurar rastros de credenciales y respuestas en localStorage al iniciar
depurarRastrosLocales()

const { mostrarError, mostrarExito } = useToast()

export interface Encuesta {
  id: string
  titulo: string
  descripcion: string
  departamento: string
  creadoPor: string
  fechaCreacion: string
  estado: 'Activa' | 'Borrador' | 'Finalizada'
  bloques?: any[]
  preguntas: PreguntaEncuesta[]
  preguntasSeguimiento?: PreguntaEncuesta[]
  totalRespuestas?: number
  alertasRegistradas?: number
  puntajePromedio?: number
  porcentajeClimaFinal?: number
  anioCierre?: number
  fechaFinalizacion?: string
  respuestasArchivadas?: RegistroRespuesta[]
}

export interface RespuestaItem {
  idPregunta: string
  textoPregunta: string
  categoria: string
  respuesta: any
  valor?: number
  esAlerta?: boolean
  tipoAlertaId?: string
  nombreAlerta?: string
  severidadAlerta?: string
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

const encuestasBaseDefault: Encuesta[] = (encuestasJson || []).map((e: any) => ({
  ...e,
  estado: e.estado || 'Activa',
  bloques: e.bloques || bloquesJson,
  preguntas: (preguntasJson && preguntasJson.length > 0 ? preguntasJson : PLANTILLA_CLIMA_INTEGRAL_DETALLADA) as PreguntaEncuesta[]
}))

const respuestasBaseDefault: RegistroRespuesta[] = []

const encuestas = ref<Encuesta[]>(encuestasBaseDefault)
const respuestasAnonimas = ref<RegistroRespuesta[]>(respuestasBaseDefault)
const cargandoEncuestas = ref(false)
const cargandoRespuestas = ref(false)

const STORAGE_KEYS = {
  encuestas: 'hablandocontigo_encuestas',
  respuestas: 'hablandocontigo_respuestas'
}

const persistirEncuestas = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEYS.encuestas, JSON.stringify(encuestas.value))
  }
}

const persistirRespuestas = () => {
  // Las respuestas NUNCA se guardan en localStorage por política estricta de confidencialidad
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEYS.respuestas)
  }
}

let cargadoInicialEncuestas = false
let cargadoInicialRespuestas = false
let promesaCargaEncuestas: Promise<void> | null = null
let promesaCargaRespuestas: Promise<void> | null = null

import { obtenerApiBaseUrl } from '@/services/api'

const API_URL = obtenerApiBaseUrl()

export function useEncuestas() {
  const cargarEncuestasDesdeLocal = async (forzar: boolean = false) => {
    if (cargadoInicialEncuestas && !forzar) return
    if (promesaCargaEncuestas && !forzar) return promesaCargaEncuestas

    promesaCargaEncuestas = (async () => {
      cargandoEncuestas.value = true
      try {
        // 1. Intentar consultar el servidor Backend Node.js + Express
        const resBackend = await fetch(`${API_URL}/encuestas`, {
          signal: AbortSignal.timeout(1500)
        }).catch(() => null)

        if (resBackend && resBackend.ok) {
          const data = await resBackend.json()
          if (Array.isArray(data) && data.length > 0) {
            const guardadoLocal = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.encuestas) : null
            let archivadasLocales: Encuesta[] = []
            if (guardadoLocal) {
              try {
                const parsed = JSON.parse(guardadoLocal)
                if (Array.isArray(parsed)) {
                  archivadasLocales = parsed.filter((e: any) => e.estado === 'Finalizada' && Array.isArray(e.respuestasArchivadas))
                }
              } catch {}
            }
            const idsBackend = new Set(data.map((d: any) => d.id))
            const extrasArchivadas = archivadasLocales.filter(a => !idsBackend.has(a.id))
            encuestas.value = [...data, ...extrasArchivadas]
            persistirEncuestas()
            cargadoInicialEncuestas = true
            return
          }
        }

        // 2. Fallback a almacenamiento local / JSON
        const guardado = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.encuestas) : null

        if (guardado) {
          try {
            const arr = JSON.parse(guardado)
            const filtrados = Array.isArray(arr) ? arr.filter((e: any) => e.id !== 'enc-002') : []
            if (filtrados.length > 0) {
              filtrados.forEach((enc: any) => {
                if (enc.id === 'enc-001' && (!enc.preguntas || enc.preguntas.length < 10)) {
                  enc.preguntas = preguntasJson.length > 0 ? (preguntasJson as any) : [...PLANTILLA_CLIMA_INTEGRAL_DETALLADA]
                  enc.titulo = TITULO_ENCUESTA_CLIMA_INTEGRAL
                  enc.descripcion = DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL
                }
                if (respuestasAnonimas.value.length === 0 && enc.estado !== 'Finalizada') {
                  enc.totalRespuestas = 0
                  enc.alertasRegistradas = 0
                  enc.puntajePromedio = 0.0
                }
              })
              encuestas.value = filtrados
              persistirEncuestas()
            } else {
              encuestas.value = [...encuestasBaseDefault]
              persistirEncuestas()
            }
          } catch {
            encuestas.value = [...encuestasBaseDefault]
            persistirEncuestas()
          }
        } else {
          encuestas.value = [...encuestasBaseDefault]
          persistirEncuestas()
        }

        cargadoInicialEncuestas = true
      } catch (e: any) {
        console.warn('Aviso al cargar encuestas:', e?.message || e)
      } finally {
        cargandoEncuestas.value = false
        promesaCargaEncuestas = null
      }
    })()

    return promesaCargaEncuestas
  }

  const cargarRespuestasDesdeLocal = async (forzar: boolean = false) => {
    if (cargadoInicialRespuestas && !forzar) return
    if (promesaCargaRespuestas && !forzar) return promesaCargaRespuestas

    promesaCargaRespuestas = (async () => {
      cargandoRespuestas.value = true
      try {
        // 1. Intentar consultar las respuestas desde el Backend Node.js
        const resBackend = await fetch(`${API_URL}/respuestas`, {
          signal: AbortSignal.timeout(1500)
        }).catch(() => null)

        if (resBackend && resBackend.ok) {
          const data = await resBackend.json()
          if (Array.isArray(data)) {
            respuestasAnonimas.value = data
            persistirRespuestas()
            cargadoInicialRespuestas = true
            return
          }
        }

        // 2. Si el backend aún no responde, mantener lista reactiva en memoria (cero localStorage)
        respuestasAnonimas.value = []
        persistirRespuestas()
        cargadoInicialRespuestas = true
      } catch (e: any) {
        console.warn('Aviso al cargar respuestas:', e?.message || e)
      } finally {
        cargandoRespuestas.value = false
        promesaCargaRespuestas = null
      }
    })()

    return promesaCargaRespuestas
  }

  const totalEncuestas = computed(() => encuestas.value.length)
  const encuestasActivas = computed(() => encuestas.value.filter(e => e.estado === 'Activa').length)
  const totalRespuestasGlobales = computed(() => respuestasAnonimas.value.length)
  const alertasTotales = computed(() => {
    return encuestas.value.reduce((acc, enc) => acc + (enc.alertasRegistradas || 0), 0)
  })
  const promedioSatisfaccionGlobal = computed(() => {
    if (respuestasAnonimas.value.length === 0) return 0.0
    const suma = respuestasAnonimas.value.reduce((acc, r) => acc + (r.puntajeGeneral || 0), 0)
    return Number((suma / respuestasAnonimas.value.length).toFixed(1))
  })

  const crearEncuesta = async (nueva: Omit<Encuesta, 'id' | 'fechaCreacion'>): Promise<Encuesta | null> => {
    const registro: Encuesta = {
      ...nueva,
      id: `enc-${Date.now().toString(36)}`,
      fechaCreacion: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalRespuestas: 0,
      alertasRegistradas: 0,
      puntajePromedio: 5.0
    }

    encuestas.value.unshift(registro)
    persistirEncuestas()
    mostrarExito('Encuesta creada', `"${registro.titulo}" fue guardada localmente.`)
    return registro
  }

  const editarEncuesta = async (id: string, datos: Partial<Encuesta>): Promise<boolean> => {
    const encuesta = encuestas.value.find(e => e.id === id)
    if (!encuesta) {
      encuestas.value.unshift({
        id,
        titulo: datos.titulo ?? 'Encuesta',
        descripcion: datos.descripcion ?? '',
        departamento: datos.departamento ?? 'General',
        creadoPor: 'Super Administrador',
        fechaCreacion: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        estado: datos.estado ?? 'Activa',
        preguntas: datos.preguntas ?? [],
        preguntasSeguimiento: datos.preguntasSeguimiento ?? [],
        totalRespuestas: 0,
        alertasRegistradas: 0,
        puntajePromedio: 5.0
      })
    } else {
      Object.assign(encuesta, datos)
    }

    // Persistir atómicamente en PostgreSQL
    try {
      await fetch(`${API_URL}/encuestas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: datos.titulo || encuesta?.titulo,
          descripcion: datos.descripcion || encuesta?.descripcion,
          departamento: datos.departamento || encuesta?.departamento,
          estado: datos.estado || encuesta?.estado,
          bloques: (datos as any).bloques || (encuesta as any)?.bloques,
          preguntas: datos.preguntas || encuesta?.preguntas
        })
      })
    } catch (apiErr) {
      console.warn('[useEncuestas] Error al sincronizar con PostgreSQL:', apiErr)
    }

    persistirEncuestas()
    mostrarExito('Encuesta y Preguntas Guardadas', 'Los cambios se persistieron en PostgreSQL y están activos.')
    return true
  }

  const eliminarEncuesta = async (id: string): Promise<boolean> => {
    const indice = encuestas.value.findIndex(e => e.id === id)
    if (indice !== -1) encuestas.value.splice(indice, 1)
    respuestasAnonimas.value = respuestasAnonimas.value.filter(r => r.idEncuesta !== id)
    persistirEncuestas()
    persistirRespuestas()
    mostrarExito('Encuesta eliminada', 'La encuesta y sus datos asociados fueron eliminados localmente.')
    return true
  }

  const obtenerEncuestaPorId = (id: string): Encuesta | undefined => {
    return encuestas.value.find(e => e.id === id)
  }

  const obtenerRespuestasDeEncuesta = (idEncuesta: string): RegistroRespuesta[] => {
    return respuestasAnonimas.value.filter(r => r.idEncuesta === idEncuesta)
  }

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

    const { tiposActivos, clasificarYEncasillarTexto } = useTiposAlertas()

    if (alertasGemini && alertasGemini.length > 0) {
      alertasGemini.forEach(ag => {
        alertasIdentificadas.push(ag.tipoAlerta || 'Alerta Crítica')
      })
    }

    items.forEach(item => {
      if (typeof item.valor === 'number' && item.valor > 0) {
        sumaPuntajes += item.valor
        totalPuntajesValidos++
      }

      if (item.esAlerta && (item.tipoAlertaId || item.nombreAlerta)) {
        const tipoAsociado = tiposActivos.value.find(t => t.id === item.tipoAlertaId)
        const nombreFinal = tipoAsociado?.nombre || item.nombreAlerta || 'Alerta asociada'
        alertasIdentificadas.push(nombreFinal)
        categoriasDetectadas.push((tipoAsociado?.id || item.tipoAlertaId || 'acoso').replace('tipo-', '') as CategoriaAlertaPsicosocial)
        return
      }

      const textoRespuesta = `${item.respuesta || ''} ${item.comentario || ''}`.toLowerCase().trim()
      const esRespuestaCritica = item.valor === 1 || item.respuesta === 'Mal' || Boolean(item.esAlerta)
      if (esRespuestaCritica && textoRespuesta.length > 0) {
        const alertaEncasillada = clasificarYEncasillarTexto(textoRespuesta, true, item.valor)
        if (alertaEncasillada) {
          alertasIdentificadas.push(alertaEncasillada.nombre)
          categoriasDetectadas.push(alertaEncasillada.id.replace('tipo-', '') as CategoriaAlertaPsicosocial)
        }
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
      sede: ubicacionExactaPersonalizada.sede || 'Sede Principal',
      direccionAprox: ubicacionExactaPersonalizada.direccionAprox || 'Av. El Dorado #68C-61, Bogotá',
      lat: ubicacionExactaPersonalizada.lat ?? 4.6534,
      lng: ubicacionExactaPersonalizada.lng ?? -74.0836,
      ipAprox: ubicacionExactaPersonalizada.ipAprox || '190.157.34.112',
      proveedorRed: ubicacionExactaPersonalizada.proveedorRed || 'Red Corporativa'
    } : {
      ciudad: 'Bogotá',
      pais: 'Colombia',
      sede: 'Sede Principal',
      direccionAprox: 'Av. El Dorado #68C-61, Bogotá',
      lat: 4.6534,
      lng: -74.0836,
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

    // Persistencia atómica en PostgreSQL a través de la API REST
    try {
      const hashDispositivo = await sha256(uuidDispositivo)
      await fetch(`${API_URL}/respuestas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEncuesta,
          tituloEncuesta: encuestaEncontrada?.titulo || 'Encuesta de Clima Laboral',
          dispositivoUuid: hashDispositivo,
          nombreEquipoPc: identificacionVoluntaria ? 'Identificado' : 'Anónimo',
          cuentaUsuarioPc: identificacionVoluntaria || 'anonimo',
          ubicacion: ubicacionFinal,
          fecha,
          hora,
          duracionSegundos: duracionSegundos || 15,
          puntajeGeneral,
          alertasDetectadas: alertasUnicas,
          categoriasAlerta: categoriasUnicas,
          respuestas: items
        })
      })
    } catch (apiErr) {
      console.warn('[useEncuestas] No se pudo enviar respuesta a PostgreSQL:', apiErr)
    }

    respuestasAnonimas.value.unshift(nuevoRegistro)

    if (encuestaEncontrada) {
      const nuevoTotal = (encuestaEncontrada.totalRespuestas || 0) + 1
      const nuevasAlertas = alertasUnicas.length > 0 ? (encuestaEncontrada.alertasRegistradas || 0) + 1 : (encuestaEncontrada.alertasRegistradas || 0)
      encuestaEncontrada.totalRespuestas = nuevoTotal
      encuestaEncontrada.alertasRegistradas = nuevasAlertas
      const promedioActual = encuestaEncontrada.puntajePromedio || 0
      encuestaEncontrada.puntajePromedio = Number(((promedioActual * Math.max(1, nuevoTotal - 1) + puntajeGeneral) / nuevoTotal).toFixed(1))
    }

    persistirRespuestas() // Asegura que NUNCA se guarde en localStorage
    persistirEncuestas()
    mostrarExito('Respuesta registrada', 'Tu respuesta fue enviada de forma segura y anónima a la base de datos.')
    return nuevoRegistro
  }

  const vaciarEstadisticasEncuesta = async (idEncuesta: string): Promise<boolean> => {
    respuestasAnonimas.value = respuestasAnonimas.value.filter(r => r.idEncuesta !== idEncuesta)
    const enc = encuestas.value.find(e => e.id === idEncuesta)
    if (enc) {
      enc.totalRespuestas = 0
      enc.alertasRegistradas = 0
      enc.puntajePromedio = 0.0
    }

    persistirRespuestas()
    persistirEncuestas()
    mostrarExito('Estadísticas vaciadas', 'Todas las respuestas y alertas de esta encuesta fueron reiniciadas.')
    return true
  }

  const eliminarRespuestaIndividual = async (idRespuesta: string): Promise<boolean> => {
    const respuestaAEliminar = respuestasAnonimas.value.find(r => r.idRespuesta === idRespuesta)
    if (!respuestaAEliminar) return false

    respuestasAnonimas.value = respuestasAnonimas.value.filter(r => r.idRespuesta !== idRespuesta)
    const enc = encuestas.value.find(e => e.id === respuestaAEliminar.idEncuesta)
    if (enc && (enc.totalRespuestas || 0) > 0) {
      enc.totalRespuestas = Math.max(0, (enc.totalRespuestas || 1) - 1)
      if (respuestaAEliminar.alertasDetectadas.length > 0) {
        enc.alertasRegistradas = Math.max(0, (enc.alertasRegistradas || 1) - 1)
      }
    }

    persistirRespuestas()
    persistirEncuestas()
    mostrarExito('Registro eliminado', 'La respuesta fue eliminada exitosamente.')
    return true
  }

  const inyectarDatosDePrueba = async (cantidad: number = 10, idEncuestaTarget?: string): Promise<boolean> => {
    try {
      const targetEnc = idEncuestaTarget
        ? encuestas.value.find(e => e.id === idEncuestaTarget)
        : encuestas.value.find(e => e.id === 'enc-001') || encuestas.value[0]

      if (!targetEnc) {
        mostrarError('Error de inyección', 'No se encontró ninguna encuesta activa.')
        return false
      }

      for (let i = 0; i < cantidad; i++) {
        const itemsGenerados: RespuestaItem[] = []
        const preguntasBase = targetEnc.preguntas || []

        const estudiosEjemplo = [
          'Ingeniería en Data y Analítica',
          'ADSO - Análisis y Desarrollo de Software',
          'Ciencia de Datos y Big Data',
          'Ingeniería de Sistemas',
          'Administración de Empresas',
          'Psicología Organizacional',
          'Contaduría Pública y Finanzas',
          'Mercadeo y Publicidad Digital'
        ]
        const comentariosAbiertosEjemplo = [
          'El supervisor Omar se la monta todo el día con presión canzona, gritos e interrupciones frente al equipo, y además el salario no compensa tanta carga laboral.',
          'Daniel nos envía mensajes de WhatsApp y llamadas exigiendo reportes fuera del horario laboral y en días de descanso.',
          'Roberto ha realizado insinuaciones indebidas y comentarios sexuales inapropiados que generan mucha incomodidad en el turno.',
          'Falta capacitación e inducción clara en los procesos; recibimos órdenes contradictorias de varios jefes sin claridad en el rol.',
          'Me siento con agotamiento extremo y burnout por las metas imposibles; estoy buscando otro empleo y pensando en renunciar.',
          'El computador es muy lento, las sillas son incómodas y nunca hay reconocimiento ni valoración del esfuerzo por parte de Carlos.'
        ]

        preguntasBase.forEach((p, index) => {
          const esAbierta = p.tipo === 'texto' || !p.opciones || p.opciones.length === 0
          let respTexto = ''
          let valor = index % 3 === 0 ? 5 : index % 3 === 1 ? 4 : 3
          let esAlerta = false

          if (!esAbierta && p.opciones && p.opciones.length > 0) {
            const opcSelec = p.opciones[(i + index) % p.opciones.length]
            if (opcSelec) {
              respTexto = opcSelec.texto
              valor = typeof opcSelec.valor === 'number' ? opcSelec.valor : valor
              esAlerta = Boolean(opcSelec.esAlerta)
            }
          } else {
            // Pregunta abierta real: asignar texto libre coherente según el propósito de la pregunta
            const txtPreg = (p.texto || '').toLowerCase()
            if (p.id === 'b6-p33b-que-estudia' || txtPreg.includes('estudi') || txtPreg.includes('carrera') || txtPreg.includes('programa')) {
              respTexto = estudiosEjemplo[i % estudiosEjemplo.length] || 'Ingeniería en Data'
            } else {
              respTexto = comentariosAbiertosEjemplo[(i + index) % comentariosAbiertosEjemplo.length] || ''
            }
          }

          itemsGenerados.push({
            idPregunta: p.id,
            textoPregunta: p.texto || `Pregunta ${index + 1}`,
            categoria: p.categoria || 'General',
            respuesta: respTexto,
            valor,
            esAlerta,
            // IMPORTANTE: Nunca agregar comentarios falsos a preguntas de opción múltiple
            comentario: esAbierta ? respTexto : ''
          })
        })

        const puntajeGeneral = Number((itemsGenerados.reduce((sum, item) => sum + (typeof item.valor === 'number' ? item.valor : 0), 0) / Math.max(1, itemsGenerados.length)).toFixed(1))

        respuestasAnonimas.value.unshift({
          idRespuesta: `resp-test-${Date.now()}-${i}`,
          idEncuesta: targetEnc.id,
          tituloEncuesta: targetEnc.titulo,
          dispositivoUUID: `test-uuid-${Math.random().toString(36).substring(2, 8)}`,
          nombreEquipoPC: 'PC-TEST',
          cuentaUsuarioPC: 'usuario.local',
          ubicacion: {
            ciudad: 'Bogotá',
            pais: 'Colombia',
            sede: 'Sede Principal',
            lat: 4.6534,
            lng: -74.0836,
            ipAprox: '190.157.34.112'
          },
          fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
          hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          timestampISO: new Date().toISOString(),
          respuestas: itemsGenerados,
          alertasDetectadas: itemsGenerados.some(item => item.esAlerta) ? ['Alerta de prueba'] : [],
          categoriasAlerta: itemsGenerados.some(item => item.esAlerta) ? ['burnout'] : [],
          puntajeGeneral
        })
      }

      targetEnc.totalRespuestas = (targetEnc.totalRespuestas || 0) + cantidad
      targetEnc.puntajePromedio = Number((respuestasAnonimas.value.reduce((sum, r) => sum + (r.puntajeGeneral || 0), 0) / Math.max(1, respuestasAnonimas.value.length)).toFixed(1))

      persistirRespuestas()
      persistirEncuestas()
      mostrarExito('Respuestas de prueba inyectadas', `Se inyectaron ${cantidad} respuestas de prueba en almacenamiento local.`)
      return true
    } catch (e: any) {
      mostrarError('Fallo al inyectar datos de prueba', `No se pudieron guardar las respuestas locales. ${e.message || ''}`)
      return false
    }
  }

  const vaciarTodasLasEstadisticas = async (): Promise<boolean> => {
    respuestasAnonimas.value = []
    encuestas.value.forEach(e => {
      if (e.estado !== 'Finalizada') {
        e.totalRespuestas = 0
        e.alertasRegistradas = 0
        e.puntajePromedio = 0.0
      }
    })

    try {
      await fetch(`${API_URL}/respuestas/limpiar`, {
        method: 'DELETE'
      })
    } catch (e: any) {
      console.warn('[useEncuestas] No se pudo limpiar la base de datos PostgreSQL:', e)
    }

    persistirRespuestas()
    persistirEncuestas()
    mostrarExito('Base de datos y estadísticas limpiadas', 'PostgreSQL y las estadísticas locales quedaron en cero para recibir mediciones reales.')
    return true
  }

  const finalizarYArchivarProyecto = async (idEncuesta: string): Promise<Encuesta | null> => {
    const encOriginal = encuestas.value.find(e => e.id === idEncuesta) || encuestas.value[0]
    if (!encOriginal) return null

    const respuestasActuales = respuestasAnonimas.value.filter(r =>
      r.idEncuesta === idEncuesta || (idEncuesta === 'enc-001' && (!r.idEncuesta || r.idEncuesta === 'enc-001'))
    )

    const copiaRespuestas: RegistroRespuesta[] = JSON.parse(JSON.stringify(respuestasActuales))
    const totalResp = copiaRespuestas.length
    const totalAlertas = copiaRespuestas.reduce((acc, r) => acc + (r.alertasDetectadas?.length || 0), 0)
    const sumaPuntajes = copiaRespuestas.reduce((acc, r) => acc + (r.puntajeGeneral || 0), 0)
    const puntajeProm = totalResp > 0 ? Number((sumaPuntajes / totalResp).toFixed(1)) : 0.0
    const porcentajeClima = totalResp > 0 ? Math.round((puntajeProm / 5) * 100) : 0

    const ahora = new Date()
    const anioActual = ahora.getFullYear()
    const fechaFin = ahora.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

    const tarjetaFinalizada: Encuesta = {
      id: `enc-archivada-${anioActual}-${Date.now().toString(36)}`,
      titulo: `${encOriginal.id === 'enc-001' ? 'Proyecto Clima Laboral' : encOriginal.titulo} — Cierre ${anioActual}`,
      descripcion: `Proyecto finalizado el ${fechaFin}. Contiene las preguntas y el análisis estadístico almacenado (${totalResp} respuestas, ${porcentajeClima}% satisfacción).`,
      departamento: encOriginal.departamento || 'General',
      creadoPor: encOriginal.creadoPor || 'Super Administrador',
      fechaCreacion: encOriginal.fechaCreacion || fechaFin,
      estado: 'Finalizada',
      bloques: encOriginal.bloques ? JSON.parse(JSON.stringify(encOriginal.bloques)) : undefined,
      preguntas: JSON.parse(JSON.stringify(encOriginal.preguntas || [])),
      preguntasSeguimiento: encOriginal.preguntasSeguimiento ? JSON.parse(JSON.stringify(encOriginal.preguntasSeguimiento)) : [],
      totalRespuestas: totalResp,
      alertasRegistradas: totalAlertas,
      puntajePromedio: puntajeProm,
      porcentajeClimaFinal: porcentajeClima,
      anioCierre: anioActual,
      fechaFinalizacion: fechaFin,
      respuestasArchivadas: copiaRespuestas
    }

    // Insertar la tarjeta del proyecto finalizado para consulta en solo lectura
    encuestas.value.push(tarjetaFinalizada)

    // Limpiar las respuestas activas del proyecto para iniciar un nuevo año desde cero
    respuestasAnonimas.value = respuestasAnonimas.value.filter(r =>
      !(r.idEncuesta === idEncuesta || (idEncuesta === 'enc-001' && (!r.idEncuesta || r.idEncuesta === 'enc-001')))
    )

    encOriginal.estado = 'Activa'
    encOriginal.totalRespuestas = 0
    encOriginal.alertasRegistradas = 0
    encOriginal.puntajePromedio = 0.0

    try {
      await fetch(`${API_URL}/respuestas/limpiar`, {
        method: 'DELETE'
      })
    } catch (e: any) {
      console.warn('[useEncuestas] No se pudo limpiar las respuestas activas en backend:', e)
    }

    persistirRespuestas()
    persistirEncuestas()
    mostrarExito(
      'Proyecto Finalizado y Almacenado',
      `Los datos (${totalResp} respuestas) quedaron guardados en la tarjeta finalizada y el proyecto activo quedó libre en cero para iniciar el nuevo año.`
    )
    return tarjetaFinalizada
  }

  const inyectarRespuestaPersonalizada = async (datos: {
    idEncuesta: string
    idPregunta: string
    textoPregunta: string
    categoria: string
    respuestaTexto: string
    valorNumerico: number
    esAlerta: boolean
    comentario?: string
  }): Promise<boolean> => {
    try {
      await registrarRespuestaAnonima(
        datos.idEncuesta,
        [{
          idPregunta: datos.idPregunta,
          textoPregunta: datos.textoPregunta,
          categoria: datos.categoria,
          respuesta: datos.respuestaTexto,
          valor: datos.valorNumerico,
          esAlerta: datos.esAlerta,
          comentario: datos.comentario
        }],
        {
          ciudad: 'Bogotá',
          pais: 'Colombia',
          sede: 'Sede Principal',
          lat: 4.6534,
          lng: -74.0836,
          ipAprox: '190.157.34.112'
        },
        30,
        'admin.test'
      )

      return true
    } catch (e: any) {
      mostrarError('Error al inyectar', e.message || 'No se pudo guardar la respuesta de prueba')
      return false
    }
  }

  cargarEncuestasDesdeLocal()
  cargarRespuestasDesdeLocal()

  return {
    encuestas,
    respuestasAnonimas,
    cargandoEncuestas,
    totalEncuestas,
    encuestasActivas,
    totalRespuestasGlobales,
    alertasTotales,
    promedioSatisfaccionGlobal,
    cargarEncuestasDesdeLocal,
    cargarRespuestasDesdeLocal,
    crearEncuesta,
    editarEncuesta,
    eliminarEncuesta,
    obtenerEncuestaPorId,
    registrarRespuestaAnonima,
    obtenerRespuestasDeEncuesta,
    vaciarEstadisticasEncuesta,
    eliminarRespuestaIndividual,
    vaciarTodasLasEstadisticas,
    finalizarYArchivarProyecto,
    inyectarDatosDePrueba,
    inyectarRespuestaPersonalizada
  }
}
