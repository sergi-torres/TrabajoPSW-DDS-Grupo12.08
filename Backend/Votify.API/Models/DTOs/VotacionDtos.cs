using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    // Lo que enviamos al Front para pintar el Dashboard
    public class DashboardResponseDto
    {
        public int VotosGlobalesRealizados { get; set; }
        public int VotosGlobalesMaximos { get; set; }
        public int ProyectosActivos { get; set; }
        public string TiempoRestante { get; set; } = "00:00";
        public List<CategoriaResumenDto> Categorias { get; set; } = new();
    }

    public class CategoriaResumenDto
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public int VotosRestantes { get; set; }
        public string Estado { get; set; } = "pendiente"; // "pendiente" o "completado"
        public List<ProyectosResponseDto> Proyectos { get; set; } = new();
    }

    // Lo que recibimos cuando el usuario vota
    public class VotoRequestDto
    {
        [Required]
        public int CategoriaId { get; set; }
        
        [Required]
        public int ProyectoId { get; set; }

        [MaxLength(200)]
        public string? Comentario { get; set; }
    }

    public class ProyectosResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Estado { get; set; } = "disponible"; // "disponible" o "votado"
    }
}