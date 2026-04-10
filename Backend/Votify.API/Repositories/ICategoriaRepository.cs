using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface ICategoriaRepository
    {
        Task<List<Categoria>> ObtenerTodasAsync();
        Task<List<Categoria>> ObtenerPorEventoIdAsync(int eventoId);
    }
}
