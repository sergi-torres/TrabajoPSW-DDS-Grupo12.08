import { SintesisDto, SintesisProyecto, TipoSintesis } from "../types/sintesis";

const API_BASE = "http://localhost:5245/api/Sintesis";

// Helper para inyectar el JWT del usuario autenticado.
const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

/**
 * Obtiene las síntesis (jurado y público) ya persistidas para un proyecto en una categoría.
 * Si no hay síntesis aún, devuelve `{ jurado: null, publico: null }`.
 */
export const getSintesisProyecto = async (
    idProyecto: number,
    idCategoria: number
): Promise<SintesisProyecto> => {
    const response = await fetch(
        `${API_BASE}/proyecto/${idProyecto}/categoria/${idCategoria}`,
        { headers: { ...getAuthHeader() } }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al obtener la síntesis del proyecto");
    }

    return await response.json();
};

/**
 * Genera (o regenera) una síntesis de comentarios para el proyecto+categoría
 * en el tipo solicitado. Sobrescribe la síntesis previa si existía.
 */
export const generarSintesis = async (
    idProyecto: number,
    idCategoria: number,
    tipo: TipoSintesis
): Promise<SintesisDto> => {
    const response = await fetch(
        `${API_BASE}/proyecto/${idProyecto}/categoria/${idCategoria}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify({ tipo }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al generar la síntesis");
    }

    return await response.json();
};
