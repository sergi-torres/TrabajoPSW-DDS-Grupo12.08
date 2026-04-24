using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IInvitacionPendienteRepository
    {
        Task<bool> CreateAsync(InvitacionPendiente invitacion);
        Task<InvitacionPendiente?> GetByTokenAsync(string token);
        Task<List<InvitacionPendiente>> GetByEventAsync(int idEvento);
        Task<bool> DeleteAsync(int id);
        Task<bool> DeleteByEmailAndEventAsync(string email, int idEvento);
    }
}