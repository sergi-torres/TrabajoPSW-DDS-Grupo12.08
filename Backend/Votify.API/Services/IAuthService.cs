using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IAuthService
    {
        Task<string?> RegisterAsync(RegisterRequestDto request);
        Task<string?> LoginAsync(LoginRequestDto request);
    }
}
