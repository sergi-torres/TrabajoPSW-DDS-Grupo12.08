import { ComentarioCualitativo } from '../types';

const API_URL = "http://localhost:5245/api/comentarios";

export const comentariosApi = {

  getByVotacion: async (idVotacion: number): Promise<ComentarioCualitativo[]> => {
    const res = await fetch(
      `${API_URL}?idVotacion=${idVotacion}`
    );

    if (!res.ok) {
      throw new Error("Error al obtener comentarios");
    }

    return await res.json();
  },

  create: async (comentario: ComentarioCualitativo): Promise<ComentarioCualitativo> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comentario)
    });

    if (!res.ok) {
      throw new Error("Error al crear comentario");
    }

    return await res.json();
  },

  getResumen: async (proyectoId: number, categoriaId: number) => {
    const res = await fetch(`${API_URL}/proyecto/${proyectoId}/categoria/${categoriaId}/resumen`);
    if (!res.ok) throw new Error("Error al obtener resumen de comentarios");
    return await res.json();
  },

  getDetalleUsuario: async (proyectoId: number, categoriaId: number, usuarioRef: string) => {
    const res = await fetch(`${API_URL}/proyecto/${proyectoId}/categoria/${categoriaId}/usuario/${usuarioRef}`);
    if (!res.ok) throw new Error("Error al obtener detalle de comentarios");
    return await res.json();
  }
};
