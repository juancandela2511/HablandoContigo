/**
 * ============================================================================
 * UTILIDAD DE CLIENTE SUPABASE (src/utils/supabase.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Exporta el cliente oficial de Supabase para su consumo estándar en vistas
 * y subcomponentes modulares.
 * 
 * ¿PARA QUÉ SIRVE?
 * - Facilitar la consulta y escritura directa en las tablas de Supabase.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yxskysegqxuttyxzmubl.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_buEy1BsRysoVXav6-4NA-g_UwsOYsWd'

export const supabase = createClient(supabaseUrl, supabaseKey)
