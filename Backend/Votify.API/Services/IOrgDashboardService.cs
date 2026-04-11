using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IOrgDashboardService
    {
        Task<OrgDashboardResponseDto> GetDashboardAsync(int eventoId);
        Task ExtenderTiempoAsync(int eventoId, int minutosExtra);
        Task CerrarVotacionAsync(int eventoId);
    }
}
