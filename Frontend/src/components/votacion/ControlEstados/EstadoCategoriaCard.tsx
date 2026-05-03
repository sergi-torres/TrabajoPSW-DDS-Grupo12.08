import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { cn } from '../../ui/utils';

interface EstadoCategoriaCardProps {
    categoria: {
        categoriaId: number;
        nombre: string;
        fechaIni: string | null;
        fechaFin: string | null;
        estado: string;
    };
    onCambiarEstado: (id: number, nuevoEstado: string) => Promise<boolean>;
    isSelected: boolean;
    onSelect: () => void;
}

export default function EstadoCategoriaCard({ 
    categoria, 
    onCambiarEstado, 
    isSelected,
    onSelect
}: EstadoCategoriaCardProps) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    const { categoriaId, nombre, fechaIni, fechaFin, estado } = categoria;

    // Lógica de Countdown
    useEffect(() => {
        // Si no hay fecha de fin o está finalizada, no hay countdown
        if (!fechaFin || estado === "Finalizada") {
            setTimeLeft("");
            return;
        }

        const nowTime = new Date().getTime();
        const startTime = fechaIni ? new Date(fechaIni).getTime() : null;
        
        // Si es Pendiente y hay fechaIni futura, no hay countdown real (mostramos estático)
        if (estado === "Pendiente" && startTime && nowTime < startTime) {
            setTimeLeft(""); 
            return;
        }

        // El countdown solo corre si está Activa o Pausada
            const calculateTime = () => {
                const now = new Date().getTime();
                const end = new Date(fechaFin).getTime();
                const diff = end - now;

                if (diff <= 0) {
                    setTimeLeft("00:00:00");
                    if (estado === "Activa" || estado === "Pausada") {
                        onCambiarEstado(categoriaId, "Finalizada");
                    }
                    return false;
                } else {
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeLeft(
                        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                    );
                    return true;
                }
            };

            // Cálculo inicial inmediato
            calculateTime();

            const timer = setInterval(() => {
                if (!calculateTime()) {
                    clearInterval(timer);
                }
            }, 1000);

        return () => clearInterval(timer);
    }, [fechaFin, fechaIni, estado, categoriaId, onCambiarEstado]);

    const isFinalizada = estado === "Finalizada";
    const isPausada = estado === "Pausada";
    const isActiva = estado === "Activa";
    const isPendiente = estado === "Pendiente";

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const showStaticTime = isPendiente && fechaIni && (new Date(fechaIni).getTime() > new Date().getTime());

    return (
        <div 
            onClick={() => !isFinalizada && onSelect()}
            className={cn(
                "relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer group flex flex-col h-full",
                isSelected ? "border-orange-500 shadow-orange-100 shadow-xl" : "border-gray-100 hover:border-orange-200",
                isFinalizada && "opacity-75 cursor-not-allowed"
            )}
        >
            {/* Badge de Estado */}
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    isActiva && "bg-green-100 text-green-600",
                    isPausada && "bg-amber-100 text-amber-600",
                    isPendiente && "bg-blue-100 text-blue-600",
                    isFinalizada && "bg-gray-100 text-gray-500"
                )}>
                    {estado}
                </div>
                {isActiva && <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-orange-600 transition-colors">
                {nombre}
            </h3>

            {/* Info Horas */}
            <div className="space-y-3 mb-6">
                {!fechaIni && !fechaFin ? (
                    <div className="flex items-center gap-2 text-gray-400 bg-gray-50 p-3 rounded-xl">
                        <Clock size={16} />
                        <span className="text-xs font-medium">Sin horas prefijadas</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {fechaIni && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={14} className="text-orange-400" />
                                <span className="text-[11px] font-medium">Inicia: {formatDate(fechaIni)}</span>
                            </div>
                        )}
                        {fechaFin && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Timer size={14} className="text-red-400" />
                                <span className="text-[11px] font-medium">Finaliza: {formatDate(fechaFin)}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Countdown o Tiempo Estático */}
            {(fechaFin || showStaticTime) && !isFinalizada && (
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                {showStaticTime ? "Tiempo previsto:" : "Cierre en:"}
                            </span>
                            <span className={cn(
                                "font-mono font-bold text-lg",
                                (isActiva || isPausada) ? "text-orange-600" : "text-gray-400"
                            )}>
                                {showStaticTime ? (
                                    (() => {
                                        const start = new Date(fechaIni!).getTime();
                                        const end = new Date(fechaFin!).getTime();
                                        const diff = end - start;
                                        if (diff <= 0) return "--:--:--";
                                        const hours = Math.floor(diff / (1000 * 60 * 60));
                                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                                        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                    })()
                                ) : (timeLeft || "--:--:--")}
                            </span>
                        </div>
                        {!showStaticTime && (
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full transition-all duration-1000", (isActiva || isPausada) ? "bg-orange-500" : "bg-gray-300")}
                                    style={{ width: timeLeft === "00:00:00" ? "100%" : "40%" }} 
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isFinalizada && (
                <div className="mt-auto pt-4 flex items-center justify-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 size={16} />
                    Votación Terminada
                </div>
            )}
        </div>
    );
}
