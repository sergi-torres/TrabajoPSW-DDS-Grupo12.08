using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IVotoRepository
    {
        Task<Voto> AgregarVotoAsync(Voto voto);

        Task<List<VotoPublico>> ObtenerPorProyectoIdAsync(int proyectoId);

    }
}
