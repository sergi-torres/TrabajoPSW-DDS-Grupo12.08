using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    public class CreateBaremoDto
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public List<CreateCriterioDto> Criterios { get; set; } = new List<CreateCriterioDto>();
    }
}