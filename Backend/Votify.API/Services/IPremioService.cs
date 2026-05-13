using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IPremioService
    {
        Task<List<PremioResponseDto>> ObtenerPremiosDelEventoAsync(int eventoId);
        Task<bool> CrearPremioAsync(CrearPremioRequestDto premioDto);
        Task<bool> EliminarPremioAsync(int premioId);
        Task<bool> ActualizarPremioAsync(int premioId, ActualizarPremioRequestDto premioDto);
    }
}