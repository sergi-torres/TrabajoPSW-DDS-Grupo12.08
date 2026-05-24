import { Event } from '../types';
import { EventFactory } from '../models/EventFactory';

import { API_BASE_URL } from "../config/api";
const API_URL = `${API_BASE_URL}/api/Eventos`;

export async function joinEvento(pin: string): Promise<any> {
    const cacheRaw = localStorage.getItem("misEventosCache");
    if (cacheRaw) {
        try {
            const cache = JSON.parse(cacheRaw);
            const match = cache.find((e: any) => String(e.codEvento) === String(pin));
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

export async function getMisEventos(userId: number): Promise<Event[]> {
    const response = await fetch(`${API_URL}/mis-eventos?userId=${userId}`);
    if (!response.ok) throw new Error("Error al obtener mis eventos");
    const data = await response.json();
    return EventFactory.createEvents(data);
}

export async function getEventoDetalle(eventoId: number): Promise<Event> {
    const response = await fetch(`${API_URL}/${eventoId}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al obtener el detalle del evento");
    }
    const data = await response.json();
    return EventFactory.createEvent(data);
}

export async function updateEvento(eventoId: number, data: any): Promise<any> {
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

export async function getEventosDisponibles(userId: number): Promise<Event[]> {
    const response = await fetch(`${API_URL}/disponibles?userId=${userId}`);
    if (!response.ok) throw new Error("Error al obtener eventos disponibles");
    const data = await response.json();
    return EventFactory.createEvents(data);
}

export async function unirseAEvento(eventoId: number, userId: number): Promise<void> {
    const response = await fetch(`${API_URL}/${eventoId}/unirse?userId=${userId}`, {
        method: "POST",
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al unirse al evento");
    }
}

export async function abandonarEvento(eventoId: number, userId: number): Promise<void> {
    const response = await fetch(`${API_URL}/${eventoId}/abandonar?userId=${userId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al abandonar el evento");
    }
}

export async function eliminarEvento(eventoId: number, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/${eventoId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al eliminar el evento");
    }
}
