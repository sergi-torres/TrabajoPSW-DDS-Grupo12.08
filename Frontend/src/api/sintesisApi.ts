import { SintesisDto, SintesisProyecto, TipoSintesis } from "../types/sintesis";

import { API_BASE_URL } from "../config/api";
const API_BASE = `${API_BASE_URL}/api/Sintesis`;

const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

// Handles 401/403 by clearing token and redirecting to login when the session has expired.
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const data = await response.clone().json().catch(() => ({}));
            if (data.error === "token_expired" || data.error === "token_invalid" || data.error === "token_missing") {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("userName");
                if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
                    window.location.href = "/login?expired=true";
                }
            }
        }
        
        const errorText = await response.text();
        let errorMessage = "Error en la petición";
        try {
            const errorObj = JSON.parse(errorText);
            errorMessage = errorObj.error || errorObj.message || errorMessage;
        } catch {
            errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const getSintesisProyecto = async (
    idProyecto: number,
    idCategoria: number
): Promise<SintesisProyecto> => {
    const response = await fetch(
        `${API_BASE}/proyecto/${idProyecto}/categoria/${idCategoria}`,
        { headers: { ...getAuthHeader() } }
    );

    return handleResponse(response);
};

// Genera o regenera una síntesis; sobrescribe la anterior si ya existía.
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

    return handleResponse(response);
};
