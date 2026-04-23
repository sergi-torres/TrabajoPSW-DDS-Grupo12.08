using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IEventoService
    {
        Task<List<EventoResponseDto>> GetEventosByUsuarioAsync(int userId);
        Task<JoinEventoResponseDto> JoinEventoPorCodigoAsync(int codEvento);

        Task<IEnumerable<ConfigTiemposCategoriasDto>> ListarConfiguracionesTiempoAsync(int eventoId);

        Task<bool> ActualizarTiemposAsync(ConfigTiemposCategoriasDto request);
    }
}
