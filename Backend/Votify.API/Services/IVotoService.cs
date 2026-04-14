using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IVotoService
    {
        Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId, int? idUsuario = null, string? sessionId = null);
        Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request, int? idUsuario = null, string? sessionId = null);
    }
}