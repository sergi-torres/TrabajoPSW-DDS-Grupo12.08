using Votify.API.Models.Domain;

namespace Votify.API.Models.Domain.Factories
{
    public interface IVotoFactory
    {
        // El Factory Method: devuelve el tipo base 'Voto'
        Voto CrearVoto(int proyectoId, float valorBase, int idCategoria, int idCriterio, string? comentario, string? urlAudio, int? idUsuario, string ipDispositivo);
    }
}