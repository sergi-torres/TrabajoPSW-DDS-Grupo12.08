using System;

namespace Votify.API.Models.Domain
{
        public class Usuario
        {
            public int Id { get; set; }
            public string NombreCompleto { get; set; } = string.Empty;
            public string NombreUsuario { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
            public string Rol { get; set; } = string.Empty;
    }
}