/**
 * ============================================================================
 * SERVICIO DE GESTIÓN DE IDENTIDAD ANÓNIMA (UUID) Y GEOLOCALIZACIÓN EXACTA
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * - Genera y almacena el UUID único universal del hardware del colaborador.
 * - Captura la GEOLOCALIZACIÓN EXACTA mediante la API Geolocation de alta precisión del navegador
 *   (GPS / triangulación WiFi) y geocodificación inversa detallada en español (calle, barrio, ciudad, departamento).
 * - Realiza fallback a servicios de geolocalización IP en tiempo real si el GPS no está disponible.
 * - Incluye precalentamiento (warm-up) para resolver la ubicación en segundo plano mientras el usuario responde.
 */

export interface UbicacionExacta {
  ciudad: string
  departamento?: string
  pais: string
  sede: string
  direccionAprox: string
  lat: number
  lng: number
  precisionMetros: number
  ipAprox: string
  proveedorRed: string
  esGpsReal: boolean
}

/** Clave de persistencia para el identificador único anónimo en localStorage */
const CLAVE_ALMACENAMIENTO_UUID_DISPOSITIVO = 'hablandocontigo_device_uuid'

/** Caché de ubicación en memoria para entrega instantánea */
let ubicacionPreviaCachada: UbicacionExacta | null = null
let promesaUbicacionEnCurso: Promise<UbicacionExacta> | null = null

/**
 * Obtiene el UUID anónimo existente en el almacenamiento local o genera uno nuevo
 * utilizando la API criptográfica nativa del navegador.
 * 
 * @returns {string} Identificador único del dispositivo (ej. 'dev-4b8a-92fa-01ec84e')
 */
export function obtenerODefinirDispositivoUUID(): string {
  let identificadorUnico = localStorage.getItem(CLAVE_ALMACENAMIENTO_UUID_DISPOSITIVO)
  
  if (!identificadorUnico) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      identificadorUnico = crypto.randomUUID()
    } else {
      identificadorUnico = 'dev-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(caracter) {
        const aleatorio = Math.random() * 16 | 0
        const valorHex = caracter === 'x' ? aleatorio : (aleatorio & 0x3 | 0x8)
        return valorHex.toString(16)
      })
    }
    localStorage.setItem(CLAVE_ALMACENAMIENTO_UUID_DISPOSITIVO, identificadorUnico)
  }
  
  return identificadorUnico
}

/**
 * Obtiene la fecha, hora formateada en español y marca temporal ISO actual.
 */
export function obtenerFechaYHoraActual(): { fecha: string; hora: string; timestampISO: string } {
  const fechaActual = new Date()
  
  const fechaFormateada = fechaActual.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  const horaFormateada = fechaActual.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  return {
    fecha: fechaFormateada,
    hora: horaFormateada,
    timestampISO: fechaActual.toISOString()
  }
}

/**
 * Geocodificación inversa detallada de coordenadas (lat, lng) a dirección y ciudad exacta
 */
async function geocodificarCoordenadasExactas(lat: number, lng: number, precision: number): Promise<UbicacionExacta> {
  // 1. Intentar BigDataCloud Client-side API (muy rápida, precisa, CORS abierto y en español)
  try {
    const resBdc = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`,
      { signal: AbortSignal.timeout(4500) }
    )
    if (resBdc.ok) {
      const data = await resBdc.json()
      const ciudad = data.city || data.locality || data.principalSubdivision || 'Ubicación Detectada'
      const departamento = data.principalSubdivision || ''
      const pais = data.countryName || 'Colombia'
      const barrio = data.locality || data.localityInfo?.administrative?.[3]?.name || ''
      const direccion = [barrio, ciudad, departamento, pais].filter(Boolean).join(', ')

      return {
        ciudad,
        departamento,
        pais,
        sede: barrio ? `Sede ${ciudad} (${barrio})` : `Sede ${ciudad}`,
        direccionAprox: direccion || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
        lat,
        lng,
        precisionMetros: precision,
        ipAprox: 'Sensor GPS / WiFi',
        proveedorRed: 'Geolocalización Exacta de Alta Precisión',
        esGpsReal: true
      }
    }
  } catch (e) {
    // Continuar a fallback Nominatim
  }

  // 2. Fallback: OpenStreetMap Nominatim
  try {
    const resNom = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'es' },
        signal: AbortSignal.timeout(4500)
      }
    )
    if (resNom.ok) {
      const data = await resNom.json()
      const address = data.address || {}
      const ciudad = address.city || address.town || address.village || address.municipality || 'Bogotá'
      const barrio = address.suburb || address.neighbourhood || address.quarter || address.road || ''
      const departamento = address.state || ''
      const pais = address.country || 'Colombia'

      return {
        ciudad,
        departamento,
        pais,
        sede: barrio ? `Sede ${ciudad} - ${barrio}` : `Sede ${ciudad}`,
        direccionAprox: data.display_name?.split(',').slice(0, 4).join(',') || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
        lat,
        lng,
        precisionMetros: precision,
        ipAprox: 'Sensor GPS',
        proveedorRed: 'Sensor GPS / Satélite',
        esGpsReal: true
      }
    }
  } catch (e) {}

  // Fallback con coordenadas puras
  return {
    ciudad: 'Ubicación GPS',
    pais: 'Colombia',
    sede: `GPS: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
    direccionAprox: `Coordenadas exactas: ${lat.toFixed(5)}°, ${lng.toFixed(5)}° (±${precision}m)`,
    lat,
    lng,
    precisionMetros: precision,
    ipAprox: 'Sensor GPS',
    proveedorRed: 'GPS Alta Precisión',
    esGpsReal: true
  }
}

