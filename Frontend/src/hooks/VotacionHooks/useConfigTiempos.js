import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ConfigTiemposVotacion } from '../../api/configuracionesApi';

export const useConfigTiempos = () => {
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [estaGuardando, setEstaGuardando] = useState(false);

  // 1. Obtener categorías filtradas por el ID del evento
  const obtenerCategoriasPorEvento = useCallback(async (eventoId) => {
    if (!eventoId) return;
    
    setCargandoCategorias(true);
    try {
      // CORRECCIÓN: Usamos el método directamente del objeto importado
      const datos = await ConfigTiemposVotacion.obtenerPorEvento(eventoId);
      setCategorias(datos);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      toast.error("No se pudieron cargar las categorías del evento");
    } finally {
      setCargandoCategorias(false);
    }
  }, []);

  // 2. Enviar la configuración (Guardar o Desactivar)
  const guardarConfiguracion = useCallback(async (datosDto, esDesactivacion = false) => {
    setEstaGuardando(true);
    try {
      // CORRECCIÓN: Usamos el método del objeto importado
      await ConfigTiemposVotacion.guardarConfiguracion(datosDto);
      
      toast.success(esDesactivacion 
        ? "Automatización desactivada con éxito" 
        : "Configuración guardada correctamente"
      );
      return true;
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error(error.message || "Error al conectar con el servidor");
      return false;
    } finally {
      setEstaGuardando(false);
    }
  }, []);

  return {
    categorias,
    cargandoCategorias,
    estaGuardando,
    obtenerCategoriasPorEvento,
    guardarConfiguracion
  };
};