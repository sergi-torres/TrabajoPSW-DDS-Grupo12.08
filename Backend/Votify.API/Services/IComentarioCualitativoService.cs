using Votify.API.Models.Domain;

namespace Votify.API.Services
{
    public interface IComentarioCualitativoService
    {
        Task<List<ComentarioCualitativo>> GetComentariosPorVotacion(long idVotacion);

        Task<ComentarioCualitativo?> CreateComentarioAsync(ComentarioCualitativo comentario);

        Task<ComentarioCualitativo?> CreateComentarioAsync(
            long idVotacion,
            string comentarioTexto);
    }
}
