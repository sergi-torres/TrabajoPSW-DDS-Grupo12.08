import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/authApi";

/**
 * Custom hook que conecta la capa API con el AuthContext.
 */
export function useAuth() {
    const { token, userId, isAuthenticated, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            login(data.token, data.userId);
            navigate("/eventos");
            return true;
        } catch (error) {
            alert(`Error de Login: ${error.message}`);
            return false;
        }
    };

    const handleRegister = async (formData) => {
        try {
            const data = await registerUser(formData);
            login(data.token, data.userId);
            alert("Registro exitoso");
            navigate("/eventos");
            return true;
        } catch (error) {
            alert(`Error al registrar: ${error.message}`);
            return false;
        }
    };

    return {
        token,
        userId,
        isAuthenticated,
        handleLogin,
        handleRegister,
        logout,
    };
}
