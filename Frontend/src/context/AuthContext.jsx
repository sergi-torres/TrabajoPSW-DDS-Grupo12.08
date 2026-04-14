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
        localStorage.setItem("token", newToken);
        localStorage.setItem("userId", newUserId);
        localStorage.setItem("userName", newUserName);
        localStorage.setItem("isPublic", "false");
        setUserId(newUserId);
        setIsPublic(false);
    };

    /**
     * Inicia sesión como público (anónimo) vía PIN.
     */
    const loginPublic = (eventoId, eventoNombre) => {
        localStorage.setItem("eventoId", eventoId);
        localStorage.setItem("eventoNombre", eventoNombre);
        localStorage.setItem("isPublic", "true");
        setIsPublic(true);
    };

    /**
     * Elimina el token y userId del estado global y de localStorage.
     */
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("isPublic");
        localStorage.removeItem("eventoId");
        localStorage.removeItem("eventoNombre");
        setToken(null);
        setUserId(null);
        setIsPublic(false);
    };

    // Si el token cambia externamente (otra pestaña), sincronizamos
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
