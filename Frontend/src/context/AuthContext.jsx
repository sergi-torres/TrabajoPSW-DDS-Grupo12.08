import { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export { AuthContext };

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [userId, setUserId] = useState(() => {
        const stored = localStorage.getItem("userId");
        return stored ? parseInt(stored) : null;
    });

    const isAuthenticated = !!token;

    /**
     * Guarda el token y el userId en el estado global y en localStorage.
     */
    const login = (newToken, newUserId) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("userId", newUserId);
        setToken(newToken);
        setUserId(newUserId);
    };

    /**
     * Elimina el token y userId del estado global y de localStorage.
     */
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setToken(null);
        setUserId(null);
    };

    // Si el token cambia externamente (otra pestaña), sincronizamos
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === "token") setToken(e.newValue);
            if (e.key === "userId") setUserId(e.newValue ? parseInt(e.newValue) : null);
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    return (
        <AuthContext.Provider value={{ token, userId, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
