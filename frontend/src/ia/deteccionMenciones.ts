/**
 * ============================================================================
 * DETECCIÓN INTELIGENTE DE NOMBRES Y DIFERENCIACIÓN DE ACOSO (deteccionMenciones.ts)
 * ============================================================================
 * Analiza comentarios cualitativos y respuestas abiertas de problemas para
 * extraer todos los nombres de personas mencionadas, contar cuántos comentarios
 * tiene cada persona y permitir ver los comentarios exactos al dar clic en el ojo.
 */

import type { PersonaProblemaIdentificada, CasoMencionPersona } from './tiposIA'

const STOPWORDS_NOMBRES = new Set([
  'me', 'te', 'se', 'nos', 'os', 'le', 'les', 'lo', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'el', 'ella', 'ellos', 'ellas', 'yo', 'tu', 'tú', 'de', 'del', 'al', 'con', 'sin', 'por', 'para',
  'hacia', 'hasta', 'en', 'entre', 'sobre', 'tras', 'muy', 'poco', 'mucho', 'mas', 'más', 'menos',
  'tan', 'tanto', 'tanta', 'acosa', 'acoso', 'acosar', 'acosando', 'acosador', 'acosadora',
  'molesta', 'molesto', 'molestar', 'molestando', 'molestias', 'habla', 'hablar', 'grita', 'gritar',
  'exige', 'exigir', 'trabaja', 'trabajar', 'trabajo', 'dice', 'decir', 'hace', 'hacer', 'mal',
  'malo', 'mala', 'bien', 'bueno', 'buena', 'estudio', 'estudios', 'pregunta', 'bloque', 'empresa',
  'call', 'center', 'lider', 'líder', 'jefe', 'jefa', 'supervisor', 'supervisora', 'coordinador',
  'coordinadora', 'gerente', 'director', 'directora', 'salario', 'sueldo', 'pago', 'horario', 'turno',
  'herramienta', 'equipo', 'computador', 'pc', 'sistema', 'internet', 'cliente', 'campaña', 'operacion',
  'descanso', 'pausa', 'almuerzo', 'compañero', 'compañera', 'persona', 'gente', 'nadie', 'alguien',
  'todos', 'todo', 'nada', 'siempre', 'nunca', 'hoy', 'ayer', 'mañana', 'tarde', 'noche', 'dia', 'día',
  'semana', 'mes', 'año', 'tiempo', 'hora', 'gracias', 'hola', 'favor', 'si', 'sí', 'no', 'favoritismo',
  'rosca', 'injusto', 'pesimo', 'pésimo', 'regular', 'normal', 'parcialmente', 'totalmente', 'veces',
  'ninguna', 'ninguno', 'adecuados', 'adecuado', 'ambiente', 'clima', 'area', 'área', 'puesto', 'cargo',
  'sistemas', 'software', 'data', 'datos', 'abogado', 'derecho', 'administracion', 'contaduria',
  'psicologia', 'industrial', 'mercadeo', 'excelente', 'deficiente', 'aceptable', 'frecuentemente',
  'ocasionalmente', 'operaciones', 'tecnologia', 'gerencia', 'recursos', 'humanos', 'gestion', 'humana',
  'depende', 'renunciando', 'renunciar', 'renuncia', 'pensando', 'buscando', 'trabajando', 'hablando',
  'gritando', 'exigiendo', 'haciendo', 'diciendo', 'pasando', 'saliendo', 'entrando', 'esperando',
  'cuando', 'como', 'cómo', 'donde', 'dónde', 'porque', 'porqué', 'aunque', 'pero', 'sino', 'tengo',
  'tienen', 'tiene', 'estoy', 'esta', 'está', 'estan', 'están', 'somos', 'eres', 'siento', 'sienten',
  'muchas', 'muchos', 'algunas', 'algunos', 'varias', 'varios', 'otras', 'otros', 'otro', 'otra',
  'mismo', 'misma', 'mismos', 'mismas', 'cada', 'cualquier', 'cualquiera', 'falta', 'faltan',
  'problema', 'problemas', 'situacion', 'situación', 'condiciones', 'vacantes', 'salarios', 'planes',
  'claros', 'crecer', 'crecimiento', 'largo', 'plazo', 'corto', 'medio', 'apoyo', 'respeto', 'trato',
  'estres', 'estrés', 'cansancio', 'fatiga', 'carga', 'laboral', 'presión', 'presion', 'metas'
])

