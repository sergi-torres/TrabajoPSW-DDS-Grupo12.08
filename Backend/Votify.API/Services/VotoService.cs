using Votify.API.Models.Domain.Factories;
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
        private readonly IComentarioCualitativoService _comentarioService;

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
            VotoJuradoFactory votoJuradoFactory,
            IComentarioCualitativoService comentarioService)
        {
            _categoriaRepository = categoriaRepository;
            _proyectoRepository = proyectoRepository;
            _votoRepository = votoRepository;
            _votoPublicoFactory = votoPublicoFactory;
            _votoJuradoFactory = votoJuradoFactory;
            _comentarioService = comentarioService;
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

        private async Task<(List<CategoriaConPesos> categorias, List<Proyecto> proyectos)>
        ObtenerDatosEventoAsync(int eventoId)
        {
            var categoriasDb = await _categoriaRepository.ObtenerTodosCamposAsync(eventoId);

            var categorias = categoriasDb.Select(c => new CategoriaConPesos
            {
                Id = c.Id,
                Nombre = c.Nombre,
                IdEvento = c.IdEvento,
                FechaIni = c.FechaIni,
                FechaFin = c.FechaFin,
                Estado = c.Estado,
                VotosRestantes = 3,
                PesosPorRol = new List<PesoCategoriaRol>()
            }).ToList();

            var proyectos = new List<Proyecto>();

            foreach (var categoria in categorias)
            {
                var proyectosCategoria =
                    await _proyectoRepository.ObtenerPorCategoriaIdAsync(categoria.Id);

                proyectos.AddRange(proyectosCategoria);
            }

            return (categorias, proyectos);
        }

        public async Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId, int? idUsuario = null, string? sessionId = null)
        {
            try
            {
                var claveSesion = ObtenerClaveSesion(idUsuario, sessionId);

                // Detectar cambio de usuario (nuevo Jurado = reset a zero state) o inicializar si el server acaba de reiniciar
                if (idUsuario.HasValue)
                {
                    if (!VotosRealizadosPorUsuario.ContainsKey(claveSesion) || idUsuario != _ultimoIdUsuarioActivo)
                    {
                        var votosDb = await _votoRepository.ObtenerVotosDeUsuarioAsync(idUsuario.Value);
                        VotosRealizadosPorUsuario[claveSesion] = votosDb
                            .Select(v => (v.IdCategoria, v.IdProyecto))
                            .Distinct()
                            .ToList();
                    }
                    _ultimoIdUsuarioActivo = idUsuario;
                }

                // PIN flow: siempre inicializa lista como vacía (stateless)
                if (!idUsuario.HasValue && !VotosRealizadosPorUsuario.ContainsKey(claveSesion))
                {
                    VotosRealizadosPorUsuario[claveSesion] = new List<(int CategoriaId, int ProyectoId)>();
                    _ultimoIdUsuarioActivo = null;
                }

                // Obtener datos del evento (sin cache)
                var (categoriasDelEvento, todosProyectos) = await ObtenerDatosEventoAsync(eventoId);

                // Obtener votos realizados por este usuario (o PIN si es anónimo)
                var votosUsuario = VotosRealizadosPorUsuario.ContainsKey(claveSesion)
                    ? VotosRealizadosPorUsuario[claveSesion]
                    : new List<(int CategoriaId, int ProyectoId)>();

                var categoriasResumen = new List<CategoriaResumenDto>();
                var now = DateTime.Now;

                foreach (var cat in categoriasDelEvento)
                {
                    // Filtrar proyectos de esta categoría
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

                    // Calcular el estado dinámico basado en las fechas
                    bool isActiva = true;
                    if (cat.FechaIni.HasValue && now < cat.FechaIni.Value) isActiva = false;
                    if (cat.FechaFin.HasValue && now > cat.FechaFin.Value) isActiva = false;

                    string estadoReal = "Activa";
                    if (!isActiva)
                    {
                        if (cat.FechaIni.HasValue && now < cat.FechaIni.Value)
                            estadoReal = "Pendiente";
                        else
                            estadoReal = "Finalizada";
                    }

                    // Si el estado real en base a tiempo difiere del que está en BD, lo actualizamos
                    if (cat.Estado != estadoReal)
                    {
                        cat.Estado = estadoReal;
                        // Actualizar la categoría en base de datos para mantener consistencia
                        await _categoriaRepository.ActualizarAsync(new Categoria
                        {
                            Id = cat.Id,
                            Nombre = cat.Nombre,
                            IdEvento = cat.IdEvento,
                            FechaIni = cat.FechaIni,
                            FechaFin = cat.FechaFin,
                            Estado = cat.Estado
                        });
                    }

                    // Calcular estado final para el frontend. Si no le quedan votos, es "completado" sin importar la fecha (a menos que esté finalizada/pendiente en cuyo caso también se bloquea).
                    string estadoFrontend = estadoReal.ToLower(); // "activa", "pendiente", "finalizada"
                    if (estadoReal == "Activa" && votosRestantes <= 0)
                    {
                        estadoFrontend = "completado";
                    }

                    categoriasResumen.Add(new CategoriaResumenDto
                    {
                        Id = cat.Id,
                        Titulo = cat.Nombre,
                        VotosRestantes = Math.Max(0, votosRestantes),
                        Estado = estadoFrontend,
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

            // Solo permitir voto si la categoría está activa y quedan votos. Si el frontend envía un voto en estado completado o finalizada, lo rechazamos.
            if (categoria != null && categoria.VotosRestantes > 0 && categoria.Estado == "activa")
            {
                var factory = await ObtenerFactoryPorRolAsync(request.EventoId, idUsuario);

                // Crear voto usando el patrón Factory
                var voto = factory.CrearVoto(
                    proyectoId: request.ProyectoId,
                    valorBase: request.Valor, 
                    idCategoria: request.CategoriaId,
                    idCriterio: request.IdCriterio ?? 1, // Fallback a 1 si no se envía (Público)
                    comentario: request.Comentario,
                    urlAudio: null,
                    idUsuario: idUsuario,
                    ipDispositivo: "web" // TODO: Obtener IP real
                );

                var votoCreado = await _votoRepository.AgregarVotoAsync(voto);


                // CREAR COMENTARIO
                if (!string.IsNullOrWhiteSpace(request.Comentario))
                {
                    await _comentarioService.CreateComentarioAsync(
                        votoCreado.Id,
                        request.Comentario
                    );
                }


                // Actualizar estado en memoria para este usuario
                if (!VotosRealizadosPorUsuario.ContainsKey(claveSesion))
                {
                    VotosRealizadosPorUsuario[claveSesion] = new List<(int CategoriaId, int ProyectoId)>();
                }
                VotosRealizadosPorUsuario[claveSesion].Add((request.CategoriaId, request.ProyectoId));
            }

            return await ObtenerDashboardAsync(request.EventoId, idUsuario, sessionId);
        }

        public async Task<DashboardResponseDto> ProcesarVotoBatchAsync(VotoBatchRequestDto request)
        {
            var idUsuario = request.IdUsuario;
            var sessionId = request.SessionId;
            var claveSesion = ObtenerClaveSesion(idUsuario, sessionId);

            // Obtener dashboard actual para verificar VotosRestantes
            var dashboard = await ObtenerDashboardAsync(request.EventoId, idUsuario, sessionId);
            var categoria = dashboard.Categorias.FirstOrDefault(c => c.Id == request.CategoriaId);

            if (categoria == null || categoria.VotosRestantes <= 0 || categoria.Estado != "activa")
            {
                throw new Exception("No se puede votar: la categoría no está activa o no quedan votos.");
            }

            var factory = await ObtenerFactoryPorRolAsync(request.EventoId, idUsuario);

            int? primerVotoId = null;
            string? comentarioPrimerVoto = null;

            // Crear y persistir un voto por cada criterio evaluado
            for (int i = 0; i < request.Evaluaciones.Count; i++)
            {
                var evaluacion = request.Evaluaciones[i];
                var voto = factory.CrearVoto(
                    proyectoId: request.ProyectoId,
                    valorBase: evaluacion.Valor,
                    idCategoria: request.CategoriaId,
                    idCriterio: evaluacion.CriterioId,
                    comentario: evaluacion.Comentario,
                    urlAudio: null,
                    idUsuario: idUsuario,
                    ipDispositivo: "web"
                );

                var votoCreado = await _votoRepository.AgregarVotoAsync(voto);
                
                if (i == 0)
                {
                    primerVotoId = votoCreado.Id;
                    comentarioPrimerVoto = evaluacion.Comentario;
                }
                else
                {
                    // Crear comentario cualitativo por criterio si hay texto
                    if (!string.IsNullOrWhiteSpace(evaluacion.Comentario))
                    {
                        await _comentarioService.CreateComentarioAsync(
                            votoCreado.Id,
                            evaluacion.Comentario
                        );
                    }
                }
            }

            // Guardar el comentario global del proyecto y el del primer criterio en un solo registro
            if (primerVotoId.HasValue)
            {
                var comentariosACombinar = new List<string>();
                if (!string.IsNullOrWhiteSpace(request.ComentarioGlobal))
                {
                    comentariosACombinar.Add($"[GENERAL] {request.ComentarioGlobal}");
                }
                if (!string.IsNullOrWhiteSpace(comentarioPrimerVoto))
                {
                    comentariosACombinar.Add(comentarioPrimerVoto);
                }

                if (comentariosACombinar.Any())
                {
                    await _comentarioService.CreateComentarioAsync(
                        primerVotoId.Value,
                        string.Join("\n\n---\n\n", comentariosACombinar)
                    );
                }
            }

            // Registrar como UN SOLO voto en la categoría (no uno por criterio)
            if (!VotosRealizadosPorUsuario.ContainsKey(claveSesion))
            {
                VotosRealizadosPorUsuario[claveSesion] = new List<(int CategoriaId, int ProyectoId)>();
            }
            VotosRealizadosPorUsuario[claveSesion].Add((request.CategoriaId, request.ProyectoId));

            return await ObtenerDashboardAsync(request.EventoId, idUsuario, sessionId);
        }

        public async Task<IEnumerable<VotoResponseDto>> ObtenerVotosPorProyectoAsync(int proyectoId)
        {
            var votos = await _votoRepository.ObtenerPorProyectoIdAsync(proyectoId);

            var votosPorProyecto = votos.Select(v => new VotoResponseDto
            {
                Id = v.Id,
                ProyectoId = v.IdProyecto,
                CategoriaId = v.IdCategoria,
                Comentario = v.Comentario,
                Fecha = v.FechaVoto,
            });

            return votosPorProyecto;
        }
    }
}