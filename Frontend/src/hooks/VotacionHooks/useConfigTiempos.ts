import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ConfigTiemposVotacion } from '../../api/configuracionesApi';
import { ConfiguracionCategoria, ConfiguracionTiempoDto } from '../../types';

export interface UseConfigTiemposReturn {
  categorias: ConfiguracionCategoria[];
  cargandoCategorias: boolean;
  estaGuardando: boolean;
  obtenerCategoriasPorEvento: (eventoId: number | string) => Promise<void>;
  guardarConfiguracion: (datosDto: ConfiguracionTiempoDto, esDesactivacion?: boolean) => Promise<boolean>;
}

export const useConfigTiempos = (): UseConfigTiemposReturn => {
  const [categorias, setCategorias] = useState<ConfiguracionCategoria[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [estaGuardando, setEstaGuardando] = useState(false);

  const obtenerCategoriasPorEvento = useCallback(async (eventoId: number | string) => {
    if (!eventoId) return;
    
    setCargandoCategorias(true);
    try {
      const datos = await ConfigTiemposVotacion.obtenerPorEvento(Number(eventoId));
      setCategorias(datos);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      toast.error("No se pudieron cargar las categorías del evento");
    } finally {
      setCargandoCategorias(false);
    }
  }, []);

  //Enviar la configuración (Guardar o Desactivar)
  const guardarConfiguracion = useCallback(async (datosDto: ConfiguracionTiempoDto, esDesactivacion = false) => {
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
      toast.error((error as any).message || "Error al conectar con el servidor");
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