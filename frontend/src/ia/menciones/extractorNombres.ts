/**
 * ============================================================================
 * EXTRACTOR DE NOMBRES HUMANOS Y CLASIFICADOR DE CONDUCTA (extractorNombres.ts)
 * ============================================================================
 * Extrae únicamente nombres de personas reales mencionadas en comentarios
 * abiertos (nunca opciones múltiples ni nombres de empresas como Contigo).
 */

import { NOMBRES_COMUNES, esNombreValidoPersona } from './diccionarioNombres'
import { esOpcionMultipleCerrada } from './filtroComentariosReales'

function normalizarPalabraNombre(nom: string): string {
  if (!nom) return ''
  const limpio = nom.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
  if (!esNombreValidoPersona(limpio)) return ''
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase()
}

function normalizarNombreCompuesto(textoCandidato: string): string {
  if (!textoCandidato) return ''
  const partes = textoCandidato
    .trim()
    .split(/\s+/)
    .map(p => normalizarPalabraNombre(p))
    .filter(Boolean)
  if (partes.length === 0) return ''
  return partes.slice(0, 3).join(' ')
}

function agregarNombreSinDuplicar(encontrados: Set<string>, nuevoNombre: string) {
  if (!nuevoNombre) return
  const nuevoLow = nuevoNombre.toLowerCase()
  for (const existente of Array.from(encontrados)) {
    const exLow = existente.toLowerCase()
    if (exLow === nuevoLow) return
    if (exLow.split(' ').includes(nuevoLow)) return
    if (nuevoLow.split(' ').includes(exLow)) {
      encontrados.delete(existente)
    }
  }
  encontrados.add(nuevoNombre)
}

