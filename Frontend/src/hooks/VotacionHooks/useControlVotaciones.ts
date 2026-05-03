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
      // Normalizamos para evitar líos de id/Id o estado/Estado
      const normalized = data.map((c: any) => ({
        id: c.id || c.Id || c.categoriaId || c.CategoriaId,
        nombre: c.nombre || c.Nombre,
        estado: c.estado || c.Estado || "Pendiente",
        fechaIni: c.fechaIni || c.FechaIni,
        fechaFin: c.fechaFin || c.FechaFin,
      }));
      setCategorias(normalized);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      toast.error("No se pudieron cargar las categorías");
    } finally {
      setCargando(false);
    }
  }, []);

  const cambiarEstado = useCallback(async (categoriaId: number, nuevoEstado: string) => {
    try {
      await ConfigTiemposVotacion.actualizarEstadoCategoria(categoriaId, nuevoEstado);
      setCategorias(prev => 
        prev.map(c => (c.id === categoriaId) ? { ...c, estado: nuevoEstado } : c)
      );
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      return true;
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error al actualizar el estado");
      return false;
    }
  }, []);

  const actualizarTiempos = useCallback(async (dto: any) => {
    try {
      await ConfigTiemposVotacion.guardarConfiguracion(dto);
      if (dto.EventoId) await cargarCategorias(dto.EventoId);
      return true;
    } catch (error) {
      console.error("Error al actualizar tiempos:", error);
      toast.error("Error al actualizar tiempos");
      return false;
    }
  }, [cargarCategorias]);

  return {
    categorias,
    cargando,
    cargarCategorias,
    cambiarEstado,
    actualizarTiempos
  };
};
