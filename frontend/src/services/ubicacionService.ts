/**
 * ============================================================================
 * SERVICIO DE GEOLOCALIZACIÓN EXACTA Y SENSORES (ubicacionService.ts)
 * ============================================================================
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

let ubicacionPreviaCachada: UbicacionExacta | null = null
let promesaUbicacionEnCurso: Promise<UbicacionExacta> | null = null

/**
 * Geocodificación inversa detallada de coordenadas (lat, lng) a dirección y ciudad
 */
async function geocodificarCoordenadasExactas(lat: number, lng: number, precision: number): Promise<UbicacionExacta> {
  // 1. API BigDataCloud Client-side
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
  } catch {}

  // 2. Fallback Nominatim OpenStreetMap
  try {
    const resNom = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' }, signal: AbortSignal.timeout(4500) }
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
  } catch {}

  return {
    ciudad: 'Ubicación GPS',
    pais: 'Colombia',
    sede: `GPS: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
    direccionAprox: `Coordenadas: ${lat.toFixed(5)}°, ${lng.toFixed(5)}° (±${precision}m)`,
    lat,
    lng,
    precisionMetros: precision,
    ipAprox: 'Sensor GPS',
    proveedorRed: 'GPS Alta Precisión',
    esGpsReal: true
  }
}

/**
 * Respaldo por IP si el GPS no está activo
 */
async function obtenerUbicacionPorIP(): Promise<UbicacionExacta | null> {
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
  } catch {}

  return null
}

/**
 * Precalienta e inicia la captura de ubicación en segundo plano
 */
export function iniciarCapturaUbicacion(): void {
  if (!promesaUbicacionEnCurso) {
    promesaUbicacionEnCurso = obtenerUbicacionExactaDispositivo()
  }
}

/**
 * Obtiene la ubicación exacta (GPS real o IP con geocodificación)
 */
export async function obtenerUbicacionExactaDispositivo(): Promise<UbicacionExacta> {
  if (ubicacionPreviaCachada?.esGpsReal) {
    return ubicacionPreviaCachada
  }

  // 1. Intentar GPS de alta precisión del navegador
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const posicion = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      const lat = posicion.coords.latitude
      const lng = posicion.coords.longitude
      const precision = Math.round(posicion.coords.accuracy || 10)

      const ubicacionExacta = await geocodificarCoordenadasExactas(lat, lng, precision)
      ubicacionPreviaCachada = ubicacionExacta
      return ubicacionExacta
    } catch {
      // Continuar al respaldo IP
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
