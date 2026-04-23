const API_URL = "http://localhost:5245/api/categorias";

export const categoriasApi = {
  getByEvento: async (eventoId) => {
    const res = await fetch(`${API_URL}/evento/${eventoId}`);

    if (!res.ok) {
      throw new Error("Error al obtener categorías");
    }

    return await res.json();
  },

  getById: async (id) => {
    if (!id) {
      throw new Error("ID de categoría no proporcionado");
    }
    
    // ✅ URL correcta: api/categorias/{id}
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
