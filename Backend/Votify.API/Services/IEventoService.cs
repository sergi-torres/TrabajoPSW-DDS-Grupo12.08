using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IEventoService
    {
        Task<List<EventoResponseDto>> GetEventosByUsuarioAsync(int userId);
        Task<JoinEventoResponseDto> JoinEventoPorCodigoAsync(int codEvento);

        Task<IEnumerable<ConfigTiemposCategoriasDto>> ListarConfiguracionesTiempoAsync(int eventoId);
        Task<IEnumerable<CategoriaResponseActualizadoDto>> ListarCategoriasControlAsync(int eventoId);

        Task<bool> ActualizarTiemposAsync(ConfigTiemposCategoriasDto request);
        Task<bool> ActualizarEstadoCategoriaAsync(int categoriaId, string nuevoEstado);
        Task<bool> ActualizarLimiteVotosAsync(int eventoId, int? categoriaId, int votosMaximos);
        Task<EventoDetalleDto> GetEventoDetalleAsync(int eventoId);
        Task<EventoDetalleDto> UpdateEventoAsync(int eventoId, UpdateEventDto dto);
        Task<List<EventoResponseDto>> GetEventosDisponiblesAsync(int userId);
        Task<bool> UnirseAEventoAsync(int eventoId, int userId);
        Task<bool> AbandonarEventoAsync(int eventoId, int userId);
    }
}
