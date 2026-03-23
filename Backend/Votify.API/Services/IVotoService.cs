using Votify.API.Models.Domain;
public interface IVotoService
{
    Task<Voto> ProcesarNuevoVoto(int usuarioId, int proyectoId, int categoriaId, int criterioId, float valorBase, string rol, string? comentario, string? urlAudio);
}