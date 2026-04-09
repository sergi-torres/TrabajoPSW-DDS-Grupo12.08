using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

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

        // Propiedades no mapeadas (se asignan valores en Service)
        public int VotosRestantes { get; set; } = 3;
        public string Estado { get; set; } = "pendiente"; // "pendiente" o "completado"
    }
}