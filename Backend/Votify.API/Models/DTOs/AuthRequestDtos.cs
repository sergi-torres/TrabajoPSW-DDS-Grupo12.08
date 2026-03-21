using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    // DTO para registrar un nuevo usuario
    public class RegistroRequestDto
    {
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
        [MinLength(4)]
        public string NombreCompleto { get; set; } = string.Empty;

        [MaxLength(60)]
        [MinLength(4)]
        public string? NombreUsuario { get; set; } = string.Empty;
    }

    // DTO para hacer Login
    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(60)]
        [MinLength(6)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(60)]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
}
