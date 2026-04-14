/**
 * orgDashboardApi.js
 *
 * Capa de red para el dashboard del organizador.
 * Centraliza las llamadas fetch al OrgDashboardController.
 */

const API_URL = "http://localhost:5245/api/OrgDashboard";

/**
 * Obtiene todos los datos del dashboard del organizador para un evento.
 * @param {number} eventoId
 * @returns {Promise<{stats, ranking, feed, liveInfo}>}
 */
export async function getDashboard(eventoId) {
    const response = await fetch(`${API_URL}/${eventoId}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al obtener el dashboard");
    }
    return response.json();
}

/**
 * Extiende el tiempo de votación.
 * @param {number} eventoId
 * @param {number} minutosExtra
 */
export async function extenderTiempo(eventoId, minutosExtra) {
    const response = await fetch(`${API_URL}/${eventoId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutosExtra }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al extender el tiempo");
    }
    return response.json();
}

/**
 * Cierra la votación del evento inmediatamente.
 * @param {number} eventoId
 */
export async function cerrarVotacion(eventoId) {
    const response = await fetch(`${API_URL}/${eventoId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al cerrar la votación");
    }
    return response.json();
}
