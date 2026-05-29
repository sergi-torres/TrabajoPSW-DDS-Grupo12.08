import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ConfigTiemposVotacion } from '../../api/configuracionesApi';
import { ConfiguracionCategoria, ConfiguracionTiempoDto } from '../../types';

export interface UseConfigTiemposReturn {
  categorias: ConfiguracionCategoria[];
  cargandoCategorias: boolean;
  estaGuardando: boolean;
  obtenerCategoriasPorEvento: (eventoId: number | string) => Promise<void>;
  obtenerCategoriasControl: (eventoId: number | string) => Promise<void>;
  guardarConfiguracion: (datosDto: ConfiguracionTiempoDto, esDesactivacion?: boolean) => Promise<boolean>;
  actualizarLimiteVotos: (eventoId: number | string, votosMaximos: number, categoriaId?: number) => Promise<boolean>;
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
    } catch {
      toast.error("No se pudieron cargar las categorías del evento");
    } finally {
      setCargandoCategorias(false);
    }
  }, []);

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
      toast.error(error instanceof Error ? error.message : "Error al conectar con el servidor");
      return false;
    } finally {
      setEstaGuardando(false);
    }
  }, []);

  const obtenerCategoriasControl = useCallback(async (eventoId: number | string) => {
    if (!eventoId) return;
    setCargandoCategorias(true);
    try {
      const datos = await ConfigTiemposVotacion.obtenerParaControl(Number(eventoId));
      setCategorias(datos);
    } catch {
      toast.error("No se pudieron cargar las categorías del evento");
    } finally {
      setCargandoCategorias(false);
    }
  }, []);

  const actualizarLimiteVotos = useCallback(async (eventoId: number | string, votosMaximos: number, categoriaId?: number) => {
    setEstaGuardando(true);
    try {
      await ConfigTiemposVotacion.actualizarLimiteVotos(Number(eventoId), votosMaximos, categoriaId);
      toast.success("Límite de votos actualizado correctamente");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al conectar con el servidor");
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
    obtenerCategoriasControl,
    guardarConfiguracion,
    actualizarLimiteVotos
  };
};