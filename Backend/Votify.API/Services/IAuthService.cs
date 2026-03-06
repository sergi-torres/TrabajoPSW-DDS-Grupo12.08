using Votify.API.Models.DTOs;
using System.Threading.Tasks;

namespace Votify.API.Services
{
    // El Contrato de qué puede hacer la Autenticación
    public interface IAuthService
    {
        Task<string?> RegistrarAsync(RegistroRequestDto request);
        Task<string?> LoginAsync(LoginRequestDto request);
    }
}
