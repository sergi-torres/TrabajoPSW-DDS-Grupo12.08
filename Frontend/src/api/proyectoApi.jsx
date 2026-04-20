const BASE_URL = "http://localhost:5245/api/proyecto";

// Obtener todos los proyectos
export async function getProyectos() {
    const res = await fetch(BASE_URL);

    if (!res.ok) {
        throw new Error("Error al obtener proyectos");
    }

    return await res.json();
}

// Obtener proyecto por ID
export async function getProyectoById(id) {
    const res = await fetch(`${BASE_URL}/${id}`);

    if (!res.ok) {
        throw new Error("Proyecto no encontrado");
    }

    return await res.json();
}

// Obtener proyectos por categoría
export async function getProyectosByCategoria(categoriaId) {
    const res = await fetch(`${BASE_URL}/categoria/${categoriaId}`);

    if (!res.ok) {
        throw new Error("Error al obtener proyectos por categoría");
    }

    return await res.json();
}

// Obtener proyectos por participante
export async function getProyectosByParticipante(id) {
    const res = await fetch(`${BASE_URL}/participante/${id}`);

    if (!res.ok) {
        throw new Error("Error al obtener proyectos por participante");
    }

    return await res.json();
}

// Obtener proyectos por evento
export async function getProyectosByEvento(eventoId) {
    const res = await fetch(`${BASE_URL}/evento/${eventoId}`);

    if (!res.ok) {
        throw new Error("Error al obtener proyectos por evento");
    }

    return await res.json();
}