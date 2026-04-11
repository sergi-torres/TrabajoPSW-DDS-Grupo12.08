/**
 * eventosApi.js
 * 
 * Capa de red para eventos.
 * Centraliza las llamadas fetch relacionadas con eventos/salas.
 */

const API_URL = "http://localhost:5245/api/Eventos";

/**
 * @param {string} pin - PIN numérico de 6 dígitos
 * @returns {Promise<{id: string}>} Datos del evento
 * @throws {Error} Si el PIN no es válido o el evento ha terminado
 */
export async function joinEvento(pin) {
    const cacheRaw = localStorage.getItem("misEventosCache");
    if (cacheRaw) {
        try {
            const cache = JSON.parse(cacheRaw);
            const match = cache.find((e) => String(e.codEvento) === String(pin));
            if (match) {
                return {
                    id: match.id,
                    codEvento: match.codEvento,
                    nombre: match.nombre,
                };
            }
        } catch {
            // Ignorar cache invalido y seguir con backend
        }
    }

    const response = await fetch(`${API_URL}/join?pin=${pin}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "El PIN no es válido o el evento ha terminado");
    }

    return response.json();
}

/**
 * @param {number} userId
 * @returns {Promise<Array>} Lista de eventos del usuario
 */
export async function getMisEventos(userId) {
    const response = await fetch(`${API_URL}/mis-eventos?userId=${userId}`);
    if (!response.ok) throw new Error("Error al obtener mis eventos");
    return response.json();
}

