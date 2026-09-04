/**
 * ============================================================================
 * CLIENTE DE BASE DE DATOS Y AUTENTICACIÓN REMOTA (supabase.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Inicializa y exporta la instancia del cliente SDK oficial `@supabase/supabase-js`
 * configurado con las credenciales oficiales del proyecto Supabase.
 * 
 * ¿PARA QUÉ SIRVE?
 * - Proveer autenticación remota en la nube para usuarios administradores.
 * - Sincronizar respuestas, encuestas, cuentas, auditoría y alertas en tiempo real.
 * 
 * ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
 * - useAuth.ts, useCuentas.ts, useEncuestas.ts, useNotificaciones.ts, useEstadisticas.ts
 */

import { createClient } from '@supabase/supabase-js'

const urlSupabase = import.meta.env.VITE_SUPABASE_URL || 'https://yxskysegqxuttyxzmubl.supabase.co'
const claveAnonimaSupabase = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_buEy1BsRysoVXav6-4NA-g_UwsOYsWd'

export const supabase = createClient(urlSupabase, claveAnonimaSupabase)