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
        private readonly IVotoFactory _votoFactory;

        // Cache por evento durante la sesión de votación (categorías y proyectos no cambian durante votación)
        private static readonly Dictionary<int, (List<Categoria> categorias, List<Proyecto> proyectos, DateTime timestamp)> _eventosCache = new();
        // Cache por 4 horas, esto dependerá del limite que querramos dejar para todas las votaciones 
        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(4); 
        
        private static readonly List<(int CategoriaId, int ProyectoId)> VotosRealizados = new();

        public VotoService(ICategoriaRepository categoriaRepository, IProyectoRepository proyectoRepository, IVotoRepository votoRepository, IVotoFactory votoFactory)
        {
            _categoriaRepository = categoriaRepository;
            _proyectoRepository = proyectoRepository;
            _votoRepository = votoRepository;
            _votoFactory = votoFactory;
        }

        private async Task<(List<Categoria> categorias, List<Proyecto> proyectos)> ObtenerDatosEventoCacheAsync(int eventoId)
        {
            Console.WriteLine($"[DEBUG] ObtenerDatosEventoCacheAsync llamado con eventoId: {eventoId}");
            
            // Si el evento no está en cache o está expirado, cargar desde BD
            if (!_eventosCache.ContainsKey(eventoId) || 
                DateTime.Now - _eventosCache[eventoId].timestamp > CacheDuration)
            {
                Console.WriteLine($"[DEBUG] Cache NO encontrado para evento {eventoId}, cargando desde BD...");
                
                var categorias = await _categoriaRepository.ObtenerPorEventoIdAsync(eventoId);
                Console.WriteLine($"[DEBUG] Se encontraron {categorias.Count} categorías para evento {eventoId}");
                
                var proyectos = new List<Proyecto>();

                
                foreach (var categoria in categorias)
                {
                    categoria.VotosRestantes = 3;//por defecto , será una variable en el futuro
                    categoria.Estado = "pendiente";
                    var proyectosCategoria = await _proyectoRepository.ObtenerPorCategoriaIdAsync(categoria.Id);
                    Console.WriteLine($"[DEBUG] Categoría {categoria.Id}: {proyectosCategoria.Count} proyectos");
                    proyectos.AddRange(proyectosCategoria);
                }
                
                Console.WriteLine($"[DEBUG] Total de proyectos cargados: {proyectos.Count}");
                _eventosCache[eventoId] = (categorias, proyectos, DateTime.Now);
                Console.WriteLine($"[CACHE] Datos del evento {eventoId} cargados en cache");
            }
            else
            {
                Console.WriteLine($"[CACHE] Usando datos cacheados del evento {eventoId}");
            }

            return (_eventosCache[eventoId].categorias, _eventosCache[eventoId].proyectos);
        }

        public async Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId)
        {
            try
            {
                Console.WriteLine($"[DEBUG] ObtenerDashboardAsync llamado con eventoId: {eventoId}");
                
                // Obtener datos del evento (con cache inteligente)
                var (categoriasDelEvento, todosProyectos) = await ObtenerDatosEventoCacheAsync(eventoId);

                Console.WriteLine($"[DEBUG] Después de cache: {categoriasDelEvento.Count} categorías, {todosProyectos.Count} proyectos");

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
                        Estado = VotosRealizados.Any(v => v.CategoriaId == cat.Id && v.ProyectoId == p.Id) ? "votado" : "disponible"
                    }).ToList();

                    var votosEnCategoria = VotosRealizados.Count(v => v.CategoriaId == cat.Id);
                    var votosRestantes = 3 - votosEnCategoria; // Usar valor inicial 3
                    var estadoCategoria = votosRestantes <= 0 ? "completado" : "pendiente";

                    categoriasResumen.Add(new CategoriaResumenDto
                    {
                        Id = cat.Id,
                        Titulo = cat.Nombre, // Mapear 'nombre' de BD a 'titulo' del DTO
                        VotosRestantes = Math.Max(0, votosRestantes),
                        Estado = estadoCategoria,
                        Proyectos = proyectosDto
                    });
                }

                Console.WriteLine($"[DEBUG] Retornando {categoriasResumen.Count} categorías en resumen");

                return new DashboardResponseDto
                {
                    VotosGlobalesMaximos = categoriasDelEvento.Count * 3, // El 3 es default, en el sprint 2 será una varible
                    VotosGlobalesRealizados = VotosRealizados.Count,
                    ProyectosActivos = categoriasResumen.Sum(c => c.Proyectos.Count),
                    TiempoRestante = "05:00", // TODO: Calcular tiempo real, su funcion no entra en este sprint1
                    Categorias = categoriasResumen
                };
            }
            catch (Exception ex)
            {
                // Agregar más información de debug
                throw new Exception($"Error obteniendo dashboard: {ex.Message}. Inner: {ex.InnerException?.Message}", ex);
            }
        }

        public async Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request)
        {
            // Obtener dashboard actual para el evento específico
            var dashboard = await ObtenerDashboardAsync(request.EventoId);

            var categoria = dashboard.Categorias.FirstOrDefault(c => c.Id == request.CategoriaId);

            if (categoria != null && categoria.VotosRestantes > 0)
            {
                // Crear voto usando el patrón Factory
                var voto = _votoFactory.CrearVoto(
                    proyectoId: request.ProyectoId,
                    valorBase: 1.0f, // Valor por defecto para público
                    idCategoria: request.CategoriaId,
                    idCriterio: 1, // TODO: Esto en el futuro seguramente será una lista de criterios
                    comentario: request.Comentario,
                    urlAudio: null // No hay audio en esta implementación
                );

                // Asignar IP y evaluador (para público, sin ID de usuario)
                if (voto is VotoPublico votoPublico)
                {
                    votoPublico.IpDispositivo = "web"; // TODO: Obtener IP real
                    votoPublico.IdEvaluador = null; // Los votos públicos no tienen evaluador asignado
                }

                await _votoRepository.AgregarVotoAsync(voto);

                // Actualizar estado en memoria
                VotosRealizados.Add((request.CategoriaId, request.ProyectoId));

                Console.WriteLine($"[VOTO REGISTRADO] Cat: {categoria.Titulo} | Proyecto: {request.ProyectoId} | Total: {VotosRealizados.Count}");
            }

            return await ObtenerDashboardAsync(request.EventoId);
        }
    }
}