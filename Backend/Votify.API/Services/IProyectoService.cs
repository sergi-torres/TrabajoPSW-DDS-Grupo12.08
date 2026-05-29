using Votify.API.Models.Domain;

namespace Votify.API.Services
{
    public interface IProyectoService
    {
        Task<List<Proyecto>> ObtenerTodosAsync();
        Task<Proyecto?> ObtenerPorIdAsync(int id);
        Task<List<Proyecto>> ObtenerPorCategoriaIdAsync(int categoriaId);
        Task<List<Proyecto>> ObtenerPorIdParticipanteAsync(int id);
        Task<List<Proyecto>> ObtenerPorEventoIdAsync(int eventoId);
        Task<Proyecto?> CrearAsync(Proyecto proyecto);
        Task<bool> EliminarAsync(int id);
        Task<bool> ActualizarAsync(Proyecto proyecto);
    }
}
