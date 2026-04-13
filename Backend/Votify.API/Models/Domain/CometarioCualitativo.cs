using Supabase.Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    [Table("comentario_cualitativo")]
    public class ComentarioCualitativo : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        [Column("idVotacion")]
        public long? IdVotacion { get; set; }

        [Column("comentario")]
        public string? Comentario { get; set; }
    }
}
