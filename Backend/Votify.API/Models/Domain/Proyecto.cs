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
        public string? UrlMultimedia { get; set; }

        [Column("idevento")]
        public int? IdEvento { get; set; }

        [Column("idparticipante")]
        public int IdParticipante { get; set; }

        [Column("idcategoria")]
        public int? IdCategoria { get; set; } = null;

        [Column("estado")]
        public string Estado { get; set; } = "disponible";

        [Column("idMiembros")]
        public List<int>? IdMiembros { get; set; }
    }
}
