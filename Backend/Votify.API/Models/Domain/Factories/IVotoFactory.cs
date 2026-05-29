using Votify.API.Models.Domain;

namespace Votify.API.Models.Domain.Factories
{
    public interface IVotoFactory
    {
        Voto CrearVoto(int proyectoId, float valorBase, int idCategoria, int idCriterio, string? comentario, string? urlAudio, int? idUsuario, string ipDispositivo);
    }
}