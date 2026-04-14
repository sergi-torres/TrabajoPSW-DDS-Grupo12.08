// src/components/dashboard/LiveHeader.jsx
import { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle, TimerReset } from "lucide-react";

const INITIAL_SECONDS = 0; // mock: tiempo agotado

export default function LiveHeader({ eventName, phase, onExtend, onClose }) {
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
