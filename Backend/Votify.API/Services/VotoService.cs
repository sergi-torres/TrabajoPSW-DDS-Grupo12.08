using Votify.API.Factories;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class VotoService : IVotoService
    {
        private readonly ICategoriaRepository _categoriaRepository;
        private readonly IProyectoRepository _proyectoRepository;
        private readonly IVotoRepository _votoRepository;
        private readonly VotoPublicoFactory _votoPublicoFactory;
        private readonly VotoJuradoFactory _votoJuradoFactory;

        // Cache por evento durante la sesión de votación (categorías y proyectos no cambian durante votación)
        private static readonly Dictionary<int, (List<Categoria> categorias, List<Proyecto> proyectos, DateTime timestamp)> _eventosCache = new();
        // Cache por 4 horas, esto dependerá del limite que querramos dejar para todas las votaciones 
        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(4);
        
        // Votos segregados por clave de sesión:
        // Jurado => "U:{idUsuario}"
        // Público => "P:{sessionId}"
        private static readonly Dictionary<string, List<(int CategoriaId, int ProyectoId)>> VotosRealizadosPorUsuario = new();
        
        // Track último usuario activo para detectar cambio de sesión (nuevo Jurado = reset a zero)
        private static int? _ultimoIdUsuarioActivo = null;

        private static string ObtenerClaveSesion(int? idUsuario, string? sessionId)
        {
            if (idUsuario.HasValue)
            {
                return $"U:{idUsuario.Value}";
            }

            var safeSessionId = string.IsNullOrWhiteSpace(sessionId) ? "anon-default" : sessionId.Trim();
            return $"P:{safeSessionId}";
        }

        public VotoService(
            ICategoriaRepository categoriaRepository,
            IProyectoRepository proyectoRepository,
            IVotoRepository votoRepository,
            VotoPublicoFactory votoPublicoFactory,
            VotoJuradoFactory votoJuradoFactory)
        {
            _categoriaRepository = categoriaRepository;
            _proyectoRepository = proyectoRepository;
            _votoRepository = votoRepository;
            _votoPublicoFactory = votoPublicoFactory;
            _votoJuradoFactory = votoJuradoFactory;
        }

        private async Task<IVotoFactory> ObtenerFactoryPorRolAsync(int eventoId, int? idUsuario)
        {
            if (!idUsuario.HasValue)
            {
                return _votoPublicoFactory;
            }

            var rol = await _votoRepository.ObtenerRolUsuarioEnEventoAsync(idUsuario.Value, eventoId);
            if (string.IsNullOrWhiteSpace(rol))
            {
                throw new Exception("El usuario no pertenece al evento o no tiene rol asignado.");
            }

            return rol.Equals("Jurado", StringComparison.OrdinalIgnoreCase)
                ? _votoJuradoFactory
                : _votoPublicoFactory;
        }

        private async Task<(List<Categoria> categorias, List<Proyecto> proyectos)> ObtenerDatosEventoCacheAsync(int eventoId)
        {
            // Si el evento no está en cache o está expirado, cargar desde BD
            if (!_eventosCache.ContainsKey(eventoId) || 
                DateTime.Now - _eventosCache[eventoId].timestamp > CacheDuration)
            {
                var categorias = await _categoriaRepository.ObtenerPorEventoIdAsync(eventoId);
                
                var proyectos = new List<Proyecto>();

                
                foreach (var categoria in categorias)
                {
                    categoria.VotosRestantes = 3;//por defecto , será una variable en el futuro
                    categoria.Estado = "pendiente";
                    var proyectosCategoria = await _proyectoRepository.ObtenerPorCategoriaIdAsync(categoria.Id);
                    proyectos.AddRange(proyectosCategoria);
                }
                
                _eventosCache[eventoId] = (categorias, proyectos, DateTime.Now);
            }

            return (_eventosCache[eventoId].categorias, _eventosCache[eventoId].proyectos);
        }

        public async Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId, int? idUsuario = null, string? sessionId = null)
        {
            try
            {
            var claveSesion = ObtenerClaveSesion(idUsuario, sessionId);

                // Detectar cambio de usuario (nuevo Jurado = reset a zero state)
                if (idUsuario.HasValue && idUsuario != _ultimoIdUsuarioActivo)
                {
                    // Nuevo usuario Jurado: inicializar su lista como vacía
                    if (!VotosRealizadosPorUsuario.ContainsKey(claveSesion))
                    {
                        VotosRealizadosPorUsuario[claveSesion] = new List<(int CategoriaId, int ProyectoId)>();
                    }
                    _ultimoIdUsuarioActivo = idUsuario;
                }

                // PIN flow: siempre inicializa lista como vacía (stateless)
                if (!idUsuario.HasValue && !VotosRealizadosPorUsuario.ContainsKey(claveSesion))
                {
                    VotosRealizadosPorUsuario[claveSesion] = new List<(int CategoriaId, int ProyectoId)>();
                    _ultimoIdUsuarioActivo = null;
                }

                // Obtener datos del evento (con cache inteligente)
                var (categoriasDelEvento, todosProyectos) = await ObtenerDatosEventoCacheAsync(eventoId);

                // Obtener votos realizados por este usuario (o PIN si es anónimo)
                var votosUsuario = VotosRealizadosPorUsuario.ContainsKey(claveSesion) 
                    ? VotosRealizadosPorUsuario[claveSesion] 
                    : new List<(int CategoriaId, int ProyectoId)>();

                var categoriasResumen = new List<CategoriaResumenDto>();

                foreach (var cat in categoriasDelEvento)
                {
                    // Filtrar proyectos de esta categoría desde el cache
                    var proyectosCategoria = todosProyectos.Where(p => p.IdCategoria == cat.Id).ToList();

                    // Convertir proyectos a DTO y marcar estado basado en votos de sesión
                    var proyectosDto = proyectosCategoria.Select(p => new ProyectosResponseDto
                    {
                        Id = p.Id,
                        Nombre = p.Nombre,
                        Descripcion = p.Descripcion,
                        Estado = votosUsuario.Any(v => v.CategoriaId == cat.Id && v.ProyectoId == p.Id) ? "votado" : "disponible"
                    }).ToList();

                    var votosEnCategoria = votosUsuario.Count(v => v.CategoriaId == cat.Id);
                    var votosRestantes = 3 - votosEnCategoria; // Usar valor inicial 3
                    var estadoCategoria = votosRestantes <= 0 ? "completado" : "pendiente";

                    categoriasResumen.Add(new CategoriaResumenDto
                    {
                        Id = cat.Id,
                        Titulo = cat.Nombre, 
                        VotosRestantes = Math.Max(0, votosRestantes),
                        Estado = estadoCategoria,
                        Proyectos = proyectosDto
                    });
                }

                return new DashboardResponseDto
                {
                    VotosGlobalesMaximos = categoriasDelEvento.Count * 3,
                    VotosGlobalesRealizados = votosUsuario.Count,
                    ProyectosActivos = categoriasResumen.Sum(c => c.Proyectos.Count),
                    TiempoRestante = "05:00",
                    Categorias = categoriasResumen
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error obteniendo dashboard: {ex.Message}. Inner: {ex.InnerException?.Message}", ex);
            }
        }

        public async Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request, int? idUsuario = null, string? sessionId = null)
        {
            var claveSesion = ObtenerClaveSesion(idUsuario, sessionId);

            // Obtener dashboard actual para el evento específico
            var dashboard = await ObtenerDashboardAsync(request.EventoId, idUsuario, sessionId);

            var categoria = dashboard.Categorias.FirstOrDefault(c => c.Id == request.CategoriaId);

            if (categoria != null && categoria.VotosRestantes > 0)
            {
                var factory = await ObtenerFactoryPorRolAsync(request.EventoId, idUsuario);

                // Crear voto usando el patrón Factory
                var voto = factory.CrearVoto(
                    proyectoId: request.ProyectoId,
                    valorBase: 1.0f, // Valor por defecto para público
                    idCategoria: request.CategoriaId,
                    idCriterio: 1, // TODO: Esto en el futuro seguramente será una lista de criterios
                    comentario: request.Comentario,
                    urlAudio: null
                );

                // Asignar propiedades según tipo de usuario
                if (voto is VotoPublico votoPublico)
                {
                    votoPublico.IpDispositivo = "web"; // TODO: Obtener IP real
                    votoPublico.IdEvaluador = null;
                }

                if (voto is VotoJurado votoJurado)
                {
                    votoJurado.IpDispositivo = "web"; // TODO: Obtener IP real
                    votoJurado.IdEvaluador = idUsuario;
                }

                await _votoRepository.AgregarVotoAsync(voto);

                // Actualizar estado en memoria para este usuario
                if (!VotosRealizadosPorUsuario.ContainsKey(claveSesion))
                {
                    VotosRealizadosPorUsuario[claveSesion] = new List<(int CategoriaId, int ProyectoId)>();
                }
                VotosRealizadosPorUsuario[claveSesion].Add((request.CategoriaId, request.ProyectoId));
            }

            return await ObtenerDashboardAsync(request.EventoId, idUsuario, sessionId);
        }
    }
}