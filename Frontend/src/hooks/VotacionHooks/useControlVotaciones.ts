import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ConfigTiemposVotacion } from '../../api/configuracionesApi';

export const useControlVotaciones = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarCategorias = useCallback(async (eventoId: number) => {
    setCargando(true);
    try {
      const data = await ConfigTiemposVotacion.obtenerParaControl(eventoId);
      setCategorias(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      toast.error("No se pudieron cargar las categorías");
    } finally {
      setCargando(false);
    }
  }, []);

  const cambiarEstado = async (categoriaId: number, nuevoEstado: string) => {
    try {
      await ConfigTiemposVotacion.actualizarEstadoCategoria(categoriaId, nuevoEstado);
      setCategorias(prev => 
        prev.map(c => (c.categoriaId === categoriaId || c.CategoriaId === categoriaId || c.id === categoriaId || c.Id === categoriaId)
          ? { ...c, estado: nuevoEstado, Estado: nuevoEstado } 
          : c
        )
      );
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      return true;
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error al actualizar el estado");
      return false;
    }
  };

  const actualizarTiempos = async (dto: any) => {
    try {
      await ConfigTiemposVotacion.guardarConfiguracion(dto);
      // Al actualizar tiempos, el backend puede cambiar el estado a Activa si ya empezó
      // Refrescamos para tener la info sincronizada
      if (dto.EventoId) cargarCategorias(dto.EventoId);
      return true;
    } catch (error) {
      console.error("Error al actualizar tiempos:", error);
      toast.error("Error al actualizar tiempos");
      return false;
    }
  };

  return {
    categorias,
    cargando,
    cargarCategorias,
    cambiarEstado,
    actualizarTiempos
  };
};
