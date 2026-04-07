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

        // Lista de votos realizados en esta sesión (Categoria + Proyecto)
        private static readonly List<(int CategoriaId, int ProyectoId)> VotosRealizados = new();

        public VotoService(ICategoriaRepository categoriaRepository, IProyectoRepository proyectoRepository, IVotoRepository votoRepository, IVotoFactory votoFactory)
        {
            _categoriaRepository = categoriaRepository;
            _proyectoRepository = proyectoRepository;
            _votoRepository = votoRepository;
            _votoFactory = votoFactory;
        }

        public async Task<DashboardResponseDto> ObtenerDashboardAsync()
        {
            var categorias = await _categoriaRepository.ObtenerTodasAsync();
            var todosProyectos = await _proyectoRepository.ObtenerTodosAsync();

            var categoriasResumen = new List<CategoriaResumenDto>();

            foreach (var cat in categorias)
            {
                // Filtrar proyectos por categoría
                var proyectosCategoria = todosProyectos.Where(p => p.IdCategoria == cat.Id).ToList();

                // Convertir proyectos a DTO y marcar estado basado en votos de sesión
                var proyectosDto = proyectosCategoria.Select(p => new ProyectosResponseDto
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Estado = VotosRealizados.Any(v => v.CategoriaId == cat.Id && v.ProyectoId == p.Id) ? "votado" : "disponible"
                }).ToList();

                categoriasResumen.Add(new CategoriaResumenDto
                {
                    Id = cat.Id,
                    Titulo = cat.Nombre,
                    VotosRestantes = cat.VotosRestantes,
                    Estado = cat.Estado,
                    Proyectos = proyectosDto
                });
            }

            return new DashboardResponseDto
            {
                VotosGlobalesMaximos = 6, // TODO: Obtener de configuración
                VotosGlobalesRealizados = VotosRealizados.Count,
                ProyectosActivos = categoriasResumen.Sum(c => c.Proyectos.Count),
                TiempoRestante = "05:00", // TODO: Calcular tiempo real
                Categorias = categoriasResumen
            };
        }

        public DashboardResponseDto ObtenerDashboard()
        {
            // Para compatibilidad, llamar al async y esperar
            return ObtenerDashboardAsync().GetAwaiter().GetResult();
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
                    idCriterio: 1, // TODO: Definir criterio apropiado
                    comentario: request.Comentario,
                    urlAudio: null // No hay audio en esta implementación
                );

                // Asignar IP y evaluador (para público, evaluador genérico)
                if (voto is VotoPublico votoPublico)
                {
                    votoPublico.IpDispositivo = "web"; // TODO: Obtener IP real
                    votoPublico.IdEvaluador = 1; // TODO: Obtener usuario actual
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