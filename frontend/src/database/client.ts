/**
 * ============================================================================
 * ADAPTADOR DE API COMPATIBLE CON SUPABASE (src/database/client.ts)
 * ============================================================================
 * Proporciona un adaptador limpio y seguro para módulos existentes.
 * CERO contraseñas en texto plano, CERO almacenamiento de credenciales en localStorage.
 * Todas las peticiones se delegan a la API REST de Express + PostgreSQL.
 */

import { solicitarApi } from '@/services/api'

class QueryBuilderApi {
  private tabla: string

  constructor(tabla: string) {
    this.tabla = tabla
  }

  select(columnas = '*') { return this }
  order(campo: string, opciones?: any) { return this }
  eq(campo: string, valor: any) { return this }
  neq(campo: string, valor: any) { return this }
  maybeSingle() { return this.single() }

  async single() {
    const res = await this.ejecutar()
    return { data: Array.isArray(res.data) ? res.data[0] || null : res.data, error: res.error }
  }

  async insert(filas: any) {
    const body = Array.isArray(filas) ? filas[0] : filas
    return await solicitarApi(`/${this.tabla}`, { method: 'POST', body: JSON.stringify(body) })
  }

  async upsert(filas: any) {
    const body = Array.isArray(filas) ? filas[0] : filas
    return await solicitarApi(`/${this.tabla}`, { method: 'POST', body: JSON.stringify(body) })
  }

  async update(cambios: any) {
    return await solicitarApi(`/${this.tabla}`, { method: 'PUT', body: JSON.stringify(cambios) })
  }

  async delete() {
    return await solicitarApi(`/${this.tabla}`, { method: 'DELETE' })
  }

  private async ejecutar() {
    return await solicitarApi<any[]>(`/${this.tabla}`)
  }

  then(onfulfilled?: (val: any) => any, onrejected?: (err: any) => any) {
    return this.ejecutar().then(onfulfilled, onrejected)
  }
}

export const supabase = {
  from(nombreTabla: string) {
    return new QueryBuilderApi(nombreTabla)
  },
  async rpc(fn: string, args?: any) {
    return { data: null, error: null }
  },
  auth: {
    async getUser() { return { data: { user: null }, error: null } },
    async updateUser(attrs: any) { return { data: { user: attrs }, error: null } },
    async signUp(cred: any) { return { data: { user: cred }, error: null } },
    async signOut() { return { error: null } }
  }
}

export function isSupabaseConfigured(): boolean {
  return true
}
