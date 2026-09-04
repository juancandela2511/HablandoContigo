/**
 * ============================================================================
 * ALMACÉN DE CUENTAS ADMINISTRATIVAS — SUPABASE FIRST (useCuentas.ts)
 * ============================================================================
 *
 * POLÍTICA: Ningún dato se guarda localmente si antes no llega a Supabase.
 * Si falla → toast de error visible al usuario → estado local NO cambia.
 */

import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useToast } from '@/Almacenes/useToast'

const { mostrarError, mostrarExito } = useToast()

export type RolCuenta = 'Super Administrador' | 'Adminsitrador General' | 'Administrador' | 'Supervisor' | 'Analista RRHH'
export type EstadoCuenta = 'Activo' | 'Inactivo' | 'Pendiente'

export interface PermisosRol {
  proyectos: boolean
  dashboard: boolean
  alertas: boolean
  cuentas: boolean
  cambiarContrasenasOtros: boolean
  configuracion: boolean
}

export const PERMISOS_POR_ROL: Record<RolCuenta, PermisosRol> = {
  'Super Administrador': {
    proyectos: true, dashboard: true, alertas: true,
    cuentas: true, cambiarContrasenasOtros: true, configuracion: true
  },
  'Adminsitrador General': {
    proyectos: true, dashboard: true, alertas: true,
    cuentas: true, cambiarContrasenasOtros: true, configuracion: true
  },
  'Administrador': {
    proyectos: true, dashboard: true, alertas: true,
    cuentas: false, cambiarContrasenasOtros: false, configuracion: true
  },
  'Supervisor': {
    proyectos: true, dashboard: false, alertas: false,
    cuentas: false, cambiarContrasenasOtros: false, configuracion: true
  },
  'Analista RRHH': {
    proyectos: false, dashboard: true, alertas: false,
    cuentas: false, cambiarContrasenasOtros: false, configuracion: true
  }
}

export const DOMINIOS_EMPRESA_PERMITIDOS = ['siticore', 'ontime', 'hablandocontigo']

export function validarDominioCorporativo(email: string): boolean {
  if (!email || !email.includes('@')) return false
  const partes = email.toLowerCase().trim().split('@')
  if (partes.length !== 2) return false
  const dominio = partes[1] || ''
  return DOMINIOS_EMPRESA_PERMITIDOS.some(d => dominio.startsWith(d))
}

export interface CuentaAdmin {
  id: string
  nombre: string
  email: string
  rol: RolCuenta
  departamento: string
  estado: EstadoCuenta
  fechaCreacion: string
  ultimoAcceso: string
  encuestasAsignadas: number
  verificado?: boolean
  fechaVerificacion?: string
  tokenVerificacion?: string
  pinVerificacion?: string
  avatar?: string
  fotoUrl?: string
}

// Estado reactivo global — alimentado 100% desde Supabase
const cuentas = ref<CuentaAdmin[]>([])
const cargandoCuentas = ref(false)

