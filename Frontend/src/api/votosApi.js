const API_URL = "http://localhost:5173/api/votos";

export async function obtenerVotos() {
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