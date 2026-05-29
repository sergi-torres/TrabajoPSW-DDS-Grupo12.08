import { useState, useCallback, useEffect } from 'react';
import { getDashboardData } from '../../api/votacionApi';
import { VotacionDashboardData } from '../../types';
import { useFingerprint } from '../useFingerprint';

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
  const { fingerprint, isLoading: fpLoading } = useFingerprint();

  const cargarDashboard = useCallback(async () => {
    if (fpLoading) return;

    try {
      setCargando(true);
      // Auth values are read from localStorage here because this hook is instantiated
      // on the public voting dashboard (no AuthContext available in that subtree).
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
        sessionId || null,
        fingerprint || undefined
      );
      setDatos(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, [fingerprint, fpLoading]);

  useEffect(() => {
    if (!fpLoading) {
      cargarDashboard();
    }
  }, [fpLoading, cargarDashboard]);

  return { datos, cargando: cargando || fpLoading, error, cargarDashboard };
};
