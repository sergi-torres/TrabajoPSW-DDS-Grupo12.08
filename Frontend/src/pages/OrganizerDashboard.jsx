// src/pages/OrganizerDashboard.jsx
import { useState } from "react";
import LiveHeader from "../components/organizator_dashboard/LiveHeader";
import StatsCard from "../components/organizator_dashboard/StatsCard";
import RankingList from "../components/organizator_dashboard/RankingList";
import ProjectFeed from "../components/organizator_dashboard/ProjectFeed";
import { mockEventInfo, mockStats, mockRanking, mockFeed } from "../models/mockDashboard";

export default function OrganizerDashboard() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExtend = () => showToast("Tiempo extendido 10 minutos ✓", "success");
  const handleClose = () => showToast("Acción: Cerrar votación (confirmar en modal)", "warning");
  const handleViewDetails = (item) => showToast(`Viendo: ${item.title}`, "info");

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
        eventName={mockEventInfo.name}
        phase={mockEventInfo.phase}
        onExtend={handleExtend}
        onClose={handleClose}
      />

      {/* Stats row */}
      <section className="stats-grid" aria-label="Estadísticas del evento">
        {mockStats.map((stat) => (
          <StatsCard key={stat.id} {...stat} />
        ))}
      </section>

      {/* Main content: ranking + feed */}
      <div className="dashboard-main">
        <RankingList projects={mockRanking} />
        <ProjectFeed
          items={mockFeed}
          updatedMinutesAgo={1}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
}
