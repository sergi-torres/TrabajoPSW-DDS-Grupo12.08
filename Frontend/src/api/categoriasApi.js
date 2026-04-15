const API_URL = "http://localhost:5245/api/categorias";

export const categoriasApi = {
  getByEvento: async (eventoId) => {
    const res = await fetch(`${API_URL}/evento/${eventoId}`);

    if (!res.ok) {
      throw new Error("Error al obtener categorías");
    }

    return await res.json();
  }
};
