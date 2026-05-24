import { Usuario } from "../types";
import { API_BASE_URL } from "../config/api";

const AUTH_API_URL = `${API_BASE_URL}/api/Auth`;

export interface AuthResponse {
  token: string;
  userId: number;
  userName: string;
  nombreUsuario?: string;
  nombrecompleto?: string;
}

export interface PublicAuthResponse {
  sessionId: string;
}

export async function login(credentials: any): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) throw new Error("Credenciales inválidas");
  return response.json();
}

export async function loginPublic(pin: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/Eventos/join?pin=${pin}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });

  if (!response.ok) throw new Error("PIN inválido o evento finalizado");
  return response.json();
}

export async function register(data: any): Promise<any> {
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Error en el registro");
  return response.json();
}
