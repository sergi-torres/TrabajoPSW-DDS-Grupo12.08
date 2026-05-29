using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IBaremoRepository
    {
        Task<List<Baremo>> GetByEventoIdAsync(int eventoId);
        Task<List<Criterio>> GetCriteriosByBaremoIdAsync(int baremoId);
        Task<Baremo> InsertAsync(Baremo baremo);
        Task<bool> DeleteAsync(int baremoId);
        Task<bool> DeleteCriteriosByBaremoIdAsync(int baremoId);
        Task<bool> DeleteCriterioAsync(int criterioId);
        Task<Criterio> InsertCriterioAsync(Criterio criterio);
        Task<bool> UpdateCriterioAsync(Criterio criterio);
        Task<Criterio?> GetCriterioByIdAsync(int id);
    }
}
