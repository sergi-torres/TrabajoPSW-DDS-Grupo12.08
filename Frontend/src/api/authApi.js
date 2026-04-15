const API_URL = "http://localhost:5245/api/Auth";

export async function loginUser(email, password) {
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


