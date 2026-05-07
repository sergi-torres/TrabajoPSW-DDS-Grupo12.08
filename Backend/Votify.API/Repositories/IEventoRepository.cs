using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Repositories
{
    public interface IEventoRepository
    {
        Task<EventoLite?> GetByIdAsync(int id);
        Task<EventoLite?> GetByCodigoAsync(int codEvento);
        Task<bool> UpdateBasicAsync(int id, UpdateEventDto dto);
    }
}
