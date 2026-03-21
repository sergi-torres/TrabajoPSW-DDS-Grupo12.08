using Supabase.Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    [Table("evento")]
    public class Evento : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        public string? Descripcion { get; set; }

        [Column("fechaini")]
        public DateTime FechaIni { get; set; }

        [Column("fechafin")]
        public DateTime FechaFin { get; set; }

        [Column("estado")]
        public string Estado { get; set; } = "Configuracion";

        [Column("idorganizador")]
        public int IdOrganizador { get; set; }

        [Column("tipo_evento")]
        public string TipoEvento { get; set; } = "Competicion";

        [Column("cod_evento")]
        public int CodEvento { get; set; }
    }
}
