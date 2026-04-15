import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/authApi";
import { toast } from "sonner";

/**
 * Custom hook que conecta la capa API con el AuthContext.
 */
export function useAuth() {
    const { token, userId, userName, isAuthenticated, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            login(data.token, data.userId, data.nombreUsuario);
            toast.success("¡Bienvenido/a a Votify!");
            navigate("/eventos");
            return true;
        } catch (error) {
            toast.error("Error al iniciar sesión", { description: error.message });
            return false;
        }
    };

    const handleRegister = async (formData) => {
        try {
            const data = await registerUser(formData);
            login(data.token, data.userId, data.nombreUsuario);
            toast.success("Cuenta creada exitosamente", { description: "¡Bienvenido/a a Votify!" });
            navigate("/eventos");
            return true;
        } catch (error) {
            toast.error("Error al registrar la cuenta", { description: error.message });
            return false;
        }
    };

    return {
        token,
        userId,
        userName,
        isAuthenticated,
        handleLogin,
        handleRegister,
        logout,
    };
}
