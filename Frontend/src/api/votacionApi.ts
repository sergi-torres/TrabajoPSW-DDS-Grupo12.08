import { VotacionDashboardData, Voto } from '../types';

const API_URL = 'http://localhost:5245/api/votacion';

export const getDashboardData = async (
  eventoId: number, 
  idUsuario: number | null = null, 
  sessionId: string | null = null
): Promise<VotacionDashboardData> => {
  const params = new URLSearchParams({ eventoId: String(eventoId) });
  if (idUsuario !== null && idUsuario !== undefined) {
    params.append('idUsuario', String(idUsuario));
  }
  if (sessionId) {
    params.append('sessionId', String(sessionId));
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
    throw new Error('Error al enviar el voto');
  }

  return await response.json();
}

export const obtenerVotosPorProyecto = async (proyectoId: number): Promise<any[]> => {
    if (proyectoId == null) {
        throw new Error('proyectoId es obligatorio');
    }

    try {
        const response = await fetch(`/porProyecto?proyectoId=${encodeURIComponent(proyectoId)}`, {
            method: 'GET'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || 'Error al obtener votos');
        }

        return data;

    } catch (error: any) {
        console.error('Error:', error.message);
        throw error;
    }
};
