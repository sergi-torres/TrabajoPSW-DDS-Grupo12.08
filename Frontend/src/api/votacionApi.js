//Aqui estaran los fecth (pedir datos del backend) relacionados con la votacion.

const API_URL = 'http://localhost:5245/api/votacion';

export const getDashboardData = async () => {

  const response = await fetch(`${API_URL}/dashboard`);

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
