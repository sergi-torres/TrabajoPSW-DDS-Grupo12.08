import { useState, useCallback } from 'react';
import { getDashboardData } from '../../api/votacionApi';

export const useVotacionDashboard = () => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDashboard = useCallback(async () => {
    try {
      setCargando(true);
      const result = await getDashboardData();
      setDatos(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, []);

  return { datos, cargando, error, cargarDashboard };
};

