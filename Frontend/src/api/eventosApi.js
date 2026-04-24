const API_URL = "http://localhost:5245/api/Eventos";

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

export async function getMisEventos(userId) {
    const response = await fetch(`${API_URL}/mis-eventos?userId=${userId}`);
    if (!response.ok) throw new Error("Error al obtener mis eventos");
    return response.json();
}

/**
 * Obtener detalle completo de un evento (baremos, criterios, categorías)
 * para prellenar el formulario de edición.
 */
export async function getEventoDetalle(eventoId) {
    const response = await fetch(`${API_URL}/${eventoId}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al obtener el detalle del evento");
    }
    return response.json();
}

/**
 * Actualizar un evento existente.
 */
export async function updateEvento(eventoId, data) {
    const response = await fetch(`${API_URL}/${eventoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al actualizar el evento");
    }

    return response.json();
}


