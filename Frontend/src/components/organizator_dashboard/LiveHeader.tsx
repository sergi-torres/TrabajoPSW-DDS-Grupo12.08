// src/components/dashboard/LiveHeader.tsx
import { AlertTriangle, TimerReset, Hash } from "lucide-react";

interface LiveHeaderProps {
    eventName: string;
    phase: string;
    eventCode: string;
    onExtend?: () => void;
    onClose?: () => void;
    minimal?: boolean;
}

export default function LiveHeader({ eventName, phase, eventCode, onExtend, onClose, minimal = false }: LiveHeaderProps) {
  const handleExtend = () => {
    onExtend?.();
  };

  if (minimal) {
    return (
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
          <Hash size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-emerald-200 leading-none mb-1 tracking-wider">Código Evento</span>
          <span className="text-2xl font-heading font-black tracking-widest leading-none text-white">
            {eventCode || "000000"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <header className="live-header">
      <div className="live-header__left">
        <span className="live-badge">
          <span className="live-badge__dot" />
          EN VIVO
        </span>
        <div className="live-header__titles">
          <h1 className="live-header__event">{eventName}</h1>
          <span className="live-header__sep" aria-hidden="true">|</span>
          <span className="live-header__phase">{phase}</span>
          <span className="live-header__sep" aria-hidden="true">|</span>
          <span className="live-header__code" style={{ fontWeight: 'bold', color: 'var(--color-pub)', marginLeft: '10px' }}>
             {eventCode}
          </span>
        </div>
      </div>

      <div className="live-header__right">
        <div className="live-header__actions">
          <button
            className="btn btn--secondary"
            onClick={handleExtend}
            aria-label="Extender tiempo de votación"
          >
            <TimerReset size={18} strokeWidth={2} />
            Extender Tiempo
          </button>
          <button
            className="btn btn--destructive"
            onClick={onClose}
            aria-label="Cerrar votación ahora"
          >
            <AlertTriangle size={18} strokeWidth={2} />
            Cerrar Votación Ahora
          </button>
        </div>
      </div>
    </header>
  );
}
