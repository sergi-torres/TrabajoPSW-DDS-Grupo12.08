using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IProyectoRepository
    {
        Task<List<Proyecto>> ObtenerTodosAsync();
        Task<List<Proyecto>> ObtenerPorCategoriaIdAsync(int categoriaId);

        Task<List<Proyecto>> ObtenerPorIdParticipanteAsync(int id);
        Task<Proyecto?> ObtenerPorIdAsync(int id);
        Task<List<Proyecto>> ObtenerPorEventoIdAsync(int eventoId);

        Task<Proyecto?> CrearAsync(Proyecto proyecto);

        Task<bool> EliminarAsync(int id);
    }
}