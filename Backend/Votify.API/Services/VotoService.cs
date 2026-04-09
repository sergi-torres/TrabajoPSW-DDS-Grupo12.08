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

        // Cache para categorías y proyectos (se obtienen una sola vez por sesión)
        private static List<Categoria>? _categoriasCache;
        private static List<Proyecto>? _proyectosCache;
        private static DateTime _cacheTimestamp = DateTime.MinValue;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30); // Cache por 30 minutos

        // Lista de votos realizados en esta sesión (Categoria + Proyecto)
        private static readonly List<(int CategoriaId, int ProyectoId)> VotosRealizados = new();

        public VotoService(ICategoriaRepository categoriaRepository, IProyectoRepository proyectoRepository, IVotoRepository votoRepository, IVotoFactory votoFactory)
        {
            _categoriaRepository = categoriaRepository;
            _proyectoRepository = proyectoRepository;
            _votoRepository = votoRepository;
            _votoFactory = votoFactory;
        }

        private async Task<(List<Categoria> categorias, List<Proyecto> proyectos)> ObtenerDatosCacheAsync()
        {
            // Si el cache está expirado o no existe, refrescar desde BD
            if (_categoriasCache == null || _proyectosCache == null || 
                DateTime.Now - _cacheTimestamp > CacheDuration)
            {
                _categoriasCache = await _categoriaRepository.ObtenerTodasAsync();
                _proyectosCache = await _proyectoRepository.ObtenerTodosAsync();
                
                // Inicializar propiedades no mapeadas para cada categoría
                foreach (var cat in _categoriasCache)
                {
                    cat.VotosRestantes = 3;
                    cat.Estado = "pendiente";
                }
                
                _cacheTimestamp = DateTime.Now;
            }

            return (_categoriasCache, _proyectosCache);
        }

        public async Task<DashboardResponseDto> ObtenerDashboardAsync()
        {
            try
            {
                var (categorias, todosProyectos) = await ObtenerDatosCacheAsync();

                var categoriasResumen = new List<CategoriaResumenDto>();

                foreach (var cat in categorias)
                {
                    // Filtrar proyectos por categoría, en un futuro sera en el repo
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

                return new DashboardResponseDto
                {
                    VotosGlobalesMaximos = categorias.Count * 3, // El 3 es default, en el sprint 2 será una varible
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
            // Obtener dashboard actual
            var dashboard = await ObtenerDashboardAsync();

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

                // Asignar IP y evaluador (para público, evaluador genérico)
                if (voto is VotoPublico votoPublico)
                {
                    votoPublico.IpDispositivo = "web"; // TODO: Obtener IP real
                    // Se debe usar un evaluador válido para cumplir la FK idevaluador -> usuario.id
                    votoPublico.IdEvaluador = 1; // Ajusta este valor si en tu tabla usuario tienes otro ID de usuario público válido
                }

                await _votoRepository.AgregarVotoAsync(voto);

                // Actualizar estado en memoria
                VotosRealizados.Add((request.CategoriaId, request.ProyectoId));

                Console.WriteLine($"[VOTO REGISTRADO] Cat: {categoria.Titulo} | Proyecto: {request.ProyectoId} | Total: {VotosRealizados.Count}");
            }

            return await ObtenerDashboardAsync();
        }
    }
}