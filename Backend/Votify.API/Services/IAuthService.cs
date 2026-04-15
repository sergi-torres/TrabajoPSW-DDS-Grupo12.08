using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IAuthService
    {
        Task<(string? token, int userId, string? nombreUsuario)> RegistrarAsync(RegistroRequestDto request);
        Task<(string? token, int userId, string? nombreUsuario)> LoginAsync(LoginRequestDto request);
    }
}
