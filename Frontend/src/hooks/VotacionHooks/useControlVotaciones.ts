import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { ConfigTiemposVotacion } from '../../api/configuracionesApi';
import { useVoting } from "../../context/VotingContext";

export const useControlVotaciones = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const peticionesEnCurso = useRef<Set<string>>(new Set());
  const { addNotification } = useVoting();

  const cargarCategorias = useCallback(async (eventoId: number) => {
    setCargando(true);
    try {
      const data = await ConfigTiemposVotacion.obtenerParaControl(eventoId);
      // Backend can return either camelCase or PascalCase depending on the endpoint version
      const normalized = data.map((c: any) => ({
        id: c.id || c.Id || c.categoriaId || c.CategoriaId,
        nombre: c.nombre || c.Nombre,
        estado: c.estado || c.Estado || "Pendiente",
        fechaIni: c.fechaIni || c.FechaIni,
        fechaFin: c.fechaFin || c.FechaFin,
      }));
      setCategorias(normalized);
    } catch {
      toast.error("No se pudieron cargar las categorías");
    } finally {
      setCargando(false);
    }
  }, []);

  const cambiarEstado = useCallback(async (categoriaId: number, nuevoEstado: string, silent: boolean = false) => {

    const nombreCategoria = categorias.find(c => c.id === categoriaId)?.nombre || "Categoría";

    const key = `${categoriaId}-${nuevoEstado}`;
    if (peticionesEnCurso.current.has(key)) return true;

    peticionesEnCurso.current.add(key);
    try {
      await ConfigTiemposVotacion.actualizarEstadoCategoria(categoriaId, nuevoEstado);
      setCategorias(prev => {
        const cat = prev.find(c => c.id === categoriaId);
        if (cat && cat.estado === nuevoEstado) return prev; // Avoid duplicate state updates
        return prev.map(c => (c.id === categoriaId) ? { ...c, estado: nuevoEstado } : c);

      });
      if (!silent) {
        toast.success(`Estado actualizado a ${nuevoEstado}`);
      }

      addNotification("category_changed", nombreCategoria);

      return true;
    } catch {
      if (!silent) {
        toast.error("Error al actualizar el estado");
      }

      return false;
    } finally {
      // Small delay before releasing the lock so that rapid re-triggers (e.g. useEffect loops)
      // cannot re-enter the same state transition immediately.
      setTimeout(() => {
        peticionesEnCurso.current.delete(key);
      }, 1000);
    }
  }, []);

  const actualizarTiempos = useCallback(async (dto: any) => {
    try {
      await ConfigTiemposVotacion.guardarConfiguracion(dto);
      if (dto.EventoId) await cargarCategorias(dto.EventoId);
      return true;
    } catch {
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
