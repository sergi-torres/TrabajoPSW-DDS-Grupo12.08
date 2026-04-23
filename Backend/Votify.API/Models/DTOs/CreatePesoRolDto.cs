using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    public class CreatePesoRolDto
    {
        [Required]
        public string RolVotante { get; set; } = string.Empty;

        [Required]
        [Range(0, 100, ErrorMessage = "El peso del voto debe ser un porcentaje entre 1 y 100.")]
        public float Peso { get; set; }
    }
}