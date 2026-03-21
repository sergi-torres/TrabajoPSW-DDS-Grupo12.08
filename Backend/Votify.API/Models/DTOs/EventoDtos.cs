namespace Votify.API.Models.DTOs
{
    // DTO de respuesta al frontend
    public class EventoResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public DateTime FechaIni { get; set; }
        public DateTime FechaFin { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string? Rol { get; set; }
    }
}
