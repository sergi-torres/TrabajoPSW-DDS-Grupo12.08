using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IEventoService
    {
        Task<List<EventoResponseDto>> GetEventosByUsuarioAsync(int userId);
        Task<JoinEventoResponseDto> JoinEventoPorCodigoAsync(int codEvento);
        Task<EventoDetalleDto> GetEventoDetalleAsync(int eventoId);
        Task<EventoDetalleDto> UpdateEventoAsync(int eventoId, UpdateEventDto dto);
    }
}
