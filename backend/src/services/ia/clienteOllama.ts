/**
 * ============================================================================
 * CLIENTE CENTRALIZADO DE OLLAMA EN EL SERVIDOR (clienteOllama.ts)
 * ============================================================================
 * Gestiona la conexión y consultas HTTP al motor de Ollama dentro de la red
 * local o contenedor Docker en español.
 */

const rawOllamaHost = process.env.OLLAMA_HOST || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
export const OLLAMA_HOST = rawOllamaHost.replace(/\/+$/, '')
export const MODELO_DEFECTO = process.env.OLLAMA_MODEL || 'llama3'

/**
 * Verifica la conectividad con Ollama en el servidor
 */
export async function verificarEstadoOllama(): Promise<boolean> {
  try {
    const respuesta = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000)
    })
    return respuesta.ok
  } catch {
    return false
  }
}

/**
 * Realiza una consulta JSON a Ollama con timeout de seguridad
 */
export async function consultarOllamaJson(prompt: string, timeoutMs: number = 7000): Promise<any | null> {
  const estaConectado = await verificarEstadoOllama()
  if (!estaConectado) return null

  try {
    const respuesta = await fetch(`${OLLAMA_HOST}/api/generate`, {
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
