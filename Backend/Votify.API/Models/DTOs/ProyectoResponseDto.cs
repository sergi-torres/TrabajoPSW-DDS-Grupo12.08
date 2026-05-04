namespace Votify.API.Models.DTOs
{

    public class ProyectoResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? UrlMultimedia { get; set; }
        public int? IdEvento { get; set; }
        public int IdParticipante { get; set; }
        public int? IdCategoria { get; set; }
        public string Estado { get; set; } = "disponible";
    }

}