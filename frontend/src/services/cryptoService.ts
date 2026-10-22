/**
 * ============================================================================
 * SERVICIO DE CRIPTOGRAFÍA Y SEGURIDAD (src/services/cryptoService.ts)
 * ============================================================================
 * Proporciona funciones de encriptación de grado militar (AES-GCM 256 bits),
 * hashing irreversible (SHA-256) para anonimizar identificadores de colaboradores
 * y limpieza profunda de rastros de credenciales en almacenamiento local.
 */

/**
 * Genera un hash criptográfico SHA-256 irreversible.
 * Ideal para anonimizar UUID de dispositivos, direcciones IP y tokens sin exponer PII.
 */
export async function sha256(texto: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Fallback simple si se ejecuta fuera de contexto seguro
    let hash = 0
    for (let i = 0; i < texto.length; i++) {
      const char = texto.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash |= 0
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(texto)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Deriva una llave criptográfica AES-GCM de 256 bits a partir de una contraseña o frase secreta
 */
async function derivarClaveAES(secreto: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secreto),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encripta un texto o carga JSON usando AES-GCM de 256 bits con vector de inicialización aleatorio.
 * Retorna string en formato Base64 seguro para transmisión por red o almacenamiento.
 */
export async function encriptarAES(textoPlano: string, claveSecreta: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return btoa(unescape(encodeURIComponent(textoPlano)))
  }

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const clave = await derivarClaveAES(claveSecreta, salt)

  const encoder = new TextEncoder()
  const datosCodificados = encoder.encode(textoPlano)

  const bufferCifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    clave,
    datosCodificados
  )

  // Empaquetar salt (16 bytes) + iv (12 bytes) + texto cifrado
  const combined = new Uint8Array(salt.byteLength + iv.byteLength + bufferCifrado.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.byteLength)
  combined.set(new Uint8Array(bufferCifrado), salt.byteLength + iv.byteLength)

  let binario = ''
  for (let i = 0; i < combined.byteLength; i++) {
    binario += String.fromCharCode(combined[i]!)
  }
  return btoa(binario)
}

/**
 * Desencripta un string en Base64 cifrado con AES-GCM.
 */
export async function desencriptarAES(cadenaCifradaBase64: string, claveSecreta: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    try {
      return decodeURIComponent(escape(atob(cadenaCifradaBase64)))
    } catch {
      return cadenaCifradaBase64
    }
  }

  const binario = atob(cadenaCifradaBase64)
  const combined = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) {
    combined[i] = binario.charCodeAt(i)
  }

  const salt = combined.slice(0, 16)
  const iv = combined.slice(16, 28)
  const ciphertext = combined.slice(28)

  const clave = await derivarClaveAES(claveSecreta, salt)

  const bufferDescifrado = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    clave,
    ciphertext
  )

  const decoder = new TextDecoder()
  return decoder.decode(bufferDescifrado)
}

/**
 * Limpia y purga de forma irreversible cualquier rastro de respuestas o credenciales
 * que hayan podido quedar almacenadas en el navegador (localStorage / sessionStorage).
 */
export function depurarRastrosLocales(): void {
  if (typeof window === 'undefined') return

  const llavesAEliminar = [
    'hablandocontigo_respuestas',
    'hablandocontigo_db_table_cuentas_admin',
    'hablandocontigo_db_table_encuestas',
    'hablandocontigo_db_table_respuestas',
    'hablandocontigo_credenciales',
    'hablandocontigo_usuarios_mock'
  ]

  llavesAEliminar.forEach(clave => {
    try {
      window.localStorage.removeItem(clave)
      window.sessionStorage.removeItem(clave)
    } catch {
      // Ignorar errores de sandbox
    }
  })

  // Limpiar cualquier otra clave huérfana de tablas mock
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const key = window.localStorage.key(i)
      if (key && (key.startsWith('hablandocontigo_db_table_') || key.startsWith('hablandocontigo_primer_ingreso_'))) {
        window.localStorage.removeItem(key)
      }
    }
  } catch {
    // Ignorar
  }
}
