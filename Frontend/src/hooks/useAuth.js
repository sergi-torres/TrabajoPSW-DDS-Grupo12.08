import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/authApi";

/**
 * Custom hook que conecta la capa API con el AuthContext.
 * Los componentes solo necesitan llamar a handleLogin / handleRegister
 * y el hook se encarga de todo lo demás (fetch, token, navegación)
 */
export function useAuth() {
    const { token, isAuthenticated, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    /**
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<boolean>} true si el login fue exitoso
     */
    const handleLogin = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            login(data.token);
            navigate("/seleccionar-rol");
            return true;
        } catch (error) {
            alert(`Error de Login: ${error.message}`);
            return false;
        }
    };

    /**
     * @param {Object} formData - Datos del formulario de registro
     * @returns {Promise<boolean>} true si el registro fue exitoso
     */
    const handleRegister = async (formData) => {
        try {
            const data = await registerUser(formData);
            login(data.token);
            alert("Registro exitoso");
            navigate("/seleccionar-rol");
            return true;
        } catch (error) {
            alert(`Error al registrar: ${error.message}`);
            return false;
        }
    };

    return {
        token,
        isAuthenticated,
        handleLogin,
        handleRegister,
        logout,
    };
}
