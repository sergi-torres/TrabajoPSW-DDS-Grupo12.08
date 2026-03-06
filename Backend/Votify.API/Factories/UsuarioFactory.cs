using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using System;

namespace Votify.API.Factories
{
    public class UsuarioFactory : IUsuarioFactory
    {
        public Usuario CrearUsuario(RegistroRequestDto request)
        {
            switch (request.Rol)
            {
                case "Organizador":
                    return new Organizador
                    {
                        Email = request.Email,
                        NombreCompleto = request.NombreCompleto,
                        NombreUsuario = request.Email,
                        Password = request.Password,
                        FechaRegistro = DateTime.UtcNow
                    };

                case "Jurado":
                    return new Jurado
                    {
                        Email = request.Email,
                        NombreCompleto = request.NombreCompleto,
                        NombreUsuario = request.Email,
                        Password = request.Password,
                        FechaRegistro = DateTime.UtcNow
                    };

                case "Participante":
                    return new Participante
                    {
                        Email = request.Email,
                        NombreCompleto = request.NombreCompleto,
                        NombreUsuario = request.Email,
                        Password = request.Password,
                        FechaRegistro = DateTime.UtcNow
                    };

                default:
                    throw new ArgumentException($"Tipo de usuario '{request.Rol}' no válido para registro.");
            }
        }
    }
}
