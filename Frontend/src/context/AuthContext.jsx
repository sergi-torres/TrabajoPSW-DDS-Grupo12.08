import { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export { AuthContext };

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [userId, setUserId] = useState(() => {
        const stored = localStorage.getItem("userId");
        return stored ? parseInt(stored) : null;
    });
    const [isPublic, setIsPublic] = useState(() => {
        return localStorage.getItem("isPublic") === "true";
    });

    const isAuthenticated = !!token;

    /**
     * Guarda el token, el userId y el userName en el estado global y en localStorage.
     */
    const login = (newToken, newUserId, newUserName) => {
        // Guardar en Storage
        localStorage.setItem("token", newToken);
        localStorage.setItem("userId", newUserId);
        localStorage.setItem("userName", newUserName);
        localStorage.setItem("isPublic", "false");
        
        // Limpiar datos de sesión pública si existieran
        localStorage.removeItem("eventoId");
        localStorage.removeItem("eventoNombre");

        // Actualizar Estado Global de forma atómica
        setToken(newToken);
        setUserId(newUserId);
        setIsPublic(false);
    };

    /**
     * Inicia sesión como público (anónimo) vía PIN.
     */
    const loginPublic = (eventoId, eventoNombre) => {
        // Limpiar sesión de usuario previa totalmente
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        
        // Guardar datos de evento
        localStorage.setItem("eventoId", eventoId);
        localStorage.setItem("eventoNombre", eventoNombre);
        localStorage.setItem("isPublic", "true");

        // Actualizar Estado Global
        setToken(null);
        setUserId(null);
        setIsPublic(true);
    };

    /**
     * Elimina todos los datos de sesión.
     */
    const logout = () => {
        localStorage.clear(); // Limpieza total para seguridad
        setToken(null);
        setUserId(null);
        setIsPublic(false);
    };

    // Sincronización entre pestañas
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === "token") setToken(e.newValue);
            if (e.key === "userId") setUserId(e.newValue ? parseInt(e.newValue) : null);
            if (e.key === "isPublic") setIsPublic(e.newValue === "true");
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    return (
        <AuthContext.Provider value={{ token, userId, isAuthenticated, isPublic, login, loginPublic, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
