import React, { createContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, loginPublic as apiLoginPublic } from "../api/authApi";

export interface AuthContextType {
  token: string | null;
  userId: number | null;
  userName: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isPublic: boolean;
  login: (credentials: any) => Promise<any>;
  loginPublic: (pin: string) => Promise<any>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userId, setUserId] = useState<number | null>(
    localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : null
  );
  const [userName, setUserName] = useState<string | null>(localStorage.getItem("userName") || localStorage.getItem("nombreUsuario"));
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem("sessionId"));

  const isAuthenticated = !!token;
  const isPublic = !!sessionId && !token;

  const login = async (credentials: any) => {
    const data = await apiLogin(credentials);
    const name = data.userName || data.nombreUsuario || data.nombrecompleto || "";
    setToken(data.token);
    setUserId(data.userId);
    setUserName(name);
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId.toString());
    localStorage.setItem("userName", name);
    return data;
  };

  const loginPublic = async (pin: string) => {
    // Limpieza de sesión previa
    setToken(null);
    setUserId(null);
    setUserName(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userColor");

    const data = await apiLoginPublic(pin);
    const sid = data.sessionId || `session-${Date.now()}`;
    setSessionId(sid);
    localStorage.setItem("sessionId", sid);
    localStorage.setItem("eventoId", data.id.toString());
    localStorage.setItem("eventoNombre", data.nombre);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserName(null);
    setSessionId(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        userName,
        sessionId,
        isAuthenticated,
        isPublic,
        login,
        loginPublic,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
