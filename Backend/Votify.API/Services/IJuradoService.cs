using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IJuradoService
    {
        Task<bool> AsignarJuradoPorEmailAsync(int idEvento, string email, string? customMessage = null);
        Task<bool> ReenviarInvitacionAsync(int idEvento, string email);
        Task<List<UsuarioDto>> GetJuradosEventoAsync(int idEvento);
        Task<bool> EliminarJuradoAsync(int idEvento, int idUsuario);
    }
}