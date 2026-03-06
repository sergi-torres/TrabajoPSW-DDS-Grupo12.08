using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    // DTO para registrar un Organizador o Jurado con contraseña en Supabase Auth
    public class RegistroRequestDto
    {
        // TODO: Añadir DataAnnotations como [Required], [EmailAddress], etc.
        [Required]
        [EmailAddress]
        [MaxLength(60)]
        [MinLength(6)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(60)]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(60)]
        public string NombreCompleto { get; set; } = string.Empty;

        [MaxLength(60)]
        [MinLength(6)]
        public string? NombreUsuario { get; set; } = string.Empty;

        [Required]
        public string Rol { get; set; } = string.Empty;
    }

    // DTO para hacer Login tradicional (Organizador / Jurado)
    public class LoginRequestDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
