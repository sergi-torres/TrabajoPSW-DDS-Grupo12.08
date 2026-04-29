using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Services;
using Votify.API.Strategies;

namespace Votify.API.Decorators
{
    public class VotoServiceValidationDecorator : IVotoService
    {
        private readonly IVotoService _innerService;
        private readonly Supabase.Client _supabase;

        public VotoServiceValidationDecorator(IVotoService innerService, Supabase.Client supabase)
        {
            _innerService = innerService;
            _supabase = supabase;
        }

        public async Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId, int? idUsuario = null, string? sessionId = null)
        {
            // Delegamos la obtención del dashboard al servicio original
            var dashboard = await _innerService.ObtenerDashboardAsync(eventoId, idUsuario, sessionId);
            
            // Aquí enriquecemos el DTO resultante consultando el evento
            var eventoResponse = await _supabase.From<EventoLite>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                .Get();
                
            var evento = eventoResponse.Models.FirstOrDefault();
            if (evento != null && dashboard is DashboardResponseDto dashboardDto)
            {
                dashboardDto.ComentariosObligatorios = evento.ComentariosObligatorios;
            }

            return dashboard;
        }

        public async Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request, int? idUsuario = null, string? sessionId = null)
        {
            // 1. Obtener el evento para saber la configuración
            var eventoResponse = await _supabase.From<EventoLite>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, request.EventoId.ToString())
                .Get();
            var evento = eventoResponse.Models.FirstOrDefault() 
                ?? throw new Exception("Evento no encontrado");

            // 2. Aplicar Patrón Strategy para la validación
            IComentarioValidationStrategy strategy = evento.ComentariosObligatorios 
                ? new ComentarioObligatorioStrategy() 
                : new ComentarioOpcionalStrategy();

            strategy.Validar(request.Comentario);

            // 3. Si no hay excepción, delegamos al servicio original (el inner)
            return await _innerService.ProcesarVotoAsync(request, idUsuario, sessionId);
        }

        public async Task<DashboardResponseDto> ProcesarVotoBatchAsync(VotoBatchRequestDto request)
        {
            // 1. Obtener el evento para saber la configuración global
            var eventoResponse = await _supabase.From<EventoLite>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, request.EventoId.ToString())
                .Get();
            var evento = eventoResponse.Models.FirstOrDefault() 
                ?? throw new Exception("Evento no encontrado");

            // 2. Obtener los criterios de la BD para saber cuáles tienen comentario obligatorio individual
            var criteriosResponse = await _supabase.From<Criterio>()
                .Get();
            var criteriosDb = criteriosResponse.Models;

            // 3. Validar comentarios POR CRITERIO: solo los que tienen comentario_obligatorio = true
            foreach (var evaluacion in request.Evaluaciones)
            {
                var criterioBd = criteriosDb.FirstOrDefault(c => c.Id == evaluacion.CriterioId);
                
                // Solo el flag individual del criterio determina si SU comentario es obligatorio
                bool requiereComentario = criterioBd?.ComentarioObligatorio ?? false;

                IComentarioValidationStrategy strategy = requiereComentario
                    ? new ComentarioObligatorioStrategy()
                    : new ComentarioOpcionalStrategy();

                strategy.Validar(evaluacion.Comentario);
            }

            // 4. Validar COMENTARIO GLOBAL: solo si el evento lo exige a nivel global
            if (evento.ComentariosObligatorios)
            {
                IComentarioValidationStrategy globalStrategy = new ComentarioObligatorioStrategy();
                globalStrategy.Validar(request.ComentarioGlobal);
            }

            // 5. Delegar al servicio original
            return await _innerService.ProcesarVotoBatchAsync(request);
        }

        public Task<IEnumerable<VotoResponseDto>> ObtenerVotosPorProyectoAsync(int proyectoId)
        {
            return _innerService.ObtenerVotosPorProyectoAsync(proyectoId);
        }
    }
}
