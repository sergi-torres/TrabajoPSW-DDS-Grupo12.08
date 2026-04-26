import { useState, useCallback } from 'react';
import { getDashboardData } from '../../api/votacionApi';
import { VotacionDashboardData } from '../../types';

export interface UseVotacionDashboardReturn {
  datos: VotacionDashboardData | null;
  cargando: boolean;
  error: string | null;
  cargarDashboard: () => Promise<void>;
}

export const useVotacionDashboard = (): UseVotacionDashboardReturn => {
  const [datos, setDatos] = useState<VotacionDashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDashboard = useCallback(async () => {
    try {
      setCargando(true);
      const eventoId = localStorage.getItem('eventoId');
      const userIdRaw = localStorage.getItem('userId');
      const idUsuario = userIdRaw ? parseInt(userIdRaw) : null;
      const sessionId = localStorage.getItem('votacionSessionId');
      
      if (!eventoId) {
        throw new Error('evento ID no encontrado');
      }

      const result = await getDashboardData(
        Number(eventoId),
        (idUsuario !== null && !Number.isNaN(idUsuario)) ? idUsuario : null,
        sessionId || null
      );
      setDatos(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError((err as any).message || "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, []);

  return { datos, cargando, error, cargarDashboard };
};
