import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Mail, User, Calendar, Trophy, Users, Star, ArrowLeft } from "lucide-react";
import { DesktopHeader } from "../components/eventos/DesktopHeader";
import { MobileNav } from "../components/eventos/MobileNav";
import { AuthContext } from "../context/AuthContext";
import { usuarioApi, UsuarioPerfil } from "../api/usuarioApi";
import { getMisEventos } from "../api/eventosApi";

export default function ProfilePage() {
    const { userId, logout } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
    const [eventos, setEventos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        Promise.all([
            usuarioApi.getById(userId),
            getMisEventos(userId),
        ]).then(([p, ev]) => {
            setPerfil(p);
            setEventos(ev);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [userId]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const stats = {
        total: eventos.length,
        organizador: eventos.filter(e => e.rol === "Organizador").length,
        jurado: eventos.filter(e => e.rol === "Jurado").length,
        participante: eventos.filter(e => e.rol === "Participante").length,
    };

    const initials = perfil?.nombreCompleto
        ? perfil.nombreCompleto.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
        : (perfil?.nombreUsuario?.substring(0, 2).toUpperCase() ?? "??");

    const fechaRegistro = perfil?.fechaRegistro
        ? new Date(perfil.fechaRegistro).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
        : null;

    return (
        <div className="min-h-screen bg-background font-body pb-[88px] lg:pb-12 lg:pt-[72px] text-foreground">
            <DesktopHeader />

            <main className="max-w-3xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-6">

                {/* Avatar + info principal */}
                <div className="bg-card rounded-[32px] border border-border shadow-base p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--color-org)] to-purple-400 flex items-center justify-center text-white font-heading font-bold text-3xl shadow-lg flex-shrink-0">
                        {loading ? "…" : initials}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-7 w-48 bg-muted rounded-xl animate-pulse mx-auto sm:mx-0" />
                                <div className="h-4 w-32 bg-muted rounded-xl animate-pulse mx-auto sm:mx-0" />
                            </div>
                        ) : (
                            <>
                                <h1 className="font-heading font-bold text-2xl text-foreground leading-tight">
                                    {perfil?.nombreCompleto || perfil?.nombreUsuario || "Usuario"}
                                </h1>
                                <p className="text-muted-foreground text-sm mt-0.5">@{perfil?.nombreUsuario}</p>
                                <div className="flex flex-col sm:flex-row gap-3 mt-4 text-sm text-muted-foreground">
                                    <span className="flex items-center justify-center sm:justify-start gap-1.5">
                                        <Mail size={14} strokeWidth={1.75} />
                                        {perfil?.email}
                                    </span>
                                    {fechaRegistro && (
                                        <span className="flex items-center justify-center sm:justify-start gap-1.5">
                                            <Calendar size={14} strokeWidth={1.75} />
                                            Desde {fechaRegistro}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Eventos", value: stats.total, icon: <Star size={18} strokeWidth={1.75} />, color: "text-[var(--color-org)]", bg: "bg-[var(--color-org)]/10" },
                        { label: "Organizador", value: stats.organizador, icon: <Trophy size={18} strokeWidth={1.75} />, color: "text-[var(--color-org)]", bg: "bg-[var(--color-org)]/10" },
                        { label: "Jurado", value: stats.jurado, icon: <User size={18} strokeWidth={1.75} />, color: "text-[var(--color-jur)]", bg: "bg-[var(--color-jur)]/10" },
                        { label: "Participante", value: stats.participante, icon: <Users size={18} strokeWidth={1.75} />, color: "text-[var(--color-part)]", bg: "bg-[var(--color-part)]/10" },
                    ].map(({ label, value, icon, color, bg }) => (
                        <div key={label} className="bg-card rounded-2xl border border-border shadow-base p-4 flex flex-col items-center gap-2">
                            <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center`}>
                                {icon}
                            </div>
                            <span className="font-heading font-bold text-2xl text-foreground">
                                {loading ? "—" : value}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Lista de eventos */}
                {!loading && eventos.length > 0 && (
                    <div className="bg-card rounded-[32px] border border-border shadow-base p-6">
                        <h2 className="font-heading font-bold text-lg text-foreground mb-4">Mis eventos</h2>
                        <div className="space-y-2">
                            {eventos.map((ev) => (
                                <div
                                    key={ev.id}
                                    onClick={() => navigate(`/eventos/${ev.id}`)}
                                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted transition-colors cursor-pointer group"
                                >
                                    <div>
                                        <p className="font-medium text-sm text-foreground group-hover:text-[var(--color-org)] transition-colors">
                                            {ev.nombre}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{ev.estado}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        ev.rol === "Organizador" ? "bg-[var(--color-org)]/10 text-[var(--color-org)]"
                                        : ev.rol === "Jurado" ? "bg-[var(--color-jur)]/10 text-[var(--color-jur)]"
                                        : "bg-[var(--color-part)]/10 text-[var(--color-part)]"
                                    }`}>
                                        {ev.rol}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => navigate("/eventos")}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--color-org)] hover:opacity-90 text-white font-heading font-bold text-sm transition-all shadow-md active:scale-[0.98]"
                    >
                        <ArrowLeft size={16} strokeWidth={2} />
                        Volver a eventos
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/5 font-heading font-bold text-sm transition-all"
                    >
                        <LogOut size={16} strokeWidth={2} />
                        Cerrar sesión
                    </button>
                </div>

            </main>

            <MobileNav />
        </div>
    );
}
