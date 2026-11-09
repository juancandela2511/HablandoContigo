/**
 * ============================================================================
 * SERVICIO CENTRALIZADO DE API REST HTTP (src/services/api.ts)
 * ============================================================================
 * Reemplaza la sintaxis de Supabase por llamadas HTTP nativas al backend de Node.js + Express + PostgreSQL.
 */

export function obtenerApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) return envUrl
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location
    if (port === '5173' || port === '4173') {
      return `http://${hostname}:3001/api`
    }
    return '/api'
  }
  return 'http://localhost:3001/api'
}

const API_BASE_URL = obtenerApiBaseUrl()

/**
 * Cliente HTTP base para realizar peticiones REST con control de errores y timeout rápido
 */
export async function solicitarApi<T = any>(endpoint: string, opciones: RequestInit = {}): Promise<{ data: T | null; error: string | null }> {
  try {
    const token = localStorage.getItem('hablandocontigo_auth_token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(opciones.headers as Record<string, string>)
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const controller = new AbortController()
    const msTimeout = endpoint.includes('/ia/') ? 18000 : 8000
    const timeoutId = setTimeout(() => controller.abort(), msTimeout)

    const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...opciones,
      headers,
      signal: opciones.signal || controller.signal
    }).finally(() => clearTimeout(timeoutId))

    if (!respuesta.ok) {
      const errorPayload = await respuesta.json().catch(() => ({ message: 'Error de servidor' }))
      return { data: null, error: errorPayload.error || errorPayload.message || 'Error en la petición' }
    }

    const data = await respuesta.json()
    return { data, error: null }
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de red al conectar con el servidor' }
  }
}

/**
 * Servicio API modular para Cuentas, Encuestas, Respuestas y Autenticación
 */
export const apiServicio = {
  auth: {
    iniciarSesion: (credenciales: { email: string; password?: string }) =>
      solicitarApi<{ success: boolean; user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credenciales)
      })
  },
  cuentas: {
    obtenerTodas: () => solicitarApi<any[]>('/cuentas'),
    crear: (cuenta: any) => solicitarApi<any>('/cuentas', { method: 'POST', body: JSON.stringify(cuenta) }),
    actualizar: (id: string, cuenta: any) => solicitarApi<any>(`/cuentas/${id}`, { method: 'PUT', body: JSON.stringify(cuenta) }),
    eliminar: (id: string) => solicitarApi<any>(`/cuentas/${id}`, { method: 'DELETE' })
  },
  encuestas: {
    obtenerTodas: () => solicitarApi<any[]>('/encuestas'),
    obtenerPorId: (id: string) => solicitarApi<any>(`/encuestas/${id}`),
    actualizar: (id: string, datos: any) => solicitarApi<any>(`/encuestas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
  },
  respuestas: {
    obtenerTodas: () => solicitarApi<any[]>('/respuestas'),
    guardar: (respuesta: any) => solicitarApi<any>('/respuestas', { method: 'POST', body: JSON.stringify(respuesta) })
  }
}
