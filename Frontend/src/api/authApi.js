/**
 * authApi.js
 * 
 * Capa de red para autenticación.
 * Este es el ÚNICO archivo del frontend que conoce la URL del backend.
 * Exporta funciones puras que devuelven datos o lanzan errores.
 */

const API_URL = "http://localhost:5245/api/Auth";

/**
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{token: string}>} Token JWT
 * @throws {Error} Si las credenciales son incorrectas o el servidor no responde
 */
export async function loginUser(email, password) {

    localStorage.setItem("email", email);

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Credenciales incorrectas");
    }

    return response.json();
}

/**
 * Registra un nuevo usuario.
 * @param {Object} data
 * @param {string} data.nombreCompleto
 * @param {string} data.nombreUsuario
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} [data.rol="Organizador"] - Rol inicial (requerido por UsuarioFactory.cs)
 * @returns {Promise<{token: string}>} Token JWT de Supabase
 * @throws {Error} Si el registro falla
 */
export async function registerUser({ nombreCompleto, nombreUsuario, email, password, rol = "Organizador" }) {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreCompleto, nombreUsuario, email, password, rol }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al registrar");
    }

    return response.json();
}

export const authApi = {
    login: loginUser,
    register: registerUser
};


