import { OrgDashboardData } from '../types';

const API_URL = "http://localhost:5245/api/OrgDashboard";

export async function getDashboard(eventoId: number): Promise<OrgDashboardData> {
    const response = await fetch(`${API_URL}/${eventoId}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al obtener el dashboard");
    }
    return response.json();
}

export async function extenderTiempo(eventoId: number, minutosExtra: number): Promise<any> {
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

export async function cerrarVotacion(eventoId: number): Promise<any> {
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
