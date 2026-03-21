using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace Votify.API.Models.DTOs
{
    public class CreateEventDto
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        [MinLength(0)]
        [MaxLength(200)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaFin { get; set; }

        [Required]
        public string TipoEvento { get; set; } = string.Empty;

        [Required]
        public int IdOrganizador { get; set; }

        [Required]
        public int CodEvento { get; set; }

        [Required]
        public List<CreateBaremoDto> Baremos { get; set; } = new List<CreateBaremoDto>();

        [Required]
        public List<CreateCategoriaDto> Categorias { get; set; } = new List<CreateCategoriaDto>();

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // 1. La lógica vital: Fecha Fin debe ser posterior a Fecha Inicio
            if (FechaFin <= FechaInicio)
            {
                yield return new ValidationResult(
                    "Error lógico: La fecha de finalización debe ser posterior a la fecha de inicio.",
                new[] { nameof(FechaFin) } // Esto le dice al Frontend exactamente qué campo falló
            );
            }

            // 2. Lógica de negocio: Un evento no debería crearse en el pasado
            // (Usamos .Date para comparar solo los días, ignorando las horas)
            if (FechaInicio.Date < DateTime.Now.Date)
            {
                yield return new ValidationResult(
                    "No puedes programar un evento para una fecha que ya ha pasado.",
                    new[] { nameof(FechaInicio) }
                );
            }
        }
    }
}