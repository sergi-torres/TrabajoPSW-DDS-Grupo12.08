using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using System;

namespace Votify.API.Factories
{
    // ConcreteCreator: solo sabe crear Organizadores
    public class OrganizadorCreator : UsuarioCreator
    {
        public override Usuario Create(RegistroRequestDto request)
        {
            return new Organizador
            {
                Email = request.Email,
                NombreCompleto = request.NombreCompleto,
                NombreUsuario = request.NombreUsuario ?? request.Email,
                Password = request.Password,
                FechaRegistro = DateTime.UtcNow
            };
        }
    }
}
