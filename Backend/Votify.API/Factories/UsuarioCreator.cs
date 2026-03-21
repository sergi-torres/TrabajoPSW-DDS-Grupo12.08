using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Factories
{
    // Creator abstracto (GoF Factory Method)
    // Define el contrato del factory method, no sabe qué objeto concreto se crea.
    public abstract class UsuarioCreator
    {
        public abstract Usuario Create(RegistroRequestDto request);
    }
}
