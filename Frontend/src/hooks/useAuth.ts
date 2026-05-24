import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login, register } from "../api/authApi";
import { toast } from "sonner";

export const useAuth = (onSuccess?: (path: string) => void) => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { login: contextLogin, logout, isAuthenticated, isPublic, userId, userName, loginPublic: contextLoginPublic } = context;

  const doNavigate = (path: string) => {
    if (onSuccess) {
      onSuccess(path);
    } else {
      navigate(path);
    }
  };

  const handleLogin = async (credentials: any) => {
    try {
      await contextLogin(credentials);
      toast.success("¡Bienvenido!");
      doNavigate("/eventos");
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
      throw error;
    }
  };

  const handleRegister = async (data: any) => {
    try {
      await register(data);
      toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
      doNavigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Error en el registro");
      throw error;
    }
  };

  const handleLoginPublic = async (pin: string) => {
    try {
      await contextLoginPublic(pin);
      toast.success("Acceso como público concedido");
      navigate("/dashboard-publico");
    } catch (error: any) {
      toast.error(error.message || "Error al acceder como público");
      throw error;
    }
  };

  return {
    isAuthenticated,
    isPublic,
    userId,
    userName,
    login: handleLogin,
    register: handleRegister,
    loginPublic: handleLoginPublic,
    logout,
  };
};