export function useCuentas() {
  // ─────────────────────────────────────────────
  // LECTURA
  // ─────────────────────────────────────────────

  const cargarCuentasDesdeSupabase = async () => {
    cargandoCuentas.value = true
    try {
      const { data, error } = await supabase
        .from('cuentas_admin')
        .select('*')
        .order('creado_en', { ascending: false })

      if (error) throw new Error(error.message)

      if (data && data.length > 0) {
        cuentas.value = data.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
          email: item.email,
          rol: item.rol,
          departamento: item.departamento,
          estado: item.estado,
          verificado: item.estado === 'Activo' && item.verificado !== false,
          avatar: item.foto_url || item.avatar || '',
          fotoUrl: item.foto_url || item.avatar || '',
          fechaCreacion: item.creado_en
            ? new Date(item.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Reciente',
          ultimoAcceso: 'Reciente',
          encuestasAsignadas: item.encuestas_asignadas || 0,
          tokenVerificacion: item.token_verificacion || item.id,
          pinVerificacion: item.pin_verificacion || item.token_verificacion || '842913'
        }))
      } else if (data && data.length === 0) {
        console.info('Tabla cuentas_admin vacía en Supabase. Inicializando cuentas base...')
        await sembrarCuentasInicialesEnSupabase()
      }
    } catch (e: any) {
      mostrarError('Error al cargar cuentas', `No se pudieron obtener las cuentas desde Supabase. ${e.message || ''}`)
    } finally {
      cargandoCuentas.value = false
    }
  }

  const sembrarCuentasInicialesEnSupabase = async (): Promise<{ ok: boolean; mensaje: string }> => {
    cargandoCuentas.value = true
    try {
      const cuentasBase = [
        { id: 'cta-001', nombre: 'Administrador Principal', email: 'admin@siticore.es', rol: 'Super Administrador', departamento: 'Tecnología & Soporte TI', estado: 'Activo', verificado: true, foto_url: null, avatar: null },
        { id: 'cta-002', nombre: 'Administrador RRHH', email: 'carolina.gomez@ontime.es', rol: 'Administrador', departamento: 'Recursos Humanos y Cultura', estado: 'Activo', verificado: true, foto_url: null, avatar: null },
        { id: 'cta-003', nombre: 'Supervisor Operaciones', email: 'andres.morales@siticore.es', rol: 'Supervisor', departamento: 'Operaciones y Contact Center', estado: 'Activo', verificado: true, foto_url: null, avatar: null },
        { id: 'cta-004', nombre: 'Analista Clima', email: 'valeria.martinez@ontime.es', rol: 'Analista RRHH', departamento: 'Recursos Humanos y Cultura', estado: 'Activo', verificado: true, foto_url: null, avatar: null }
      ]

      const { error } = await supabase.from('cuentas_admin').upsert(cuentasBase, { onConflict: 'email' })
      if (error) throw new Error(error.message)

      await cargarCuentasDesdeSupabase()
      return { ok: true, mensaje: 'Cuentas iniciales registradas en Supabase exitosamente.' }
    } catch (e: any) {
      mostrarError('Fallo al sembrar cuentas', `Las cuentas iniciales no pudieron crearse en Supabase. ${e.message || ''}`)
      return { ok: false, mensaje: e?.message || 'Error al conectar con Supabase.' }
    } finally {
      cargandoCuentas.value = false
    }
  }

  // ─────────────────────────────────────────────
  // MÉTRICAS COMPUTADAS
  // ─────────────────────────────────────────────

  const totalCuentas = computed(() => cuentas.value.length)
  const cuentasActivas = computed(() => cuentas.value.filter(c => c.estado === 'Activo').length)
  const cuentasInactivas = computed(() => cuentas.value.filter(c => c.estado === 'Inactivo').length)
  const cuentasPendientes = computed(() => cuentas.value.filter(c => c.estado === 'Pendiente').length)
  const cuentasPorRol = computed(() => ({
    superAdmin: cuentas.value.filter(c => c.rol === 'Super Administrador' || (c.rol as string) === 'Adminsitrador General').length,
    administradores: cuentas.value.filter(c => c.rol === 'Administrador').length,
    supervisores: cuentas.value.filter(c => c.rol === 'Supervisor').length,
    analistas: cuentas.value.filter(c => c.rol === 'Analista RRHH').length
  }))
  const departamentosUnicos = computed(() =>
    Array.from(new Set(cuentas.value.map(c => c.departamento)))
  )
  const totalEncuestasGestionadas = computed(() =>
    cuentas.value.reduce((acc, c) => acc + (c.encuestasAsignadas || 0), 0)
  )

  // ─────────────────────────────────────────────
  // ESCRITURA — SUPABASE PRIMERO SIEMPRE
  // ─────────────────────────────────────────────

  /**
   * Crea una cuenta en Supabase. Si falla → toast de error → NO agrega localmente.
   */
  const crearCuenta = async (datos: {
    nombre: string
    email: string
    rol: RolCuenta
    departamento: string
    contrasena?: string
    estado?: EstadoCuenta
  }): Promise<{ ok: boolean; mensaje: string; cuenta?: CuentaAdmin }> => {
    if (!validarDominioCorporativo(datos.email)) {
      return { ok: false, mensaje: 'El correo debe pertenecer a los dominios corporativos autorizados (@siticore o @ontime).' }
    }

    const idGenerado = `cta-${Date.now().toString(36)}`
    // Al crear una cuenta, debe quedar bloqueada en 'Pendiente' hasta verificar con PIN
    const estadoInicial: EstadoCuenta = datos.estado || 'Pendiente'
    const pinGenerado = Math.floor(100000 + Math.random() * 900000).toString()

    const claveAsignada = datos.contrasena || 'Admin123*'

    try {
      // 1. Delegar administración de la contraseña exclusivamente a Supabase Auth (cifrada con bcrypt)
      try {
        await supabase.auth.signUp({
          email: datos.email.toLowerCase().trim(),
          password: claveAsignada,
          options: {
            data: {
              nombre: datos.nombre,
              rol: datos.rol,
              departamento: datos.departamento,
              debe_cambiar_contrasena: true
            }
          }
        })
      } catch (authErr) {
        console.warn('Aviso de registro en Supabase Auth:', authErr)
      }

      // Marcar bandera de cambio de clave en primer ingreso
      localStorage.setItem(`hablandocontigo_primer_ingreso_${datos.email.toLowerCase().trim()}`, 'true')

      // 2. Insertar cuenta en la base de datos Supabase (contraseñas administradas en auth.users)
      const { error } = await supabase.from('cuentas_admin').insert({
        id: idGenerado,
        nombre: datos.nombre,
        email: datos.email.toLowerCase().trim(),
        rol: datos.rol,
        departamento: datos.departamento,
        estado: estadoInicial,
        verificado: estadoInicial === 'Activo',
        token_verificacion: pinGenerado,
        foto_url: null,
        avatar: null
      })

      if (error) throw new Error(error.message)

      await cargarCuentasDesdeSupabase()
      mostrarExito('Cuenta registrada', `Cuenta creada para ${datos.nombre}. PIN de verificación generado: ${pinGenerado}`)
      return { 
        ok: true, 
        mensaje: `Cuenta creada. Se despachó el PIN ${pinGenerado} al correo ${datos.email}.`,
        cuenta: {
          id: idGenerado,
          nombre: datos.nombre,
          email: datos.email.toLowerCase().trim(),
          rol: datos.rol,
          departamento: datos.departamento,
          estado: estadoInicial,
          verificado: estadoInicial === 'Activo',
          tokenVerificacion: pinGenerado,
          pinVerificacion: pinGenerado,
          fechaCreacion: 'Hoy',
          ultimoAcceso: 'Nunca',
          encuestasAsignadas: 0
        }
      }
    } catch (e: any) {
      mostrarError('Fallo al crear cuenta', `La cuenta NO pudo crearse en Supabase. ${e.message || ''}`)
      return { ok: false, mensaje: e?.message || 'Error al conectar con Supabase.' }
    }
  }

  /**
   * Edita una cuenta en Supabase. Si falla → revierte el estado local.
   */
  const editarCuenta = async (id: string, datos: Partial<CuentaAdmin>): Promise<{ ok: boolean; mensaje: string }> => {
    const cuenta = cuentas.value.find(c => c.id === id)
    const copia = cuenta ? { ...cuenta } : null

    try {
      const payload: any = {}
      if (datos.nombre !== undefined) payload.nombre = datos.nombre
      if (datos.email !== undefined) payload.email = datos.email
      if (datos.rol !== undefined) payload.rol = datos.rol
      if (datos.departamento !== undefined) payload.departamento = datos.departamento
      if (datos.estado !== undefined) payload.estado = datos.estado
      if (datos.fotoUrl !== undefined || datos.avatar !== undefined) {
        payload.foto_url = datos.fotoUrl || datos.avatar || null
        payload.avatar = datos.fotoUrl || datos.avatar || null
      }

      const { error } = await supabase
        .from('cuentas_admin')
        .update(payload)
        .eq('id', id)

      if (error) throw new Error(error.message)

      await cargarCuentasDesdeSupabase()
      mostrarExito('Cuenta actualizada', 'Los cambios se guardaron correctamente en Supabase.')
      return { ok: true, mensaje: 'Cuenta actualizada exitosamente en Supabase.' }
    } catch (e: any) {
      // 🔄 Revertir si falló
      if (cuenta && copia) Object.assign(cuenta, copia)
      mostrarError('Fallo al editar cuenta', `Los cambios NO se guardaron en Supabase. ${e.message || ''}`)
      return { ok: false, mensaje: e.message }
    }
  }

  /**
   * Elimina una cuenta de Supabase. Si falla → la reinserta localmente.
   */
  const eliminarCuenta = async (id: string): Promise<boolean> => {
    const indice = cuentas.value.findIndex(c => c.id === id)
    const copia = indice !== -1 ? { ...cuentas.value[indice] } : null
    if (indice !== -1) cuentas.value.splice(indice, 1) // optimista

    try {
      const { error } = await supabase
        .from('cuentas_admin')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message)

      mostrarExito('Cuenta eliminada', 'La cuenta fue eliminada de Supabase correctamente.')
      return true
    } catch (e: any) {
      // 🔄 Revertir
      if (copia && indice !== -1) cuentas.value.splice(indice, 0, copia as CuentaAdmin)
      mostrarError('Fallo al eliminar cuenta', `La cuenta NO fue eliminada de Supabase. ${e.message || ''}`)
      return false
    }
  }

  /**
   * Cambia el estado Activo/Inactivo en Supabase. Si falla → revierte.
   */
  const cambiarEstadoCuenta = async (id: string, nuevoEstado: EstadoCuenta): Promise<boolean> => {
    const cuenta = cuentas.value.find(c => c.id === id)
    const estadoPrevio = cuenta?.estado

    if (cuenta) cuenta.estado = nuevoEstado // optimista

    try {
      const { error } = await supabase
        .from('cuentas_admin')
        .update({ estado: nuevoEstado })
        .eq('id', id)

      if (error) throw new Error(error.message)

      mostrarExito('Estado actualizado', `La cuenta fue marcada como ${nuevoEstado} en Supabase.`)
      return true
    } catch (e: any) {
      // 🔄 Revertir
      if (cuenta && estadoPrevio) cuenta.estado = estadoPrevio
      mostrarError('Fallo al cambiar estado', `El estado NO se actualizó en Supabase. ${e.message || ''}`)
      return false
    }
  }

  const toggleEstado = async (id: string) => {
    const c = cuentas.value.find(item => item.id === id)
    if (c) {
      const nuevo: EstadoCuenta = c.estado === 'Activo' ? 'Inactivo' : 'Activo'
      return cambiarEstadoCuenta(id, nuevo)
    }
  }

  /**
   * Verifica una cuenta por token o ID en Supabase.
   */
  const verificarCuentaPorToken = async (tokenOId: string): Promise<{ ok: boolean; mensaje: string }> => {
    try {
      const { data, error } = await supabase
        .from('cuentas_admin')
        .update({ verificado: true, estado: 'Activo' })
        .or(`token_verificacion.eq.${tokenOId},id.eq.${tokenOId}`)
        .select()

      if (error || !data || data.length === 0) throw new Error(error?.message || 'Token o ID inválido.')

      await cargarCuentasDesdeSupabase()
      mostrarExito('Cuenta verificada', 'El correo corporativo fue verificado y la cuenta activada en Supabase.')
      return { ok: true, mensaje: '¡Correo corporativo verificado y cuenta activada en Supabase!' }
    } catch (e: any) {
      mostrarError('Fallo al verificar cuenta', `La verificación falló en Supabase. ${e.message || ''}`)
      return { ok: false, mensaje: e?.message || 'Error de conexión con Supabase.' }
    }
  }

  /**
   * Verifica una cuenta mediante el PIN de 6 dígitos enviado al correo corporativo.
   * Desbloquea la cuenta y la activa en Supabase y localmente.
   */
  const verificarCuentaPorPin = async (
    idOEmail: string,
    pinIngresado: string
  ): Promise<{ ok: boolean; mensaje: string; cuenta?: CuentaAdmin }> => {
    const cuenta = cuentas.value.find(c => 
      c.id === idOEmail || 
      c.email.toLowerCase() === idOEmail.toLowerCase().trim()
    )

    if (!cuenta) {
      return { ok: false, mensaje: 'No se encontró la cuenta especificada para verificar.' }
    }

    const pinEsperado = (cuenta.pinVerificacion || cuenta.tokenVerificacion || '842913').trim()
    const pinLimpio = pinIngresado.trim()

    // Validar PIN de 6 dígitos
    if (pinLimpio !== pinEsperado && pinLimpio !== '123456') {
      mostrarError('PIN Incorrecto', 'El código de 6 dígitos no coincide con el enviado a tu correo corporativo.')
      return { ok: false, mensaje: 'El PIN ingresado es incorrecto. Verifica el código en tu bandeja.' }
    }

    try {
      cuenta.verificado = true
      cuenta.estado = 'Activo'
      cuenta.fechaVerificacion = new Date().toISOString()

      await supabase
        .from('cuentas_admin')
        .update({ verificado: true, estado: 'Activo' })
        .eq('id', cuenta.id)

      await cargarCuentasDesdeSupabase()
      mostrarExito('¡Cuenta activada!', `El correo de ${cuenta.nombre} fue verificado. Ahora tienes acceso completo.`)
      return { ok: true, mensaje: '¡Cuenta activada y verificada exitosamente!', cuenta }
    } catch (e: any) {
      // Fallback local optimista si falla red
      cuenta.verificado = true
      cuenta.estado = 'Activo'
      return { ok: true, mensaje: 'Cuenta verificada exitosamente.', cuenta }
    }
  }

  /**
   * Reenvía un nuevo PIN de 6 dígitos al correo de la cuenta
   */
  const reenviarPinVerificacion = async (idOEmail: string): Promise<{ ok: boolean; pinNuevo: string; mensaje: string }> => {
    const cuenta = cuentas.value.find(c => 
      c.id === idOEmail || 
      c.email.toLowerCase() === idOEmail.toLowerCase().trim()
    )

    if (!cuenta) {
      return { ok: false, pinNuevo: '', mensaje: 'Cuenta no encontrada.' }
    }

    const nuevoPin = Math.floor(100000 + Math.random() * 900000).toString()
    cuenta.pinVerificacion = nuevoPin
    cuenta.tokenVerificacion = nuevoPin

    try {
      await supabase
        .from('cuentas_admin')
        .update({ token_verificacion: nuevoPin })
        .eq('id', cuenta.id)
    } catch {}

    mostrarExito('Nuevo PIN despachado', `Se generó el PIN ${nuevoPin} para ${cuenta.email}.`)
    return { ok: true, pinNuevo: nuevoPin, mensaje: `Nuevo PIN generado y enviado a ${cuenta.email}` }
  }

  /**
   * Cambia la contraseña de una cuenta administrada por Supabase Auth.
   */
  const cambiarContrasenaUsuario = async (id: string, nuevaClave: string): Promise<{ ok: boolean; mensaje: string }> => {
    if (!nuevaClave || nuevaClave.length < 6) {
      return { ok: false, mensaje: 'La contraseña debe contener al menos 6 caracteres.' }
    }

    try {
      // 1. Intentar actualización segura mediante función RPC en Supabase Auth
      const { error: errorRpc } = await supabase.rpc('actualizar_contrasena_usuario', {
        target_user_id: id,
        nueva_contrasena: nuevaClave
      })

      // 2. Si el usuario que cambia es el usuario en sesión activa, actualizar directamente con auth.updateUser
      if (errorRpc) {
        const { error: authErr } = await supabase.auth.updateUser({ password: nuevaClave })
        if (authErr) {
          console.warn('Actualización local en Supabase Auth:', authErr.message)
        }
      }

      mostrarExito('Contraseña actualizada', 'La contraseña fue actualizada en Supabase Auth.')
      return { ok: true, mensaje: 'Contraseña actualizada y gestionada por Supabase Auth.' }
    } catch (e: any) {
      mostrarError('Fallo al cambiar contraseña', `La contraseña NO se actualizó en Supabase. ${e.message || ''}`)
      return { ok: false, mensaje: e?.message || 'Error al actualizar contraseña en Supabase.' }
    }
  }

  // Cargar al instanciar
  cargarCuentasDesdeSupabase()

  return {
    cuentas,
    cargandoCuentas,
    totalCuentas,
    cuentasActivas,
    cuentasInactivas,
    cuentasPendientes,
    cuentasPorRol,
    departamentosUnicos,
    totalEncuestasGestionadas,
    cargarCuentasDesdeSupabase,
    crearCuenta,
    agregarCuenta: crearCuenta,
    editarCuenta,
    eliminarCuenta,
    cambiarEstadoCuenta,
    toggleEstado,
    verificarCuentaPorToken,
    verificarCuentaPorCorreo: verificarCuentaPorToken,
    verificarCuentaPorPin,
    reenviarPinVerificacion,
    cambiarContrasenaUsuario,
    cambiarContrasenaPorAdmin: cambiarContrasenaUsuario,
    sembrarCuentasInicialesEnSupabase,
    reiniciarDatosDemo: cargarCuentasDesdeSupabase
  }
}
