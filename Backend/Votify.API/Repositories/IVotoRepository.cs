using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IVotoRepository
    {
        Task<Voto> AgregarVotoAsync(Voto voto);
        Task<string?> ObtenerRolUsuarioEnEventoAsync(int idUsuario, int idEvento);
        Task<List<VotoPublico>> ObtenerPorProyectoIdAsync(int proyectoId);

    }
}
