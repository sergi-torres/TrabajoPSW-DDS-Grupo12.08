const API_URL = "http://localhost:5245/api/Jurado";

export const getJuradosEvento = async (idEvento) => {
    const response = await fetch(`${API_URL}/evento/${idEvento}`);
    if (!response.ok) {
        throw new Error("Error al obtener jurados");
    }
    return await response.json();
};

export const asignarJurado = async (idEvento, email) => {
    const response = await fetch(`${API_URL}/asignar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ idEvento, email }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al asignar jurado");
    }
    return await response.json();
};

export const eliminarJurado = async (idEvento, idUsuario) => {
    const response = await fetch(`${API_URL}/evento/${idEvento}/usuario/${idUsuario}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Error al eliminar jurado");
    }
    return await response.json();
};
