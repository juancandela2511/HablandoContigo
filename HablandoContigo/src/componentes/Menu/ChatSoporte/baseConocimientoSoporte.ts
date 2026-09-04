/**
 * ============================================================================
 * BASE DE CONOCIMIENTO Y MOTOR DE SOPORTE VIRTUAL (baseConocimientoSoporte.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Motor de análisis de consultas para el Asistente Virtual de HablandoContigo:
 * - Valida estrictamente que las consultas correspondan al canal de soporte técnico de la plataforma.
 * - Si el usuario consulta sobre temas ajenos (chistes, recetas, cultura general, etc.), 
 *   le recuerda con amabilidad: "¡Ey! Este canal es solo de soporte".
 * - Resuelve con precisión cualquier duda sobre encuestas, alertas, auditoría, Supabase, 
 *   geolocalización, cuentas y dashboard.
 */

export interface MensajeChat {
  id: string
  remitente: 'asistente' | 'usuario'
  texto: string
  hora: string
  accionesSugeridas?: string[]
}

export interface RespuestaSoporteProcesada {
  texto: string
  accionesSugeridas?: string[]
}

export const PREGUNTAS_FRECUENTES_SOPORTE = [
  '¿Mis respuestas son 100% anónimas?',
  '¿Cómo crear una encuesta con IA y elegir extensión?',
  '¿Cómo configurar mis propios tipos de alerta?',
  '¿Cómo descartar una falsa alerta en el Dashboard?',
  '¿Cómo eliminar una respuesta individual o purgar estadísticas?'
]

export const MENSAJE_INICIAL_ASISTENTE: MensajeChat = {
  id: 'msg-1',
  remitente: 'asistente',
  texto: '¡Hola! 👋 Soy el Asistente Virtual de Soporte de **HablandoContigo**.\n\nEste canal está dedicado exclusivamente a resolver dudas sobre el funcionamiento de la plataforma, configuración de alertas, encuestas y métricas del clima organizacional. ¿En qué te puedo ayudar hoy?',
  hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  accionesSugeridas: [
    '¿Cómo crear una encuesta con IA?',
    '¿Cómo configurar tipos de alerta?',
    '¿Cómo descartar una falsa alarma?',
    '¿Cómo funciona el anonimato UUID?'
  ]
}

// Lista de palabras clave pertenecientes al ámbito de la plataforma HablandoContigo
const TERMINOS_VALIDOS_SOPORTE = [
  'encuesta', 'encuestas', 'pregunta', 'preguntas', 'opcion', 'opciones', 'clima', 'laboral',
  'dashboard', 'metrica', 'metricas', 'salud', 'enps', 'radar', 'grafico', 'graficos', 'barras',
  'alerta', 'alertas', 'acoso', 'hostigamiento', 'depresion', 'depresión', 'renuncia', 'burnout',
  'aislamiento', 'severidad', 'descartar', 'atendida', 'revision', 'falsa alarma',
  'cuenta', 'cuentas', 'usuario', 'usuarios', 'perfil', 'contraseña', 'contrasena', 'clave', 'foto',
  'avatar', 'drag', 'drop', 'arrastrar', 'rol', 'roles', 'permiso', 'permisos',
  'supabase', 'base de datos', 'tabla', 'datos', 'sincroniz', 'conexion', 'error', 'fallo', 'bug',
  'anonim', 'uuid', 'privacidad', 'confidencial', 'nombre voluntario', 'identificacion',
  'ubicacion', 'ubicación', 'gps', 'mapa', 'coordenadas', 'ip', 'pc', 'computador', 'hostname',
  'auditoria', 'auditoría', 'eliminar', 'purgar', 'vaciar', 'borrar', 'limpiar', 'relleno', 'rapida',
  'exportar', 'informe', 'informes', 'pdf', 'excel', 'reporte', 'reportes', 'what-if', 'simulador',
  'spotlight', 'tema', 'oscuro', 'claro', 'notificacion', 'notificaciones', 'soporte', 'ayuda', 'sistema',
  'proyecto', 'proyectos', 'departamento', 'area', 'audiencia', 'extension', 'crear', 'iniciar'
]

