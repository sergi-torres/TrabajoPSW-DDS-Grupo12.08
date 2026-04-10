using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IVotoService
    {
        Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId);
        Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request);
    }
}