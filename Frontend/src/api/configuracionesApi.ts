import { ConfiguracionTiempoDto } from '../types';

import { API_BASE_URL } from "../config/api";
const API_URL = `${API_BASE_URL}/api/configuraciones`;

export const ConfigTiemposVotacion = {
  // Obtener todas las categorías de un evento con sus tiempos (si los tienen)
  obtenerPorEvento: async (eventoId: number): Promise<any[]> => {
    const res = await fetch(`${API_URL}/evento/${eventoId}`);
    if (!res.ok) throw new Error("Error al obtener la configuración de categorías");
    return await res.json();
  },

  // Obtener todas las categorías para el control (incluye finalizadas)
  obtenerParaControl: async (eventoId: number): Promise<any[]> => {
    const res = await fetch(`${API_URL}/evento/${eventoId}/control`);
    if (!res.ok) throw new Error("Error al obtener las categorías de control");
    return await res.json();
  },

  // Guardar o borrar (enviando nulos en el DTO)
  guardarConfiguracion: async (configDto: ConfiguracionTiempoDto): Promise<any> => {
    const res = await fetch(`${API_URL}/configurar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configDto)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Error al guardar la configuración");
    }
    return await res.json();
  },

  // Actualizar solo el estado de la categoría
  actualizarEstadoCategoria: async (id: number, nuevoEstado: string): Promise<any> => {
    const res = await fetch(`${API_URL}/categoria/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevoEstado })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Error al actualizar el estado");
    }
    return await res.json();
  },

  // Actualizar límite de votos
  actualizarLimiteVotos: async (eventoId: number, votosMaximos: number, categoriaId?: number): Promise<boolean> => {
    const body: any = { votosMaximos };
    if (categoriaId !== undefined) {
        body.categoriaId = categoriaId;
    }
    const res = await fetch(`${API_URL}/evento/${eventoId}/limite-votos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("Error al actualizar el límite de votos");
    return true;
  }
};
