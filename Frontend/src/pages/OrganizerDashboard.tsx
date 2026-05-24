// src/pages/OrganizerDashboard.tsx
import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Award, TrendingUp, LogOut, CheckSquare, Users, FileText, Heart } from "lucide-react";
import LiveHeader from "../components/organizator_dashboard/LiveHeader";
import StatsCard from "../components/organizator_dashboard/StatsCard";
import CategoryRankingPodium, { CategoryRankingData } from "../components/organizator_dashboard/CategoryRankingPodium";
import { getDashboard, extenderTiempo, cerrarVotacion } from "../api/orgDashboardApi";
import { premiosApi } from "../api/premiosApi";
import { abandonarEvento } from "../api/eventosApi";
import { AuthContext } from "../context/AuthContext";
import { EventContext } from "../context/EventContext";
import { ConfirmModal } from "../components/layout/ConfirmModal";
import { LogoutConfirmModal } from "../components/layout/LogoutConfirmModal";
import { categoriasApi } from "../api/categoriasApi";
import { EventSidebar } from "../components/layout/EventSidebar";
import { cn } from "../components/ui/utils";
import type { Premio } from "../types";
import "../components/organizator_dashboard/Dashboard.css";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { logout, userId } = useContext(AuthContext)! as any;
  const { eventoId: contextEventoId, userRole, userColor, isCollapsed, clearEventContext } = useContext(EventContext)!;
  
  const [toast, setToast] = useState<any>(null);
  const [showConfirmAbandonar, setShowConfirmAbandonar] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { eventoId: paramEventoId } = useParams<{ eventoId: string }>();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoadingLogout, setIsLoadingLogout] = useState(false);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [premios, setPremios] = useState<Premio[]>([]);
  const [activeTab, setActiveTab] = useState<any>(null);

  const eventoId = paramEventoId || (contextEventoId ? contextEventoId.toString() : null);

  const showToast = useCallback((message: string, type: "success" | "warning" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchDashboard = useCallback(async () => {
    if (!eventoId || eventoId === "undefined") {
      setError("ID de evento no válido.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getDashboard(Number(eventoId));
      if (!data) throw new Error("No se recibieron datos del servidor");
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      console.error("Error cargando dashboard:", err);
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    if (eventoId) {
      categoriasApi.getByEvento(Number(eventoId)).then(res => {
        setCategorias(res);
        if (res.length > 0) setActiveTab(res[0].id);
      });
      premiosApi.obtenerPremios(Number(eventoId)).then(res => {
        setPremios(res);
      }).catch(err => console.error("Error cargando premios:", err));
    }
  }, [eventoId]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setIsLoadingLogout(true);
    setTimeout(() => {
      logout();
      clearEventContext();
      navigate('/login');
    }, 300);
  };

  const handleAbandonar = async () => {
    try {
      await abandonarEvento(Number(eventoId), userId);
      clearEventContext();
      navigate('/eventos');
    } catch (err: any) {
      showToast(err.message || "Error al abandonar el evento", "warning");
    }
  };

  const handleExtend = async () => {
    if (!activeTab) return;
    try {
      await extenderTiempo(activeTab, 10);
      showToast("Votación extendida 10 minutos", "success");
      fetchDashboard();
    } catch (err: any) {
      showToast(err.message, "warning");
    }
  };

  const handleClose = async () => {
    if (!activeTab) return;
    try {
      await cerrarVotacion(activeTab);
      showToast("Votación cerrada manualmente", "info");
      fetchDashboard();
    } catch (err: any) {
      showToast(err.message, "warning");
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EventSidebar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-heading font-bold text-gray-400">Sincronizando panel...</p>
        </div>
      </div>
    );
  }

  if (error || !eventoId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <EventSidebar />
        <div className={cn("max-w-md bg-white p-8 rounded-[32px] shadow-sm border border-red-100 transition-all duration-300", isCollapsed ? "lg:pl-10" : "lg:pl-10")}>
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Panel fuera de línea</h2>
          <p className="text-gray-500 mb-8">{error || "No se ha podido identificar el evento activo."}</p>
          <button
            onClick={() => navigate('/eventos')}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Volver a Eventos
          </button>
        </div>
      </div>
    );
  }

  const { liveInfo, stats, ranking } = dashboardData;


  // Build CategoryRankingData from categorias + ranking
  const categoryRankingData: CategoryRankingData[] = categorias.map((cat: any) => {
    // Use the Estado field from backend categories API (Pendiente / Activa / Finalizada)
    const finalizada = cat.estado === "Finalizada";

    // Filter ranking projects for this category and take top 3
    // Backend returns camelCase: idCategoria, name, score, team
    const catProjects = (ranking || [])
      .filter((p: any) => p.idCategoria === cat.id)
      .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3)
      .map((p: any) => ({
        id: p.id,
        name: p.name || `Proyecto ${p.id}`,
        team: p.team || '',
        score: Math.round(p.score ?? 0),
      }));

    return {
      id: cat.id,
      nombre: cat.nombre,
      finalizada,
      ganadores: finalizada ? catProjects : undefined,
    };
  });
  const isPublicRole = userRole === "Público";

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      <EventSidebar />

      <div className="pb-[88px] lg:pb-0">
        <header 
            className={cn(
              "text-white p-6 lg:p-10 transition-all duration-300",
              isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')
            )}
            style={{ backgroundColor: userColor || undefined }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              {!isPublicRole ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/eventos')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                    Volver a eventos
                  </button>
                  {(userRole === "Participante" || userRole === "Jurado") && (
                    <button
                      onClick={() => setShowConfirmAbandonar(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 font-heading font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={2.5} />
                      Abandonar evento
                    </button>
                  )}
                </div>
              ) : (
                <div />
              )}

              {isPublicRole && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  Salir
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    Panel {userRole}
                  </span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-heading font-bold tracking-tight mb-2">
                  {liveInfo?.eventName || "Cargando evento..."}
                </h1>
                <p className="text-blue-100 text-lg font-medium opacity-90">Monitorización de resultados en tiempo real</p>
              </div>

              {/* LIVE INFO: Code & Timer (Only for Organizador) */}
              {userRole === "Organizador" && (
                <div className="flex-shrink-0">
                  <LiveHeader
                    eventName={liveInfo.eventName}
                    phase={liveInfo.phase}
                    eventCode={liveInfo.eventCode}
                    onExtend={handleExtend}
                    onClose={handleClose}
                    minimal={true}
                  />
                </div>
              )}
              
              {/* If not organizer, show something related to their role */}
              {userRole !== "Organizador" && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wider font-bold mb-1 opacity-80">Estado de Sesión</p>
                  <p className="text-xl font-heading font-bold">{userRole}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={cn(
          "max-w-7xl mx-auto p-6 lg:p-10 -mt-10 space-y-10 transition-all duration-300",
          isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')
        )}>
          {/* STATS SECTION */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Votos Totales" value={stats?.votosPublicoCount ?? 0} total={null} icon="CheckSquare" color="org" />
            <StatsCard label="Participación" value={`${stats?.votosJuradoPorcentaje ?? 0}%`} total={null} icon="Users" color="jur" />
            <StatsCard label="Proyectos" value={stats?.proyectosTotal ?? 0} total={null} icon="FileText" color="part" />
            <StatsCard label="Participantes inscritos" value={stats?.participantesConectados ?? 0} total={null} icon="Heart" color="pub" />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* RANKING POR CATEGORÍA (Main Area) */}
            <div className="lg:col-span-8 space-y-8">
              <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-bold text-gray-900">Ranking por Categoría</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    En directo
                  </div>
                </div>
                <CategoryRankingPodium
                  categorias={categoryRankingData}
                  premios={premios}
                  isOrganizer={userRole === "Organizador"}
                />
              </section>
            </div>

            {/* CATEGORIES LIST (Side Area - Replaces Feed) */}
            <section className="lg:col-span-4 h-fit">
              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-gray-900">Categorías</h3>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {categorias.map(cat => {
                    const estadoStyles: Record<string, { dot: string; badge: string; label: string }> = {
                      Activa:     { dot: "bg-green-500",  badge: "bg-green-50 text-green-700",  label: "Activa" },
                      Pausada:    { dot: "bg-orange-400", badge: "bg-orange-50 text-orange-700", label: "Pausada" },
                      Finalizada: { dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-500",   label: "Finalizada" },
                      Pendiente:  { dot: "bg-blue-400",   badge: "bg-blue-50 text-blue-600",    label: "Pendiente" },
                    };
                    const s = estadoStyles[cat.estado] ?? estadoStyles.Pendiente;
                    return (
                      <div
                        key={cat.id}
                        className="w-full flex flex-col gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                          <span className="text-sm font-bold text-gray-700">{cat.nombre}</span>
                        </div>
                        <span className={`self-start text-[11px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                  {categorias.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-4">No hay categorías definidas</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-400' : 'bg-orange-400'}`} />
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmAbandonar}
        title="¿Abandonar el evento?"
        message="Dejarás de formar parte de este evento. Podrás volver a unirte desde el dashboard si el evento sigue disponible."
        confirmLabel="Sí, abandonar"
        cancelLabel="Cancelar"
        onConfirm={() => { setShowConfirmAbandonar(false); handleAbandonar(); }}
        onCancel={() => setShowConfirmAbandonar(false)}
        danger={true}
      />
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        isLoading={isLoadingLogout}
      />
    </div>
  );
}
