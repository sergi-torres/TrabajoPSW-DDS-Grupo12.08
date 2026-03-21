using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    public class CreateCriterioDto
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string TipoCriterio { get; set; } = string.Empty;

        [Required]
        [Range(0, 100)]
        public double Peso { get; set; }
    }
}