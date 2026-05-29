using Votify.API.Models.Domain;

namespace Votify.API.Repositories;

public class ComentarioCualitativoRepository : IComentarioCualitativoRepository
{
    private readonly Supabase.Client _supabase;

    public ComentarioCualitativoRepository(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<List<ComentarioCualitativo>> GetComentariosPorVotacion(long idVotacion)
    {
        var response = await _supabase
            .From<ComentarioCualitativo>()
            .Where(x => x.IdVotacion == idVotacion)
            .Get();

        return response.Models;
    }


    public async Task<ComentarioCualitativo?> CreateComentarioAsync(ComentarioCualitativo comentario)
    {
        var response = await _supabase
            .From<ComentarioCualitativo>()
            .Insert(comentario);

        if (!response.Models.Any())
            throw new Exception("No se pudo insertar el comentario");

        return response.Models.FirstOrDefault();
    }
}

