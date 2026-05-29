using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class OrgDashboardService : IOrgDashboardService
    {
        private readonly IEventoRepository _eventoRepository;
        private readonly IEventoUsuarioRepository _eventoUsuarioRepository;
        private readonly ICategoriaRepository _categoriaRepository;
        private readonly IProyectoRepository _proyectoRepository;
        private readonly IVotoRepository _votoRepository;
        private readonly IUsuarioRepository _usuarioRepository;

        public OrgDashboardService(
            IEventoRepository eventoRepository,
            IEventoUsuarioRepository eventoUsuarioRepository,
            ICategoriaRepository categoriaRepository,
            IProyectoRepository proyectoRepository,
            IVotoRepository votoRepository,
            IUsuarioRepository usuarioRepository)
        {
            _eventoRepository = eventoRepository;
            _eventoUsuarioRepository = eventoUsuarioRepository;
            _categoriaRepository = categoriaRepository;
            _proyectoRepository = proyectoRepository;
            _votoRepository = votoRepository;
            _usuarioRepository = usuarioRepository;
        }

        public async Task<OrgDashboardResponseDto> GetDashboardAsync(int eventoId)
        {
            try
            {
                var evento = await _eventoRepository.GetByIdAsync(eventoId)
                    ?? throw new Exception("Evento no encontrado.");

                var usuarios = await _eventoUsuarioRepository.GetByEventoAsync(eventoId);
                int totalParticipantes = usuarios.Count(u => u.Rol == "Participante");
                int totalPublico = usuarios.Count(u => u.Rol == "Publico");

                var categorias = await _categoriaRepository.ObtenerPorEventoIdAsync(eventoId);

                var todosProyectos = new List<Proyecto>();
                foreach (var cat in categorias)
                {
                    var proyectosCategoria = await _proyectoRepository.ObtenerPorCategoriaIdAsync(cat.Id);
                    todosProyectos.AddRange(proyectosCategoria);
                }

                var todosVotos = new List<VotoPublico>();
                foreach (var proyecto in todosProyectos)
                {
                    var votosProyecto = await _votoRepository.ObtenerPorProyectoIdAsync(proyecto.Id);
                    todosVotos.AddRange(votosProyecto);
                }

                var todosPesos = new List<PesoCategoriaRol>();
                foreach (var cat in categorias)
                {
                    var pesos = await _categoriaRepository.ObtenerPesosPorCategoriaIdAsync(cat.Id);
                    todosPesos.AddRange(pesos);
                }

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

                var proyectosConVotos = todosProyectos
                    .Count(p => todosVotos.Any(v => v.IdProyecto == p.Id));

                // Al menos 1 voto por jurado cuenta como "ha votado" para el porcentaje.
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

                var participanteIds = todosProyectos.Select(p => p.IdParticipante).Distinct().ToList();
                var todosUsuarios = new List<Usuario>();
                foreach (var pid in participanteIds)
                {
                    var user = await _usuarioRepository.GetByIdAsync(pid);
                    if (user != null)
                        todosUsuarios.Add(user);
                }

                var ranking = BuildRanking(todosProyectos, todosVotos, usuarios, todosPesos, todosUsuarios);
                var feed = BuildFeed(todosProyectos, todosVotos);

                var liveInfo = new LiveHeaderDto
                {
                    EventName = evento.Nombre,
                    Phase = DeterminarFase(evento),
                    FechaFin = evento.FechaFin,
                    EventCode = evento.CodEvento.ToString().PadLeft(6, '0')
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
                var success = await _eventoRepository.ExtenderTiempoAsync(eventoId, minutosExtra);
                if (!success)
                    throw new Exception("Evento no encontrado.");
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
                var success = await _eventoRepository.UpdateEstadoAsync(eventoId, "Cerrado");
                if (!success)
                    throw new Exception("Evento no encontrado.");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al cerrar la votación: {ex.Message}", ex);
            }
        }

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
            List<PesoCategoriaRol> pesos,
            List<Usuario> participantes)
        {
            var ranking = new List<RankingItemDto>();

            foreach (var proyecto in proyectos)
            {
                var votosDelProyecto = votos.Where(v => v.IdProyecto == proyecto.Id).ToList();

                var idsJurados = usuarios
                    .Where(u => u.Rol == "Jurado")
                    .Select(u => u.IdUsuario)
                    .ToHashSet();

                var votosJurado = votosDelProyecto.Where(v => v.IdEvaluador != null && idsJurados.Contains(v.IdEvaluador.Value)).ToList();
                var votosPublico = votosDelProyecto.Where(v => v.IdEvaluador == null || !idsJurados.Contains(v.IdEvaluador ?? 0)).ToList();

                var juryVotes = votosJurado.Where(v => v.Valor.HasValue).ToList();
                var publicVotes = votosPublico.Where(v => v.Valor.HasValue).ToList();

                float juryScore = juryVotes.Count > 0 ? juryVotes.Average(v => v.Valor!.Value) * 10f : 0f;
                float publicScore = publicVotes.Count > 0 ? publicVotes.Average(v => v.Valor!.Value) * 10f : 0f;


                var pesoJurado = pesos.FirstOrDefault(p => p.IdCategoria == proyecto.IdCategoria && p.RolVotante == "Jurado")?.Peso ?? 70f;
                var pesoPublico = pesos.FirstOrDefault(p => p.IdCategoria == proyecto.IdCategoria && p.RolVotante == "Publico")?.Peso ?? 30f;

                // Pesos vienen en base 100 desde la BD; se normalizan a decimal para el cálculo.
                if (pesoJurado > 1f || pesoPublico > 1f)
                {
                    pesoJurado /= 100f;
                    pesoPublico /= 100f;
                }

                float combinedScore = (juryScore * pesoJurado) + (publicScore * pesoPublico);

                var participante = participantes.FirstOrDefault(u => u.Id == proyecto.IdParticipante);
                var teamName = participante?.NombreCompleto ?? $"Participante #{proyecto.IdParticipante}";

                ranking.Add(new RankingItemDto
                {
                    Id = proyecto.Id,
                    Name = proyecto.Nombre,
                    Team = teamName,
                    Score = MathF.Round(combinedScore, 1),
                    JuryScore = MathF.Round(juryScore, 1),
                    IdCategoria = proyecto.IdCategoria ?? 0,
                    PublicScore = MathF.Round(publicScore, 1),
                    Trend = "stable" // TODO: comparar con snapshot anterior para calcular tendencia real
                });
            }

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

                string status = votosDelProyecto.Count == 0 ? "pending" : "ready";

                string type = "pdf";
                if (!string.IsNullOrEmpty(proyecto.UrlMultimedia))
                {
                    var url = proyecto.UrlMultimedia.ToLower();
                    if (url.Contains(".mp4") || url.Contains(".avi") || url.Contains(".mov") || url.Contains("video"))
                        type = "video";
                    else if (url.Contains(".fig") || url.Contains("mockup") || url.Contains("figma"))
                        type = "mockup";
                }

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

            return feed.OrderBy(f => f.MinutesAgo).Take(10).ToList();
        }
    }
}
