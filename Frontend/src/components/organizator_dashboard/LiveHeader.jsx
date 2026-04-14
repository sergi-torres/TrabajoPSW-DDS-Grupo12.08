// src/components/dashboard/LiveHeader.jsx
import { useState, useEffect } from "react";
import { Clock, AlertTriangle, TimerReset } from "lucide-react";

const INITIAL_SECONDS = 0; // mock: tiempo agotado

export default function LiveHeader({ eventName, phase, onExtend, onClose, minimal = false }) {
  const [seconds, setSeconds] = useState(INITIAL_SECONDS);
  const [running, setRunning] = useState(false); // mock: parado

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, seconds]);

  const pad = (n) => String(n).padStart(2, "0");
  const hh = pad(Math.floor(seconds / 3600));
  const mm = pad(Math.floor((seconds % 3600) / 60));
  const ss = pad(seconds % 60);

  const handleExtend = () => {
    setSeconds((s) => s + 10 * 60); // añade 10 min
    setRunning(true);
    onExtend?.();
  };

  if (minimal) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div className="flex items-center gap-3 border-r border-white/20 pr-6 mr-2 last:border-0 last:mr-0 last:pr-0">
          <Clock size={20} className="text-blue-200" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-blue-200 leading-none mb-1">Tiempo Restante</span>
            <span className="text-2xl font-heading font-bold tabular-nums leading-none">
              {hh}:{mm}:{ss}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExtend}
            className="p-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors shadow-sm active:scale-95"
            title="Extender Tiempo"
          >
            <TimerReset size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm active:scale-95"
            title="Cerrar Votación"
          >
            <AlertTriangle size={20} strokeWidth={2.5} />
          </button>
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
        </div>
      </div>

      <div className="live-header__right">
        <div className="live-timer" aria-label="Tiempo restante">
          <Clock size={22} strokeWidth={1.75} />
          <span className="live-timer__digits">
            {hh}<span className="live-timer__colon">:</span>
            {mm}<span className="live-timer__colon">:</span>
            {ss}
          </span>
          <span className="live-timer__label">restantes</span>
        </div>

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
