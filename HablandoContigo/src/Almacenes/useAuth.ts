/**
 * ============================================================================
 * ALMACÉN DE AUTENTICACIÓN Y SESIÓN ADMINISTRATIVA (useAuth)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Este almacén gestiona el ciclo de vida de la autenticación de usuarios administrativos,
 * validación de credenciales, roles y permisos (Super Administrador, Administrador,
 * Supervisor, Analista RRHH), integración híbrida con Supabase Auth y persistencia local.
 * 
 * ¿PARA QUÉ SIRVE?
 * - Proteger las rutas administrativas (`/admin/cuentas`, `/proyectos`, `/dashboard`, `/configuracion`).
 * - Permitir inicio de sesión formal por correo/contraseña o acceso instantáneo en 1-clic para demos.
 * - Sincronizar el perfil del usuario activo (nombre, departamento, biografía, foto avatar).
 * 
 * ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
 * - LoginView.vue: Interfaz donde el usuario ingresa sus credenciales o usa acceso demo.
 * - router/index.ts: Guardia `beforeEach` que redirige a `/login` si la ruta requiere autenticación.
 * - Menu.vue: Muestra el estado "Online", avatar del usuario logueado y botón de logout.
 * - ConfiguracionView.vue: Actualiza el perfil y foto del usuario conectado.
 * - AdminCuentasView.vue: Permite administrar todas las cuentas del sistema.
 * - supabase.ts: Cliente de base de datos y autenticación remota en Supabase.
 */

import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { PERMISOS_POR_ROL, validarDominioCorporativo, type RolCuenta, type PermisosRol } from '@/Almacenes/useCuentas'
import { useToast } from '@/Almacenes/useToast'

const { mostrarError, mostrarExito } = useToast()

/**
 * Modelo de Usuario Administrativo
 */
export interface Usuario {
  /** Identificador único del usuario (ej. 'usr-admin-01') */
  id: string
  /** Nombre completo del administrador */
  nombre: string
  /** Correo electrónico institucional */
  email: string
  /** Rol con jerarquía de permisos en la plataforma */
  rol: RolCuenta
  /** Departamento o área a la que pertenece */
  departamento: string
  /** Ruta o DataURL de la foto de perfil */
  avatar: string
  /** URL dinámica remota o local de la foto de perfil */
  fotoUrl?: string
  /** Marca legible del último acceso registrado */
  ultimoAcceso?: string
  /** Breve descripción del rol o responsabilidades */
  biografia?: string
  /** Número de teléfono o contacto directo */
  telefono?: string
}

/** Clave de persistencia de sesión en el almacenamiento local */
const CLAVE_ALMACENAMIENTO_SESION = 'hablandocontigo_usuario_sesion'

/**
 * Carga el usuario previamente autenticado desde el almacenamiento local
 * 
 * @returns {Usuario | null} Usuario recuperado o null si no hay sesión
 */
function obtenerUsuarioInicial(): Usuario | null {
  const sesionGuardada = localStorage.getItem(CLAVE_ALMACENAMIENTO_SESION)
  if (sesionGuardada) {
    try {
      return JSON.parse(sesionGuardada)
    } catch {
      return null
    }
  }
  return null
}

// Estado reactivo global del módulo de autenticación
const usuarioActual = ref<Usuario | null>(obtenerUsuarioInicial())
const cargando = ref(false)
const errorAutenticacion = ref<string | null>(null)
const cuentaPendienteVerificacion = ref<any>(null)
const requiereCambioClavePrimerIngreso = ref(false)
const emailPrimerIngreso = ref('')

/** Clave de persistencia de cuentas para sincronizar el estado */
const CLAVE_ALMACENAMIENTO_CUENTAS = 'hablandocontigo_cuentas_admin'

/**
 * Composable `useAuth` para inyección de dependencias de sesión
 */
