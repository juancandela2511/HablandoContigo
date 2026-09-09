/**
 * ============================================================================
 * ALMACÉN DE TOKENS Y PINS TEMPORALES DE ACCESO (useTokensAcceso.ts)
 * ============================================================================
 * 
 * Permite al Administrador generar Tokens / PINs de acceso temporal con
 * permisos granulares y tiempo de expiración personalizado (15 min, 1h, 8h, etc.).
 * Los usuarios que ingresan con este Token no necesitan correo ni contraseña
 * y quedan restringidos únicamente a las áreas autorizadas por el Administrador.
 */

import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useToast } from '@/Almacenes/useToast'

const { mostrarExito, mostrarError, mostrarAdvertencia } = useToast()

export interface PermisosTokenAcceso {
  proyectos: boolean // Ver proyectos y encuestas
  crearEncuestasRapidas: boolean // Solo crear encuestas rápidas con IA
  editarEncuestaClima: boolean // Editar la encuesta oficial
  dashboard: boolean // Ver métricas y gráficos
  alertas: boolean // Ver alertas psicosociales
  cuentas: boolean // Administrar cuentas
  auditoriaErrores: boolean // Ver auditoría del sistema
  configuracion: boolean // Ver ajustes
}

export type PresetRolToken =
  | 'solo_encuestas_rapidas'
  | 'solo_supervisar'
  | 'solo_dashboard'
  | 'auditor_completo'
  | 'personalizado'

export interface TokenAccesoTemporal {
  id: string
  codigoToken: string // ej. 'TOK-84920' o '749201'
  nombreDestinatario: string // ej. 'Auditor de Encuestas', 'Supervisor Bogotá'
  preset: PresetRolToken
  permisos: PermisosTokenAcceso
  rutaInicial: string // ej. '/proyectos', '/dashboard'
  duracionMinutos: number // Minutos de validez
  creadoEn: string // ISO string
  expiraEn: string // ISO string
  estado: 'Activo' | 'Expirado' | 'Revocado' | 'Usado'
  usosMaximos: number // 0 = ilimitado durante el tiempo, >0 = límite de usos
  usosActuales: number
  creadoPor: string
}

const CLAVE_STORAGE_TOKENS = 'hablandocontigo_tokens_acceso_temporal'

export const PRESETS_TOKENS: Record<PresetRolToken, { nombre: string; descripcion: string; permisos: PermisosTokenAcceso; rutaInicial: string }> = {
  solo_encuestas_rapidas: {
    nombre: 'Solo Crear Encuestas Rápidas (IA)',
    descripcion: 'Permite únicamente diseñar y generar encuestas con IA sin acceso a métricas ni datos de otros colaboradores.',
    rutaInicial: '/proyectos',
    permisos: {
      proyectos: true,
      crearEncuestasRapidas: true,
      editarEncuestaClima: false,
      dashboard: false,
      alertas: false,
      cuentas: false,
      auditoriaErrores: false,
      configuracion: false
    }
  },
  solo_supervisar: {
    nombre: 'Solo Supervisar & Alertas de Clima',
    descripcion: 'Permite auditar las encuestas en modo lectura y monitorear las alertas psicosociales sin permisos de edición.',
    rutaInicial: '/proyectos',
    permisos: {
      proyectos: true,
      crearEncuestasRapidas: false,
      editarEncuestaClima: false,
      dashboard: false,
      alertas: true,
      cuentas: false,
      auditoriaErrores: false,
      configuracion: false
    }
  },
  solo_dashboard: {
    nombre: 'Solo Dashboard & Informes',
    descripcion: 'Permite analizar las métricas consolidadas, gráficos y exportar informes en PDF/Word sin acceso a configuración ni cuentas.',
    rutaInicial: '/dashboard',
    permisos: {
      proyectos: false,
      crearEncuestasRapidas: false,
      editarEncuestaClima: false,
      dashboard: true,
      alertas: true,
      cuentas: false,
      auditoriaErrores: false,
      configuracion: false
    }
  },
  auditor_completo: {
    nombre: 'Auditor Completo Temporal',
    descripcion: 'Acceso a Proyectos, Dashboard, Alertas y Auditoría de Errores con expiración automática de tiempo.',
    rutaInicial: '/dashboard',
    permisos: {
      proyectos: true,
      crearEncuestasRapidas: true,
      editarEncuestaClima: true,
      dashboard: true,
      alertas: true,
      cuentas: false,
      auditoriaErrores: true,
      configuracion: false
    }
  },
  personalizado: {
    nombre: 'Acceso Personalizado a Medida',
    descripcion: 'Selección manual de cada permiso y módulo específico según las necesidades del Administrador.',
    rutaInicial: '/proyectos',
    permisos: {
      proyectos: true,
      crearEncuestasRapidas: true,
      editarEncuestaClima: false,
      dashboard: false,
      alertas: false,
      cuentas: false,
      auditoriaErrores: false,
      configuracion: false
    }
  }
}

