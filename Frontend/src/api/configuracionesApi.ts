import { ConfiguracionTiempoDto } from '../types';

import { API_BASE_URL } from "../config/api";
const API_URL = `${API_BASE_URL}/api/configuraciones`;

export const ConfigTiemposVotacion = {
  obtenerPorEvento: async (eventoId: number): Promise<any[]> => {
    const res = await fetch(`${API_URL}/evento/${eventoId}`);
    if (!res.ok) throw new Error("Error al obtener la configuración de categorías");
    return await res.json();
  },

  obtenerParaControl: async (eventoId: number): Promise<any[]> => {
    const res = await fetch(`${API_URL}/evento/${eventoId}/control`);
    if (!res.ok) throw new Error("Error al obtener las categorías de control");
    return await res.json();
  },

  // Sending null times in the DTO deletes the existing configuration for that category.
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
