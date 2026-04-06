using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
    [Table("proyecto")]
    public class Proyecto : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        public string Descripcion { get; set; } = string.Empty;

        [Column("urlmultimedia")]
        public string UrlMultimedia { get; set; } = string.Empty;

        [Column("idevento")]
        public string IdEvento { get; set; } = string.Empty;

        [Column("idparticipante")]
        public int IdParticipante { get; set; } = 0;

        public string Estado { get; set; } = "disponible"; // disponible, votado
    }
}
