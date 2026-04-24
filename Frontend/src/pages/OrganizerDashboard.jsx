// src/pages/OrganizerDashboard.jsx
import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Award, TrendingUp, LayoutDashboard, Clock } from "lucide-react";
import LiveHeader from "../components/organizator_dashboard/LiveHeader";
import StatsCard from "../components/organizator_dashboard/StatsCard";
import RankingList from "../components/organizator_dashboard/RankingList";
import ProjectFeed from "../components/organizator_dashboard/ProjectFeed";
import { getDashboard, extenderTiempo, cerrarVotacion } from "../api/orgDashboardApi";
import { AuthContext } from "../context/AuthContext";
import { EventContext } from "../context/EventContext";
import { categoriasApi } from "../api/categoriasApi";
import { EventSidebar } from "../components/layout/EventSidebar";
import "../components/organizator_dashboard/Dashboard.css";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { isPublic, logout } = useContext(AuthContext);
  const { eventoId: contextEventoId, userRole, userColor, isCollapsed, clearEventContext } = useContext(EventContext);
  const [toast, setToast] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { eventoId: paramEventoId } = useParams();

  const [categorias, setCategorias] = useState([]);     //categorias para tabs
  const [activeTab, setActiveTab] = useState(null);

  const eventoId = paramEventoId || contextEventoId;

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Cargar datos del dashboard
  const fetchDashboard = useCallback(async () => {
    if (!eventoId || eventoId === "undefined") {
      setError("ID de evento no válido.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getDashboard(eventoId);
      if (!data) throw new Error("No se recibieron datos del servidor");
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  useEffect(() => {
    const loadCategorias = async () => {
      if (!eventoId || eventoId === "undefined") return;
      try {
        const data = await categoriasApi.getByEvento(eventoId);
        setCategorias(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };
    loadCategorias();
  }, [eventoId]);

  useEffect(() => {
    if (categorias.length > 0 && !activeTab) {
      setActiveTab(categorias[0].id);
    }
  }, [categorias, activeTab]);

  const handleExtend = async () => {
    try {
      await extenderTiempo(eventoId, 10);
      showToast("Tiempo extendido 10 minutos ✓", "success");
      fetchDashboard();
    } catch (err) {
      showToast(`Error: ${err.message}`, "warning");
    }
  };

  const handleClose = async () => {
    try {
      await cerrarVotacion(eventoId);
      showToast("Votación cerrada ✓", "success");
      fetchDashboard();
    } catch (err) {
      showToast(`Error: ${err.message}`, "warning");
    }
  };

  const handleLogout = () => {
    logout();
    clearEventContext();
    navigate('/login');
  };

  const handleViewDetails = (item) => showToast(`Viendo: ${item.title}`, "info");

  const buildStats = (stats) => [
    {
      id: "projects",
      label: "Proyectos Subidos",
      value: stats.proyectosSubidos,
      total: stats.proyectosTotal,
      icon: "FileText",
      color: "org",
    },
    {
      id: "participants",
      label: "Participantes Conectados",
      value: stats.participantesConectados,
      total: null,
      icon: "Users",
      color: "part",
    },
    {
      id: "jury_votes",
      label: "Votos Jurado",
      value: `${stats.votosJuradoPorcentaje}%`,
      total: null,
      icon: "CheckSquare",
      color: "jur",
    },
    {
      id: "public_votes",
      label: "Votos Público",
      value: stats.votosPublicoCount.toLocaleString("es-ES"),
      total: null,
      icon: "Heart",
      color: "pub",
    },
  ];

  const isPublicRole = userRole === "Público";

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-body">
        <EventSidebar />
        <div className={`text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}>
          <LayoutDashboard className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-body p-6">
        <EventSidebar />
        <div className={`max-w-md w-full text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}>
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Panel no disponible</h2>
          <p className="text-gray-500 mb-6">{error || "No se han podido cargar los datos del evento."}</p>
          <button 
            onClick={() => navigate('/eventos')}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Volver a Eventos
          </button>
        </div>
      </div>
    );
  }

  const { stats, ranking, feed, liveInfo } = dashboardData;

  const proyectosFiltrados =
    categorias.length > 0 && activeTab != null
      ? ranking.filter(p => p.idCategoria === activeTab)
      : ranking;

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      <EventSidebar />

      <div className="pb-[88px] lg:pb-12">
        <header 
          className={`bg-blue-600 text-white p-6 lg:p-10 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`} 
          style={{ backgroundColor: userColor }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              {!isPublicRole ? (
                <button
                  onClick={() => navigate('/eventos')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                  Volver a eventos
                </button>
              ) : (
                <div /> // Spacer
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

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                    Panel {userRole}
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-100 text-sm font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Live
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">
                  {liveInfo.eventName}
                </h1>
                <p className="text-blue-100 text-lg font-medium opacity-90">
                  {liveInfo.phase}
                </p>
              </div>

              {userRole === "Organizador" && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
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
            </div>
          </div>
        </header>

        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 bg-white rounded-2xl shadow-modal p-4 border-l-4 border-l-${toast.type === 'success' ? 'green' : toast.type === 'warning' ? 'orange' : 'blue'}-500 animate-in fade-in slide-in-from-right-8 duration-300`} role="alert">
            <p className="font-medium text-gray-900">{toast.message}</p>
          </div>
        )}

        <main className={`max-w-7xl mx-auto p-6 lg:p-10 -mt-10 space-y-8 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}>
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-blue-600" style={{ color: userColor }} />
              <h2 className="text-xl font-heading font-bold text-gray-900">Estado del Evento</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {buildStats(stats).map((stat) => (
                <StatsCard key={stat.id} {...stat} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
              <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-blue-600" style={{ color: userColor }} />
                  <h2 className="text-xl font-heading font-bold text-gray-900">
                      Ranking en Tiempo Real
                  </h2>
              </div>

              <div className="flex gap-2 mb-6 border-b">
                  {categorias.map((cat) => (
                      <button
                          key={cat.id}
                          onClick={() => setActiveTab(cat.id)}
                          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                           activeTab === cat.id
                            ? `border-[${userColor}] text-[${userColor}]`
                            : "border-transparent text-gray-500 hover:text-gray-700"
                             }`}
                          style={activeTab === cat.id ? { borderBottomColor: userColor, color: userColor } : {}}
                              >
                              {cat.nombre}
                              </button>
                              ))}
             </div>

              <RankingList projects={proyectosFiltrados} />
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600" style={{ color: userColor }} />
                <h2 className="text-xl font-heading font-bold text-gray-900">Feed de Actividad</h2>
              </div>
              <ProjectFeed
                items={feed}
                updatedMinutesAgo={1}
                onViewDetails={handleViewDetails}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
