import { solicitarApi } from '@/services/api'
import type { GraficoAnclado, DimensionRadial } from '@/shared/types/dashboard.types'

/**
 * Data Access Object / API wrapper for Dashboard & Pinned Charts via REST API
 */
export class DashboardApi {
  /**
   * Fetches all pinned charts from backend, optionally filtered by survey ID
   */
  static async obtenerGraficosAnclados(idEncuesta?: string): Promise<GraficoAnclado[]> {
    try {
      const endpoint = idEncuesta && idEncuesta !== 'todas'
        ? `/dashboard/graficos-anclados?idEncuesta=${encodeURIComponent(idEncuesta)}`
        : '/dashboard/graficos-anclados'
      
      const { data, error } = await solicitarApi<any[]>(endpoint)
      if (error || !data) return []

      return data.map((item: Record<string, unknown>) => ({
        id: String(item.id),
        idEncuesta: item.idEncuesta || item.id_encuesta ? String(item.idEncuesta || item.id_encuesta) : undefined,
        titulo: String(item.titulo || ''),
        idPregunta: String(item.idPregunta || item.id_pregunta || ''),
        textoPregunta: String(item.textoPregunta || item.texto_pregunta || ''),
        tipoAnalisis: item.tipoAnalisis as GraficoAnclado['tipoAnalisis'],
        tipoGrafico: item.tipoGrafico as GraficoAnclado['tipoGrafico'],
        descripcion: item.descripcion ? String(item.descripcion) : undefined,
        colorTema: item.colorTema ? String(item.colorTema) : undefined,
        fechaCreacion: item.fechaCreacion ? String(item.fechaCreacion) : new Date().toISOString()
      }))
    } catch (error: unknown) {
      return []
    }
  }

  /**
   * Inserts or updates a pinned chart
   */
  static async guardarGraficoAnclado(grafico: GraficoAnclado): Promise<boolean> {
    try {
      const { error } = await solicitarApi('/dashboard/graficos-anclados', {
        method: 'POST',
        body: JSON.stringify(grafico)
      })
      return !error
    } catch (error: unknown) {
      return false
    }
  }

  /**
   * Deletes a pinned chart by ID
   */
  static async eliminarGraficoAnclado(id: string): Promise<boolean> {
    try {
      const { error } = await solicitarApi(`/dashboard/graficos-anclados/${id}`, {
        method: 'DELETE'
      })
      return !error
    } catch (error: unknown) {
      return false
    }
  }

  /**
   * Fetches global radar configuration
   */
  static async obtenerConfiguracionRadar(): Promise<{ metaGlobal: number; dimensiones: DimensionRadial[] } | null> {
    try {
      const { data, error } = await solicitarApi<any>('/dashboard/radar')
      if (error || !data) return null

      return {
        metaGlobal: data.metaGlobal || 85,
        dimensiones: data.dimensiones || []
      }
    } catch (error: unknown) {
      return null
    }
  }

  /**
   * Saves global radar configuration
   */
  static async guardarConfiguracionRadar(metaGlobal: number, dimensiones: DimensionRadial[]): Promise<boolean> {
    try {
      const { error } = await solicitarApi('/dashboard/radar', {
        method: 'POST',
        body: JSON.stringify({ metaGlobal, dimensiones })
      })
      return !error
    } catch (error: unknown) {
      return false
    }
  }

  /**
   * Restores default global radar configuration
   */
  static async restaurarConfiguracionRadar(): Promise<boolean> {
    try {
      const { error } = await solicitarApi('/dashboard/radar/restaurar', {
        method: 'POST'
      })
      return !error
    } catch (error: unknown) {
      return false
    }
  }
}
