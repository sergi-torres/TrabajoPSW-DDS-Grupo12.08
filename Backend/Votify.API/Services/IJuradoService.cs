using Votify.API.Models.Domain;

namespace Votify.API.Services
{
    public interface IJuradoService
    {
        Task<bool> AsignarJuradoPorEmailAsync(int idEvento, string email);
        Task<List<Usuario>> GetJuradosEventoAsync(int idEvento);
        Task<bool> EliminarJuradoAsync(int idEvento, int idUsuario);
    }
}
