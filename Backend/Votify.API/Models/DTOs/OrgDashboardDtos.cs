namespace Votify.API.Models.DTOs
{
    /// <summary>
    /// Respuesta principal del endpoint GET /api/OrgDashboard/{eventoId}
    /// </summary>
    public class OrgDashboardResponseDto
    {
        public OrgStatsDto Stats { get; set; } = new();
        public List<RankingItemDto> Ranking { get; set; } = new();
        public List<ProjectFeedItemDto> Feed { get; set; } = new();
        public LiveHeaderDto LiveInfo { get; set; } = new();
    }

    /// <summary>
    /// Estadísticas globales → alimenta StatsCard
    /// Campos alineados con la UI: "Proyectos Subidos 24/25", "Participantes Conectados 150",
    /// "Votos Jurado 85%", "Votos Público 3.420"
    /// </summary>
    public class OrgStatsDto
    {
        public int ProyectosSubidos { get; set; }       // proyectos que ya tienen al menos 1 voto o entrega
        public int ProyectosTotal { get; set; }          // total de proyectos registrados en el evento
        public int ParticipantesConectados { get; set; } // usuarios con rol "Participante"
        public float VotosJuradoPorcentaje { get; set; } // % de votos de jurado completados (0-100)
        public int VotosPublicoCount { get; set; }       // total de votos emitidos por el público
    }

    /// <summary>
    /// Un ítem del ranking → alimenta RankingList
    /// </summary>
    public class RankingItemDto
    {
        public int Id { get; set; }
        public int Position { get; set; }
        public string Name { get; set; } = string.Empty;
        public float Score { get; set; }
        public float JuryScore { get; set; }
        public float PublicScore { get; set; }
        public int IdCategoria { get; set; }
        public string Trend { get; set; } = "stable"; // "up" | "down" | "stable"
    }

    /// <summary>
    /// Un ítem del feed de proyectos → alimenta ProjectFeed
    /// </summary>
    public class ProjectFeedItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Team { get; set; } = string.Empty;
        public string Type { get; set; } = "pdf"; // "pdf" | "video" | "mockup"
        public string Status { get; set; } = "pending"; // "ready" | "pending" | "reviewing"
        public int MinutesAgo { get; set; }
    }

    /// <summary>
    /// Info de cabecera en vivo → alimenta LiveHeader
    /// </summary>
    public class LiveHeaderDto
    {
        public string EventName { get; set; } = string.Empty;
        public string Phase { get; set; } = "Votación Abierta";
        public DateTime? FechaFin { get; set; }
        public string EventCode { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para la petición de extender tiempo
    /// </summary>
    public class ExtenderTiempoRequestDto
    {
        public int MinutosExtra { get; set; }
    }
}
