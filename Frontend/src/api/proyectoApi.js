const BASE_URL = "http://localhost:5245/api/proyectos";

// Obtener todos los proyectos
export async function getProyectos() {
    try {
        const res = await fetch(BASE_URL);

        if (!res.ok) {
            throw new Error(`Error al obtener proyectos: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error en getProyectos:", error);
        throw error;
    }
}

// Obtener proyecto por ID
export async function getProyectoById(id) {
    try {
        const res = await fetch(`${BASE_URL}/${id}`);

        if (!res.ok) {
            throw new Error(`Proyecto no encontrado: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error en getProyectoById:", error);
        throw error;
    }
}

// Obtener proyectos por categoría
export async function getProyectosByCategoria(categoriaId) {
    try {
        const res = await fetch(`${BASE_URL}/categoria/${categoriaId}`);

        if (!res.ok) {
            throw new Error(`Error al obtener proyectos por categoría: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error en getProyectosByCategoria:", error);
        throw error;
    }
}

// Obtener proyectos por participante
export async function getProyectosByParticipante(id) {
    try {
        // Prueba con diferentes formatos de URL según tu backend
        // Opción 1: /participante/{id}
        // Opción 2: /participante/{id}/proyectos  
        // Opción 3: ?participanteId={id}
        
        const res = await fetch(`${BASE_URL}/participante/${id}`);
        
        // Si da 404, probar con otra URL
        // const res = await fetch(`${BASE_URL}?participanteId=${id}`);
        // const res = await fetch(`${BASE_URL}/participante/${id}/proyectos`);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error response:", errorText);
            throw new Error(`Error al obtener proyectos por participante: ${res.status}`);
        }

        const data = await res.json();
        console.log("Proyectos del participante:", data);
        return data;
    } catch (error) {
        console.error("Error en getProyectosByParticipante:", error);
        throw error;
    }
}

// Obtener proyectos por evento
export async function getProyectosByEvento(eventoId) {
    try {
        const res = await fetch(`${BASE_URL}/evento/${eventoId}`);

        if (!res.ok) {
            throw new Error(`Error al obtener proyectos por evento: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error en getProyectosByEvento:", error);
        throw error;
    }
}

// Crear nuevo proyecto
export async function createProyecto(proyecto) {
    try {
        console.log("Enviando proyecto:", proyecto);
        
        const res = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(proyecto)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error response:", errorText);
            throw new Error(errorText || `Error al crear el proyecto: ${res.status}`);
        }

        const data = await res.json();
        console.log("Proyecto creado respuesta:", data);
        return data;
    } catch (error) {
        console.error("Error en createProyecto:", error);
        throw error;
    }
}

// Actualizar proyecto
export async function updateProyecto(id, proyecto) {
    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(proyecto)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || `Error al actualizar el proyecto: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error en updateProyecto:", error);
        throw error;
    }
}

// Eliminar proyecto
export async function deleteProyecto(id) {
    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            throw new Error(`Error al eliminar el proyecto: ${res.status}`);
        }

        return true;
    } catch (error) {
        console.error("Error en deleteProyecto:", error);
        throw error;
    }
}