function cargarTokensIniciales(): TokenAccesoTemporal[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE_TOKENS)
    if (raw) {
      const items: TokenAccesoTemporal[] = JSON.parse(raw)
      const ahora = new Date().getTime()
      // Actualizar estados expirados
      return items.map(t => {
        const tExp = new Date(t.expiraEn).getTime()
        if (t.estado === 'Activo' && ahora >= tExp) {
          return { ...t, estado: 'Expirado' as const }
        }
        return t
      })
    }
  } catch {}

  // Sembrar un token inicial de demostración
  const expiraDemo = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
  return [
    {
      id: 'tok-demo-01',
      codigoToken: 'TOK-84920',
      nombreDestinatario: 'Operador de Encuestas Rápidas (Demo)',
      preset: 'solo_encuestas_rapidas',
      permisos: { ...PRESETS_TOKENS.solo_encuestas_rapidas.permisos },
      rutaInicial: '/proyectos',
      duracionMinutos: 480,
      creadoEn: new Date().toISOString(),
      expiraEn: expiraDemo,
      estado: 'Activo',
      usosMaximos: 0,
      usosActuales: 0,
      creadoPor: 'Juan Sebastian Candela'
    }
  ]
}

const tokens = ref<TokenAccesoTemporal[]>(cargarTokensIniciales())
const cargandoTokens = ref(false)

function guardarTokensLocal(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CLAVE_STORAGE_TOKENS, JSON.stringify(tokens.value))
  } catch (e) {
    console.warn('[useTokensAcceso] Error al guardar tokens:', e)
  }
}

