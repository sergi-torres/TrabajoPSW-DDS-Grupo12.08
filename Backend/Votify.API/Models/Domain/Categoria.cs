using Supabase.Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    [Table("categoria")]
    public class Categoria : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("idevento")]
        public int IdEvento { get; set; }

        [Column("fechaini")]
        public DateTime? FechaIni { get; set; }

        [Column("fechafin")]
        public DateTime? FechaFin { get; set; }

        [Column("estado")]
        public string Estado { get; set; } = "Pendiente"; // Pendiente,Activa, Finalizada 
    }
}