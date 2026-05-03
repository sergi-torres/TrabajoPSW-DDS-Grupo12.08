using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public interface IVotoRepository
    {
        Task<Voto> AgregarVotoAsync(Voto voto);
        Task<string?> ObtenerRolUsuarioEnEventoAsync(int idUsuario, int idEvento);
        Task<List<VotoPublico>> ObtenerPorProyectoIdAsync(int proyectoId);
        Task<List<VotoJurado>> ObtenerVotosDeUsuarioAsync(int idUsuario);
        Task<bool> ExisteVotoPublicoAsync(int idEvento, int idCategoria, string hash);
        Task<List<int>> ObtenerProyectosVotadosPublicoAsync(int idEvento, int idCategoria, string hash);
        Task<List<RegistroVotoPublico>> ObtenerTodosVotosPublicosPorHashAsync(int idEvento, string hash);
        Task RegistrarVotoPublicoAsync(RegistroVotoPublico registro);

    }
}
