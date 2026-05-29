using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IEventoUsuarioRepository
    {
        Task<EventoUsuario?> GetAsync(int idEvento, int idUsuario);
        Task<EventoUsuario> CreateAsync(EventoUsuario eventoUsuario);
        Task<bool> DeleteAsync(int idEvento, int idUsuario);
        Task<List<EventoUsuario>> GetByUsuarioAsync(int idUsuario);
        Task<List<EventoUsuario>> GetJuradosByEventoAsync(int idEvento);
        Task<List<EventoUsuario>> GetByEventoAsync(int idEvento);
    }
}
