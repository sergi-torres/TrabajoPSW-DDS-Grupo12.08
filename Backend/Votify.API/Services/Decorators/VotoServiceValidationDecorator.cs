using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Services;
using Votify.API.Models.Domain.Strategies;
using Votify.API.Repositories;

namespace Votify.API.Services.Decorators
{
    public class VotoServiceValidationDecorator : IVotoService
    {
        private readonly IVotoService _innerService;
        private readonly IEventoRepository _eventoRepository;
        private readonly IBaremoRepository _baremoRepository;

        public VotoServiceValidationDecorator(
            IVotoService innerService,
            IEventoRepository eventoRepository,
            IBaremoRepository baremoRepository)
        {
            _innerService = innerService;
            _eventoRepository = eventoRepository;
            _baremoRepository = baremoRepository;
        }

        public async Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId, int? idUsuario = null, string? sessionId = null, string? identificadorHash = null)
        {
            var dashboard = await _innerService.ObtenerDashboardAsync(eventoId, idUsuario, sessionId, identificadorHash);

            var evento = await _eventoRepository.GetByIdAsync(eventoId);
            if (evento != null && dashboard is DashboardResponseDto dashboardDto)
            {
                dashboardDto.ComentariosObligatorios = evento.ComentariosObligatorios;
            }

            return dashboard;
        }

        public async Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request, int? idUsuario = null, string? sessionId = null)
        {
            var evento = await _eventoRepository.GetByIdAsync(request.EventoId)
                ?? throw new Exception("Evento no encontrado");

            IComentarioValidationStrategy strategy = evento.ComentariosObligatorios
                ? new ComentarioObligatorioStrategy()
                : new ComentarioOpcionalStrategy();

            strategy.Validar(request.Comentario);

            return await _innerService.ProcesarVotoAsync(request, idUsuario, sessionId);
        }

        public async Task<DashboardResponseDto> ProcesarVotoBatchAsync(VotoBatchRequestDto request)
        {
            var evento = await _eventoRepository.GetByIdAsync(request.EventoId)
                ?? throw new Exception("Evento no encontrado");

            foreach (var evaluacion in request.Evaluaciones)
            {
                var criterioBd = await _baremoRepository.GetCriterioByIdAsync(evaluacion.CriterioId);

                // ComentarioObligatorio es por criterio; independiente del flag global ComentariosObligatorios del evento.
                bool requiereComentario = criterioBd?.ComentarioObligatorio ?? false;

                IComentarioValidationStrategy strategy = requiereComentario
                    ? new ComentarioObligatorioStrategy()
                    : new ComentarioOpcionalStrategy();

                strategy.Validar(evaluacion.Comentario);
            }

            if (evento.ComentariosObligatorios)
            {
                IComentarioValidationStrategy globalStrategy = new ComentarioObligatorioStrategy();
                globalStrategy.Validar(request.ComentarioGlobal);
            }

            return await _innerService.ProcesarVotoBatchAsync(request);
        }

        public Task<IEnumerable<VotoResponseDto>> ObtenerVotosPorProyectoAsync(int proyectoId)
        {
            return _innerService.ObtenerVotosPorProyectoAsync(proyectoId);
        }

        public Task<List<TipoComentaristaDto>> ObtenerResumenComentariosAsync(int proyectoId, int categoriaId)
        {
            return _innerService.ObtenerResumenComentariosAsync(proyectoId, categoriaId);
        }

        public Task<List<ComentarioDetalleDto>> ObtenerDetalleComentariosUsuarioAsync(int proyectoId, int categoriaId, string usuarioRef)
        {
            return _innerService.ObtenerDetalleComentariosUsuarioAsync(proyectoId, categoriaId, usuarioRef);
        }
    }
}
