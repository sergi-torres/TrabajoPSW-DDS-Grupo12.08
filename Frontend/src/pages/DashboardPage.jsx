import { useState, useEffect, useMemo, useContext } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DesktopHeader } from "../components/eventos/DesktopHeader";
import { MobileNav } from "../components/eventos/MobileNav";
import { EventCard } from "../components/eventos/EventCard";
import { getMisEventos } from "../api/eventosApi";
import { AuthContext } from "../context/AuthContext";
import { getProyectosByParticipante } from "../api/proyectoApi";
import { categoriasApi } from "../api/categoriasApi";

/**
 * EventDashboardPage — Página principal con la lista de eventos.
 */
export default function DashboardPage() {
    const { userId } = useContext(AuthContext);
    const navigate = useNavigate();
    const [misEventos, setMisEventos] = useState([]);
    const [misProyectos, setMisProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchEventos() {
            try {
                setLoading(true);
                const mis = await getMisEventos(userId);
                setMisEventos(mis);
                localStorage.setItem("misEventosCache", JSON.stringify(mis));
                const proyectos = await getProyectosByParticipante(userId); 
                setMisProyectos(proyectos);
                //console.log("proyectos del participante:", proyectos);

            } catch (err) {
                console.error("Error cargando eventos:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (userId) {
            fetchEventos();
        } else {
            setLoading(false);
            setError("No se ha encontrado el usuario. Inicia sesión de nuevo.");
        }
    }, [userId]);

    const filteredMis = useMemo(() => {
        if (!searchQuery.trim()) return misEventos;
        const q = searchQuery.toLowerCase();
        return misEventos.filter(e => e.nombre.toLowerCase().includes(q));
    }, [misEventos, searchQuery]);

    return (
        <div className="min-h-screen bg-background font-body pb-[88px] lg:pb-12 lg:pt-[72px] text-foreground">
            <DesktopHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 lg:mb-10">
                    <h1 className="font-heading text-3xl font-bold text-foreground leading-tight tracking-tight">
                        Eventos
                    </h1>
                    <button
                        onClick={() => navigate("/create-event")}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-org)] hover:opacity-90 hover:scale-[1.02] transition-all hover:shadow-hover text-white h-12 px-6 rounded-xl font-heading font-bold shadow-md active:scale-[0.98]"
                    >
                        <Plus size={20} strokeWidth={2} />
                        Crear Evento
                    </button>
                </div>

                <div className="lg:hidden relative group mb-6">
                    <Search size={18} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--color-org)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar evento..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted hover:bg-accent focus:bg-card border border-transparent focus:border-[var(--color-org)]/30 rounded-full h-11 pl-11 pr-4 outline-none transition-all text-sm font-body text-foreground placeholder:text-muted-foreground focus:shadow-[0_0_0_4px_rgba(59,130,246,0.05)]"
                    />
                </div>

                {loading && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-lg font-medium">Cargando eventos...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center py-12 bg-card rounded-2xl border border-destructive/30 mb-8">
                        <p className="text-destructive font-medium mb-1">No se pudieron cargar los eventos</p>
                        <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                )}

                {!loading && (
                    <div className="space-y-12">

                        <section>
                            {filteredMis.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                    {filteredMis.map((evento) => (
                                        <EventCard
                                            key={evento.id}
                                            {...evento}
                                            onClick={
                                                () => {
                                                    const rol = JSON.parse(localStorage.getItem("propsRol")).label;

                                                    //Participante
                                                    if (rol === "Participante") {
                                                        localStorage.setItem("eventoId", evento.id);
                                                        localStorage.setItem("eventoNombre", evento.nombre);

                                                        const misProyectosDelEvento = new Array();
                                                        for(let i=0; i<misProyectos.length; i++)
                                                        {
                                                            if(misProyectos[i].idEvento === evento.id){
                                                                misProyectosDelEvento.push(misProyectos[i]);
                                                            }
                                                        }
                                                        //console.log(evento.id, misProyectos[0].idEvento);
                                                        //console.log("proyectos del evento:", misProyectosDelEvento);

                                                        if (misProyectosDelEvento.length > 0) {
                                                            const proyecto = misProyectosDelEvento[0]; // normalmente 1 por participante
                                                            localStorage.setItem("proyectoId", proyecto.id);
                                                            localStorage.setItem("proyectoNombre", proyecto.nombre);
                                                            localStorage.setItem("proyectoDescripcion", proyecto.descripcion);
                                                            localStorage.setItem("categoriaProyecto", proyecto.idCategoria);


                                                            navigate("/votos");

                                                        }else{
                                                            localStorage.setItem("eventoDescripcion", evento.descripcion);                                                            
                                                            navigate("/participantRegister");
                                                        }
                                                        
                                                    }
                                                    
                                                    if(rol === "Jurado") {
                                                        localStorage.setItem("eventoId", evento.id);
                                                        localStorage.setItem("eventoNombre", evento.nombre);
                                                        localStorage.setItem("eventoDescripcion", evento.descripcion);
                                                        navigate("/dashboard-votacion-categorias");
                                                    }
                                                    if(rol === "Organizador") {
                                                        localStorage.setItem("eventoId", evento.id);
                                                        localStorage.setItem("eventoNombre", evento.nombre);
                                                        localStorage.setItem("eventoDescripcion", evento.descripcion);
                                                        navigate("/organizador-dashboard");
                                                    }
                                                    
                                                }
                                            }
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
                    </div>
                )}

            </main>

            <MobileNav />
        </div>
    );
}
