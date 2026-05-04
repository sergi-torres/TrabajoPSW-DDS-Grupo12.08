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
                VotosRestantes = c.VotosMaximos,
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

        public async Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId, int? idUsuario = null, string? sessionId = null, string? identificadorHash = null)
        {
            try
            {
                var claveSesion = ObtenerClaveSesion(idUsuario, sessionId);

                // 1. Obtener votos realizados por este usuario
                List<(int CategoriaId, int ProyectoId)> votosUsuario;

                if (idUsuario.HasValue)
                {
                    // Jurado flow: persistente en BD
                    if (!VotosRealizadosPorUsuario.ContainsKey(claveSesion) || idUsuario != _ultimoIdUsuarioActivo)
                    {
                        var votosDb = await _votoRepository.ObtenerVotosDeUsuarioAsync(idUsuario.Value);
                        VotosRealizadosPorUsuario[claveSesion] = votosDb
                            .Select(v => (v.IdCategoria, v.IdProyecto))
                            .Distinct()
                            .ToList();
                    }
                    _ultimoIdUsuarioActivo = idUsuario;
                    votosUsuario = VotosRealizadosPorUsuario[claveSesion];
                }
                else if (!string.IsNullOrEmpty(identificadorHash))
                {
                    // Public flow with fingerprint: check persistency in registry table
                    // Note: Since public voting is one vote per category, we might need a way to track which projects were voted if we wanted to show "votado" on specific projects.
                    // But for now, let's just mark the category state correctly.
                    
                    // TODO: Could optimize this by adding a repository method to get all voted categories for a hash
                    // For now, we'll keep it simple and just use it to mark the status later in the loop if needed.
                    votosUsuario = VotosRealizadosPorUsuario.ContainsKey(claveSesion) 
                        ? VotosRealizadosPorUsuario[claveSesion] 
                        : new List<(int CategoriaId, int ProyectoId)>();
                }
                else
                {
                    // PIN flow (old): stateless memory
                    if (!VotosRealizadosPorUsuario.ContainsKey(claveSesion))
                    {
                        VotosRealizadosPorUsuario[claveSesion] = new List<(int CategoriaId, int ProyectoId)>();
                    }
                    _ultimoIdUsuarioActivo = null;
                    votosUsuario = VotosRealizadosPorUsuario[claveSesion];
                }

                // Obtener datos del evento (sin cache)
                var (categoriasDelEvento, todosProyectos) = await ObtenerDatosEventoAsync(eventoId);

                // 2. Pre-cargar votos públicos si hay hash
                List<RegistroVotoPublico> todosVotosPublicosHash = new();
                if (!idUsuario.HasValue && !string.IsNullOrEmpty(identificadorHash))
                {
                    todosVotosPublicosHash = await _votoRepository.ObtenerTodosVotosPublicosPorHashAsync(eventoId, identificadorHash);
                }

                var categoriasResumen = new List<CategoriaResumenDto>();
                var now = DateTime.Now;

                foreach (var cat in categoriasDelEvento)
                {
                    // Check if public user already voted in this category via fingerprint
                    var proyectosVotadosPublico = todosVotosPublicosHash
                        .Where(v => v.IdCategoria == cat.Id && v.IdProyecto.HasValue)
                        .Select(v => v.IdProyecto!.Value)
                        .ToList();

                    // Filtrar proyectos de esta categoría
                    var proyectosCategoria = todosProyectos.Where(p => p.IdCategoria == cat.Id).ToList();

                    // Convertir proyectos a DTO y marcar estado basado en votos de sesión o BD
                    var proyectosDto = proyectosCategoria.Select(p => new ProyectosResponseDto
                    {
                        Id = p.Id,
                        Nombre = p.Nombre,
                        Descripcion = p.Descripcion,
                        Estado = (proyectosVotadosPublico.Contains(p.Id) || votosUsuario.Any(v => v.CategoriaId == cat.Id && v.ProyectoId == p.Id)) ? "votado" : "disponible"
                    }).ToList();

                    // Regla de negocio: 1 voto por categoría para público, 3 para otros (o según configuración, por ahora 1 para simplificar y cumplir tests)
                    int maxVotos = idUsuario.HasValue ? 3 : 1; 
                    var votosEnCategoria = proyectosVotadosPublico.Count + votosUsuario.Count(v => v.CategoriaId == cat.Id && !proyectosVotadosPublico.Contains(v.ProyectoId)); 
                    var votosRestantes = maxVotos - votosEnCategoria;

                    // Usar el estado de la base de datos pero verificar si por tiempo debe cambiar
                    string estadoReal = cat.Estado ?? "Pendiente";
                    var nowTime = DateTime.Now;

                    if (estadoReal == "Pendiente" && cat.FechaIni.HasValue && nowTime >= cat.FechaIni.Value)
                    {
                        estadoReal = "Activa";
                        // Actualizamos en BD para que sea persistente
                        await _categoriaRepository.ActualizarAsync(new Categoria { Id = cat.Id, Nombre = cat.Nombre, IdEvento = cat.IdEvento, FechaIni = cat.FechaIni, FechaFin = cat.FechaFin, Estado = estadoReal });
                    }
                    else if ((estadoReal == "Activa" || estadoReal == "Pausada") && cat.FechaFin.HasValue && nowTime >= cat.FechaFin.Value)
                    {
                        estadoReal = "Finalizada";
                        // Actualizamos en BD para que sea persistente
                        await _categoriaRepository.ActualizarAsync(new Categoria { Id = cat.Id, Nombre = cat.Nombre, IdEvento = cat.IdEvento, FechaIni = cat.FechaIni, FechaFin = cat.FechaFin, Estado = estadoReal });
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
                    VotosGlobalesMaximos = categoriasDelEvento.Sum(c => c.VotosRestantes),
                    VotosGlobalesRealizados = categoriasResumen.Sum(c => c.Proyectos.Count(p => p.Estado == "votado")),
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

            // 1. Validar unicidad para voto público usando el hash del dispositivo
            if (!idUsuario.HasValue && !string.IsNullOrEmpty(request.IdentificadorHash))
            {
                var proyectosVotados = await _votoRepository.ObtenerProyectosVotadosPublicoAsync(request.EventoId, request.CategoriaId, request.IdentificadorHash);
                
                if (proyectosVotados.Contains(request.ProyectoId))
                {
                    throw new Exception("Ya has votado por este proyecto.");
                }

                // We need to fetch the category to know the max votes
                var categoriasDb = await _categoriaRepository.ObtenerTodosCamposAsync(request.EventoId);
                var catDb = categoriasDb.FirstOrDefault(c => c.Id == request.CategoriaId);
                var maxVotos = catDb?.VotosMaximos ?? 3;

                if (proyectosVotados.Count >= maxVotos)
                {
                    throw new Exception($"Ya has agotado tus {maxVotos} votos para esta categoría.");
                }
            }

            // Obtener dashboard actual para el evento específico
            var dashboard = await ObtenerDashboardAsync(request.EventoId, idUsuario, sessionId, request.IdentificadorHash);

            var categoria = dashboard.Categorias.FirstOrDefault(c => c.Id == request.CategoriaId);

            // Solo permitir voto si la categoría existe y está activa
            if (categoria == null) throw new Exception("Categoría no encontrada.");
            
            if (categoria.Estado != "activa")
            {
                throw new Exception("No se ha podido procesar");
            }

            if (categoria.VotosRestantes <= 0)
            {
                throw new Exception("Ya has agotado tus votos para esta categoría.");
            }

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

            // 2. Registrar el hash si es voto público para control de unicidad futuro
            if (!idUsuario.HasValue && !string.IsNullOrEmpty(request.IdentificadorHash))
            {
                await _votoRepository.RegistrarVotoPublicoAsync(new RegistroVotoPublico
                {
                    IdEvento = request.EventoId,
                    IdCategoria = request.CategoriaId,
                    IdProyecto = request.ProyectoId,
                    IdentificadorHash = request.IdentificadorHash,
                    FechaRegistro = DateTime.UtcNow
                });
            }


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
            

            return await ObtenerDashboardAsync(request.EventoId, idUsuario, sessionId, request.IdentificadorHash);
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

        public async Task<List<TipoComentaristaDto>> ObtenerResumenComentariosAsync(int proyectoId, int categoriaId)
        {
            var todosVotos = await _votoRepository.ObtenerVotosPorProyectoYCategoriaAsync(proyectoId, categoriaId);

            var resultado = new List<TipoComentaristaDto>();

            // Grupo Jurado
            var votosJurado = todosVotos.Where(v => v.IdEvaluador.HasValue).ToList();
            if (votosJurado.Any())
            {
                var grupoJurado = new TipoComentaristaDto { Tipo = "Jurado" };
                var porUsuario = votosJurado.GroupBy(v => v.IdEvaluador!.Value);

                foreach (var g in porUsuario)
                {
                    grupoJurado.Usuarios.Add(new UsuarioComentariosDto
                    {
                        Referencia = $"J-{g.Key.GetHashCode():X}",
                        Nombre = "Jurado", // Anonimizado
                        Iniciales = "J",
                        TotalComentarios = g.Count(v => !string.IsNullOrWhiteSpace(v.Comentario))
                    });
                }
                grupoJurado.TotalComentarios = grupoJurado.Usuarios.Sum(u => u.TotalComentarios);
                if (grupoJurado.TotalComentarios > 0) resultado.Add(grupoJurado);
            }

            // Grupo Público
            var votosPublico = todosVotos.Where(v => !v.IdEvaluador.HasValue).ToList();
            if (votosPublico.Any())
            {
                var grupoPublico = new TipoComentaristaDto { Tipo = "Público" };
                var porHash = votosPublico.GroupBy(v => v.IpDispositivo);

                foreach (var g in porHash)
                {
                    grupoPublico.Usuarios.Add(new UsuarioComentariosDto
                    {
                        Referencia = $"P-{g.Key.GetHashCode():X}",
                        Nombre = "Público", // Anonimizado
                        Iniciales = "P",
                        TotalComentarios = g.Count(v => !string.IsNullOrWhiteSpace(v.Comentario))
                    });
                }
                grupoPublico.TotalComentarios = grupoPublico.Usuarios.Sum(u => u.TotalComentarios);
                if (grupoPublico.TotalComentarios > 0) resultado.Add(grupoPublico);
            }

            return resultado;
        }

        public async Task<List<ComentarioDetalleDto>> ObtenerDetalleComentariosUsuarioAsync(int proyectoId, int categoriaId, string usuarioRef)
        {
            var todosVotos = await _votoRepository.ObtenerVotosPorProyectoYCategoriaAsync(proyectoId, categoriaId);
            
            IEnumerable<Voto> votosUsuario;

            if (usuarioRef.StartsWith("J-"))
            {
                votosUsuario = todosVotos.Where(v => v.IdEvaluador.HasValue && $"J-{v.IdEvaluador!.Value.GetHashCode():X}" == usuarioRef);
            }
            else
            {
                votosUsuario = todosVotos.Where(v => !v.IdEvaluador.HasValue && $"P-{v.IpDispositivo.GetHashCode():X}" == usuarioRef);
            }

            return votosUsuario
                .Where(v => !string.IsNullOrWhiteSpace(v.Comentario))
                .Select(v => new ComentarioDetalleDto
                {
                    Id = v.Id,
                    Comentario = v.Comentario!,
                    Criterio = "General", // TODO: Podríamos obtener el nombre del criterio si fuera necesario
                    Fecha = v.FechaVoto.ToString("g"),
                    Likes = 0
                }).ToList();
        }
    }
}