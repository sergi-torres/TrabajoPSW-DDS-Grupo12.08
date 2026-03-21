using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    public class CreateCategoriaDto
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public List<CreatePesoRolDto> Pesos { get; set; } = new List<CreatePesoRolDto>();
    }
}