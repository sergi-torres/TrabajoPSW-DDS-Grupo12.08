using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Repositories
{
    public interface ICategoriaRepository
    {
        Task<List<Categoria>> ObtenerTodasAsync();
        Task<List<CategoriaResponseActualizadoDto>> ObtenerPorEventoIdAsync(int eventoId);
        Task<Categoria> CrearAsync(Categoria categoria);

        Task<Categoria> ObtenerPorIdAsync(int id);

        Task<bool> ActualizarAsync(Categoria categoria);

        Task<List<ConfigTiemposCategoriasDto>> ObtenerPorEventoIdConFechasAsync(int eventoId);

        Task<List<CategoriaResponseActualizadoDto>> ObtenerTodosCamposAsync(int eventoId);
    }
}
