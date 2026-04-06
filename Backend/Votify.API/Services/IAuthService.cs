using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IAuthService
    {
        Task<(string? token, int userId)> RegistrarAsync(RegistroRequestDto request);
        Task<(string? token, int userId)> LoginAsync(LoginRequestDto request);
    }
}
