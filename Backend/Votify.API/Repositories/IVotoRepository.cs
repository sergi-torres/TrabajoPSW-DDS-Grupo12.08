using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IVotoRepository
    {
        Task<Voto> AgregarVotoAsync(Voto voto);
        Task<VotoPublico> AgregarVotoAsync(VotoPublico voto);
        Task<List<VotoPublico>> ObtenerPorProyectoIdAsync(int proyectoId);

    }
}
