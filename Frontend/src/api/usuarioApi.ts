import { Usuario } from '../types';

const API_URL = "http://localhost:5245/api/usuario";

export const usuarioApi = {
  getByEmail: async (email: string): Promise<Usuario> => {
    const res = await fetch(`${API_URL}/email/${encodeURIComponent(email)}`);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      throw new Error("Error al buscar usuario");
    }

    return await res.json();
  },

  getById: async (Id: string): Promise<Usuario> => {
    const res = await fetch(`${API_URL}/${Id}`);
        if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      throw new Error("Error al buscar usuario");
    }

    return await res.json();
  }
};