const NOMBRES_COMUNES = new Set([
  'omar', 'daniel', 'carlos', 'juan', 'andres', 'andrés', 'camila', 'maria', 'maría', 'laura',
  'valentina', 'santiago', 'sebastian', 'sebastián', 'diego', 'alejandro', 'alejandra', 'paola',
  'carolina', 'julian', 'julián', 'jorge', 'luis', 'pedro', 'roberto', 'javier', 'fernando',
  'ricardo', 'miguel', 'david', 'cristian', 'camilo', 'nicolas', 'nicolás', 'oscar', 'óscar',
  'mauricio', 'sergio', 'ivan', 'iván', 'hector', 'héctor', 'angie', 'natalia', 'diana', 'claudia',
  'patricia', 'sandra', 'monica', 'mónica', 'andrea', 'tatiana', 'karen', 'luisa', 'fernanda',
  'gabriela', 'daniela', 'sofia', 'sofía', 'cata', 'catalina', 'esteban', 'felipe', 'mateo', 'samuel',
  'kevin', 'brayan', 'brian', 'steven', 'stiven', 'jhon', 'john', 'edwin', 'edwar', 'edward', 'wilson',
  'william', 'nelson', 'milton', 'fabian', 'fabián', 'gustavo', 'alvaro', 'álvaro', 'arturo', 'cesar',
  'césar', 'raul', 'raúl', 'hugo', 'manuel', 'antonio', 'francisco', 'jose', 'josé', 'jesus', 'jesús',
  'jaime', 'hernan', 'hernán', 'german', 'germán', 'ruben', 'rubén', 'dario', 'darío', 'leonardo',
  'jairo', 'ramiro', 'victor', 'víctor', 'henry', 'alex', 'alexander', 'jeison', 'yeison',
  'johan', 'johana', 'viviana', 'liliana', 'adriana', 'marcela', 'lina', 'juliana', 'manuela', 'mariana',
  'sara', 'valeria', 'isabella', 'lucia', 'lucía', 'elena', 'marta', 'martha', 'gloria', 'esperanza',
  'rocio', 'rocío', 'consuelo', 'pilar', 'luz', 'alba', 'blanca', 'rosa', 'carmen', 'ana',
  'lorena', 'milena', 'ximena', 'jimena', 'jenny', 'yenny', 'jessica', 'yesica', 'sindy', 'cindy',
  'wendy', 'kelly', 'leidy', 'lady', 'deisy', 'daisy', 'ingrid', 'astrid', 'heidy', 'erika', 'érika',
  'veronica', 'verónica', 'melissa', 'melisa', 'vanessa', 'vanesa', 'stefania', 'estefania', 'estefanía',
  'ginna', 'gina', 'yuli', 'yuly', 'zulma', 'sonia', 'olga', 'nancy', 'nidia', 'nubia', 'mireya', 'mayra',
  'armando', 'ernesto', 'gerardo', 'guillermo', 'humberto', 'ignacio', 'julio', 'lorenzo', 'marcos',
  'mario', 'martin', 'martín', 'nestor', 'néstor', 'orlando', 'pablo', 'rafael', 'ramon', 'ramón',
  'reinaldo', 'rene', 'rené', 'rodolfo', 'rodrigo', 'rolando', 'salvador', 'saul', 'saúl', 'simon',
  'simón', 'tomas', 'tomás', 'ulises', 'vicente', 'walter', 'wilmer', 'yesid', 'yezid', 'alfonso',
  'alfredo', 'alonso', 'amparo', 'angela', 'ángela', 'beatriz', 'bertha', 'cecilia', 'clara', 'constanza',
  'cristina', 'delia', 'dolores', ' (doris)', 'doris', 'edith', 'elsa', 'esther', 'eugenia', 'fabiola',
  'florencia', 'francisca', 'gladys', 'graciela', 'inés', 'ines', 'irene', 'isabel', 'ivonne', 'jacqueline',
  'jazmin', 'jazmín', 'julieta', 'karina', 'laura', 'leticia', 'ligia', 'lilian', 'lina', 'lorena',
  'lourdes', 'magdalena', 'margarita', 'marisol', 'maritza', 'mercedes', 'miriam', 'myriam', 'natalia',
  'nelly', 'noemi', 'noemí', 'norma', 'ofelia', 'paula', 'piedad', 'raquel', 'rebeca', 'rosario',
  'ruth', 'silvia', 'socorro', 'stella', 'susana', 'teresa', 'yolanda', 'yurani', 'yurany', 'ximena'
])

