using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    /// <summary>
    /// DTO para actualizar un evento existente desde el formulario de Ajustes.
    /// </summary>
    public class UpdateEventDto
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaFin { get; set; }

        public string TipoEvento { get; set; } = string.Empty;

        public bool ComentariosObligatorios { get; set; } = false;

        // Baremos con sus criterios (se reescriben al guardar)
        public List<CreateBaremoDto> Baremos { get; set; } = new List<CreateBaremoDto>();

        // Categorías con pesos de votación
        public List<CreateCategoriaDto> Categorias { get; set; } = new List<CreateCategoriaDto>();

        // Configuración de votación
        public bool VotoPublicoHabilitado { get; set; } = true;
        public int PesoJurado { get; set; } = 70;
    }
}
