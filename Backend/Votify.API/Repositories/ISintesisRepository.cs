using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface ISintesisRepository
    {
        Task<SintesisComentarios?> ObtenerAsync(long idProyecto, long idCategoria, string tipo);
        Task<List<SintesisComentarios>> ObtenerPorProyectoCategoriaAsync(long idProyecto, long idCategoria);
        Task<SintesisComentarios> UpsertAsync(SintesisComentarios sintesis);
    }
}