export function extraerNombresDeTexto(texto: string, esCampoDirecto: boolean = false): string[] {
  if (!texto || texto.trim().length < 3) return []
  const txtTrim = texto.trim()
  if (esOpcionMultipleCerrada(txtTrim)) return []

  const encontrados = new Set<string>()

  // 1. Patrones explícitos de cargo o señalamiento seguidos de nombre
  const patronesContextuales = [
    /(?:supervisor|supervisora|l[íi]der|jefe|jefa|coordinador|coordinadora|gerente|director|directora|don|do[ñn]a|sr\.?|sra\.?|se[ñn]or|se[ñn]ora|compa[ñn]ero|compa[ñn]era|colega|encargado|encargada|ingeniero|ingeniera|doctor|doctora|analista|asesor|asesora|formador|formadora|capacitador|capacitadora|monitor|monitora)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ]{3,}(?:\s+[a-záéíóúñA-ZÁÉÍÓÚÑ]{3,})?)/gi,
    /(?:se llama|nombre es|llamado|llamada|a cargo de|culpa de|por parte de|menciono a|problema con|problemas con|queja de|queja contra|acoso de|maltrato de|gritos de|actitud de|trato de)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ]{3,}(?:\s+[a-záéíóúñA-ZÁÉÍÓÚÑ]{3,})?)/gi
  ]

  patronesContextuales.forEach(patron => {
    let match: RegExpExecArray | null
    patron.lastIndex = 0
    while ((match = patron.exec(txtTrim)) !== null) {
      const rawCand = (match[1] || '').trim()
      const tokens = rawCand.split(/\s+/)
      const validos: string[] = []
      for (const tk of tokens) {
        const low = tk.toLowerCase()
        if (esNombreValidoPersona(tk) && (NOMBRES_COMUNES.has(low) || (validos.length > 0 && /^[A-ZÁÉÍÓÚÑ]/.test(tk)))) {
          validos.push(normalizarPalabraNombre(tk))
        } else {
          break
        }
      }
      if (validos.length > 0) {
        agregarNombreSinDuplicar(encontrados, validos.slice(0, 2).join(' '))
      }
    }
  })

  // 2. Patrón sujeto + verbo de queja: "[Nombre] me grita / acosa..."
  const patronSujetoVerbo = /\b([A-ZÁÉÍÓÚÑa-záéíóúñ]{3,}(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]{3,})?)\s+(?:me|nos|le|les|se|siempre|nunca|solo|no)\s+(?:acosa|grita|molesta|trata|habla|exige|insulta|humilla|ignora|amenaza|presiona|regaña|maltrata)\b/gi
  let matchSV: RegExpExecArray | null
  while ((matchSV = patronSujetoVerbo.exec(txtTrim)) !== null) {
    const rawSujeto = (matchSV[1] || '').trim()
    const tokens = rawSujeto.split(/\s+/).filter(tk => esNombreValidoPersona(tk) && NOMBRES_COMUNES.has(tk.toLowerCase()))
    if (tokens.length > 0) {
      const nom = normalizarNombreCompuesto(tokens.join(' '))
      if (nom) agregarNombreSinDuplicar(encontrados, nom)
    }
  }

  // 3. Búsqueda estricta por diccionario de nombres humanos (evita falsos positivos con palabras en mayúscula)
  const segmentosOracion = txtTrim.split(/[.!?;:\n,()"/]+/)
  segmentosOracion.forEach(segmento => {
    const palabras = segmento.trim().split(/\s+/).filter(Boolean)
    let bufferNombre: string[] = []

    const vaciarBuffer = () => {
      if (bufferNombre.length > 0) {
        agregarNombreSinDuplicar(encontrados, bufferNombre.slice(0, 3).join(' '))
        bufferNombre = []
      }
    }

    palabras.forEach(palabraRaw => {
      const limpia = palabraRaw.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
      const low = limpia.toLowerCase()
      const estaEnDiccionario = NOMBRES_COMUNES.has(low)
      const esApellidoAdyacente = bufferNombre.length > 0 && /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}$/.test(limpia)

      if (esNombreValidoPersona(limpia) && (estaEnDiccionario || esApellidoAdyacente)) {
        const norm = normalizarPalabraNombre(limpia)
        if (norm) {
          bufferNombre.push(norm)
          return
        }
      }
      vaciarBuffer()
    })
    vaciarBuffer()
  })

  // 4. Si es un campo directo de "¿Quién?" (12b) y escribió 1 o 2 nombres válidos
  if (encontrados.size === 0 && esCampoDirecto) {
    const palabrasDirectas = txtTrim.split(/\s+/).map(p => p.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')).filter(Boolean)
    if (palabrasDirectas.length >= 1 && palabrasDirectas.length <= 2) {
      const todasValidas = palabrasDirectas.every(p => esNombreValidoPersona(p) && NOMBRES_COMUNES.has(p.toLowerCase()))
      if (todasValidas) {
        const nom = normalizarNombreCompuesto(palabrasDirectas.join(' '))
        if (nom) agregarNombreSinDuplicar(encontrados, nom)
      }
    }
  }

  return Array.from(encontrados)
}

export function clasificarConductaMencion(texto: string): { tipoConducta: string; alertaAsociada: string } {
  const t = texto.toLowerCase()
  if (/acoso sexual|insinuaci[oó]n|propuesta[s]? indebida|tocamiento|contacto f[íi]sico|miradas|comentarios sexuales|sexual|sobrepas[oó]|propasar|indecente/i.test(t)) {
    return {
      tipoConducta: 'Acoso Sexual (Insinuaciones / Contacto / Comentarios Sexuales)',
      alertaAsociada: 'Alerta de Acoso Sexual'
    }
  }
  if (/fuera de horario|fin de semana|vacaciones|descanso|whatsapp en la noche|desconexi[oó]n/i.test(t)) {
    return {
      tipoConducta: 'Invasión de Vida Personal y Desconexión Laboral',
      alertaAsociada: 'Alerta de Invasión de Vida Personal / Desconexión Laboral'
    }
  }
  if (/órdenes contradictorias|ordenes contradictorias|no explica|confusi[oó]n|cambia de funciones|sin capacitaci[oó]n|inducci[oó]n/i.test(t)) {
    return {
      tipoConducta: 'Falta de Claridad en el Rol / Mala Explicación de Procesos',
      alertaAsociada: 'Alerta de Falta de Claridad en el Rol'
    }
  }
  if (/no valora|nunca felicita|no reconoce|ignora el esfuerzo/i.test(t)) {
    return {
      tipoConducta: 'Falta de Reconocimiento y Valoración del Esfuerzo',
      alertaAsociada: 'Alerta de Reconocimiento y Valoración'
    }
  }
  return {
    tipoConducta: 'Molestias y Fastidio Cotidiano ("Se la están montando" / Trato Hostil)',
    alertaAsociada: 'Alerta de Molestias y Fastidio Cotidiano'
  }
}
