/**
 * ============================================================================
 * CLIENTE CENTRALIZADO DE OLLAMA EN EL SERVIDOR (clienteOllama.ts)
 * ============================================================================
 * Gestiona la conexión y consultas HTTP al motor de Ollama dentro de la red
 * local o contenedor Docker en español.
 */

let hostActivoOllama: string | null = null

const hostsCandidatos = [
  process.env.OLLAMA_HOST,
  process.env.OLLAMA_BASE_URL,
  'http://127.0.0.1:11435',
  'http://localhost:11435',
  'http://127.0.0.1:11434',
  'http://localhost:11434'
].filter(Boolean).map(h => (h as string).replace(/\/+$/, ''))

export const MODELO_DEFECTO = process.env.OLLAMA_MODEL || 'llama3'

/**
 * Obtiene la URL activa de Ollama probando candidatos
 */
export async function resolverHostOllama(): Promise<string | null> {
  if (hostActivoOllama) {
    try {
      const ping = await fetch(`${hostActivoOllama}/api/tags`, { signal: AbortSignal.timeout(1000) })
      if (ping.ok) return hostActivoOllama
    } catch {}
    hostActivoOllama = null
  }

  for (const host of hostsCandidatos) {
    try {
      const respuesta = await fetch(`${host}/api/tags`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(1500)
      })
      if (respuesta.ok) {
        hostActivoOllama = host
        return host
      }
    } catch {}
  }
  return null
}

/**
 * Verifica la conectividad con Ollama en el servidor
 */
export async function verificarEstadoOllama(): Promise<boolean> {
  const host = await resolverHostOllama()
  return Boolean(host)
}

/**
 * Realiza una consulta JSON a Ollama con timeout de seguridad
 */
export async function consultarOllamaJson(prompt: string, timeoutMs: number = 7000): Promise<any | null> {
  const host = await resolverHostOllama()
  if (!host) return null

  try {
    const respuesta = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODELO_DEFECTO,
        prompt,
        stream: false,
        format: 'json'
      }),
      signal: AbortSignal.timeout(timeoutMs)
    })

    if (respuesta.ok) {
      const data: any = await respuesta.json()
      return JSON.parse(data.response)
    }
  } catch {
    console.warn('[ClienteOllama] Consulta fallida o timeout; activando motor heurístico')
  }
  return null
}
