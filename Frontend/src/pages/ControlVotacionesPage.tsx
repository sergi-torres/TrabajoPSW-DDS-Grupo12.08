import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventSidebar } from "../components/layout/EventSidebar";
import { EventContext } from "../context/EventContext";
import { useControlVotaciones } from '../hooks/VotacionHooks/useControlVotaciones';
import EstadoCategoriaCard from '../components/votacion/ControlEstados/EstadoCategoriaCard';
import OpcionesBar from '../components/votacion/ControlEstados/OpcionesBar';
import { Timer, Activity, CheckCircle2, Clock, Play, Pause, ArrowLeft } from 'lucide-react';
import { cn } from '../components/ui/utils';

const ControlVotacionesPage: React.FC = () => {
    const navigate = useNavigate();
    const { eventoId } = useParams<{ eventoId: string }>();
    const { userColor, isCollapsed } = useContext(EventContext)!;
    const { categorias, cargando, cargarCategorias, cambiarEstado, actualizarTiempos } = useControlVotaciones();
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleActualizarTiempo = useCallback((dto: any) => {
        return actualizarTiempos({ ...dto, EventoId: Number(eventoId) });
    }, [actualizarTiempos, eventoId]);

    useEffect(() => {
        if (eventoId) {
            cargarCategorias(Number(eventoId));
        }
    }, [eventoId, cargarCategorias]);

    const selectedCategoria = categorias.find(c => c.id === selectedId) || null;

    const activeCount = categorias.filter(c => c.estado === "Activa").length;
    const pendingCount = categorias.filter(c => c.estado === "Pendiente").length;
    const finishedCount = categorias.filter(c => c.estado === "Finalizada").length;
    const pausedCount = categorias.filter(c => c.estado === "Pausada").length;

    return (
        <div className="min-h-screen bg-gray-50 font-body relative">
            <EventSidebar />

            <div className="flex flex-col min-h-screen">
                {/* Header Section - Identical Font Sizes to Config Page */}
                <header 
                    className={cn(
                        "text-white transition-all duration-300 relative overflow-hidden",
                        isCollapsed ? 'lg:pl-28' : 'lg:pl-80'
                    )}
                    style={{ backgroundColor: userColor || '#2563eb' }}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                    
                    <div className="max-w-7xl mx-auto p-6 lg:p-10 relative z-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <button
                                        onClick={() => navigate('/eventos')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm group"
                                    >
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                                        Volver a eventos
                                    </button>
                                </div>
                                
                                <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">
                                    Control de Votaciones
                                </h1>
                                <p className="text-blue-100 text-lg opacity-90">Gestión de estados y tiempos en tiempo real</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                                <StatItem label="Finalizadas" value={finishedCount} icon={<CheckCircle2 size={14}/>} color="bg-gray-400" />
                                <StatItem label="Activas" value={activeCount} icon={<Play size={14}/>} color="bg-green-400" />
                                <StatItem label="Pendientes" value={pendingCount} icon={<Clock size={14}/>} color="bg-blue-300" />
                                <StatItem label="Pausadas" value={pausedCount} icon={<Pause size={14}/>} color="bg-amber-400" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className={cn(
                    "flex-1 max-w-7xl mx-auto p-6 lg:p-10 transition-all duration-300 w-full",
                    isCollapsed ? 'lg:pl-28' : 'lg:pl-80'
                )}>
                    {cargando ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="font-heading font-bold text-gray-400">Sincronizando estados...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-40">
                            {categorias.map((cat) => (
                                <EstadoCategoriaCard 
                                    key={cat.id}
                                    categoria={cat}
                                    isSelected={selectedId === cat.id}
                                    onSelect={() => setSelectedId(cat.id)}
                                    onCambiarEstado={cambiarEstado}
                                />
                            ))}

                            {categorias.length === 0 && (
                                <div className="col-span-full bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-gray-200">
                                    <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-400">No hay categorías configuradas</h3>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Opciones Bar - Bottom Fixed */}
                <div className={cn(
                    "fixed bottom-[88px] lg:bottom-8 left-0 right-0 px-6 lg:px-10 z-[60] transition-all duration-300",
                    isCollapsed ? 'lg:pl-28' : 'lg:pl-80'
                )}>
                    <div className="max-w-7xl mx-auto">
                        <OpcionesBar 
                            categoria={selectedCategoria}
                            onCambiarEstado={cambiarEstado}
                            onActualizarTiempo={handleActualizarTiempo}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center min-w-[100px] hover:bg-white/20 transition-colors">
        <div className="flex items-center gap-2 mb-1">
            <div className={cn("flex items-center justify-center text-white/60", color)}>
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{label}</span>
        </div>
        <span className="text-2xl font-black">{value}</span>
    </div>
);

export default ControlVotacionesPage;
