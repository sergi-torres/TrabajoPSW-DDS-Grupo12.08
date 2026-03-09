using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Factories
{
    public interface IUsuarioFactory
    {
        // En base al DTO recibido desde la web, la fábrica decide qué subclase instanciar.
        Usuario CrearUsuario(RegistroRequestDto request);
    }
}
