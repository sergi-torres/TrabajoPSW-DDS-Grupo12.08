import React, { useState } from 'react';
import { Play, Pause, CheckCircle2, Timer, Settings } from 'lucide-react';
import { cn } from '../../ui/utils';
import { ConfirmModal } from '../../layout/ConfirmModal';

interface OpcionesBarProps {
  categoria: {
    id: number;
    nombre: string;
    estado: string;
    fechaIni: string | null;
    fechaFin: string | null;
  } | null;
  onCambiarEstado: (id: number, nuevoEstado: string, silent?: boolean) => Promise<boolean>;
  onActualizarTiempo: (dto: any) => Promise<boolean>;
}

export default function OpcionesBar({ categoria, onCambiarEstado, onActualizarTiempo }: OpcionesBarProps) {
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  if (!categoria) {
    return (
      <div className="bg-blue-600 rounded-3xl p-6 shadow-lg shadow-blue-100 flex items-center justify-center border-2 border-white/20 border-dashed">
        <p className="text-white/80 font-medium flex items-center gap-2">
          <Settings className="animate-spin-slow" size={20} />
          Selecciona una categoría para ver las opciones de control
        </p>
      </div>
    );
  }

  const { id: categoriaId, nombre, estado, fechaIni, fechaFin } = categoria;
  const isActiva = estado === "Activa";
  const isPausada = estado === "Pausada";
  const isPendiente = estado === "Pendiente";
  const isFinalizada = estado === "Finalizada";

  const getFechaActualLocal = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleActivar = async () => {
    const nowStr = getFechaActualLocal();
    const start = fechaIni ? new Date(fechaIni) : null;
    const now = new Date();
    
    // Si la categoría no tiene horas, o tiene inicio futuro, actualizamos inicio a "ahora"
    if (!fechaIni || (start && start > now)) {
        await onActualizarTiempo({
            CategoriaId: categoriaId,
            Nombre: nombre,
            FechaIni: nowStr,
            FechaFin: fechaFin // Mantenemos el fin si existe, si no irá null (y el backend decidirá o se quedará null)
        });
    }
    
    await onCambiarEstado(categoriaId, "Activa");
  };

  const handleFinalizar = async () => {
    const nowStr = getFechaActualLocal();
    
    // Al finalizar, guardamos la hora actual como FechaFin (y FechaIni si no tenía)
    // Esto asegura que quede registrado cuándo se cerró realmente.
    await onActualizarTiempo({
        CategoriaId: categoriaId,
        Nombre: nombre,
        FechaIni: fechaIni || nowStr,
        FechaFin: nowStr
    });

    await onCambiarEstado(categoriaId, "Finalizada");
    setShowConfirmFinish(false);
  };

  return (
    <div className="bg-blue-600 rounded-[32px] p-6 shadow-xl shadow-blue-100 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-inner">
            <Timer size={24} />
          </div>
          <div>
            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Control de categoría</span>
            <h4 className="text-white font-bold text-lg leading-tight">{nombre}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isFinalizada && (
            <>
              {(isPendiente || isPausada) && (
                <button 
                  onClick={handleActivar}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-blue-900/10"
                >
                  <Play size={18} fill="currentColor" />
                  {isPausada ? "Reanudar" : "Activar Ahora"}
                </button>
              )}
              
              {isActiva && (
                <button 
                  onClick={() => onCambiarEstado(categoriaId, "Pausada")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 text-white font-bold hover:bg-amber-300 transition-all active:scale-95 shadow-lg shadow-blue-900/10"
                >
                  <Pause size={18} fill="currentColor" />
                  Pausar Votación
                </button>
              )}

              <button 
                onClick={() => setShowConfirmFinish(true)}
                disabled={isPendiente}
                className={cn(
                  "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95",
                  isPendiente 
                    ? "bg-blue-800/50 text-white/50 cursor-not-allowed border border-white/10" 
                    : "bg-blue-700 text-white border border-white/20 hover:bg-blue-800 shadow-lg shadow-blue-900/20"
                )}
                title={isPendiente ? "Debes activar la categoría antes de poder finalizarla" : ""}
              >
                <CheckCircle2 size={18} />
                Finalizar
              </button>
            </>
          )}

          {isFinalizada && (
            <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 text-white font-bold flex items-center gap-2">
              <CheckCircle2 size={18} />
              Categoría Finalizada
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmFinish}
        danger
        title="¿Estás seguro?"
        message={
          <>
            Al finalizar la categoría <strong>no podrás volver a abrirla</strong>. Se cerrará el acceso a votos para todos los usuarios.
          </>
        }
        confirmLabel="Sí, finalizar permanentemente"
        cancelLabel="No, mantener activa"
        onConfirm={handleFinalizar}
        onCancel={() => setShowConfirmFinish(false)}
      />
    </div>
  );
}
