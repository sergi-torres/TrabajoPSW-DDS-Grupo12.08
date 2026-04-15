using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Repositories
{
    public interface ICategoriaRepository
    {
        Task<List<Categoria>> ObtenerTodasAsync();
        Task<List<CategoriaResponseDto>> ObtenerPorEventoIdAsync(int eventoId);
        Task<Categoria> CrearAsync(Categoria categoria);
    }
}
