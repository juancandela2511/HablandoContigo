/**
 * ============================================================================
 * SERVICIO DE RESPUESTAS ANÓNIMAS Y AUDITORÍA (servicioRespuestas.ts)
 * ============================================================================
 * Procesa la recepción y almacenamiento seguro de respuestas anónimas de
 * colaboradores, detección de alertas psicosociales y recálculo de índices.
 */

import { type Ref } from 'vue'
import { obtenerApiBaseUrl } from '@/services/api'
import { obtenerODefinirDispositivoUUID, obtenerFechaYHoraActual, type UbicacionExacta } from '@/services/deviceService'
import { sha256 } from '@/services/cryptoService'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import type { AlertaGeminiEstricta } from '@/ia'
import type { Encuesta, RegistroRespuesta, RespuestaItem, CategoriaAlertaPsicosocial, UbicacionAuditoria } from './tiposEncuestas'
import { persistirEncuestasEnLocalStorage, persistirRespuestasEnLocalStorage } from './persistenciaEncuestas'
import { fusionarPreguntasConConfiguracion } from './normalizadorPreguntas'
import { calcularPuntajeDeRegistro, calcularClimaGlobalDeRespuestas } from '@/services/calculadorClimaService'

const API_URL = obtenerApiBaseUrl()

export async function registrarNuevaRespuestaAnonima(
  idEncuesta: string,
  items: RespuestaItem[],
  encuestasRef: Ref<Encuesta[]>,
  respuestasRef: Ref<RegistroRespuesta[]>,
  ubicacionPersonalizada?: UbicacionExacta | UbicacionAuditoria,
  duracionSegundos?: number,
  identificacionVoluntaria?: string,
  alertasGemini?: AlertaGeminiEstricta[]
): Promise<RegistroRespuesta | null> {
  const encuestaEncontrada = encuestasRef.value.find(e => e.id === idEncuesta)
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
  const evaluacionClima = calcularPuntajeDeRegistro(items)
  const puntajeGeneral = evaluacionClima.puntajePromedio

  const ubicacionFinal: UbicacionAuditoria = ubicacionPersonalizada ? {
    ciudad: ubicacionPersonalizada.ciudad || 'Bogotá',
    pais: ubicacionPersonalizada.pais || 'Colombia',
    sede: ubicacionPersonalizada.sede || 'Sede Principal',
    direccionAprox: ubicacionPersonalizada.direccionAprox || 'Av. El Dorado #68C-61, Bogotá',
    lat: ubicacionPersonalizada.lat ?? 4.6534,
    lng: ubicacionPersonalizada.lng ?? -74.0836,
    ipAprox: ubicacionPersonalizada.ipAprox || '190.157.34.112',
    proveedorRed: ubicacionPersonalizada.proveedorRed || 'Red Corporativa'
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

  // 1. Guardar inmediatamente en memoria y localStorage para que nunca se pierda en local
  respuestasRef.value.unshift(nuevoRegistro)

  if (encuestaEncontrada) {
    const nuevoTotal = (encuestaEncontrada.totalRespuestas || 0) + 1
    const nuevasAlertas = alertasUnicas.length > 0 ? (encuestaEncontrada.alertasRegistradas || 0) + 1 : (encuestaEncontrada.alertasRegistradas || 0)
    encuestaEncontrada.totalRespuestas = nuevoTotal
    encuestaEncontrada.alertasRegistradas = nuevasAlertas
    const respsDeEncuesta = respuestasRef.value.filter(r => r.idEncuesta === idEncuesta)
    encuestaEncontrada.puntajePromedio = calcularClimaGlobalDeRespuestas(respsDeEncuesta).puntajePromedio
  }

  persistirRespuestasEnLocalStorage(respuestasRef.value)
  persistirEncuestasEnLocalStorage(encuestasRef.value)

  // 2. Persistencia atómica en PostgreSQL (si el servidor local está activo)
  try {
    const hashDispositivo = await sha256(uuidDispositivo)
    await fetch(`${API_URL}/respuestas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idRespuesta: nuevoRegistro.idRespuesta,
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
    console.warn('[servicioRespuestas] Respuesta guardada en localStorage (PostgreSQL no disponible):', apiErr)
  }

  return nuevoRegistro
}

export function vaciarEstadisticasDeEncuesta(
  idEncuesta: string,
  encuestasRef: Ref<Encuesta[]>,
  respuestasRef: Ref<RegistroRespuesta[]>
): boolean {
  respuestasRef.value = respuestasRef.value.filter(r => r.idEncuesta !== idEncuesta)
  const enc = encuestasRef.value.find(e => e.id === idEncuesta)
  if (enc) {
    enc.totalRespuestas = 0
    enc.alertasRegistradas = 0
    enc.puntajePromedio = 0.0
    if (enc.id === 'enc-001') {
      enc.preguntas = fusionarPreguntasConConfiguracion(enc.preguntas)
    }
  }

  persistirRespuestasEnLocalStorage(respuestasRef.value)
  persistirEncuestasEnLocalStorage(encuestasRef.value)
  return true
}

export function eliminarRespuestaPorId(
  idRespuesta: string,
  encuestasRef: Ref<Encuesta[]>,
  respuestasRef: Ref<RegistroRespuesta[]>
): boolean {
  const respuestaAEliminar = respuestasRef.value.find(r => r.idRespuesta === idRespuesta)
  if (!respuestaAEliminar) return false

  respuestasRef.value = respuestasRef.value.filter(r => r.idRespuesta !== idRespuesta)
  const enc = encuestasRef.value.find(e => e.id === respuestaAEliminar.idEncuesta)
  if (enc && (enc.totalRespuestas || 0) > 0) {
    enc.totalRespuestas = Math.max(0, (enc.totalRespuestas || 1) - 1)
    if (respuestaAEliminar.alertasDetectadas.length > 0) {
      enc.alertasRegistradas = Math.max(0, (enc.alertasRegistradas || 1) - 1)
    }
  }

  persistirRespuestasEnLocalStorage(respuestasRef.value)
  persistirEncuestasEnLocalStorage(encuestasRef.value)
  return true
}

export async function limpiarTodasLasRespuestasEnBD(
  encuestasRef: Ref<Encuesta[]>,
  respuestasRef: Ref<RegistroRespuesta[]>
): Promise<boolean> {
  respuestasRef.value = []
  encuestasRef.value.forEach(e => {
    if (e.estado !== 'Finalizada') {
      e.totalRespuestas = 0
      e.alertasRegistradas = 0
      e.puntajePromedio = 0.0
    }
  })

  try {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('hablandocontigo_auth_token') || localStorage.getItem('hablandocontigo_auth_token_jwt'))
      : null
    await fetch(`${API_URL}/respuestas/limpiar`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
  } catch (e: any) {
    console.warn('[servicioRespuestas] No se pudo limpiar la base de datos PostgreSQL:', e)
  }

  persistirRespuestasEnLocalStorage(respuestasRef.value)
  persistirEncuestasEnLocalStorage(encuestasRef.value)
  return true
}
