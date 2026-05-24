import { Categoria } from '../types';

import { API_BASE_URL } from "../config/api";
const API_URL = `${API_BASE_URL}/api/categorias`;

export const categoriasApi = {
  getByEvento: async (eventoId: number): Promise<Categoria[]> => {
    const res = await fetch(`${API_URL}/evento/${eventoId}`);

    if (!res.ok) {
      throw new Error("Error al obtener categorías");
    }

    return await res.json();
  },

  getById: async (id: number): Promise<Categoria> => {
    if (!id) {
      throw new Error("ID de categoría no proporcionado");
    }
    
    // ✅ URL correcta: api/categorias/id/{id}
    const res = await fetch(`${API_URL}/id/${id}`);
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Categoría no encontrada");
      }
      throw new Error("Error al obtener categoría");
    }
    
    return await res.json();
  }
};
