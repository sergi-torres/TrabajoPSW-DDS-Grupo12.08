using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IPremioRepository
    {
        Task<List<Premio>> ObtenerPremiosDelEventoAsync(int eventoId);
        Task<Premio> ObtenerPorIdAsync(int id);
        Task<bool> CrearPremioAsync(Premio premio);
        Task EliminarPremioAsync(int premioId);
        Task<bool> ActualizarPremioAsync(Premio premio);
    }
}