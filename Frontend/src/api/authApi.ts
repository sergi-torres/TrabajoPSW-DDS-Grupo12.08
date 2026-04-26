import { Usuario } from "../types";

const API_URL = "http://localhost:5245/api/Auth";

export interface AuthResponse {
  token: string;
  userId: number;
  userName: string;
}

export interface PublicAuthResponse {
  sessionId: string;
}

export async function login(credentials: any): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) throw new Error("Credenciales inválidas");
  return response.json();
}

export async function loginPublic(pin: string): Promise<PublicAuthResponse> {
  const response = await fetch(`${API_URL}/login-public?pin=${pin}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("PIN inválido");
  return response.json();
}

export async function register(data: any): Promise<any> {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Error en el registro");
  return response.json();
}
