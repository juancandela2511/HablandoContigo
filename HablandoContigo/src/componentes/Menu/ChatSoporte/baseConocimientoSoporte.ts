/**
 * ============================================================================
 * BASE DE CONOCIMIENTO DEL ASISTENTE VIRTUAL DE SOPORTE (baseConocimientoSoporte.ts)
 * ============================================================================
 */

export interface MensajeChat {
  id: string
  remitente: 'asistente' | 'usuario'
  texto: string
  hora: string
  accionesSugeridas?: string[]
}

export const PREGUNTAS_FRECUENTES_SOPORTE = [
  '¿Mis respuestas son 100% anónimas?',
  '¿Cómo funciona la detección de acoso laboral?',
  '¿Qué significan el eNPS y el Radar 360?',
  '¿Cómo administrar roles y cuentas de equipo?',
  '¿Cómo usar el buscador Spotlight (⌘K)?'
]

export const MENSAJE_INICIAL_ASISTENTE: MensajeChat = {
  id: 'msg-1',
  remitente: 'asistente',
  texto: '¡Hola! 👋 Soy el Asistente Virtual de HablandoContigo. ¿Tienes alguna pregunta sobre el funcionamiento del sistema, la privacidad de las encuestas o las métricas del Dashboard?',
  hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  accionesSugeridas: [
    '¿Cómo se garantiza el anonimato?',
    '¿Cómo crear una encuesta con IA?',
    '¿Qué hacer ante una alerta de acoso?',
    '¿Cómo exportar informes a PDF o Excel?'
  ]
}

export function procesarRespuestaSoporte(pregunta: string): string {
  const q = pregunta.toLowerCase().trim()

  // 1. Supabase / Base de Datos
  if (q.includes('supabase') || q.includes('base de datos') || q.includes('tabla') || q.includes('credencial') || q.includes('postgres') || q.includes('guardar datos')) {
    return '🗄️ **Conexión con Supabase:**\n' +
      'El sistema está conectado directamente al backend de **Supabase**:\n' +
      '- **Cuentas de usuario:** Se sincronizan en la tabla `cuentas_admin`.\n' +
      '- **Encuestas y campañas:** Se persisten en la tabla `encuestas`.\n' +
      '- **Respuestas y auditoría:** Se registran en `respuestas_anonimas` con coordenadas GPS y nombre de equipo.\n' +
      '- **Alertas psicosociales:** Se almacenan en `notificaciones_alertas`.\n' +
      'Cualquier cambio de perfil, foto o contraseña se actualiza en tiempo real en la nube.'
  }

  // 2. Perfil y Contraseña
  if (q.includes('contraseña') || q.includes('contrasena') || q.includes('clave') || q.includes('password') || q.includes('actualizar') || q.includes('perfil') || q.includes('foto') || q.includes('desactivar')) {
    return '🔐 **Actualización de Perfil y Contraseña:**\n' +
      'Puedes gestionar tus datos en **Configuración** (`/configuracion`):\n' +
      '1. **Perfil & Fotografía:** Actualiza tu nombre, departamento, biografía y sube una foto que se guardará de inmediato en Supabase.\n' +
      '2. **Cambio de Contraseña:** Ingresa tu nueva clave para persistirla de forma segura en la base de datos.\n' +
      '3. **Desactivar Cuenta:** Si decides suspender tu acceso, la cuenta pasará a estado inactivo en Supabase.'
  }

  // 3. Creación con IA
  if (q.includes('proyecto') || q.includes('encuesta') || q.includes('crear') || q.includes('tema') || q.includes('ia') || q.includes('generar') || q.includes('prompt')) {
    return '✨ **Generador de Proyectos y Encuestas con IA:**\n' +
      'El motor de IA analiza el **tema específico** que ingreses en el prompt para generar preguntas contextuales:\n' +
      '- **Salud Mental / Depresión:** Preguntas sobre energía vital, contención y desánimo.\n' +
      '- **Riesgo de Renuncia:** Evaluación de proyección, plan de carrera y permanencia.\n' +
      '- **Teletrabajo / Desconexión:** Horarios, ergonomía y herramientas digitales.\n' +
      'Para probarlo, ve a **Proyectos** (`/proyectos`) y pulsa *"Crear Proyecto con IA"*.'
  }

  // 4. Ubicación y GPS
  if (q.includes('ubicacion') || q.includes('ubicación') || q.includes('mapa') || q.includes('gps') || q.includes('geolocaliz') || q.includes('pc') || q.includes('computador')) {
    return '📍 **Geolocalización Exacta y Trazabilidad:**\n' +
      'Al enviar una encuesta, el sistema captura las coordenadas GPS reales del navegador de alta precisión.\n' +
      'En el **Dashboard > Auditoría UUIDs**, puedes pulsar **"Ver Mapa"** para abrir el visor satelital interactivo. Si la encuesta tiene alertas, el sistema revelará el Hostname del computador para auxilio psicosocial.'
  }

  // 5. Alertas
  if (q.includes('alerta') || q.includes('acoso') || q.includes('depresion') || q.includes('depresión') || q.includes('renuncia') || q.includes('social') || q.includes('burnout')) {
    return '🚨 **Taxonomía Integral de Alertas Psicosociales:**\n' +
      'El sistema detecta automáticamente 5 categorías de riesgo en el clima laboral:\n' +
      '1. 🚨 **Acoso & Hostigamiento:** Trato hostil o intimidación.\n' +
      '2. 🧠 **Salud Mental & Depresión:** Desánimo severo y vacío emocional.\n' +
      '3. 🚪 **Riesgo Inminente de Renuncia:** Fuga de talento a corto plazo.\n' +
      '4. 👥 **Aislamiento Social:** Exclusión deliberada o bandos tóxicos.\n' +
      '5. ⚖️ **Sobrecarga / Burnout:** Agotamiento y jornadas excesivas.\n' +
      'Cada alerta incluye su protocolo de acción recomendado por IA.'
  }

  // 6. Anonimato
  if (q.includes('anonim') || q.includes('privacidad') || q.includes('confidencial') || q.includes('uuid')) {
    return '🔒 **Anonimato Criptográfico por UUID:**\n' +
      'Las encuestas no solicitan nombres ni correos personales. Se identifica la sesión mediante una huella UUID de hardware para evitar respuestas duplicadas, protegiendo 100% la confidencialidad del colaborador.'
  }

  // 7. Métricas y Dashboard
  if (q.includes('dashboard') || q.includes('metrica') || q.includes('enps') || q.includes('radar') || q.includes('exportar') || q.includes('pdf')) {
    return '📊 **Métricas y Exportación:**\n' +
      'En el Dashboard puedes consultar el **Índice de Salud Global**, el **eNPS**, el **Radar de Dimensiones** y la **Matriz de Riesgo** por área. Además, puedes exportar informes ejecutivos completos en PDF o Excel.'
  }

  return `💡 **Respuesta a tu consulta:** "${pregunta}"\n\n` +
    'En HablandoContigo todos los módulos operan de forma sincronizada y en tiempo real.\n\n' +
    '¿Deseas orientación sobre cómo configurar alguna sección o realizar una prueba?'
}
