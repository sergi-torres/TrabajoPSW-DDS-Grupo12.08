using Votify.API.Models.Domain;

namespace Votify.API.Repositories;

public interface IComentarioCualitativoRepository
{
    Task<List<ComentarioCualitativo>> GetComentariosPorVotacion(long idVotacion);

    Task<ComentarioCualitativo?> CreateComentarioAsync(ComentarioCualitativo comentario);
}

