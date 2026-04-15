//Aqui estaran los fecth (pedir datos del backend) relacionados con la votacion.

const API_URL = 'http://localhost:5245/api/votacion';

export const getDashboardData = async (eventoId, idUsuario = null, sessionId = null) => {
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

export const enviarDatosVoto = async (votoDto) => {

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
