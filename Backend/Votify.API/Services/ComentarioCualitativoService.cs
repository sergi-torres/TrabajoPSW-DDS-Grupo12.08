using Votify.API.Models.Domain;

namespace Votify.API.Services;

public class ComentarioCualitativoService : IComentarioCualitativoService
{
    private readonly Repositories.IComentarioCualitativoRepository _comentariosRepo;

    public ComentarioCualitativoService(Repositories.IComentarioCualitativoRepository comentariosRepo)
    {
        _comentariosRepo = comentariosRepo;
    }

    public async Task<List<ComentarioCualitativo>> GetComentariosPorVotacion(long idVotacion)
    {
        return await _comentariosRepo.GetComentariosPorVotacion(idVotacion);
    }

    public async Task<ComentarioCualitativo?> CreateComentarioAsync(
        long idVotacion,
        string comentarioTexto)
    {

        var comentario = new ComentarioCualitativo
        {
            IdVotacion = idVotacion,
            Comentario = comentarioTexto,
            Fecha = DateTime.UtcNow
        };

        return await _comentariosRepo.CreateComentarioAsync(comentario);
    }

}