export function useTokensAcceso() {
  const tokensActivos = computed(() => tokens.value.filter(t => {
    if (t.estado !== 'Activo') return false
    const ahora = new Date().getTime()
    return ahora < new Date(t.expiraEn).getTime()
  }))

  const tokensExpiradosORevocados = computed(() => tokens.value.filter(t => {
    if (t.estado !== 'Activo') return true
    const ahora = new Date().getTime()
    return ahora >= new Date(t.expiraEn).getTime()
  }))

  /**
   * Carga los tokens desde Supabase (o respaldo local)
   */
  const cargarTokensDesdeSupabase = async () => {
    cargandoTokens.value = true
    try {
      const { data, error } = await supabase
        .from('tokens_acceso_temporal')
        .select('*')
        .order('creado_en', { ascending: false })

      if (!error && data && data.length > 0) {
        tokens.value = data.map((item: any) => ({
          id: item.id,
          codigoToken: item.codigo_token,
          nombreDestinatario: item.nombre_destinatario,
          preset: item.preset || 'personalizado',
          permisos: item.permisos || PRESETS_TOKENS.solo_encuestas_rapidas.permisos,
          rutaInicial: item.ruta_inicial || '/proyectos',
          duracionMinutos: item.duracion_minutos || 60,
          creadoEn: item.creado_en,
          expiraEn: item.expira_en,
          estado: item.estado || 'Activo',
          usosMaximos: item.usos_maximos || 0,
          usosActuales: item.usos_actuales || 0,
          creadoPor: item.creado_por || 'Administrador'
        }))
        guardarTokensLocal()
      }
    } catch (e) {
      console.warn('[useTokensAcceso] Aviso consultando Supabase:', e)
    } finally {
      cargandoTokens.value = false
    }
  }

  /**
   * Genera un nuevo Token o PIN de acceso con permisos y duración definida
   */
  const generarTokenAcceso = async (datos: {
    nombreDestinatario: string
    preset: PresetRolToken
    permisos?: Partial<PermisosTokenAcceso>
    duracionMinutos: number
    rutaInicial?: string
    usosMaximos?: number
    creadoPor?: string
  }): Promise<{ ok: boolean; token?: TokenAccesoTemporal; mensaje: string }> => {
    if (!datos.nombreDestinatario.trim()) {
      mostrarError('Faltan datos', 'Por favor ingresa el nombre o motivo del destinatario del token.')
      return { ok: false, mensaje: 'El nombre del destinatario es obligatorio.' }
    }

    const duracion = datos.duracionMinutos > 0 ? datos.duracionMinutos : 60
    const ahora = new Date()
    const expira = new Date(ahora.getTime() + duracion * 60 * 1000)

    // Generar código legible estilo 'TOK-XXXXX' y PIN de 6 dígitos
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    const codigoToken = `TOK-${randomNum}`
    const id = `tok-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`

    const presetConfig = PRESETS_TOKENS[datos.preset] || PRESETS_TOKENS.personalizado
    const permisosFinales: PermisosTokenAcceso = {
      ...presetConfig.permisos,
      ...(datos.permisos || {})
    }

    const nuevoToken: TokenAccesoTemporal = {
      id,
      codigoToken,
      nombreDestinatario: datos.nombreDestinatario.trim(),
      preset: datos.preset,
      permisos: permisosFinales,
      rutaInicial: datos.rutaInicial || presetConfig.rutaInicial || '/proyectos',
      duracionMinutos: duracion,
      creadoEn: ahora.toISOString(),
      expiraEn: expira.toISOString(),
      estado: 'Activo',
      usosMaximos: datos.usosMaximos || 0,
      usosActuales: 0,
      creadoPor: datos.creadoPor || 'Administrador'
    }

    tokens.value.unshift(nuevoToken)
    guardarTokensLocal()

    // Intentar sincronizar con Supabase
    try {
      await supabase.from('tokens_acceso_temporal').insert({
        id: nuevoToken.id,
        codigo_token: nuevoToken.codigoToken,
        nombre_destinatario: nuevoToken.nombreDestinatario,
        preset: nuevoToken.preset,
        permisos: nuevoToken.permisos,
        ruta_inicial: nuevoToken.rutaInicial,
        duracion_minutos: nuevoToken.duracionMinutos,
        creado_en: nuevoToken.creadoEn,
        expira_en: nuevoToken.expiraEn,
        estado: nuevoToken.estado,
        usos_maximos: nuevoToken.usosMaximos,
        usos_actuales: nuevoToken.usosActuales,
        creado_por: nuevoToken.creadoPor
      })
    } catch (errDb) {
      console.warn('[useTokensAcceso] Supabase insert warning:', errDb)
    }

    mostrarExito('Token generado', `Token ${codigoToken} creado exitosamente para "${nuevoToken.nombreDestinatario}".`)
    return { ok: true, token: nuevoToken, mensaje: `Token ${codigoToken} generado con éxito.` }
  }

  /**
   * Valida un Token o PIN ingresado en la pantalla de Login
   */
  const validarYConsumirToken = async (codigoOId: string): Promise<{
    valido: boolean
    mensaje: string
    token?: TokenAccesoTemporal
  }> => {
    const inputLimpio = codigoOId.trim().toUpperCase().replace(/\s+/g, '')

    // Buscar localmente
    let tokenEncontrado = tokens.value.find(t => {
      const cod = t.codigoToken.toUpperCase().replace(/\s+/g, '')
      const numOnly = cod.replace(/[^0-9]/g, '')
      const inputNumOnly = inputLimpio.replace(/[^0-9]/g, '')
      return cod === inputLimpio || (inputNumOnly.length >= 4 && numOnly === inputNumOnly) || t.id === codigoOId
    })

    // Si no está local, buscar en Supabase
    if (!tokenEncontrado) {
      try {
        const { data } = await supabase
          .from('tokens_acceso_temporal')
          .select('*')
          .or(`codigo_token.ilike.%${inputLimpio}%,id.eq.${codigoOId}`)
          .maybeSingle()

        if (data) {
          tokenEncontrado = {
            id: data.id,
            codigoToken: data.codigo_token,
            nombreDestinatario: data.nombre_destinatario,
            preset: data.preset || 'personalizado',
            permisos: data.permisos || PRESETS_TOKENS.solo_encuestas_rapidas.permisos,
            rutaInicial: data.ruta_inicial || '/proyectos',
            duracionMinutos: data.duracion_minutos || 60,
            creadoEn: data.creado_en,
            expiraEn: data.expira_en,
            estado: data.estado || 'Activo',
            usosMaximos: data.usos_maximos || 0,
            usosActuales: data.usos_actuales || 0,
            creadoPor: data.creado_por || 'Administrador'
          }
        }
      } catch {}
    }

    if (!tokenEncontrado) {
      return { valido: false, mensaje: 'El Token o PIN ingresado no existe o no es válido.' }
    }

    if (tokenEncontrado.estado === 'Revocado') {
      return { valido: false, mensaje: 'Este Token de acceso fue revocado por el Administrador.' }
    }

    const ahora = new Date().getTime()
    const expiraMs = new Date(tokenEncontrado.expiraEn).getTime()

    if (ahora >= expiraMs || tokenEncontrado.estado === 'Expirado') {
      tokenEncontrado.estado = 'Expirado'
      guardarTokensLocal()
      return { valido: false, mensaje: 'El Token de acceso ha expirado según el tiempo configurado por el Administrador.' }
    }

    // Incrementar uso
    tokenEncontrado.usosActuales += 1
    if (tokenEncontrado.usosMaximos > 0 && tokenEncontrado.usosActuales >= tokenEncontrado.usosMaximos) {
      tokenEncontrado.estado = 'Usado'
    }
    guardarTokensLocal()

    try {
      await supabase
        .from('tokens_acceso_temporal')
        .update({
          usos_actuales: tokenEncontrado.usosActuales,
          estado: tokenEncontrado.estado
        })
        .eq('id', tokenEncontrado.id)
    } catch {}

    return {
      valido: true,
      mensaje: `Acceso temporal concedido para "${tokenEncontrado.nombreDestinatario}".`,
      token: tokenEncontrado
    }
  }

  /**
   * Revoca un token activo de inmediato
   */
  const revocarToken = async (id: string) => {
    const t = tokens.value.find(item => item.id === id)
    if (t) {
      t.estado = 'Revocado'
      guardarTokensLocal()
      try {
        await supabase
          .from('tokens_acceso_temporal')
          .update({ estado: 'Revocado' })
          .eq('id', id)
      } catch {}
      mostrarAdvertencia('Token revocado', `El token ${t.codigoToken} fue revocado y ya no permitirá accesos.`)
    }
  }

  /**
   * Elimina un token del registro
   */
  const eliminarToken = async (id: string) => {
    const idx = tokens.value.findIndex(item => item.id === id)
    if (idx !== -1) {
      tokens.value.splice(idx, 1)
      guardarTokensLocal()
      try {
        await supabase
          .from('tokens_acceso_temporal')
          .delete()
          .eq('id', id)
      } catch {}
      mostrarExito('Token eliminado', 'El registro del token fue eliminado.')
    }
  }

  /**
   * Calcula el tiempo restante legible para un token
   */
  const calcularTiempoRestante = (expiraEn: string): { texto: string; expirado: boolean; minutosRestantes: number } => {
    const ahora = Date.now()
    const exp = new Date(expiraEn).getTime()
    const difMs = exp - ahora

    if (difMs <= 0) {
      return { texto: 'Expirado', expirado: true, minutosRestantes: 0 }
    }

    const minTotales = Math.floor(difMs / (60 * 1000))
    const horas = Math.floor(minTotales / 60)
    const mins = minTotales % 60

    if (horas > 24) {
      const dias = Math.floor(horas / 24)
      return { texto: `${dias}d ${horas % 24}h restantes`, expirado: false, minutosRestantes: minTotales }
    }
    if (horas > 0) {
      return { texto: `${horas}h ${mins}m restantes`, expirado: false, minutosRestantes: minTotales }
    }
    return { texto: `${mins} min restantes`, expirado: false, minutosRestantes: minTotales }
  }

  return {
    tokens,
    tokensActivos,
    tokensExpiradosORevocados,
    cargandoTokens,
    cargarTokensDesdeSupabase,
    generarTokenAcceso,
    validarYConsumirToken,
    revocarToken,
    eliminarToken,
    calcularTiempoRestante
  }
}