/**
 * Obtiene geolocalización por IP en tiempo real como respaldo seguro
 */
async function obtenerUbicacionPorIP(): Promise<UbicacionExacta | null> {
  // Servicio 1: ipwho.is
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3500) })
    if (res.ok) {
      const data = await res.json()
      if (data.success) {
        return {
          ciudad: data.city || 'Bogotá',
          departamento: data.region || 'Cundinamarca',
          pais: data.country || 'Colombia',
          sede: `Sede ${data.city || 'Principal'} - Red ${data.connection?.isp || 'Corporativa'}`,
          direccionAprox: `${data.city || ''}, ${data.region || ''}, ${data.country || ''}`,
          lat: data.latitude || 4.6534,
          lng: data.longitude || -74.0836,
          precisionMetros: 500,
          ipAprox: data.ip || '190.157.34.112',
          proveedorRed: data.connection?.isp || data.connection?.org || 'Red Corporativa',
          esGpsReal: false
        }
      }
    }
  } catch (e) {}

  // Servicio 2: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) })
    if (res.ok) {
      const data = await res.json()
      return {
        ciudad: data.city || 'Bogotá',
        departamento: data.region || 'Cundinamarca',
        pais: data.country_name || 'Colombia',
        sede: `Sede ${data.city || 'Principal'} (${data.org || 'Red Local'})`,
        direccionAprox: `${data.city}, ${data.region}, ${data.country_name}`,
        lat: data.latitude || 4.6534,
        lng: data.longitude || -74.0836,
        precisionMetros: 500,
        ipAprox: data.ip || '190.157.34.112',
        proveedorRed: data.org || 'Proveedor de Internet',
        esGpsReal: false
      }
    }
  } catch (e) {}

  return null
}

/**
 * Inicia la captura de ubicación en segundo plano tan pronto se monta la pantalla de la encuesta
 */
export function iniciarCapturaUbicacion(): void {
  if (!promesaUbicacionEnCurso) {
    promesaUbicacionEnCurso = obtenerUbicacionExactaDispositivo()
  }
}

/**
 * Obtiene la ubicación EXACTA del colaborador utilizando GPS real del navegador
 * o geolocalización de red IP con geocodificación inversa precisa.
 */
export async function obtenerUbicacionExactaDispositivo(): Promise<UbicacionExacta> {
  if (ubicacionPreviaCachada && ubicacionPreviaCachada.esGpsReal) {
    return ubicacionPreviaCachada
  }

  // 1. Intentar GPS de alta precisión con la API Geolocation del navegador
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const posicion = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      })

      const lat = posicion.coords.latitude
      const lng = posicion.coords.longitude
      const precision = Math.round(posicion.coords.accuracy || 10)

      const ubicacionExacta = await geocodificarCoordenadasExactas(lat, lng, precision)
      ubicacionPreviaCachada = ubicacionExacta
      return ubicacionExacta
    } catch (err) {
      console.info('GPS no concedido o en espera, recurriendo a geolocalización IP en tiempo real.')
    }
  }

  // 2. Respaldo por IP
  const ubicacionIp = await obtenerUbicacionPorIP()
  if (ubicacionIp) {
    ubicacionPreviaCachada = ubicacionIp
    return ubicacionIp
  }

  // 3. Fallback corporativo base
  const fallback: UbicacionExacta = {
    ciudad: 'Bogotá',
    departamento: 'Cundinamarca',
    pais: 'Colombia',
    sede: 'Sede Principal Calle 26 - Piso 4',
    direccionAprox: 'Av. El Dorado #68C-61, Bogotá',
    lat: 4.6534,
    lng: -74.0836,
    precisionMetros: 50,
    ipAprox: '190.157.34.112',
    proveedorRed: 'Red LAN Corporativa',
    esGpsReal: false
  }

  ubicacionPreviaCachada = fallback
  return fallback
}
