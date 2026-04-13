// src/pages/OrganizerDashboard.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Award, TrendingUp, LayoutDashboard, Clock } from "lucide-react";
import LiveHeader from "../components/organizator_dashboard/LiveHeader";
import StatsCard from "../components/organizator_dashboard/StatsCard";
import RankingList from "../components/organizator_dashboard/RankingList";
import ProjectFeed from "../components/organizator_dashboard/ProjectFeed";
import { getDashboard, extenderTiempo, cerrarVotacion } from "../api/orgDashboardApi";
import { AuthContext } from "../context/AuthContext";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { isPublic } = useContext(AuthContext);
  const [toast, setToast] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { eventoId: paramEventoId } = useParams();

  // Obtener el eventoId: primero de la URL, luego de localStorage
  const eventoId = paramEventoId || localStorage.getItem("eventoId");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar datos del dashboard
  const fetchDashboard = async () => {
    if (!eventoId) {
      setError("No se encontró el ID del evento.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getDashboard(eventoId);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Refrescar cada 30 segundos para datos "en vivo"
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [eventoId]);

  const handleExtend = async () => {
    try {
      await extenderTiempo(eventoId, 10);
      showToast("Tiempo extendido 10 minutos ✓", "success");
      fetchDashboard(); // refrescar datos
    } catch (err) {
      showToast(`Error: ${err.message}`, "warning");
    }
  };

  const handleClose = async () => {
    try {
      await cerrarVotacion(eventoId);
      showToast("Votación cerrada ✓", "success");
      fetchDashboard(); // refrescar datos
    } catch (err) {
      showToast(`Error: ${err.message}`, "warning");
    }
  };

  const handleViewDetails = (item) => showToast(`Viendo: ${item.title}`, "info");

  // Transformar datos del backend al formato que esperan los componentes
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

  // Estado de carga
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-body">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <LayoutDashboard className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  // Error sin datos
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-body p-6">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Conexión</h2>
          <p className="text-gray-500 mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 font-body pb-12">
      {/* HEADER - Organizer Style (Blue) */}
      <header className="bg-blue-600 text-white p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {!isPublic && (
            <button
              onClick={() => navigate('/eventos')}
              className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity font-heading font-semibold"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              Volver a eventos
            </button>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                  Panel Organizador
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

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <LiveHeader
                eventName={liveInfo.eventName}
                phase={liveInfo.phase}
                onExtend={handleExtend}
                onClose={handleClose}
                minimal={true}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 bg-white rounded-2xl shadow-modal p-4 border-l-4 border-l-${toast.type === 'success' ? 'green' : toast.type === 'warning' ? 'orange' : 'blue'}-500 animate-in fade-in slide-in-from-right-8 duration-300`} role="alert">
          <p className="font-medium text-gray-900">{toast.message}</p>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 lg:p-10 -mt-10 space-y-8">
        {/* Stats row in Cards */}
        <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-heading font-bold text-gray-900">Estado del Evento</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {buildStats(stats).map((stat) => (
              <StatsCard key={stat.id} {...stat} />
            ))}
          </div>
        </section>

        {/* Main content: ranking + feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-heading font-bold text-gray-900">Ranking en Tiempo Real</h2>
            </div>
            <RankingList projects={ranking} />
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
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
  );
}