// Patrones claros de temas no relacionados (fuera de soporte)
const PATRONES_FUERA_DE_SOPORTE = [
  'chiste', 'broma', 'cuento', 'poema', 'cancion', 'canción', 'pelicula', 'película',
  'receta', 'cocina', 'comida', 'pizza', 'hamburguesa', 'ingrediente',
  'capital de', 'quien es', 'quién es', 'quien fue', 'quién fue', 'historia de', 'politica', 'política',
  'presidente', 'futbol', 'fútbol', 'partido', 'deporte', 'videojuego', 'juego',
  'clima de hoy', 'va a llover', 'temperatura en', 'noticias', 'farandula', 'musica', 'música',
  'resuelve', 'ecuacion', 'ecuación', 'matematica', 'matemáticas', 'fibonacci', 'codigo para un juego',
  'escribe un poema', 'dime un chiste', 'cuentame un chiste', 'cuéntame un chiste', 'te amo', 'eres real',
  'que opinas de', 'qué opinas de', 'horoscopo', 'horóscopo', 'signo zodiacal'
]

export function procesarRespuestaSoporte(pregunta: string): RespuestaSoporteProcesada {
  const q = pregunta.toLowerCase().trim()

  // 1. Detección de saludos simples
  const esSaludo = /^(hola|buenas|buenos dias|buenos días|buenas tardes|buenas noches|que tal|qué tal|hey|saludos|hello|hi)[!.]*$/i.test(q)
  if (esSaludo) {
    return {
      texto: '¡Hola! 👋 Gusto en saludarte. Este es el canal de **Soporte Técnico de HablandoContigo**.\n\n¿Tienes alguna duda sobre la creación de encuestas, gestión de alertas, métricas del Dashboard o configuración de tu cuenta?',
      accionesSugeridas: [
        '¿Cómo crear una encuesta con IA?',
        '¿Cómo configurar tipos de alerta?',
        '¿Cómo funciona el anonimato UUID?'
      ]
    }
  }

  // 2. Detección explícita de temas fuera de soporte
  const esFueraDeTemaExplicito = PATRONES_FUERA_DE_SOPORTE.some(p => q.includes(p))

  // 3. Verificación de si la consulta menciona términos técnicos o de la plataforma
  const tieneTerminosSoporte = TERMINOS_VALIDOS_SOPORTE.some(t => q.includes(t))

  // 4. SI NO ES DE SOPORTE -> Enviar aviso estricto y amigable
  if (esFueraDeTemaExplicito || (!tieneTerminosSoporte && q.length > 8)) {
    return {
      texto: '⚠️ **¡Ey! Este canal es exclusivamente para soporte técnico.**\n\n' +
        'Soy el Asistente Virtual de **HablandoContigo** y únicamente brindo asistencia sobre el uso del sistema: gestión de encuestas de clima laboral, configuración de alertas, métricas ejecutivas, auditoría de respuestas y soporte de cuentas.\n\n' +
        'Por favor ingresa una consulta relacionada con la plataforma para poder orientarte.',
      accionesSugeridas: [
        '¿Cómo crear una encuesta con IA?',
        '¿Cómo configurar tipos de alerta?',
        '¿Cómo descartar una falsa alarma?',
        '¿Cómo exportar reportes en PDF?'
      ]
    }
  }

  // =========================================================================
  // RESPUESTAS ESPECIALIZADAS DE SOPORTE DE LA PLATAFORMA
  // =========================================================================

  // 1. Tipos de Alerta Personalizados y Descarte
  if (q.includes('tipo') && q.includes('alerta') || q.includes('crear alerta') || q.includes('descartar') || q.includes('falsa alarma') || q.includes('quitar alerta') || q.includes('palabra clave')) {
    return {
      texto: '🚨 **Gestión y Configuración de Tipos de Alerta:**\n\n' +
        '• **Crear tus propias alertas:** En la pestaña **Alertas** (`/dashboard?seccion=alertas`) o en **Auditoría**, pulsa *"Configurar Tipos de Alerta"*. Puedes definir el nombre, severidad, descripción para la IA y palabras clave.\n' +
        '• **Eliminar o quitar alertas:** En la barra de filtros, cada alerta tiene una cruz `(×)` para eliminarla con un solo clic.\n' +
        '• **Descartar falsas alarmas:** Al inspeccionar una alerta, haz clic en **"Descartar Alerta"** para marcarla como desestimada y guardarla en Supabase.',
      accionesSugeridas: ['Ver sección de Alertas', '¿Cómo evaluar respuestas?']
    }
  }

  // 2. Creación de Encuestas con IA y Extensión Libre
  if (q.includes('proyecto') || q.includes('encuesta') || q.includes('crear') || q.includes('prompt') || q.includes('extension') || q.includes('extensa') || q.includes('ia')) {
    return {
      texto: '✨ **Creación de Encuestas y Diagnósticos con IA:**\n\n' +
        'En **Proyectos** (`/proyectos`) puedes pulsar *"Crear Nuevo Proyecto con IA"*:\n' +
        '1. **Audiencia Libre:** Escribe cualquier área, turno o departamento (ej. *"Turno Tarde"*, *"Toda la empresa"*).\n' +
        '2. **Extensión Seleccionable:**\n' +
        '   - ⚡ **Rápida:** 4 a 6 preguntas focalizadas.\n' +
        '   - 📋 **Estándar:** 8 a 10 preguntas integrales.\n' +
        '   - 📚 **Extensa:** 12 a 20 preguntas profundas con preguntas abiertas sobre el sentir diario.\n' +
        '3. **Editor Granular:** Puedes editar enunciados, cambiar valores (1-5 pts) o añadir opciones.',
      accionesSugeridas: ['Ir a Proyectos', '¿Cómo se garantiza el anonimato?']
    }
  }

  // 3. Supabase / Base de Datos
  if (q.includes('supabase') || q.includes('base de datos') || q.includes('tabla') || q.includes('guardar') || q.includes('sincroniz') || q.includes('error')) {
    return {
      texto: '🗄️ **Arquitectura y Persistencia en Supabase:**\n\n' +
        'Toda la información del sistema se guarda directamente en la nube de Supabase (Supabase-First):\n' +
        '• `cuentas_admin`: Administradores, roles, avatares y credenciales.\n' +
        '• `encuestas`: Cuestionarios, preguntas en formato JSONB y contadores.\n' +
        '• `respuestas_anonimas`: Respuestas, coordenadas GPS y trazabilidad por hardware UUID.\n' +
        '• `notificaciones_alertas`: Registro de incidentes y estados de revisión.\n\n' +
        'Si alguna conexión falla, el sistema muestra un toast de error en rojo y previene estados corruptos.',
      accionesSugeridas: ['Ver estado de conexión', '¿Cómo administrar cuentas?']
    }
  }

  // 4. Perfil, Contraseña y Fotos Drag & Drop
  if (q.includes('contraseña') || q.includes('contrasena') || q.includes('clave') || q.includes('perfil') || q.includes('foto') || q.includes('avatar') || q.includes('arrastrar') || q.includes('drag')) {
    return {
      texto: '🔐 **Configuración de Perfil y Fotografía:**\n\n' +
        'En **Configuración** (`/configuracion`) puedes:\n' +
        '• **Subir Foto por Arrastre (Drag & Drop):** Arrastra cualquier imagen (`.png`, `.jpg`, `.webp`) directamente sobre tu avatar para actualizarla en Supabase.\n' +
        '• **Actualizar Datos:** Modifica tu nombre, correo o departamento.\n' +
        '• **Cambio de Contraseña:** Actualiza tu clave de acceso con validación instantánea.',
      accionesSugeridas: ['Ir a Configuración', '¿Cómo administrar roles?']
    }
  }

  // 5. Anonimato y Opción Voluntaria de Nombre
  if (q.includes('anonim') || q.includes('privacidad') || q.includes('confidencial') || q.includes('uuid') || q.includes('nombre voluntario') || q.includes('identificacion')) {
    return {
      texto: '🔒 **Privacidad y Elección de Identificación:**\n\n' +
        '• **Por defecto:** Las encuestas son **100% anónimas** con token criptográfico UUID de hardware para evitar duplicidad sin revelar nombres.\n' +
        '• **Identificación Voluntaria:** En la última pregunta, el colaborador puede marcar opcionalmente la casilla *"Deseo registrar voluntariamente mi nombre o correo"* si requiere seguimiento directo de Bienestar.',
      accionesSugeridas: ['¿Cómo funciona la auditoría?', '¿Cómo ver mapas satelitales?']
    }
  }

  // 6. Ubicación, GPS y Mapa Satelital
  if (q.includes('ubicacion') || q.includes('ubicación') || q.includes('gps') || q.includes('mapa') || q.includes('coordenadas') || q.includes('satelite')) {
    return {
      texto: '📍 **Geolocalización Satelital de Auditoría:**\n\n' +
        'Al enviar una encuesta, el dispositivo obtiene coordenadas GPS de alta precisión con geocodificación inversa (barrio, ciudad, departamento y país).\n' +
        'En **Dashboard > Auditoría**, pulsa el botón **"Mapa"** en cualquier fila para abrir el visor satelital interactivo.',
      accionesSugeridas: ['Ver Auditoría de Respuestas', '¿Cómo eliminar respuestas?']
    }
  }

  // 7. Eliminación de Respuestas y Purga de Estadísticas
  if (q.includes('eliminar') || q.includes('purgar') || q.includes('vaciar') || q.includes('borrar') || q.includes('relleno') || q.includes('velocidad')) {
    return {
      texto: '🗑️ **Eliminación y Depuración de Datos:**\n\n' +
        '• **Eliminar una respuesta:** En la tabla de **Auditoría**, pulsa el icono de papelera en la fila deseada para borrarla de Supabase y recalcular promedios.\n' +
        '• **Purgar todas las estadísticas:** En el encabezado del Dashboard, pulsa el botón del borrador (`Eraser`) para reiniciar las métricas a cero.\n' +
        '• **Respuestas por relleno (<3s):** Se descartan automáticamente de los promedios y se contabilizan como *"Ignoradas por Relleno"*.',
      accionesSugeridas: ['Ir al Dashboard', '¿Cómo exportar reportes?']
    }
  }

  // 8. Métricas del Dashboard, eNPS y Exportar Informes
  if (q.includes('dashboard') || q.includes('enps') || q.includes('salud') || q.includes('radar') || q.includes('exportar') || q.includes('pdf') || q.includes('excel')) {
    return {
      texto: '📊 **Métricas Ejecutivas y Reportes:**\n\n' +
        'El **Dashboard** (`/dashboard`) incluye:\n' +
        '• **Salud de Clima y eNPS Laboral.**\n' +
        '• **Radar 360 y Comparativa de Dimensiones.**\n' +
        '• **Simulador Predictivo What-If.**\n' +
        '• **Botón "Exportar Informe":** Descarga un reporte completo consolidado o por departamento en PDF / Excel.',
      accionesSugeridas: ['Ir al Dashboard', '¿Cómo crear encuestas?']
    }
  }

  // 9. Cuentas de Administradores y Roles
  if (q.includes('cuenta') || q.includes('cuentas') || q.includes('rol') || q.includes('admin') || q.includes('crear usuario')) {
    return {
      texto: '👥 **Gestión de Cuentas y Accesos:**\n\n' +
        'En **Gestión de Cuentas** (`/admin/cuentas`):\n' +
        '• Crea nuevos usuarios asignando roles (**Administrador**, **Gestor de Clima**, **Auditor** o **Supervisor**).\n' +
        '• Edita departamentos, activa/desactiva accesos o elimina cuentas directamente en Supabase.',
      accionesSugeridas: ['Ir a Gestión de Cuentas', '¿Cómo cambiar mi contraseña?']
    }
  }

  // Respuesta general de soporte asistido
  return {
    texto: `💡 **Soporte Técnico HablandoContigo:**\n\n` +
      `Respecto a tu consulta sobre *"**${pregunta}**"*, la plataforma gestiona este proceso en tiempo real sincronizado con Supabase.\n\n` +
      `¿Deseas instrucciones paso a paso sobre cómo configurarlo o navegar a la sección correspondiente?`,
    accionesSugeridas: [
      '¿Cómo crear una encuesta con IA?',
      '¿Cómo configurar tipos de alerta?',
      '¿Cómo exportar informes a PDF?'
    ]
  }
}
