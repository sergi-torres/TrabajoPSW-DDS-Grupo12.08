import { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export { AuthContext };

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));

    const isAuthenticated = !!token;

    /**
     * Guarda el token en el estado global y en localStorage.
     * @param {string} newToken
     */
    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    /**
     * Elimina el token del estado global y de localStorage.
     */
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    // Si el token cambia externamente (otra pestaña), sincronizamos
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === "token") {
                setToken(e.newValue);
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
