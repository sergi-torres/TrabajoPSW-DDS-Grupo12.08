import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";

const EventContext = createContext(null);

export function EventProvider({ children }) {
    const { isPublic } = useContext(AuthContext);
    
    const [eventoId, setEventoId] = useState(() => localStorage.getItem("eventoId"));
    const [eventoNombre, setEventoNombre] = useState(() => localStorage.getItem("eventoNombre"));
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem("sidebarCollapsed") === "true";
    });
    const [userRole, setUserRole] = useState(() => {
        if (isPublic) return "Público";
        const stored = localStorage.getItem("propsRol");
        return stored || "Organizador";
    });

    // Sincronizar rol cuando cambia isPublic (ej: al entrar con PIN)
    useEffect(() => {
        if (isPublic) {
            setUserRole("Público");
            setEventoId(localStorage.getItem("eventoId"));
            setEventoNombre(localStorage.getItem("eventoNombre"));
        }
    }, [isPublic]);

    const roleColors = {
        "Organizador": "var(--color-org)",
        "Participante": "#9333ea",
        "Jurado": "#ea580c",
        "Público": "#059669"
    };

    const userColor = roleColors[userRole] || roleColors["Organizador"];

    const toggleSidebar = () => {
        setIsCollapsed(prev => {
            const newValue = !prev;
            localStorage.setItem("sidebarCollapsed", newValue);
            return newValue;
        });
    };

    const setEventContext = (id, nombre, role) => {
        localStorage.setItem("eventoId", id);
        localStorage.setItem("eventoNombre", nombre);
        localStorage.setItem("propsRol", role);
        
        setEventoId(id);
        setEventoNombre(nombre);
        setUserRole(role);
    };

    const clearEventContext = () => {
        localStorage.removeItem("eventoId");
        localStorage.removeItem("eventoNombre");
        localStorage.removeItem("propsRol");
        
        setEventoId(null);
        setEventoNombre(null);
        setUserRole(isPublic ? "Público" : "Organizador");
    };

    return (
        <EventContext.Provider value={{ 
            eventoId, 
            eventoNombre, 
            userRole, 
            userColor, 
            isCollapsed,
            toggleSidebar,
            setEventContext, 
            clearEventContext 
        }}>
            {children}
        </EventContext.Provider>
    );
}

export { EventContext };
