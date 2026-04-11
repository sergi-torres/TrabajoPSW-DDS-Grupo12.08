// src/pages/OrganizerDashboard.jsx
import { useState, useEffect } from "react";
import LiveHeader from "../components/organizator_dashboard/LiveHeader";
import StatsCard from "../components/organizator_dashboard/StatsCard";
import RankingList from "../components/organizator_dashboard/RankingList";
import ProjectFeed from "../components/organizator_dashboard/ProjectFeed";
import { getDashboard, extenderTiempo, cerrarVotacion } from "../api/orgDashboardApi";

export default function OrganizerDashboard() {
  const [toast, setToast] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener el eventoId desde localStorage (se guarda al hacer click en un evento)
  const eventoId = localStorage.getItem("eventoId");

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
      <div className="organizer-dashboard">
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted-foreground)" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error sin datos
  if (error && !dashboardData) {
    return (
      <div className="organizer-dashboard">
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--destructive)" }}>
          <p style={{ fontWeight: 500 }}>No se pudo cargar el dashboard</p>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{error}</p>
        </div>
      </div>
    );
  }

  const { stats, ranking, feed, liveInfo } = dashboardData;

  return (
    <div className="organizer-dashboard">
      {/* Toast notification */}
      {toast && (
        <div className={`toast toast--${toast.type}`} role="alert" aria-live="polite">
          {toast.message}
          <div className="toast__progress" />
        </div>
      )}

      {/* Header con timer */}
      <LiveHeader
        eventName={liveInfo.eventName}
        phase={liveInfo.phase}
        onExtend={handleExtend}
        onClose={handleClose}
      />

      {/* Stats row */}
      <section className="stats-grid" aria-label="Estadísticas del evento">
        {buildStats(stats).map((stat) => (
          <StatsCard key={stat.id} {...stat} />
        ))}
      </section>

      {/* Main content: ranking + feed */}
      <div className="dashboard-main">
        <RankingList projects={ranking} />
        <ProjectFeed
          items={feed}
          updatedMinutesAgo={1}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
}
