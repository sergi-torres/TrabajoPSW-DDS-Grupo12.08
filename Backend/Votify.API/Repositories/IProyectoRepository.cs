using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IProyectoRepository
    {
        Task<List<Proyecto>> ObtenerTodosAsync();
    }
}