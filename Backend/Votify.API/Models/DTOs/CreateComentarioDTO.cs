namespace Votify.API.Models.DTOs
{
    public class CreateComentarioDTO
    {
        public long IdVotacion { get; set; }
        public string Comentario { get; set; } = string.Empty;
    }
}
