using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    public class CreateCriterioDto
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string TipoCriterio { get; set; } = string.Empty;
    }
}