using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IUsuarioRepository
    {
        Task<Usuario?> GetByEmailAsync(string email);
        Task<Usuario?> GetByIdAsync(int id);
        Task<Usuario> CreateAsync(Usuario usuario);
    }
}
