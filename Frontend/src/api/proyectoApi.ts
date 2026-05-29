import { Proyecto } from '../types';

import { API_BASE_URL } from "../config/api";
const BASE_URL = `${API_BASE_URL}/api/proyectos`;

export async function getProyectos(): Promise<Proyecto[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`Error al obtener proyectos: ${res.status}`);
    return res.json();
}

export async function getProyectoById(id: number): Promise<Proyecto> {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Proyecto no encontrado: ${res.status}`);
    return res.json();
}

export async function getProyectosByCategoria(categoriaId: number): Promise<Proyecto[]> {
    const res = await fetch(`${BASE_URL}/categoria/${categoriaId}`);
    if (!res.ok) throw new Error(`Error al obtener proyectos por categoría: ${res.status}`);
    return res.json();
}

export async function getProyectosByParticipante(id: number): Promise<Proyecto[]> {
    const res = await fetch(`${BASE_URL}/participante/${id}`);
    if (!res.ok) throw new Error(`Error al obtener proyectos por participante: ${res.status}`);
    return res.json();
}

export async function getProyectosByEvento(eventoId: number): Promise<Proyecto[]> {
    const res = await fetch(`${BASE_URL}/evento/${eventoId}`);
    if (!res.ok) throw new Error(`Error al obtener proyectos por evento: ${res.status}`);
    return res.json();
}

export async function createProyecto(proyecto: Partial<Proyecto>): Promise<Proyecto> {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proyecto),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Error al crear el proyecto: ${res.status}`);
    }
    return res.json();
}

export async function updateProyecto(id: number, proyecto: Partial<Proyecto>): Promise<Proyecto> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proyecto),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Error al actualizar el proyecto: ${res.status}`);
    }
    return res.json();
}

export async function deleteProyecto(id: number): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Error al eliminar el proyecto: ${res.status}`);
    return true;
}

/** @deprecated Use updateProyecto instead. */
export const editarProyecto = updateProyecto;