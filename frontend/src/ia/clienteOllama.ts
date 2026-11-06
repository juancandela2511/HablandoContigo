/**
 * Cliente de Conexión Local con Ollama
 * Endpoint: http://localhost:11434
 */

const STORAGE_URL = 'hablandocontigo_ollama_url'
const STORAGE_MODELO = 'hablandocontigo_ollama_modelo'

export function obtenerUrlOllama(): string {
  try {
    const custom = localStorage.getItem(STORAGE_URL)
    if (custom?.trim()) return custom.trim().replace(/\/+$/, '')
  } catch {}
  return (import.meta.env.VITE_OLLAMA_URL as string) || 'http://localhost:11434'
}

export function guardarUrlOllama(url: string) {
  try {
    localStorage.setItem(STORAGE_URL, url.trim().replace(/\/+$/, ''))
  } catch {}
}

export function obtenerModeloOllama(): string {
  try {
    const m = localStorage.getItem(STORAGE_MODELO)
    if (m?.trim()) return m.trim()
  } catch {}
  return (import.meta.env.VITE_OLLAMA_MODEL as string) || 'llama3.2'
}

export function guardarModeloOllama(modelo: string) {
  try {
    localStorage.setItem(STORAGE_MODELO, modelo.trim())
  } catch {}
}

let ultimoFalloOllamaTs = 0
const COOLDOWN_FALLO_MS = 60000

export async function verificarOllama(): Promise<{ conectado: boolean; modelos: string[]; error?: string }> {
  try {
    const res = await fetch(`${obtenerUrlOllama()}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(2000) })
    if (res.ok) {
      ultimoFalloOllamaTs = 0
      const data = await res.json()
      const modelos = (data?.models || []).map((m: any) => m.name || m.model || '')
      return { conectado: true, modelos }
    }
    ultimoFalloOllamaTs = Date.now()
    return { conectado: false, modelos: [], error: `Código ${res.status}` }
  } catch (err: any) {
    ultimoFalloOllamaTs = Date.now()
    return { conectado: false, modelos: [], error: err?.message || 'Ollama desconectado' }
  }
}

export async function consultarOllama(prompt: string, modeloCustom?: string): Promise<string | null> {
  if (Date.now() - ultimoFalloOllamaTs < COOLDOWN_FALLO_MS) {
    return null
  }
  const model = modeloCustom || obtenerModeloOllama()
  try {
    const res = await fetch(`${obtenerUrlOllama()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.1 }
      }),
      signal: AbortSignal.timeout(3000)
    })
    if (!res.ok) {
      ultimoFalloOllamaTs = Date.now()
      return null
    }
    const data = await res.json()
    return data?.response || null
  } catch {
    ultimoFalloOllamaTs = Date.now()
    return null
  }
}