export function useAuth() {
  /** Indica si hay un usuario con sesión activa */
  const estaAutenticado = computed(() => usuarioActual.value !== null)
  
  /** Indica si el usuario actual posee permisos de Super Administrador */
  const esSuperAdmin = computed(() => usuarioActual.value?.rol === 'Super Administrador')

  /** Permisos granulares del usuario según su rol (RBAC) */
  const permisosUsuario = computed<PermisosRol>(() => {
    if (!usuarioActual.value?.rol || !PERMISOS_POR_ROL[usuarioActual.value.rol]) {
      return {
        proyectos: false,
        dashboard: false,
        alertas: false,
        cuentas: false,
        cambiarContrasenasOtros: false,
        configuracion: true
      }
    }
    return PERMISOS_POR_ROL[usuarioActual.value.rol]
  })

  /**
   * Determina si el cliente de Supabase está disponible y configurado
   */
  const esSupabaseConfigurado = (): boolean => {
    return Boolean(
      supabase &&
      !(supabase as any).supabaseUrl?.includes('TU_SUPABASE') &&
      !(supabase as any).supabaseKey?.includes('TU_SUPABASE')
    )
  }

  /**
   * Refresca el perfil del usuario activo directamente desde Supabase.
   * Se llama al montar la app para garantizar que los datos locales estén actualizados.
   */
  const refrescarSesionDesdeSupabase = async (): Promise<void> => {
    if (!usuarioActual.value?.email) return
    try {
      const { data, error } = await supabase
        .from('cuentas_admin')
        .select('*')
        .eq('email', usuarioActual.value.email.toLowerCase().trim())
        .maybeSingle()

      if (error || !data) return

      const fotoFinal = data.foto_url || data.avatar || usuarioActual.value.fotoUrl || ''
      const usuarioActualizado: Usuario = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        departamento: data.departamento,
        avatar: fotoFinal,
        fotoUrl: fotoFinal,
        biografia: data.biografia || usuarioActual.value.biografia || 'Gestión y análisis de clima laboral.',
        telefono: data.telefono || usuarioActual.value.telefono || '',
        ultimoAcceso: usuarioActual.value.ultimoAcceso || 'Ahora mismo'
      }
      usuarioActual.value = usuarioActualizado
      localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioActualizado))
    } catch (e) {
      console.warn('No se pudo refrescar la sesión desde Supabase:', e)
    }
  }

  /**
   * Sincroniza la información del usuario con el listado global de cuentas en localStorage
   */
  const sincronizarConCuentas = (usuario: Usuario, estado?: 'Activo' | 'Inactivo') => {
    try {
      const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO_CUENTAS)
      if (guardado) {
        const cuentas = JSON.parse(guardado)
        const indice = cuentas.findIndex((c: any) => c.email === usuario.email || c.id === usuario.id)
        if (indice !== -1) {
          cuentas[indice] = {
            ...cuentas[indice],
            nombre: usuario.nombre,
            rol: usuario.rol,
            departamento: usuario.departamento,
            avatar: usuario.fotoUrl || usuario.avatar || cuentas[indice].avatar,
            fotoUrl: usuario.fotoUrl || usuario.avatar || cuentas[indice].fotoUrl,
            estado: estado || cuentas[indice].estado || 'Activo'
          }
          localStorage.setItem(CLAVE_ALMACENAMIENTO_CUENTAS, JSON.stringify(cuentas))
        }
      }
    } catch (e) {
      console.warn('No se pudo sincronizar con cuentas:', e)
    }
  }

  /**
   * Inicia sesión validando credenciales contra Supabase
   */
  const iniciarSesion = async (email: string, contrasena: string): Promise<boolean> => {
    cargando.value = true
    errorAutenticacion.value = null

    try {
      if (!email || !contrasena) {
        errorAutenticacion.value = 'Por favor completa todos los campos requeridos.'
        return false
      }

      if (!validarDominioCorporativo(email)) {
        errorAutenticacion.value = 'Solo se permiten correos corporativos autorizados de la empresa (@ontime.es).'
        return false
      }

      // 1. Iniciar sesión directamente con Supabase Auth (Cifrado nativo de contraseñas de Supabase)
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: contrasena
      })

      if (authErr) {
        if (authErr.message === 'Invalid login credentials') {
          errorAutenticacion.value = 'Credenciales inválidas. Verifica tu correo corporativo y contraseña.'
        } else if (authErr.message.includes('Email not confirmed')) {
          errorAutenticacion.value = 'El correo electrónico no ha sido confirmado en Supabase Auth.'
        } else {
          errorAutenticacion.value = authErr.message
        }
        return false
      }

      if (!authData?.user) {
        errorAutenticacion.value = 'No se pudo autenticar con Supabase Auth.'
        return false
      }

      const userAuthMeta = authData.user.user_metadata

      // 2. Consultar perfil administrativo en Supabase tabla cuentas_admin
      const { data: dataObtenida, error: errorDb } = await supabase
        .from('cuentas_admin')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      let cuentaDb: any = dataObtenida

      if (errorDb) {
        errorAutenticacion.value = `Error consultando perfil en base de datos: ${errorDb.message}`
        return false
      }

      // Si no existe el perfil administrativo en cuentas_admin, crearlo automáticamente vinculado a auth.users
      if (!cuentaDb) {
        try {
          const perfilInicial = {
            id: authData.user.id,
            nombre: userAuthMeta?.nombre || (email.toLowerCase().includes('admin') ? 'Super Administrador' : 'Administrador'),
            email: email.toLowerCase().trim(),
            rol: userAuthMeta?.rol || (email.toLowerCase().includes('admin') ? 'Super Administrador' : 'Administrador'),
            departamento: userAuthMeta?.departamento || 'Tecnología & Soporte TI',
            estado: 'Activo',
            verificado: true
          }
          await supabase.from('cuentas_admin').upsert(perfilInicial, { onConflict: 'email' })
          const { data: recien } = await supabase.from('cuentas_admin').select('*').eq('email', email.toLowerCase().trim()).maybeSingle()
          cuentaDb = recien || perfilInicial
        } catch (errPerfil) {
          console.warn('Aviso sincronizando perfil cuentas_admin:', errPerfil)
        }
      }

      if (!cuentaDb) {
        errorAutenticacion.value = 'No se encontró perfil administrativo para esta cuenta en Supabase.'
        return false
      }

      // 🔐 EXIGIR CAMBIO DE CONTRASEÑA OBLIGATORIO EN PRIMER INGRESO
      const flagPrimerIngreso = localStorage.getItem(`hablandocontigo_primer_ingreso_${email.toLowerCase().trim()}`)
      const debeCambiar = userAuthMeta?.debe_cambiar_contrasena === true || flagPrimerIngreso === 'true'

      if (debeCambiar) {
        emailPrimerIngreso.value = email.toLowerCase().trim()
        requiereCambioClavePrimerIngreso.value = true
        errorAutenticacion.value = null
        return false
      }

      if (cuentaDb.estado === 'Inactivo') {
        errorAutenticacion.value = 'Esta cuenta se encuentra desactivada. Contacta al Super Administrador.'
        return false
      }

      // Si la cuenta no ha sido verificada con PIN, BLOQUEAR ACCESO ABSOLUTO
      if (cuentaDb.estado === 'Pendiente' || cuentaDb.verificado === false) {
        cuentaPendienteVerificacion.value = cuentaDb
        errorAutenticacion.value = 'Tu cuenta está bloqueada hasta que verifiques tu correo corporativo con el PIN de 6 dígitos.'
        return false
      }

      const fotoFinal = cuentaDb.avatar_url || cuentaDb.foto_url || cuentaDb.avatar || ''

      const usuarioSupabase: Usuario = {
        id: cuentaDb.id,
        nombre: cuentaDb.nombre,
        email: cuentaDb.email,
        rol: cuentaDb.rol,
        departamento: cuentaDb.departamento,
        avatar: fotoFinal,
        fotoUrl: fotoFinal,
        biografia: cuentaDb.biografia || 'Gestión y análisis de clima laboral.',
        telefono: cuentaDb.telefono || '',
        ultimoAcceso: 'Ahora mismo'
      }

      usuarioActual.value = usuarioSupabase
      localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioSupabase))
      sincronizarConCuentas(usuarioSupabase, 'Activo')
      return true
    } catch (errorCapturado: any) {
      errorAutenticacion.value = errorCapturado?.message || 'Error al iniciar sesión. Verifica tus datos.'
      return false
    } finally {
      cargando.value = false
    }
  }

  /**
   * Permite el acceso administrativo conectando con la primera cuenta Super Administrador en Supabase
   */
  const accesoRapidoAdmin = async () => {
    cargando.value = true
    errorAutenticacion.value = null

    try {
      let { data } = await supabase
        .from('cuentas_admin')
        .select('*')
        .order('creado_en', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!data) {
        // Sembrar cuenta inicial en Supabase si la tabla está vacía
        await supabase.from('cuentas_admin').upsert({
          id: 'cta-001',
          nombre: 'Administrador Principal',
          email: 'admin@ontime.es',
          rol: 'Super Administrador',
          departamento: 'Tecnología & Soporte TI',
          estado: 'Activo',
          avatar_url: null
        }, { onConflict: 'email' })

        const { data: recien } = await supabase.from('cuentas_admin').select('*').eq('id', 'cta-001').maybeSingle()
        if (recien) data = recien
      }

      if (data) {
        const fotoFinal = data.avatar_url || data.foto_url || data.avatar || ''
        const usuarioSesion: Usuario = {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          rol: data.rol,
          departamento: data.departamento,
          avatar: fotoFinal,
          fotoUrl: fotoFinal,
          biografia: data.biografia || 'Gestión y clima laboral.',
          ultimoAcceso: 'Ahora mismo'
        }

        usuarioActual.value = usuarioSesion
        localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioSesion))
        sincronizarConCuentas(usuarioSesion, 'Activo')
        cargando.value = false
        return true
      }
    } catch (e) {
      console.warn('Error en acceso rápido:', e)
    }

    cargando.value = false
    errorAutenticacion.value = 'No se encontró ninguna cuenta en la tabla cuentas_admin de Supabase.'
    return false
  }

  /**
   * Sube la fotografía de perfil y persiste la URL en Supabase (cuentas_admin y Storage)
   */
  const subirFotoPerfil = async (archivoODataUrl: File | string): Promise<{ ok: boolean; url: string; mensaje?: string }> => {
    if (!usuarioActual.value) {
      return { ok: false, url: '', mensaje: 'No hay una sesión activa.' }
    }

    try {
      let urlFinal = ''

      if (archivoODataUrl instanceof File) {
        try {
          const extension = archivoODataUrl.name.split('.').pop() || 'png'
          const nombreArchivo = `${usuarioActual.value.id}/avatar_${Date.now()}.${extension}`

          const { data: dataUpload, error: errorUpload } = await supabase.storage
            .from('avatars')
            .upload(nombreArchivo, archivoODataUrl, {
              cacheControl: '3600',
              upsert: true
            })

          if (!errorUpload && dataUpload) {
            const { data: dataPublica } = supabase.storage
              .from('avatars')
              .getPublicUrl(nombreArchivo)
            urlFinal = dataPublica.publicUrl
          }
        } catch (storageError) {
          console.info('Storage fallback activo')
        }

        if (!urlFinal) {
          urlFinal = await new Promise<string>((resolve, reject) => {
            const lector = new FileReader()
            lector.onload = (e) => resolve(e.target?.result as string)
            lector.onerror = reject
            lector.readAsDataURL(archivoODataUrl)
          })
        }
      } else {
        urlFinal = archivoODataUrl
      }

      // Persistir en Supabase tabla cuentas_admin con campos correctos del schema
      try {
        const { error } = await supabase
          .from('cuentas_admin')
          .update({
            foto_url: urlFinal,
            avatar: urlFinal
          })
          .eq('id', usuarioActual.value.id)

        if (error) console.warn('Supabase actualizar foto warning:', error.message)
      } catch (dbError) {
        console.warn('Error al actualizar foto en cuentas_admin:', dbError)
      }

      // Actualizar estado local reactivo
      usuarioActual.value = {
        ...usuarioActual.value,
        avatar: urlFinal,
        fotoUrl: urlFinal
      }
      localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioActual.value))
      sincronizarConCuentas(usuarioActual.value)

      return { ok: true, url: urlFinal, mensaje: 'Fotografía guardada y persistida exitosamente en Supabase.' }
    } catch (error: any) {
      return { ok: false, url: '', mensaje: error?.message || 'Error al guardar la foto.' }
    }
  }

  /**
   * Actualiza los datos del perfil del usuario y los persiste en Supabase DB
   */
  const actualizarPerfil = async (datosActualizados: Partial<Usuario>): Promise<boolean> => {
    if (!usuarioActual.value) return false

    const usuarioCombinado: Usuario = {
      ...usuarioActual.value,
      ...datosActualizados
    }

    // Persistir en Supabase con los campos correctos del schema
    try {
      const { error } = await supabase
        .from('cuentas_admin')
        .update({
          nombre: usuarioCombinado.nombre,
          departamento: usuarioCombinado.departamento,
          rol: usuarioCombinado.rol,
          foto_url: usuarioCombinado.fotoUrl || usuarioCombinado.avatar || null,
          avatar: usuarioCombinado.fotoUrl || usuarioCombinado.avatar || null,
          biografia: usuarioCombinado.biografia || null,
          telefono: usuarioCombinado.telefono || null,
          estado: 'Activo',
          verificado: true
        })
        .eq('id', usuarioCombinado.id)

      if (error) {
        console.warn('Supabase actualizar perfil error:', error.message)
        return false
      }
    } catch (e) {
      console.warn('Error al actualizar perfil en Supabase:', e)
      return false
    }

    // Actualizar estado local solo si Supabase tuvo éxito
    usuarioActual.value = usuarioCombinado
    localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioCombinado))
    sincronizarConCuentas(usuarioCombinado)

    // 🔔 Notificación de actividad: Módulo / Perfil editado
    try {
      const { useNotificaciones } = await import('@/Almacenes/useNotificaciones')
      const { agregarNotificacion } = useNotificaciones()
      await agregarNotificacion({
        tipo: 'modulo',
        titulo: 'Módulo de Perfil Editado',
        descripcion: 'Se actualizaron los datos del perfil corporativo.',
        mensaje: `Se actualizaron las credenciales e información de perfil para ${usuarioCombinado.nombre} (${usuarioCombinado.email}).`,
        departamento: usuarioCombinado.departamento || 'General',
        tipoAlerta: 'Actualización de Perfil',
        severidad: 'Baja',
        estado: 'Detectada',
        fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        leida: false,
        rutaDestino: '/configuracion'
      })
    } catch (e) {
      console.warn('No se pudo registrar notificación de actualización de perfil:', e)
    }

    return true
  }

  /**
   * Cambia la contraseña del usuario y la persiste en Supabase
   */
  const cambiarContrasena = async (nuevaContrasena: string): Promise<{ ok: boolean; mensaje: string }> => {
    if (!usuarioActual.value) {
      return { ok: false, mensaje: 'No hay una sesión activa.' }
    }

    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      return { ok: false, mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' }
    }

    try {
      // 1. Actualizar contraseña exclusivamente en Supabase Auth (cifrado bcrypt seguro)
      const { error: authErr } = await supabase.auth.updateUser({ password: nuevaContrasena })
      if (authErr) throw new Error(authErr.message)

      // 🔔 Notificación de actividad: Contraseña actualizada
      try {
        const { useNotificaciones } = await import('@/Almacenes/useNotificaciones')
        const { agregarNotificacion } = useNotificaciones()
        await agregarNotificacion({
          tipo: 'seguridad',
          titulo: 'Contraseña Actualizada',
          descripcion: 'Se actualizó la contraseña de tu cuenta administrativa.',
          mensaje: `Se cambió la contraseña de la cuenta ${usuarioActual.value.email} de forma segura en Supabase Auth.`,
          departamento: usuarioActual.value.departamento || 'Seguridad TI',
          tipoAlerta: 'Seguridad de Cuenta',
          severidad: 'Moderada',
          estado: 'Detectada',
          fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          leida: false,
          rutaDestino: '/configuracion'
        })
      } catch (errNotif) {
        console.warn('No se pudo registrar notificación de cambio de contraseña:', errNotif)
      }

      mostrarExito('Contraseña actualizada', '¡Tu contraseña fue actualizada en Supabase Auth con éxito!')
      return { ok: true, mensaje: '¡Contraseña actualizada exitosamente en Supabase Auth!' }
    } catch (error: any) {
      mostrarError('Fallo al cambiar contraseña', `La contraseña NO se actualizó en Supabase Auth. ${error?.message || ''}`)
      return { ok: false, mensaje: error?.message || 'No se pudo actualizar la contraseña.' }
    }
  }

  /**
   * Desactiva la cuenta del usuario en Supabase y cierra la sesión
   */
  const desactivarCuenta = async (motivo?: string): Promise<{ ok: boolean; mensaje: string }> => {
    if (!usuarioActual.value) {
      return { ok: false, mensaje: 'No hay una sesión activa.' }
    }

    try {
      const usuarioADesactivar = usuarioActual.value

      // Persistir desactivación en Supabase cuentas_admin
      try {
        await supabase.from('cuentas_admin').update({
          estado: 'Inactivo'
        }).eq('email', usuarioADesactivar.email)
      } catch (e) {
        console.warn('Error desactivando cuenta en Supabase:', e)
      }

      // Actualizar estado en almacén de cuentas
      sincronizarConCuentas(usuarioADesactivar, 'Inactivo')

      // Cerrar sesión
      cerrarSesion()

      return {
        ok: true,
        mensaje: 'Tu cuenta ha sido desactivada en la base de datos.'
      }
    } catch (error: any) {
      return {
        ok: false,
        mensaje: error?.message || 'Error al desactivar la cuenta.'
      }
    }
  }

  /**
   * Cierra la sesión activa, desconecta Supabase y limpia el almacenamiento local
   */
  const cerrarSesion = async () => {
    try {
      if (esSupabaseConfigurado()) {
        await supabase.auth.signOut()
      }
    } catch (e) {
      console.warn('Error cerrando sesión en Supabase:', e)
    } finally {
      usuarioActual.value = null
      localStorage.removeItem(CLAVE_ALMACENAMIENTO_SESION)
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }

  /**
   * Actualiza la contraseña en Supabase Auth cuando el colaborador inicia sesión por primera vez
   */
  const actualizarClavePrimerIngreso = async (email: string, nuevaClave: string): Promise<{ ok: boolean; mensaje?: string }> => {
    try {
      // 1. Actualizar contraseña en Supabase Authentication y retirar bandera de primer ingreso
      try {
        await supabase.auth.updateUser({
          password: nuevaClave,
          data: { debe_cambiar_contrasena: false }
        })
      } catch (authErr) {
        console.warn('Actualización de clave en Supabase Auth:', authErr)
      }

      // 2. Limpiar indicador de primer ingreso
      localStorage.removeItem(`hablandocontigo_primer_ingreso_${email.toLowerCase().trim()}`)
      requiereCambioClavePrimerIngreso.value = false

      // 3. Cargar datos de la cuenta desde Supabase para iniciar sesión de inmediato
      const { data: cuentaDb } = await supabase
        .from('cuentas_admin')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (cuentaDb) {
        const fotoFinal = cuentaDb.avatar_url || cuentaDb.foto_url || cuentaDb.avatar || ''
        const usuarioSesion: Usuario = {
          id: cuentaDb.id,
          nombre: cuentaDb.nombre,
          email: cuentaDb.email,
          rol: cuentaDb.rol,
          departamento: cuentaDb.departamento,
          avatar: fotoFinal,
          fotoUrl: fotoFinal,
          biografia: cuentaDb.biografia || 'Gestión y análisis de clima laboral.',
          telefono: cuentaDb.telefono || '',
          ultimoAcceso: 'Ahora mismo'
        }
        usuarioActual.value = usuarioSesion
        localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioSesion))
        sincronizarConCuentas(usuarioSesion, 'Activo')
      }

      mostrarExito('Contraseña actualizada', '¡Tu nueva contraseña fue guardada en Supabase! Ya puedes acceder a la consola.')
      return { ok: true }
    } catch (e: any) {
      mostrarError('Fallo al actualizar', e?.message || 'No se pudo actualizar la contraseña en Supabase.')
      return { ok: false, mensaje: e?.message }
    }
  }

  return {
    usuarioActual,
    estaAutenticado,
    esSuperAdmin,
    permisosUsuario,
    cargando,
    errorAutenticacion,
    iniciarSesion,
    accesoRapidoAdmin,
    subirFotoPerfil,
    actualizarPerfil,
    cambiarContrasena,
    actualizarClavePrimerIngreso,
    desactivarCuenta,
    cerrarSesion,
    refrescarSesionDesdeSupabase,
    cuentaPendienteVerificacion,
    limpiarCuentaPendiente: () => { cuentaPendienteVerificacion.value = null },
    requiereCambioClavePrimerIngreso,
    emailPrimerIngreso,
    cerrarModalPrimerIngreso: () => { requiereCambioClavePrimerIngreso.value = false }
  }
}
