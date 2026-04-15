using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class OrgDashboardService : IOrgDashboardService
    {
        private readonly Supabase.Client _supabase;
        private readonly ICategoriaRepository _categoriaRepository;
        private readonly IProyectoRepository _proyectoRepository;
        private readonly IVotoRepository _votoRepository;

        public OrgDashboardService(
            Supabase.Client supabase,
            ICategoriaRepository categoriaRepository,
            IProyectoRepository proyectoRepository,
            IVotoRepository votoRepository)
        {
            _supabase = supabase;
            _categoriaRepository = categoriaRepository;
            _proyectoRepository = proyectoRepository;
            _votoRepository = votoRepository;
        }

        public async Task<OrgDashboardResponseDto> GetDashboardAsync(int eventoId)
        {
            try
            {
                // 1) Obtener info del evento (no hay repo para EventoLite, se usa Supabase directamente)
                var eventoResponse = await _supabase
                    .From<EventoLite>()
                    .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                    .Get();

                var evento = eventoResponse.Models.FirstOrDefault()
                    ?? throw new Exception("Evento no encontrado.");

                // 2) Obtener usuarios del evento (no hay repo para EventoUsuario, se usa Supabase)
                var usuariosResponse = await _supabase
                    .From<EventoUsuario>()
                    .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                    .Get();

                var usuarios = usuariosResponse.Models;
                int totalParticipantes = usuarios.Count(u => u.Rol == "Participante");
                int totalPublico = usuarios.Count(u => u.Rol == "Publico");

                // 3) Obtener categorías del evento → via repositorio
                var categorias = await _categoriaRepository.ObtenerPorEventoIdAsync(eventoId);

                // 4) Obtener todos los proyectos de las categorías → via repositorio
                var todosProyectos = new List<Proyecto>();
                foreach (var cat in categorias)
                {
                    var proyectosCategoria = await _proyectoRepository.ObtenerPorCategoriaIdAsync(cat.Id);
                    todosProyectos.AddRange(proyectosCategoria);
                }

                // 5) Obtener todos los votos de los proyectos → via repositorio
                var todosVotos = new List<VotoPublico>();
                foreach (var proyecto in todosProyectos)
                {
                    var votosProyecto = await _votoRepository.ObtenerPorProyectoIdAsync(proyecto.Id);
                    todosVotos.AddRange(votosProyecto);
                }

                // 6) Obtener los pesos por rol de las categorías (no hay repo, se usa Supabase)
                var todosPesos = new List<PesoCategoriaRol>();
                foreach (var cat in categorias)
                {
                    var pesosResponse = await _supabase
                        .From<PesoCategoriaRol>()
                        .Filter("idcategoria", Supabase.Postgrest.Constants.Operator.Equals, cat.Id.ToString())
                        .Get();

                    todosPesos.AddRange(pesosResponse.Models);
                }

                // 7) Construir stats alineadas con la UI
                // Separar votos de jurado vs público
                var idsJurados = usuarios
                    .Where(u => u.Rol == "Jurado")
                    .Select(u => u.IdUsuario)
                    .ToHashSet();

                var votosDeJurado = todosVotos
                    .Where(v => v.IdEvaluador != null && idsJurados.Contains(v.IdEvaluador.Value))
                    .ToList();
                var votosDePublico = todosVotos
                    .Where(v => v.IdEvaluador == null || !idsJurados.Contains(v.IdEvaluador ?? 0))
                    .ToList();

                // Proyectos que ya han recibido al menos 1 voto
                var proyectosConVotos = todosProyectos
                    .Count(p => todosVotos.Any(v => v.IdProyecto == p.Id));

                // % votos jurado: jurados que han votado / total jurados × 100
                // (al menos 1 voto por jurado cuenta como "ha votado")
                var juradosQueVotaron = votosDeJurado
                    .Select(v => v.IdEvaluador)
                    .Distinct()
                    .Count();
                float porcentajeJurado = idsJurados.Count > 0
                    ? MathF.Round((float)juradosQueVotaron / idsJurados.Count * 100f, 0)
                    : 0f;

                var stats = new OrgStatsDto
                {
                    ProyectosSubidos = proyectosConVotos,
                    ProyectosTotal = todosProyectos.Count,
                    ParticipantesConectados = totalParticipantes,
                    VotosJuradoPorcentaje = porcentajeJurado,
                    VotosPublicoCount = votosDePublico.Count
                };

                // 8) Construir ranking
                var ranking = BuildRanking(todosProyectos, todosVotos, usuarios, todosPesos);

                // 9) Construir feed de proyectos recientes
                var feed = BuildFeed(todosProyectos, todosVotos);

                // 10) Construir live header info
                var liveInfo = new LiveHeaderDto
                {
                    EventName = evento.Nombre,
                    Phase = DeterminarFase(evento),
                    FechaFin = evento.FechaFin
                };

                return new OrgDashboardResponseDto
                {
                    Stats = stats,
                    Ranking = ranking,
                    Feed = feed,
                    LiveInfo = liveInfo
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error obteniendo dashboard del organizador: {ex.Message}", ex);
            }
        }

        public async Task ExtenderTiempoAsync(int eventoId, int minutosExtra)
        {
            try
            {
                var eventoResponse = await _supabase
                    .From<EventoLite>()
                    .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                    .Get();

                var evento = eventoResponse.Models.FirstOrDefault()
                    ?? throw new Exception("Evento no encontrado.");

                evento.FechaFin = evento.FechaFin.AddMinutes(minutosExtra);

                await _supabase
                    .From<EventoLite>()
                    .Update(evento);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al extender el tiempo: {ex.Message}", ex);
            }
        }

        public async Task CerrarVotacionAsync(int eventoId)
        {
            try
            {
                var eventoResponse = await _supabase
                    .From<EventoLite>()
                    .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                    .Get();

                var evento = eventoResponse.Models.FirstOrDefault()
                    ?? throw new Exception("Evento no encontrado.");

                evento.Estado = "Cerrado";

                await _supabase
                    .From<EventoLite>()
                    .Update(evento);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al cerrar la votación: {ex.Message}", ex);
            }
        }

        // ──────────── Métodos privados auxiliares ────────────

        private string DeterminarFase(EventoLite evento)
        {
            if (evento.Estado == "Cerrado") return "Votación Cerrada";
            if (DateTime.UtcNow > evento.FechaFin) return "Tiempo Agotado";
            if (DateTime.UtcNow >= evento.FechaInicio) return "Votación Abierta";
            return "Pendiente de Apertura";
        }

        private List<RankingItemDto> BuildRanking(
            List<Proyecto> proyectos,
            List<VotoPublico> votos,
            List<EventoUsuario> usuarios,
            List<PesoCategoriaRol> pesos)
        {
            var ranking = new List<RankingItemDto>();

            foreach (var proyecto in proyectos)
            {
                var votosDelProyecto = votos.Where(v => v.IdProyecto == proyecto.Id).ToList();

                // Separar votos de jurado (tienen IdEvaluador no nulo) y público (IdEvaluador nulo)
                var idsJurados = usuarios
                    .Where(u => u.Rol == "Jurado")
                    .Select(u => u.IdUsuario)
                    .ToHashSet();

                var votosJurado = votosDelProyecto.Where(v => v.IdEvaluador != null && idsJurados.Contains(v.IdEvaluador.Value)).ToList();
                var votosPublico = votosDelProyecto.Where(v => v.IdEvaluador == null || !idsJurados.Contains(v.IdEvaluador ?? 0)).ToList();

                // Puntuación media (0-100)
                var juryVotes = votosJurado.Where(v => v.Valor.HasValue).ToList();
                var publicVotes = votosPublico.Where(v => v.Valor.HasValue).ToList();

                float juryScore = juryVotes.Count > 0 ? juryVotes.Average(v => v.Valor!.Value) * 10f : 0f;
                float publicScore = publicVotes.Count > 0 ? publicVotes.Average(v => v.Valor!.Value) * 10f : 0f;


                // Peso jurado/público de la categoría
                var pesoJurado = pesos.FirstOrDefault(p => p.IdCategoria == proyecto.IdCategoria && p.RolVotante == "Jurado")?.Peso ?? 0.7f;
                var pesoPublico = pesos.FirstOrDefault(p => p.IdCategoria == proyecto.IdCategoria && p.RolVotante == "Publico")?.Peso ?? 0.3f;

                float combinedScore = (juryScore * pesoJurado) + (publicScore * pesoPublico);

                ranking.Add(new RankingItemDto
                {
                    Id = proyecto.Id,
                    Name = proyecto.Nombre,
                    Score = MathF.Round(combinedScore, 1),
                    JuryScore = MathF.Round(juryScore, 1),
                    IdCategoria = proyecto.IdCategoria,
                    PublicScore = MathF.Round(publicScore, 1),
                    Trend = "stable" // TODO: comparar con snapshot anterior para calcular tendencia real
                });
            }

            // Ordenar por puntuación descendente y asignar posición
            ranking = ranking.OrderByDescending(r => r.Score).ToList();
            for (int i = 0; i < ranking.Count; i++)
            {
                ranking[i].Position = i + 1;
            }

            return ranking;
        }

        private List<ProjectFeedItemDto> BuildFeed(List<Proyecto> proyectos, List<VotoPublico> votos)
        {
            var feed = new List<ProjectFeedItemDto>();

            foreach (var proyecto in proyectos)
            {
                var votosDelProyecto = votos.Where(v => v.IdProyecto == proyecto.Id).ToList();

                // Determinar estado según si tiene votos
                string status;
                if (votosDelProyecto.Count == 0)
                    status = "pending";
                else
                    status = "ready";

                // Determinar tipo según la URL multimedia
                string type = "pdf"; // por defecto
                if (!string.IsNullOrEmpty(proyecto.UrlMultimedia))
                {
                    var url = proyecto.UrlMultimedia.ToLower();
                    if (url.Contains(".mp4") || url.Contains(".avi") || url.Contains(".mov") || url.Contains("video"))
                        type = "video";
                    else if (url.Contains(".fig") || url.Contains("mockup") || url.Contains("figma"))
                        type = "mockup";
                }

                // Calcular hace cuántos minutos fue el último voto
                int minutesAgo = 0;
                if (votosDelProyecto.Count > 0)
                {
                    var ultimoVoto = votosDelProyecto.Max(v => v.FechaVoto);
                    minutesAgo = (int)(DateTime.UtcNow - ultimoVoto).TotalMinutes;
                }

                feed.Add(new ProjectFeedItemDto
                {
                    Id = proyecto.Id,
                    Title = proyecto.Nombre,
                    Team = $"Participante #{proyecto.IdParticipante}",
                    Type = type,
                    Status = status,
                    MinutesAgo = minutesAgo
                });
            }

            // Ordenar por más reciente (menor minutesAgo primero), máximo 10
            return feed.OrderBy(f => f.MinutesAgo).Take(10).ToList();
        }
    }
}
