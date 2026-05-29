import { Jurado, AsignarJuradoRequest, ReenviarInvitacionRequest } from '../types';

import { API_BASE_URL } from "../config/api";
const API_URL = `${API_BASE_URL}/api/Jurado`;

const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const getJuradosEvento = async (idEvento: number): Promise<Jurado[]> => {
    const response = await fetch(`${API_URL}/evento/${idEvento}`, {
        headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error("Error al obtener jurados");
    return await response.json();
};

export const asignarJurado = async (idEvento: number, email: string, customMessage: string | null = null): Promise<any> => {
    const body: AsignarJuradoRequest = { idEvento, email, customMessage };
    const response = await fetch(`${API_URL}/asignar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al asignar jurado");
    }
    return await response.json();
};

export const reenviarInvitacion = async (idEvento: number, email: string): Promise<any> => {
    const body: ReenviarInvitacionRequest = { idEvento, email };
    const response = await fetch(`${API_URL}/reenviar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al reenviar invitacion");
    }
    return await response.json();
};

export const eliminarJurado = async (idEvento: number, idUsuario: number): Promise<any> => {
    const response = await fetch(`${API_URL}/evento/${idEvento}/usuario/${idUsuario}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error("Error al eliminar jurado");
    return await response.json();
};