function esNombreValidoPersona(palabra: string): boolean {
  if (!palabra) return false
  const limpio = palabra.toLowerCase().trim().replace(/[^a-záéíóúñ]/g, '')
  if (limpio.length < 3) return false
  if (STOPWORDS_NOMBRES.has(limpio)) return false
  // Rechazar verbos en gerundio (-ando, -iendo, -yendo), infinitivos y participios o sustantivos abstractos
  if (/(?:ando|iendo|yendo|cion|ción|sion|sión|miento|dad|tad|tud|mente)$/.test(limpio)) {
    return false
  }
  return true
}

function normalizarNombre(nom: string): string {
  if (!nom) return ''
  const limpio = nom.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
  if (!esNombreValidoPersona(limpio)) return ''
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase()
}

export function extraerNombresDeTexto(texto: string): string[] {
  if (!texto || texto.trim().length < 3) return []
  const encontrados = new Set<string>()

  // 1. Patrones explícitos de cargo/señalamiento seguidos de un nombre con Mayúscula Inicial (sin flag 'i' en el nombre)
  const patronesCargo = [
    /(?:[Ss]upervisor|[Ss]upervisora|[Ll][íi]der|[Jj]efe|[Jj]efa|[Cc]oordinador|[Cc]oordinadora|[Gg]erente|[Dd]irector|[Dd]irectora|[Dd]on|[Dd]o[ñn]a|[Ss]r\.?|[Ss]ra\.?|[Cc]ompa[ñn]ero|[Cc]ompa[ñn]era)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})/g,
    /(?:se llama|nombre es|llamado|llamada|a cargo de|culpa de|por parte de|menciono a|problema con|queja de|queja contra)\s+([A-ZÁÉÍÓÚÑa-zñáéíóú]{3,})/gi
  ]

  patronesCargo.forEach(patron => {
    let match: RegExpExecArray | null
    patron.lastIndex = 0
    while ((match = patron.exec(texto)) !== null) {
      const candidato = (match[1] || '').trim()
      const low = candidato.toLowerCase()
      if (NOMBRES_COMUNES.has(low) || (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}$/.test(candidato) && esNombreValidoPersona(candidato))) {
        const nom = normalizarNombre(candidato)
        if (nom) encontrados.add(nom)
      }
    }
  })

  // 2. Búsqueda estricta en el diccionario curado de nombres propios de persona (NOMBRES_COMUNES)
  const palabras = texto.split(/[\s,.;:!?()"'/\\-]+/)
  palabras.forEach((p) => {
    const limpio = p.toLowerCase().replace(/[^a-záéíóúñ]/g, '')
    if (NOMBRES_COMUNES.has(limpio) && esNombreValidoPersona(limpio)) {
      const nom = normalizarNombre(limpio)
      if (nom) encontrados.add(nom)
    }
  })

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

export async function detectarPersonasProblemaConIA(respuestasTotales: any[]): Promise<PersonaProblemaIdentificada[]> {
  const mapa = new Map<string, { info: PersonaProblemaIdentificada; idsPersonas: Set<string> }>()

  respuestasTotales.forEach((sesion, sIdx) => {
    const idResp = sesion.idRespuesta || `resp-${sIdx}`
    const dep = sesion.ubicacion?.departamento || sesion.departamento || 'Operaciones'
    const sede = sesion.ubicacion?.sede || 'Sede Principal'
    const fecha = sesion.fecha || 'Hoy'
    const hora = sesion.hora || '12:00 PM'
    const pc = sesion.nombreEquipoPC || 'PC-CORP'

    ;(sesion.respuestas || []).forEach((item: any) => {
      const idP = String(item.idPregunta || '').toLowerCase()
      const txtP = String(item.textoPregunta || '').toLowerCase()
      // Excluir preguntas de qué carrera estudia o antigüedad para no confundir carreras con nombres de problemas
      if (idP.includes('estudi') || idP === 'b1-p1-antiguedad' || idP === 'b1-p2-area' || txtP.includes('programa de estudios')) {
        return
      }

      const textosAInspeccionar: string[] = []
      if (item.comentario && String(item.comentario).trim().length >= 3) {
        textosAInspeccionar.push(String(item.comentario).trim())
      }

      if (item.respuesta && typeof item.respuesta === 'string') {
        const respTrim = item.respuesta.trim()
        const respLow = respTrim.toLowerCase()
        const esPreguntaAbiertaReal =
          item.tipo === 'texto' ||
          item.tipo === 'abierta' ||
          idP.includes('12b') ||
          idP.startsWith('b7-p35') ||
          idP.startsWith('b8-') ||
          txtP.includes('especifique') ||
          txtP.includes('sugerencia') ||
          txtP.includes('comentario') ||
          txtP.includes('cambiarías') ||
          txtP.includes('propuestas')

        if (
          esPreguntaAbiertaReal &&
          respTrim.length >= 3 &&
          !RESPUESTAS_CERRADAS_ESTANDAR.has(respLow) &&
          !respLow.startsWith('no (pase') &&
          !respLow.startsWith('5 -') &&
          !respLow.startsWith('4 -') &&
          !respLow.startsWith('3 -') &&
          !respLow.startsWith('2 -') &&
          !respLow.startsWith('1 -') &&
          !respLow.includes('depende de cómo') &&
          !respLow.includes('depende del momento') &&
          !textosAInspeccionar.includes(respTrim)
        ) {
          textosAInspeccionar.push(respTrim)
        }
      }

      textosAInspeccionar.forEach(txt => {
        const nombres = extraerNombresDeTexto(txt)
        nombres.forEach(nombreNorm => {
          const key = nombreNorm.toLowerCase()
          if (!mapa.has(key)) {
            mapa.set(key, {
              idsPersonas: new Set(),
              info: {
                nombre: nombreNorm,
                cargo: 'Líder / Colaborador Mencionado',
                departamento: dep,
                menciones: 0,
                citas: [],
                nivelRiesgo: 'Alto',
                resumenProblemaIA: '',
                recomendacionIA: 'Activar protocolo de revisión de casos con Comité de Convivencia y RRHH.',
                ultimaFecha: fecha,
                esProblemaCritico: false,
                quejasFrecuentes: [],
                tipoConductaPrincipal: '',
                alertasRelacionadas: [],
                casosDetallados: []
              }
            })
          }

          const entry = mapa.get(key)!
          entry.idsPersonas.add(idResp)

          if (!entry.info.citas.includes(txt)) {
            entry.info.citas.push(txt)
          }

          const { tipoConducta, alertaAsociada } = clasificarConductaMencion(txt)
          if (!entry.info.quejasFrecuentes!.includes(tipoConducta)) entry.info.quejasFrecuentes!.push(tipoConducta)
          if (!entry.info.alertasRelacionadas!.includes(alertaAsociada)) entry.info.alertasRelacionadas!.push(alertaAsociada)

          const caso: CasoMencionPersona = {
            idRespuesta: idResp,
            comentario: txt,
            textoPregunta: item.textoPregunta || 'Comentario reportado en encuesta',
            respuestaSeleccionada: String(item.respuesta || 'Abierta'),
            valor: item.valor,
            fecha,
            hora,
            departamento: dep,
            sede,
            nombreEquipoPC: pc,
            tipoConducta
          }
          if (!entry.info.casosDetallados!.some(c => c.idRespuesta === idResp && c.comentario === txt)) {
            entry.info.casosDetallados!.push(caso)
          }
          entry.info.menciones = Math.max(entry.idsPersonas.size, entry.info.casosDetallados!.length)
        })
      })
    })
  })

  mapa.forEach(({ info }) => {
    const totalComentarios = info.casosDetallados?.length || info.citas.length || info.menciones
    const tieneSexual = info.alertasRelacionadas?.includes('Alerta de Acoso Sexual')
    info.tipoConductaPrincipal = tieneSexual
      ? 'Alerta de Acoso Sexual (Crítico)'
      : (info.quejasFrecuentes?.[0] || 'Molestias y Fastidio Cotidiano ("Se la están montando")')
    info.nivelRiesgo = tieneSexual || totalComentarios >= 3 ? 'Crítico' : 'Alto'
    info.esProblemaCritico = tieneSexual || totalComentarios >= 3

    info.resumenProblemaIA = `${info.nombre} ha salido en ${totalComentarios} ${totalComentarios === 1 ? 'comentario de problema' : 'comentarios de problemas'}. Conductas reportadas: ${info.quejasFrecuentes?.join(' • ')}. Haz clic en el icono del ojo (👁️) para leer todos los comentarios.`
  })

  return Array.from(mapa.values()).map(v => v.info).sort((a, b) => b.menciones - a.menciones)
}
