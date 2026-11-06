/**
 * ============================================================================
 * SERVICIO DE INYECCIÓN DE DATOS DE PRUEBA (servicioDatosPrueba.ts)
 * ============================================================================
 * Permite simular respuestas para pruebas y calibración analítica de la plataforma.
 */

import { type Ref } from 'vue'
import type { Encuesta, RegistroRespuesta, RespuestaItem } from './tiposEncuestas'
import { persistirEncuestasEnLocalStorage, persistirRespuestasEnLocalStorage } from './persistenciaEncuestas'
import { registrarNuevaRespuestaAnonima } from './servicioRespuestas'

export async function inyectarRespuestasDePrueba(
  cantidad: number = 10,
  encuestasRef: Ref<Encuesta[]>,
  respuestasRef: Ref<RegistroRespuesta[]>,
  idEncuestaTarget?: string
): Promise<boolean> {
  const targetEnc = idEncuestaTarget
    ? encuestasRef.value.find(e => e.id === idEncuestaTarget)
    : encuestasRef.value.find(e => e.id === 'enc-001') || encuestasRef.value[0]

  if (!targetEnc) return false

  const estudiosEjemplo = [
    'Ingeniería en Data y Analítica',
    'ADSO - Análisis y Desarrollo de Software',
    'Ciencia de Datos y Big Data',
    'Ingeniería de Sistemas',
    'Administración de Empresas',
    'Psicología Organizacional',
    'Contaduría Pública y Finanzas',
    'Mercadeo y Publicidad Digital'
  ]
  const comentariosAbiertosEjemplo = [
    'El supervisor se enfoca en presión constante frente al equipo, y además el salario no compensa tanta carga laboral.',
    'Recibimos órdenes contradictorias de varios jefes sin claridad en el rol asignado.',
    'Excelente ambiente entre compañeros pero se requiere mayor capacitación e inducción clara.',
    'Me siento con sobrecarga y metas difíciles de cumplir; se requiere mayor equilibrio.',
    'Los equipos de cómputo son lentos pero la comunicación en la sede es positiva y colaborativa.'
  ]

  for (let i = 0; i < cantidad; i++) {
    const itemsGenerados: RespuestaItem[] = []
    const preguntasBase = targetEnc.preguntas || []

    preguntasBase.forEach((p, index) => {
      const esAbierta = p.tipo === 'texto' || !p.opciones || p.opciones.length === 0
      let respTexto = ''
      let valor = index % 3 === 0 ? 5 : index % 3 === 1 ? 4 : 3
      let esAlerta = false

      if (!esAbierta && p.opciones && p.opciones.length > 0) {
        const opcSelec = p.opciones[(i + index) % p.opciones.length]
        if (opcSelec) {
          respTexto = opcSelec.texto
          valor = typeof opcSelec.valor === 'number' ? opcSelec.valor : valor
          esAlerta = Boolean(opcSelec.esAlerta)
        }
      } else {
        const txtPreg = (p.texto || '').toLowerCase()
        if (p.id === 'b6-p33b-que-estudia' || txtPreg.includes('estudi') || txtPreg.includes('carrera')) {
          respTexto = estudiosEjemplo[i % estudiosEjemplo.length] || 'Ingeniería en Data'
        } else {
          respTexto = comentariosAbiertosEjemplo[(i + index) % comentariosAbiertosEjemplo.length] || ''
        }
      }

      const esEstudio = p.id === 'b6-p33b-que-estudia' || (p.texto || '').toLowerCase().includes('especifica qué estudias')
      itemsGenerados.push({
        idPregunta: p.id,
        textoPregunta: p.texto || `Pregunta ${index + 1}`,
        categoria: p.categoria || 'General',
        respuesta: respTexto,
        valor: esAbierta ? undefined : valor,
        esAlerta,
        comentario: (esAbierta && !esEstudio) ? respTexto : ''
      })
    })

    const puntajeGeneral = Number((itemsGenerados.reduce((sum, item) => sum + (typeof item.valor === 'number' ? item.valor : 0), 0) / Math.max(1, itemsGenerados.length)).toFixed(1))

    respuestasRef.value.unshift({
      idRespuesta: `resp-test-${Date.now()}-${i}`,
      idEncuesta: targetEnc.id,
      tituloEncuesta: targetEnc.titulo,
      dispositivoUUID: `test-uuid-${Math.random().toString(36).substring(2, 8)}`,
      nombreEquipoPC: 'PC-TEST',
      cuentaUsuarioPC: 'usuario.local',
      ubicacion: {
        ciudad: 'Bogotá',
        pais: 'Colombia',
        sede: 'Sede Principal',
        lat: 4.6534,
        lng: -74.0836,
        ipAprox: '190.157.34.112'
      },
      fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      timestampISO: new Date().toISOString(),
      respuestas: itemsGenerados,
      alertasDetectadas: itemsGenerados.some(item => item.esAlerta) ? ['Alerta de prueba'] : [],
      categoriasAlerta: itemsGenerados.some(item => item.esAlerta) ? ['burnout'] : [],
      puntajeGeneral
    })
  }

  targetEnc.totalRespuestas = (targetEnc.totalRespuestas || 0) + cantidad
  targetEnc.puntajePromedio = Number((respuestasRef.value.reduce((sum, r) => sum + (r.puntajeGeneral || 0), 0) / Math.max(1, respuestasRef.value.length)).toFixed(1))

  persistirRespuestasEnLocalStorage(respuestasRef.value)
  persistirEncuestasEnLocalStorage(encuestasRef.value)
  return true
}

export async function inyectarUnaRespuestaPersonalizada(
  datos: {
    idEncuesta: string
    idPregunta: string
    textoPregunta: string
    categoria: string
    respuestaTexto: string
    valorNumerico: number
    esAlerta: boolean
    tipoAlertaId?: string
    nombreAlerta?: string
    severidadAlerta?: string
    comentario?: string
  },
  encuestasRef: Ref<Encuesta[]>,
  respuestasRef: Ref<RegistroRespuesta[]>
): Promise<boolean> {
  const item: RespuestaItem = {
    idPregunta: datos.idPregunta,
    textoPregunta: datos.textoPregunta,
    categoria: datos.categoria,
    respuesta: datos.respuestaTexto,
    valor: datos.valorNumerico,
    esAlerta: datos.esAlerta,
    tipoAlertaId: datos.tipoAlertaId,
    nombreAlerta: datos.nombreAlerta,
    severidadAlerta: datos.severidadAlerta,
    comentario: datos.comentario
  }

  const res = await registrarNuevaRespuestaAnonima(
    datos.idEncuesta,
    [item],
    encuestasRef,
    respuestasRef,
    undefined,
    30,
    'admin.test'
  )

  return Boolean(res)
}
