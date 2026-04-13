namespace Votify.API.Models.DTOs
{
    public class ComentarioRequestDTO
    {
        public long Id { get; set; }
        public DateTime Fecha { get; set; }
        public long? IdVotacion { get; set; }
        public string? Comentario { get; set; }
    }
}
