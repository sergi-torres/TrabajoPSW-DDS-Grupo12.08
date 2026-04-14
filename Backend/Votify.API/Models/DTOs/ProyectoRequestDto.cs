namespace Votify.API.Models.DTOs
{
    public class ProyectoRequestDto
    {
        public string Nombre { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        public string? UrlMultimedia { get; set; }

        public int IdEvento { get; set; }

        public int IdParticipante { get; set; }

        public int IdCategoria { get; set; }
    }
}
