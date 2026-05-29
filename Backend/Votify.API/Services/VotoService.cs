using Votify.API.Models.Domain.Factories;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;
using Votify.API.Helpers;

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

        private static readonly Dictionary<string, List<(int CategoriaId, int ProyectoId)>> VotosRealizadosPorUsuario = new();
        private static int? _ultimoIdUsuarioActivo = null;

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
                var claveSesion = SessionHelper.ObtenerClaveSesion(idUsuario, sessionId);
                var votosUsuario = await DeterminarVotosUsuarioAsync(idUsuario, claveSesion, identificadorHash);

                var (categoriasDelEvento, todosProyectos) = await ObtenerDatosEventoAsync(eventoId);

                // Carga todos los votos públicos del hash de una vez para evitar N consultas al iterar categorías.
                List<RegistroVotoPublico> todosVotosPublicosHash = new();
                if (!idUsuario.HasValue && !string.IsNullOrEmpty(identificadorHash))
                {
                    todosVotosPublicosHash = await _votoRepository.ObtenerTodosVotosPublicosPorHashAsync(eventoId, identificadorHash);
                }

                var categoriasResumen = new List<CategoriaResumenDto>();
                var nowTime = DateTime.Now;

                foreach (var cat in categoriasDelEvento)
                {
                    var proyectosVotadosPublico = todosVotosPublicosHash
                        .Where(v => v.IdCategoria == cat.Id && v.IdProyecto.HasValue)
                        .Select(v => v.IdProyecto!.Value)
                        .ToList();

                    var proyectosCategoria = todosProyectos.Where(p => p.IdCategoria == cat.Id).ToList();

                    var proyectosDto = proyectosCategoria.Select(p => new ProyectosResponseDto
                    {
                        Id = p.Id,
                        Nombre = p.Nombre,
                        Descripcion = p.Descripcion,
                        Estado = (proyectosVotadosPublico.Contains(p.Id) || votosUsuario.Any(v => v.CategoriaId == cat.Id && v.ProyectoId == p.Id)) ? "votado" : "disponible"
                    }).ToList();

                    int maxVotos = cat.VotosRestantes;
                    var votosEnCategoria = proyectosVotadosPublico.Count + votosUsuario.Count(v => v.CategoriaId == cat.Id && !proyectosVotadosPublico.Contains(v.ProyectoId));
                    var votosRestantes = maxVotos - votosEnCategoria;

                    string estadoReal = cat.Estado ?? "Pendiente";

                    bool haLlegadoLaFechaDeInicio = cat.FechaIni.HasValue && nowTime >= cat.FechaIni.Value;
                    bool haLlegadoLaFechaDeFin = cat.FechaFin.HasValue && nowTime >= cat.FechaFin.Value;
                    bool estaEnFaseDeVotacion = estadoReal == "Activa" || estadoReal == "Pausada";

                    if (estadoReal == "Pendiente" && haLlegadoLaFechaDeInicio)
                    {
                        estadoReal = "Activa";
                        await _categoriaRepository.ActualizarAsync(new Categoria { Id = cat.Id, Nombre = cat.Nombre, IdEvento = cat.IdEvento, FechaIni = cat.FechaIni, FechaFin = cat.FechaFin, Estado = estadoReal, VotosMaximos = cat.VotosRestantes });
                    }
                    else if (estaEnFaseDeVotacion && haLlegadoLaFechaDeFin)
                    {
                        estadoReal = "Finalizada";
                        await _categoriaRepository.ActualizarAsync(new Categoria { Id = cat.Id, Nombre = cat.Nombre, IdEvento = cat.IdEvento, FechaIni = cat.FechaIni, FechaFin = cat.FechaFin, Estado = estadoReal, VotosMaximos = cat.VotosRestantes });
                    }

                    // "completado": el usuario agotó sus votos en esta categoría pero ésta sigue activa para otros.
                    string estadoFrontend = estadoReal.ToLower();
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

        private async Task<List<(int CategoriaId, int ProyectoId)>> DeterminarVotosUsuarioAsync(int? idUsuario, string claveSesion, string? identificadorHash)
        {
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
                return VotosRealizadosPorUsuario[claveSesion];
            }

            if (!string.IsNullOrEmpty(identificadorHash))
            {
                return VotosRealizadosPorUsuario.ContainsKey(claveSesion)
                    ? VotosRealizadosPorUsuario[claveSesion]
                    : new List<(int CategoriaId, int ProyectoId)>();
            }

            if (!VotosRealizadosPorUsuario.ContainsKey(claveSesion))
            {
                VotosRealizadosPorUsuario[claveSesion] = new List<(int CategoriaId, int ProyectoId)>();
            }
            _ultimoIdUsuarioActivo = null;
            return VotosRealizadosPorUsuario[claveSesion];
        }

        public async Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request, int? idUsuario = null, string? sessionId = null)
        {
            var claveSesion = SessionHelper.ObtenerClaveSesion(idUsuario, sessionId);

            if (!idUsuario.HasValue && !string.IsNullOrEmpty(request.IdentificadorHash))
            {
                var proyectosVotados = await _votoRepository.ObtenerProyectosVotadosPublicoAsync(request.EventoId, request.CategoriaId, request.IdentificadorHash);

                if (proyectosVotados.Contains(request.ProyectoId))
                    throw new Exception("Ya has votado por este proyecto.");

                var categoriasDb = await _categoriaRepository.ObtenerTodosCamposAsync(request.EventoId);
                var catDb = categoriasDb.FirstOrDefault(c => c.Id == request.CategoriaId);
                // Default 3 coincide con el default de la columna votosmaximos en la BD.
                var maxVotos = catDb?.VotosMaximos ?? 3;

                if (proyectosVotados.Count >= maxVotos)
                    throw new Exception($"Ya has agotado tus {maxVotos} votos para esta categoría.");
            }

            var dashboard = await ObtenerDashboardAsync(request.EventoId, idUsuario, sessionId, request.IdentificadorHash);

            var categoria = dashboard.Categorias.FirstOrDefault(c => c.Id == request.CategoriaId);

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

            var voto = factory.CrearVoto(
                proyectoId: request.ProyectoId,
                valorBase: request.Valor,
                idCategoria: request.CategoriaId,
                idCriterio: request.IdCriterio ?? 1,
                comentario: request.Comentario,
                urlAudio: null,
                idUsuario: idUsuario,
                ipDispositivo: "web"
            );

            var votoCreado = await _votoRepository.AgregarVotoAsync(voto);

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


            if (!string.IsNullOrWhiteSpace(request.Comentario))
            {
                await _comentarioService.CreateComentarioAsync(
                    votoCreado.Id,
                    request.Comentario
                );
            }

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
            var claveSesion = SessionHelper.ObtenerClaveSesion(idUsuario, sessionId);

            var dashboard = await ObtenerDashboardAsync(request.EventoId, idUsuario, sessionId);
            var categoria = dashboard.Categorias.FirstOrDefault(c => c.Id == request.CategoriaId);

            if (categoria == null || categoria.VotosRestantes <= 0 || categoria.Estado != "activa")
            {
                throw new Exception("No se puede votar: la categoría no está activa o no quedan votos.");
            }

            var factory = await ObtenerFactoryPorRolAsync(request.EventoId, idUsuario);

            int? primerVotoId = null;
            string? comentarioPrimerVoto = null;

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
                    if (!string.IsNullOrWhiteSpace(evaluacion.Comentario))
                    {
                        await _comentarioService.CreateComentarioAsync(
                            votoCreado.Id,
                            evaluacion.Comentario
                        );
                    }
                }
            }

            // El comentario global y el del primer criterio se consolidan en un único comentario_cualitativo.
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

            // El batch (múltiples criterios) cuenta como un único voto en la categoría.
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

            return votos.Select(v => new VotoResponseDto
            {
                Id = v.Id,
                ProyectoId = v.IdProyecto,
                CategoriaId = v.IdCategoria,
                Comentario = v.Comentario,
                Fecha = v.FechaVoto,
            });
        }

        public async Task<List<TipoComentaristaDto>> ObtenerResumenComentariosAsync(int proyectoId, int categoriaId)
        {
            var todosVotos = await _votoRepository.ObtenerVotosPorProyectoYCategoriaAsync(proyectoId, categoriaId);

            var resultado = new List<TipoComentaristaDto>();

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
                        Nombre = "Jurado",
                        Iniciales = "J",
                        TotalComentarios = g.Count(v => !string.IsNullOrWhiteSpace(v.Comentario))
                    });
                }
                grupoJurado.TotalComentarios = grupoJurado.Usuarios.Sum(u => u.TotalComentarios);
                if (grupoJurado.TotalComentarios > 0) resultado.Add(grupoJurado);
            }

            var votosPublico = todosVotos.Where(v => !v.IdEvaluador.HasValue).ToList();
            if (votosPublico.Any())
            {
                var grupoPublico = new TipoComentaristaDto { Tipo = "Público" };
                var porHash = votosPublico.GroupBy(v => v.IpDispositivo ?? "anon");

                foreach (var g in porHash)
                {
                    grupoPublico.Usuarios.Add(new UsuarioComentariosDto
                    {
                        Referencia = $"P-{g.Key.GetHashCode():X}",
                        Nombre = "Público",
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