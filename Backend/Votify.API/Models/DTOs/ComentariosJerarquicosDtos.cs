namespace Votify.API.Models.DTOs
{
    public class TipoComentaristaDto
    {
        public string Tipo { get; set; } = string.Empty; // "Jurado" o "Público"
        public int TotalComentarios { get; set; }
        public List<UsuarioComentariosDto> Usuarios { get; set; } = new();
    }

    public class UsuarioComentariosDto
    {
        public string Referencia { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Iniciales { get; set; } = string.Empty;
        public int TotalComentarios { get; set; }
    }

    public class ComentarioDetalleDto
    {
        public int Id { get; set; }
        public string Comentario { get; set; } = string.Empty;
        public string Criterio { get; set; } = string.Empty;
        public string Fecha { get; set; } = string.Empty;
        public int? Likes { get; set; }
    }
}
