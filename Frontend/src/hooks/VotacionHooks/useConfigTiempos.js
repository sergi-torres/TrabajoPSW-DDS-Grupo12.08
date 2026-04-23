import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ConfigTiemposVotacion } from '../../api/configuracionesApi';

export const useConfigTiempos = () => {
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [estaGuardando, setEstaGuardando] = useState(false);

  const obtenerCategoriasPorEvento = useCallback(async (eventoId) => {
    if (!eventoId) return;
    
    setCargandoCategorias(true);
    try {
      const datos = await ConfigTiemposVotacion.obtenerPorEvento(eventoId);
      setCategorias(datos);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      toast.error("No se pudieron cargar las categorías del evento");
    } finally {
      setCargandoCategorias(false);
    }
  }, []);

  //Enviar la configuración (Guardar o Desactivar)
  const guardarConfiguracion = useCallback(async (datosDto, esDesactivacion = false) => {
    setEstaGuardando(true);
    try {
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