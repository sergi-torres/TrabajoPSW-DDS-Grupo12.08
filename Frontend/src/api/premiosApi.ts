import { Premio } from "@/types";

const API_URL = "http://localhost:5245/api/premios";

export const premiosApi = {

    obtenerPremios: async (eventoId: number): Promise<Premio[]> => {
        const res = await fetch(`${API_URL}/evento/${eventoId}`);
        if (!res.ok) {
            throw new Error("Error al obtener premios");
        }
        return await res.json();

    },

    crearPremio: async (premioDto: Premio): Promise<void> => {
        const res = await fetch(`${API_URL}/guardar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(premioDto)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al guardar el premio");
        }
    },

    actualizarPremio: async (premioDto: Premio): Promise<void> => {
        const res = await fetch(`${API_URL}/actualizar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(premioDto)
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al actualizar el premio");
        }
    },

    eliminarPremio: async (premioId: number): Promise<void> => {
        const res = await fetch(`${API_URL}/eliminar/${premioId}`, {
            method: "DELETE"
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al eliminar el premio");
        }
    }
}