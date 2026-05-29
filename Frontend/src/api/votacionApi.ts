import { VotacionDashboardData, Voto } from '../types';

import { API_BASE_URL } from "../config/api";
const API_URL = `${API_BASE_URL}/api/votacion`;

export const getDashboardData = async (
  eventoId: number, 
  idUsuario: number | null = null, 
  sessionId: string | null = null,
  identificadorHash?: string
): Promise<VotacionDashboardData> => {
  const params = new URLSearchParams({ eventoId: String(eventoId) });
  if (idUsuario !== null && idUsuario !== undefined) {
    params.append('idUsuario', String(idUsuario));
  }
  if (sessionId) {
    params.append('sessionId', String(sessionId));
  }
  if (identificadorHash) {
    params.append('identificadorHash', identificadorHash);
  }

  const response = await fetch(`${API_URL}/dashboard?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Error al cargar el dashboard');
  }

  return await response.json();
};

export const enviarDatosVoto = async (votoDto: Voto): Promise<any> => {
  const response = await fetch(`${API_URL}/votar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(votoDto)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Error al enviar el voto');
  }

  return await response.json();
}

export interface VotoBatchPayload {
  eventoId: number;
  categoriaId: number;
  proyectoId: number;
  idUsuario: number | null;
  sessionId?: string | null;
  comentarioGlobal?: string;
  evaluaciones: { criterioId: number; valor: number; comentario: string }[];
}

export const enviarDatosVotoBatch = async (payload: VotoBatchPayload): Promise<any> => {
  const response = await fetch(`${API_URL}/votar/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Error al enviar la evaluación');
  }

  return await response.json();
}

export const obtenerVotosPorProyecto = async (proyectoId: number): Promise<any[]> => {
    if (proyectoId == null) {
        throw new Error('proyectoId es obligatorio');
    }

    const response = await fetch(`${API_URL}/porProyecto?proyectoId=${encodeURIComponent(proyectoId)}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error || 'Error al obtener votos');
    }

    return data;
};
