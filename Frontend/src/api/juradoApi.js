const API_URL = "http://localhost:5245/api/Jurado";

// Helper para obtener el token del localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const getJuradosEvento = async (idEvento) => {
    const response = await fetch(`${API_URL}/evento/${idEvento}`, {
        headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error("Error al obtener jurados");
    return await response.json();
};

export const asignarJurado = async (idEvento, email, customMessage = null) => {
    const response = await fetch(`${API_URL}/asignar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify({ idEvento, email, customMessage }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al asignar jurado");
    }
    return await response.json();
};

export const reenviarInvitacion = async (idEvento, email) => {
    const response = await fetch(`${API_URL}/reenviar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify({ idEvento, email }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al reenviar invitacion");
    }
    return await response.json();
};

export const eliminarJurado = async (idEvento, idUsuario) => {
    const response = await fetch(`${API_URL}/evento/${idEvento}/usuario/${idUsuario}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error("Error al eliminar jurado");
    return await response.json();
};
