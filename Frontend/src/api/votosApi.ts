import { API_BASE_URL } from "../config/api";
const API_URL = `${API_BASE_URL}/api/comentarios`;

export async function obtenerVotos(): Promise<any[]> {
    const response = await fetch(`${API_URL}/Votos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al cargar los votos");
    }

    return response.json();
}
