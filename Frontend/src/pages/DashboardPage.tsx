import { useState, useEffect, useMemo, useContext } from "react";
import { Plus, Search } from "lucide-react";
import SimpleSearchBar from "../components/layout/SimpleSearchBar";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DesktopHeader } from "../components/eventos/DesktopHeader";
import { MobileNav } from "../components/eventos/MobileNav";
import { EventCard } from "../components/eventos/EventCard";
import { getMisEventos, getEventosDisponibles, unirseAEvento } from "../api/eventosApi";
import { AuthContext } from "../context/AuthContext";
import { getProyectosByParticipante } from "../api/proyectoApi";
import { EventContext } from "../context/EventContext";

type Tab = "mis-eventos" | "unirse";

export default function DashboardPage() {
    const { userId } = useContext(AuthContext) as any;
    const { setEventContext } = useContext(EventContext) as any;
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<Tab>("mis-eventos");
    const [misEventos, setMisEventos] = useState<any[]>([]);
    const [eventosDisponibles, setEventosDisponibles] = useState<any[]>([]);
    const [misProyectos, setMisProyectos] = useState<any[]>([]);
    const [loadingMis, setLoadingMis] = useState(true);
    const [loadingDisponibles, setLoadingDisponibles] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!userId) {
            setLoadingMis(false);
            setError("No se ha encontrado el usuario. Inicia sesión de nuevo.");
            return;
        }
        async function fetchMisEventos() {
            try {
                setLoadingMis(true);
                const mis = await getMisEventos(userId);
                setMisEventos(mis);
                localStorage.setItem("misEventosCache", JSON.stringify(mis));
                const proyectos = await getProyectosByParticipante(userId);
                setMisProyectos(proyectos);
            } catch (err: any) {
                console.error("Error cargando eventos:", err);
                setError(err.message);
            } finally {
                setLoadingMis(false);
            }
        }
        fetchMisEventos();
    }, [userId]);

    async function fetchDisponibles() {
        if (eventosDisponibles.length > 0) return;
        try {
            setLoadingDisponibles(true);
            const disponibles = await getEventosDisponibles(userId);
            setEventosDisponibles(disponibles);
        } catch (err: any) {
            console.error("Error cargando disponibles:", err);
        } finally {
            setLoadingDisponibles(false);
        }
    }

    function handleTabChange(tab: Tab) {
        setActiveTab(tab);
        setSearchQuery("");
        if (tab === "unirse") fetchDisponibles();
    }

    async function handleUnirse(evento: any) {
        try {
            await unirseAEvento(evento.id, userId);
            setMisEventos(prev => [...prev, { ...evento, rol: "Participante" }]);
            setEventosDisponibles(prev => prev.filter(e => e.id !== evento.id));
            setActiveTab("mis-eventos");
            toast.success(`Te has unido a "${evento.nombre}"`);
        } catch (err: any) {
            toast.error("No se pudo unir al evento", { description: err.message });
        }
    }

    const filteredMis = useMemo(() => {
        if (!searchQuery.trim()) return misEventos;
        const q = searchQuery.toLowerCase();
        return misEventos.filter(e => (e.nombre || "").toLowerCase().includes(q));
    }, [misEventos, searchQuery]);

    const filteredDisponibles = useMemo(() => {
        if (!searchQuery.trim()) return eventosDisponibles;
        const q = searchQuery.toLowerCase();
        return eventosDisponibles.filter(e => (e.nombre || "").toLowerCase().includes(q));
    }, [eventosDisponibles, searchQuery]);

    const loading = activeTab === "mis-eventos" ? loadingMis : loadingDisponibles;

    return (
        <div className="min-h-screen bg-background font-body pb-[88px] lg:pb-12 lg:pt-[72px] text-foreground">
            <DesktopHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 lg:mb-10">
                    <div className="bg-muted rounded-full p-1 inline-flex">
                        <button
                            onClick={() => handleTabChange("mis-eventos")}
                            className={`px-5 py-2 rounded-full text-sm font-heading font-bold transition-all ${
                                activeTab === "mis-eventos"
                                    ? "bg-[var(--color-org)] text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Mis Eventos
                        </button>
                        <button
                            onClick={() => handleTabChange("unirse")}
                            className={`px-5 py-2 rounded-full text-sm font-heading font-bold transition-all ${
                                activeTab === "unirse"
                                    ? "bg-[var(--color-org)] text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Unirse a un Evento
                        </button>
                    </div>

                    <button
                        onClick={() => navigate("/create-event")}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-org)] hover:opacity-90 hover:scale-[1.02] transition-all hover:shadow-hover text-white h-12 px-6 rounded-xl font-heading font-bold shadow-md active:scale-[0.98]"
                    >
                        <Plus size={20} strokeWidth={2} />
                        Crear Evento
                    </button>
                </div>

                <div className="lg:hidden mb-6">
                    <SimpleSearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Buscar evento..."
                        className="relative max-w-xl"
                        inputClassName="w-full bg-muted hover:bg-accent focus:bg-card border border-transparent focus:border-[var(--color-org)]/30 rounded-full h-11 pl-11 pr-4 outline-none transition-all text-sm font-body text-foreground placeholder:text-muted-foreground focus:shadow-[0_0_0_4px_rgba(59,130,246,0.05)]"
                    />
                </div>


                {loading && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-lg font-medium">Cargando eventos...</p>
                    </div>
                )}

                {error && !loadingMis && (
                    <div className="text-center py-12 bg-card rounded-2xl border border-destructive/30 mb-8">
                        <p className="text-destructive font-medium mb-1">No se pudieron cargar los eventos</p>
                        <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                )}

                {!loading && activeTab === "mis-eventos" && (
                    <section>
                        {filteredMis.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                {filteredMis.map((evento) => (
                                    <EventCard
                                        key={evento.id}
                                        {...evento}
                                        onClick={() => {
                                            const propsRolRaw = localStorage.getItem("propsRol");
                                            let rol = "Participante";
                                            try {
                                                if (propsRolRaw) rol = JSON.parse(propsRolRaw).label;
                                            } catch (_e) {}

                                            setEventContext({
                                                eventoId: evento.id,
                                                userRole: rol,
                                                userColor: rol === "Organizador" ? "var(--color-org)" : rol === "Jurado" ? "#ea580c" : "#9333ea"
                                            });

                                            if (rol === "Participante") {
                                                if (localStorage.getItem("proyectoABCD")) localStorage.removeItem("proyectoABCD");
                                                const misProyectosDelEvento = misProyectos.filter(p => p.idEvento === evento.id);
                                                if (misProyectosDelEvento.length > 0) {
                                                    localStorage.setItem("eventoNombre", evento.nombre);
                                                    localStorage.setItem("proyectos", JSON.stringify(misProyectosDelEvento));
                                                    const proyecto = misProyectosDelEvento[0];
                                                    localStorage.setItem("proyectoId", proyecto.id.toString());
                                                    localStorage.setItem("proyectoNombre", proyecto.nombre);
                                                    localStorage.setItem("proyectoDescripcion", proyecto.descripcion);
                                                    localStorage.setItem("categoriaProyecto", proyecto.idCategoria?.toString() || "");
                                                    localStorage.setItem("proyectoABCD", JSON.stringify(proyecto));
                                                }
                                            }
                                            navigate(`/eventos/${evento.id}`);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : !error && (
                            <div className="text-center py-12 bg-card rounded-2xl border border-border">
                                <p className="text-muted-foreground">
                                    {searchQuery ? "No se encontraron eventos." : "No estás en ningún evento todavía."}
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {!loading && activeTab === "unirse" && (
                    <section>
                        {filteredDisponibles.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                {filteredDisponibles.map((evento) => (
                                    <div
                                        key={evento.id}
                                        className="bg-card rounded-2xl p-6 border border-border shadow-base flex flex-col h-full"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    evento.estado === "Activo" || evento.estado === "Abierto"
                                                        ? "bg-[var(--color-pub)]/10 text-[var(--color-pub)]"
                                                        : "bg-muted text-muted-foreground"
                                                }`}>
                                                    {evento.estado}
                                                </span>
                                            </div>
                                            <h3 className="font-heading font-semibold text-xl text-foreground leading-snug mb-2 line-clamp-2">
                                                {evento.nombre}
                                            </h3>
                                            {evento.descripcion && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">{evento.descripcion}</p>
                                            )}
                                        </div>
                                        <div className="mt-5 flex justify-end">
                                            <button
                                                onClick={() => handleUnirse(evento)}
                                                className="flex items-center gap-2 bg-[var(--color-org)] hover:opacity-90 text-white px-5 py-2 rounded-xl font-heading font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                                            >
                                                Unirse
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-card rounded-2xl border border-border">
                                <p className="text-muted-foreground">
                                    {searchQuery ? "No se encontraron eventos." : "No hay eventos disponibles para unirse."}
                                </p>
                            </div>
                        )}
                    </section>
                )}

            </main>

            <MobileNav />
        </div>
    );
}
